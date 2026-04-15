'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useI18n } from '@/contexts/i18n-context';
import { DownloadIcon, UploadIcon, CheckIcon, XIcon, CopyIcon } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

type ContentType = 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'location';

interface QRConfig {
  content: string;
  contentType: ContentType;
  size: number;
  fgColor: string;
  bgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
}

export default function OnlineQRGeneratorPage() {
  const { t } = useI18n();
  const [config, setConfig] = useState<QRConfig>({
    content: '',
    contentType: 'text',
    size: 300,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'M',
    includeMargin: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 验证内容
  const validateContent = (content: string, type: ContentType): boolean => {
    if (!content.trim()) return false;

    switch (type) {
      case 'url':
        return /^https?:\/\/.+/.test(content);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content);
      case 'phone':
        return /^\+?[\d\s-]{7,15}$/.test(content);
      case 'sms':
        return /^\+?[\d\s-]{7,15}$/.test(content);
      default:
        return true;
    }
  };

  // 格式化WiFi数据
  const formatWiFiData = (ssid: string, password: string, encryption: string, hidden: boolean): string => {
    const escapeSpecial = (str: string) => str.replace(/([\\;,:])/g, '\\$1');
    return `WIFI:T:${encryption};S:${escapeSpecial(ssid)};P:${escapeSpecial(password)};H:${hidden};;`;
  };

  // 格式化vCard数据
  const formatVCard = (data: any): string => {
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      data.name ? `FN:${data.name}` : '',
      data.phone ? `TEL:${data.phone}` : '',
      data.email ? `EMAIL:${data.email}` : '',
      data.org ? `ORG:${data.org}` : '',
      data.title ? `TITLE:${data.title}` : '',
      data.url ? `URL:${data.url}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');
  };

  // 生成最终内容
  const generateFinalContent = (): string => {
    switch (config.contentType) {
      case 'wifi':
        // WiFi格式需要特殊处理，这里简化为文本
        return config.content;
      case 'vcard':
        return config.content;
      case 'email':
        return `mailto:${config.content}`;
      case 'phone':
        return `tel:${config.content}`;
      case 'sms':
        return `sms:${config.content}`;
      case 'location':
        return `geo:${config.content}`;
      default:
        return config.content;
    }
  };

  // 下载二维码
  const downloadQRCode = () => {
    if (!validateContent(config.content, config.contentType)) {
      setError(t('onlineQR.invalidContent') || '请输入有效的内容');
      return;
    }

    const canvas = document.querySelector('#qr-canvas canvas') as HTMLCanvasElement;
    if (!canvas) {
      setError('未找到二维码');
      return;
    }

    try {
      const dataURL = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      setSuccess(t('onlineQR.downloadSuccess') || '下载成功');
    } catch (err) {
      console.error('下载失败:', err);
      setError('下载失败，请重试');
    }
  };

  // 复制内容
  const copyContent = () => {
    navigator.clipboard.writeText(config.content);
    setSuccess(t('onlineQR.copySuccess') || '已复制到剪贴板');
  };

  const isValid = validateContent(config.content, config.contentType);
  const finalContent = generateFinalContent();

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{t('onlineQR.pageTitle') || '在线二维码制作'}</h1>
        <p className="text-muted-foreground">{t('onlineQR.pageSubtitle') || '将文本、网址、联系方式等内容转换为二维码'}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 左侧：配置面板 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('onlineQR.configTitle') || '内容配置'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 内容类型选择 */}
            <div className="space-y-2">
              <Label htmlFor="contentType">{t('onlineQR.contentType') || '内容类型'}</Label>
              <Select
                value={config.contentType}
                onValueChange={(value: ContentType) => setConfig({ ...config, contentType: value, content: '' })}
              >
                <SelectTrigger id="contentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">{t('onlineQR.typeText') || '纯文本'}</SelectItem>
                  <SelectItem value="url">{t('onlineQR.typeUrl') || '网址链接'}</SelectItem>
                  <SelectItem value="email">{t('onlineQR.typeEmail') || '电子邮件'}</SelectItem>
                  <SelectItem value="phone">{t('onlineQR.typePhone') || '电话号码'}</SelectItem>
                  <SelectItem value="sms">{t('onlineQR.typeSMS') || '短信'}</SelectItem>
                  <SelectItem value="wifi">{t('onlineQR.typeWiFi') || 'WiFi配置'}</SelectItem>
                  <SelectItem value="vcard">{t('onlineQR.typeVCard') || '联系人'}</SelectItem>
                  <SelectItem value="location">{t('onlineQR.typeLocation') || '地理位置'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 内容输入 */}
            <div className="space-y-2">
              <Label htmlFor="content">{t('onlineQR.content') || '内容'}</Label>
              <textarea
                id="content"
                value={config.content}
                onChange={(e) => setConfig({ ...config, content: e.target.value })}
                placeholder={t('onlineQR.contentPlaceholder') || '请输入内容...'}
                rows={4}
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              {config.contentType === 'wifi' && (
                <p className="text-xs text-muted-foreground">
                  {t('onlineQR.wifiHint') || '格式：WIFI:T:WPA;S:网络名称;P:密码;H:false;;'}
                </p>
              )}
            </div>

            <Separator />

            {/* 样式配置 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t('onlineQR.styleConfig') || '样式配置'}</h3>

              {/* 尺寸 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="size">{t('onlineQR.size') || '尺寸'}</Label>
                  <span className="text-xs text-muted-foreground">{config.size}px</span>
                </div>
                <Slider
                  id="size"
                  value={[config.size]}
                  onValueChange={(value) => setConfig({ ...config, size: value[0] })}
                  min={200}
                  max={1000}
                  step={50}
                />
              </div>

              {/* 前景色 */}
              <div className="space-y-2">
                <Label htmlFor="fgColor">{t('onlineQR.fgColor') || '前景色'}</Label>
                <div className="flex gap-2">
                  <Input
                    id="fgColor"
                    type="color"
                    value={config.fgColor}
                    onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.fgColor}
                    onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                    className="flex-1"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* 背景色 */}
              <div className="space-y-2">
                <Label htmlFor="bgColor">{t('onlineQR.bgColor') || '背景色'}</Label>
                <div className="flex gap-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.bgColor}
                    onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                    className="flex-1"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* 容错级别 */}
              <div className="space-y-2">
                <Label htmlFor="level">{t('onlineQR.errorCorrection') || '容错级别'}</Label>
                <Select
                  value={config.level}
                  onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => setConfig({ ...config, level: value })}
                >
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">L - 7%</SelectItem>
                    <SelectItem value="M">M - 15%</SelectItem>
                    <SelectItem value="Q">Q - 25%</SelectItem>
                    <SelectItem value="H">H - 30%</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('onlineQR.levelHint') || '容错率越高，二维码越复杂，但可遮挡部分仍能被识别'}
                </p>
              </div>
            </div>

            {/* 错误和成功提示 */}
            {error && (
              <Alert variant="destructive">
                <XIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
              </Alert>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4">
              <Button onClick={downloadQRCode} disabled={!isValid} className="flex-1">
                <DownloadIcon className="w-4 h-4 mr-2" />
                {t('onlineQR.download') || '下载PNG'}
              </Button>
              <Button variant="outline" onClick={copyContent} disabled={!isValid}>
                <CopyIcon className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：预览面板 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('onlineQR.previewTitle') || '实时预览'}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            {isValid ? (
              <div className="space-y-6">
                <div id="qr-canvas" className="border-2 border-dashed rounded-lg p-8 bg-white shadow-lg">
                  <QRCodeCanvas
                    value={finalContent}
                    size={config.size}
                    level={config.level}
                    fgColor={config.fgColor}
                    bgColor={config.bgColor}
                    includeMargin={config.includeMargin}
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  <p>{t('onlineQR.scanHint') || '使用手机扫描二维码测试'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <p>{t('onlineQR.emptyHint') || '请输入内容以生成二维码'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('onlineQR.instructions') || '使用说明'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">{t('onlineQR.supportedTypes') || '支持的内容类型'}</h3>
              <ul className="space-y-1">
                <li>• {t('onlineQR.typeText') || '纯文本'} - 任意文本内容</li>
                <li>• {t('onlineQR.typeUrl') || '网址链接'} - http:// 或 https:// 开头的URL</li>
                <li>• {t('onlineQR.typeEmail') || '电子邮件'} - 邮箱地址</li>
                <li>• {t('onlineQR.typePhone') || '电话号码'} - 手机号码</li>
                <li>• {t('onlineQR.typeSMS') || '短信'} - 短信号码</li>
                <li>• {t('onlineQR.typeWiFi') || 'WiFi配置'} - WiFi连接信息</li>
                <li>• {t('onlineQR.typeVCard') || '联系人'} - vCard格式</li>
                <li>• {t('onlineQR.typeLocation') || '地理位置'} - 经纬度坐标</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">{t('onlineQR.tips') || '使用提示'}</h3>
              <ul className="space-y-1">
                <li>✓ {t('onlineQR.tip1') || '所有处理在浏览器本地完成，保护隐私'}</li>
                <li>✓ {t('onlineQR.tip2') || '建议容错级别选择M或Q，平衡美观和可靠性'}</li>
                <li>✓ {t('onlineQR.tip3') || '打印时保持足够对比度和清晰度'}</li>
                <li>✓ {t('onlineQR.tip4') || '生成后先用手机扫码测试'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
