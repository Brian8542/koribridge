import React, { useState, useCallback, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocale } from "../hooks/useLocale";
import { useToast } from "../components/Toast";
import { supabase } from "../lib/supabase";
import PostCard from "../components/PostCard";
import PostComposerModal from "../components/PostComposerModal";
import PostDetailModal from "../components/PostDetailModal";

const PAGE_SIZE = 20;

const LANGUAGES = [
  "한국어", "영어", "베트남어", "태국어", "필리핀어(타갈로그)",
  "인도네시아어", "말레이어", "카자흐어", "우즈베크어", "중국어", "일본어", "기타",
];

function CommunityPage({ currentUser, blockedIds }) {
  const { t } = useLocale();
  const { showToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [langFilter, setLangFilter] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [detailPost, setDetailPost] = useState(null);
  const offsetRef = useRef(0);

  const fetchPosts = useCallback(async (reset = false) => {
    const offset = reset ? 0 : offsetRef.current;
    if (reset) setLoading(true);

    let query = supabase
      .from("posts")
      .select("*, author:profiles(id, display_name, avatar_url), post_likes(user_id), post_comments(id)")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (langFilter) query = query.eq("language", langFilter);

    const { data, error } = await query;
    setLoading(false);
    if (error) return;

    const all = data || [];
    const visible = all.filter((p) => !blockedIds?.includes(p.author_id));

    if (reset) {
      setPosts(visible);
      offsetRef.current = all.length;
    } else {
      setPosts((prev) => [...prev, ...visible]);
      offsetRef.current += all.length;
    }
    setHasMore(all.length === PAGE_SIZE);
  }, [langFilter, blockedIds]);

  useEffect(() => {
    offsetRef.current = 0;
    fetchPosts(true);
  }, [fetchPosts]);

  const handlePosted = useCallback(() => {
    offsetRef.current = 0;
    fetchPosts(true);
  }, [fetchPosts]);

  const applyLike = useCallback((postId, wasLiked, userId) => {
    const updater = (p) => {
      if (p.id !== postId) return p;
      const likes = p.post_likes ?? [];
      return {
        ...p,
        post_likes: wasLiked
          ? likes.filter((l) => l.user_id !== userId)
          : [...likes, { user_id: userId }],
      };
    };
    setPosts((prev) => prev.map(updater));
    setDetailPost((prev) => (prev && prev.id === postId ? updater(prev) : prev));
  }, []);

  const handleLike = useCallback(async (postId, wasLiked) => {
    if (!currentUser) return;
    applyLike(postId, wasLiked, currentUser.id);
    try {
      if (wasLiked) {
        await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", currentUser.id);
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: currentUser.id });
      }
    } catch {
      showToast(t.communityLikeToggleFailed, "error");
      applyLike(postId, !wasLiked, currentUser.id);
    }
  }, [currentUser, applyLike, showToast, t]);

  const handleDelete = useCallback(async (postId) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      showToast(t.communityPostDeleteFailed, "error");
    } else {
      showToast(t.communityPostDeleted, "success");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setDetailPost((prev) => (prev?.id === postId ? null : prev));
    }
  }, [showToast, t]);

  const handleOpen = useCallback((post) => setDetailPost(post), []);

  return (
    <>
      <Helmet><title>KoriBridge - 커뮤니티</title></Helmet>

      {/* Lang filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4">
        <button
          onClick={() => setLangFilter("")}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
            !langFilter ? "bg-[#1d1d1f] text-white" : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]"
          }`}
        >
          {t.communityAllLangs}
        </button>
        {LANGUAGES.map((l) => (
          <button
            key={l}
            onClick={() => setLangFilter(l)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
              langFilter === l ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-apple border border-[#d2d2d7]/40 p-4 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#f5f5f7]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-[#f5f5f7] rounded-full w-28" />
                  <div className="h-3 bg-[#f5f5f7] rounded-full w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3.5 bg-[#f5f5f7] rounded-full" />
                <div className="h-3.5 bg-[#f5f5f7] rounded-full w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#86868b]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <p className="text-[16px] font-semibold text-[#1d1d1f] mb-1">{t.communityEmpty}</p>
          <p className="text-[13px] text-[#86868b]">{t.communityEmptyDesc}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              onLike={handleLike}
              onDelete={handleDelete}
              onOpen={handleOpen}
            />
          ))}
          {hasMore && (
            <button
              onClick={() => fetchPosts(false)}
              className="w-full py-3 text-[14px] font-semibold text-[#0071e3] hover:text-[#0077ed] transition-colors"
            >
              {t.communityLoadMore}
            </button>
          )}
        </div>
      )}

      {/* FAB — fixed above bottom nav */}
      <button
        onClick={() => setShowComposer(true)}
        className="fixed bottom-[76px] right-5 z-30 w-14 h-14 bg-[#0071e3] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#0077ed] active:scale-95 transition-all"
        aria-label={t.communityNewPost}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {showComposer && currentUser && (
        <PostComposerModal
          currentUser={currentUser}
          onClose={() => setShowComposer(false)}
          onPosted={handlePosted}
        />
      )}

      {detailPost && (
        <PostDetailModal
          post={detailPost}
          currentUserId={currentUser?.id}
          onClose={() => setDetailPost(null)}
          onLike={handleLike}
          onPostDeleted={handleDelete}
        />
      )}
    </>
  );
}

export default CommunityPage;
