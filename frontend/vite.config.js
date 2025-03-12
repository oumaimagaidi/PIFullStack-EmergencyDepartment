import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{js,jsx}"],
      exclude: [
        "src/__tests__/**",
        "src/**/*.test.{js,jsx}",
        "vendor/**", // Exclude vendor directory from coverage
      ],
    },
    include: ["src/__tests__/**/*.{test,spec}.{js,jsx}"], // Only run tests in src/__tests__
    exclude: ["vendor/**", "node_modules/**"], // Exclude vendor and node_modules from test execution
  },
}));