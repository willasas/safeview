"use client";

import { useCallback, useState } from "react";
import { Upload, FolderOpen, FileImage, FileVideo, X, FolderTree } from "lucide-react";
import { useI18n } from '@/contexts/i18n-context';
import { cn } from "@/lib/utils";

interface BatchFileUploadProps {
  onFilesSelect: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export function BatchFileUpload({
  onFilesSelect,
  accept = "image/*,video/*",
  disabled = false,
  className,
}: BatchFileUploadProps) {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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

      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
      );

      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        onFilesSelect(validFiles);
      } else {
        alert(t('detector.upload.invalidFiles'));
      }
    },
    [disabled, onFilesSelect]
  );

  const handleFolderInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const validFiles = Array.from(files).filter(
          (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
        );
        if (validFiles.length > 0) {
          setSelectedFiles(validFiles);
          onFilesSelect(validFiles);
        } else {
          alert(t('detector.upload.noValidFiles'));
        }
      }
    },
    [onFilesSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const validFiles = Array.from(files).filter(
          (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
        );
        if (validFiles.length > 0) {
          setSelectedFiles(validFiles);
          onFilesSelect(validFiles);
        }
      }
    },
    [onFilesSelect]
  );

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));
  const videoFiles = selectedFiles.filter((f) => f.type.startsWith("video/"));

  return (
    <div className={cn("w-full", className)}>
      {selectedFiles.length > 0 ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* 文件列表头部 */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <FolderTree className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  已选择 {selectedFiles.length} 个文件
                </p>
                <p className="text-xs text-muted-foreground">
                  {imageFiles.length} 张图片，{videoFiles.length} 个视频
                </p>
              </div>
            </div>
            <button
              onClick={clearFiles}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="清除文件"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* 文件列表 */}
          <div className="max-h-60 overflow-y-auto p-4 space-y-2">
            {imageFiles.map((file, index) => (
              <div
                key={`img-${index}`}
                className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50"
              >
                <FileImage className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-sm text-foreground truncate flex-1">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
            {videoFiles.map((file, index) => (
              <div
                key={`vid-${index}`}
                className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50"
              >
                <FileVideo className="h-4 w-4 text-purple-500 shrink-0" />
                <span className="text-sm text-foreground truncate flex-1">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
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
            multiple
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          <input
            type="file"
            accept={accept}
            // @ts-ignore - webkitdirectory is not in standard types
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderInput}
            className="hidden"
            disabled={disabled}
            id="folder-input"
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
                <FileImage className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="absolute -bottom-1 -left-1 p-1.5 rounded-full bg-secondary">
                <FileVideo className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-base md:text-lg font-medium text-foreground">
                {t('detector.upload.dragDrop')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('detector.upload.supportText')}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">
                {t('detector.upload.formats')}
              </span>
              <label
                htmlFor="folder-input"
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium cursor-pointer hover:bg-primary/20 transition-colors",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                {t('detector.upload.selectFolder')}
              </label>
            </div>
          </div>
        </label>
      )}
    </div>
  );
}
