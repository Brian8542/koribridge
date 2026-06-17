import React from "react";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../utils/formatters";
import { isRealAvatar, getAvatarGradient } from "../utils/avatarUtils";

function ConversationItem({ conv, userId, isOnline }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/chat/${conv.partnerId}`)}
      className="card p-4 w-full text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] flex items-center gap-4 min-h-[80px]"
    >
      <div className="relative flex-shrink-0">
        {isRealAvatar(conv.partner.avatar_url) ? (
          <img
            src={conv.partner.avatar_url}
            alt={conv.partner.display_name}
            loading="lazy"
            className="w-14 h-14 rounded-2xl object-cover"
          />
        ) : (
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarGradient(conv.partner.avatar_url, conv.partner.id)} flex items-center justify-center text-xl font-bold text-white`}>
            {conv.partner.display_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${isOnline ? "bg-emerald-400" : "bg-gray-300"}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{conv.partner.display_name}</p>
            {conv.partner.nationality && (
              <p className="text-xs text-gray-400 mt-0.5">{conv.partner.nationality}</p>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-xs text-gray-400">{formatTime(conv.lastMessage.created_at)}</p>
            {conv.unreadCount > 0 && (
              <span className="mt-1 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white min-w-[20px]">
                {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
              </span>
            )}
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-1">
          {conv.lastMessage.sender_id === userId && (
            <span className={`text-xs flex-shrink-0 ${conv.lastMessage.read_at ? "text-blue-400" : "text-gray-300"}`}>
              {conv.lastMessage.read_at ? "✓✓" : "✓"}
            </span>
          )}
          <p className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</p>
        </div>
      </div>

      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

export default React.memo(ConversationItem);
