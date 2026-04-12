"use client";

import { useState, useCallback } from "react";
import { Upload, Settings2, Download, Image as ImageIcon, Info, X } from "lucide-react";
import { useImageCompress, type CompressSettings } from "@/hooks/use-image-compress";
import { useI18n } from '@/contexts/i18n-context';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ProgressBar } from "./progress-bar";
import { cn } from "@/lib/utils";

export function ImageCompressor() {
  const { t } = useI18n();
  const {
    isCompressing,
    progress,
    error,
    results,
    compressBatch,
    downloadSingle,
    downloadAll,
    reset,
  } = useImageCompress();

  const [files, setFiles] = useState<File[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CompressSettings>({
    quality: 70,
    format: 'original',
    resize: {
      maxWidth: 1920,
      maxHeight: 1920,
      maintainAspectRatio: true,
    },
  });

  // 文件选择处理
  const handleFilesSelect = useCallback((selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter(file => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      alert(t('imageCompress.upload.invalidFiles'));
      return;
    }
    setFiles(imageFiles);
    reset();
  }, [reset, t]);

  // 拖拽上传处理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFilesSelect(droppedFiles);
  }, [handleFilesSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // 开始压缩
  const handleCompress = useCallback(async () => {
    if (files.length === 0) return;
    try {
      await compressBatch(files, settings);
    } catch (err) {
      console.error("Compression error:", err);
    }
  }, [files, settings, compressBatch]);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 更新设置
  const updateSetting = (key: keyof CompressSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateResizeSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      resize: {
        ...prev.resize,
        [key]: value,
      } as any,
    }));
  };

  return (
    <div className="space-y-6">
      {/* 文件上传区 */}
      {files.length === 0 ? (
        <label
          className="block cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files || []);
              handleFilesSelect(selectedFiles);
            }}
          />
          <div className="rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 p-8 md:p-12 transition-colors">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-base md:text-lg font-medium text-foreground">
                  {t('imageCompress.upload.clickOrDrag')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('imageCompress.upload.formats')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('imageCompress.upload.maxSize')}
                </p>
              </div>
            </div>
          </div>
        </label>
      ) : (
        <div className="space-y-4">
          {/* 文件列表 */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    {files.length} {t('detector.actions.files')}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiles([]);
                    reset();
                  }}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  {t('imageCompress.actions.reset')}
                </Button>
              </div>
            </div>

            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  {results && results.items[index] && (
                    <div className="text-right">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {formatFileSize(results.items[index].compressedSize)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        -{results.items[index].compressionRatio.toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              onClick={handleCompress}
              disabled={isCompressing}
              className="flex-1 gap-2"
              size="lg"
            >
              {isCompressing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t('imageCompress.actions.compressing')}
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4" />
                  {t('imageCompress.actions.startCompress')}
                </>
              )}
            </Button>

            {results && results.items.length > 0 && (
              <Button
                onClick={() => downloadAll(results)}
                variant="secondary"
                className="gap-2"
                size="lg"
              >
                <Download className="h-4 w-4" />
                {t('imageCompress.actions.downloadZip')}
              </Button>
            )}
          </div>

          {/* 进度条 */}
          {isCompressing && (
            <ProgressBar
              value={progress}
              label={t('imageCompress.actions.compressing')}
            />
          )}
        </div>
      )}

      {/* 设置面板切换按钮 */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="gap-2"
        >
          <Settings2 className="h-4 w-4" />
          {showSettings ? t('detector.settings.title') : t('detector.settings.title')}
        </Button>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{t('imageCompress.settings.title')}</h3>
          </div>

          {/* 质量调节 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                {t('imageCompress.settings.quality')}
              </Label>
              <span className="text-sm font-mono text-primary">
                {settings.quality}%
              </span>
            </div>
            <Slider
              value={[settings.quality]}
              onValueChange={([value]) => updateSetting('quality', value)}
              min={10}
              max={100}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              {t('imageCompress.settings.qualityDesc')}
            </p>
          </div>

          {/* 格式选择 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              {t('imageCompress.settings.format')}
            </Label>
            <Select
              value={settings.format}
              onValueChange={(value: any) => updateSetting('format', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original (原始格式)</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('imageCompress.settings.formatDesc')}
            </p>
          </div>

          {/* 尺寸调整 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                {t('imageCompress.settings.resize')}
              </Label>
              <Switch
                checked={!!settings.resize}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateSetting('resize', {
                      maxWidth: 1920,
                      maxHeight: 1920,
                      maintainAspectRatio: true,
                    });
                  } else {
                    updateSetting('resize', undefined);
                  }
                }}
              />
            </div>

            {settings.resize && (
              <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      {t('imageCompress.settings.maxWidth')}
                    </Label>
                    <input
                      type="number"
                      value={settings.resize.maxWidth}
                      onChange={(e) => updateResizeSetting('maxWidth', parseInt(e.target.value) || 1920)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      {t('imageCompress.settings.maxHeight')}
                    </Label>
                    <input
                      type="number"
                      value={settings.resize.maxHeight}
                      onChange={(e) => updateResizeSetting('maxHeight', parseInt(e.target.value) || 1920)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.resize.maintainAspectRatio}
                    onCheckedChange={(checked) => updateResizeSetting('maintainAspectRatio', checked)}
                  />
                  <Label className="text-xs text-muted-foreground">
                    {t('imageCompress.settings.maintainRatio')}
                  </Label>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {t('imageCompress.settings.resizeDesc')}
            </p>
          </div>
        </div>
      )}

      {/* 压缩结果汇总 */}
      {results && results.items.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            {t('imageCompress.result.summary')}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t('imageCompress.result.originalSize')}</p>
              <p className="text-lg font-semibold text-foreground">
                {formatFileSize(results.totalOriginalSize)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t('imageCompress.result.compressedSize')}</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatFileSize(results.totalCompressedSize)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t('imageCompress.result.compressionRatio')}</p>
              <p className="text-lg font-semibold text-primary">
                {(100 - (results.totalCompressedSize / results.totalOriginalSize) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t('imageCompress.result.processingTime')}</p>
              <p className="text-lg font-semibold text-foreground">
                {(results.totalProcessingTime / 1000).toFixed(2)} {t('imageCompress.result.seconds')}
              </p>
            </div>
          </div>

          {/* 单个文件下载 */}
          <div className="space-y-2">
            {results.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{item.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(item.originalSize)} → {formatFileSize(item.compressedSize)}
                      <span className="text-green-600 dark:text-green-400 ml-2">
                        (-{item.compressionRatio.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadSingle(item)}
                  className="shrink-0 gap-2"
                >
                  <Download className="h-3 w-3" />
                  {t('imageCompress.actions.singleDownload')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* 使用说明 */}
      <div className="rounded-xl border border-border bg-card/50 p-4 md:p-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{t('imageCompress.info.usageTitle')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('imageCompress.info.usage1')}</li>
              <li>{t('imageCompress.info.usage2')}</li>
              <li>{t('imageCompress.info.usage3')}</li>
              <li>{t('imageCompress.info.usage4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
