"use client"

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import type { TypedVariable } from "@/lib/condition"
import {
  FUNCTION_PACKAGES,
  findFunction,
  functionsByCategory,
  functionsForDataType,
  resolveFunctionPackage,
  type LogicFunction,
} from "@/lib/functions"
import type { DataType } from "@/lib/types"
import { DATA_TYPE_LABEL } from "@/lib/values"
import { cn } from "@/lib/utils"

type SuggestMode =
  | { type: "root"; query: string }
  | { type: "variable-method"; variable: TypedVariable; query: string }
  | { type: "package-method"; packageName: string; category: LogicFunction["categories"][number]; query: string }
  | { type: "packages"; query: string }

type Suggestion = {
  id: string
  kind: "variable" | "package" | "method" | "function"
  title: string
  subtitle: string
  insert: string
  keepOpen?: boolean
  caretInInsert?: number
}

interface SuggestContext {
  tokenStart: number
  tokenEnd: number
  mode: SuggestMode
  inBraces: boolean
}

export interface ExpressionFieldProps {
  value: string
  onChange: (value: string) => void
  variables: TypedVariable[]
  className?: string
  /** template = mensagem com { }; expression = campo só de expressão */
  mode?: "template" | "expression"
  singleLine?: boolean
  placeholder?: string
}

function findOpenBrace(text: string, cursor: number): number {
  for (let i = cursor - 1; i >= 0; i -= 1) {
    if (text[i] === "}") return -1
    if (text[i] === "{") return i
  }
  return -1
}

