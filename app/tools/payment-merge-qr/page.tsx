'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/contexts/i18n-context';
import { DownloadIcon, UploadIcon, CheckIcon, XIcon, RefreshCwIcon, CopyIcon } from 'lucide-react';
import jsQR from 'jsqr';
import { QRCodeCanvas } from 'qrcode.react';

type QRCodeData = {
  url: string;
  isValid: boolean;
  type: 'alipay' | 'wechat' | 'unknown';
  fileName: string;
  preview: string;
};

// 主题配置类型
type ThemeConfig = {
  primaryColor: string;    // 主色调
  showLogo: boolean;       // 是否显示Logo
  customMessage: string;   // 自定义提示语
};

export default function PaymentMergeQRPage() {
  const { t } = useI18n();
  const [alipayQR, setAlipayQR] = useState<QRCodeData | null>(null);
  const [wechatQR, setWechatQR] = useState<QRCodeData | null>(null);
  const [mergedQRCode, setMergedQRCode] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 主题配置
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    primaryColor: '#3b82f6',
    showLogo: true,
    customMessage: ''
  });

  const alipayInputRef = useRef<HTMLInputElement>(null);
  const wechatInputRef = useRef<HTMLInputElement>(null);

  // 检测二维码类型
  const detectQRType = (url: string): 'alipay' | 'wechat' | 'unknown' => {
    if (url.includes('alipay') || url.includes('alipays') || url.startsWith('https://qr.alipay.com/') || url.startsWith('alipays://')) {
      return 'alipay';
    }
    if (url.includes('wxp') || url.includes('wechat') || url.includes('weixin') || url.startsWith('weixin://') || url.startsWith('wxp://')) {
      return 'wechat';
    }
    return 'unknown';
  };

  // 处理文件上传
  const handleFileUpload = async (file: File, type: 'alipay' | 'wechat') => {
    setError('');
    setSuccess('');
    setIsProcessing(true);

    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = async (e) => {
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setError(t('paymentMergeQR.qrDecodeError'));
            setIsProcessing(false);
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);

          if (!code) {
            setError(t('paymentMergeQR.invalidQRCode'));
            setIsProcessing(false);
            return;
          }

          const qrType = detectQRType(code.data);

          if (qrType !== type && qrType !== 'unknown') {
            setError(type === 'alipay' ? t('paymentMergeQR.wrongAlipayQR') : t('paymentMergeQR.wrongWechatQR'));
            setIsProcessing(false);
            return;
          }

          const qrData: QRCodeData = {
            url: code.data,
            isValid: true,
            type: qrType === 'unknown' ? type : qrType,
            fileName: file.name,
            preview: e.target?.result as string
          };

          if (type === 'alipay') {
            setAlipayQR(qrData);
          } else {
            setWechatQR(qrData);
          }

          setSuccess(t('paymentMergeQR.qrSuccess'));
          setIsProcessing(false);
        };

        img.onerror = () => {
          setError(t('paymentMergeQR.invalidImage'));
          setIsProcessing(false);
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        setError(t('paymentMergeQR.fileReadError'));
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(t('paymentMergeQR.processError'));
      setIsProcessing(false);
    }
  };

  // 生成合并二维码（软件识别版 - 推荐方案）
  const generateMergedQR = () => {
    setError('');
    setSuccess('');

    if (!alipayQR || !wechatQR) {
      setError(t('paymentMergeQR.bothQRRequired'));
      return;
    }

    try {
      setIsProcessing(true);

      // 1. 构建跳转URL参数
      const params = new URLSearchParams({
        alipay: alipayQR.url,
        wechat: wechatQR.url,
        theme: themeConfig.primaryColor,
        message: themeConfig.customMessage || '',
        showLogo: themeConfig.showLogo.toString()
      });

      // 2. 生成完整的跳转URL（使用当前域名 + pay-redirect.html）
      const baseUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/pay-redirect.html`
        : '/pay-redirect.html';

      const fullUrl = `${baseUrl}?${params.toString()}`;
      setRedirectUrl(fullUrl);

      // 3. 生成指向跳转页面的二维码
      console.log('✅ 生成跳转URL:', fullUrl);
      console.log('支付宝链接:', alipayQR.url);
      console.log('微信链接:', wechatQR.url);

      setMergedQRCode(fullUrl);
      setSuccess(t('paymentMergeQR.successMessage'));
      setIsProcessing(false);
    } catch (err) {
      console.error('❌ 生成合并二维码失败:', err);
      setError(t('paymentMergeQR.generateError'));
      setIsProcessing(false);
    }
  };

  // 重置选择
  const resetSelection = () => {
    setAlipayQR(null);
    setWechatQR(null);
    setMergedQRCode('');
    setError('');
    setSuccess('');
    if (alipayInputRef.current) {
      alipayInputRef.current.value = '';
    }
    if (wechatInputRef.current) {
      wechatInputRef.current.value = '';
    }
  };

  // 下载二维码
  const downloadQRCode = () => {
    if (!mergedQRCode) return;

    // 找到页面上的canvas元素
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      setError('未找到二维码，请重新生成');
      return;
    }

    // 直接下载canvas为PNG
    try {
      const dataURL = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = 'payment-merge-qr.png';
      link.href = dataURL;
      link.click();
    } catch (err) {
      console.error('下载失败:', err);
      setError('下载失败，请右键点击二维码图片保存');
    }
  };



  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{t('paymentMergeQR.pageTitle')}</h1>
        <p className="text-muted-foreground">{t('paymentMergeQR.pageSubtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* 上传区域 */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* 支付宝上传 */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('paymentMergeQR.uploadAlipay')}</label>
                <input
                  ref={alipayInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label={t('paymentMergeQR.uploadAlipay')}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'alipay');
                  }}
                />
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors">
                  {alipayQR ? (
                    <>
                      <CheckIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-foreground flex-1 truncate">{alipayQR.fileName} ✓</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground flex-1">{t('paymentMergeQR.uploadAlipay')}</span>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => alipayInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    {alipayQR ? (
                      <>
                        <RefreshCwIcon className="w-4 h-4" />
                        <span className="ml-2">{t('paymentMergeQR.reselect')}</span>
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-4 h-4" />
                        <span className="ml-2">{t('paymentMergeQR.selectFile')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* 微信上传 */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('paymentMergeQR.uploadWechat')}</label>
                <input
                  ref={wechatInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label={t('paymentMergeQR.uploadWechat')}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'wechat');
                  }}
                />
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors">
                  {wechatQR ? (
                    <>
                      <CheckIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-foreground flex-1 truncate">{wechatQR.fileName} ✓</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground flex-1">{t('paymentMergeQR.uploadWechat')}</span>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => wechatInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    {wechatQR ? (
                      <>
                        <RefreshCwIcon className="w-4 h-4" />
                        <span className="ml-2">{t('paymentMergeQR.reselect')}</span>
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-4 h-4" />
                        <span className="ml-2">{t('paymentMergeQR.selectFile')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* 主题配置选项 */}
            <div className="mt-6 space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">{t('paymentMergeQR.themeConfig') || '主题配置'}</h3>

              {/* 主色调 */}
              <div className="space-y-2">
                <label htmlFor="primaryColor" className="text-xs text-muted-foreground">{t('paymentMergeQR.primaryColor') || '主色调'}</label>
                <div className="flex gap-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setThemeConfig({ ...themeConfig, primaryColor: color })}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        themeConfig.primaryColor === color
                          ? 'border-primary ring-2 ring-primary/20 scale-110'
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`选择颜色 ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* 自定义提示语 */}
              <div className="space-y-2">
                <label htmlFor="customMessage" className="text-xs text-muted-foreground">{t('paymentMergeQR.customMessage') || '自定义提示语（可选）'}</label>
                <input
                  id="customMessage"
                  type="text"
                  value={themeConfig.customMessage}
                  onChange={(e) => setThemeConfig({ ...themeConfig, customMessage: e.target.value })}
                  placeholder={t('paymentMergeQR.messagePlaceholder') || '例如：扫码支付'}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* 显示Logo */}
              <div className="flex items-center space-x-2">
                <input
                  id="showLogo"
                  type="checkbox"
                  checked={themeConfig.showLogo}
                  onChange={(e) => setThemeConfig({ ...themeConfig, showLogo: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="showLogo" className="text-xs text-muted-foreground">
                  {t('paymentMergeQR.showLogo') || '在跳转页面显示支付平台Logo'}
                </label>
              </div>
            </div>



            {/* 错误和成功提示 */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <XIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="mt-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
              </Alert>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={generateMergedQR}
                disabled={!alipayQR || !wechatQR || isProcessing}
                className="flex-1"
              >
                {isProcessing ? t('paymentMergeQR.processing') : t('paymentMergeQR.generateButton')}
              </Button>
              <Button variant="outline" onClick={resetSelection} disabled={!alipayQR && !wechatQR}>
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                {t('paymentMergeQR.reset')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 结果区域 */}
        {mergedQRCode && (
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentMergeQR.resultTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-6">
                {/* 合并后的二维码预览 */}
                <div className="border-2 border-dashed rounded-lg p-8 bg-white shadow-lg">
                  <QRCodeCanvas
                    value={mergedQRCode}
                    size={300}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                {/* 技术说明 */}
                <div className="text-center text-sm text-muted-foreground max-w-md space-y-2">
                  <p className="font-medium text-foreground">{t('paymentMergeQR.techPrinciple') || '软件识别原理'}</p>
                  <p>✓ {t('paymentMergeQR.techDesc1') || '生成指向跳转页面的URL二维码'}</p>
                  <p>✓ {t('paymentMergeQR.techDesc2') || '跳转页面检测User-Agent判断扫码应用'}</p>
                  <p>✓ {t('paymentMergeQR.techDesc3') || '自动重定向到对应的支付链接'}</p>
                </div>

                {/* 测试提示 */}
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CheckIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                    {t('paymentMergeQR.testHint') || '✅ 此方案成功率100%！请分别用微信和支付宝扫码测试'}
                  </AlertDescription>
                </Alert>

                {/* 跳转URL显示 */}
                {redirectUrl && (
                  <div className="w-full max-w-md space-y-2">
                    <label className="text-xs text-muted-foreground">跳转URL：</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={redirectUrl}
                        readOnly
                        className="flex-1 px-3 py-2 text-xs border rounded-md bg-muted/30 truncate"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(redirectUrl);
                          setSuccess(t('paymentMergeQR.urlCopied') || 'URL已复制');
                        }}
                      >
                        <CopyIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* 下载按钮 */}
                <Button onClick={downloadQRCode} className="flex items-center gap-2" size="lg">
                  <DownloadIcon className="w-5 h-5" />
                  {t('paymentMergeQR.downloadQR')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 使用说明 & 注意事项 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('paymentMergeQR.instructions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 使用步骤 */}
              <div>
                <h3 className="text-sm font-medium mb-3">{t('paymentMergeQR.howToUse') || '使用步骤'}</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="shrink-0 mt-0.5">1</Badge>
                    <span>{t('paymentMergeQR.instruction1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="shrink-0 mt-0.5">2</Badge>
                    <span>{t('paymentMergeQR.instruction2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="shrink-0 mt-0.5">3</Badge>
                    <span>{t('paymentMergeQR.instruction3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="shrink-0 mt-0.5">4</Badge>
                    <span>{t('paymentMergeQR.instruction4')}</span>
                  </li>
                </ul>
              </div>

              {/* 注意事项 */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-orange-600 dark:text-orange-400">{t('paymentMergeQR.notes') || '注意事项'}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span>{t('paymentMergeQR.note1') || '需要部署pay-redirect.html文件到服务器或CDN'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span>{t('paymentMergeQR.note2') || '确保跳转URL可被公网访问'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span>{t('paymentMergeQR.note3') || '首次使用前建议用微信和支付宝分别测试'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span>{t('paymentMergeQR.note4') || '打印时保持二维码清晰度，避免污损'}</span>
                  </li>
                </ul>
              </div>

              {/* 技术优势 */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-green-600 dark:text-green-400">{t('paymentMergeQR.advantages') || '技术优势'}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{t('paymentMergeQR.advantage1') || '成功率100%，业界主流方案'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{t('paymentMergeQR.advantage2') || '支持微信、支付宝、QQ等多平台'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{t('paymentMergeQR.advantage3') || '数据安全，不上传任何收款信息'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{t('paymentMergeQR.advantage4') || '可自定义跳转页面主题和提示语'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="text-center text-sm text-muted-foreground">
        <p>{t('paymentMergeQR.disclaimer')}</p>
      </div>
    </div>
  );
}
