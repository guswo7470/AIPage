'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';

function ThemeIcon({ theme }: { theme: string }) {
  if (theme === 'light') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: t('nav.services'), href: '#services' },
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.contact'), href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-b border-gray-100 dark:border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <img src="/ai_logo.png" alt="AI Page" width={28} height={28} className="rounded-md" />
            AI Page
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {item.label}
                </Link>
              ))}
            </nav>

            <button onClick={toggleLang} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              {lang === 'ko' ? 'EN' : 'KO'}
            </button>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-zinc-400" aria-label="Toggle theme">
              <ThemeIcon theme={theme} />
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <img
                  src={user.user_metadata?.avatar_url || ''}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={signOut}
                  className="text-sm font-medium px-5 py-2 rounded-full border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {t('header.logout')}
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium px-5 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors">
                {t('header.login')}
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            {user ? (
              <button
                onClick={signOut}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400"
              >
                {t('header.logout')}
              </button>
            ) : (
              <Link href="/login" className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-zinc-900">
                {t('header.login')}
              </Link>
            )}
            <button onClick={toggleLang} className="text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400">
              {lang === 'ko' ? 'EN' : 'KO'}
            </button>
            <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-zinc-400" aria-label="Toggle theme">
              <ThemeIcon theme={theme} />
            </button>
            <button className="p-2" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close menu' : 'Open menu'}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className={cn('md:hidden overflow-hidden transition-all', isOpen ? 'max-h-64 pb-4' : 'max-h-0')}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block py-2 text-gray-600 dark:text-zinc-400" onClick={() => setIsOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
