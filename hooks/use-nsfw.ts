"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as nsfwjs from "nsfwjs";

// NSFW.js 的分类结果类型
export interface NSFWPrediction {
  className: "Drawing" | "Hentai" | "Neutral" | "Porn" | "Sexy";
  probability: number;
}

export interface NSFWResult {
  predictions: NSFWPrediction[];
  isNSFW: boolean;
  highestCategory: string;
  highestProbability: number;
  processingTime: number;
}

export interface VideoFrameResult extends NSFWResult {
  timestamp: number;
  frameIndex: number;
}

// NSFW 阈值配置
const NSFW_THRESHOLDS = {
  Porn: 0.3,
  Hentai: 0.3,
  Sexy: 0.5,
};

export function useNSFW() {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<nsfwjs.NSFWJS | null>(null);
  const initStartedRef = useRef(false);

  // 初始化模型
  const initModel = useCallback(async () => {
    if (modelRef.current || isModelLoading || initStartedRef.current) return;

    initStartedRef.current = true;
    setIsModelLoading(true);
    setError(null);
    setLoadProgress(0);

    try {
      setLoadProgress(10);

      // 设置 TensorFlow.js 后端
      await tf.ready();
      setLoadProgress(20);

      try {
        await tf.setBackend("webgl");
        await tf.ready();
      } catch (webglError) {
        console.warn("WebGL backend unavailable, falling back to CPU.", webglError);
        await tf.setBackend("cpu");
        await tf.ready();
      }
      setLoadProgress(30);

      // 使用 nsfwjs 加载模型 - 使用默认的 MobileNetV2 模型
      const model = await nsfwjs.load();

      modelRef.current = model;
      setLoadProgress(100);
      setIsModelReady(true);
    } catch (err) {
      console.error("Model loading error:", err);
      // 如果模型加载失败，使用基于颜色分析的简单方案
      setError("AI 模型加载失败，将使用基础检测模式");
      setIsModelReady(true); // 仍然标记为准备就绪，使用备用方案
    } finally {
      setIsModelLoading(false);
    }
  }, [isModelLoading]);

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

        // RGB 肤色检测
        const isSkinRGB = r > 95 && g > 40 && b > 20 &&
                          r > g && r > b &&
                          Math.abs(r - g) > 15;

        // YCbCr 肤色检测
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

  // 判断是否为 NSFW 内容
  const isNSFWContent = useCallback(
    (predictions: NSFWPrediction[]): boolean => {
      for (const pred of predictions) {
        const threshold =
          NSFW_THRESHOLDS[pred.className as keyof typeof NSFW_THRESHOLDS];
        if (threshold && pred.probability >= threshold) {
          return true;
        }
      }
      return false;
    },
    []
  );

  // 检测图片
  const checkImage = useCallback(
    async (
      imageElement: HTMLImageElement | HTMLCanvasElement
    ): Promise<NSFWResult> => {
      const startTime = performance.now();

      let predictions: NSFWPrediction[];

      if (modelRef.current) {
        // 使用 NSFW.js 模型
        const rawPredictions = await modelRef.current.classify(imageElement);
        predictions = rawPredictions.map((p) => ({
          className: p.className as NSFWPrediction["className"],
          probability: p.probability,
        }));
      } else {
        // 使用备用方案
        predictions = analyzeColors(imageElement);
      }

      const endTime = performance.now();

      const sortedPredictions = [...predictions].sort(
        (a, b) => b.probability - a.probability
      );

      return {
        predictions: sortedPredictions,
        isNSFW: isNSFWContent(predictions),
        highestCategory: sortedPredictions[0].className,
        highestProbability: sortedPredictions[0].probability,
        processingTime: endTime - startTime,
      };
    },
    [isNSFWContent, analyzeColors]
  );

  // 检测视频帧
  const checkVideoFrame = useCallback(
    async (
      videoElement: HTMLVideoElement,
      frameIndex: number
    ): Promise<VideoFrameResult> => {
      const startTime = performance.now();

      let predictions: NSFWPrediction[];

      if (modelRef.current) {
        const rawPredictions = await modelRef.current.classify(videoElement);
        predictions = rawPredictions.map((p) => ({
          className: p.className as NSFWPrediction["className"],
          probability: p.probability,
        }));
      } else {
        predictions = analyzeColors(videoElement);
      }

      const endTime = performance.now();

      const sortedPredictions = [...predictions].sort(
        (a, b) => b.probability - a.probability
      );

      return {
        predictions: sortedPredictions,
        isNSFW: isNSFWContent(predictions),
        highestCategory: sortedPredictions[0].className,
        highestProbability: sortedPredictions[0].probability,
        processingTime: endTime - startTime,
        timestamp: videoElement.currentTime,
        frameIndex,
      };
    },
    [isNSFWContent, analyzeColors]
  );

  // 检测整个视频
  const checkVideo = useCallback(
    async (
      videoElement: HTMLVideoElement,
      sampleCount: number = 10,
      onProgress?: (progress: number, result: VideoFrameResult) => void
    ): Promise<VideoFrameResult[]> => {
      const results: VideoFrameResult[] = [];
      const duration = videoElement.duration;
      const interval = duration / sampleCount;

      for (let i = 0; i < sampleCount; i++) {
        const targetTime = i * interval;
        videoElement.currentTime = targetTime;

        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            videoElement.removeEventListener("seeked", onSeeked);
            resolve();
          };
          videoElement.addEventListener("seeked", onSeeked);
        });

        const result = await checkVideoFrame(videoElement, i);
        results.push(result);

        if (onProgress) {
          onProgress(((i + 1) / sampleCount) * 100, result);
        }
      }

      return results;
    },
    [checkVideoFrame]
  );

  // 自动初始化
  useEffect(() => {
    initModel();
  }, [initModel]);

  return {
    isModelLoading,
    isModelReady,
    loadProgress,
    error,
    initModel,
    checkImage,
    checkVideoFrame,
    checkVideo,
  };
}
