"use client"

import * as React from "react"

/**
 * Alguns navegadores não disparam o evento `change` de forma confiável quando a
 * janela é redimensionada, então também ouvimos `resize` e relemos o valor.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    const sync = () => setMatches(media.matches)

    sync()
    media.addEventListener("change", sync)
    window.addEventListener("resize", sync)
    window.addEventListener("orientationchange", sync)

    return () => {
      media.removeEventListener("change", sync)
      window.removeEventListener("resize", sync)
      window.removeEventListener("orientationchange", sync)
    }
  }, [query])

  return matches
}
