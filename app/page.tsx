"use client";

import Link from 'next/link';
import { Shield, Image, FileText, Video, CreditCard, QrCode, Wifi, Scan, Barcode } from 'lucide-react';
import { useI18n } from '@/contexts/i18n-context';

export default function Home() {
  const { t } = useI18n();

  const tools = [
    {
      title: t('home.safeViewCard.title'),
      description: t('home.safeViewCard.description'),
      tag: t('home.safeViewCard.tag'),
      href: '/tools/nsfw-detector',
      icon: Shield,
      color: 'from-red-500/10 to-orange-500/10',
      iconColor: 'text-red-600 dark:text-red-400',
      tagColor: 'bg-red-500/20 text-red-700 dark:text-red-300',
    },
    {
      title: t('home.imageCompressCard.title'),
      description: t('home.imageCompressCard.description'),
      tag: t('home.imageCompressCard.tag'),
      href: '/tools/image-compress',
      icon: Image,
      color: 'from-blue-500/10 to-cyan-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
      tagColor: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    },
    {
      title: t('home.textAnalysisCard.title'),
      description: t('home.textAnalysisCard.description'),
      tag: t('home.textAnalysisCard.tag'),
      href: '/tools/text-analysis',
      icon: FileText,
      color: 'from-green-500/10 to-emerald-500/10',
      iconColor: 'text-green-600 dark:text-green-400',
      tagColor: 'bg-green-500/20 text-green-700 dark:text-green-300',
    },
    {
      title: t('home.videoProcessCard.title'),
      description: t('home.videoProcessCard.description'),
      tag: t('home.videoProcessCard.tag'),
      href: '#',
      icon: Video,
      color: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-600 dark:text-purple-400',
      tagColor: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    },
    {
      title: t('home.paymentMergeQRCard.title'),
      description: t('home.paymentMergeQRCard.description'),
      tag: t('home.paymentMergeQRCard.tag'),
      href: '/tools/payment-merge-qr',
      icon: CreditCard,
      color: 'from-emerald-500/10 to-teal-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      tagColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    },
    {
      title: t('home.onlineQRCard.title'),
      description: t('home.onlineQRCard.description'),
      tag: t('home.onlineQRCard.tag'),
      href: '/tools/online-qr-generator',
      icon: QrCode,
      color: 'from-indigo-500/10 to-purple-500/10',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      tagColor: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
    },
    {
      title: t('home.wifiQRCard.title'),
      description: t('home.wifiQRCard.description'),
      tag: t('home.wifiQRCard.tag'),
      href: '/tools/wifi-qr-generator',
      icon: Wifi,
      color: 'from-cyan-500/10 to-blue-500/10',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      tagColor: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
    },
    {
      title: t('home.qrDecoderCard.title'),
      description: t('home.qrDecoderCard.description'),
      tag: t('home.qrDecoderCard.tag'),
      href: '/tools/qr-decoder',
      icon: Scan,
      color: 'from-pink-500/10 to-rose-500/10',
      iconColor: 'text-pink-600 dark:text-pink-400',
      tagColor: 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
    },
    {
      title: t('home.barcodeCard.title'),
      description: t('home.barcodeCard.description'),
      tag: t('home.barcodeCard.tag'),
      href: '/tools/barcode-generator',
      icon: Barcode,
      color: 'from-amber-500/10 to-orange-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
      tagColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Shield className="h-4 w-4" />
            {t('common.tagline')}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-balance">
            {t('home.title')}
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t('home.description')}
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            {t('home.latestTools')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={index}
                  href={tool.href}
                  prefetch={true}
                  className={`group relative rounded-xl border border-border bg-gradient-to-br ${tool.color} p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  {/* Tag Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tool.tagColor}`}>
                      {tool.tag}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    <div className={`inline-flex p-3 rounded-lg bg-background/50 ${tool.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
