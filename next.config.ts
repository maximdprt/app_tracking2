import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Évite que Next prenne un `package-lock.json` parent (ex. `C:\\Users\\…`) comme racine du workspace. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
