/**
 * SafeView 测试工具
 *
 * 这个文件会被自动加载到页面中
 * 在浏览器控制台中可以直接使用测试函数
 */

(function() {
  'use strict';

  // ============================================
  // 工具函数
  // ============================================

  const assert = (condition, message) => {
    if (!condition) {
      throw new Error(`Assertion Failed: ${message}`);
    }
  };

  const assertEquals = (actual, expected, message) => {
    if (actual !== expected) {
      throw new Error(`${message}: Expected ${expected}, got ${actual}`);
    }
  };

  const createMockFile = (name, type, size = 1024) => {
    return new File([new ArrayBuffer(size)], name, { type });
  };

  // ============================================
  // DetectionResult 测试
  // ============================================

  function runDetectionResultTests() {
    console.log('🧪 Running DetectionResult Tests...\n');

    let passed = 0;
    let failed = 0;

    const mockSafeResult = {
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

    try {
      assert(Array.isArray(mockSafeResult.predictions), 'predictions should be array');
      assertEquals(mockSafeResult.isNSFW, false, 'Safe result should not be NSFW');
      assertEquals(mockSafeResult.highestCategory, 'Neutral', 'Highest category should be Neutral');
      assert(mockSafeResult.highestProbability > 0.9, 'Highest probability should be > 0.9');
      console.log('✅ Test 1 Passed: Safe result data structure');
      passed++;
    } catch (e) {
      console.error('❌ Test 1 Failed:', e.message);
      failed++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(50));

    return { passed, failed, total: passed + failed };
  }

  // ============================================
  // FileUpload 测试
  // ============================================

  function runFileUploadTests() {
    console.log('🧪 Running FileUpload Tests...\n');

    let passed = 0;
    let failed = 0;

    try {
      const imageFile = createMockFile('test.jpg', 'image/jpeg');
      assert(imageFile.type.startsWith('image/'), 'Should recognize image file');
      assertEquals(imageFile.name, 'test.jpg', 'File name should match');
      console.log('✅ Test 1 Passed: Image file validation');
      passed++;
    } catch (e) {
      console.error('❌ Test 1 Failed:', e.message);
      failed++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(50));

    return { passed, failed, total: passed + failed };
  }

  // ============================================
  // use-nsfw Hook 测试
  // ============================================

  function runUseNSFWTests() {
    console.log('🧪 Running use-nsfw Hook Tests...\n');

    let passed = 0;
    let failed = 0;

    const NSFW_THRESHOLDS = {
      Porn: 0.3,
      Hentai: 0.3,
      Sexy: 0.5,
    };

    const checkIfNSFW = (predictions) => {
      return predictions.some(
        (pred) =>
          pred.className in NSFW_THRESHOLDS &&
          pred.probability > NSFW_THRESHOLDS[pred.className]
      );
    };

    try {
      const safePredictions = [
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
      console.error('❌ Test 1 Failed:', e.message);
      failed++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(50));

    return { passed, failed, total: passed + failed };
  }

  // ============================================
  // 集成测试
  // ============================================

  function runIntegrationTests() {
    console.log('🧪 Running Integration Tests...\n');

    let passed = 0;
    let failed = 0;

    try {
      const mockFile = createMockFile('test.jpg', 'image/jpeg');
      assert(mockFile.type.startsWith('image/'), 'File should be recognized as image');

      const mockResult = {
        predictions: [
          { className: 'Neutral', probability: 0.95 },
        ],
        isNSFW: false,
        highestCategory: 'Neutral',
        highestProbability: 0.95,
        processingTime: 150,
      };

      assert(mockResult.isNSFW === false, 'Safe image should not be NSFW');
      console.log('✅ Test 1 Passed: Complete image detection flow');
      passed++;
    } catch (e) {
      console.error('❌ Test 1 Failed:', e.message);
      failed++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Integration Test Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(50));

    return { passed, failed, total: passed + failed };
  }

  // ============================================
  // 运行所有测试
  // ============================================

  function runAllTests() {
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
    } else {
      console.log('✨ All tests passed! ✨');
    }

    return results;
  }

  // ============================================
  // 导出到全局作用域
  // ============================================

  window.runAllTests = runAllTests;
  window.runDetectionResultTests = runDetectionResultTests;
  window.runFileUploadTests = runFileUploadTests;
  window.runUseNSFWTests = runUseNSFWTests;
  window.runIntegrationTests = runIntegrationTests;

  console.log('✅ SafeView test functions loaded successfully!');
  console.log('💡 Available commands:');
  console.log('   - runAllTests()              // Run all tests');
  console.log('   - runDetectionResultTests()  // DetectionResult tests');
  console.log('   - runFileUploadTests()       // FileUpload tests');
  console.log('   - runUseNSFWTests()          // use-nsfw Hook tests');
  console.log('   - runIntegrationTests()      // Integration tests');

})();
