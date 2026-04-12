"use client";

import { Shield, Lock, Zap, FolderOpen } from "lucide-react";
import { EnhancedNSFWDetector } from "@/components/enhanced-nsfw-detector";
import { useI18n } from '@/contexts/i18n-context';

export default function NSFWDetectorPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Shield className="h-4 w-4" />
            v2.0.0
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight text-balance">
            {t('detector.title')}
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t('detector.subtitle')}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <FeatureCard
              icon={<Lock className="h-5 w-5" />}
              title={t('detector.privacyFirst')}
              description={t('detector.privacyDesc')}
            />
            <FeatureCard
              icon={<FolderOpen className="h-5 w-5" />}
              title={t('detector.batchDetection')}
              description={t('detector.batchDesc')}
            />
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title={t('detector.multiModel')}
              description={t('detector.multiModelDesc')}
            />
          </div>
        </div>
      </section>

      {/* Main Detector */}
      <section className="px-4 pb-16 md:pb-24">
        <EnhancedNSFWDetector />
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-3">
      <div className="p-2 rounded-lg bg-primary/10 w-fit text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}
