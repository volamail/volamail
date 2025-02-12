import { defineConfig } from "@tanstack/start/config";
import tsConfigPaths from "vite-tsconfig-paths";

const ReactCompilerConfig = {
  target: "18",
};

export default defineConfig({
  vite: {
    plugins: [tsConfigPaths()],
  },
  server: {
    preset: "aws-lambda",
  },
  react: {
    babel: {
      plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
    },
  },
});
