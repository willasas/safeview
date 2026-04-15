/**
 * 国际化 (i18n) Context Provider
 *
 * 提供全局多语言支持，包括：
 * - 语言切换（中文/英文）
 * - 翻译文本获取
 * - 语言偏好持久化（Cookie）
 *
 * @example
 * ```tsx
 * 在组件中使用
 * const { locale, setLocale, t } = useI18n();
 *
 * 切换语言
 * setLocale('en');
 *
 * 获取翻译
 * const title = t('home.title');
 * ```
 */

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'zh' | 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 导入翻译文件
import zhMessages from '@/i18n/zh.json';
import enMessages from '@/i18n/en.json';

const messages: Record<Locale, any> = {
  zh: zhMessages,
  en: enMessages,
};

// 获取嵌套对象的值
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === undefined || current === null) {
      return path; // 如果路径不存在，返回原始键名
    }
    current = current[key];
  }

  return current !== undefined && current !== null ? String(current) : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh');

  useEffect(() => {
    // 从 cookie 中读取语言设置
    const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);
    if (match && (match[1] === 'zh' || match[1] === 'en')) {
      setLocaleState(match[1] as Locale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // 保存到 cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
  };

  const t = (key: string): string => {
    return getNestedValue(messages[locale], key);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
