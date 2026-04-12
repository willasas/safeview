"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as nsfwjs from "nsfwjs";

// 全局标志：防止 TF.js 后端重复注册警告
let tfBackendInitialized = false;

// 抑制 TensorFlow.js 的内核注册警告和 NSFW.js 的模型加载日志
if (typeof window !== "undefined" && !(globalThis as any).__safeview_logs_patched) {
  (globalThis as any).__safeview_logs_patched = true;

  // 过滤 console.warn
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = String(args[0] || "");
    if (msg.includes("already registered")) return;
    originalWarn.apply(console, args);
  };

  // 过滤 console.log / console.info（NSFW.js 的模型提示）
  const originalLog = console.log;
  const originalInfo = console.info;
  const filterNSFWLogs = (...args: any[]) => {
    const msg = String(args[0] || "");
    if (msg.includes("modelOrUrl") || msg.includes("MobileNetV2")) return;
    originalLog.apply(console, args);
  };
  console.log = filterNSFWLogs;
  console.info = filterNSFWLogs;

  // 过滤浏览器扩展错误（不影响功能）
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const msg = String(args[0] || "");
    // 过滤浏览器扩展错误和 React/Next.js 开发警告
    if (
      msg.includes("message port closed") ||
      msg.includes("runtime.lastError") ||
      msg.includes("Encountered a script tag") ||
      msg.includes("next-themes")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

// NSFW.js 的分类结果类型
export interface NSFWPrediction {
  className: "Drawing" | "Hentai" | "Neutral" | "Porn" | "Sexy";
  probability: number;
}

// 模型配置
export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  url: string;
  size?: number; // 图像尺寸，InceptionV3 为 299，MobileNetV2 为 224
  thresholds: Thresholds;
}

export interface Thresholds {
  Porn: number;
  Hentai: number;
  Sexy: number;
  combinedThreshold?: number; // 综合判定阈值
}

// 批量检测文件项
export interface BatchFileItem {
  file: File;
  fileName: string;
  fileType: "image" | "video";
  status: "pending" | "processing" | "completed" | "error";
  result?: NSFWResult | VideoResult;
  error?: string;
  progress?: number;
}

// 批量检测结果汇总
export interface BatchResult {
  totalFiles: number;
  processedFiles: number;
  nsfwFiles: number;
  safeFiles: number;
  errorFiles: number;
  items: BatchFileItem[];
  processingTime: number;
}

export interface NSFWResult {
  predictions: NSFWPrediction[];
  isNSFW: boolean;
  nsfwScore: number; // 综合 NSFW 评分 (0-1)
  highestCategory: string;
  highestProbability: number;
  processingTime: number;
}

export interface VideoFrameResult extends NSFWResult {
  timestamp: number;
  frameIndex: number;
}

export interface VideoResult {
  frames: VideoFrameResult[];
  isNSFW: boolean;
  nsfwScore: number;
  nsfwFrameCount: number;
  totalFrames: number;
  worstFrame: VideoFrameResult;
  processingTime: number;
}

// 用户自定义设置
export interface UserSettings {
  modelId: string;
  pornThreshold: number;
  hentaiThreshold: number;
  sexyThreshold: number;
  combinedThreshold: number; // 综合判定：Porn + Hentai 的加权和
  videoSampleFrames: number;
  enableHentaiOnly: boolean; // 是否仅检测动漫成人
  enableBatchMode: boolean; // 批量检测模式
}

// 默认设置
const DEFAULT_SETTINGS: UserSettings = {
  modelId: "default",
  pornThreshold: 0.3,
  hentaiThreshold: 0.3,
  sexyThreshold: 0.5,
  combinedThreshold: 0.15, // Porn*0.7 + Hentai*0.3 > 0.15 则判定为 NSFW
  videoSampleFrames: 20,
  enableHentaiOnly: false,
  enableBatchMode: false,
};

