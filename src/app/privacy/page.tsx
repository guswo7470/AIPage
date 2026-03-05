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

export default function PrivacyPage() {
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
            {isKo ? "개인정보처리방침" : "Privacy Policy"}
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">1. 개인정보의 수집 항목 및 방법</h2>
                <p className="mb-3">AI Page는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:</p>
                <div className="rounded-xl border border-gray-200/60 dark:border-zinc-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-zinc-800/50">
                        <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">수집 항목</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">수집 방법</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      <tr>
                        <td className="px-4 py-3">이메일, 이름, 프로필 사진</td>
                        <td className="px-4 py-3">Google 소셜 로그인</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">결제 정보</td>
                        <td className="px-4 py-3">결제 서비스(Polar)를 통한 구독 결제</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">서비스 이용 기록, 접속 로그</td>
                        <td className="px-4 py-3">서비스 이용 과정에서 자동 수집</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">2. 개인정보의 이용 목적</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>서비스 제공 및 운영:</strong> 회원 식별, 서비스 이용, 크레딧 관리</li>
                  <li><strong>결제 처리:</strong> 구독 결제 및 환불 처리</li>
                  <li><strong>고객 지원:</strong> 문의 대응, 서비스 관련 안내</li>
                  <li><strong>서비스 개선:</strong> 이용 통계 분석, 서비스 품질 향상</li>
                  <li><strong>법적 의무 이행:</strong> 관련 법령에 따른 의무 이행</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">3. 개인정보의 보유 및 이용 기간</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (탈퇴 후 즉시 파기)</li>
                  <li><strong>결제 기록:</strong> 전자상거래법에 따라 5년간 보관</li>
                  <li><strong>접속 로그:</strong> 통신비밀보호법에 따라 3개월간 보관</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">4. 개인정보의 제3자 제공</h2>
                <p>AI Page는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>이용자가 사전에 동의한 경우</li>
                  <li>법령에 의해 요구되는 경우</li>
                  <li>결제 처리를 위해 결제 서비스 업체(Polar)에 필요한 최소 정보를 제공하는 경우</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">5. 개인정보의 처리 위탁</h2>
                <div className="rounded-xl border border-gray-200/60 dark:border-zinc-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-zinc-800/50">
                        <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">위탁 업체</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">위탁 업무</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      <tr>
                        <td className="px-4 py-3">Supabase</td>
                        <td className="px-4 py-3">인증 및 데이터베이스 호스팅</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Polar</td>
                        <td className="px-4 py-3">결제 처리</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Vercel</td>
                        <td className="px-4 py-3">웹 서비스 호스팅</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">6. 이용자의 권리</h2>
                <p className="mb-2">이용자는 언제든지 다음 권리를 행사할 수 있습니다:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>개인정보 열람, 정정, 삭제 요청</li>
                  <li>개인정보 처리 정지 요청</li>
                  <li>회원 탈퇴 (계정 삭제)</li>
                </ul>
                <p className="mt-2">위 권리 행사는 서비스 내 설정 또는 이메일(kimhyunjae8031@gmail.com)을 통해 가능합니다.</p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">7. 쿠키(Cookie) 사용</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>AI Page는 로그인 세션 유지 및 서비스 이용 편의를 위해 쿠키를 사용합니다.</li>
                  <li>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">8. 개인정보의 안전성 확보 조치</h2>
                <p className="mb-2">회사는 개인정보 보호를 위해 다음과 같은 조치를 취합니다:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>HTTPS(SSL/TLS) 암호화 통신</li>
                  <li>데이터베이스 접근 권한 관리 및 RLS(Row Level Security) 적용</li>
                  <li>비밀번호 미저장 (소셜 로그인 방식)</li>
                  <li>정기적인 보안 점검</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">9. 개인정보 보호 책임자</h2>
                <ul className="list-none space-y-1">
                  <li><strong>담당:</strong> AI Page 개인정보 보호팀</li>
                  <li><strong>이메일:</strong> <span className="font-medium text-gray-900 dark:text-white">kimhyunjae8031@gmail.com</span></li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">10. 방침 변경</h2>
                <p>본 개인정보처리방침이 변경되는 경우 시행일 최소 7일 전에 서비스 내 공지를 통해 안내합니다.</p>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-10 text-gray-600 dark:text-zinc-400 text-[15px] leading-relaxed">
              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
                <p className="mb-3">AI Page collects the following information to provide the Service:</p>
                <div className="rounded-xl border border-gray-200/60 dark:border-zinc-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-zinc-800/50">
                        <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Data Collected</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Collection Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      <tr>
                        <td className="px-4 py-3">Email, name, profile picture</td>
                        <td className="px-4 py-3">Google social login</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Payment information</td>
                        <td className="px-4 py-3">Subscription payment via Polar</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Usage logs, access records</td>
                        <td className="px-4 py-3">Automatically collected during use</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Service operation:</strong> User identification, service access, credit management</li>
                  <li><strong>Payment processing:</strong> Subscription billing and refund handling</li>
                  <li><strong>Customer support:</strong> Responding to inquiries and service notifications</li>
                  <li><strong>Service improvement:</strong> Usage analytics and quality enhancement</li>
                  <li><strong>Legal compliance:</strong> Fulfilling obligations under applicable laws</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">3. Data Retention</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Account data:</strong> Retained until account deletion (deleted immediately upon request)</li>
                  <li><strong>Payment records:</strong> Retained for 5 years per e-commerce regulations</li>
                  <li><strong>Access logs:</strong> Retained for 3 months per telecommunications regulations</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">4. Sharing with Third Parties</h2>
                <p>We do not share your personal information with third parties except in the following cases:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>With your prior consent</li>
                  <li>When required by law</li>
                  <li>Minimum necessary information shared with our payment processor (Polar) for billing</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">5. Service Providers</h2>
                <div className="rounded-xl border border-gray-200/60 dark:border-zinc-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-zinc-800/50">
                        <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Provider</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      <tr>
                        <td className="px-4 py-3">Supabase</td>
                        <td className="px-4 py-3">Authentication and database hosting</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Polar</td>
                        <td className="px-4 py-3">Payment processing</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Vercel</td>
                        <td className="px-4 py-3">Web service hosting</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">6. Your Rights</h2>
                <p className="mb-2">You have the right to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Access, correct, or delete your personal information</li>
                  <li>Request to stop processing your personal information</li>
                  <li>Delete your account</li>
                </ul>
                <p className="mt-2">You can exercise these rights through your account settings or by emailing kimhyunjae8031@gmail.com.</p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">7. Cookies</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>AI Page uses cookies to maintain login sessions and improve user experience.</li>
                  <li>You may disable cookies in your browser settings, but this may limit certain features of the Service.</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">8. Security Measures</h2>
                <p className="mb-2">We implement the following security measures to protect your data:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>HTTPS (SSL/TLS) encrypted communication</li>
                  <li>Database access control with Row Level Security (RLS)</li>
                  <li>No password storage (social login only)</li>
                  <li>Regular security audits</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">9. Data Protection Officer</h2>
                <ul className="list-none space-y-1">
                  <li><strong>Team:</strong> AI Page Privacy Team</li>
                  <li><strong>Email:</strong> <span className="font-medium text-gray-900 dark:text-white">kimhyunjae8031@gmail.com</span></li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">10. Changes to This Policy</h2>
                <p>We will notify you of any changes to this Privacy Policy at least 7 days before they take effect through an in-service announcement.</p>
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
