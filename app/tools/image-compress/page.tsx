"use client";

import { Suspense, lazy } from "react";
import { Image, Settings, Zap } from "lucide-react";
import { useI18n } from '@/contexts/i18n-context';
import { Skeleton } from "@/components/ui/skeleton";

// 懒加载主组件
const ImageCompressor = lazy(() => import("@/components/image-compressor").then(mod => ({ default: mod.ImageCompressor })));

export default function ImageCompressPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Image className="h-4 w-4" />
            v1.0.0
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight text-balance">
            {t('imageCompress.page.heroTitle')}
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t('imageCompress.page.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <FeatureCard
              icon={<Settings className="h-5 w-5" />}
              title={t('imageCompress.page.featureBatch')}
              description={t('imageCompress.page.featureBatchDesc')}
            />
            <FeatureCard
              icon={<Image className="h-5 w-5" />}
              title={t('imageCompress.page.featureQuality')}
              description={t('imageCompress.page.featureQualityDesc')}
            />
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title={t('imageCompress.page.featureFormat')}
              description={t('imageCompress.page.featureFormatDesc')}
            />
          </div>
        </div>
      </section>

      {/* Main Component with Suspense */}
      <section className="px-4 pb-16 md:pb-24">
        <Suspense fallback={<LoadingSkeleton />}>
          <ImageCompressor />
        </Suspense>
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

function LoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}
