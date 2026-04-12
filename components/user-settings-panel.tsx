"use client";

import { Settings, Sliders, Target, Video, Eye, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserSettings, ModelConfig } from "@/hooks/use-nsfw";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface UserSettingsPanelProps {
  settings: UserSettings;
  availableModels: ModelConfig[];
  onSettingsChange: (settings: Partial<UserSettings>) => void;
  className?: string;
}

export function UserSettingsPanel({
  settings,
  availableModels,
  onSettingsChange,
  className,
}: UserSettingsPanelProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 md:p-6 space-y-6", className)}>
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">检测设置</h3>
      </div>

      {/* 模型选择 */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Shield className="h-4 w-4 text-primary" />
          AI 模型
        </Label>
        <Select
          value={settings.modelId}
          onValueChange={(value) => onSettingsChange({ modelId: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择检测模型" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div>
                  <p className="font-medium">{model.name}</p>
                  <p className="text-xs text-muted-foreground">{model.description}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 阈值设置 */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Target className="h-4 w-4 text-primary" />
          检测阈值
        </Label>

        {/* 色情阈值 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">色情 (Porn)</span>
            <span className="text-sm font-mono text-red-400">
              {(settings.pornThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[settings.pornThreshold * 100]}
            onValueChange={([value]) => onSettingsChange({ pornThreshold: value / 100 })}
            min={5}
            max={80}
            step={5}
          />
        </div>

        {/* 动漫成人阈值 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">动漫成人 (Hentai)</span>
            <span className="text-sm font-mono text-red-400">
              {(settings.hentaiThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[settings.hentaiThreshold * 100]}
            onValueChange={([value]) => onSettingsChange({ hentaiThreshold: value / 100 })}
            min={5}
            max={80}
            step={5}
          />
        </div>

        {/* 性感阈值 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">性感 (Sexy)</span>
            <span className="text-sm font-mono text-orange-400">
              {(settings.sexyThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[settings.sexyThreshold * 100]}
            onValueChange={([value]) => onSettingsChange({ sexyThreshold: value / 100 })}
            min={20}
            max={90}
            step={5}
          />
        </div>

        {/* 综合判定阈值 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">综合判定阈值</span>
            <span className="text-sm font-mono text-primary">
              {(settings.combinedThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[settings.combinedThreshold * 100]}
            onValueChange={([value]) => onSettingsChange({ combinedThreshold: value / 100 })}
            min={5}
            max={50}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            Porn×0.7 + Hentai×0.3 超过此阈值即判定为不安全
          </p>
        </div>
      </div>

      {/* 视频设置 */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Video className="h-4 w-4 text-primary" />
          视频检测
        </Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">采样帧数</span>
            <span className="text-sm font-mono text-primary">
              {settings.videoSampleFrames}
            </span>
          </div>
          <Slider
            value={[settings.videoSampleFrames]}
            onValueChange={([value]) => onSettingsChange({ videoSampleFrames: value })}
            min={5}
            max={50}
            step={5}
          />
          <p className="text-xs text-muted-foreground">
            帧数越多检测越准确，但耗时更长
          </p>
        </div>
      </div>

      {/* 高级选项 */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sliders className="h-4 w-4 text-primary" />
          高级选项
        </Label>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm text-foreground">仅检测动漫成人</p>
            <p className="text-xs text-muted-foreground">忽略其他类别，仅关注 Hentai 内容</p>
          </div>
          <Switch
            checked={settings.enableHentaiOnly}
            onCheckedChange={(checked) => onSettingsChange({ enableHentaiOnly: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm text-foreground">批量检测模式</p>
            <p className="text-xs text-muted-foreground">支持文件夹批量检测</p>
          </div>
          <Switch
            checked={settings.enableBatchMode}
            onCheckedChange={(checked) => onSettingsChange({ enableBatchMode: checked })}
          />
        </div>
      </div>
    </div>
  );
}
