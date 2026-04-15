/**
 * 统一的错误处理工具
 *
 * @example
 * ```typescript
 * import { handleError } from '@/lib/error-handler';
 *
 * try {
 *   // 可能出错的代码
 * } catch (error) {
 *   handleError(error, '文件上传失败');
 * }
 * ```
 */

/**
 * 错误日志级别
 */
export type ErrorLevel = 'info' | 'warn' | 'error';

/**
 * 错误处理选项
 */
export interface ErrorOptions {
  level?: ErrorLevel;
  context?: string;
  shouldNotify?: boolean;
}

/**
 * 统一错误处理函数
 *
 * @param error - 错误对象或消息
 * @param message - 可选的用户友好消息
 * @param options - 错误处理选项
 */
export function handleError(
  error: unknown,
  message?: string,
  options: ErrorOptions = {}
): void {
  const { level = 'error', context, shouldNotify = false } = options;

  // 构建错误信息
  const errorMessage = message || (error instanceof Error ? error.message : String(error));
  const fullMessage = context ? `[${context}] ${errorMessage}` : errorMessage;

  // 根据级别输出日志
  switch (level) {
    case 'info':
      console.info(fullMessage);
      break;
    case 'warn':
      console.warn(fullMessage);
      break;
    case 'error':
    default:
      console.error(fullMessage);

      // 在开发环境下打印完整错误堆栈
      if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      break;
  }

  // TODO: 在生产环境下，可以集成错误上报服务
  // if (shouldNotify && process.env.NODE_ENV === 'production') {
  //   reportErrorToService(error, context);
  // }
}

/**
 * 异步操作错误处理包装器
 *
 * @param asyncFn - 异步函数
 * @param errorHandler - 错误处理回调
 * @returns Promise 结果或 null（如果出错）
 *
 * @example
 * ```typescript
 * const result = await withErrorHandling(
 *   () => fetchUserData(userId),
 *   (error) => handleError(error, '获取用户数据失败')
 * );
 * ```
 */
export async function withErrorHandling<T>(
  asyncFn: () => Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      handleError(error);
    }
    return null;
  }
}

/**
 * 验证错误是否为特定类型
 *
 * @param error - 错误对象
 * @param type - 期望的错误类型
 * @returns 是否为指定类型的错误
 */
export function isErrorOfType<T extends new (...args: any[]) => Error>(
  error: unknown,
  type: T
): error is InstanceType<T> {
  return error instanceof type;
}

/**
 * 创建友好的错误消息
 *
 * @param errorCode - 错误代码
 * @param fallback - 默认消息
 * @returns 友好的错误消息
 */
export function getFriendlyErrorMessage(
  errorCode: string,
  fallback = '发生未知错误，请稍后重试'
): string {
  const errorMessages: Record<string, string> = {
    NETWORK_ERROR: '网络连接失败，请检查网络设置',
    TIMEOUT: '请求超时，请稍后重试',
    INVALID_INPUT: '输入内容无效，请检查后重试',
    FILE_TOO_LARGE: '文件过大，请选择较小的文件',
    UNSUPPORTED_FORMAT: '不支持的文件格式',
    PERMISSION_DENIED: '权限不足，无法执行此操作',
  };

  return errorMessages[errorCode] || fallback;
}
