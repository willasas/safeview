"use client";

import { useI18n } from '@/contexts/i18n-context';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  // Get the current language display name
  const currentLang = locale === 'zh' ? '中文' : 'English';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Switch language"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLocale('zh')}
          className={locale === 'zh' ? 'bg-accent' : ''}
        >
          中文
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('en')}
          className={locale === 'en' ? 'bg-accent' : ''}
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
