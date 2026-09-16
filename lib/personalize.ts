const NAME_TOKEN = "{name}"

export function normalizeFirstName(raw: string): string {
  const first = raw.trim().split(/\s+/)[0] ?? ""
  const cleaned = first.replace(/[^\p{L}'’-]/gu, "").slice(0, 20)
  if (!cleaned) return ""
  return cleaned.charAt(0).toLocaleUpperCase("pt-BR") + cleaned.slice(1).toLocaleLowerCase("pt-BR")
}

export function isValidFirstName(name: string): boolean {
  return name.length >= 2
}

/** Substitui `{name}` pelo primeiro nome. Não altera `{nome}` (sintaxe de variável do editor). */
export function say(template: string, firstName: string): string {
  const name = firstName.trim() || "você"
  return template.replaceAll(NAME_TOKEN, name)
}
