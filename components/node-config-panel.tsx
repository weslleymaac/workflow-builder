"use client"

import { useState, type ReactNode } from "react"
import { Check, ChevronsUpDown, ChevronDown, ChevronUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  FUNCTION_CATEGORY_LABEL,
  findFunction,
  functionsByCategory,
  functionsForDataType,
  type LogicFunction,
} from "@/lib/functions"
import {
  createEmptyConditionRule,
  getConditionRules,
  inferExpressionType,
  isUnaryOperator,
  normalizeOperator,
  operatorsForType,
  OPERATOR_LABEL,
  type TypedVariable,
  unwrapVariableName,
} from "@/lib/condition"
import { getCatalogItem } from "@/lib/node-catalog"
import type {
  AssignmentMode,
  CompareOperator,
  ConditionJoin,
  ConditionRule,
  DataType,
  FunctionCategory,
  InputQuestion,
  ListOperation,
  LoopType,
  SwitchCase,
  VariableAssignment,
  VariableDeclaration,
  WorkflowNode,
} from "@/lib/types"
import { VariableAutocompleteField, ExpressionField } from "@/components/variable-autocomplete-field"
import { DATA_TYPE_LABEL, DATA_TYPE_TIP } from "@/lib/values"
import { cn } from "@/lib/utils"
import {
  createInputQuestion,
  createVariableAssignment,
  createVariableDeclaration,
  getInputQuestions,
  getVariableAssignments,
  getVariableDeclarations,
  syncInputQuestions,
  syncVariableDeclarations,
} from "@/lib/workflow-utils"

interface NodeConfigPanelProps {
  node: WorkflowNode
  listVariables: string[]
  programVariables: TypedVariable[]
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void
  onClose: () => void
}

