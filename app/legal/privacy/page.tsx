"use client";

import { useI18n } from '@/contexts/i18n-context';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('nav.home')}
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-6">
          {t('legal.privacy.title')}
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t('legal.privacy.content')}
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">{t('legal.privacy.section1')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t('legal.privacy.dataCollection')}
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">{t('legal.privacy.section2')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t('legal.privacy.cookies')}
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">{t('legal.privacy.section3')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t('legal.privacy.security')}
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">{t('legal.privacy.section4')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {t('legal.privacy.thirdParty')}
          </p>
        </div>
      </div>
    </main>
  );
}
