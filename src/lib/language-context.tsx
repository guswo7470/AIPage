"use client";

import { createContext, useContext, useState } from "react";

type Lang = "ko" | "en";

const translations = {
  // Header
  "nav.services": { ko: "서비스", en: "Services" },
  "nav.about": { ko: "소개", en: "About" },
  "nav.contact": { ko: "문의", en: "Contact" },

  // Hero
  "hero.tag": { ko: "AI 기반 크리에이티브 플랫폼", en: "AI-Powered Creative Platform" },
  "hero.prefix": { ko: "AI로", en: "Create" },
  "hero.suffix": { ko: "만들어보세요", en: "with AI" },
  "hero.desc1": {
    ko: "AI Page에서 다양한 AI 서비스를 하나의 공간에서 경험하세요.",
    en: "Experience a variety of AI services in one place.",
  },
  "hero.desc2": {
    ko: "이미지, 음악, 영상, 글쓰기, 코드까지 — 모든 창작을 AI와 함께.",
    en: "Images, music, video, writing, code — create everything with AI.",
  },
  "hero.cta.primary": { ko: "서비스 둘러보기", en: "Explore Services" },
  "hero.cta.secondary": { ko: "자세히 알아보기", en: "Learn More" },

  // Hero rotating words
  "hero.word.image": { ko: "이미지를", en: "images" },
  "hero.word.music": { ko: "음악을", en: "music" },
  "hero.word.video": { ko: "영상을", en: "videos" },
  "hero.word.code": { ko: "코드를", en: "code" },
  "hero.word.text": { ko: "글을", en: "text" },

  // Service cards
  "service.image.title": { ko: "이미지 생성", en: "Image Generation" },
  "service.image.desc": { ko: "텍스트로 상상을 현실로", en: "Turn imagination into reality" },
  "service.music.title": { ko: "음악 생성", en: "Music Generation" },
  "service.music.desc": { ko: "AI가 만드는 오리지널 사운드", en: "Original sounds created by AI" },
  "service.video.title": { ko: "영상 제작", en: "Video Creation" },
  "service.video.desc": { ko: "아이디어를 영상으로 변환", en: "Transform ideas into videos" },
  "service.text.title": { ko: "글쓰기", en: "Writing" },
  "service.text.desc": { ko: "블로그, 카피, 콘텐츠 작성", en: "Blog, copy & content writing" },
  "service.code.title": { ko: "코드 생성", en: "Code Generation" },
  "service.code.desc": { ko: "자연어로 코드를 작성", en: "Write code with natural language" },
  "service.chat.title": { ko: "AI 채팅", en: "AI Chat" },
  "service.chat.desc": { ko: "지능형 대화 어시스턴트", en: "Intelligent conversation assistant" },

  // Login
  "login.title": { ko: "AI Page에 오신 것을 환영합니다", en: "Welcome to AI Page" },
  "login.desc": { ko: "Google 계정으로 간편하게 시작하세요.", en: "Get started easily with your Google account." },
  "login.google": { ko: "Google로 계속하기", en: "Continue with Google" },
  "login.terms": { ko: "계속 진행하면 서비스 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.", en: "By continuing, you agree to our Terms of Service and Privacy Policy." },
  "login.back": { ko: "홈으로 돌아가기", en: "Back to Home" },

  // Header
  "header.login": { ko: "로그인", en: "Sign in" },
  "header.logout": { ko: "로그아웃", en: "Sign out" },

  // Dashboard
  "dashboard.welcome": { ko: "환영합니다", en: "Welcome" },
  "dashboard.subtitle": { ko: "어떤 AI 서비스를 사용해 볼까요?", en: "Which AI service would you like to try?" },
  "dashboard.coming_soon": { ko: "준비 중", en: "Coming Soon" },

  // Footer
  "footer.rights": { ko: "All rights reserved.", en: "All rights reserved." },
} as const;

type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ko",
  toggleLang: () => {},
  t: (key) => translations[key].ko,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ko");

  const toggleLang = () => setLang((l) => (l === "ko" ? "en" : "ko"));

  const t = (key: TranslationKey): string => translations[key][lang];

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
