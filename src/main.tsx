import * as AtomRegistryContext from "@effect/atom-react/RegistryContext"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App.tsx"
// oxlint-disable-next-line no-unassigned-import
import "./styles.css"

const rootElement = document.getElementById("root")

if (rootElement === null) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(
  <StrictMode>
    <AtomRegistryContext.RegistryProvider>
      <App />
    </AtomRegistryContext.RegistryProvider>
  </StrictMode>
)
