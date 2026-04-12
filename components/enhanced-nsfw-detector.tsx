"use client";

import { useState, useCallback, useRef } from "react";
import { Shield, Loader2, Scan, RefreshCw, Info, Settings2, FolderOpen, FileImage, FileVideo, Download } from "lucide-react";
import { useNSFW, type NSFWResult, type VideoResult, type BatchResult, type BatchFileItem } from "@/hooks/use-nsfw";
import { BatchFileUpload } from "./batch-file-upload";
import { BatchDetectionResult } from "./batch-detection-result";
import { UserSettingsPanel } from "./user-settings-panel";
import { ProgressBar } from "./progress-bar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function EnhancedNSFWDetector() {
  const {
    settings,
    updateSettings,
    isModelLoading,
    isModelReady,
    loadProgress,
    error,
    checkImage,
    checkVideo,
    checkBatchFiles,
    switchModel,
    availableModels,
  } = useNSFW();

  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectProgress, setDetectProgress] = useState(0);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"batch" | "single">("batch");

  const handleFilesSelect = useCallback((files: File[]) => {
    setBatchFiles(files);
    setBatchResult(null);
    setDetectError(null);
    setDetectProgress(0);
  }, []);

  const handleBatchDetect = useCallback(async () => {
    if (batchFiles.length === 0 || !isModelReady) return;

    setIsDetecting(true);
    setDetectError(null);
    setDetectProgress(0);

    try {
      const result = await checkBatchFiles(batchFiles, (processed, total, currentItem) => {
        setDetectProgress((processed / total) * 100);
      });

      setBatchResult(result);
      setDetectProgress(100);
    } catch (err) {
      console.error("Batch detection error:", err);
      setDetectError(err instanceof Error ? err.message : "批量检测失败");
    } finally {
      setIsDetecting(false);
    }
  }, [batchFiles, isModelReady, checkBatchFiles]);

  const handleReset = useCallback(() => {
    setBatchFiles([]);
    setBatchResult(null);
    setDetectError(null);
    setDetectProgress(0);
  }, []);

  const handleExportReport = useCallback(() => {
    if (!batchResult) return;

    const report = {
      title: "SafeView 批量检测报告",
      generatedAt: new Date().toISOString(),
      settings: {
        model: settings.modelId,
        thresholds: {
          porn: settings.pornThreshold,
          hentai: settings.hentaiThreshold,
          combined: settings.combinedThreshold,
        },
      },
      summary: {
        totalFiles: batchResult.totalFiles,
        processedFiles: batchResult.processedFiles,
        nsfwFiles: batchResult.nsfwFiles,
        safeFiles: batchResult.safeFiles,
        errorFiles: batchResult.errorFiles,
        processingTime: batchResult.processingTime,
      },
      files: batchResult.items.map((item) => ({
        fileName: item.fileName,
        fileType: item.fileType,
        status: item.status,
        isNSFW:
          item.status === "completed" &&
          ((item.result as any)?.isNSFW || false),
        nsfwScore:
          item.status === "completed"
            ? (item.result as any)?.nsfwScore || 0
            : 0,
        highestCategory:
          item.status === "completed"
            ? (item.result as any)?.highestCategory || "N/A"
            : "N/A",
        error: item.error || null,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `safeview-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [batchResult, settings]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 模型加载状态 */}
      {isModelLoading && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">正在加载 AI 模型...</span>
          </div>
          <ProgressBar value={loadProgress} label="加载进度" size="md" />
          <p className="text-xs text-muted-foreground mt-3">
            首次加载需要下载约 10MB 的模型文件，请耐心等待
          </p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-500 flex shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-500">基础检测模式</p>
              <p className="text-xs text-muted-foreground mt-1">
                当前使用基于颜色分析的检测方式。部署到生产环境后，将自动启用 AI 模型进行更精准的检测。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 选项卡 */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "batch" | "single")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="batch" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            批量检测
          </TabsTrigger>
          <TabsTrigger value="single" className="gap-2">
            <FileImage className="h-4 w-4" />
            单文件检测
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batch" className="mt-6 space-y-6">
          {/* 批量上传区域 */}
          <BatchFileUpload
            onFilesSelect={handleFilesSelect}
            disabled={!isModelReady || isDetecting}
          />

          {/* 操作按钮 */}
          {batchFiles.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleBatchDetect}
                disabled={!isModelReady || isDetecting || batchFiles.length === 0}
                className="flex-1 h-12 text-base gap-2"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    检测中 ({Math.round(detectProgress)}%)...
                  </>
                ) : (
                  <>
                    <Scan className="h-5 w-5" />
                    开始批量检测 ({batchFiles.length} 个文件)
                  </>
                )}
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isDetecting}
                className="h-12 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                重新选择
              </Button>
            </div>
          )}

          {/* 批量检测进度 */}
          {isDetecting && (
            <div className="rounded-xl border border-border bg-card p-4">
              <ProgressBar
                value={detectProgress}
                label={`正在检测 (${Math.round(detectProgress)}%)`}
                size="md"
              />
            </div>
          )}

          {/* 批量检测结果 */}
          {(batchResult || isDetecting) && (
            <BatchDetectionResult
              batchResult={batchResult}
              isProcessing={isDetecting}
              onExportReport={batchResult ? handleExportReport : undefined}
            />
          )}
        </TabsContent>

        <TabsContent value="single" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Info className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              单文件检测功能已集成到批量检测中。
              <br />
              选择一个文件即可进行单文件检测。
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* 设置面板切换 */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="gap-2"
        >
          <Settings2 className="h-4 w-4" />
          {showSettings ? "隐藏设置" : "检测设置"}
        </Button>
      </div>

      {/* 用户自定义设置面板 */}
      {showSettings && (
        <UserSettingsPanel
          settings={settings}
          availableModels={availableModels}
          onSettingsChange={async (newSettings) => {
            updateSettings(newSettings);
            // 如果切换了模型，需要重新加载
            if (newSettings.modelId && newSettings.modelId !== settings.modelId) {
              await switchModel(newSettings.modelId);
            }
          }}
        />
      )}

      {/* 检测错误 */}
      {detectError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{detectError}</p>
        </div>
      )}

      {/* 使用说明 */}
      <div className="rounded-xl border border-border bg-card/50 p-4 md:p-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">功能说明</p>
            <ul className="list-disc list-inside space-y-1">
              <li>支持批量检测图片和视频文件</li>
              <li>可选择文件夹进行批量检测</li>
              <li>支持多种 AI 模型和阈值自定义</li>
              <li>可导出 JSON 格式检测报告</li>
              <li>所有处理均在本地浏览器完成，文件不会上传到服务器</li>
              <li>检测结果包含 5 个分类：正常、绘画、性感、动漫成人、色情</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
