"use client"

import type { ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  FUNCTION_CATEGORY_LABEL,
  findFunction,
  functionsByCategory,
  type LogicFunction,
} from "@/lib/functions"
import {
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
  CompareOperator,
  DataType,
  FunctionCategory,
  ListOperation,
  LoopType,
  WorkflowNode,
} from "@/lib/types"
import { DATA_TYPE_LABEL, DATA_TYPE_TIP } from "@/lib/values"

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
      <div className="flex items-start justify-between gap-2 border-b border-slate-700/50 px-4 py-3">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.22em] text-primary">Configurar bloco</p>
          <h2 className="font-display text-base text-foreground">{node.data.label}</h2>
          {catalog && <p className="mt-1 text-xs text-muted-foreground">{catalog.tip}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar configuração">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Field label="Nome do bloco">
          <Input value={node.data.label || ""} onChange={(event) => handleChange("label", event.target.value)} />
        </Field>

        {node.type === "variable" && (
          <>
            <NameField value={node.data.variableName} onChange={(value) => handleChange("variableName", value)} />
            <TypeField value={node.data.dataType} onChange={(value) => handleChange("dataType", value)} />
            <Field label="Valor ou expressão" hint='Exemplos: 10, "Ana", verdadeiro, a + b'>
              <Input
                value={node.data.valueExpr || ""}
                onChange={(event) => handleChange("valueExpr", event.target.value)}
              />
            </Field>
          </>
        )}

        {node.type === "input" && (
          <>
            <NameField
              label="Guardar a resposta em"
              value={node.data.variableName}
              onChange={(value) => handleChange("variableName", value)}
            />
            <TypeField value={node.data.dataType} onChange={(value) => handleChange("dataType", value)} />
            <Field label="Pergunta">
              <Input value={node.data.prompt || ""} onChange={(event) => handleChange("prompt", event.target.value)} />
            </Field>
          </>
        )}

        {node.type === "print" && (
          <Field label="Mensagem" hint="Use {variavel} para mostrar um valor guardado.">
            <Textarea
              value={node.data.template || ""}
              onChange={(event) => handleChange("template", event.target.value)}
              className="min-h-24"
            />
          </Field>
        )}

        {node.type === "function" && (
          <FunctionFields node={node} updateNodeData={updateNodeData} />
        )}

        {node.type === "condition" && (
          <>
            <ConditionFields
              left={node.data.leftExpr}
              operator={node.data.operator}
              right={node.data.rightExpr}
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
                    <Input
                      value={node.data.fromExpr || ""}
                      onChange={(event) => handleChange("fromExpr", event.target.value)}
                    />
                  </Field>
                  <Field label="Até">
                    <Input
                      value={node.data.toExpr || ""}
                      onChange={(event) => handleChange("toExpr", event.target.value)}
                    />
                  </Field>
                  <Field label="Passo">
                    <Input
                      value={node.data.stepExpr || ""}
                      onChange={(event) => handleChange("stepExpr", event.target.value)}
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
                <Textarea
                  value={node.data.itemsExpr || ""}
                  onChange={(event) => handleChange("itemsExpr", event.target.value)}
                />
              </Field>
            )}
            {node.data.listOp === "adicionar" && (
              <Field label="Valor para adicionar">
                <Input
                  value={node.data.valueExpr || ""}
                  onChange={(event) => handleChange("valueExpr", event.target.value)}
                />
              </Field>
            )}
            {node.data.listOp === "obter" && (
              <>
                <Field label="Índice" hint="O primeiro item é 0">
                  <Input
                    value={node.data.indexExpr || "0"}
                    onChange={(event) => handleChange("indexExpr", event.target.value)}
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
  updateNodeData,
}: {
  node: WorkflowNode
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
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3 text-xs text-indigo-100">
          <p>{selected.description}</p>
          <p className="mt-1 font-mono text-[11px] text-indigo-300">{selected.example}</p>
        </div>
      )}

      {selected?.params.map((param, index) => (
        <Field key={`${selected.name}-${param.label}`} label={param.label}>
          <Input
            value={args[index] ?? ""}
            placeholder={param.placeholder}
            onChange={(event) => {
              const next = [...args]
              next[index] = event.target.value
              updateNodeData(node.id, { functionArgs: next })
            }}
          />
          <p className="text-[11px] text-muted-foreground">Use {"{variavel}"} ou só o nome da variável.</p>
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

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
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
        <Input value={value || ""} onChange={(event) => onChange(event.target.value)} />
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
        <Input
          className="mt-2"
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder='Ex: {idade}, 18, "Ana"'
        />
      )}
    </Field>
  )
}
