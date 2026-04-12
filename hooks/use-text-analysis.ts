import { useState, useCallback } from "react";

export interface TextAnalysisResult {
  statistics: {
    charCount: number;
    wordCount: number;
    paragraphCount: number;
    sentenceCount: number;
    readingTimeMinutes: number;
  };
  sentiment: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;  // -1 to 1
  };
  keywords: Array<{
    word: string;
    frequency: number;
    weight: number;
  }>;
  categories: Array<{
    name: string;
    confidence: number;
  }>;
}

// 情感词典
const positiveWords = [
  '好', '优秀', '棒', '喜欢', '爱', '满意', '推荐', '感谢',
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'love', 'like', 'best',
  'happy', 'pleased', 'satisfied', 'fantastic', 'awesome', 'beautiful', 'nice'
];

const negativeWords = [
  '差', '糟糕', '讨厌', '不满', '失望', '差评', '垃圾', '坏', '差劲',
  'bad', 'terrible', 'awful', 'worst', 'hate', 'disgusting', 'horrible', 'poor',
  'disappointed', 'unhappy', 'angry', 'frustrated', 'annoying', 'boring'
];

// 分类关键词
const categoryKeywords: Record<string, string[]> = {
  '科技': ['技术', '科技', 'AI', '人工智能', '机器学习', '深度学习', '算法', '代码', '编程', '软件', '硬件', '互联网', '数字化', '智能', 'automation'],
  '科技_en': ['technology', 'tech', 'AI', 'artificial intelligence', 'machine learning', 'deep learning', 'algorithm', 'code', 'programming', 'software', 'hardware', 'internet', 'digital', 'smart', 'automation'],
  '情感': ['感情', '情绪', '心情', '感受', '心理', '爱', '恨', '快乐', '悲伤', '幸福', '痛苦', '情感', '心理'],
  '情感_en': ['emotion', 'feeling', 'mood', 'sentiment', 'love', 'hate', 'happy', 'sad', 'joy', 'pain', 'psychology'],
  '商业': ['商业', '经济', '市场', '营销', '销售', '产品', '服务', '客户', '投资', '利润', '企业', '公司', '品牌'],
  '商业_en': ['business', 'economy', 'market', 'marketing', 'sales', 'product', 'service', 'customer', 'investment', 'profit', 'company', 'brand'],
  '教育': ['教育', '学习', '学校', '老师', '学生', '课程', '知识', '培训', '考试', '学术'],
  '教育_en': ['education', 'learning', 'school', 'teacher', 'student', 'course', 'knowledge', 'training', 'exam', 'academic'],
  '健康': ['健康', '医疗', '疾病', '医生', '医院', '运动', '健身', '营养', '饮食', '养生'],
  '健康_en': ['health', 'medical', 'disease', 'doctor', 'hospital', 'exercise', 'fitness', 'nutrition', 'diet'],
  '娱乐': ['娱乐', '电影', '音乐', '游戏', '明星', '演出', '电视', '视频', '动漫'],
  '娱乐_en': ['entertainment', 'movie', 'music', 'game', 'star', 'performance', 'TV', 'video', 'anime'],
};

