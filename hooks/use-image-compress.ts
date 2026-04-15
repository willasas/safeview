/**
 * 图片压缩 Hook
 *
 * 使用 browser-image-compression 库进行图片压缩，支持单张和批量压缩。
 * 提供质量、格式、尺寸等自定义设置，并支持导出为 ZIP 文件。
 *
 * @returns 图片压缩相关的状态和方法
 *
 * @example
 * ```typescript
 * const {
 *   compressImages,
 *   results,
 *   isCompressing,
 *   downloadAsZip
 * } = useImageCompress();
 *
 * 压缩图片
 * await compressImages(files, {
 *   quality: 80,
 *   format: 'webp',
 *   resize: { maxWidth: 1920, maxHeight: 1080 }
 * });
 * ```
 */

import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";

export interface CompressSettings {
  quality: number;        // 1-100
  format: 'jpg' | 'png' | 'webp' | 'original';
  resize?: {
    maxWidth: number;
    maxHeight: number;
    maintainAspectRatio: boolean;
  };
}

export interface CompressResult {
  originalFile: File;
  compressedBlob: Blob;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  processingTime: number;
  previewUrl?: string;
}

export interface BatchCompressResult {
  items: CompressResult[];
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalProcessingTime: number;
}

export function useImageCompress() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BatchCompressResult | null>(null);

  // 清理预览 URL
  const cleanupUrls = useCallback((results: CompressResult[]) => {
    results.forEach(item => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  }, []);

  // 转换图片格式
  const convertFormat = useCallback((blob: Blob, targetFormat: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // PNG 需要保持透明背景
        if (targetFormat === 'png') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (resultBlob) => {
            URL.revokeObjectURL(url);
            if (resultBlob) {
              resolve(resultBlob);
            } else {
              reject(new Error("Failed to convert format"));
            }
          },
          `image/${targetFormat}`,
          1
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  }, []);

  // 压缩单个图片
  const compressImage = useCallback(async (
    file: File,
    settings: CompressSettings
  ): Promise<CompressResult> => {
    const startTime = performance.now();

    try {
      // 准备压缩选项
      const options: any = {
        maxSizeMB: settings.quality / 100,
        useWebWorker: true,
        onProgress: (progress: number) => {
          // 可以在这里更新单个文件的进度
        },
      };

      // 如果设置了尺寸调整
      if (settings.resize) {
        if (settings.resize.maintainAspectRatio) {
          options.maxWidthOrHeight = Math.max(
            settings.resize.maxWidth,
            settings.resize.maxHeight
          );
        } else {
          options.maxWidthOrHeight = settings.resize.maxWidth;
        }
      }

      // 执行压缩
      const compressedFile = await imageCompression(file, options);

      // 格式转换
      let finalBlob: Blob = compressedFile;
      let finalFormat = settings.format;

      if (settings.format !== 'original') {
        finalBlob = await convertFormat(compressedFile, settings.format);
        finalFormat = settings.format;
      }

      const processingTime = performance.now() - startTime;
      const compressionRatio = (1 - finalBlob.size / file.size) * 100;

      // 生成预览 URL
      const previewUrl = URL.createObjectURL(finalBlob);

      return {
        originalFile: file,
        compressedBlob: finalBlob,
        fileName: file.name,
        originalSize: file.size,
        compressedSize: finalBlob.size,
        compressionRatio,
        format: finalFormat,
        processingTime,
        previewUrl,
      };
    } catch (err: any) {
      throw new Error(`Failed to compress ${file.name}: ${err.message}`);
    }
  }, [convertFormat]);

  // 批量压缩
  const compressBatch = useCallback(async (
    files: File[],
    settings: CompressSettings
  ): Promise<BatchCompressResult> => {
    setIsCompressing(true);
    setProgress(0);
    setError(null);
    setResults(null);

    try {
      const items: CompressResult[] = [];
      let totalOriginalSize = 0;
      let totalCompressedSize = 0;
      let totalProcessingTime = 0;

      // 过滤出图片文件
      const imageFiles = files.filter(file => file.type.startsWith("image/"));

      if (imageFiles.length === 0) {
        throw new Error('No valid image files found');
      }

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];

        const result = await compressImage(file, settings);
        items.push(result);

        totalOriginalSize += result.originalSize;
        totalCompressedSize += result.compressedSize;
        totalProcessingTime += result.processingTime;

        // 更新进度
        setProgress(Math.round(((i + 1) / imageFiles.length) * 100));
      }

      const batchResult: BatchCompressResult = {
        items,
        totalOriginalSize,
        totalCompressedSize,
        totalProcessingTime,
      };

      setResults(batchResult);
      setIsCompressing(false);
      setProgress(100);

      return batchResult;
    } catch (err: any) {
      setError(err.message);
      setIsCompressing(false);
      setProgress(0);
      throw err;
    }
  }, [compressImage]);

  // 下载单个文件
  const downloadSingle = useCallback((result: CompressResult) => {
    const url = URL.createObjectURL(result.compressedBlob);
    const a = document.createElement("a");
    a.href = url;

    // 生成新文件名
    const originalName = result.fileName.replace(/\.[^/.]+$/, "");
    const extension = result.format === 'original'
      ? result.originalFile.name.split('.').pop()
      : result.format;
    a.download = `${originalName}_compressed.${extension}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // 下载所有文件（ZIP）
  const downloadAll = useCallback(async (batchResult: BatchCompressResult) => {
    const zip = new JSZip();

    batchResult.items.forEach((item) => {
      const originalName = item.fileName.replace(/\.[^/.]+$/, "");
      const extension = item.format === 'original'
        ? item.originalFile.name.split('.').pop()
        : item.format;
      const fileName = `${originalName}_compressed.${extension}`;

      zip.file(fileName, item.compressedBlob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed_images.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // 重置
  const reset = useCallback(() => {
    if (results) {
      cleanupUrls(results.items);
    }
    setResults(null);
    setProgress(0);
    setError(null);
    setIsCompressing(false);
  }, [results, cleanupUrls]);

  return {
    isCompressing,
    progress,
    error,
    results,
    compressBatch,
    downloadSingle,
    downloadAll,
    reset,
  };
}