// 可用的模型列表（基于 nsfwjs 4.x 官方提供的三种内置模型）
export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "default",
    name: "MobileNetV2 (默认)",
    description: "轻量级模型，速度快，适合大多数场景 (推荐)",
    url: "",
    size: 224,
    thresholds: { Porn: 0.3, Hentai: 0.3, Sexy: 0.5, combinedThreshold: 0.15 },
  },
  {
    id: "inception_v3",
    name: "InceptionV3 (高精度)",
    description: "准确度更高（93%），但模型较大，加载较慢",
    url: "",
    size: 299,
    thresholds: { Porn: 0.25, Hentai: 0.25, Sexy: 0.45, combinedThreshold: 0.12 },
  },
  {
    id: "strict",
    name: "严格模式",
    description: "降低阈值，更敏感地检测不安全内容，减少漏报",
    url: "",
    size: 224,
    thresholds: { Porn: 0.15, Hentai: 0.15, Sexy: 0.3, combinedThreshold: 0.08 },
  },
  {
    id: "relaxed",
    name: "宽松模式",
    description: "提高阈值，减少误报，适合宽松场景",
    url: "",
    size: 224,
    thresholds: { Porn: 0.5, Hentai: 0.5, Sexy: 0.7, combinedThreshold: 0.25 },
  },
  {
    id: "hentai-focused",
    name: "动漫成人专注模式",
    description: "针对动漫成人内容优化，降低 Hentai 检测阈值",
    url: "",
    size: 224,
    thresholds: { Porn: 0.3, Hentai: 0.15, Sexy: 0.5, combinedThreshold: 0.1 },
  },
];

// 获取当前模型的阈值配置
function getModelThresholds(modelId: string, settings: UserSettings): Thresholds {
  const model = AVAILABLE_MODELS.find(m => m.id === modelId);
  return {
    Porn: settings.pornThreshold,
    Hentai: settings.hentaiThreshold,
    Sexy: settings.sexyThreshold,
    combinedThreshold: settings.combinedThreshold,
  };
}

// 综合 NSFW 评分算法
function calculateNSFWScore(
  predictions: NSFWPrediction[],
  thresholds: Thresholds,
  settings: UserSettings
): { isNSFW: boolean; nsfwScore: number } {
  const porn = predictions.find(p => p.className === "Porn")?.probability || 0;
  const hentai = predictions.find(p => p.className === "Hentai")?.probability || 0;
  const sexy = predictions.find(p => p.className === "Sexy")?.probability || 0;

  // 方法1: 单项阈值判定
  const singleThresholdHit =
    porn >= thresholds.Porn ||
    hentai >= thresholds.Hentai ||
    (settings.enableHentaiOnly ? false : sexy >= thresholds.Sexy);

  // 方法2: 综合评分 (Porn权重0.7, Hentai权重0.3)
  const combinedScore = porn * 0.7 + hentai * 0.3;
  const combinedHit = combinedScore >= (thresholds.combinedThreshold || 0.15);

  // 方法3: 用户自定义 - 仅检测 Hentai
  const hentaiOnlyHit = settings.enableHentaiOnly && hentai >= thresholds.Hentai;

  const isNSFW = singleThresholdHit || combinedHit || hentaiOnlyHit;

  // 综合 NSFW 评分 (0-1)，用于排序和可视化
  const nsfwScore = Math.min(1, combinedScore * 2 + (sexy * 0.1));

  return { isNSFW, nsfwScore };
}

