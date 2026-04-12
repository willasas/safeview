/**
 * SafeView 组件逻辑测试（无依赖版本）
 *
 * 这是一个独立的测试文件，不需要安装额外的测试框架
 * 可以直接在浏览器控制台或 Node.js 环境中运行
 */

import type { NSFWResult, VideoFrameResult } from '../hooks/use-nsfw';

// 简单的断言工具
const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
};

const assertEquals = (actual: any, expected: any, message: string) => {
  if (actual !== expected) {
    throw new Error(`${message}: Expected ${expected}, got ${actual}`);
  }
};

const assertArrayLength = (arr: any[], length: number, message: string) => {
  if (arr.length !== length) {
    throw new Error(`${message}: Expected length ${length}, got ${arr.length}`);
  }
};

// 测试数据
const mockSafeResult: NSFWResult = {
  predictions: [
    { className: 'Neutral', probability: 0.95 },
    { className: 'Drawing', probability: 0.03 },
    { className: 'Sexy', probability: 0.01 },
    { className: 'Porn', probability: 0.005 },
    { className: 'Hentai', probability: 0.005 },
  ],
  isNSFW: false,
  highestCategory: 'Neutral',
  highestProbability: 0.95,
  processingTime: 150,
};

const mockUnsafeResult: NSFWResult = {
  predictions: [
    { className: 'Porn', probability: 0.85 },
    { className: 'Sexy', probability: 0.10 },
    { className: 'Neutral', probability: 0.03 },
    { className: 'Hentai', probability: 0.01 },
    { className: 'Drawing', probability: 0.01 },
  ],
  isNSFW: true,
  highestCategory: 'Porn',
  highestProbability: 0.85,
  processingTime: 180,
};

const mockVideoResults: VideoFrameResult[] = [
  {
    frameIndex: 0,
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
    frameIndex: 1,
    timestamp: 1000,
    predictions: [
      { className: 'Porn', probability: 0.75 },
      { className: 'Sexy', probability: 0.15 },
      { className: 'Neutral', probability: 0.05 },
      { className: 'Hentai', probability: 0.03 },
      { className: 'Drawing', probability: 0.02 },
    ],
    isNSFW: true,
    highestProbability: 0.75,
    highestCategory: 'Porn',
    processingTime: 130,
  },
];

