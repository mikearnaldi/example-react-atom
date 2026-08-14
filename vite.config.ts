import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    minify: "oxc",
    modulePreload: { polyfill: false },
    rolldownOptions: {
      treeshake: {
        annotations: true,
        commonjs: true,
        propertyReadSideEffects: false
      }
    }
  }
})
