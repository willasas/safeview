"use client";

import { useState, useCallback, useRef } from "react";
import { Shield, Loader2, Scan, RefreshCw, Info, Settings2, FolderOpen, FileImage, FileVideo, Download, Image as ImageIcon, Film } from "lucide-react";
import { useNSFW, type NSFWResult, type VideoResult, type BatchResult, type BatchFileItem } from "@/hooks/use-nsfw";
import { useI18n } from '@/contexts/i18n-context';
import { BatchFileUpload } from "./batch-file-upload";
import { BatchDetectionResult } from "./batch-detection-result";
import { UserSettingsPanel } from "./user-settings-panel";
import { ProgressBar } from "./progress-bar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function EnhancedNSFWDetector() {
  const { t } = useI18n();
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
  const [batchResetKey, setBatchResetKey] = useState(0);

  // 单文件检测状态
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singlePreview, setSinglePreview] = useState<string | null>(null);
  const [singleFileType, setSingleFileType] = useState<"image" | "video" | null>(null);
  const [singleResult, setSingleResult] = useState<NSFWResult | VideoResult | null>(null);
  const [isSingleDetecting, setIsSingleDetecting] = useState(false);

  const handleFilesSelect = useCallback((files: File[]) => {
    setBatchFiles(files);
    setBatchResult(null);
    setDetectError(null);
    setDetectProgress(0);
  }, []);

  // 单文件处理
  const handleSingleFileSelect = useCallback((file: File) => {
    setSingleFile(file);
    setSingleResult(null);

    // 创建预览
    const url = URL.createObjectURL(file);
    setSinglePreview(url);
    setSingleFileType(file.type.startsWith("image/") ? "image" : "video");
  }, []);

  const clearSingleFile = useCallback(() => {
    if (singlePreview) {
      URL.revokeObjectURL(singlePreview);
    }
    setSingleFile(null);
    setSinglePreview(null);
    setSingleFileType(null);
    setSingleResult(null);
  }, [singlePreview]);

  const handleSingleDetect = useCallback(async () => {
    if (!singleFile || !isModelReady) return;

    setIsSingleDetecting(true);
    try {
      let result: NSFWResult | VideoResult;

      if (singleFileType === "image") {
        // 创建临时图片元素
        const img = new Image();
        img.crossOrigin = "anonymous";
        const url = URL.createObjectURL(singleFile);

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        result = await checkImage(img);
        URL.revokeObjectURL(url);
      } else {
        // 创建临时视频元素
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.playsInline = true;
        const url = URL.createObjectURL(singleFile);

        await new Promise((resolve, reject) => {
          video.onloadeddata = resolve;
          video.onerror = reject;
          video.src = url;
        });

        result = await checkVideo(video);
        URL.revokeObjectURL(url);
      }

      setSingleResult(result);
    } catch (err) {
      console.error("Single file detection error:", err);
      setDetectError(err instanceof Error ? err.message : "检测失败");
    } finally {
      setIsSingleDetecting(false);
    }
  }, [singleFile, singleFileType, isModelReady, checkImage, checkVideo]);

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
    setBatchResetKey(prev => prev + 1);
  }, []);

  const handleMoveNSFWFiles = useCallback(async () => {
    if (!batchResult) return;

    // 获取所有不安全的文件
    const nsfwItems = batchResult.items.filter(
      (item) => item.status === "completed" && (item.result as any)?.isNSFW
    );

    if (nsfwItems.length === 0) {
      alert(t('detector.actions.noUnsafeFound'));
      return;
    }

    try {
      // 请求用户选择目标文件夹
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: "readwrite",
        startIn: "downloads",
      });

      // 创建 nsfw 子文件夹
      const nsfwDirHandle = await dirHandle.getDirectoryHandle("nsfw", {
        create: true,
      });

      let movedCount = 0;
      for (const item of nsfwItems) {
        // 查找原始文件
        const originalFile = batchFiles.find(
          (f) => f.name === item.fileName
        );
        if (!originalFile) continue;

        try {
          // 写入文件到 nsfw 文件夹
          const fileHandle = await nsfwDirHandle.getFileHandle(item.fileName, {
            create: true,
          });
          const writable = await fileHandle.createWritable();
          await writable.write(originalFile);
          await writable.close();
          movedCount++;
        } catch (err) {
          console.error(`Failed to move ${item.fileName}:`, err);
        }
      }

      alert(t('detector.actions.moveSuccess').replace('{count}', String(movedCount)));
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Move files error:", err);
        alert(t('detector.actions.moveFailed'));
      }
    }
  }, [batchResult, batchFiles]);

  const handleExportReport = useCallback(() => {
    if (!batchResult) return;

    const report = {
      title: t('detector.result.reportTitle'),
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
            <span className="text-sm font-medium">{t('detector.model.loading')}</span>
          </div>
          <ProgressBar value={loadProgress} label={t('detector.model.progress')} size="md" />
          <p className="text-xs text-muted-foreground mt-3">
            {t('detector.model.firstLoad')}
          </p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-500 flex shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-500">{t('detector.model.basicMode')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('detector.model.basicModeDesc')}
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
            {t('detector.tabs.batch')}
          </TabsTrigger>
          <TabsTrigger value="single" className="gap-2">
            <FileImage className="h-4 w-4" />
            {t('detector.tabs.single')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batch" className="mt-6 space-y-6">
          {/* 批量上传区域 */}
          <BatchFileUpload
            key={batchResetKey}
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
                    {t('detector.actions.detecting')} ({Math.round(detectProgress)}%)...
                  </>
                ) : (
                  <>
                    <Scan className="h-5 w-5" />
                    {t('detector.actions.startBatch')} ({batchFiles.length} {t('detector.actions.files')})
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
                {t('detector.actions.reset')}
              </Button>
            </div>
          )}

          {/* 批量检测进度 */}
          {isDetecting && (
            <div className="rounded-xl border border-border bg-card p-4">
              <ProgressBar
                value={detectProgress}
                label={`${t('detector.actions.progress')} (${Math.round(detectProgress)}%)`}
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
              onMoveNSFWFiles={batchResult ? handleMoveNSFWFiles : undefined}
            />
          )}
        </TabsContent>

        <TabsContent value="single" className="mt-6 space-y-6">
          {/* 单文件上传 */}
          {!singleFile ? (
            <label
              className="flex flex-col items-center justify-center w-full min-h-70 md:min-h-80 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 hover:border-primary/50 hover:bg-secondary/30"
            >
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleSingleFileSelect(files[0]);
                  }
                }}
                className="hidden"
                disabled={!isModelReady || isSingleDetecting}
              />
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="relative">
                  <div className="p-4 rounded-full bg-primary/10">
                    <ImageIcon className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-secondary">
                    <Film className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-base md:text-lg font-medium text-foreground">
                    {t('detector.upload.clickOrDrag')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('detector.upload.formats')}
                  </p>
                </div>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              {/* 预览区域 */}
              <div className="relative rounded-xl overflow-hidden bg-secondary/50 border border-border">
                <button
                  onClick={clearSingleFile}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  aria-label="清除"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

                {singleFileType === "image" ? (
                  <img
                    src={singlePreview!}
                    alt="预览"
                    className="w-full max-h-100 object-contain"
                  />
                ) : (
                  <video
                    src={singlePreview!}
                    controls
                    className="w-full max-h-100"
                    crossOrigin="anonymous"
                  />
                )}
              </div>

              {/* 检测按钮 */}
              <Button
                onClick={handleSingleDetect}
                disabled={!isModelReady || isSingleDetecting}
                className="w-full h-12 text-base gap-2"
              >
                {isSingleDetecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('detector.actions.detecting')}...
                  </>
                ) : (
                  <>
                    <Scan className="h-5 w-5" />
                    {t('detector.actions.startBatch')}
                  </>
                )}
              </Button>

              {/* 检测结果 */}
              {singleResult && (
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {t('detector.result.singleFile.detectionResult')}
                  </h3>

                  {(singleResult as NSFWResult).predictions ? (
                    // 图片结果
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {(singleResult as NSFWResult).predictions.map((pred) => (
                          <div
                            key={pred.className}
                            className="p-3 rounded-lg bg-secondary/50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{t(`detector.result.categories.${pred.className.toLowerCase()}`)}</span>
                              <span className="text-sm font-mono">
                                {(pred.probability * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-background rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all progress-bar-fill"
                                style={{ "--progress-width": `${pred.probability * 100}%` } as React.CSSProperties}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t('detector.result.verdict.title')}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              (singleResult as NSFWResult).isNSFW
                                ? "bg-red-500/20 text-red-500"
                                : "bg-green-500/20 text-green-500"
                            }`}
                          >
                            {(singleResult as NSFWResult).isNSFW ? t('detector.result.verdict.unsafe') : t('detector.result.verdict.safe')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 视频结果
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <span className="text-muted-foreground">{t('detector.result.singleFile.totalFrames')}</span>
                          <p className="font-mono mt-1">{(singleResult as VideoResult).totalFrames}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <span className="text-muted-foreground">{t('detector.result.singleFile.nsfwFrames')}</span>
                          <p className="font-mono mt-1">{(singleResult as VideoResult).nsfwFrameCount}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t('detector.result.verdict.title')}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              (singleResult as VideoResult).isNSFW
                                ? "bg-red-500/20 text-red-500"
                                : "bg-green-500/20 text-green-500"
                            }`}
                          >
                            {(singleResult as VideoResult).isNSFW ? t('detector.result.verdict.unsafe') : t('detector.result.verdict.safe')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
          {showSettings ? t('detector.actions.hideSettings') : t('detector.actions.showSettings')}
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
            <p className="font-medium text-foreground">{t('detector.info.usageTitle')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('detector.info.batchUsage1')}</li>
              <li>{t('detector.info.batchUsage2')}</li>
              <li>{t('detector.info.batchUsage3')}</li>
              <li>{t('detector.info.batchUsage4')}</li>
              <li>{t('detector.info.batchUsage5')}</li>
              <li>{t('detector.info.categories')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
