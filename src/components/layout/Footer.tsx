"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 pt-14 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">
          {/* Logo + Copyright */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
              <img src="/ai_logo.png" alt="AI Page" width={24} height={24} className="rounded-md" />
              AI Page
            </Link>
            <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
              AI-Powered Creative Platform
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t("footer.services")}</h3>
            <ul className="space-y-2.5">
              <li><Link href="/services" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("service.image.title")}</Link></li>
              <li><Link href="/services" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("service.music.title")}</Link></li>
              <li><Link href="/services" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("service.video.title")}</Link></li>
              <li><Link href="/services" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("service.text.title")}</Link></li>
              <li><Link href="/services" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("service.code.title")}</Link></li>
              <li><Link href="/services" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("service.fortune.title")}</Link></li>
              <li><Link href="/services" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("service.calorie.title")}</Link></li>
              <li><Link href="/services" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("service.math.title")}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t("footer.company")}</h3>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("footer.company.about")}</Link></li>
              <li><Link href="/services" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("footer.company.services")}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t("footer.support")}</h3>
            <ul className="space-y-2.5">
              <li><Link href="/services#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("footer.support.pricing")}</Link></li>
              <li><Link href="/subscription" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("footer.support.subscription")}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-2.5">
              <li><Link href="/terms" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("footer.legal.terms")}</Link></li>
              <li><Link href="/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors">{t("footer.legal.privacy")}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} AI Page. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
