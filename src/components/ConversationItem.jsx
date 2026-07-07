import React from "react";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../utils/formatters";
import { isRealAvatar, getAvatarGradient } from "../utils/avatarUtils";
import { useLocale } from "../hooks/useLocale";

function ConversationItem({ conv, userId, isOnline }) {
  const navigate = useNavigate();
  const { t } = useLocale();

  return (
    <button
      type="button"
      onClick={() => navigate(`/chat/${conv.partnerId}`)}
      className="w-full text-left bg-white border border-[#E5DED2]/40 rounded-apple px-4 py-3.5 flex items-center gap-3.5 hover:border-[#E5DED2] hover:shadow-card active:scale-[0.99] transition-all duration-150 min-h-[72px]"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {isRealAvatar(conv.partner.avatar_url) ? (
          <img
            src={conv.partner.avatar_url}
            alt={conv.partner.display_name}
            loading="lazy"
            className="w-12 h-12 rounded-apple object-cover"
          />
        ) : (
          <div className={`w-12 h-12 rounded-apple ${getAvatarGradient(conv.partner.avatar_url, conv.partner.id)} flex items-center justify-center text-lg font-bold text-white`}>
            {conv.partner.display_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-emerald-500" : "bg-[#E5DED2]"}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <p className="font-semibold text-[#1E1B18] text-[14px] truncate">{conv.partner.display_name}</p>
          <p className="text-[12px] text-[#8A837B] flex-shrink-0">{formatTime(conv.lastMessage.created_at)}</p>
        </div>
        {conv.partner.nationality && (
          <p className="text-xs text-neutral-400 truncate mb-1">{conv.partner.nationality}</p>
        )}
        <div className="flex items-center gap-1">
          {conv.lastMessage.sender_id === userId && (
            <svg className={`w-3 h-3 flex-shrink-0 ${conv.lastMessage.read_at ? "text-blue-400" : "text-neutral-300"}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              {conv.lastMessage.read_at ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l4 4 7-9m-2 4l4 4" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              )}
            </svg>
          )}
          <p className="text-xs text-neutral-500 truncate">
            {conv.lastMessage.image_url ? t.msgImagePlaceholder : conv.lastMessage.content}
          </p>
        </div>
      </div>

      {/* Unread badge */}
      {conv.unreadCount > 0 ? (
        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#4A1D3F] text-[10px] text-white font-bold flex items-center justify-center">
          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
        </span>
      ) : (
        <svg className="w-3.5 h-3.5 text-[#E5DED2] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

export default React.memo(ConversationItem);
