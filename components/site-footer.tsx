"use client";

import Link from 'next/link';
import { QrCode, MessageCircle } from 'lucide-react';
import { useI18n } from '@/contexts/i18n-context';

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Disclaimer */}
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive font-medium text-center">
            ⚠️ {t('footer.disclaimer')}
          </p>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">{t('footer.aboutUs')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('footer.about.description')}
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">{t('footer.legalTitle')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.cookiePolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">{t('footer.social.title')}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('footer.social.qq')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <QrCode className="h-4 w-4" />
                  {t('footer.social.wechat')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">{t('footer.contactUs')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t('footer.email')}: contact@dctools.app</li>
              <li>{t('footer.github')}: github.com/dctools</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright').replace('{year}', '2026')}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                {t('footer.terms')}
              </Link>
              <span>·</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                {t('footer.privacy')}
              </Link>
              <span>·</span>
              <span>{t('footer.beian')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
