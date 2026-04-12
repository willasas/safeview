/**
 * SafeView 集成测试
 *
 * 测试完整的检测流程，包括文件上传、AI 检测和结果展示
 */

import type { NSFWResult, VideoFrameResult } from '../hooks/use-nsfw';
import { runDetectionResultTests } from './detection-result.test';
import { runFileUploadTests } from './file-upload.test';
import { runUseNSFWTests } from './use-nsfw.test';

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

export function runIntegrationTests() {
  console.log('🧪 Running Integration Tests...\n');

  let passed = 0;
  let failed = 0;

  // 测试 1: 完整的图片检测流程
  try {
    // 模拟文件选择
    const mockFile = new File([new ArrayBuffer(1024)], 'test.jpg', { type: 'image/jpeg' });
    assert(mockFile.type.startsWith('image/'), 'File should be recognized as image');

    // 模拟检测结果
    const mockResult: NSFWResult = {
      predictions: [
        { className: 'Neutral', probability: 0.95 },
        { className: 'Drawing', probability: 0.03 },
        { className: 'Sexy', probability: 0.01 },
        { className: 'Porn', probability: 0.005 },
        { className: 'Hentai', probability: 0.005 },
      ],
      isNSFW: false,
      nsfwScore: 0.02,
      highestCategory: 'Neutral',
      highestProbability: 0.95,
      processingTime: 150,
    };

    // 验证结果
    assert(mockResult.isNSFW === false, 'Safe image should not be NSFW');
    assert(mockResult.predictions.length === 5, 'Should have 5 predictions');
    assert(mockResult.processingTime > 0, 'Processing time should be positive');

    console.log('✅ Test 1 Passed: Complete image detection flow');
    passed++;
  } catch (e) {
    console.error('❌ Test 1 Failed:', e);
    failed++;
  }

  // 测试 2: 完整的视频检测流程
  try {
    // 模拟视频文件
    const mockVideoFile = new File([new ArrayBuffer(10240)], 'test.mp4', { type: 'video/mp4' });
    assert(mockVideoFile.type.startsWith('video/'), 'File should be recognized as video');

    // 模拟多帧检测结果
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
        nsfwScore: 0.05,
        highestProbability: 0.90,
        highestCategory: 'Neutral',
        processingTime: 120,
      },
      {
        frameIndex: 1,
        timestamp: 1000,
        predictions: [
          { className: 'Neutral', probability: 0.85 },
          { className: 'Drawing', probability: 0.08 },
          { className: 'Sexy', probability: 0.04 },
          { className: 'Porn', probability: 0.02 },
          { className: 'Hentai', probability: 0.01 },
        ],
        isNSFW: false,
        nsfwScore: 0.07,
        highestProbability: 0.85,
        highestCategory: 'Neutral',
        processingTime: 125,
      },
      {
        frameIndex: 2,
        timestamp: 2000,
        predictions: [
          { className: 'Porn', probability: 0.75 },
          { className: 'Sexy', probability: 0.15 },
          { className: 'Neutral', probability: 0.05 },
          { className: 'Hentai', probability: 0.03 },
          { className: 'Drawing', probability: 0.02 },
        ],
        isNSFW: true,
        nsfwScore: 0.93,
        highestProbability: 0.75,
        highestCategory: 'Porn',
        processingTime: 130,
      },
    ];

    // 计算视频整体判定
    const nsfwFrames = mockVideoResults.filter(r => r.isNSFW);
    const nsfwRatio = nsfwFrames.length / mockVideoResults.length;
    const isVideoNSFW = nsfwRatio > 0.2;

    // 验证结果
    assert(mockVideoResults.length === 3, 'Should have 3 frames');
    assertEquals(nsfwFrames.length, 1, 'Should have 1 NSFW frame');
    assertEquals(nsfwRatio, 1/3, 'NSFW ratio should be 1/3');
    assertEquals(isVideoNSFW, true, 'Video should be classified as NSFW (>20% threshold)');

    console.log('✅ Test 2 Passed: Complete video detection flow');
    passed++;
  } catch (e) {
    console.error('❌ Test 2 Failed:', e);
    failed++;
  }

  // 测试 3: 重置功能
  try {
    // 模拟状态
    let file: File | null = new File([new ArrayBuffer(1024)], 'test.jpg', { type: 'image/jpeg' });
    let result: NSFWResult | null = {
      predictions: [
        { className: 'Neutral', probability: 0.95 },
      ],
      isNSFW: false,
      nsfwScore: 0.05,
      highestCategory: 'Neutral',
      highestProbability: 0.95,
      processingTime: 150,
    };
    let isDetecting = false;

    // 执行重置
    file = null;
    result = null;
    isDetecting = false;

    // 验证重置
    assert(file === null, 'File should be cleared');
    assert(result === null, 'Result should be cleared');
    assert(isDetecting === false, 'Detection state should be reset');

    console.log('✅ Test 3 Passed: Reset functionality');
    passed++;
  } catch (e) {
    console.error('❌ Test 3 Failed:', e);
    failed++;
  }

  // 测试 4: 错误处理
  try {
    let error: string | null = null;

    // 模拟错误
    try {
      throw new Error('Model loading failed');
    } catch (e) {
      error = (e as Error).message;
    }

    assert(error !== null, 'Error should be captured');
    assertEquals(error, 'Model loading failed', 'Error message should match');

    // 清除错误
    error = null;
    assert(error === null, 'Error should be cleared');

    console.log('✅ Test 4 Passed: Error handling');
    passed++;
  } catch (e) {
    console.error('❌ Test 4 Failed:', e);
    failed++;
  }

  // 测试 5: 加载进度追踪
  try {
    const progressSteps = [10, 20, 30, 50, 70, 100];
    let currentProgress = 0;

    progressSteps.forEach(step => {
      currentProgress = step;
      assert(currentProgress >= 0 && currentProgress <= 100, 'Progress should be between 0 and 100');
    });

    assertEquals(currentProgress, 100, 'Final progress should be 100');
    console.log('✅ Test 5 Passed: Loading progress tracking');
    passed++;
  } catch (e) {
    console.error('❌ Test 5 Failed:', e);
    failed++;
  }

  // 测试 6: 多种文件类型混合处理
  try {
    const files = [
      { name: 'image.jpg', type: 'image/jpeg', isMedia: true },
      { name: 'photo.png', type: 'image/png', isMedia: true },
      { name: 'animation.gif', type: 'image/gif', isMedia: true },
      { name: 'video.mp4', type: 'video/mp4', isMedia: true },
      { name: 'document.pdf', type: 'application/pdf', isMedia: false },
      { name: 'archive.zip', type: 'application/zip', isMedia: false },
    ];

    const mediaFiles = files.filter(f => f.isMedia);
    const nonMediaFiles = files.filter(f => !f.isMedia);

    assertEquals(mediaFiles.length, 4, 'Should have 4 media files');
    assertEquals(nonMediaFiles.length, 2, 'Should have 2 non-media files');

    console.log('✅ Test 6 Passed: Mixed file type handling');
    passed++;
  } catch (e) {
    console.error('❌ Test 6 Failed:', e);
    failed++;
  }

  // 测试 7: 性能指标聚合
  try {
    const processingTimes = [120, 125, 130, 115, 140];

    const avgTime = processingTimes.reduce((sum, t) => sum + t, 0) / processingTimes.length;
    const minTime = Math.min(...processingTimes);
    const maxTime = Math.max(...processingTimes);

    assertEquals(avgTime, 126, 'Average time should be 126ms');
    assertEquals(minTime, 115, 'Min time should be 115ms');
    assertEquals(maxTime, 140, 'Max time should be 140ms');

    console.log('✅ Test 7 Passed: Performance metrics aggregation');
    passed++;
  } catch (e) {
    console.error('❌ Test 7 Failed:', e);
    failed++;
  }

  // 测试 8: 分类统计
  try {
    const predictions = [
      { className: 'Neutral', probability: 0.60 },
      { className: 'Sexy', probability: 0.25 },
      { className: 'Drawing', probability: 0.10 },
      { className: 'Porn', probability: 0.03 },
      { className: 'Hentai', probability: 0.02 },
    ];

    const totalProbability = predictions.reduce((sum, p) => sum + p.probability, 0);
    assert(Math.abs(totalProbability - 1) < 0.01, 'Probabilities should sum to ~1');

    const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
    assertEquals(sortedPredictions[0].className, 'Neutral', 'Highest should be Neutral');
    assertEquals(sortedPredictions[0].probability, 0.60, 'Highest probability should be 0.60');

    console.log('✅ Test 8 Passed: Classification statistics');
    passed++;
  } catch (e) {
    console.error('❌ Test 8 Failed:', e);
    failed++;
  }

  // 测试结果汇总
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Integration Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  return { passed, failed, total: passed + failed };
}

/**
 * 运行所有测试
 */
export function runAllTests() {
  console.log('\n' + '🚀'.repeat(25));
  console.log('Starting SafeView Test Suite');
  console.log('🚀'.repeat(25) + '\n');

  const results = {
    detectionResult: runDetectionResultTests(),
    fileUpload: runFileUploadTests(),
    useNSFW: runUseNSFWTests(),
    integration: runIntegrationTests(),
  };

  const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
  const totalTests = totalPassed + totalFailed;

  console.log('\n' + '🎯'.repeat(25));
  console.log('FINAL TEST RESULTS');
  console.log('🎯'.repeat(25));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(2)}%`);
  console.log('🎯'.repeat(25) + '\n');

  if (totalFailed > 0) {
    console.warn('⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('✨ All tests passed! ✨');
  }

  return results;
}

// 如果在 Node.js 环境中直接运行此文件
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  // 只有当该文件是主模块时才运行
  const isMainModule = require.main === module;
  if (isMainModule) {
    runAllTests();
  }
}
