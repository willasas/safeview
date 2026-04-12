"use client";

import { useCallback, useState } from "react";
import { Upload, ImageIcon, Film, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept = "image/*,video/*",
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [disabled]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    []
  );

  const processFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("请上传图片或视频文件");
      return;
    }

    setFileType(isImage ? "image" : "video");

    // 创建预览
    const url = URL.createObjectURL(file);
    setPreview(url);

    onFileSelect(file);
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFileType(null);
  };

  return (
    <div className={cn("w-full", className)}>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden bg-secondary/50 border border-border">
          <button
            onClick={clearPreview}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            aria-label="清除"
          >
            <X className="h-4 w-4" />
          </button>

          {fileType === "image" ? (
            <img
              src={preview}
              alt="预览"
              className="w-full max-h-100 object-contain"
            />
          ) : (
            <video
              src={preview}
              controls
              className="w-full max-h-100"
              crossOrigin="anonymous"
            />
          )}
        </div>
      ) : (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center w-full min-h-70 md:min-h-80 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-secondary/30",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />

          <div
            className={cn(
              "flex flex-col items-center gap-4 p-6 text-center transition-transform duration-300",
              isDragging && "scale-110"
            )}
          >
            <div className="relative">
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-secondary">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="absolute -bottom-1 -left-1 p-1.5 rounded-full bg-secondary">
                <Film className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-base md:text-lg font-medium text-foreground">
                拖拽文件到这里，或点击上传
              </p>
              <p className="text-sm text-muted-foreground">
                支持 JPG、PNG、GIF、WebP、MP4、WebM 等格式
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 rounded bg-secondary">图片</span>
              <span className="px-2 py-1 rounded bg-secondary">视频</span>
            </div>
          </div>
        </label>
      )}
    </div>
  );
}
