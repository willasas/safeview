'use client';

import { useState, useRef, useEffect } from 'react';
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
import { DownloadIcon, CheckIcon, XIcon, BarcodeIcon } from 'lucide-react';
import JsBarcode from 'jsbarcode';

type BarcodeFormat = 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39' | 'ITF' | 'MSI' | 'pharmacode' | 'codabar';

interface BarcodeConfig {
  content: string;
  format: BarcodeFormat;
  width: number;
  height: number;
  displayValue: boolean;
  fontSize: number;
  margin: number;
}

export default function BarcodeGeneratorPage() {
  const { t } = useI18n();
  const [config, setConfig] = useState<BarcodeConfig>({
    content: '',
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 18,
    margin: 10
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 验证内容
  const validateContent = (content: string, format: BarcodeFormat): boolean => {
    if (!content.trim()) return false;

    switch (format) {
      case 'EAN13':
        return /^\d{13}$/.test(content);
      case 'EAN8':
        return /^\d{8}$/.test(content);
      case 'UPC':
        return /^\d{12}$/.test(content);
      case 'ITF':
        return /^\d+$/.test(content) && content.length % 2 === 0;
      case 'pharmacode':
        return /^\d+$/.test(content) && parseInt(content) >= 3 && parseInt(content) <= 131070;
      default:
        return content.length > 0;
    }
  };

  // 生成条形码
  useEffect(() => {
    if (!canvasRef.current || !validateContent(config.content, config.format)) {
      return;
    }

    try {
      JsBarcode(canvasRef.current, config.content, {
        format: config.format,
        width: config.width,
        height: config.height,
        displayValue: config.displayValue,
        font: 'monospace',
        fontSize: config.fontSize,
        margin: config.margin,
        background: '#ffffff',
        lineColor: '#000000',
      });
      setError('');
    } catch (err: any) {
      console.error('生成失败:', err);
      setError(err.message || t('barcode.generateError') || '生成失败，请检查内容格式');
    }
  }, [config, t]);

  // 下载条形码
  const downloadBarcode = () => {
    if (!canvasRef.current || !validateContent(config.content, config.format)) {
      setError(t('barcode.invalidContent') || '请输入有效的内容');
      return;
    }

    try {
      const dataURL = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `barcode-${config.format}-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      setSuccess(t('barcode.downloadSuccess') || '下载成功');
    } catch (err) {
      console.error('下载失败:', err);
      setError('下载失败，请重试');
    }
  };

  const isValid = validateContent(config.content, config.format);

  // 获取格式说明
  const getFormatDescription = (format: BarcodeFormat): string => {
    const descriptions: Record<BarcodeFormat, string> = {
      CODE128: t('barcode.code128Desc') || '支持所有ASCII字符，高密度',
      EAN13: t('barcode.ean13Desc') || '13位数字，国际标准商品码',
      EAN8: t('barcode.ean8Desc') || '8位数字，短码商品',
      UPC: t('barcode.upcDesc') || '12位数字，北美商品码',
      CODE39: t('barcode.code39Desc') || '支持字母、数字和特殊字符',
      ITF: t('barcode.itfDesc') || '交叉二五码，偶数位数字',
      MSI: t('barcode.msiDesc') || '可变长度数字',
      pharmacode: t('barcode.pharmacodeDesc') || '药品专用码 (3-131070)',
      codabar: t('barcode.codabarDesc') || '支持数字和特殊字符'
    };
    return descriptions[format];
  };

  // 获取格式示例
  const getFormatExample = (format: BarcodeFormat): string => {
    const examples: Record<BarcodeFormat, string> = {
      CODE128: 'ABC-12345',
      EAN13: '6901234567892',
      EAN8: '12345670',
      UPC: '012345678905',
      CODE39: 'CODE39*',
      ITF: '12345678',
      MSI: '123456',
      pharmacode: '12345',
      codabar: 'A12345B'
    };
    return examples[format];
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <BarcodeIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('barcode.pageTitle') || '在线条形码生成器'}</h1>
        </div>
        <p className="text-muted-foreground">{t('barcode.pageSubtitle') || '支持多种标准格式，适用于产品管理、库存追踪等场景'}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 左侧：配置面板 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('barcode.configTitle') || '条形码配置'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 条形码内容 */}
            <div className="space-y-2">
              <Label htmlFor="content">{t('barcode.content') || '条形码内容'}</Label>
              <Input
                id="content"
                value={config.content}
                onChange={(e) => setConfig({ ...config, content: e.target.value })}
                placeholder={t('barcode.contentPlaceholder') || '输入要编码的内容'}
              />
              <p className="text-xs text-muted-foreground">
                {getFormatDescription(config.format)}
                <span className="ml-2 text-primary font-mono">
                  {t('barcode.example') || '示例'}: {getFormatExample(config.format)}
                </span>
              </p>
            </div>

            {/* 条形码类型 */}
            <div className="space-y-2">
              <Label htmlFor="format">{t('barcode.format') || '条形码类型'}</Label>
              <Select
                value={config.format}
                onValueChange={(value: BarcodeFormat) => setConfig({ ...config, format: value })}
              >
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CODE128">CODE128</SelectItem>
                  <SelectItem value="EAN13">EAN-13</SelectItem>
                  <SelectItem value="EAN8">EAN-8</SelectItem>
                  <SelectItem value="UPC">UPC-A</SelectItem>
                  <SelectItem value="CODE39">CODE39</SelectItem>
                  <SelectItem value="ITF">ITF (交叉二五码)</SelectItem>
                  <SelectItem value="MSI">MSI</SelectItem>
                  <SelectItem value="codabar">Codabar</SelectItem>
                  <SelectItem value="pharmacode">Pharmacode</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* 样式配置 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t('barcode.styleConfig') || '样式配置'}</h3>

              {/* 宽度 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="width">{t('barcode.barWidth') || '条码宽度'}</Label>
                  <span className="text-xs text-muted-foreground">{config.width}px</span>
                </div>
                <Slider
                  id="width"
                  value={[config.width]}
                  onValueChange={(value) => setConfig({ ...config, width: value[0] })}
                  min={1}
                  max={4}
                  step={0.5}
                />
              </div>

              {/* 高度 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="height">{t('barcode.barHeight') || '条码高度'}</Label>
                  <span className="text-xs text-muted-foreground">{config.height}px</span>
                </div>
                <Slider
                  id="height"
                  value={[config.height]}
                  onValueChange={(value) => setConfig({ ...config, height: value[0] })}
                  min={50}
                  max={200}
                  step={10}
                />
              </div>

              {/* 显示文字 */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="displayValue"
                  checked={config.displayValue}
                  onCheckedChange={(checked) => setConfig({ ...config, displayValue: checked })}
                />
                <Label htmlFor="displayValue">{t('barcode.showText') || '显示文字'}</Label>
              </div>

              {/* 字体大小 */}
              {config.displayValue && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="fontSize">{t('barcode.fontSize') || '字体大小'}</Label>
                    <span className="text-xs text-muted-foreground">{config.fontSize}px</span>
                  </div>
                  <Slider
                    id="fontSize"
                    value={[config.fontSize]}
                    onValueChange={(value) => setConfig({ ...config, fontSize: value[0] })}
                    min={12}
                    max={24}
                    step={2}
                  />
                </div>
              )}

              {/* 边距 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="margin">{t('barcode.margin') || '边距'}</Label>
                  <span className="text-xs text-muted-foreground">{config.margin}px</span>
                </div>
                <Slider
                  id="margin"
                  value={[config.margin]}
                  onValueChange={(value) => setConfig({ ...config, margin: value[0] })}
                  min={0}
                  max={20}
                  step={2}
                />
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

            {/* 生成按钮 */}
            <Button onClick={downloadBarcode} disabled={!isValid} className="w-full">
              <DownloadIcon className="w-4 h-4 mr-2" />
              {t('barcode.download') || '下载条形码'}
            </Button>
          </CardContent>
        </Card>

        {/* 右侧：预览面板 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('barcode.previewTitle') || '实时预览'}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            {isValid ? (
              <div className="space-y-6 w-full">
                <div className="border-2 border-dashed rounded-lg p-8 bg-white shadow-lg overflow-x-auto">
                  <canvas ref={canvasRef} className="mx-auto" />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">{config.format}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('barcode.contentLength') || '内容长度'}: {config.content.length}
                  </p>
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CheckIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs">
                    {t('barcode.scanHint') || '使用条形码扫描器或手机APP扫描测试'}
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <BarcodeIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>{t('barcode.emptyHint') || '请输入内容以生成条形码'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('barcode.instructions') || '条形码类型说明'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-foreground mb-1">CODE128</h3>
                <p className="text-muted-foreground">{t('barcode.code128Info') || '最通用的格式，支持所有ASCII字符，密度高，应用广泛'}</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">EAN-13 / UPC-A</h3>
                <p className="text-muted-foreground">{t('barcode.eanInfo') || '全球零售标准，用于商品结算和管理。EAN-13为13位，UPC-A为12位'}</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">CODE39</h3>
                <p className="text-muted-foreground">{t('barcode.code39Info') || '早期工业标准，支持大写字母和数字，兼容性好'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-foreground mb-1">ITF (交叉二五码)</h3>
                <p className="text-muted-foreground">{t('barcode.itfInfo') || '专为数字设计，密度高，常用于外包装箱，要求偶数位'}</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Pharmacode</h3>
                <p className="text-muted-foreground">{t('barcode.pharmacodeInfo') || '制药行业专用，数值范围3-131070'}</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Codabar</h3>
                <p className="text-muted-foreground">{t('barcode.codabarInfo') || '医疗、图书馆等领域使用，支持数字和特殊字符'}</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">{t('barcode.tips') || '使用提示'}</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>{t('barcode.tip1') || '不同格式对内容有特定要求，请确保输入正确'}</li>
              <li>{t('barcode.tip2') || '打印时保持足够对比度（黑底白字或白底黑字）'}</li>
              <li>{t('barcode.tip3') || '最小打印尺寸建议：宽度≥2.5cm'}</li>
              <li>{t('barcode.tip4') || '测试扫描确保可读性后再批量使用'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
