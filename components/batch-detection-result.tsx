"use client";

import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileImage,
  FileVideo,
  CheckCircle2,
  XCircle,
  Download,
  FolderOpen,
} from "lucide-react";
import { useI18n } from '@/contexts/i18n-context';
import { cn } from "@/lib/utils";
import type { BatchResult, NSFWResult, VideoResult } from "@/hooks/use-nsfw";
import { Button } from "@/components/ui/button";

interface BatchDetectionResultProps {
  batchResult: BatchResult | null;
  isProcessing: boolean;
  onExportReport?: () => void;
  onMoveNSFWFiles?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Drawing: "bg-blue-500/50",
  Hentai: "bg-red-500/50",
  Neutral: "bg-emerald-500/50",
  Porn: "bg-red-500/50",
  Sexy: "bg-orange-500/50",
};

export function BatchDetectionResult({
  batchResult,
  isProcessing,
  onExportReport,
  onMoveNSFWFiles,
}: BatchDetectionResultProps) {
  const { t } = useI18n();

  // 动态设置分类标签
  const categoryLabels: Record<string, string> = {
    Drawing: t('detector.result.categories.drawing'),
    Hentai: t('detector.result.categories.hentai'),
    Neutral: t('detector.result.categories.neutral'),
    Porn: t('detector.result.categories.porn'),
    Sexy: t('detector.result.categories.sexy'),
  };

  if (!batchResult && !isProcessing) {
    return null;
  }

  const nsfwItems = batchResult?.items.filter(item => {
    if (item.status !== "completed") return false;
    const result = item.result;
    return (result as NSFWResult)?.isNSFW || (result as VideoResult)?.isNSFW;
  }) || [];

  const safeItems = batchResult?.items.filter(item => {
    if (item.status !== "completed") return false;
    const result = item.result;
    return !((result as NSFWResult)?.isNSFW || (result as VideoResult)?.isNSFW);
  }) || [];

  return (
    <div className="w-full space-y-6">
      {/* 汇总结果卡片 */}
      {batchResult && (
        <div className="rounded-xl border border-border bg-card p-4 md:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t('detector.result.summary')}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {batchResult.totalFiles}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t('detector.result.totalFiles')}</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">
                {batchResult.safeFiles}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t('detector.result.safeFiles')}</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-4 text-center">
              <p className="text-2xl font-bold text-destructive">
                {batchResult.nsfwFiles}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t('detector.result.unsafeFiles')}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {batchResult.errorFiles}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t('detector.result.failed')}</p>
            </div>
          </div>

          {/* 性能信息 */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t('detector.result.processingTime')}: {(batchResult.processingTime / 1000).toFixed(2)} {t('detector.result.seconds')}
            </span>
          </div>

          {/* 操作按钮 */}
          {(onExportReport || onMoveNSFWFiles) && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {onMoveNSFWFiles && nsfwItems.length > 0 && (
                <Button
                  onClick={onMoveNSFWFiles}
                  variant="default"
                  className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  size="sm"
                >
                  <FolderOpen className="h-4 w-4" />
                  {t('detector.actions.moveToNsfwFolder')} ({nsfwItems.length})
                </Button>
              )}
              {onExportReport && (
                <Button
                  onClick={onExportReport}
                  variant="outline"
                  className="gap-2"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                  {t('detector.actions.exportReport')}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 不安全文件列表 */}
      {nsfwItems.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 md:p-6">
          <h4 className="text-sm font-medium text-destructive mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            {t('detector.result.unsafeFiles')} ({nsfwItems.length})
          </h4>
          <div className="space-y-2">
            {nsfwItems.map((item, index) => {
              const result = item.result as NSFWResult;
              return (
                <div
                  key={index}
                  className="flex flex-col gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <div className="flex items-center gap-3">
                    {item.fileType === "image" ? (
                      <FileImage className="h-4 w-4 text-destructive shrink-0" />
                    ) : (
                      <FileVideo className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {item.fileName}
                      </p>
                    </div>
                    <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  </div>

                  {/* 分类概率条 */}
                  {result?.predictions && (
                    <div className="space-y-1.5 pl-7">
                      {result.predictions.map((pred) => (
                        <div key={pred.className} className="flex items-center gap-2 text-xs">
                          <span className="w-16 text-muted-foreground text-right shrink-0">
                            {categoryLabels[pred.className] || pred.className}
                          </span>
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                CATEGORY_COLORS[pred.className] || "bg-primary/50"
                              )}
                              style={{ width: `${pred.probability * 100}%` }}
                            />
                          </div>
                          <span className="w-10 text-right font-mono text-foreground shrink-0">
                            {(pred.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 判定结果 */}
                  <div className="mt-2 pt-2 border-t border-destructive/20 flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{t('detector.result.verdict.title')}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
                      {t('detector.result.verdict.unsafe')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 安全文件列表 (可折叠) */}
      {safeItems.length > 0 && (
        <details className="rounded-xl border border-border bg-card">
          <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 transition-colors list-none">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-foreground">
              {t('detector.result.safeFiles')} ({safeItems.length})
            </span>
          </summary>
          <div className="px-4 pb-4 space-y-2">
            {safeItems.map((item, index) => {
              const result = item.result as NSFWResult;
              return (
                <div
                  key={index}
                  className="flex flex-col gap-2 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    {item.fileType === "image" ? (
                      <FileImage className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <FileVideo className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {item.fileName}
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  </div>

                  {/* 分类概率条 */}
                  {result?.predictions && (
                    <div className="space-y-1.5 pl-7">
                      {result.predictions.map((pred) => (
                        <div key={pred.className} className="flex items-center gap-2 text-xs">
                          <span className="w-16 text-muted-foreground text-right shrink-0">
                            {categoryLabels[pred.className] || pred.className}
                          </span>
                          <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                CATEGORY_COLORS[pred.className] || "bg-primary/50"
                              )}
                              style={{ width: `${pred.probability * 100}%` }}
                            />
                          </div>
                          <span className="w-10 text-right font-mono text-foreground shrink-0">
                            {(pred.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 判定结果 */}
                  <div className="mt-2 pt-2 border-t border-border flex items-center justify-between pl-7">
                    <span className="text-xs font-medium text-foreground">{t('detector.result.verdict.title')}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-500">
                      {t('detector.result.verdict.safe')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      )}

      {/* 检测失败列表 */}
      {batchResult?.errorFiles && batchResult.errorFiles > 0 && (
        <details className="rounded-xl border border-border bg-card">
          <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 transition-colors list-none">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-foreground">
              {t('detector.result.failed')} ({batchResult.errorFiles})
            </span>
          </summary>
          <div className="px-4 pb-4 space-y-2">
            {batchResult.items
              .filter(item => item.status === "error")
              .map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {item.fileName}
                    </p>
                    <p className="text-xs text-amber-500">{item.error}</p>
                  </div>
                </div>
              ))}
          </div>
        </details>
      )}

      {/* 处理中提示 */}
      {isProcessing && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-sm text-muted-foreground">{t('detector.result.checking')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
