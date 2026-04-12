import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SafeView - AI 内容安全检测工具',
  description: '基于 TensorFlow.js 的本地化 NSFW 内容检测工具，保护隐私，快速高效，支持图片和视频检测',
  keywords: ['AI', 'NSFW', '内容检测', 'TensorFlow.js', '隐私保护', '图片检测', '视频检测', '深度学习'],
  authors: [{ name: 'SafeView Team', url: 'https://github.com/willasas/safeview' }],
  creator: 'SafeView Team',
  publisher: 'SafeView',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://safeview.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SafeView - AI 内容安全检测工具',
    description: '基于 TensorFlow.js 的本地化 NSFW 内容检测工具，保护隐私，快速高效',
    url: 'https://safeview.vercel.app',
    siteName: 'SafeView',
    images: [
      {
        url: 'https://raw.githubusercontent.com/willasas/safeview/main/screenshots/usage-video.gif',
        width: 1920,
        height: 1080,
        alt: 'SafeView 使用演示',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafeView - AI 内容安全检测工具',
    description: '基于 TensorFlow.js 的本地化 NSFW 内容检测工具',
    images: ['https://raw.githubusercontent.com/willasas/safeview/main/screenshots/usage-video.gif'],
    creator: '@willasas',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
