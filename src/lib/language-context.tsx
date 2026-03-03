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
  "header.upgrade": { ko: "업그레이드", en: "Upgrade" },
  "header.manage_subscription": { ko: "구독 관리", en: "Manage Subscription" },
  "header.cancel_subscription": { ko: "구독 취소", en: "Cancel Subscription" },
  "header.cancel_confirm": { ko: "정말 구독을 취소하시겠습니까? 현재 결제 기간이 끝나면 Free 플랜으로 변경됩니다.", en: "Are you sure you want to cancel? You will be downgraded to Free at the end of the current billing period." },
  "header.cancel_done": { ko: "구독 취소가 예약되었습니다. 결제 기간 종료 후 Free 플랜으로 전환됩니다.", en: "Cancellation scheduled. You will be downgraded to Free after the current period ends." },

  // Dashboard
  "dashboard.welcome": { ko: "환영합니다", en: "Welcome" },
  "dashboard.subtitle": { ko: "어떤 AI 서비스를 사용해 볼까요?", en: "Which AI service would you like to try?" },
  "dashboard.coming_soon": { ko: "준비 중", en: "Coming Soon" },
  "dashboard.upgrade": { ko: "요금제 보기", en: "View Plans" },

  // Pricing
  "pricing.title": { ko: "요금제 선택", en: "Choose a Plan" },
  "pricing.credits": { ko: "크레딧", en: "credits" },
  "pricing.select": { ko: "선택하기", en: "Select" },
  "pricing.upgrade": { ko: "업그레이드", en: "Upgrade" },
  "pricing.downgrade": { ko: "다운그레이드", en: "Downgrade" },
  "pricing.monthly": { ko: "/ 월", en: "/ mo" },
  "pricing.current": { ko: "현재 플랜", en: "Current Plan" },
  "pricing.scheduled": { ko: "변경 예정", en: "Scheduled" },
  "pricing.cancelDowngrade": { ko: "다운그레이드 취소", en: "Cancel Downgrade" },

  // Profile
  "profile.plan": { ko: "플랜", en: "Plan" },
  "profile.credits": { ko: "크레딧", en: "Credits" },
  "profile.plan.free": { ko: "Free", en: "Free" },
  "profile.plan.pro": { ko: "Pro", en: "Pro" },
  "profile.plan.ultra": { ko: "Ultra", en: "Ultra" },
  "profile.status.active": { ko: "활성", en: "Active" },
  "profile.status.canceled": { ko: "해지 예정", en: "Canceled" },
  "profile.status.inactive": { ko: "비활성", en: "Inactive" },

  // Credits
  "credits.title": { ko: "크레딧 충전", en: "Buy Credits" },
  "credits.buy": { ko: "구매하기", en: "Buy" },

  // Dashboard lock
  "dashboard.locked.title": { ko: "유료 플랜 필요", en: "Paid Plan Required" },
  "dashboard.locked.desc": { ko: "이 서비스를 이용하려면 Pro 이상의 플랜이 필요합니다.", en: "You need a Pro plan or higher to use this service." },
  "dashboard.locked.cta": { ko: "플랜 업그레이드", en: "Upgrade Plan" },
  "dashboard.pro.select": { ko: "이 서비스 선택", en: "Select this service" },
  "dashboard.pro.selected": { ko: "사용 중", en: "Active" },
  "dashboard.pro.limit": { ko: "Ultra 필요", en: "Ultra required" },
  "dashboard.pro.banner": { ko: "Pro 플랜은 1개의 서비스를 이용할 수 있습니다. 서비스를 선택해 주세요.", en: "Pro plan includes 1 service. Please select a service." },
  "dashboard.pro.confirm": { ko: "이 서비스를 선택하시겠습니까? Pro 플랜은 1개의 서비스만 이용할 수 있습니다.", en: "Select this service? Pro plan allows only 1 service." },
  "dashboard.pro.change": { ko: "다른 서비스로 변경하시겠습니까?", en: "Change to this service?" },

  "dashboard.cancel_pending": { ko: "구독 취소가 예약되었습니다. 결제 기간 종료 후 Free 플랜으로 전환됩니다.", en: "Cancellation scheduled. You will be downgraded to Free after the current period ends." },

  // Subscription page
  "subscription.title": { ko: "구독 관리", en: "Subscription Management" },
  "subscription.current_plan": { ko: "현재 플랜", en: "Current Plan" },
  "subscription.status": { ko: "상태", en: "Status" },
  "subscription.next_billing": { ko: "다음 결제일", en: "Next Billing Date" },
  "subscription.monthly_price": { ko: "월 요금", en: "Monthly Price" },
  "subscription.ends_at": { ko: "종료 예정일", en: "Ends At" },
  "subscription.change_plan": { ko: "플랜 변경", en: "Change Plan" },
  "subscription.cancel": { ko: "구독 취소", en: "Cancel Subscription" },
  "subscription.cancel_confirm_title": { ko: "구독을 취소하시겠습니까?", en: "Cancel your subscription?" },
  "subscription.cancel_confirm_desc": { ko: "현재 결제 기간이 끝나면 Free 플랜으로 변경됩니다. 남은 기간 동안은 계속 이용 가능합니다.", en: "You will be downgraded to Free at the end of the current billing period. You can continue using the service until then." },
  "subscription.cancel_confirm_btn": { ko: "네, 취소합니다", en: "Yes, cancel" },
  "subscription.cancel_back": { ko: "돌아가기", en: "Go back" },
  "subscription.canceled_notice": { ko: "구독 취소가 예약되었습니다. {date}까지 이용 가능합니다.", en: "Cancellation scheduled. Service available until {date}." },
  "subscription.uncancel": { ko: "취소 철회", en: "Undo Cancel" },
  "subscription.no_subscription": { ko: "현재 구독 중인 플랜이 없습니다.", en: "You don't have an active subscription." },
  "subscription.subscribe_cta": { ko: "플랜 선택하기", en: "Choose a Plan" },
  "subscription.payment_history": { ko: "결제 내역", en: "Payment History" },
  "subscription.no_payments": { ko: "결제 내역이 없습니다.", en: "No payment history." },
  "subscription.date": { ko: "날짜", en: "Date" },
  "subscription.product": { ko: "상품", en: "Product" },
  "subscription.amount": { ko: "금액", en: "Amount" },
  "subscription.type": { ko: "유형", en: "Type" },
  "subscription.payment_method": { ko: "결제 수단", en: "Payment Method" },
  "subscription.payment_method_desc": { ko: "카드 정보 변경은 Polar 고객 포털에서 관리할 수 있습니다.", en: "Card information can be managed through the Polar customer portal." },
  "subscription.manage_in_polar": { ko: "Polar에서 관리", en: "Manage in Polar" },
  "subscription.reason.purchase": { ko: "구매", en: "Purchase" },
  "subscription.reason.subscription_create": { ko: "구독 시작", en: "Subscription Start" },
  "subscription.reason.subscription_cycle": { ko: "구독 갱신", en: "Renewal" },
  "subscription.reason.subscription_update": { ko: "구독 변경", en: "Plan Change" },
  "subscription.page_info": { ko: "{current} / {total} 페이지", en: "Page {current} of {total}" },
  "subscription.prev": { ko: "이전", en: "Previous" },
  "subscription.next": { ko: "다음", en: "Next" },

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