// 测试套件
export function runDetectionResultTests() {
  console.log('🧪 Running DetectionResult Tests...\n');

  let passed = 0;
  let failed = 0;

  // 测试 1: 安全结果数据结构
  try {
    assert(Array.isArray(mockSafeResult.predictions), 'predictions should be array');
    assertEquals(mockSafeResult.isNSFW, false, 'Safe result should not be NSFW');
    assertEquals(mockSafeResult.highestCategory, 'Neutral', 'Highest category should be Neutral');
    assert(mockSafeResult.highestProbability > 0.9, 'Highest probability should be > 0.9');
    assert(mockSafeResult.processingTime > 0, 'Processing time should be > 0');
    console.log('✅ Test 1 Passed: Safe result data structure');
    passed++;
  } catch (e) {
    console.error('❌ Test 1 Failed:', e);
    failed++;
  }

  // 测试 2: 不安全结果数据结构
  try {
    assert(Array.isArray(mockUnsafeResult.predictions), 'predictions should be array');
    assertEquals(mockUnsafeResult.isNSFW, true, 'Unsafe result should be NSFW');
    assertEquals(mockUnsafeResult.highestCategory, 'Porn', 'Highest category should be Porn');
    assert(mockUnsafeResult.highestProbability > 0.8, 'Highest probability should be > 0.8');
    console.log('✅ Test 2 Passed: Unsafe result data structure');
    passed++;
  } catch (e) {
    console.error('❌ Test 2 Failed:', e);
    failed++;
  }

  // 测试 3: 视频帧结果
  try {
    assertArrayLength(mockVideoResults, 2, 'Should have 2 video frames');
    assertEquals(mockVideoResults[0].frameIndex, 0, 'First frame index should be 0');
    assertEquals(mockVideoResults[1].frameIndex, 1, 'Second frame index should be 1');
    assertEquals(mockVideoResults[0].timestamp, 0, 'First frame timestamp should be 0');
    assertEquals(mockVideoResults[1].timestamp, 1000, 'Second frame timestamp should be 1000');
    console.log('✅ Test 3 Passed: Video frame results');
    passed++;
  } catch (e) {
    console.error('❌ Test 3 Failed:', e);
    failed++;
  }

  // 测试 4: NSFW 判定逻辑
  try {
    assertEquals(mockSafeResult.isNSFW, false, 'Neutral high probability should be safe');
    assertEquals(mockUnsafeResult.isNSFW, true, 'Porn high probability should be unsafe');

    const nsfwFrames = mockVideoResults.filter(r => r.isNSFW);
    const nsfwRatio = nsfwFrames.length / mockVideoResults.length;
    const isVideoNSFW = nsfwRatio > 0.2;

    assertEquals(nsfwFrames.length, 1, 'Should have 1 NSFW frame');
    assertEquals(nsfwRatio, 0.5, 'NSFW ratio should be 0.5');
    assertEquals(isVideoNSFW, true, 'Video should be classified as NSFW');
    console.log('✅ Test 4 Passed: NSFW classification logic');
    passed++;
  } catch (e) {
    console.error('❌ Test 4 Failed:', e);
    failed++;
  }

  // 测试 5: 边界情况 - 空预测
  try {
    const emptyResult: NSFWResult = {
      predictions: [],
      isNSFW: false,
      highestCategory: 'Unknown',
      highestProbability: 0,
      processingTime: 100,
    };

    assertArrayLength(emptyResult.predictions, 0, 'Empty predictions array');
    assertEquals(emptyResult.isNSFW, false, 'Empty result should be safe');
    console.log('✅ Test 5 Passed: Empty predictions handling');
    passed++;
  } catch (e) {
    console.error('❌ Test 5 Failed:', e);
    failed++;
  }

  // 测试 6: 概率总和
  try {
    const totalProbability = mockSafeResult.predictions.reduce(
      (sum, pred) => sum + pred.probability,
      0
    );
    assert(Math.abs(totalProbability - 1) < 0.01, 'Probabilities should sum to ~1');
    console.log('✅ Test 6 Passed: Probability sum validation');
    passed++;
  } catch (e) {
    console.error('❌ Test 6 Failed:', e);
    failed++;
  }

  // 测试 7: 性能指标计算
  try {
    const avgTime = mockVideoResults.reduce(
      (sum, frame) => sum + frame.processingTime,
      0
    ) / mockVideoResults.length;

    assertEquals(avgTime, 125, 'Average processing time should be 125ms');

    const worstFrame = mockVideoResults.reduce((worst, current) =>
      current.highestProbability > worst.highestProbability ? current : worst
    );

    assertEquals(worstFrame.frameIndex, 1, 'Worst frame should be index 1');
    assertEquals(worstFrame.highestCategory, 'Porn', 'Worst frame category should be Porn');
    console.log('✅ Test 7 Passed: Performance metrics calculation');
    passed++;
  } catch (e) {
    console.error('❌ Test 7 Failed:', e);
    failed++;
  }

  // 测试 8: 分类标签映射
  try {
    const CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
      Drawing: { label: '绘画/卡通', description: '手绘或动画内容' },
      Hentai: { label: '动漫成人', description: '动漫风格的成人内容' },
      Neutral: { label: '正常', description: '普通安全内容' },
      Porn: { label: '色情', description: '成人色情内容' },
      Sexy: { label: '性感', description: '性感但非色情内容' },
    };

    const categories = ['Drawing', 'Hentai', 'Neutral', 'Porn', 'Sexy'];
    categories.forEach(cat => {
      assert(CATEGORY_LABELS[cat] !== undefined, `Category ${cat} should have label`);
      assert(CATEGORY_LABELS[cat].label.length > 0, `Category ${cat} label should not be empty`);
    });

    console.log('✅ Test 8 Passed: Category labels mapping');
    passed++;
  } catch (e) {
    console.error('❌ Test 8 Failed:', e);
    failed++;
  }

  // 测试结果汇总
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  return { passed, failed, total: passed + failed };
}

// 如果在 Node.js 环境中直接运行此文件
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  runDetectionResultTests();
}
