'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/contexts/i18n-context';
import { UploadIcon, CameraIcon, CopyIcon, RefreshCwIcon, CheckIcon, XIcon, FileImageIcon } from 'lucide-react';
import jsQR from 'jsqr';

export default function QRDecoderPage() {
  const { t } = useI18n();
  const [decodedText, setDecodedText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 解码二维码
  const decodeQRCode = useCallback((imageData: ImageData) => {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      setDecodedText(code.data);
      setSuccess(t('qrDecode.decodeSuccess') || '二维码识别成功');
      setError('');
      return true;
    }

    return false;
  }, [t]);

  // 处理图片文件
  const handleImageFile = (file: File) => {
    setError('');
    setSuccess('');
    setDecodedText('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 绘制到canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setError(t('qrDecode.canvasError') || 'Canvas初始化失败');
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // 获取像素数据并解码
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const found = decodeQRCode(imageData);

        if (!found) {
          setError(t('qrDecode.notFound') || '未检测到二维码，请确保图片清晰');
        }

        setPreviewImage(e.target?.result as string);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  // 文件上传处理
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  // 拖拽处理
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 粘贴处理
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          handleImageFile(file);
        }
        break;
      }
    }
  };

  // 启动摄像头扫描
  const startCameraScan = async () => {
    try {
      setError('');
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // 开始扫描循环
        scanFrame();
      }
    } catch (err) {
      console.error('摄像头访问失败:', err);
      setError(t('qrDecode.cameraError') || '无法访问摄像头，请检查权限设置');
      setIsScanning(false);
    }
  };

  // 扫描帧
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 设置canvas尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 绘制视频帧
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 获取像素数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 尝试解码
    const found = decodeQRCode(imageData);

    if (found) {
      // 找到二维码，停止扫描
      stopCameraScan();
    } else {
      // 继续扫描
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  };

  // 停止摄像头扫描
  const stopCameraScan = () => {
    setIsScanning(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // 复制结果
  const copyResult = () => {
    navigator.clipboard.writeText(decodedText);
    setSuccess(t('qrDecode.copySuccess') || '已复制到剪贴板');
  };

  // 重置
  const reset = () => {
    setDecodedText('');
    setError('');
    setSuccess('');
    setPreviewImage('');
    stopCameraScan();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 检测内容类型
  const detectContentType = (text: string): string => {
    if (/^https?:\/\//.test(text)) return 'URL';
    if (/^mailto:/.test(text)) return 'Email';
    if (/^tel:/.test(text)) return 'Phone';
    if (/^sms:/.test(text)) return 'SMS';
    if (/^WIFI:/.test(text)) return 'WiFi';
    if (/^BEGIN:VCARD/.test(text)) return 'vCard';
    if (/^geo:/.test(text)) return 'Location';
    return 'Text';
  };

  const contentType = decodedText ? detectContentType(decodedText) : '';

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl" onPaste={handlePaste}>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{t('qrDecode.pageTitle') || '二维码在线解析'}</h1>
        <p className="text-muted-foreground">{t('qrDecode.pageSubtitle') || '支持图片上传、粘贴和摄像头扫描'}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 左侧：输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('qrDecode.inputTitle') || '输入方式'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 拖拽上传区域 */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors bg-muted/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                aria-label={t('qrDecode.uploadImage') || '上传图片'}
              />
              <FileImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">{t('qrDecode.dragDrop') || '拖拽图片到这里'}</p>
              <p className="text-xs text-muted-foreground">{t('qrDecode.orClick') || '或点击选择文件'}</p>
              <p className="text-xs text-muted-foreground mt-2">{t('qrDecode.supportedFormats') || '支持 PNG, JPG, JPEG, WebP'}</p>
            </div>

            {/* 摄像头扫描 */}
            <div className="space-y-2">
              {!isScanning ? (
                <Button onClick={startCameraScan} className="w-full" variant="outline">
                  <CameraIcon className="w-4 h-4 mr-2" />
                  {t('qrDecode.startCamera') || '启动摄像头扫描'}
                </Button>
              ) : (
                <Button onClick={stopCameraScan} className="w-full" variant="destructive">
                  <XIcon className="w-4 h-4 mr-2" />
                  {t('qrDecode.stopCamera') || '停止扫描'}
                </Button>
              )}

              {isScanning && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full rounded-lg border"
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-primary rounded-lg animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {/* 预览图片 */}
            {previewImage && !isScanning && (
              <div className="space-y-2">
                <p className="text-xs font-medium">{t('qrDecode.preview') || '图片预览'}</p>
                <img src={previewImage} alt="Preview" className="w-full rounded-lg border" />
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <Alert variant="destructive">
                <XIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 成功提示 */}
            {success && !decodedText && (
              <Alert variant="default" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
              </Alert>
            )}

            {/* 重置按钮 */}
            {(decodedText || previewImage) && (
              <Button onClick={reset} variant="outline" className="w-full">
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                {t('qrDecode.reset') || '重新扫描'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 右侧：结果区域 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('qrDecode.resultTitle') || '解析结果'}</CardTitle>
          </CardHeader>
          <CardContent>
            {decodedText ? (
              <div className="space-y-4">
                {/* 内容类型标签 */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{contentType}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {t('qrDecode.contentLength') || '长度'}: {decodedText.length}
                  </span>
                </div>

                {/* 解析内容 */}
                <div className="border rounded-lg p-4 bg-muted/20">
                  <pre className="text-sm whitespace-pre-wrap break-all font-mono">
                    {decodedText}
                  </pre>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button onClick={copyResult} className="flex-1">
                    <CopyIcon className="w-4 h-4 mr-2" />
                    {t('qrDecode.copy') || '复制内容'}
                  </Button>

                  {contentType === 'URL' && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(decodedText, '_blank')}
                    >
                      {t('qrDecode.openLink') || '打开链接'}
                    </Button>
                  )}

                  {contentType === 'Email' && (
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = decodedText}
                    >
                      {t('qrDecode.sendEmail') || '发送邮件'}
                    </Button>
                  )}

                  {contentType === 'Phone' && (
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = decodedText}
                    >
                      {t('qrDecode.callPhone') || '拨打电话'}
                    </Button>
                  )}
                </div>

                {/* 成功提示 */}
                {success && decodedText && (
                  <Alert variant="default" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <FileImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>{t('qrDecode.emptyHint') || '上传图片或启动摄像头以识别二维码'}</p>
                <p className="text-xs mt-2">{t('qrDecode.privacyNote') || '所有处理在浏览器本地完成，保护隐私'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('qrDecode.instructions') || '功能特点'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <UploadIcon className="w-4 h-4" />
                {t('qrDecode.feature1Title') || '多种输入方式'}
              </h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {t('qrDecode.feature1Item1') || '拖拽上传图片'}</li>
                <li>• {t('qrDecode.feature1Item2') || '粘贴剪贴板图片'}</li>
                <li>• {t('qrDecode.feature1Item3') || '摄像头实时扫描'}</li>
                <li>• {t('qrDecode.feature1Item4') || '点击选择文件'}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <CheckIcon className="w-4 h-4" />
                {t('qrDecode.feature2Title') || '智能识别'}
              </h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {t('qrDecode.feature2Item1') || '自动检测内容类型'}</li>
                <li>• {t('qrDecode.feature2Item2') || '支持多种编码格式'}</li>
                <li>• {t('qrDecode.feature2Item3') || '快速准确解码'}</li>
                <li>• {t('qrDecode.feature2Item4') || '显示内容长度'}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <CopyIcon className="w-4 h-4" />
                {t('qrDecode.feature3Title') || '便捷操作'}
              </h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {t('qrDecode.feature3Item1') || '一键复制结果'}</li>
                <li>• {t('qrDecode.feature3Item2') || '直接打开链接'}</li>
                <li>• {t('qrDecode.feature3Item3') || '发送邮件/电话'}</li>
                <li>• {t('qrDecode.feature3Item4') || '纯前端处理，保护隐私'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
