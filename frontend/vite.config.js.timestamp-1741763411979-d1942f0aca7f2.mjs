// vite.config.js
import { defineConfig } from "file:///C:/Users/Lenovo/Desktop/EpicCoders/PI/PIFullStack-EmergencyDepartment/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Lenovo/Desktop/EpicCoders/PI/PIFullStack-EmergencyDepartment/frontend/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/Lenovo/Desktop/EpicCoders/PI/PIFullStack-EmergencyDepartment/frontend/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Lenovo\\Desktop\\EpicCoders\\PI\\PIFullStack-EmergencyDepartment\\frontend";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3e3
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
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
        "vendor/**"
        // Exclude vendor directory from coverage
      ]
    },
    include: ["src/__tests__/**/*.{test,spec}.{js,jsx}"],
    // Only run tests in src/__tests__
    exclude: ["vendor/**", "node_modules/**"]
    // Exclude vendor and node_modules from test execution
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxMZW5vdm9cXFxcRGVza3RvcFxcXFxFcGljQ29kZXJzXFxcXFBJXFxcXFBJRnVsbFN0YWNrLUVtZXJnZW5jeURlcGFydG1lbnRcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXExlbm92b1xcXFxEZXNrdG9wXFxcXEVwaWNDb2RlcnNcXFxcUElcXFxcUElGdWxsU3RhY2stRW1lcmdlbmN5RGVwYXJ0bWVudFxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTGVub3ZvL0Rlc2t0b3AvRXBpY0NvZGVycy9QSS9QSUZ1bGxTdGFjay1FbWVyZ2VuY3lEZXBhcnRtZW50L2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogMzAwMCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgdGVzdDoge1xyXG4gICAgZW52aXJvbm1lbnQ6IFwianNkb21cIixcclxuICAgIGdsb2JhbHM6IHRydWUsXHJcbiAgICBjb3ZlcmFnZToge1xyXG4gICAgICBwcm92aWRlcjogXCJ2OFwiLFxyXG4gICAgICByZXBvcnRlcjogW1widGV4dFwiLCBcImxjb3ZcIl0sXHJcbiAgICAgIGluY2x1ZGU6IFtcInNyYy8qKi8qLntqcyxqc3h9XCJdLFxyXG4gICAgICBleGNsdWRlOiBbXHJcbiAgICAgICAgXCJzcmMvX190ZXN0c19fLyoqXCIsXHJcbiAgICAgICAgXCJzcmMvKiovKi50ZXN0Lntqcyxqc3h9XCIsXHJcbiAgICAgICAgXCJ2ZW5kb3IvKipcIiwgLy8gRXhjbHVkZSB2ZW5kb3IgZGlyZWN0b3J5IGZyb20gY292ZXJhZ2VcclxuICAgICAgXSxcclxuICAgIH0sXHJcbiAgICBpbmNsdWRlOiBbXCJzcmMvX190ZXN0c19fLyoqLyoue3Rlc3Qsc3BlY30ue2pzLGpzeH1cIl0sIC8vIE9ubHkgcnVuIHRlc3RzIGluIHNyYy9fX3Rlc3RzX19cclxuICAgIGV4Y2x1ZGU6IFtcInZlbmRvci8qKlwiLCBcIm5vZGVfbW9kdWxlcy8qKlwiXSwgLy8gRXhjbHVkZSB2ZW5kb3IgYW5kIG5vZGVfbW9kdWxlcyBmcm9tIHRlc3QgZXhlY3V0aW9uXHJcbiAgfSxcclxufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBNGEsU0FBUyxvQkFBb0I7QUFDemMsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxFQUM1QyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSLFVBQVU7QUFBQSxNQUNWLFVBQVUsQ0FBQyxRQUFRLE1BQU07QUFBQSxNQUN6QixTQUFTLENBQUMsbUJBQW1CO0FBQUEsTUFDN0IsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyx5Q0FBeUM7QUFBQTtBQUFBLElBQ25ELFNBQVMsQ0FBQyxhQUFhLGlCQUFpQjtBQUFBO0FBQUEsRUFDMUM7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
