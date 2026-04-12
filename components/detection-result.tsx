"use client";

import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NSFWResult, VideoFrameResult } from "@/hooks/use-nsfw";

interface DetectionResultProps {
  result: NSFWResult | null;
  videoResults?: VideoFrameResult[];
  type: "image" | "video";
}

const CATEGORY_LABELS: Record<string, { label: string; description: string }> =
  {
    Drawing: { label: "绘画/卡通", description: "手绘或动画内容" },
    Hentai: { label: "动漫成人", description: "动漫风格的成人内容" },
    Neutral: { label: "正常", description: "普通安全内容" },
    Porn: { label: "色情", description: "成人色情内容" },
    Sexy: { label: "性感", description: "性感但非色情内容" },
  };

const CATEGORY_COLORS: Record<string, string> = {
  Drawing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Hentai: "bg-red-500/20 text-red-400 border-red-500/30",
  Neutral: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Porn: "bg-red-500/20 text-red-400 border-red-500/30",
  Sexy: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function DetectionResult({
  result,
  videoResults,
  type,
}: DetectionResultProps) {
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
              {isNSFW ? "检测到不安全内容" : "内容安全"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {type === "image"
                ? isNSFW
                  ? "该图片可能包含不适宜内容"
                  : "该图片未检测到不安全内容"
                : isNSFW
                  ? `检测到 ${videoAnalysis?.nsfwFrames}/${videoAnalysis?.totalFrames} 帧包含不安全内容`
                  : "该视频未检测到明显的不安全内容"}
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
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium border",
                      CATEGORY_COLORS[pred.className]
                    )}
                  >
                    {CATEGORY_LABELS[pred.className]?.label || pred.className}
                  </span>
                  <span className="text-muted-foreground text-xs hidden sm:inline">
                    {CATEGORY_LABELS[pred.className]?.description}
                  </span>
                </span>
                <span className="font-mono font-medium">
                  {(pred.probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500 progress-bar-fill",
                    pred.className === "Neutral"
                      ? "bg-emerald-500"
                      : pred.className === "Drawing"
                        ? "bg-blue-500"
                        : pred.className === "Sexy"
                          ? "bg-orange-500"
                          : "bg-red-500"
                  )}
                  style={{ "--progress-width": `${pred.probability * 100}%` } as React.CSSProperties}
                />
              </div>
            </div>
          ))}
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
            绿色表示安全，红色表示检测到不安全内容。悬停查看详情。
          </p>
        </div>
      )}
    </div>
  );
}
