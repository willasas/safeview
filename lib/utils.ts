/**
 * 工具函数库
 *
 * 提供项目中常用的辅助函数。
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind CSS 类名
 *
 * 使用 clsx 进行条件类名组合，然后用 tailwind-merge 处理冲突的类名。
 *
 * @param inputs - 类名数组，支持字符串、对象、数组等格式
 * @returns 合并后的类名字符串
 *
 * @example
 * ```tsx
 * <div className={cn(
 *   'base-class',
 *   isActive && 'active-class',
 *   variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'
 * )}>
 *   Content
 * </div>
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
