"use client";

import { useState, useRef, useCallback } from "react";
import { Shield, Loader2, Scan, RefreshCw, Info } from "lucide-react";
import { useNSFW, type NSFWResult, type VideoFrameResult } from "@/hooks/use-nsfw";
import { FileUpload } from "./file-upload";
import { DetectionResult } from "./detection-result";
import { ProgressBar } from "./progress-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NSFWDetector() {
  const {
    isModelLoading,
    isModelReady,
    loadProgress,
    error,
    checkImage,
    checkVideo,
  } = useNSFW();

  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectProgress, setDetectProgress] = useState(0);
  const [result, setResult] = useState<NSFWResult | null>(null);
  const [videoResults, setVideoResults] = useState<VideoFrameResult[]>([]);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setFileType(selectedFile.type.startsWith("image/") ? "image" : "video");
    setResult(null);
    setVideoResults([]);
    setDetectError(null);
    setDetectProgress(0);
  }, []);

  const handleDetect = useCallback(async () => {
    if (!file || !isModelReady) return;

    setIsDetecting(true);
    setDetectError(null);
    setDetectProgress(0);

    try {
      if (fileType === "image") {
        // 创建图片元素进行检测
        const img = new Image();
        img.crossOrigin = "anonymous";

        const imageResult = await new Promise<NSFWResult>((resolve, reject) => {
          img.onload = async () => {
            try {
              const detectionResult = await checkImage(img);
              resolve(detectionResult);
            } catch (err) {
              reject(err);
            }
          };
          img.onerror = () => reject(new Error("图片加载失败"));
          img.src = URL.createObjectURL(file);
        });

        setResult(imageResult);
        setDetectProgress(100);
      } else if (fileType === "video") {
        // 创建视频元素进行检测
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.preload = "auto";

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error("视频加载失败"));
          video.src = URL.createObjectURL(file);
        });

        // 等待视频可以播放
        await new Promise<void>((resolve) => {
          video.oncanplay = () => resolve();
        });

        // 检测视频帧
        const results: VideoFrameResult[] = [];
        const sampleCount = Math.min(10, Math.ceil(video.duration)); // 最多采样10帧

        await checkVideo(video, sampleCount, (progress, frameResult) => {
          setDetectProgress(progress);
          results.push(frameResult);
          setVideoResults([...results]);
        });

        // 设置最终结果为最危险的帧
        if (results.length > 0) {
          const worstResult = results.reduce((worst, current) =>
            current.highestProbability > worst.highestProbability
              ? current
              : worst
          );
          setResult(worstResult);
        }
      }
    } catch (err) {
      console.error("Detection error:", err);
      setDetectError(err instanceof Error ? err.message : "检测失败");
    } finally {
      setIsDetecting(false);
    }
  }, [file, fileType, isModelReady, checkImage, checkVideo]);

  const handleReset = useCallback(() => {
    setFile(null);
    setFileType(null);
    setResult(null);
    setVideoResults([]);
    setDetectError(null);
    setDetectProgress(0);
    setResetKey(prev => prev + 1);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* 模型状态 */}
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

      {/* 上传区域 */}
      <FileUpload
        key={resetKey}
        onFileSelect={handleFileSelect}
        disabled={!isModelReady || isDetecting}
      />

      {/* 操作按钮 */}
      {file && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDetect}
            disabled={!isModelReady || isDetecting}
            className="flex-1 h-12 text-base gap-2"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                检测中...
              </>
            ) : (
              <>
                <Scan className="h-5 w-5" />
                开始检测
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

      {/* 检测进度 */}
      {isDetecting && (
        <div className="rounded-xl border border-border bg-card p-4">
          <ProgressBar
            value={detectProgress}
            label={
              fileType === "video"
                ? `正在分析视频帧 (${Math.ceil((detectProgress / 100) * 10)}/10)`
                : "正在分析图片"
            }
            size="md"
          />
        </div>
      )}

      {/* 检测错误 */}
      {detectError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{detectError}</p>
        </div>
      )}

      {/* 检测结果 */}
      {(result || videoResults.length > 0) && !isDetecting && (
        <DetectionResult
          result={result}
          videoResults={fileType === "video" ? videoResults : undefined}
          type={fileType || "image"}
        />
      )}

      {/* 使用说明 */}
      <div className="rounded-xl border border-border bg-card/50 p-4 md:p-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">使用说明</p>
            <ul className="list-disc list-inside space-y-1">
              <li>支持检测 JPG、PNG、GIF、WebP 图片和 MP4、WebM 视频</li>
              <li>所有处理均在本地浏览器完成，文件不会上传到服务器</li>
              <li>视频会自动采样多帧进行分析，找出最可能的违规内容</li>
              <li>检测结果包含 5 个分类：正常、绘画、性感、动漫成人、色情</li>
              <li>部署到生产环境后会自动启用 AI 深度学习模型</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
