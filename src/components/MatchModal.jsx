import React from "react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";
import { isRealAvatar, getAvatarGradient } from "../utils/avatarUtils";
import { getConversationStartersFromProfile } from "../utils/prompts";

function Avatar({ profile, size = "w-20 h-20", text = "text-3xl" }) {
  if (isRealAvatar(profile?.avatar_url)) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.display_name || ""}
        className={`${size} rounded-full object-cover border-4 border-white shadow-card`}
      />
    );
  }
  return (
    <div className={`${size} rounded-full ${getAvatarGradient(profile?.avatar_url, profile?.id)} flex items-center justify-center ${text} font-bold text-white border-4 border-white shadow-card`}>
      {profile?.display_name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export default function MatchModal({ me, partner, onClose }) {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const starters = getConversationStartersFromProfile(partner, locale);

  const startWith = (starter) => {
    try {
      if (starter) sessionStorage.setItem(`kb-starter-${partner.id}`, starter);
    } catch {}
    onClose();
    navigate(`/chat/${partner.id}`);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1E1B18]/60 backdrop-blur-sm px-4" role="dialog" aria-modal="true" aria-label={t.matchTitle}>
      <div className="bg-[#FAF7F2] rounded-[28px] shadow-modal w-full max-w-sm overflow-hidden">
        <div className="bg-[#4A1D3F] px-6 pt-10 pb-14 text-center relative">
          <p className="font-display text-[32px] text-[#FAF7F2] leading-tight">{t.matchTitle}</p>
          <p className="mt-2 text-[14px] text-[#FAF7F2]/70">
            {t.matchDescPrefix}
            <span className="font-semibold text-[#FAF7F2]">{partner.display_name}</span>
            {t.matchDescSuffix}
          </p>
        </div>

        <div className="flex justify-center -mt-9 gap-[-8px]">
          <div className="-mr-3"><Avatar profile={me} /></div>
          <div className="-ml-3 relative">
            <Avatar profile={partner} />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#E8604C] border-[3px] border-[#FAF7F2] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </span>
          </div>
        </div>

        <div className="px-6 pt-6 pb-6">
          <p className="section-label mb-3 text-center">{t.matchStartersTitle}</p>
          <div className="space-y-2">
            {starters.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => startWith(starter)}
                className="w-full text-left rounded-[16px] bg-white border border-[#E5DED2] px-4 py-3 text-[13px] text-[#1E1B18] leading-relaxed hover:border-[#4A1D3F]/40 hover:bg-[#F1E9EE] active:scale-[0.98] transition-all duration-200"
              >
                {starter}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => startWith("")} className="btn-primary mt-5 py-3.5">
            {t.startChat}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full text-center text-[13px] text-[#8A837B] hover:text-[#1E1B18] transition-colors"
          >
            {t.matchLaterBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
