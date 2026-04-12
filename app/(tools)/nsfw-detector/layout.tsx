import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NSFW 内容检测 - DC工具集',
  description: '基于 TensorFlow.js 的本地化 NSFW 内容检测工具，保护隐私，快速高效，支持图片和视频检测',
  keywords: ['AI', 'NSFW', '内容检测', 'TensorFlow.js', '隐私保护', '图片检测', '视频检测', '深度学习'],
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
