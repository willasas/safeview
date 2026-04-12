"use client";

import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useI18n } from '@/contexts/i18n-context';
import { cn } from "@/lib/utils";
import type { NSFWResult, VideoFrameResult } from "@/hooks/use-nsfw";

interface DetectionResultProps {
  result: NSFWResult | null;
  videoResults?: VideoFrameResult[];
  type: "image" | "video";
}

const CATEGORY_LABELS: Record<string, { label: string; description: string }> =
  {
    Drawing: { label: "", description: "" },
    Hentai: { label: "", description: "" },
    Neutral: { label: "", description: "" },
    Porn: { label: "", description: "" },
    Sexy: { label: "", description: "" },
  };

const CATEGORY_COLORS: Record<string, string> = {
  Drawing: "bg-blue-500",
  Hentai: "bg-red-500",
  Neutral: "bg-emerald-500",
  Porn: "bg-red-500",
  Sexy: "bg-orange-500",
};

export function DetectionResult({
  result,
  videoResults,
  type,
}: DetectionResultProps) {
  const { t } = useI18n();

  // 动态设置分类标签
  const categoryLabels: Record<string, { label: string; description: string }> = {
    Drawing: { label: t('detector.result.categories.drawing'), description: t('detector.result.categories.drawingDesc') },
    Hentai: { label: t('detector.result.categories.hentai'), description: t('detector.result.categories.hentaiDesc') },
    Neutral: { label: t('detector.result.categories.neutral'), description: t('detector.result.categories.neutralDesc') },
    Porn: { label: t('detector.result.categories.porn'), description: t('detector.result.categories.pornDesc') },
    Sexy: { label: t('detector.result.categories.sexy'), description: t('detector.result.categories.sexyDesc') },
  };

  if (!result && (!videoResults || videoResults.length === 0)) {
    return null;
  }

  // 视频结果分析
  const videoAnalysis = videoResults
    ? (() => {
        const nsfwFrames = videoResults.filter((r) => r.isNSFW);
        const nsfwRatio = nsfwFrames.length / videoResults.length;
        const avgProcessingTime =
          videoResults.reduce((sum, r) => sum + r.processingTime, 0) /
          videoResults.length;

        return {
          totalFrames: videoResults.length,
          nsfwFrames: nsfwFrames.length,
          nsfwRatio,
          avgProcessingTime,
          isNSFW: nsfwRatio > 0.2, // 超过 20% 的帧是 NSFW
          worstFrame: videoResults.reduce((worst, current) =>
            current.highestProbability > worst.highestProbability
              ? current
              : worst
          ),
        };
      })()
    : null;

  const isNSFW = type === "video" ? videoAnalysis?.isNSFW : result?.isNSFW;

  return (
    <div className="w-full space-y-4">
      {/* 主结果卡片 */}
      <div
        className={cn(
          "rounded-xl border p-4 md:p-6 transition-all duration-300",
          isNSFW
            ? "bg-destructive/10 border-destructive/30"
            : "bg-success/10 border-success/30"
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex shrink-0 p-3 rounded-full",
              isNSFW ? "bg-destructive/20" : "bg-success/20"
            )}
          >
            {isNSFW ? (
              <ShieldAlert className="h-6 w-6 md:h-8 md:w-8 text-destructive" />
            ) : (
              <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-success" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "text-lg md:text-xl font-semibold",
                isNSFW ? "text-destructive" : "text-success"
              )}
            >
              {isNSFW ? t('detector.result.singleFile.unsafeDetected') : t('detector.result.singleFile.safeContent')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {type === "image"
                ? isNSFW
                  ? t('detector.result.singleFile.imageUnsafe')
                  : t('detector.result.singleFile.imageSafe')
                : isNSFW
                  ? t('detector.result.singleFile.videoUnsafe').replace('{nsfw}', String(videoAnalysis?.nsfwFrames)).replace('{total}', String(videoAnalysis?.totalFrames))
                  : t('detector.result.singleFile.videoSafe')}
            </p>
          </div>
        </div>
      </div>

      {/* 详细分析 */}
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          分类概率分析
        </h4>

        <div className="space-y-3">
          {(type === "video" && videoAnalysis
            ? videoAnalysis.worstFrame.predictions
            : result?.predictions
          )?.map((pred) => (
            <div key={pred.className} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">
                  {categoryLabels[pred.className]?.label || pred.className}
                </span>
                <span className="font-mono font-medium text-foreground">
                  {(pred.probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    CATEGORY_COLORS[pred.className] || "bg-primary"
                  )}
                  style={{ width: `${pred.probability * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 判定结果 */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">判定结果</span>
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            isNSFW ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"
          )}>
            {isNSFW ? "不安全" : "安全"}
          </span>
        </div>
      </div>

      {/* 性能信息 */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50">
          <Clock className="h-3.5 w-3.5" />
          <span>
            处理时间:{" "}
            {type === "video"
              ? `平均 ${videoAnalysis?.avgProcessingTime.toFixed(0)}ms/帧`
              : `${result?.processingTime.toFixed(0)}ms`}
          </span>
        </div>

        {type === "video" && videoAnalysis && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              NSFW 帧比例: {(videoAnalysis.nsfwRatio * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* 视频帧详情 */}
      {type === "video" && videoResults && videoResults.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 md:p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">
            帧检测详情
          </h4>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {videoResults.map((frameResult, index) => (
              <div
                key={index}
                className={cn(
                  "aspect-square rounded-lg flex items-center justify-center text-xs font-mono transition-all",
                  frameResult.isNSFW
                    ? "bg-destructive/20 text-destructive border border-destructive/30"
                    : "bg-success/20 text-success border border-success/30"
                )}
                title={`帧 ${index + 1}: ${frameResult.highestCategory} (${(frameResult.highestProbability * 100).toFixed(1)}%)`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {t('detector.result.singleFile.colorLegend')}
          </p>
        </div>
      )}
    </div>
  );
}
