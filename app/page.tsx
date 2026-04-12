import { Shield, Lock, Zap, Smartphone, FolderOpen } from "lucide-react";
import { EnhancedNSFWDetector } from "@/components/enhanced-nsfw-detector";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  SafeView
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  AI 内容安全检测
                </p>
              </div>
            </div>

            <a
              href="https://github.com/infinitered/nsfwjs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Powered by NSFW.js
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Shield className="h-4 w-4" />
            基于 TensorFlow.js 的本地 AI 检测 v2.0
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight text-balance">
            智能识别
            <span className="text-primary">不安全内容</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            支持批量检测图片和视频，AI 将自动分析内容是否包含不适宜展示的元素。
            所有处理均在浏览器本地完成，保护您的隐私。新增多模型支持、自定义阈值、报告导出等功能。
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <FeatureCard
              icon={<Lock className="h-5 w-5" />}
              title="隐私优先"
              description="所有文件仅在本地处理，不会上传到任何服务器"
            />
            <FeatureCard
              icon={<FolderOpen className="h-5 w-5" />}
              title="批量检测"
              description="支持文件夹批量检测，自动整理不安全内容"
            />
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="多模型支持"
              description="提供多种 AI 模型和自定义阈值设置"
            />
          </div>
        </div>
      </section>

      {/* Main Detector */}
      <section className="px-4 pb-16 md:pb-24">
        <EnhancedNSFWDetector />
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            本工具使用{" "}
            <a
              href="https://github.com/infinitered/nsfwjs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              NSFW.js
            </a>{" "}
            和{" "}
            <a
              href="https://www.tensorflow.org/js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              TensorFlow.js
            </a>{" "}
            构建，仅供参考，不保证 100% 准确
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-3">
      <div className="p-2 rounded-lg bg-primary/10 w-fit text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}