export function useNSFW(initialSettings?: Partial<UserSettings>) {
  const [settings, setSettings] = useState<UserSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  }));
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<nsfwjs.NSFWJS | null>(null);
  const currentModelIdRef = useRef<string>("default");
  const initStartedRef = useRef(false);

  // 初始化模型
  const initModel = useCallback(async (modelId?: string) => {
    const targetModelId = modelId || settings.modelId;

    // 如果模型已加载且是同一个模型，直接返回
    if (modelRef.current && currentModelIdRef.current === targetModelId) return;

    // 如果正在加载且是同一个模型，等待
    if (isModelLoading && currentModelIdRef.current === targetModelId) return;

    initStartedRef.current = true;
    setIsModelLoading(true);
    setError(null);
    setLoadProgress(0);

    try {
      setLoadProgress(10);

      // 设置 TensorFlow.js 后端（仅初始化一次）
      if (!tfBackendInitialized) {
        await tf.ready();
        setLoadProgress(20);

        try {
          await tf.setBackend("webgl");
          await tf.ready();
        } catch (webglError) {
          console.warn("WebGL backend unavailable, falling back to CPU.");
          await tf.setBackend("cpu");
          await tf.ready();
        }
        tfBackendInitialized = true;
      }

      setLoadProgress(30);

      // 获取模型配置
      const modelConfig = AVAILABLE_MODELS.find(m => m.id === targetModelId) || AVAILABLE_MODELS[0];

      // 加载模型
      try {
        if (modelConfig.url) {
          // 加载自定义模型 URL
          const options = modelConfig.size ? { size: modelConfig.size } : undefined;
          const model = await nsfwjs.load(modelConfig.url, options);
          modelRef.current = model;
        } else if (modelConfig.id === "inception_v3") {
          // 加载内置 InceptionV3 模型
          const model = await nsfwjs.load("InceptionV3", { size: 299 });
          modelRef.current = model;
        } else {
          // 使用默认 MobileNetV2 模型
          const model = await nsfwjs.load();
          modelRef.current = model;
        }
      } catch (externalModelError) {
        // 外部模型加载失败时，回退到默认模型
        console.warn(`Failed to load external model "${modelConfig.name}", falling back to default model.`);
        const model = await nsfwjs.load();
        modelRef.current = model;
      }

      currentModelIdRef.current = targetModelId;
      setLoadProgress(100);
      setIsModelReady(true);
    } catch (err) {
      console.error("Model loading error:", err);
      setError("AI 模型加载失败，将使用基础检测模式");
      setIsModelReady(true);
    } finally {
      setIsModelLoading(false);
    }
  }, [settings.modelId, isModelLoading]);

  // 切换模型
  const switchModel = useCallback(async (modelId: string) => {
    setSettings(prev => ({ ...prev, modelId }));

    // 清除当前模型缓存
    if (modelRef.current) {
      modelRef.current.dispose();
      modelRef.current = null;
    }

    // 重新初始化
    await initModel(modelId);
  }, [initModel]);

  // 更新设置
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // 基础颜色分析（备用方案）
  const analyzeColors = useCallback(
    (imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): NSFWPrediction[] => {
      const canvas = document.createElement("canvas");
      const size = 150;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return [
          { className: "Neutral", probability: 0.85 },
          { className: "Drawing", probability: 0.05 },
          { className: "Sexy", probability: 0.05 },
          { className: "Hentai", probability: 0.03 },
          { className: "Porn", probability: 0.02 },
        ];
      }

      ctx.drawImage(imageElement, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;

      let skinPixels = 0;
      let saturatedPixels = 0;
      const totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const lightness = (max + min) / 2;
        const saturation = max === min ? 0 : (max - min) / (255 - Math.abs(2 * lightness - 255));

        const isSkinRGB = r > 95 && g > 40 && b > 20 &&
                          r > g && r > b &&
                          Math.abs(r - g) > 15;

        const cb = 128 - 0.169 * r - 0.331 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.419 * g - 0.081 * b;
        const isSkinYCbCr = cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;

        if (isSkinRGB || isSkinYCbCr) skinPixels++;
        if (saturation > 0.5) saturatedPixels++;
      }

      const skinRatio = skinPixels / totalPixels;
      const saturatedRatio = saturatedPixels / totalPixels;

      let sexyProb = Math.min(skinRatio * 1.2, 0.5);
      let pornProb = skinRatio > 0.4 ? Math.min((skinRatio - 0.4) * 2, 0.4) : 0;
      const hentaiProb = saturatedRatio > 0.3 ? Math.min(saturatedRatio * 0.3, 0.2) : 0.02;
      const drawingProb = saturatedRatio > 0.4 && skinRatio < 0.2 ? 0.2 : 0.05;
      const neutralProb = Math.max(0.1, 1 - sexyProb - pornProb - hentaiProb - drawingProb);

      const total = neutralProb + sexyProb + pornProb + hentaiProb + drawingProb;

      return [
        { className: "Neutral", probability: neutralProb / total },
        { className: "Sexy", probability: sexyProb / total },
        { className: "Porn", probability: pornProb / total },
        { className: "Hentai", probability: hentaiProb / total },
        { className: "Drawing", probability: drawingProb / total },
      ];
    },
    []
  );

  // 检测图片
  const checkImage = useCallback(
    async (
      imageElement: HTMLImageElement | HTMLCanvasElement,
      customSettings?: Partial<UserSettings>
    ): Promise<NSFWResult> => {
      const startTime = performance.now();
      const activeSettings = { ...settings, ...customSettings };
      const thresholds = getModelThresholds(activeSettings.modelId, activeSettings);

      let predictions: NSFWPrediction[];

      if (modelRef.current) {
        const rawPredictions = await modelRef.current.classify(imageElement);
        predictions = rawPredictions.map((p) => ({
          className: p.className as NSFWPrediction["className"],
          probability: p.probability,
        }));
      } else {
        predictions = analyzeColors(imageElement);
      }

      const endTime = performance.now();
      const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
      const { isNSFW, nsfwScore } = calculateNSFWScore(predictions, thresholds, activeSettings);

      return {
        predictions: sortedPredictions,
        isNSFW,
        nsfwScore,
        highestCategory: sortedPredictions[0].className,
        highestProbability: sortedPredictions[0].probability,
        processingTime: endTime - startTime,
      };
    },
    [settings, analyzeColors]
  );

  // 检测视频帧
  const checkVideoFrame = useCallback(
    async (
      videoElement: HTMLVideoElement,
      frameIndex: number,
      customSettings?: Partial<UserSettings>
    ): Promise<VideoFrameResult> => {
      const startTime = performance.now();
      const activeSettings = { ...settings, ...customSettings };
      const thresholds = getModelThresholds(activeSettings.modelId, activeSettings);

      let predictions: NSFWPrediction[];

      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        predictions = analyzeColors(videoElement);
      } else if (modelRef.current) {
        try {
          const rawPredictions = await modelRef.current.classify(videoElement);
          predictions = rawPredictions.map((p) => ({
            className: p.className as NSFWPrediction["className"],
            probability: p.probability,
          }));
        } catch (err) {
          console.error(`Frame ${frameIndex} classification error:`, err);
          predictions = analyzeColors(videoElement);
        }
      } else {
        predictions = analyzeColors(videoElement);
      }

      const endTime = performance.now();
      const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
      const { isNSFW, nsfwScore } = calculateNSFWScore(predictions, thresholds, activeSettings);

      return {
        predictions: sortedPredictions,
        isNSFW,
        nsfwScore,
        highestCategory: sortedPredictions[0].className,
        highestProbability: sortedPredictions[0].probability,
        processingTime: endTime - startTime,
        timestamp: videoElement.currentTime,
        frameIndex,
      };
    },
    [settings, analyzeColors]
  );

  // 检测整个视频
  const checkVideo = useCallback(
    async (
      videoElement: HTMLVideoElement,
      sampleCount?: number,
      onProgress?: (progress: number, result: VideoFrameResult) => void,
      customSettings?: Partial<UserSettings>
    ): Promise<VideoResult> => {
      const activeSettings = { ...settings, ...customSettings };
      const thresholds = getModelThresholds(activeSettings.modelId, activeSettings);
      const frames = activeSettings.videoSampleFrames || sampleCount || DEFAULT_SETTINGS.videoSampleFrames;

      const results: VideoFrameResult[] = [];
      const duration = videoElement.duration;
      const interval = duration / frames;
      const startTime = performance.now();

      for (let i = 0; i < frames; i++) {
        const targetTime = i * interval;
        videoElement.currentTime = targetTime;

        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            videoElement.removeEventListener("seeked", onSeeked);
            resolve();
          };
          videoElement.addEventListener("seeked", onSeeked);
        });

        await new Promise(requestAnimationFrame);

        const result = await checkVideoFrame(videoElement, i, customSettings);
        results.push(result);

        if (onProgress) {
          onProgress(((i + 1) / frames) * 100, result);
        }
      }

      const endTime = performance.now();
      const nsfwFrames = results.filter(r => r.isNSFW);
      const worstFrame = results.reduce((worst, current) =>
        current.nsfwScore > worst.nsfwScore ? current : worst
      );

      // 视频整体判定：综合评分 + 不安全帧比例
      const nsfwRatio = nsfwFrames.length / results.length;
      const avgNSFWScore = results.reduce((sum, r) => sum + r.nsfwScore, 0) / results.length;
      const videoIsNSFW = nsfwRatio > 0.15 || avgNSFWScore > 0.3 || worstFrame.isNSFW;
      const videoNSFWScore = Math.max(worstFrame.nsfwScore, avgNSFWScore * 1.2);

      return {
        frames: results,
        isNSFW: videoIsNSFW,
        nsfwScore: videoNSFWScore,
        nsfwFrameCount: nsfwFrames.length,
        totalFrames: frames,
        worstFrame,
        processingTime: endTime - startTime,
      };
    },
    [settings, checkVideoFrame]
  );

  // 批量检测文件
  const checkBatchFiles = useCallback(
    async (
      files: File[],
      onProgress?: (
        processed: number,
        total: number,
        currentItem: BatchFileItem,
        results: BatchFileItem[]
      ) => void
    ): Promise<BatchResult> => {
      const startTime = performance.now();
      const items: BatchFileItem[] = files.map(file => ({
        file,
        fileName: file.name,
        fileType: file.type.startsWith("image/") ? "image" : "video",
        status: "pending",
      }));

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.status = "processing";
        item.progress = 0;

        try {
          if (item.fileType === "image") {
            const img = new Image();
            img.crossOrigin = "anonymous";

            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error("图片加载失败"));
              img.src = URL.createObjectURL(item.file);
            });

            item.result = await checkImage(img);
            item.status = "completed";
            item.progress = 100;

            URL.revokeObjectURL(img.src);
          } else {
            const video = document.createElement("video");
            video.crossOrigin = "anonymous";
            video.muted = true;
            video.preload = "auto";

            await new Promise<void>((resolve, reject) => {
              video.onloadedmetadata = () => resolve();
              video.onerror = () => reject(new Error("视频加载失败"));
              video.src = URL.createObjectURL(item.file);
            });

            await new Promise<void>((resolve) => {
              video.oncanplay = () => resolve();
            });

            item.result = await checkVideo(video, undefined, (progress) => {
              item.progress = progress;
            });
            item.status = "completed";
            item.progress = 100;

            URL.revokeObjectURL(video.src);
          }
        } catch (err) {
          item.status = "error";
          item.error = err instanceof Error ? err.message : "检测失败";
          item.progress = 0;
        }

        if (onProgress) {
          onProgress(i + 1, items.length, item, items);
        }
      }

      const endTime = performance.now();
      const nsfwFiles = items.filter(item =>
        item.status === "completed" && (
          (item.result as NSFWResult)?.isNSFW ||
          (item.result as VideoResult)?.isNSFW
        )
      ).length;
      const errorFiles = items.filter(item => item.status === "error").length;
      const processedFiles = items.filter(item => item.status === "completed").length;

      return {
        totalFiles: items.length,
        processedFiles,
        nsfwFiles,
        safeFiles: processedFiles - nsfwFiles,
        errorFiles,
        items,
        processingTime: endTime - startTime,
      };
    },
    [checkImage, checkVideo]
  );

  // 自动初始化
  useEffect(() => {
    initModel();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    settings,
    updateSettings,
    isModelLoading,
    isModelReady,
    loadProgress,
    error,
    initModel,
    switchModel,
    checkImage,
    checkVideoFrame,
    checkVideo,
    checkBatchFiles,
    availableModels: AVAILABLE_MODELS,
  };
}
