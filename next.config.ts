import type { NextConfig } from "next";
import path from "path";

// プロジェクトルートを明示（親フォルダの package-lock.json による誤認識を防ぐ）
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