export function useTextAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TextAnalysisResult | null>(null);

  // 文本统计
  const analyzeStatistics = useCallback((text: string) => {
    const charCount = text.length;
    // 中英文混合的字数统计：分别计算中文字符和英文单词
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const wordCount = chineseChars + englishWords;

    const paragraphCount = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    const sentenceCount = text.split(/[。！？.!?]+/).filter(s => s.trim().length > 0).length;
    // 假设每分钟阅读 300 字
    const readingTimeMinutes = Math.ceil(wordCount / 300);

    return {
      charCount,
      wordCount,
      paragraphCount,
      sentenceCount,
      readingTimeMinutes: Math.max(1, readingTimeMinutes),
    };
  }, []);

  // 情感分析
  const analyzeSentiment = useCallback((text: string) => {
    let positiveCount = 0;
    let negativeCount = 0;

    // 检查每个情感词是否在文本中出现
    positiveWords.forEach(word => {
      if (text.toLowerCase().includes(word.toLowerCase())) {
        positiveCount++;
      }
    });

    negativeWords.forEach(word => {
      if (text.toLowerCase().includes(word.toLowerCase())) {
        negativeCount++;
      }
    });

    const total = positiveCount + negativeCount;
    if (total === 0) {
      return { label: 'neutral' as const, score: 0 };
    }

    const score = (positiveCount - negativeCount) / total;
    const label = score > 0.2 ? 'positive' as const : score < -0.2 ? 'negative' as const : 'neutral' as const;

    return { label, score };
  }, []);

  // 关键词提取
  const extractKeywords = useCallback((text: string, topN: number = 10) => {
    // 更智能的分词：分别处理中文和英文
    // 1. 提取所有连续的中文字符串（2个字符以上）
    const chineseWords = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];

    // 2. 提取所有连续的英文单词（2个字母以上）
    const englishWords = text.match(/[a-zA-Z]{2,}/g) || [];

    // 3. 合并所有词汇并转为小写
    const allWords = [...chineseWords, ...englishWords.map(w => w.toLowerCase())];

    // 过滤停用词
    const stopWords = new Set([
      '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这',
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall'
    ]);

    // 统计词频
    const wordFreq: Record<string, number> = {};
    allWords.forEach(word => {
      const cleanWord = word.trim();
      if (cleanWord.length > 1 && !stopWords.has(cleanWord)) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });

    // 排序并返回 Top N
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word, frequency]) => ({
        word,
        frequency,
        weight: frequency / allWords.length
      }));
  }, []);

  // 文本分类
  const classifyText = useCallback((text: string) => {
    const textLower = text.toLowerCase();
    const scores: Record<string, number> = {};

    // 计算每个分类的匹配度
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      let matchCount = 0;
      keywords.forEach(keyword => {
        if (textLower.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      });

      if (matchCount > 0) {
        // 提取主分类名（去掉 _en 后缀）
        const mainCategory = category.replace('_en', '');
        scores[mainCategory] = (scores[mainCategory] || 0) + matchCount;
      }
    });

    // 转换为分类结果
    const totalMatches = Object.values(scores).reduce((sum, score) => sum + score, 0);

    return Object.entries(scores)
      .map(([name, score]) => ({
        name,
        confidence: totalMatches > 0 ? (score / totalMatches) * 100 : 0
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }, []);

  // 分析文本
  const analyzeText = useCallback(async (text: string): Promise<TextAnalysisResult> => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    try {
      // 模拟异步处理（让 UI 有机会更新进度）
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(25);

      const statistics = analyzeStatistics(text);
      setProgress(50);

      const sentiment = analyzeSentiment(text);
      setProgress(75);

      const keywords = extractKeywords(text);
      const categories = classifyText(text);
      setProgress(100);

      const analysisResult: TextAnalysisResult = {
        statistics,
        sentiment,
        keywords,
        categories,
      };

      setResult(analysisResult);
      setIsAnalyzing(false);

      return analysisResult;
    } catch (err: any) {
      setError(err.message);
      setIsAnalyzing(false);
      setProgress(0);
      throw err;
    }
  }, [analyzeStatistics, analyzeSentiment, extractKeywords, classifyText]);

  // 读取文件
  const readFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  }, []);

  // 从文件分析
  const analyzeFile = useCallback(async (file: File): Promise<TextAnalysisResult> => {
    const text = await readFile(file);
    return analyzeText(text);
  }, [readFile, analyzeText]);

  // 重置
  const reset = useCallback(() => {
    setResult(null);
    setProgress(0);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  // 导出报告
  const exportReport = useCallback((analysisResult: TextAnalysisResult) => {
    const report = {
      timestamp: new Date().toISOString(),
      ...analysisResult,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text_analysis_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    isAnalyzing,
    progress,
    error,
    result,
    analyzeText,
    analyzeFile,
    reset,
    exportReport,
  };
}
