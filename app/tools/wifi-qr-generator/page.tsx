'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useI18n } from '@/contexts/i18n-context';
import { DownloadIcon, CheckIcon, XIcon, WifiIcon } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface WiFiConfig {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
  size: number;
}

export default function WiFiQRGeneratorPage() {
  const { t } = useI18n();
  const [config, setConfig] = useState<WiFiConfig>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false,
    size: 400
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 格式化WiFi数据
  const formatWiFiData = (): string => {
    const escapeSpecial = (str: string) => str.replace(/([\\;,:])/g, '\\$1');

    if (config.encryption === 'nopass') {
      return `WIFI:T:nopass;S:${escapeSpecial(config.ssid)};;`;
    }

    return `WIFI:T:${config.encryption};S:${escapeSpecial(config.ssid)};P:${escapeSpecial(config.password)};H:${config.hidden};;`;
  };

  // 验证输入
  const validate = (): boolean => {
    if (!config.ssid.trim()) {
      setError(t('wifiQR.emptySSID') || '请输入WiFi名称');
      return false;
    }

    if (config.encryption !== 'nopass' && !config.password.trim()) {
      setError(t('wifiQR.emptyPassword') || '请输入WiFi密码');
      return false;
    }

    return true;
  };

  // 下载二维码
  const downloadQRCode = () => {
    if (!validate()) return;

    const canvas = document.querySelector('#wifi-qr-canvas canvas') as HTMLCanvasElement;
    if (!canvas) {
      setError('未找到二维码');
      return;
    }

    try {
      const dataURL = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `wifi-${config.ssid.replace(/\s+/g, '-')}-qr.png`;
      link.href = dataURL;
      link.click();
      setSuccess(t('wifiQR.downloadSuccess') || '下载成功');
    } catch (err) {
      console.error('下载失败:', err);
      setError('下载失败，请重试');
    }
  };

  const isValid = config.ssid.trim() && (config.encryption === 'nopass' || config.password.trim());
  const wifiData = isValid ? formatWiFiData() : '';

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <WifiIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('wifiQR.pageTitle') || 'WiFi二维码生成器'}</h1>
        </div>
        <p className="text-muted-foreground">{t('wifiQR.pageSubtitle') || '将WiFi信息转换为二维码，扫码即可连接'}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 左侧：配置面板 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('wifiQR.configTitle') || 'WiFi配置'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* WiFi名称 */}
            <div className="space-y-2">
              <Label htmlFor="ssid">{t('wifiQR.ssid') || 'WiFi名称 (SSID)'}</Label>
              <Input
                id="ssid"
                value={config.ssid}
                onChange={(e) => setConfig({ ...config, ssid: e.target.value })}
                placeholder={t('wifiQR.ssidPlaceholder') || '例如：MyHomeWiFi'}
              />
              <p className="text-xs text-muted-foreground">
                {t('wifiQR.ssidHint') || '这是您在设备WiFi列表中看到的网络名称'}
              </p>
            </div>

            {/* WiFi密码 */}
            {config.encryption !== 'nopass' && (
              <div className="space-y-2">
                <Label htmlFor="password">{t('wifiQR.password') || 'WiFi密码'}</Label>
                <Input
                  id="password"
                  type="password"
                  value={config.password}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  placeholder={t('wifiQR.passwordPlaceholder') || '输入WiFi密码'}
                />
              </div>
            )}

            {/* 加密类型 */}
            <div className="space-y-2">
              <Label htmlFor="encryption">{t('wifiQR.encryption') || '加密类型'}</Label>
              <Select
                value={config.encryption}
                onValueChange={(value: 'WPA' | 'WEP' | 'nopass') =>
                  setConfig({ ...config, encryption: value, password: value === 'nopass' ? '' : config.password })
                }
              >
                <SelectTrigger id="encryption">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2 ({t('wifiQR.recommended') || '推荐'})</SelectItem>
                  <SelectItem value="WEP">WEP ({t('wifiQR.oldStyle') || '旧式'})</SelectItem>
                  <SelectItem value="nopass">{t('wifiQR.noPassword') || '无密码'}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {config.encryption === 'WPA' && t('wifiQR.wpaDesc') || '最安全和最推荐的加密方式'}
                {config.encryption === 'WEP' && t('wifiQR.wepDesc') || '较早的加密标准，安全性较低'}
                {config.encryption === 'nopass' && t('wifiQR.nopassDesc') || '开放网络，存在安全风险'}
              </p>
            </div>

            {/* 隐藏网络 */}
            <div className="flex items-center space-x-2">
              <Switch
                id="hidden"
                checked={config.hidden}
                onCheckedChange={(checked) => setConfig({ ...config, hidden: checked })}
              />
              <Label htmlFor="hidden">{t('wifiQR.hiddenNetwork') || '隐藏网络 (不广播SSID)'}</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('wifiQR.hiddenHint') || '如果WiFi隐藏了SSID，建议不要勾选此项以获得最佳兼容性'}
            </p>

            <Separator />

            {/* 二维码尺寸 */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="size">{t('wifiQR.qrSize') || '二维码尺寸'}</Label>
                <span className="text-xs text-muted-foreground">{config.size}px</span>
              </div>
              <Slider
                id="size"
                value={[config.size]}
                onValueChange={(value) => setConfig({ ...config, size: value[0] })}
                min={200}
                max={800}
                step={50}
              />
              <p className="text-xs text-muted-foreground">
                {t('wifiQR.sizeHint') || '较大的尺寸更适合打印，建议最小2.5cm x 2.5cm'}
              </p>
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

            {/* 生成按钮 */}
            <Button onClick={downloadQRCode} disabled={!isValid} className="w-full">
              <DownloadIcon className="w-4 h-4 mr-2" />
              {t('wifiQR.generateAndDownload') || '生成并下载二维码'}
            </Button>
          </CardContent>
        </Card>

        {/* 右侧：预览面板 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('wifiQR.previewTitle') || '二维码预览'}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            {isValid ? (
              <div className="space-y-6">
                <div id="wifi-qr-canvas" className="border-2 border-dashed rounded-lg p-8 bg-white shadow-lg">
                  <QRCodeCanvas
                    value={wifiData}
                    size={config.size}
                    level="M"
                    fgColor="#000000"
                    bgColor="#ffffff"
                    includeMargin={true}
                  />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">{config.ssid}</p>
                  <p className="text-xs text-muted-foreground">
                    {config.encryption === 'nopass'
                      ? t('wifiQR.noPasswordLabel') || '无密码'
                      : `${config.encryption} · ${config.hidden ? t('wifiQR.hidden') || '隐藏' : t('wifiQR.visible') || '可见'}`
                    }
                  </p>
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CheckIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs">
                    {t('wifiQR.scanHint') || '用手机相机或二维码扫描应用扫描此二维码即可连接WiFi'}
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <WifiIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>{t('wifiQR.emptyHint') || '请填写WiFi信息以生成二维码'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('wifiQR.instructions') || '使用说明 & 最佳实践'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">{t('wifiQR.howToUse') || '如何使用'}</h3>
              <ol className="space-y-2 list-decimal list-inside">
                <li>{t('wifiQR.step1') || '输入WiFi网络名称（SSID）'}</li>
                <li>{t('wifiQR.step2') || '输入WiFi密码（如无密码选择"无密码"）'}</li>
                <li>{t('wifiQR.step3') || '选择加密类型（通常是WPA/WPA2）'}</li>
                <li>{t('wifiQR.step4') || '选择二维码尺寸'}</li>
                <li>{t('wifiQR.step5') || '点击"生成并下载二维码"'}</li>
                <li>{t('wifiQR.step6') || '打印或分享二维码'}</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">{t('wifiQR.bestPractices') || '最佳实践'}</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{t('wifiQR.practice1') || '核对信息：生成前仔细检查SSID和密码'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{t('wifiQR.practice2') || '强密码：建议使用复杂密码增强安全性'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{t('wifiQR.practice3') || '打印质量：保持足够对比度，最小2.5cm'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{t('wifiQR.practice4') || '测试扫描：生成后先用自己设备测试'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">⚠</span>
                  <span>{t('wifiQR.practice5') || '避免隐藏SSID：可能降低兼容性'}</span>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">{t('wifiQR.privacy') || '隐私保护'}</p>
            <p>{t('wifiQR.privacyDesc') || '所有WiFi信息仅在您的浏览器本地处理，不会上传到服务器，确保数据安全。'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
