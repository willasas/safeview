"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, ChevronUp } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from '@/contexts/i18n-context';
import { useState, useEffect } from 'react';

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 监听滚动事件，控制返回顶部按钮显示/隐藏
  useEffect(() => {
    const handleScroll = () => {
      // 当滚动超过 300px 时显示按钮
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 返回顶部函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navItems = [
    { href: '/', label: t('nav.home'), active: pathname === '/' },
    { href: '/tools/nsfw-detector', label: t('nav.image'), active: pathname.startsWith('/tools/nsfw-detector') },
    { href: '/tools/site-nav', label: t('nav.sitesnav'), active: pathname === '/tools/site-nav', icon: <Globe className="h-4 w-4" /> },
    { href: '#text', label: t('nav.text'), active: false },
    { href: '#video', label: t('nav.video'), active: false },
    { href: '#audio', label: t('nav.audio'), active: false },
  ];

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.svg"
              alt="DC工具集 Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {t('common.appName')}
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Developer's Creative Suite
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  item.active
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {'icon' in item && item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            <LanguageSwitcher />

            {/* Back to Top Button */}
            {showBackToTop && (
              <button
                onClick={scrollToTop}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300"
                aria-label="返回顶部"
                title="返回顶部"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    item.active
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  {'icon' in item && item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
