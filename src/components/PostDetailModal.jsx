import React, { useState, useCallback, useEffect, useRef } from "react";
import { useLocale } from "../hooks/useLocale";
import { useToast } from "./Toast";
import { supabase } from "../lib/supabase";
import ConfirmModal from "./ConfirmModal";

function timeAgo(ts, locale) {
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

function PostDetailModal({ post, currentUserId, onClose, onLike, onPostDeleted }) {
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  const bottomRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [isCorrection, setIsCorrection] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const liked = post.post_likes?.some((l) => l.user_id === currentUserId);
  const likeCount = post.post_likes?.length ?? 0;

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from("post_comments")
      .select("*, author:profiles(id, display_name, avatar_url)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (!error) setComments(data || []);
    setLoadingComments(false);
  }, [post.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmitComment = useCallback(async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) { showToast(t.communityContentTooLong, "error"); return; }

    setSubmitting(true);
    try {
      const payload = {
        post_id: post.id,
        author_id: currentUserId,
        content: trimmed,
        is_correction: isCorrection,
        corrected_text: isCorrection && correctedText.trim() ? correctedText.trim() : null,
      };
      const { error } = await supabase.from("post_comments").insert(payload);
      if (error) throw error;
      showToast(t.communityCommentSuccess, "success");
      setCommentText("");
      setCorrectedText("");
      setIsCorrection(false);
      await fetchComments();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      showToast(t.communityCommentFailed, "error");
    } finally {
      setSubmitting(false);
    }
  }, [commentText, correctedText, isCorrection, post.id, currentUserId, showToast, t, fetchComments]);

  const handleDeleteComment = useCallback(async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    const { error } = await supabase.from("post_comments").delete().eq("id", id);
    if (error) {
      showToast(t.communityCommentDeleteFailed, "error");
    } else {
      showToast(t.communityCommentDeleted, "success");
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  }, [deleteTarget, showToast, t]);

  const handleLike = useCallback((e) => {
    e.stopPropagation();
    onLike(post.id, liked);
  }, [onLike, post.id, liked]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1E1B18]/40 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-t-[28px] sm:rounded-apple-lg w-full sm:max-w-lg max-h-[92vh] flex flex-col shadow-xl border border-[#E5DED2]/40">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#E5DED2]/40 flex-shrink-0">
            <h2 className="text-[16px] font-bold text-[#1E1B18]">{t.communityCommentCount}</h2>
            <button onClick={onClose} className="text-[#8A837B] hover:text-[#1E1B18] p-1 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable area */}
          <div className="flex-1 overflow-y-auto">
            {/* Original post */}
            <div className="px-5 py-4 border-b border-[#F3EEE6]">
              <div className="flex items-start gap-3 mb-2">
                <img
                  src={post.author?.avatar_url || `https://api.dicebear.com/8.x/thumbs/svg?seed=${post.author_id}`}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-[#F3EEE6]"
                />
                <div>
                  <span className="text-[14px] font-semibold text-[#1E1B18]">
                    {post.author?.display_name || t.unknownUser}
                  </span>
                  {post.language && (
                    <span className="ml-2 bg-[#F1E9EE] text-[#4A1D3F] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      {post.language}
                    </span>
                  )}
                  <div className="text-[12px] text-[#8A837B]">{timeAgo(post.created_at, locale)}</div>
                </div>
              </div>
              <p className="text-[14px] text-[#1E1B18] leading-relaxed whitespace-pre-wrap break-words mb-2">
                {post.content}
              </p>
              {post.image_url && (
                <div className="rounded-[14px] overflow-hidden bg-[#F3EEE6] mb-2">
                  <img src={post.image_url} alt="" className="w-full max-h-64 object-cover" />
                </div>
              )}
              {/* Like row on post */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors mt-1 ${
                  liked ? "text-[#C4402E]" : "text-[#8A837B] hover:text-[#C4402E]"
                }`}
              >
                <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
                {likeCount > 0 ? likeCount : t.communityLikeCount}
              </button>
            </div>

            {/* Comments */}
            <div className="px-5 py-3 space-y-4">
              {loadingComments ? (
                <div className="text-center py-6 text-[13px] text-[#8A837B]">{t.loading}</div>
              ) : comments.length === 0 ? (
                <p className="text-center py-6 text-[13px] text-[#8A837B]">{t.communityNoComments}</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <img
                      src={c.author?.avatar_url || `https://api.dicebear.com/8.x/thumbs/svg?seed=${c.author_id}`}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 bg-[#F3EEE6]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#1E1B18]">
                          {c.author?.display_name || t.unknownUser}
                        </span>
                        {c.is_correction && (
                          <span className="bg-[#fff3cd] text-[#856404] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {t.communityCorrection}
                          </span>
                        )}
                        <span className="text-[11px] text-[#8A837B] ml-auto flex-shrink-0">
                          {timeAgo(c.created_at, locale)}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#1E1B18] leading-relaxed whitespace-pre-wrap break-words mt-0.5">
                        {c.content}
                      </p>
                      {c.is_correction && c.corrected_text && (
                        <div className="mt-1.5 bg-[#f0fdf4] border border-[#86efac] rounded-[10px] px-3 py-2">
                          <p className="text-[12px] text-[#166534] leading-relaxed">{c.corrected_text}</p>
                        </div>
                      )}
                      {c.author_id === currentUserId && (
                        <button
                          onClick={() => setDeleteTarget(c.id)}
                          className="mt-1 text-[11px] text-[#8A837B] hover:text-[#C4402E] transition-colors"
                        >
                          {t.deleteMsg}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Comment composer */}
          <div className="px-5 pb-5 pt-3 border-t border-[#E5DED2]/40 flex-shrink-0 space-y-2">
            {/* Correction toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setIsCorrection((v) => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
                  isCorrection ? "bg-[#f59e0b]" : "bg-[#E5DED2]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    isCorrection ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-[12px] font-semibold text-[#8A837B]">{t.communityCorrectionToggle}</span>
            </label>

            <textarea
              className="w-full resize-none rounded-[14px] bg-[#F3EEE6] border border-transparent focus:border-[#4A1D3F] focus:bg-white transition-colors p-3 text-[13px] text-[#1E1B18] placeholder-[#8A837B] outline-none"
              rows={2}
              maxLength={500}
              placeholder={isCorrection ? t.communityCorrectionPlaceholder : t.communityCommentPlaceholder}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />

            {isCorrection && (
              <textarea
                className="w-full resize-none rounded-[14px] bg-[#f0fdf4] border border-transparent focus:border-[#22c55e] transition-colors p-3 text-[13px] text-[#1E1B18] placeholder-[#8A837B] outline-none"
                rows={2}
                maxLength={500}
                placeholder={t.communityCorrectedTextPlaceholder}
                value={correctedText}
                onChange={(e) => setCorrectedText(e.target.value)}
              />
            )}

            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-medium flex-1 ${commentText.length >= 500 ? "text-[#C4402E]" : "text-[#8A837B]"}`}>
                {commentText.length}/500{t.communityCommentCharCount}
              </span>
              <button
                onClick={handleSubmitComment}
                disabled={submitting || !commentText.trim()}
                className="px-5 py-2 rounded-full bg-[#4A1D3F] text-white text-[13px] font-semibold hover:bg-[#3B1732] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t.communityCommentSubmitting : t.communityCommentSubmit}
              </button>
            </div>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmModal
          message={t.communityCommentDeleteConfirm}
          confirmLabel={t.communityCommentDeleteLabel}
          cancelLabel={t.cancel}
          onConfirm={handleDeleteComment}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}
    </>
  );
}

export default React.memo(PostDetailModal);
