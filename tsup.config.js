import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts", "src/preload.ts"],
  format: ["cjs", "esm"],
  splitting: false,
  clean: true,
  dts: true,
});
