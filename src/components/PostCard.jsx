import React, { useCallback, useState } from "react";
import { useLocale } from "../hooks/useLocale";
import ConfirmModal from "./ConfirmModal";
import ReportModal from "./ReportModal";

function postTimeAgo(ts, locale) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (locale === "ko") {
    if (m < 1) return "방금";
    if (m < 60) return `${m}분 전`;
    if (h < 24) return `${h}시간 전`;
    if (d < 30) return `${d}일 전`;
    return new Date(ts).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  }
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d < 30) return `${d}d`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function PostCard({ post, currentUserId, onLike, onDelete, onOpen }) {
  const { t, locale } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const isOwn = post.author_id === currentUserId;
  const liked = post.post_likes?.some((l) => l.user_id === currentUserId);
  const likeCount = post.post_likes?.length ?? 0;
  const commentCount = post.post_comments?.length ?? 0;

  const handleLike = useCallback((e) => {
    e.stopPropagation();
    onLike(post.id, liked);
  }, [onLike, post.id, liked]);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    onDelete(post.id);
  }, [onDelete, post.id]);

  const handleMenuToggle = useCallback((e) => {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  }, []);

  const handleCardClick = useCallback(() => {
    onOpen(post);
  }, [onOpen, post]);

  return (
    <>
      <article
        className="bg-white rounded-apple border border-[#d2d2d7]/40 p-4 cursor-pointer hover:shadow-sm transition-shadow"
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <img
            src={post.author?.avatar_url || `https://api.dicebear.com/8.x/thumbs/svg?seed=${post.author_id}`}
            alt=""
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-[#f5f5f7]"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-semibold text-[#1d1d1f] truncate">
                {post.author?.display_name || t.unknownUser}
              </span>
              {post.language && (
                <span className="bg-[#e8f4ff] text-[#0071e3] text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                  {post.language}
                </span>
              )}
            </div>
            <span className="text-[12px] text-[#86868b]">
              {postTimeAgo(post.created_at, locale)}
            </span>
          </div>

          {/* Menu */}
          <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleMenuToggle}
              className="p-1.5 rounded-full text-[#86868b] hover:bg-[#f5f5f7] transition-colors"
              aria-label="more"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 bg-white rounded-apple border border-[#d2d2d7]/60 shadow-lg min-w-[140px] py-1 overflow-hidden">
                  {isOwn ? (
                    <button
                      onClick={() => { setMenuOpen(false); setShowDeleteConfirm(true); }}
                      className="w-full px-4 py-2.5 text-left text-[13px] text-[#ff3b30] hover:bg-[#f5f5f7] transition-colors"
                    >
                      {t.communityDeletePost}
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMenuOpen(false); setShowReport(true); }}
                      className="w-full px-4 py-2.5 text-left text-[13px] text-[#ff3b30] hover:bg-[#f5f5f7] transition-colors"
                    >
                      {t.communityReportPost}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-[14px] text-[#1d1d1f] leading-relaxed mb-3 whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {/* Image */}
        {post.image_url && (
          <div className="mb-3 rounded-[14px] overflow-hidden bg-[#f5f5f7]">
            <img
              src={post.image_url}
              alt=""
              className="w-full max-h-80 object-cover"
            />
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-[#f5f5f7]" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors ${
              liked ? "text-[#ff3b30]" : "text-[#86868b] hover:text-[#ff3b30]"
            }`}
          >
            <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
            {likeCount > 0 ? likeCount : t.communityLikeCount}
          </button>

          <button
            onClick={() => onOpen(post)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#86868b] hover:text-[#0071e3] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {commentCount > 0 ? `${commentCount} ${t.communityCommentCount}` : t.communityCommentCount}
          </button>
        </div>
      </article>

      {showDeleteConfirm && (
        <ConfirmModal
          message={t.communityPostDeleteConfirm}
          confirmLabel={t.communityPostDeleteLabel}
          cancelLabel={t.cancel}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          danger
        />
      )}

      {showReport && (
        <ReportModal
          targetId={post.author_id}
          onClose={() => setShowReport(false)}
          onSuccess={() => setShowReport(false)}
        />
      )}
    </>
  );
}

export default React.memo(PostCard);
