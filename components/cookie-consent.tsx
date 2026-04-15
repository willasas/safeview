"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '@/contexts/i18n-context';
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const { t } = useI18n();
  const [showConsent, setShowConsent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 检查用户是否已经同意过
    const hasConsented = document.cookie.includes('cookie_consent=accepted');
    if (!hasConsented) {
      // 延迟显示，避免页面加载时突兀
      setTimeout(() => setShowConsent(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    // 设置 cookie，有效期 1 年
    document.cookie = 'cookie_consent=accepted; path=/; max-age=31536000';
    setShowConsent(false);
  };

  const handleDecline = () => {
    // 设置拒绝 cookie，有效期 1 年
    document.cookie = 'cookie_consent=declined; path=/; max-age=31536000';
    setShowConsent(false);
  };

  if (!mounted || !showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-xl border border-border bg-card shadow-lg p-4 md:p-6 relative">
          {/* 关闭按钮 */}
          <button
            onClick={handleDecline}
            className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="pr-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              🍪 {t('legal.cookies.title')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {t('legal.cookies.content')} {t('legal.cookies.whatAreCookies')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAccept}
                size="default"
                className="flex-1 sm:flex-none"
              >
                {t('legal.cookies.consent.accept')}
              </Button>
              <Button
                onClick={handleDecline}
                variant="outline"
                size="default"
                className="flex-1 sm:flex-none"
              >
                {t('legal.cookies.consent.decline')}
              </Button>
              <Button
                variant="ghost"
                size="default"
                asChild
                className="flex-1 sm:flex-none"
              >
                <a href="/cookies" className="underline">
                  {t('legal.cookies.consent.learnMore')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
