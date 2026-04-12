/**
 * SafeView 项目测试套件
 *
 * 本目录包含 SafeView 项目的完整测试用例，包括：
 * - 单元测试：组件、hooks、工具函数
 * - 集成测试：端到端功能测试
 * - 性能测试：AI 模型加载和检测性能
 */

// 测试配置文件
export const TEST_CONFIG = {
  // 测试超时时间（毫秒）
  TIMEOUT: 30000,

  // 视频帧采样数
  VIDEO_SAMPLE_FRAMES: 5,

  // NSFW 判定阈值
  NSFW_THRESHOLD: 0.6,

  // 测试文件路径
  TEST_FILES: {
    SAFE_IMAGE: './safe-img.jpg',
    UNSAFE_IMAGE: './not-safe-img.png',
    SAFE_VIDEO: './safe-video.mp4',
    UNSAFE_VIDEO: './not-safe-video.mp4',
    SAFE_GIF: './safe-gif.gif',
    UNSAFE_GIF: './not-safe-gif.gif',
  }
};

// 模拟的检测结果数据
export const MOCK_RESULTS = {
  safeImage: {
    predictions: [
      { className: 'Neutral', probability: 0.95 },
      { className: 'Drawing', probability: 0.03 },
      { className: 'Sexy', probability: 0.01 },
      { className: 'Porn', probability: 0.005 },
      { className: 'Hentai', probability: 0.005 },
    ],
    isNSFW: false,
    processingTime: 150,
  },

  unsafeImage: {
    predictions: [
      { className: 'Porn', probability: 0.85 },
      { className: 'Sexy', probability: 0.10 },
      { className: 'Neutral', probability: 0.03 },
      { className: 'Hentai', probability: 0.01 },
      { className: 'Drawing', probability: 0.01 },
    ],
    isNSFW: true,
    processingTime: 180,
  },

  videoFrames: [
    {
      timestamp: 0,
      predictions: [
        { className: 'Neutral', probability: 0.90 },
        { className: 'Drawing', probability: 0.05 },
        { className: 'Sexy', probability: 0.03 },
        { className: 'Porn', probability: 0.01 },
        { className: 'Hentai', probability: 0.01 },
      ],
      isNSFW: false,
      highestProbability: 0.90,
      highestCategory: 'Neutral',
      processingTime: 120,
    },
    {
      timestamp: 1000,
      predictions: [
        { className: 'Neutral', probability: 0.88 },
        { className: 'Drawing', probability: 0.07 },
        { className: 'Sexy', probability: 0.03 },
        { className: 'Porn', probability: 0.01 },
        { className: 'Hentai', probability: 0.01 },
      ],
      isNSFW: false,
      highestProbability: 0.88,
      highestCategory: 'Neutral',
      processingTime: 125,
    },
  ],
};

// 测试辅助函数
export const createMockFile = (name: string, type: string, size: number = 1024): File => {
  return new File([new ArrayBuffer(size)], name, { type });
};

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const expectToBeSafe = (result: any) => {
  expect(result.isNSFW).toBe(false);
  expect(result.predictions).toBeDefined();
  expect(Array.isArray(result.predictions)).toBe(true);
};

export const expectToBeUnsafe = (result: any) => {
  expect(result.isNSFW).toBe(true);
  expect(result.predictions).toBeDefined();
  expect(Array.isArray(result.predictions)).toBe(true);
};
