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
import { cn } from "@/lib/utils";
import type { BatchResult, NSFWResult, VideoResult } from "@/hooks/use-nsfw";
import { Button } from "@/components/ui/button";

interface BatchDetectionResultProps {
  batchResult: BatchResult | null;
  isProcessing: boolean;
  onExportReport?: () => void;
}

const CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
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

export function BatchDetectionResult({
  batchResult,
  isProcessing,
  onExportReport,
}: BatchDetectionResultProps) {
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
            批量检测汇总
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {batchResult.totalFiles}
              </p>
              <p className="text-xs text-muted-foreground mt-1">总文件数</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">
                {batchResult.safeFiles}
              </p>
              <p className="text-xs text-muted-foreground mt-1">安全文件</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-4 text-center">
              <p className="text-2xl font-bold text-destructive">
                {batchResult.nsfwFiles}
              </p>
              <p className="text-xs text-muted-foreground mt-1">不安全文件</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {batchResult.errorFiles}
              </p>
              <p className="text-xs text-muted-foreground mt-1">检测失败</p>
            </div>
          </div>

          {/* 性能信息 */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              总处理时间: {(batchResult.processingTime / 1000).toFixed(2)} 秒
            </span>
          </div>

          {/* 操作按钮 */}
          {onExportReport && (
            <div className="flex gap-3 mt-4">
              <Button
                onClick={onExportReport}
                variant="outline"
                className="gap-2"
                size="sm"
              >
                <Download className="h-4 w-4" />
                导出报告
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 不安全文件列表 */}
      {nsfwItems.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 md:p-6">
          <h4 className="text-sm font-medium text-destructive mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            不安全文件 ({nsfwItems.length})
          </h4>
          <div className="space-y-2">
            {nsfwItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                {item.fileType === "image" ? (
                  <FileImage className="h-4 w-4 text-destructive flex-shrink-0" />
                ) : (
                  <FileVideo className="h-4 w-4 text-destructive flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {item.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(item.result as NSFWResult)?.isNSFW
                      ? `主要类别: ${CATEGORY_LABELS[(item.result as NSFWResult)?.highestCategory || "Neutral"]?.label || "未知"} (${((item.result as NSFWResult)?.highestProbability * 100).toFixed(1)}%)`
                      : `不安全帧: ${(item.result as VideoResult)?.nsfwFrameCount}/${(item.result as VideoResult)?.totalFrames}`}
                  </p>
                </div>
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 安全文件列表 (可折叠) */}
      {safeItems.length > 0 && (
        <details className="rounded-xl border border-border bg-card">
          <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 transition-colors list-none">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-foreground">
              安全文件 ({safeItems.length})
            </span>
          </summary>
          <div className="px-4 pb-4 space-y-2">
            {safeItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
              >
                {item.fileType === "image" ? (
                  <FileImage className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <FileVideo className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {item.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(item.result as NSFWResult)?.isNSFW === false
                      ? `主要类别: ${CATEGORY_LABELS[(item.result as NSFWResult)?.highestCategory || "Neutral"]?.label || "未知"} (${((item.result as NSFWResult)?.highestProbability * 100).toFixed(1)}%)`
                      : `安全帧: ${((item.result as VideoResult)?.totalFrames || 0) - ((item.result as VideoResult)?.nsfwFrameCount || 0)}/${(item.result as VideoResult)?.totalFrames || 0}`}
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </details>
      )}

      {/* 检测失败列表 */}
      {batchResult?.errorFiles && batchResult.errorFiles > 0 && (
        <details className="rounded-xl border border-border bg-card">
          <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 transition-colors list-none">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-foreground">
              检测失败 ({batchResult.errorFiles})
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
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
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
            <p className="text-sm text-muted-foreground">正在检测中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
