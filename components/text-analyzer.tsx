"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, BarChart3, Info, Download, Sparkles, TrendingUp, Hash } from "lucide-react";
import { useTextAnalysis } from "@/hooks/use-text-analysis";
import { useI18n } from '@/contexts/i18n-context';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressBar } from "./progress-bar";
import { cn } from "@/lib/utils";

export function TextAnalyzer() {
  const { t } = useI18n();
  const {
    isAnalyzing,
    progress,
    error,
    result,
    analyzeText,
    analyzeFile,
    reset,
    exportReport,
  } = useTextAnalysis();

  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState<"input" | "file">("input");

  // 文本输入处理
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 10000) {
      setText(value);
    }
  }, []);

  // 文件上传处理
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      alert(t('textAnalysis.input.supportedFormats'));
      return;
    }

    try {
      await analyzeFile(file);
    } catch (err) {
      console.error("File analysis error:", err);
    }
  }, [analyzeFile, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // 开始分析
  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;
    try {
      await analyzeText(text);
    } catch (err) {
      console.error("Analysis error:", err);
    }
  }, [text, analyzeText]);

  // 获取情感颜色
  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  // 获取情感背景色
  const getSentimentBg = (label: string) => {
    switch (label) {
      case 'positive': return 'bg-green-500/10 border-green-500/30';
      case 'negative': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-yellow-500/10 border-yellow-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input" className="gap-2">
            <FileText className="h-4 w-4" />
            {t('textAnalysis.input.pasteText')}
          </TabsTrigger>
          <TabsTrigger value="file" className="gap-2">
            <Upload className="h-4 w-4" />
            {t('textAnalysis.input.uploadFile')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="mt-4">
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder={t('textAnalysis.input.placeholder')}
                className="w-full min-h-[200px] p-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
                maxLength={10000}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {text.length}/10000
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('textAnalysis.input.maxLength')}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="file" className="mt-4">
          <label
            className="block cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              accept=".txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <div className="rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 p-8 transition-colors">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-base font-medium text-foreground">
                    {t('textAnalysis.input.dragDrop')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('textAnalysis.input.supportedFormats')}
                  </p>
                </div>
              </div>
            </div>
          </label>
        </TabsContent>
      </Tabs>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || (!text.trim() && activeTab === "input")}
          className="flex-1 gap-2"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t('textAnalysis.actions.analyzing')}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {t('textAnalysis.actions.analyze')}
            </>
          )}
        </Button>

        {result && (
          <Button
            onClick={() => exportReport(result)}
            variant="secondary"
            className="gap-2"
            size="lg"
          >
            <Download className="h-4 w-4" />
            {t('textAnalysis.actions.exportReport')}
          </Button>
        )}
      </div>

      {/* 进度条 */}
      {isAnalyzing && (
        <ProgressBar
          value={progress}
          label={t('textAnalysis.actions.analyzing')}
        />
      )}

      {/* 分析结果 */}
      {result && (
        <div className="space-y-4">
          {/* 情感分析 */}
          <div className={cn("rounded-xl border p-4 md:p-6 space-y-4", getSentimentBg(result.sentiment.label))}>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                {t('textAnalysis.analysis.sentiment')}
              </h3>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold capitalize text-foreground">
                  {t(`textAnalysis.analysis.${result.sentiment.label}`)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('textAnalysis.result.sentimentScore')}: {(result.sentiment.score * 100).toFixed(0)}%
                </p>
              </div>
              <div className={cn("text-4xl font-bold", getSentimentColor(result.sentiment.label))}>
                {result.sentiment.score > 0 ? '+' : ''}{(result.sentiment.score * 100).toFixed(0)}%
              </div>
            </div>

            {/* 情感进度条 */}
            <div className="w-full h-3 rounded-full bg-background/50 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", getSentimentColor(result.sentiment.label).replace('text-', 'bg-'))}
                style={{
                  width: `${((result.sentiment.score + 1) / 2) * 100}%`,
                  backgroundColor: result.sentiment.label === 'positive' ? '#22c55e' : result.sentiment.label === 'negative' ? '#ef4444' : '#eab308'
                }}
              />
            </div>
          </div>

          {/* 统计信息 */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                {t('textAnalysis.result.statistics')}
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('textAnalysis.analysis.charCount')}</p>
                <p className="text-lg font-semibold text-foreground">
                  {result.statistics.charCount.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('textAnalysis.analysis.wordCount')}</p>
                <p className="text-lg font-semibold text-foreground">
                  {result.statistics.wordCount.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('textAnalysis.analysis.paragraphCount')}</p>
                <p className="text-lg font-semibold text-foreground">
                  {result.statistics.paragraphCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('textAnalysis.analysis.readingTime')}</p>
                <p className="text-lg font-semibold text-foreground">
                  ~{result.statistics.readingTimeMinutes} {t('textAnalysis.analysis.minutes')}
                </p>
              </div>
            </div>
          </div>

          {/* 关键词 */}
          {result.keywords.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t('textAnalysis.result.topKeywords')}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {keyword.word}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {keyword.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 分类结果 */}
          {result.categories.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t('textAnalysis.result.textCategories')}
                </h3>
              </div>

              <div className="space-y-3">
                {result.categories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {category.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {category.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${category.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* 使用说明 */}
      <div className="rounded-xl border border-border bg-card/50 p-4 md:p-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{t('textAnalysis.info.usageTitle')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('textAnalysis.info.usage1')}</li>
              <li>{t('textAnalysis.info.usage2')}</li>
              <li>{t('textAnalysis.info.usage3')}</li>
              <li>{t('textAnalysis.info.usage4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