export default function NodeConfigPanel({
  node,
  listVariables,
  programVariables,
  updateNodeData,
  onClose,
}: NodeConfigPanelProps) {
  const catalog = getCatalogItem(String(node.type))

  const handleChange = (key: string, value: unknown) => {
    updateNodeData(node.id, { [key]: value })
  }

  const handleBatchChange = (updates: Record<string, unknown>) => {
    updateNodeData(node.id, updates)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Configurar bloco
          </p>
          <h2 className="font-display text-lg text-foreground">{node.data.label}</h2>
          {catalog && <p className="text-sm leading-relaxed text-muted-foreground">{catalog.tip}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar configuração">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <Field label="Nome do bloco">
          <Input value={node.data.label || ""} onChange={(event) => handleChange("label", event.target.value)} />
        </Field>

        {node.type === "variable" && (
          <VariableDeclarationsFields
            declarations={getVariableDeclarations(node.data)}
            variables={programVariables}
            onBatchChange={handleBatchChange}
          />
        )}

        {node.type === "operation" && (
          <OperationAssignmentsFields
            assignments={getVariableAssignments(node.data)}
            variables={programVariables}
            onBatchChange={handleBatchChange}
          />
        )}

        {node.type === "input" && (
          <InputQuestionsFields
            questions={getInputQuestions(node.data)}
            onBatchChange={handleBatchChange}
          />
        )}

        {node.type === "print" && (
          <Field
            label="Mensagem"
            hint={
              "Tudo entre { } é calculado. Pacotes: $Texto, $Numero, $Lista. Contas: + - * / mod. Texto: & para juntar."
            }
          >
            <VariableAutocompleteField
              value={node.data.template || ""}
              onChange={(value) => handleChange("template", value)}
              variables={programVariables}
            />
          </Field>
        )}

        {node.type === "function" && (
          <FunctionFields node={node} variables={programVariables} updateNodeData={updateNodeData} />
        )}

        {node.type === "condition" && (
          <>
            <MultiConditionFields
              rules={getConditionRules(node.data)}
              variables={programVariables}
              onBatchChange={handleBatchChange}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Rótulo SIM">
                <Input
                  value={node.data.trueLabel || "sim"}
                  onChange={(event) => handleChange("trueLabel", event.target.value)}
                />
              </Field>
              <Field label="Rótulo NÃO">
                <Input
                  value={node.data.falseLabel || "não"}
                  onChange={(event) => handleChange("falseLabel", event.target.value)}
                />
              </Field>
            </div>
          </>
        )}

        {node.type === "switch" && (
          <SwitchFields node={node} variables={programVariables} onBatchChange={handleBatchChange} />
        )}

        {node.type === "loop" && (
          <>
            <Field label="Tipo de repetição">
              <Select
                value={node.data.loopType || "para"}
                onValueChange={(value) => handleChange("loopType", value as LoopType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="para">Para · for (conta de X até Y)</SelectItem>
                  <SelectItem value="enquanto">Enquanto · while (repete se for verdade)</SelectItem>
                  <SelectItem value="paraCada">Para cada · for each (percorre uma lista)</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {node.data.loopType === "enquanto" && (
              <ConditionFields
                left={node.data.leftExpr}
                operator={node.data.operator}
                right={node.data.rightExpr}
                variables={programVariables}
                onBatchChange={handleBatchChange}
              />
            )}

            {node.data.loopType === "paraCada" && (
              <>
                <ListVariableField
                  value={node.data.listName}
                  options={listVariables}
                  onChange={(value) => handleChange("listName", value)}
                />
                <NameField
                  label="Nome de cada item"
                  value={node.data.itemVar}
                  onChange={(value) => handleChange("itemVar", value)}
                />
              </>
            )}

            {(node.data.loopType ?? "para") === "para" && (
              <>
                <NameField
                  label="Contador"
                  value={node.data.counterVar}
                  onChange={(value) => handleChange("counterVar", value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Field label="De">
                    <ExpressionField
                      mode="expression"
                      singleLine
                      value={node.data.fromExpr || ""}
                      onChange={(value) => handleChange("fromExpr", value)}
                      variables={programVariables}
                    />
                  </Field>
                  <Field label="Até">
                    <ExpressionField
                      mode="expression"
                      singleLine
                      value={node.data.toExpr || ""}
                      onChange={(value) => handleChange("toExpr", value)}
                      variables={programVariables}
                    />
                  </Field>
                  <Field label="Passo">
                    <ExpressionField
                      mode="expression"
                      singleLine
                      value={node.data.stepExpr || ""}
                      onChange={(value) => handleChange("stepExpr", value)}
                      variables={programVariables}
                    />
                  </Field>
                </div>
              </>
            )}

            <p className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-2 text-xs text-orange-100">
              Ligue o caminho <strong>corpo</strong> à direita para os blocos que repetem, e volte com uma seta para este bloco.
            </p>
          </>
        )}

        {node.type === "list" && (
          <>
            <Field label="Operação">
              <Select
                value={node.data.listOp || "criar"}
                onValueChange={(value) => handleChange("listOp", value as ListOperation)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="criar">Criar lista</SelectItem>
                  <SelectItem value="adicionar">Adicionar item</SelectItem>
                  <SelectItem value="obter">Obter item pelo índice</SelectItem>
                  <SelectItem value="tamanho">Descobrir o tamanho</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {node.data.listOp === "criar" || !node.data.listOp ? (
              <NameField
                label="Nome da lista"
                value={node.data.listName}
                onChange={(value) => handleChange("listName", value)}
              />
            ) : (
              <ListVariableField
                value={node.data.listName}
                options={listVariables}
                onChange={(value) => handleChange("listName", value)}
              />
            )}
            {node.data.listOp === "criar" && (
              <Field label="Itens" hint='Separe com vírgula. Ex: "maçã", "banana", 10'>
                <ExpressionField
                  mode="expression"
                  value={node.data.itemsExpr || ""}
                  onChange={(value) => handleChange("itemsExpr", value)}
                  variables={programVariables}
                />
              </Field>
            )}
            {node.data.listOp === "adicionar" && (
              <Field label="Valor para adicionar">
                <ExpressionField
                  mode="expression"
                  singleLine
                  value={node.data.valueExpr || ""}
                  onChange={(value) => handleChange("valueExpr", value)}
                  variables={programVariables}
                />
              </Field>
            )}
            {node.data.listOp === "obter" && (
              <>
                <Field label="Índice" hint="O primeiro item é 0">
                  <ExpressionField
                    mode="expression"
                    singleLine
                    value={node.data.indexExpr || "0"}
                    onChange={(value) => handleChange("indexExpr", value)}
                    variables={programVariables}
                  />
                </Field>
                <NameField
                  label="Guardar o item em"
                  value={node.data.targetVar}
                  onChange={(value) => handleChange("targetVar", value)}
                />
              </>
            )}
            {node.data.listOp === "tamanho" && (
              <NameField
                label="Guardar o tamanho em"
                value={node.data.targetVar}
                onChange={(value) => handleChange("targetVar", value)}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function FunctionFields({
  node,
  variables,
  updateNodeData,
}: {
  node: WorkflowNode
  variables: TypedVariable[]
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void
}) {
  const category = node.data.functionCategory ?? "texto"
  const options = functionsByCategory(category)
  const selected = findFunction(node.data.functionName) ?? options[0]
  const args = node.data.functionArgs ?? []

  const applyFunction = (fn: LogicFunction, nextCategory?: FunctionCategory) => {
    updateNodeData(node.id, {
      functionCategory: nextCategory ?? category,
      functionName: fn.name,
      functionArgs: fn.params.map((param, index) => args[index] ?? param.placeholder),
    })
  }

  return (
    <>
      <Field label="Categoria">
        <Select
          value={category}
          onValueChange={(value) => {
            const nextCategory = value as FunctionCategory
            const [first] = functionsByCategory(nextCategory)
            updateNodeData(node.id, {
              functionCategory: nextCategory,
              functionName: first.name,
              functionArgs: first.params.map((param) => param.placeholder),
            })
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(FUNCTION_CATEGORY_LABEL) as FunctionCategory[]).map((item) => (
              <SelectItem key={item} value={item}>
                {FUNCTION_CATEGORY_LABEL[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Função">
        <Select
          value={selected?.name}
          onValueChange={(value) => {
            const fn = findFunction(value)
            if (fn) applyFunction(fn)
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((fn) => (
              <SelectItem key={fn.name} value={fn.name}>
                {fn.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {selected && (
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3.5 text-sm leading-relaxed text-indigo-100">
          <p>{selected.description}</p>
          <p className="mt-2 font-mono text-sm text-indigo-300">{selected.example}</p>
        </div>
      )}

      {selected?.params.map((param, index) => (
        <Field key={`${selected.name}-${param.label}`} label={param.label}>
          <ExpressionField
            mode="expression"
            singleLine
            value={args[index] ?? ""}
            placeholder={param.placeholder}
            variables={variables}
            onChange={(value) => {
              const next = [...args]
              next[index] = value
              updateNodeData(node.id, { functionArgs: next })
            }}
          />
        </Field>
      ))}

      <NameField
        label="Guardar o resultado em"
        value={node.data.targetVar}
        onChange={(value) => updateNodeData(node.id, { targetVar: value })}
      />
    </>
  )
}

function ListVariableField({
  value,
  options,
  onChange,
}: {
  value?: string
  options: string[]
  onChange: (value: string) => void
}) {
  const choices = [...new Set([...options, ...(value ? [value] : [])])]

  if (choices.length === 0) {
    return (
      <Field label="Lista">
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-xs text-amber-800 dark:text-amber-100">
          Nenhuma lista no programa ainda. Use o bloco <strong>Lista → Criar lista</strong> antes deste
          bloco e ela vai aparecer aqui.
        </p>
      </Field>
    )
  }

  return (
    <Field label="Lista" hint="Só aparecem variáveis que guardam listas.">
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Escolha uma lista" />
        </SelectTrigger>
        <SelectContent>
          {choices.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

function VariableDeclarationsFields({
  declarations,
  variables,
  onBatchChange,
}: {
  declarations: VariableDeclaration[]
  variables: TypedVariable[]
  onBatchChange: (updates: Record<string, unknown>) => void
}) {
  const updateAll = (next: VariableDeclaration[]) => {
    onBatchChange(syncVariableDeclarations(next))
  }

  const updateOne = (id: string, patch: Partial<VariableDeclaration>) => {
    updateAll(declarations.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Variáveis</Label>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Nome, tipo e valor. Pode criar várias no mesmo bloco.
        </p>
      </div>

      {declarations.map((item, index) => (
        <div key={item.id} className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Variável {index + 1}
            </p>
            {declarations.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive hover:text-destructive"
                onClick={() => updateAll(declarations.filter((entry) => entry.id !== item.id))}
              >
                Remover
              </Button>
            )}
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Field label="Nome">
              <Input
                value={item.name}
                placeholder="ex: idade"
                onChange={(event) => updateOne(item.id, { name: event.target.value })}
              />
            </Field>
            <Field label="Tipo">
              <Select
                value={item.dataType}
                onValueChange={(value) => updateOne(item.id, { dataType: value as DataType })}
              >
                <SelectTrigger className="w-[8.5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DATA_TYPE_LABEL) as DataType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {DATA_TYPE_LABEL[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Valor" hint={DATA_TYPE_TIP[item.dataType]}>
            <ExpressionField
              mode="expression"
              singleLine
              value={item.valueExpr}
              variables={variables.filter((entry) => entry.name !== item.name.trim())}
              placeholder={
                item.dataType === "texto"
                  ? '"Ana"'
                  : item.dataType === "numero"
                    ? "10"
                    : item.dataType === "logico"
                      ? "verdadeiro"
                      : '"pera", "maçã"'
              }
              onChange={(value) => updateOne(item.id, { valueExpr: value })}
            />
          </Field>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => updateAll([...declarations, createVariableDeclaration()])}
      >
        + Adicionar variável
      </Button>
    </div>
  )
}

function OperationAssignmentsFields({
  assignments,
  variables,
  onBatchChange,
}: {
  assignments: VariableAssignment[]
  variables: TypedVariable[]
  onBatchChange: (updates: Record<string, unknown>) => void
}) {
  const updateAll = (next: VariableAssignment[]) => {
    onBatchChange({ assignments: next })
  }

  const updateOne = (id: string, patch: Partial<VariableAssignment>) => {
    updateAll(assignments.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const pickFunctionForType = (dataType: DataType, preferred?: string) => {
    const options = functionsForDataType(dataType)
    const selected = preferred ? options.find((fn) => fn.name === preferred) : undefined
    return selected ?? options[0]
  }

  if (variables.length === 0) {
    return (
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100">
        Nenhuma variável no programa ainda. Crie com o bloco <strong>Variável</strong> ou{" "}
        <strong>Perguntar</strong> antes de processar.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Processamentos</Label>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use uma função do tipo da variável ou escreva uma expressão livre.
        </p>
      </div>

      {assignments.map((item, index) => {
        const selected = variables.find((entry) => entry.name === item.targetVar.trim())
        const mode: AssignmentMode =
          item.mode ?? (item.functionName ? "function" : "expression")
        const typeFns = selected ? functionsForDataType(selected.dataType) : []
        const canUseFunction = typeFns.length > 0
        const activeFn =
          mode === "function" && selected
            ? pickFunctionForType(selected.dataType, item.functionName)
            : undefined
        const extraParams = activeFn?.params.slice(1) ?? []
        const args = item.functionArgs ?? []

        const setMode = (nextMode: AssignmentMode) => {
          if (nextMode === "function" && selected) {
            const fn = pickFunctionForType(selected.dataType, item.functionName)
            updateOne(item.id, {
              mode: "function",
              functionName: fn?.name,
              functionArgs: fn?.params.slice(1).map((param, i) => args[i] ?? param.placeholder) ?? [],
            })
            return
          }
          updateOne(item.id, { mode: "expression" })
        }

        const setTargetVar = (name: string) => {
          const next = variables.find((entry) => entry.name === name)
          if (!next) {
            updateOne(item.id, { targetVar: name })
            return
          }
          const fns = functionsForDataType(next.dataType)
          if (mode === "function" && fns.length > 0) {
            const fn = pickFunctionForType(next.dataType, item.functionName)
            updateOne(item.id, {
              targetVar: name,
              mode: "function",
              functionName: fn?.name,
              functionArgs: fn?.params.slice(1).map((param) => param.placeholder) ?? [],
            })
            return
          }
          updateOne(item.id, {
            targetVar: name,
            mode: fns.length === 0 ? "expression" : mode,
          })
        }

        return (
          <div key={item.id} className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Processar {index + 1}
              </p>
              {assignments.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-destructive hover:text-destructive"
                  onClick={() => updateAll(assignments.filter((entry) => entry.id !== item.id))}
                >
                  Remover
                </Button>
              )}
            </div>

            <Field label="Variável">
              <Select value={item.targetVar || undefined} onValueChange={setTargetVar}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma variável" />
                </SelectTrigger>
                <SelectContent>
                  {variables.map((entry) => (
                    <SelectItem key={entry.name} value={entry.name}>
                      {entry.name}
                      <span className="ml-2 text-muted-foreground">({DATA_TYPE_LABEL[entry.dataType]})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-background p-1">
              <button
                type="button"
                disabled={!canUseFunction && Boolean(selected)}
                onClick={() => setMode("function")}
                className={cn(
                  "rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                  mode === "function"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                  !canUseFunction && selected && "cursor-not-allowed opacity-40",
                )}
              >
                Função
              </button>
              <button
                type="button"
                onClick={() => setMode("expression")}
                className={cn(
                  "rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                  mode === "expression"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                Expressão
              </button>
            </div>

            {mode === "function" ? (
              selected && canUseFunction && activeFn ? (
                <>
                  <Field label="Função" hint={activeFn.description}>
                    <FunctionSearchSelect
                      options={typeFns}
                      value={activeFn.name}
                      onChange={(value) => {
                        const fn = findFunction(value)
                        if (!fn) return
                        updateOne(item.id, {
                          functionName: fn.name,
                          functionArgs: fn.params.slice(1).map((param, i) => args[i] ?? param.placeholder),
                        })
                      }}
                    />
                  </Field>

                  <p className="rounded-lg border border-rose-500/15 bg-rose-500/10 px-2.5 py-2 font-mono text-xs text-rose-900 dark:text-rose-100">
                    {item.targetVar}.{activeFn.name}(
                    {extraParams.map((param) => param.placeholder).join(", ")})
                  </p>

                  {extraParams.map((param, paramIndex) => (
                    <Field key={`${activeFn.name}-${param.label}`} label={param.label}>
                      <ExpressionField
                        mode="expression"
                        value={args[paramIndex] ?? ""}
                        placeholder={param.placeholder}
                        variables={variables}
                        onChange={(value) => {
                          const next = [...args]
                          next[paramIndex] = value
                          updateOne(item.id, { functionArgs: next })
                        }}
                      />
                    </Field>
                  ))}
                </>
              ) : (
                <p className="rounded-lg border border-border bg-muted/40 p-2 text-sm text-muted-foreground">
                  {selected
                    ? `Variáveis do tipo ${DATA_TYPE_LABEL[selected.dataType]} não têm funções prontas. Use Expressão.`
                    : "Escolha uma variável para ver as funções disponíveis."}
                </p>
              )
            ) : (
              <Field
                label="Expressão"
                hint={
                  selected
                    ? DATA_TYPE_TIP[selected.dataType]
                    : "Ex: pontos + 1  ou  nome & \"!\""
                }
              >
                <ExpressionField
                  mode="expression"
                  value={item.valueExpr}
                  variables={variables}
                  placeholder={
                    selected?.dataType === "texto"
                      ? 'nome & "!"'
                      : selected?.dataType === "numero"
                        ? `${item.targetVar || "n"} + 1`
                        : selected?.dataType === "logico"
                          ? "verdadeiro"
                          : selected?.dataType === "lista"
                            ? '"pera", "maçã"'
                            : "expressão"
                  }
                  onChange={(value) => updateOne(item.id, { valueExpr: value })}
                />
              </Field>
            )}
          </div>
        )
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => updateAll([...assignments, createVariableAssignment()])}
      >
        + Adicionar processamento
      </Button>
    </div>
  )
}

function InputQuestionsFields({
  questions,
  onBatchChange,
}: {
  questions: InputQuestion[]
  onBatchChange: (updates: Record<string, unknown>) => void
}) {
  const updateAll = (next: InputQuestion[]) => {
    onBatchChange(syncInputQuestions(next))
  }

  const updateOne = (id: string, patch: Partial<InputQuestion>) => {
    updateAll(questions.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= questions.length) return
    const next = [...questions]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    updateAll(next)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Perguntas</Label>
        <p className="text-sm leading-relaxed text-muted-foreground">
          O programa faz cada pergunta em sequência e guarda as respostas.
        </p>
      </div>

      {questions.map((item, index) => (
        <div key={item.id} className="space-y-3 rounded-xl border border-border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pergunta {index + 1}
            </p>
            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 px-0"
                disabled={index === 0}
                title="Mover para cima"
                onClick={() => move(index, -1)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 px-0"
                disabled={index === questions.length - 1}
                title="Mover para baixo"
                onClick={() => move(index, 1)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              {questions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-destructive hover:text-destructive"
                  onClick={() => updateAll(questions.filter((entry) => entry.id !== item.id))}
                >
                  Remover
                </Button>
              )}
            </div>
          </div>

          <Field label="Pergunta">
            <Input
              value={item.prompt}
              placeholder="Ex: Qual é a sua idade?"
              onChange={(event) => updateOne(item.id, { prompt: event.target.value })}
            />
          </Field>

          <Field label="Guardar a resposta em" hint="Sem espaços. Ex: idade, soma, fruta">
            <Input
              value={item.variableName}
              placeholder="ex: idade"
              onChange={(event) => updateOne(item.id, { variableName: event.target.value })}
            />
          </Field>

          <Field label="Tipo" hint={DATA_TYPE_TIP[item.dataType]}>
            <Select
              value={item.dataType}
              onValueChange={(value) => updateOne(item.id, { dataType: value as DataType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DATA_TYPE_LABEL) as DataType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {DATA_TYPE_LABEL[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => updateAll([...questions, createInputQuestion()])}
      >
        + Adicionar pergunta
      </Button>
    </div>
  )
}

function FunctionSearchSelect({
  options,
  value,
  onChange,
}: {
  options: LogicFunction[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((fn) => fn.name === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-full justify-between rounded-xl px-3 font-normal"
        >
          <span className="truncate">{selected?.label ?? "Escolha uma função"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar função..." />
          <CommandList className="max-h-64">
            <CommandEmpty>Nenhuma função encontrada.</CommandEmpty>
            <CommandGroup>
              {options.map((fn) => (
                <CommandItem
                  key={fn.name}
                  value={`${fn.label} ${fn.name} ${fn.description}`}
                  onSelect={() => {
                    onChange(fn.name)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === fn.name ? "opacity-100" : "opacity-0")} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{fn.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{fn.name}()</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-sm leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  )
}

function NameField({
  label = "Nome da variável",
  value,
  onChange,
}: {
  label?: string
  value?: string
  onChange: (value: string) => void
}) {
  return (
    <Field label={label} hint="Sem espaços. Ex: idade, soma, fruta">
      <Input value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </Field>
  )
}

function TypeField({ value, onChange }: { value?: DataType; onChange: (value: DataType) => void }) {
  return (
    <Field label="Tipo de dado" hint={value ? DATA_TYPE_TIP[value] : undefined}>
      <Select value={value || "texto"} onValueChange={(next) => onChange(next as DataType)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(DATA_TYPE_LABEL) as DataType[]).map((type) => (
            <SelectItem key={type} value={type}>
              {DATA_TYPE_LABEL[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

function syncConditionLegacy(conditions: ConditionRule[]) {
  const first = conditions[0]
  return {
    conditions,
    leftExpr: first?.leftExpr ?? "",
    operator: first?.operator ?? "==",
    rightExpr: first?.rightExpr ?? "",
  }
}

function createSwitchCase(index: number): SwitchCase {
  return {
    id: `case-${Date.now().toString(36)}-${index}`,
    matchExpr: '""',
    label: `caso ${index + 1}`,
  }
}

function MultiConditionFields({
  rules,
  variables,
  onBatchChange,
}: {
  rules: ConditionRule[]
  variables: TypedVariable[]
  onBatchChange: (updates: Record<string, unknown>) => void
}) {
  const updateRule = (index: number, patch: Partial<ConditionRule>) => {
    const next = rules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule))
    onBatchChange(syncConditionLegacy(next))
  }

  const updateJoin = (index: number, join: ConditionJoin) => {
    if (index <= 0) return
    updateRule(index, { join })
  }

  const addRule = () => {
    const next = [...rules, createEmptyConditionRule("e")]
    onBatchChange(syncConditionLegacy(next))
  }

  const removeRule = (index: number) => {
    if (rules.length <= 1) return
    const next = rules.filter((_, i) => i !== index)
    if (next[0]) next[0] = { ...next[0], join: undefined }
    onBatchChange(syncConditionLegacy(next))
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Combine condições com <strong>E</strong> (todas verdadeiras) ou <strong>OU</strong> (basta uma).
      </p>
      {rules.map((rule, index) => (
        <div key={index} className="rounded-lg border border-border bg-muted/20 p-3">
          {index > 0 && (
            <div className="mb-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={rule.join !== "ou" ? "default" : "outline"}
                className="h-8 flex-1 text-xs"
                onClick={() => updateJoin(index, "e")}
              >
                E
              </Button>
              <Button
                type="button"
                size="sm"
                variant={rule.join === "ou" ? "default" : "outline"}
                className="h-8 flex-1 text-xs"
                onClick={() => updateJoin(index, "ou")}
              >
                OU
              </Button>
            </div>
          )}
          <SingleConditionRuleFields
            rule={rule}
            variables={variables}
            onChange={(patch) => updateRule(index, patch)}
          />
          {rules.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-8 w-full text-destructive hover:text-destructive"
              onClick={() => removeRule(index)}
            >
              Remover condição
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={addRule}>
        + Adicionar condição
      </Button>
    </div>
  )
}

function SingleConditionRuleFields({
  rule,
  variables,
  onChange,
}: {
  rule: ConditionRule
  variables: TypedVariable[]
  onChange: (patch: Partial<ConditionRule>) => void
}) {
  const leftType = inferExpressionType(rule.leftExpr ?? "", variables)
  const availableOps = operatorsForType(leftType)
  const currentOperator = normalizeOperator(rule.operator, leftType)
  const unary = isUnaryOperator(currentOperator)

  const handleLeftChange = (value: string) => {
    const nextType = inferExpressionType(value, variables)
    onChange({
      leftExpr: value,
      operator: normalizeOperator(rule.operator, nextType),
    })
  }

  return (
    <div className="space-y-3">
      <ConditionSideField
        label="Esquerda"
        hint={'Variável ou valor. Ex: {idade}, 18, "Ana"'}
        value={rule.leftExpr}
        variables={variables}
        onChange={handleLeftChange}
      />
      {leftType !== "desconhecido" && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-100">
          Tipo detectado: <strong>{DATA_TYPE_LABEL[leftType]}</strong>
        </div>
      )}
      <Field label="Comparar">
        <Select
          value={currentOperator}
          onValueChange={(value) => onChange({ operator: value as CompareOperator })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableOps.map((item) => (
              <SelectItem key={item} value={item}>
                {OPERATOR_LABEL[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {!unary && (
        <ConditionSideField
          label="Direita"
          hint="Valor ou variável para comparar."
          value={rule.rightExpr}
          variables={variables}
          onChange={(value) => onChange({ rightExpr: value })}
        />
      )}
    </div>
  )
}

function SwitchFields({
  node,
  variables,
  onBatchChange,
}: {
  node: WorkflowNode
  variables: TypedVariable[]
  onBatchChange: (updates: Record<string, unknown>) => void
}) {
  const cases = node.data.switchCases ?? []

  const updateCases = (next: SwitchCase[]) => {
    onBatchChange({ switchCases: next })
  }

  return (
    <div className="space-y-4">
      <ConditionSideField
        label="Variável ou expressão"
        hint="Valor que será comparado com cada caso. Ex: {categoria}, {nota}"
        value={node.data.switchExpr}
        variables={variables}
        onChange={(value) => onBatchChange({ switchExpr: value })}
      />

      <div className="space-y-3">
        <Label>Casos</Label>
        {cases.map((item, index) => (
          <div key={item.id} className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            <Field label={`Caso ${index + 1} · valor`} hint='Ex: "A", 1, verdadeiro'>
              <ExpressionField
                mode="expression"
                singleLine
                value={item.matchExpr}
                variables={variables}
                onChange={(value) => {
                  const next = cases.map((entry) =>
                    entry.id === item.id ? { ...entry, matchExpr: value } : entry,
                  )
                  updateCases(next)
                }}
              />
            </Field>
            <Field label="Rótulo do caminho">
              <Input
                value={item.label || ""}
                onChange={(event) => {
                  const next = cases.map((entry) =>
                    entry.id === item.id ? { ...entry, label: event.target.value } : entry,
                  )
                  updateCases(next)
                }}
              />
            </Field>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-full text-destructive hover:text-destructive"
              disabled={cases.length <= 1}
              onClick={() => updateCases(cases.filter((entry) => entry.id !== item.id))}
            >
              Remover caso
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => updateCases([...cases, createSwitchCase(cases.length)])}
        >
          + Adicionar caso
        </Button>
      </div>

      <Field label="Rótulo padrão (senão)" hint="Caminho quando nenhum caso combina.">
        <Input
          value={node.data.defaultLabel || "padrão"}
          onChange={(event) => onBatchChange({ defaultLabel: event.target.value })}
        />
      </Field>
    </div>
  )
}

function ConditionFields({
  left,
  operator,
  right,
  variables,
  onBatchChange,
}: {
  left?: string
  operator?: CompareOperator
  right?: string
  variables: TypedVariable[]
  onBatchChange: (updates: Record<string, unknown>) => void
}) {
  const leftType = inferExpressionType(left ?? "", variables)
  const availableOps = operatorsForType(leftType)
  const currentOperator = normalizeOperator(operator, leftType)
  const unary = isUnaryOperator(currentOperator)

  const handleLeftChange = (value: string) => {
    const nextType = inferExpressionType(value, variables)
    onBatchChange({
      leftExpr: value,
      operator: normalizeOperator(operator, nextType),
    })
  }

  const handleRightChange = (value: string) => {
    onBatchChange({ rightExpr: value })
  }

  return (
    <div className="space-y-3">
      <ConditionSideField
        label="Esquerda"
        hint={'Escolha uma variável ou digite {nome}, 18, "Ana"'}
        value={left}
        variables={variables}
        onChange={handleLeftChange}
      />

      {leftType !== "desconhecido" && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-100">
          Tipo detectado: <strong>{DATA_TYPE_LABEL[leftType]}</strong>
        </div>
      )}

      <Field label="Comparar">
        <Select
          value={currentOperator}
          onValueChange={(value) => onBatchChange({ operator: value as CompareOperator })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableOps.map((item) => (
              <SelectItem key={item} value={item}>
                {OPERATOR_LABEL[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {!unary && (
        <ConditionSideField
          label="Direita"
          hint={
            leftType === "numero"
              ? "Número ou variável numérica. Ex: 18, {limite}"
              : leftType === "texto"
                ? 'Texto ou variável. Ex: "Ana", {nome}'
                : leftType === "lista"
                  ? 'Item para buscar na lista. Ex: "uva", {fruta}'
                  : "Valor ou variável para comparar."
          }
          value={right}
          variables={variables}
          onChange={handleRightChange}
        />
      )}
    </div>
  )
}

function ConditionSideField({
  label,
  hint,
  value,
  variables,
  onChange,
}: {
  label: string
  hint?: string
  value?: string
  variables: TypedVariable[]
  onChange: (value: string) => void
}) {
  const matchedName = unwrapVariableName(value ?? "")
  const matched = variables.find((item) => item.name === matchedName)
  const mode = matched ? matched.name : "__custom__"

  if (variables.length === 0) {
    return (
      <Field label={label} hint={hint}>
        <ExpressionField
          mode="expression"
          singleLine
          value={value || ""}
          onChange={onChange}
          variables={variables}
          placeholder='Ex: idade, 18, "Ana"'
        />
      </Field>
    )
  }

  return (
    <Field label={label} hint={hint}>
      <Select
        value={mode}
        onValueChange={(next) => {
          if (next === "__custom__") onChange("")
          else onChange(next)
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Escolha uma variável" />
        </SelectTrigger>
        <SelectContent>
          {variables.map((item) => (
            <SelectItem key={item.name} value={item.name}>
              {item.name} · {DATA_TYPE_LABEL[item.dataType]}
            </SelectItem>
          ))}
          <SelectItem value="__custom__">Valor ou expressão...</SelectItem>
        </SelectContent>
      </Select>
      {mode === "__custom__" && (
        <div className="mt-2">
          <ExpressionField
            mode="expression"
            singleLine
            value={value || ""}
            onChange={onChange}
            variables={variables}
            placeholder='Ex: idade + 1, "Ana", $Numero.raiz(9)'
          />
        </div>
      )}
    </Field>
  )
}
