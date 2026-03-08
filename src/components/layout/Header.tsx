'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { useProfile } from '@/lib/use-profile';
import { PricingModal } from '@/components/ui/PricingModal';

function USFlag() {
  return (
    <svg width="16" height="12" viewBox="0 0 640 480" className="rounded-sm shrink-0">
      <g fillRule="evenodd">
        <g strokeWidth="1pt">
          <path fill="#bd3d44" d="M0 0h640v37h-640zm0 74h640v37h-640zm0 148h640v37h-640zm0 148h640v37h-640zm0-222h640v37h-640zm0 148h640v37h-640zm0 148h640v37h-640z" />
          <path fill="#fff" d="M0 37h640v37h-640zm0 148h640v37h-640zm0 148h640v37h-640zm0-222h640v37h-640zm0 148h640v37h-640zm0 148h640v37h-640z" />
        </g>
        <path fill="#192f5d" d="M0 0h364.8v258.5H0z" />
        <path fill="#fff" d="m30.4 11 3.4 10.3h10.6l-8.6 6.3 3.3 10.3-8.7-6.4-8.6 6.3 3.3-10.2-8.6-6.3h10.7zm60.8 0 3.3 10.3H105l-8.5 6.3 3.3 10.3-8.7-6.4-8.6 6.3 3.3-10.2-8.6-6.3h10.6zm60.8 0 3.3 10.3h10.7l-8.6 6.3 3.3 10.3-8.7-6.4-8.6 6.3 3.3-10.2-8.6-6.3H142zm60.8 0 3.4 10.3h10.6l-8.6 6.3 3.3 10.3-8.7-6.4-8.6 6.3 3.3-10.2-8.6-6.3h10.7zm60.8 0 3.3 10.3h10.7l-8.6 6.3 3.3 10.3-8.6-6.4-8.7 6.3 3.3-10.2-8.5-6.3h10.6zm60.8 0 3.3 10.3h10.7l-8.6 6.3 3.3 10.3-8.7-6.4-8.6 6.3 3.2-10.2-8.5-6.3h10.6z" />
      </g>
    </svg>
  );
}

