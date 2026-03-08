"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function TermsPage() {
  const { lang } = useLanguage();
  const isKo = lang === "ko";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative px-6 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-100/80 via-slate-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950" />
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          <motion.p variants={fadeUp} className="text-sm font-medium tracking-widest uppercase text-gray-400 dark:text-zinc-500 mb-3">
            Legal
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-3xl md:text-4xl font-bold tracking-tight">
            {isKo ? "이용약관" : "Terms of Service"}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-sm text-gray-400 dark:text-zinc-500 mt-3">
            {isKo ? "최종 수정일: 2026년 3월 4일" : "Last updated: March 4, 2026"}
          </motion.p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="px-6 pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          {isKo ? (
            <div className="space-y-10 text-gray-600 dark:text-zinc-400 text-[15px] leading-relaxed">
              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제1조 (목적)</h2>
                <p>본 약관은 AI Genry(이하 &quot;회사&quot;)가 제공하는 AI 기반 콘텐츠 생성 서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제2조 (정의)</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>&quot;서비스&quot;</strong>란 회사가 제공하는 AI 이미지 생성, AI 음악 생성, AI 영상 생성, AI 글쓰기, AI 코드 생성, AI 채팅 등 일체의 AI 기반 콘텐츠 생성 기능을 의미합니다.</li>
                  <li><strong>&quot;이용자&quot;</strong>란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.</li>
                  <li><strong>&quot;크레딧&quot;</strong>이란 서비스 이용 시 소모되는 가상의 이용 단위를 의미합니다.</li>
                  <li><strong>&quot;구독&quot;</strong>이란 월 단위로 결제하여 크레딧 및 서비스 이용 혜택을 받는 것을 말합니다.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제3조 (약관의 효력 및 변경)</h2>
                <ul className="list-decimal pl-5 space-y-2">
                  <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
                  <li>회사는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일이 경과한 시점부터 효력이 발생합니다.</li>
                  <li>이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제4조 (회원 가입 및 계정)</h2>
                <ul className="list-decimal pl-5 space-y-2">
                  <li>회원 가입은 Google 계정을 통한 소셜 로그인으로 이루어집니다.</li>
                  <li>이용자는 정확한 정보를 제공해야 하며, 타인의 정보를 이용하여 가입할 수 없습니다.</li>
                  <li>계정 관리의 책임은 이용자에게 있으며, 계정의 무단 사용을 인지한 경우 즉시 회사에 통보해야 합니다.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제5조 (서비스 이용)</h2>
                <ul className="list-decimal pl-5 space-y-2">
                  <li>서비스는 구독 플랜(Pro, Ultra)에 따라 제공되며, 각 플랜별 크레딧 수량 및 기능이 상이합니다.</li>
                  <li>크레딧은 AI 콘텐츠 생성 시 소모되며, 월 단위로 갱신됩니다. 미사용 크레딧은 다음 달로 이월되지 않습니다.</li>
                  <li>서비스는 24시간 이용 가능함을 원칙으로 하나, 정기 점검 또는 긴급 상황 시 일시적으로 중단될 수 있습니다.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제6조 (결제 및 환불)</h2>
                <ul className="list-decimal pl-5 space-y-2">
                  <li>구독 요금은 월 단위로 청구되며, 등록된 결제 수단으로 자동 결제됩니다.</li>
                  <li>구독 해지는 언제든 가능하며, 해지 시 현재 결제 기간이 종료될 때까지 서비스를 이용할 수 있습니다.</li>
                  <li>환불은 관련 법령(전자상거래법 등)에 따라 처리됩니다. 크레딧을 사용한 경우 사용 분에 대해서는 환불이 제한될 수 있습니다.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제7조 (생성물의 권리)</h2>
                <ul className="list-decimal pl-5 space-y-2">
                  <li>서비스를 통해 생성된 콘텐츠(이미지, 음악, 영상, 텍스트, 코드 등)의 이용 권한은 생성한 이용자에게 귀속됩니다.</li>
                  <li>단, AI 생성물의 저작권 보호 범위는 관련 법률에 따라 제한될 수 있습니다.</li>
                  <li>이용자는 생성물을 개인적 또는 상업적 목적으로 이용할 수 있으나, 불법적이거나 타인의 권리를 침해하는 용도로 사용할 수 없습니다.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제8조 (금지 행위)</h2>
                <p className="mb-2">이용자는 다음 각 호의 행위를 해서는 안 됩니다:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>불법, 유해, 위협적, 모욕적, 명예훼손적, 음란한 콘텐츠를 생성하는 행위</li>
                  <li>타인의 개인정보를 무단으로 수집하거나 도용하는 행위</li>
                  <li>서비스를 역설계, 디컴파일 또는 해킹하는 행위</li>
                  <li>자동화 도구를 이용하여 비정상적으로 서비스를 이용하는 행위</li>
                  <li>기타 관련 법령 또는 공서양속에 위반되는 행위</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제9조 (서비스 변경 및 중단)</h2>
                <ul className="list-decimal pl-5 space-y-2">
                  <li>회사는 서비스의 기능을 변경하거나 추가할 수 있으며, 중요한 변경 시 사전 공지합니다.</li>
                  <li>천재지변, 시스템 장애 등 불가항력적 사유 시 서비스가 중단될 수 있으며, 이 경우 회사는 책임을 지지 않습니다.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제10조 (면책 조항)</h2>
                <ul className="list-decimal pl-5 space-y-2">
                  <li>AI 생성물의 정확성, 완전성, 적합성에 대해 회사는 보증하지 않습니다.</li>
                  <li>이용자가 생성물을 이용하여 발생한 문제에 대해 회사는 책임을 지지 않습니다.</li>
                  <li>서비스는 &quot;있는 그대로(AS IS)&quot; 제공되며, 명시적 또는 묵시적 보증을 하지 않습니다.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제11조 (준거법 및 관할)</h2>
                <p>본 약관의 해석 및 분쟁 해결은 대한민국 법률에 따르며, 분쟁 발생 시 회사의 소재지를 관할하는 법원을 전속적 합의 관할로 합니다.</p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">제12조 (문의)</h2>
                <p>본 약관에 대한 문의는 아래 이메일로 연락해 주시기 바랍니다.</p>
                <p className="mt-2 font-medium text-gray-900 dark:text-white">aigenry98@gmail.com</p>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-10 text-gray-600 dark:text-zinc-400 text-[15px] leading-relaxed">
              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                <p>By accessing or using AI Genry (the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service.</p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">2. Description of Service</h2>
                <p>AI Genry is an AI-powered creative platform that provides content generation services including, but not limited to, AI image generation, AI music generation, AI video generation, AI writing, AI code generation, and AI chat. The Service is provided on a subscription basis with monthly credit allocations.</p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">3. Account Registration</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You must sign in using a Google account to access the Service.</li>
                  <li>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</li>
                  <li>You must provide accurate information and must not impersonate others or use another person&apos;s account.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">4. Subscription Plans and Credits</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The Service offers two subscription plans: Pro ($20/month, 100 credits) and Ultra ($45/month, 300 credits).</li>
                  <li>Credits are consumed when generating AI content and are renewed monthly. Unused credits do not carry over to the next billing period.</li>
                  <li>Plan features, pricing, and credit amounts are subject to change with prior notice.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">5. Payment and Billing</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Subscription fees are billed monthly and charged automatically to your registered payment method.</li>
                  <li>You may cancel your subscription at any time. Upon cancellation, you will retain access to the Service until the end of the current billing period.</li>
                  <li>Refunds are handled in accordance with applicable consumer protection laws. Refunds may be limited for credits that have already been consumed.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">6. Ownership of Generated Content</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You retain usage rights to content generated through the Service (images, music, videos, text, code, etc.).</li>
                  <li>The extent of copyright protection for AI-generated content may be limited by applicable law.</li>
                  <li>You may use generated content for personal or commercial purposes, provided it does not violate any laws or infringe upon the rights of others.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">7. Prohibited Activities</h2>
                <p className="mb-2">You agree not to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Generate illegal, harmful, threatening, abusive, defamatory, or obscene content</li>
                  <li>Collect or misuse the personal information of others</li>
                  <li>Reverse-engineer, decompile, or hack the Service</li>
                  <li>Use automated tools to access the Service in an abnormal manner</li>
                  <li>Engage in any activity that violates applicable laws or public morals</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">8. Modifications and Termination</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>We reserve the right to modify or discontinue the Service at any time. Significant changes will be communicated in advance.</li>
                  <li>We may terminate or suspend your account if you violate these Terms.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">9. Disclaimer of Warranties</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>We do not guarantee the accuracy, completeness, or suitability of AI-generated content.</li>
                  <li>We are not liable for any issues arising from your use of generated content.</li>
                  <li>The Service is provided &quot;AS IS&quot; without any express or implied warranties.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">10. Limitation of Liability</h2>
                <p>To the fullest extent permitted by law, AI Genry shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the Service.</p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">11. Governing Law</h2>
                <p>These Terms shall be governed by and construed in accordance with the laws of the Republic of Korea. Any disputes shall be resolved by the competent court in the jurisdiction where the Company is located.</p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">12. Contact</h2>
                <p>For questions about these Terms, please contact us at:</p>
                <p className="mt-2 font-medium text-gray-900 dark:text-white">aigenry98@gmail.com</p>
              </motion.div>
            </div>
          )}

          {/* Back link */}
          <motion.div variants={fadeUp} className="mt-16 pt-8 border-t border-gray-200/60 dark:border-zinc-800">
            <Link href="/services" className="text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
              &larr; {isKo ? "서비스로 돌아가기" : "Back to Services"}
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
