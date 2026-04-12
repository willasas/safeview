#!/usr/bin/env node

/**
 * SafeView 测试运行器
 *
 * 由于测试文件使用 TypeScript 编写，Node.js 无法直接运行。
 * 请使用以下方法之一运行测试：
 *
 * 方法 1: 在浏览器中运行（推荐）
 *   1. 启动开发服务器: pnpm dev
 *   2. 打开浏览器访问 http://localhost:3000
 *   3. 打开开发者工具 (F12)
 *   4. 在控制台中输入: runAllTests()
 *
 * 方法 2: 使用 ts-node 运行
 *   npm install -g ts-node
 *   ts-node test/run-tests.ts
 *
 * 方法 3: 先编译再运行
 *   npx tsc test/*.ts --outDir test-dist --module commonjs --target es2015 --esModuleInterop
 *   node test-dist/run-tests.js
 */

console.log('🔧 SafeView Test Runner\n');
console.log('⚠️  注意: TypeScript 测试文件需要编译后才能被 Node.js 运行\n');
console.log('请选择以下方法之一运行测试:\n');
console.log('✅ 方法 1: 在浏览器中运行（推荐）');
console.log('   1. 启动开发服务器: pnpm dev');
console.log('   2. 打开浏览器访问 http://localhost:3000');
console.log('   3. 按 F12 打开开发者工具');
console.log('   4. 在 Console 中输入: runAllTests()\n');
console.log('✅ 方法 2: 使用 ts-node 运行');
console.log('   npm install -g ts-node');
console.log('   ts-node test/integration.test.ts\n');
console.log('✅ 方法 3: 编译后运行');
console.log('   npx tsc test/*.ts --outDir test-dist --module commonjs --target es2015 --esModuleInterop');
console.log('   node test-dist/integration.test.js\n');
console.log('📚 更多详情: 查看 test/README.md 或 test/QUICKSTART.md\n');

// 退出码 0 表示正常退出（这不是错误，只是提示信息）
process.exit(0);
