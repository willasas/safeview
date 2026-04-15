/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO: 修复所有 TypeScript 错误后，将此选项改为 false
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
