/**
 * use-nsfw Hook 逻辑测试（无依赖版本）
 */

import type { NSFWResult, NSFWPrediction } from '../hooks/use-nsfw';

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

// NSFW 阈值配置（与 use-nsfw.ts 保持一致）
const NSFW_THRESHOLDS = {
  Porn: 0.3,
  Hentai: 0.3,
  Sexy: 0.5,
};

// 判断是否为 NSFW 的逻辑
const checkIfNSFW = (predictions: NSFWPrediction[]): boolean => {
  return predictions.some(
    (pred) =>
      pred.className in NSFW_THRESHOLDS &&
      pred.probability > NSFW_THRESHOLDS[pred.className as keyof typeof NSFW_THRESHOLDS]
  );
};

// 获取最高概率类别
const getHighestCategory = (predictions: NSFWPrediction[]): { category: string; probability: number } => {
  if (predictions.length === 0) {
    return { category: 'Unknown', probability: 0 };
  }

  const highest = predictions.reduce((max, pred) =>
    pred.probability > max.probability ? pred : max
  );

  return { category: highest.className, probability: highest.probability };
};

export function runUseNSFWTests() {
  console.log('🧪 Running use-nsfw Hook Tests...\n');

  let passed = 0;
  let failed = 0;

  // 测试 1: NSFW 判定 - 安全内容
  try {
    const safePredictions: NSFWPrediction[] = [
      { className: 'Neutral', probability: 0.95 },
      { className: 'Drawing', probability: 0.03 },
      { className: 'Sexy', probability: 0.01 },
      { className: 'Porn', probability: 0.005 },
      { className: 'Hentai', probability: 0.005 },
    ];

    const isNSFW = checkIfNSFW(safePredictions);
    assert(!isNSFW, 'Safe content should not be classified as NSFW');
    console.log('✅ Test 1 Passed: Safe content classification');
    passed++;
  } catch (e) {
    console.error('❌ Test 1 Failed:', e);
    failed++;
  }

  // 测试 2: NSFW 判定 - 色情内容
  try {
    const pornPredictions: NSFWPrediction[] = [
      { className: 'Porn', probability: 0.85 },
      { className: 'Sexy', probability: 0.10 },
      { className: 'Neutral', probability: 0.03 },
      { className: 'Hentai', probability: 0.01 },
      { className: 'Drawing', probability: 0.01 },
    ];

    const isNSFW = checkIfNSFW(pornPredictions);
    assert(isNSFW, 'Porn content should be classified as NSFW');
    console.log('✅ Test 2 Passed: Porn content classification');
    passed++;
  } catch (e) {
    console.error('❌ Test 2 Failed:', e);
    failed++;
  }

  // 测试 3: NSFW 判定 - 性感内容（超过阈值）
  try {
    const sexyPredictions: NSFWPrediction[] = [
      { className: 'Sexy', probability: 0.65 },
      { className: 'Neutral', probability: 0.25 },
      { className: 'Drawing', probability: 0.05 },
      { className: 'Porn', probability: 0.03 },
      { className: 'Hentai', probability: 0.02 },
    ];

    const isNSFW = checkIfNSFW(sexyPredictions);
    assert(isNSFW, 'Sexy content above threshold should be NSFW');
    console.log('✅ Test 3 Passed: Sexy content above threshold');
    passed++;
  } catch (e) {
    console.error('❌ Test 3 Failed:', e);
    failed++;
  }

  // 测试 4: NSFW 判定 - 性感内容（低于阈值）
  try {
    const sexyLowPredictions: NSFWPrediction[] = [
      { className: 'Sexy', probability: 0.45 },
      { className: 'Neutral', probability: 0.40 },
      { className: 'Drawing', probability: 0.10 },
      { className: 'Porn', probability: 0.03 },
      { className: 'Hentai', probability: 0.02 },
    ];

    const isNSFW = checkIfNSFW(sexyLowPredictions);
    assert(!isNSFW, 'Sexy content below threshold should not be NSFW');
    console.log('✅ Test 4 Passed: Sexy content below threshold');
    passed++;
  } catch (e) {
    console.error('❌ Test 4 Failed:', e);
    failed++;
  }

  // 测试 5: NSFW 判定 - 动漫成人内容
  try {
    const hentaiPredictions: NSFWPrediction[] = [
      { className: 'Hentai', probability: 0.75 },
      { className: 'Drawing', probability: 0.15 },
      { className: 'Sexy', probability: 0.05 },
      { className: 'Neutral', probability: 0.03 },
      { className: 'Porn', probability: 0.02 },
    ];

    const isNSFW = checkIfNSFW(hentaiPredictions);
    assert(isNSFW, 'Hentai content should be classified as NSFW');
    console.log('✅ Test 5 Passed: Hentai content classification');
    passed++;
  } catch (e) {
    console.error('❌ Test 5 Failed:', e);
    failed++;
  }

  // 测试 6: 获取最高概率类别
  try {
    const predictions: NSFWPrediction[] = [
      { className: 'Neutral', probability: 0.60 },
      { className: 'Sexy', probability: 0.25 },
      { className: 'Drawing', probability: 0.10 },
      { className: 'Porn', probability: 0.03 },
      { className: 'Hentai', probability: 0.02 },
    ];

    const { category, probability } = getHighestCategory(predictions);
    assertEquals(category, 'Neutral', 'Highest category should be Neutral');
    assertEquals(probability, 0.60, 'Highest probability should be 0.60');
    console.log('✅ Test 6 Passed: Get highest category');
    passed++;
  } catch (e) {
    console.error('❌ Test 6 Failed:', e);
    failed++;
  }

  // 测试 7: 空预测数组处理
  try {
    const emptyPredictions: NSFWPrediction[] = [];

    const isNSFW = checkIfNSFW(emptyPredictions);
    assert(!isNSFW, 'Empty predictions should not be NSFW');

    const { category, probability } = getHighestCategory(emptyPredictions);
    assertEquals(category, 'Unknown', 'Empty predictions should return Unknown category');
    assertEquals(probability, 0, 'Empty predictions should return 0 probability');

    console.log('✅ Test 7 Passed: Empty predictions handling');
    passed++;
  } catch (e) {
    console.error('❌ Test 7 Failed:', e);
    failed++;
  }

  // 测试 8: 边界值 - 刚好等于阈值
  try {
    const boundaryPredictions: NSFWPrediction[] = [
      { className: 'Porn', probability: 0.3 }, // 刚好等于阈值
      { className: 'Neutral', probability: 0.7 },
    ];

    const isNSFW = checkIfNSFW(boundaryPredictions);
    // 注意：阈值检查使用的是 > 而不是 >=，所以 0.3 不应该被判定为 NSFW
    assert(!isNSFW, 'Probability equal to threshold should not be NSFW');
    console.log('✅ Test 8 Passed: Boundary value (equal to threshold)');
    passed++;
  } catch (e) {
    console.error('❌ Test 8 Failed:', e);
    failed++;
  }

  // 测试 9: 边界值 - 略高于阈值
  try {
    const aboveThresholdPredictions: NSFWPrediction[] = [
      { className: 'Porn', probability: 0.31 }, // 略高于阈值
      { className: 'Neutral', probability: 0.69 },
    ];

    const isNSFW = checkIfNSFW(aboveThresholdPredictions);
    assert(isNSFW, 'Probability slightly above threshold should be NSFW');
    console.log('✅ Test 9 Passed: Boundary value (above threshold)');
    passed++;
  } catch (e) {
    console.error('❌ Test 9 Failed:', e);
    failed++;
  }

  // 测试 10: 多个类别同时超过阈值
  try {
    const multiNSFWPredictions: NSFWPrediction[] = [
      { className: 'Porn', probability: 0.50 },
      { className: 'Sexy', probability: 0.60 },
      { className: 'Neutral', probability: 0.10 },
    ];

    const isNSFW = checkIfNSFW(multiNSFWPredictions);
    assert(isNSFW, 'Multiple NSFW categories should still be NSFW');
    console.log('✅ Test 10 Passed: Multiple NSFW categories');
    passed++;
  } catch (e) {
    console.error('❌ Test 10 Failed:', e);
    failed++;
  }

  // 测试 11: 完整的 NSFWResult 构建
  try {
    const predictions: NSFWPrediction[] = [
      { className: 'Neutral', probability: 0.80 },
      { className: 'Drawing', probability: 0.10 },
      { className: 'Sexy', probability: 0.05 },
      { className: 'Porn', probability: 0.03 },
      { className: 'Hentai', probability: 0.02 },
    ];

    const isNSFW = checkIfNSFW(predictions);
    const { category, probability } = getHighestCategory(predictions);

    const result: NSFWResult = {
      predictions,
      isNSFW,
      highestCategory: category,
      highestProbability: probability,
      processingTime: 150,
    };

    assert(Array.isArray(result.predictions), 'Result should have predictions array');
    assertEquals(result.isNSFW, false, 'Result should not be NSFW');
    assertEquals(result.highestCategory, 'Neutral', 'Highest category should be Neutral');
    assertEquals(result.highestProbability, 0.80, 'Highest probability should be 0.80');
    assert(result.processingTime > 0, 'Processing time should be positive');

    console.log('✅ Test 11 Passed: Complete NSFWResult construction');
    passed++;
  } catch (e) {
    console.error('❌ Test 11 Failed:', e);
    failed++;
  }

  // 测试 12: 概率精度处理
  try {
    const precisePredictions: NSFWPrediction[] = [
      { className: 'Neutral', probability: 0.9999 },
      { className: 'Drawing', probability: 0.0001 },
    ];

    const { probability } = getHighestCategory(precisePredictions);
    assert(Math.abs(probability - 0.9999) < 0.0001, 'Should handle high precision probabilities');
    console.log('✅ Test 12 Passed: High precision probability handling');
    passed++;
  } catch (e) {
    console.error('❌ Test 12 Failed:', e);
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
  runUseNSFWTests();
}