/** Analisa o trecho antes do cursor (pode estar no meio de args). */
function analyzeFragment(
  fragment: string,
  absoluteOffset: number,
  cursor: number,
  variables: TypedVariable[],
  inBraces: boolean,
): SuggestContext | null {
  const afterCursorRest = "" // token end handled by caller with text after cursor

  const pkgMethod = fragment.match(/(\$[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*)\.([A-Za-zÀ-ÿ0-9_]*)$/)
  if (pkgMethod && pkgMethod.index !== undefined) {
    const packageName = pkgMethod[1]
    const query = pkgMethod[2] ?? ""
    const pkg = resolveFunctionPackage(packageName)
    if (pkg) {
      return {
        tokenStart: absoluteOffset + pkgMethod.index,
        tokenEnd: cursor,
        inBraces,
        mode: { type: "package-method", packageName: pkg.name, category: pkg.category, query },
      }
    }
  }

  const varMethod = fragment.match(/(?:^|[^A-Za-zÀ-ÿ0-9_$])([A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*)\.([A-Za-zÀ-ÿ0-9_]*)$/)
  if (varMethod && varMethod.index !== undefined) {
    const full = varMethod[0]
    const leading = full.match(/^[^A-Za-zÀ-ÿ_$]+/)?.[0].length ?? 0
    const varName = varMethod[1]
    const query = varMethod[2] ?? ""
    const variable = variables.find((item) => item.name === varName)
    if (variable) {
      return {
        tokenStart: absoluteOffset + varMethod.index + leading,
        tokenEnd: cursor,
        inBraces,
        mode: { type: "variable-method", variable, query },
      }
    }
  }

  const pkgOnly = fragment.match(/(\$[A-Za-zÀ-ÿ0-9_]*)$/)
  if (pkgOnly && pkgOnly.index !== undefined) {
    return {
      tokenStart: absoluteOffset + pkgOnly.index,
      tokenEnd: cursor,
      inBraces,
      mode: { type: "packages", query: pkgOnly[1] },
    }
  }

  // Depois de ( ou operadores → sugerir (não em [ nem vírgula de lista)
  // Campo vazio: só com Shift+Espaço (manualOpen)
  if (fragment.length === 0) {
    return null
  }

  if (/(?:^|[\s(+\-*/%&=!<>~])$/.test(fragment)) {
    return {
      tokenStart: cursor,
      tokenEnd: cursor,
      inBraces,
      mode: { type: "root", query: "" },
    }
  }

  const rootToken = fragment.match(/(?:^|[^A-Za-zÀ-ÿ0-9_$])([A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*)$/)
  if (rootToken && rootToken.index !== undefined) {
    const full = rootToken[0]
    const leading = full.length - (rootToken[1]?.length ?? 0)
    return {
      tokenStart: absoluteOffset + rootToken.index + leading,
      tokenEnd: cursor,
      inBraces,
      mode: { type: "root", query: rootToken[1] ?? "" },
    }
  }

  // Ident no início do fragmento
  const startIdent = fragment.match(/^([A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*)$/)
  if (startIdent) {
    return {
      tokenStart: absoluteOffset,
      tokenEnd: cursor,
      inBraces,
      mode: { type: "root", query: startIdent[1] },
    }
  }

  void afterCursorRest
  return null
}

function getSuggestContext(
  text: string,
  cursor: number,
  variables: TypedVariable[],
  fieldMode: "template" | "expression",
): SuggestContext | null {
  if (fieldMode === "template") {
    const braceStart = findOpenBrace(text, cursor)
    if (braceStart < 0) return null
    const fragment = text.slice(braceStart + 1, cursor)
    const after = text.slice(cursor)
    const nameRest = after.match(/^[A-Za-zÀ-ÿ0-9_]*/)?.[0] ?? ""
    const effectiveCursor = cursor + nameRest.length
    // Re-analyze including chars after cursor that continue the token
    const extendedFragment = text.slice(braceStart + 1, effectiveCursor)
    const ctx = analyzeFragment(extendedFragment, braceStart + 1, effectiveCursor, variables, true)
    if (!ctx) return null
    // Don't extend past } 
    const close = text.indexOf("}", cursor)
    return {
      ...ctx,
      tokenEnd: close >= 0 ? Math.min(ctx.tokenEnd, close) : ctx.tokenEnd,
    }
  }

  // expression mode: whole field
  const fragment = text.slice(0, cursor)
  const after = text.slice(cursor)
  const nameRest = after.match(/^[A-Za-zÀ-ÿ0-9_]*/)?.[0] ?? ""
  const effectiveCursor = cursor + nameRest.length
  return analyzeFragment(text.slice(0, effectiveCursor), 0, effectiveCursor, variables, false)
}

function filterByQuery<T>(items: T[], query: string, getText: (item: T) => string): T[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return items
  const starts = items.filter((item) => getText(item).toLowerCase().startsWith(needle))
  if (starts.length > 0) return starts
  return items.filter((item) => getText(item).toLowerCase().includes(needle))
}

function buildMethodInsert(receiver: string, fn: LogicFunction): { insert: string; caretInInsert: number } {
  const extra = Math.max(fn.params.length - 1, 0)
  const args = Array.from({ length: extra }, () => "").join(", ")
  const insert = `${receiver}.${fn.name}(${args})`
  return { insert, caretInInsert: `${receiver}.${fn.name}(`.length }
}

function buildPackageInsert(packageName: string, fn: LogicFunction): { insert: string; caretInInsert: number } {
  const args = Array.from({ length: fn.params.length }, () => "").join(", ")
  const insert = `${packageName}.${fn.name}(${args})`
  return { insert, caretInInsert: `${packageName}.${fn.name}(`.length }
}

function buildSuggestions(mode: SuggestMode, variables: TypedVariable[]): Suggestion[] {
  if (mode.type === "variable-method") {
    return filterByQuery(functionsForDataType(mode.variable.dataType), mode.query, (fn) => fn.name).map((fn) => {
      const built = buildMethodInsert(mode.variable.name, fn)
      return {
        id: `method:${mode.variable.name}.${fn.name}`,
        kind: "method" as const,
        title: fn.name,
        subtitle: fn.label,
        insert: built.insert,
        caretInInsert: built.caretInInsert,
      }
    })
  }

  if (mode.type === "package-method") {
    return filterByQuery(functionsByCategory(mode.category), mode.query, (fn) => fn.name).map((fn) => {
      const built = buildPackageInsert(mode.packageName, fn)
      return {
        id: `fn:${mode.packageName}.${fn.name}`,
        kind: "function" as const,
        title: fn.name,
        subtitle: fn.label,
        insert: built.insert,
        caretInInsert: built.caretInInsert,
      }
    })
  }

  if (mode.type === "packages") {
    const query = mode.query.startsWith("$") ? mode.query : `$${mode.query}`
    return filterByQuery([...FUNCTION_PACKAGES], query, (pkg) => pkg.name).map((pkg) => ({
      id: `pkg:${pkg.name}`,
      kind: "package" as const,
      title: pkg.name,
      subtitle: `${pkg.label} · funções`,
      insert: `${pkg.name}.`,
      keepOpen: true,
    }))
  }

  const query = mode.query.toLowerCase()
  const varItems = filterByQuery(variables, query, (item) => item.name).map((item) => ({
    id: `var:${item.name}`,
    kind: "variable" as const,
    title: item.name,
    subtitle: DATA_TYPE_LABEL[item.dataType as DataType] ?? item.dataType,
    insert: item.name,
    keepOpen: true,
  }))

  const showPackages =
    !query ||
    query.startsWith("$") ||
    "texto".startsWith(query) ||
    "numero".startsWith(query) ||
    "lista".startsWith(query)

  if (!query) {
    return [
      ...varItems,
      ...FUNCTION_PACKAGES.map((pkg) => ({
        id: `pkg:${pkg.name}`,
        kind: "package" as const,
        title: pkg.name,
        subtitle: `${pkg.label} · funções`,
        insert: `${pkg.name}.`,
        keepOpen: true,
      })),
    ]
  }

  const pkgItems = showPackages
    ? filterByQuery(
        [...FUNCTION_PACKAGES],
        query.startsWith("$") ? query : `$${query}`,
        (pkg) => pkg.name,
      ).map((pkg) => ({
        id: `pkg:${pkg.name}`,
        kind: "package" as const,
        title: pkg.name,
        subtitle: `${pkg.label} · funções`,
        insert: `${pkg.name}.`,
        keepOpen: true,
      }))
    : []

  return [...varItems, ...pkgItems]
}

function groupHeading(mode: SuggestMode): string {
  if (mode.type === "variable-method") {
    const kind =
      mode.variable.dataType === "texto"
        ? "texto"
        : mode.variable.dataType === "numero"
          ? "número"
          : mode.variable.dataType === "lista"
            ? "lista"
            : mode.variable.dataType
    return `Funções de ${kind} · ${mode.variable.name}`
  }
  if (mode.type === "package-method") return `Funções · ${mode.packageName}`
  if (mode.type === "packages") return "Pacotes"
  return "Variáveis e pacotes"
}

function isShiftSpace(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
  return event.shiftKey && (event.code === "Space" || event.key === " " || event.key === "Spacebar")
}

function highlightCode(text: string, variableNames: Set<string>): ReactNode[] {
  const nodes: ReactNode[] = []
  let i = 0
  let key = 0

  const push = (chunk: string, className?: string) => {
    if (!chunk) return
    nodes.push(
      className ? (
        <span key={key++} className={className}>
          {chunk}
        </span>
      ) : (
        <span key={key++}>{chunk}</span>
      ),
    )
  }

  while (i < text.length) {
    const char = text[i]

    if (char === "\n") {
      nodes.push(<br key={key++} />)
      i += 1
      continue
    }

    if (char === '"' || char === "'") {
      const quote = char
      let j = i + 1
      while (j < text.length && text[j] !== quote) {
        if (text[j] === "\\" && j + 1 < text.length) j += 2
        else j += 1
      }
      if (j < text.length) j += 1
      push(text.slice(i, j), "text-emerald-700 dark:text-emerald-300")
      i = j
      continue
    }

    if (char === "$" && /[A-Za-zÀ-ÿ_]/.test(text[i + 1] ?? "")) {
      let j = i + 1
      while (j < text.length && /[A-Za-zÀ-ÿ0-9_]/.test(text[j])) j += 1
      const pkg = text.slice(i, j)
      const isPkg = Boolean(resolveFunctionPackage(pkg))
      push(pkg, isPkg ? "text-amber-700 dark:text-amber-300" : undefined)
      i = j
      continue
    }

    if (/[A-Za-zÀ-ÿ_]/.test(char)) {
      let j = i + 1
      while (j < text.length && /[A-Za-zÀ-ÿ0-9_]/.test(text[j])) j += 1
      const ident = text.slice(i, j)
      const nextNonSpace = text.slice(j).match(/^\s*/)?.[0].length ?? 0
      const after = text[j + nextNonSpace]
      if (after === "(" || findFunction(ident)) {
        push(ident, "text-sky-700 dark:text-sky-300")
      } else if (variableNames.has(ident)) {
        push(ident, "text-violet-700 dark:text-violet-300")
      } else if (/^(verdadeiro|falso|true|false|mod)$/i.test(ident)) {
        push(ident, "text-rose-700 dark:text-rose-300")
      } else {
        push(ident)
      }
      i = j
      continue
    }

    if (/[0-9]/.test(char) || (char === "." && /[0-9]/.test(text[i + 1] ?? ""))) {
      let j = i
      while (j < text.length && /[0-9.]/.test(text[j])) j += 1
      push(text.slice(i, j), "text-orange-700 dark:text-orange-300")
      i = j
      continue
    }

    if ("{}()[]".includes(char)) {
      push(char, "text-amber-600 dark:text-amber-400")
      i += 1
      continue
    }

    if (".,+-*/%&=<>!|&".includes(char)) {
      push(char, "text-muted-foreground")
      i += 1
      continue
    }

    push(char)
    i += 1
  }

  // trailing newline placeholder keeps height
  if (text.endsWith("\n")) nodes.push(<span key={key++}>{"\n"}</span>)
  return nodes
}

export function ExpressionField({
  value,
  onChange,
  variables,
  className,
  mode = "template",
  singleLine = false,
  placeholder,
}: ExpressionFieldProps) {
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const skipDismissReset = useRef(false)
  const listId = useId()
  const [cursor, setCursor] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [focused, setFocused] = useState(false)

  const variableNames = useMemo(() => new Set(variables.map((item) => item.name)), [variables])
  const context = useMemo(
    () => getSuggestContext(value, cursor, variables, mode),
    [value, cursor, variables, mode],
  )
  const contextKey = context
    ? `${context.tokenStart}:${context.tokenEnd}:${context.mode.type}:${"query" in context.mode ? context.mode.query : ""}`
    : ""
  const open = focused && !dismissed && (Boolean(context) || manualOpen)

  const suggestions = useMemo(() => {
    if (!open) return []
    if (context) return buildSuggestions(context.mode, variables)
    return buildSuggestions({ type: "root", query: "" }, variables)
  }, [open, context, variables])

  useEffect(() => {
    if (skipDismissReset.current) {
      skipDismissReset.current = false
      return
    }
    setDismissed(false)
    setActiveIndex(0)
  }, [contextKey])

  useEffect(() => {
    if (!open) return
    const list = listRef.current
    if (!list) return
    list.querySelector<HTMLElement>(`[data-autocomplete-index="${activeIndex}"]`)?.scrollIntoView({
      block: "nearest",
    })
  }, [activeIndex, open, suggestions.length])

  const readCursor = () => fieldRef.current?.selectionStart ?? cursor

  const syncCursor = () => {
    const field = fieldRef.current
    if (!field) return
    setCursor(field.selectionStart ?? 0)
  }

  const closeList = () => {
    setDismissed(true)
    setManualOpen(false)
  }

  const applySuggestion = (item: Suggestion) => {
    const pos = readCursor()
    const range = context ?? {
      tokenStart: pos,
      tokenEnd: pos,
      inBraces: mode === "template" && findOpenBrace(value, pos) >= 0,
      mode: { type: "root" as const, query: "" },
    }

    const needsWrap = mode === "template" && !range.inBraces
    const raw = item.insert
    const insertion = needsWrap ? `{${raw}}` : raw
    const next = `${value.slice(0, range.tokenStart)}${insertion}${value.slice(range.tokenEnd)}`

    let caret: number
    if (item.kind === "method" || item.kind === "function") {
      const offset = needsWrap ? 1 : 0
      caret = range.tokenStart + offset + (item.caretInInsert ?? raw.length)
    } else if (item.keepOpen) {
      caret = range.tokenStart + insertion.length - (needsWrap ? 1 : 0)
    } else {
      caret = range.tokenStart + insertion.length
    }

    const willStayOpen =
      Boolean(item.keepOpen) ||
      item.insert.endsWith(".") ||
      item.insert.endsWith("(") ||
      /\($/.test(item.insert.slice(0, item.caretInInsert ?? 0) + "") ||
      (item.kind === "method" || item.kind === "function")

    skipDismissReset.current = true
    onChange(next)
    setCursor(caret)
    if (willStayOpen && (item.keepOpen || item.insert.includes("("))) {
      setDismissed(false)
      setManualOpen(false)
      setActiveIndex(0)
    } else if (item.keepOpen) {
      setDismissed(false)
      setManualOpen(false)
      setActiveIndex(0)
    } else {
      closeList()
    }

    // After function insert with (, keep list open for args
    if ((item.kind === "method" || item.kind === "function") && item.insert.includes("(")) {
      setDismissed(false)
      setManualOpen(true)
    }

    requestAnimationFrame(() => {
      const field = fieldRef.current
      if (!field) return
      field.focus()
      field.setSelectionRange(caret, caret)
      setCursor(caret)
    })
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = event.target.value
    const pos = event.target.selectionStart ?? next.length
    onChange(next)
    setCursor(pos)
    const nextContext = getSuggestContext(next, pos, variables, mode)
    if (nextContext || manualOpen) {
      setDismissed(false)
      setActiveIndex(0)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isShiftSpace(event)) {
      event.preventDefault()
      const pos = readCursor()
      setCursor(pos)
      if (mode === "template" && findOpenBrace(value, pos) < 0) {
        const next = `${value.slice(0, pos)}{${value.slice(pos)}`
        skipDismissReset.current = true
        onChange(next)
        setCursor(pos + 1)
        requestAnimationFrame(() => {
          const field = fieldRef.current
          if (!field) return
          field.focus()
          field.setSelectionRange(pos + 1, pos + 1)
          setCursor(pos + 1)
        })
      }
      setDismissed(false)
      setManualOpen(true)
      setActiveIndex(0)
      return
    }

    if (event.key === "{" || event.key === "." || event.key === "(") {
      setDismissed(false)
      setManualOpen(event.key === "(")
      setActiveIndex(0)
    }

    if (!open && !["{", ".", "("].includes(event.key)) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      if (suggestions.length === 0) return
      setActiveIndex((index) => (index + 1) % suggestions.length)
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      if (suggestions.length === 0) return
      setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length)
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      closeList()
      return
    }

    if ((event.key === "Enter" || event.key === "Tab") && open && suggestions[activeIndex]) {
      event.preventDefault()
      applySuggestion(suggestions[activeIndex])
    }
  }

  const emptyMessage =
    variables.length === 0 && suggestions.length === 0
      ? "Nenhuma variável no programa ainda. Pacotes: $Texto, $Numero, $Lista."
      : "Nenhuma sugestão para esse trecho."

  const heading = context ? groupHeading(context.mode) : "Variáveis e pacotes"
  const highlighted = useMemo(() => highlightCode(value || " ", variableNames), [value, variableNames])

  const fieldShell = (
    <div
      className={cn(
        "relative w-full rounded-xl border border-input bg-background shadow-none",
        singleLine ? "h-11" : "min-h-24",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] font-mono text-base text-foreground md:text-sm",
          singleLine
            ? "flex items-center px-3 py-2 leading-relaxed"
            : "whitespace-pre-wrap break-words px-3 py-2.5 leading-relaxed",
        )}
      >
        {value ? (
          singleLine ? (
            <span className="block w-full truncate whitespace-pre">{highlighted}</span>
          ) : (
            highlighted
          )
        ) : (
          <span className="text-muted-foreground">{placeholder || ""}</span>
        )}
      </div>
      {singleLine ? (
        <input
          ref={(el) => {
            fieldRef.current = el
          }}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onClick={syncCursor}
          onKeyUp={syncCursor}
          onSelect={syncCursor}
          onFocus={() => {
            setFocused(true)
            syncCursor()
          }}
          onBlur={() => {
            setFocused(false)
            closeList()
          }}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listId}
          className="relative z-[1] h-11 w-full rounded-[inherit] border-0 bg-transparent px-3 py-2 font-mono text-base leading-relaxed text-transparent caret-foreground outline-none ring-0 placeholder:text-transparent focus-visible:ring-0 md:text-sm"
        />
      ) : (
        <textarea
          ref={(el) => {
            fieldRef.current = el
          }}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onClick={syncCursor}
          onKeyUp={syncCursor}
          onSelect={syncCursor}
          onFocus={() => {
            setFocused(true)
            syncCursor()
          }}
          onBlur={() => {
            setFocused(false)
            closeList()
          }}
          placeholder={placeholder}
          rows={4}
          spellCheck={false}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listId}
          className="relative z-[1] min-h-24 w-full resize-y rounded-[inherit] border-0 bg-transparent px-3 py-2.5 font-mono text-base leading-relaxed text-transparent caret-foreground outline-none ring-0 placeholder:text-transparent focus-visible:ring-0 md:text-sm"
        />
      )}
    </div>
  )

  return (
    <Popover open={open}>
      <PopoverAnchor asChild>
        <div
          className={cn(
            "rounded-xl focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            singleLine ? "h-11" : "min-h-24",
          )}
        >
          {fieldShell}
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-[var(--radix-popover-trigger-width)] p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => {
          if (fieldRef.current?.contains(event.target as Node)) {
            event.preventDefault()
            return
          }
          closeList()
        }}
        onFocusOutside={(event) => {
          if (fieldRef.current?.contains(event.target as Node)) {
            event.preventDefault()
          }
        }}
      >
        <Command shouldFilter={false}>
          <CommandList ref={listRef} id={listId} className="max-h-64 overscroll-contain">
            {suggestions.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup heading={heading}>
                {suggestions.map((item, index) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    data-autocomplete-index={index}
                    data-selected={index === activeIndex}
                    className={cn(index === activeIndex && "bg-accent text-accent-foreground")}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onSelect={() => applySuggestion(item)}
                  >
                    <span
                      className={cn(
                        "mr-1.5 size-1.5 shrink-0 rounded-full",
                        item.kind === "variable" && "bg-violet-500",
                        item.kind === "package" && "bg-amber-500",
                        (item.kind === "method" || item.kind === "function") && "bg-sky-500",
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block font-mono text-sm",
                          item.kind === "variable" && "text-violet-700 dark:text-violet-300",
                          item.kind === "package" && "text-amber-700 dark:text-amber-300",
                          (item.kind === "method" || item.kind === "function") &&
                            "text-sky-700 dark:text-sky-300",
                        )}
                      >
                        {item.title}
                        {(item.kind === "method" || item.kind === "function") && "()"}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {item.subtitle}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                        item.kind === "variable" &&
                          "bg-violet-500/15 text-violet-700 dark:text-violet-200",
                        item.kind === "package" &&
                          "bg-amber-500/15 text-amber-800 dark:text-amber-200",
                        (item.kind === "method" || item.kind === "function") &&
                          "bg-sky-500/15 text-sky-800 dark:text-sky-200",
                      )}
                    >
                      {item.kind === "variable" ? "var" : item.kind === "package" ? "pacote" : "função"}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/** Alias do campo de mensagem (template com { }). */
export function VariableAutocompleteField(props: Omit<ExpressionFieldProps, "mode">) {
  return <ExpressionField {...props} mode="template" />
}
