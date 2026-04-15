import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

// 使用 display: 'swap' 和 preload: false 避免构建时网络请求
const geist = Geist({ 
  subsets: ["latin"],
  display: 'swap',
  preload: false,
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  preload: false,
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'DC工具集 - 开发者创意工具箱',
  description: '一站式 AI 驱动的内容处理工具平台，隐私优先，高效便捷',
  keywords: ['AI', '内容检测', '图片压缩', '文本分析', '视频处理', '开发者工具', '隐私保护', '创意工具'],
  authors: [{ name: 'DC Tools Team', url: 'https://github.com/willasas/safeview' }],
  creator: 'DC Tools Team',
  publisher: 'DC Tools',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://dctools.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DC工具集 - 开发者创意工具箱',
    description: '一站式 AI 驱动的内容处理工具平台，隐私优先，高效便捷',
    url: 'https://dctools.vercel.app',
    siteName: 'DC Tools',
    images: [
      {
        url: 'https://raw.githubusercontent.com/willasas/safeview/main/screenshots/usage-video.gif',
        width: 1920,
        height: 1080,
        alt: 'DC工具集 使用演示',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DC工具集 - 开发者创意工具箱',
    description: '一站式 AI 驱动的内容处理工具平台',
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

import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { I18nProvider } from '@/contexts/i18n-context'
import { CookieConsent } from '@/components/cookie-consent'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <I18nProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SiteHeader />
            <div className="flex-1">
              {children}
            </div>
            <SiteFooter />
            <CookieConsent />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