function KRFlag() {
  return (
    <svg width="16" height="12" viewBox="0 0 640 480" className="rounded-sm shrink-0">
      <rect width="640" height="480" fill="#fff" />
      <g transform="translate(320 240)">
        {/* 태극 - 빨강 위(상반원+하좌소원), 파랑 아래(하반원+상우소원) */}
        <circle r="150" fill="#cd2e3a" />
        <path d="M-150 0A150 150 0 0 1 150 0 75 75 0 0 1 0 0 75 75 0 0 0-150 0z" fill="#0047a0" />
        {/* 건 좌상 */}
        <g transform="rotate(-56.3) scale(0.75)">
          <rect x="-170" y="-340" width="340" height="20" fill="#000" />
          <rect x="-170" y="-305" width="340" height="20" fill="#000" />
          <rect x="-170" y="-270" width="340" height="20" fill="#000" />
        </g>
        {/* 곤 우하 */}
        <g transform="rotate(-56.3) scale(0.75)">
          <rect x="-170" y="270" width="155" height="20" fill="#000" />
          <rect x="15" y="270" width="155" height="20" fill="#000" />
          <rect x="-170" y="305" width="155" height="20" fill="#000" />
          <rect x="15" y="305" width="155" height="20" fill="#000" />
          <rect x="-170" y="340" width="155" height="20" fill="#000" />
          <rect x="15" y="340" width="155" height="20" fill="#000" />
        </g>
        {/* 감 우상 */}
        <g transform="rotate(-123.7) scale(0.75)">
          <rect x="-170" y="-340" width="340" height="20" fill="#000" />
          <rect x="-170" y="-305" width="155" height="20" fill="#000" />
          <rect x="15" y="-305" width="155" height="20" fill="#000" />
          <rect x="-170" y="-270" width="340" height="20" fill="#000" />
        </g>
        {/* 리 좌하 */}
        <g transform="rotate(-123.7) scale(0.75)">
          <rect x="-170" y="270" width="155" height="20" fill="#000" />
          <rect x="15" y="270" width="155" height="20" fill="#000" />
          <rect x="-170" y="305" width="340" height="20" fill="#000" />
          <rect x="-170" y="340" width="155" height="20" fill="#000" />
          <rect x="15" y="340" width="155" height="20" fill="#000" />
        </g>
      </g>
    </svg>
  );
}

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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const router = useRouter();
  const desktopPopoverRef = useRef<HTMLDivElement>(null);
  const mobilePopoverRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const navItems = [
    { label: t('nav.services'), href: '/' },
    { label: t('nav.about'), href: '/about' },
  ];

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = desktopPopoverRef.current?.contains(target);
      const insideMobile = mobilePopoverRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setPopoverOpen(false);
      }
    };
    if (popoverOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popoverOpen]);

  const handleManageSubscription = () => {
    router.push('/subscription');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-b border-gray-100 dark:border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <img src="/ai_logo.png" alt="AI Genry" width={28} height={28} className="rounded-md" />
            AI Genry
            <span className="hidden lg:inline-flex items-center gap-1 ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 dark:from-blue-500/20 dark:to-violet-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {t('header.model_badge')}
            </span>
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

            <button onClick={toggleLang} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              {lang === 'ko' ? <><USFlag /> EN</> : <><KRFlag /> KO</>}
            </button>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-zinc-400" aria-label="Toggle theme">
              <ThemeIcon theme={theme} />
            </button>

            {user ? (
              <div className="relative flex items-center gap-2.5" ref={desktopPopoverRef}>
                {profile && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`font-semibold px-2 py-0.5 rounded-full ${profile.pending_plan
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      }`}>
                      {profile.pending_plan
                        ? `${profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)} → ${profile.pending_plan.charAt(0).toUpperCase() + profile.pending_plan.slice(1)}`
                        : profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
                    </span>
                    <span className="font-semibold text-gray-500 dark:text-zinc-400">
                      {profile.credits} cr
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setPopoverOpen(!popoverOpen)}
                  className="rounded-full ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-zinc-600 transition-all"
                >
                  <img
                    src={user.user_metadata?.avatar_url || ''}
                    alt=""
                    width={34}
                    height={34}
                    className="rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </button>

                {/* Popover */}
                {popoverOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg py-1.5 z-50">
                    <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-zinc-800">
                      <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { setPopoverOpen(false); router.push('/dashboard'); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        {t('header.dashboard')}
                      </button>

                      <button
                        onClick={() => { setPopoverOpen(false); setShowPricing(true); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {t('header.upgrade')}
                      </button>

                      <button
                        onClick={() => { setPopoverOpen(false); handleManageSubscription(); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        {t('header.manage_subscription')}
                      </button>
                    </div>

                    <div className="border-t border-gray-100 dark:border-zinc-800 py-1">
                      <button
                        onClick={() => { setPopoverOpen(false); signOut(); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        {t('header.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium px-5 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors">
                {t('header.login')}
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400">
              {lang === 'ko' ? <><USFlag /> EN</> : <><KRFlag /> KO</>}
            </button>
            <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-zinc-400" aria-label="Toggle theme">
              <ThemeIcon theme={theme} />
            </button>
            {user ? (
              <div className="relative flex items-center gap-1.5" ref={mobilePopoverRef}>
                {profile && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${profile.pending_plan
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    }`}>
                    {profile.pending_plan
                      ? `${profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)} → ${profile.pending_plan.charAt(0).toUpperCase() + profile.pending_plan.slice(1)}`
                      : profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
                  </span>
                )}
                <button
                  onClick={() => setPopoverOpen(!popoverOpen)}
                  className="rounded-full ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-zinc-600 transition-all"
                >
                  <img
                    src={user.user_metadata?.avatar_url || ''}
                    alt=""
                    width={30}
                    height={30}
                    className="rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-zinc-900">
                {t('header.login')}
              </Link>
            )}
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
      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </header>
  );
}
