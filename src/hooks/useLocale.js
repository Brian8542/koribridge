import { useState } from 'react';
export function useLocale() {
  const [locale, setLocale] = useState(() => { try { return localStorage.getItem('locale') || 'ko'; } catch { return 'ko'; } });
  const t = locale === 'ko' ? { logout: '로그아웃', loading: '로딩 중...', sendMessage: '보내기', messagePlaceholder: '메시지를 입력하세요...', translate: '번역 보기', hideTranslation: '숨기기', deleteMessage: '삭제', recommended: 'AI 추천 파트너' } : { logout: 'Log Out', loading: 'Loading...', sendMessage: 'Send', messagePlaceholder: 'Type a message...', translate: 'Translate', hideTranslation: 'Hide', deleteMessage: 'Delete', recommended: 'AI Recommended' };
  const toggleLocale = () => { const next = locale === 'ko' ? 'en' : 'ko'; setLocale(next); try { localStorage.setItem('locale', next); } catch {} };
  return { locale, t, toggleLocale };
}
