"use client"

import { createContext, useContext, type ReactNode } from "react"
import { say } from "@/lib/personalize"

const UserNameContext = createContext("você")

export function UserNameProvider({ name, children }: { name: string; children: ReactNode }) {
  return <UserNameContext.Provider value={name}>{children}</UserNameContext.Provider>
}

export function useUserName() {
  return useContext(UserNameContext)
}

export function useSay() {
  const name = useUserName()
  return (template: string) => say(template, name)
}
