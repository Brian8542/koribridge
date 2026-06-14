import React from "react";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../utils/formatters";

function ConversationItem({ conv, userId, isOnline }) {
  const navigate = useNavigate();

  return (
    <div className="card p-5 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {conv.partner.avatar_url ? (
            <img
              src={conv.partner.avatar_url}
              alt={conv.partner.display_name}
              loading="lazy"
              className="w-14 h-14 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl font-bold text-red-600 border border-gray-200">
              {conv.partner.display_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <span
            className={`absolute -bottom-0.5 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
              isOnline ? "bg-emerald-500" : "bg-gray-300"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">{conv.partner.display_name}</p>
              <p className="text-xs text-gray-500">{conv.partner.nationality}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">{formatTime(conv.lastMessage.created_at)}</p>
              {conv.unreadCount > 0 && (
                <span className="mt-1 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white min-w-[20px]">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {conv.lastMessage.sender_id === userId && (
              <span className={`text-xs ${conv.lastMessage.read_at ? "text-blue-500" : "text-gray-300"}`}>
                {conv.lastMessage.read_at ? "✓✓" : "✓"}
              </span>
            )}
            <p className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/chat/${conv.partnerId}`)}
        className="mt-4 btn-primary w-full py-2.5 text-sm"
      >
        대화 이어가기
      </button>
    </div>
  );
}

export default React.memo(ConversationItem);
