import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    open: true,
    // Files live on the Windows drive (/mnt/d) under WSL, where inotify events
    // are not delivered. Polling makes HMR pick up edits so the browser
    // hot-reloads live.
    watch: {
      usePolling: true,
      interval: 200,
    },
  },
  build: {
    outDir: "build",
  },
});
