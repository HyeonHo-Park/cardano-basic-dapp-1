import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      // Dependencies
      "node_modules/",
      ".pnpm-store/",

      // Production builds
      ".next/",
      "out/",
      "dist/",
      "build/",

      // Environment files
      ".env*",

      // Logs
      "*.log",
      "npm-debug.log*",

      // Lock files
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",

      // Cache
      ".eslintcache",
      ".parcel-cache/",

      // IDE
      ".vscode/",
      ".idea/",

      // OS
      ".DS_Store",
      "Thumbs.db",

      // Config files
      "next.config.*",
      "tailwind.config.*",
      "postcss.config.*",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
