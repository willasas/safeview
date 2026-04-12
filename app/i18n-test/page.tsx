"use client";

import { useI18n } from '@/contexts/i18n-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function I18nTestPage() {
  const { t, locale, setLocale } = useI18n();

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            多语言功能测试
          </h1>
          <p className="text-lg text-muted-foreground">
            Multilingual Functionality Test
          </p>
          <Badge variant="outline" className="text-sm">
            Current Locale: {locale}
          </Badge>
        </div>

        {/* Language Switcher Demo */}
        <Card>
          <CardHeader>
            <CardTitle>语言切换演示</CardTitle>
            <CardDescription>点击按钮切换语言，观察页面内容变化</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={() => setLocale('zh')}
                variant={locale === 'zh' ? 'default' : 'outline'}
              >
                切换到中文
              </Button>
              <Button
                onClick={() => setLocale('en')}
                variant={locale === 'en' ? 'default' : 'outline'}
              >
                Switch to English
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Translation Examples */}
        <Card>
          <CardHeader>
            <CardTitle>{t('common.appName')}</CardTitle>
            <CardDescription>{t('common.tagline')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Home Page Translations */}
            <div className="space-y-3">
              <h3 className="font-semibold">首页翻译示例:</h3>
              <div className="grid gap-2">
                <div className="p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">home.title:</span>
                  <p className="mt-1">{t('home.title')}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">home.description:</span>
                  <p className="mt-1">{t('home.description')}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">home.latestTools:</span>
                  <p className="mt-1">{t('home.latestTools')}</p>
                </div>
              </div>
            </div>

            {/* Navigation Translations */}
            <div className="space-y-3">
              <h3 className="font-semibold">导航翻译示例:</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-xs text-muted-foreground mb-1">nav.home</p>
                  <p className="font-medium">{t('nav.home')}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-xs text-muted-foreground mb-1">nav.image</p>
                  <p className="font-medium">{t('nav.image')}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-xs text-muted-foreground mb-1">nav.text</p>
                  <p className="font-medium">{t('nav.text')}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-xs text-muted-foreground mb-1">nav.video</p>
                  <p className="font-medium">{t('nav.video')}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-xs text-muted-foreground mb-1">nav.audio</p>
                  <p className="font-medium">{t('nav.audio')}</p>
                </div>
              </div>
            </div>

            {/* Detector Translations */}
            <div className="space-y-3">
              <h3 className="font-semibold">检测器翻译示例:</h3>
              <div className="grid gap-2">
                <div className="p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">detector.title:</span>
                  <p className="mt-1">{t('detector.title')}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">detector.privacyFirst:</span>
                  <p className="mt-1">{t('detector.privacyFirst')}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">detector.batchDetection:</span>
                  <p className="mt-1">{t('detector.batchDetection')}</p>
                </div>
              </div>
            </div>

            {/* Footer Translations */}
            <div className="space-y-3">
              <h3 className="font-semibold">页脚翻译示例:</h3>
              <div className="grid gap-2">
                <div className="p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">footer.aboutUs:</span>
                  <p className="mt-1">{t('footer.aboutUs')}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">footer.terms:</span>
                  <p className="mt-1">{t('footer.terms')}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">footer.privacy:</span>
                  <p className="mt-1">{t('footer.privacy')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>✅ 所有翻译都来自 messages/zh.json 和 messages/en.json 文件</p>
            <p>✅ 语言选择会保存到 Cookie，刷新页面后仍然保持</p>
            <p>✅ 点击右上角的语言切换器可以在任何页面切换语言</p>
            <p>✅ 使用 t('key.path') 函数在组件中获取翻译文本</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
