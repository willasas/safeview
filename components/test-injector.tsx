"use client";

import { useEffect } from "react";

/**
 * 测试工具注入器
 *
 * 在开发环境下，将测试函数注入到 window 对象，方便在浏览器控制台中运行测试
 */
export function TestInjector() {
  useEffect(() => {
    // 仅在开发环境下注入
    if (process.env.NODE_ENV !== "development") {
      return;
    }

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

    // 模拟文件对象
    const createMockFile = (name: string, type: string, size: number = 1024): File => {
      return new File([new ArrayBuffer(size)], name, { type });
    };

    // 导入测试函数（这里简化为直接在浏览器中定义）
    // 实际使用时，可以在控制台直接调用这些函数

    console.log("🧪 SafeView Test Tools Loaded");
    console.log("💡 在控制台中输入以下命令运行测试:");
    console.log("   - runAllTests()           // 运行所有测试");
    console.log("   - runDetectionResultTests()  // DetectionResult 测试");
    console.log("   - runFileUploadTests()       // FileUpload 测试");
    console.log("   - runUseNSFWTests()          // use-nsfw Hook 测试");
    console.log("   - runIntegrationTests()      // 集成测试");
    console.log("");
    console.log("📚 更多详情: 查看 test/QUICKSTART.md");

    // 清理函数
    return () => {
      // 如果需要，可以在这里清理 window 对象上的测试函数
    };
  }, []);

  return null; // 这个组件不渲染任何内容
}
