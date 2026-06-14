import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import ConfirmModal from "../components/ConfirmModal";
import { formatTime } from "../utils/formatters";

function sortMsgs(msgs) {
  return [...msgs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

export default function ChatPage() {
  const { partnerId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const onlineIds = useOnlineUsers(user?.id);

  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [translations, setTranslations] = useState({});
  const [translationLoading, setTranslationLoading] = useState({});
  const [visibleTranslation, setVisibleTranslation] = useState({});
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const addMessage = useCallback((msg) => {
    if (!msg?.id) return;
    setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : sortMsgs([...prev, msg]));
  }, []);

  const markRead = useCallback(async () => {
    if (!user?.id || !partnerId) return;
    await supabase.from("messages").update({ read_at: new Date().toISOString() })
      .match({ sender_id: partnerId, receiver_id: user.id }).is("read_at", null);
  }, [user?.id, partnerId]);

  useEffect(() => {
    if (!user || !partnerId) return;
    const load = async () => {
      const pr = await supabase.from("profiles")
        .select("id, display_name, nationality, native_language, learning_language, avatar_url")
        .eq("id", partnerId).maybeSingle();
      const mr = await supabase.from("messages")
        .select("id, sender_id, receiver_id, content, image_url, created_at, read_at, edited_at")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      setPartner(pr.data || { id: partnerId, display_name: "알 수 없는 사용자", nationality: "" });
      setMessages(mr.data ? sortMsgs(mr.data) : []);
      setChatLoading(false);
      await markRead();
    };
    load();
  }, [user, partnerId, markRead]);

  useEffect(() => {
    if (!user?.id || !partnerId) return;
    const ch = supabase.channel("chat-" + partnerId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: "receiver_id=eq." + user.id },
        (p) => { addMessage(p.new); markRead(); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: "sender_id=eq." + user.id },
        (p) => setMessages((prev) => prev.map((m) => m.id === p.new.id ? { ...m, ...p.new } : m)))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" },
        (p) => setMessages((prev) => prev.filter((m) => m.id !== p.old.id)))
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [user?.id, partnerId, addMessage, markRead]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [newMessage]);

  const translateMessage = async (msg) => {
    if (!msg?.id) return;
    if (translations[msg.id]) {
      setVisibleTranslation((p) => ({ ...p, [msg.id]: !p[msg.id] }));
      return;
    }
    const tgt = msg.sender_id === user.id ? "ko" : "en";
    const src = tgt === "ko" ? "en" : "ko";
    setTranslationLoading((p) => ({ ...p, [msg.id]: true }));
    try {
      const res = await fetch("https://libretranslate.de/translate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: msg.content, source: src, target: tgt, format: "text" }),
      });
      const r = await res.json();
      if (r.error) throw new Error(r.error);
      setTranslations((p) => ({ ...p, [msg.id]: r.translatedText || "번역 불가" }));
      setVisibleTranslation((p) => ({ ...p, [msg.id]: true }));
    } catch {
      setTranslations((p) => ({ ...p, [msg.id]: "번역 실패" }));
      setVisibleTranslation((p) => ({ ...p, [msg.id]: true }));
    } finally {
      setTranslationLoading((p) => ({ ...p, [msg.id]: false }));
    }
  };

  const deleteMessage = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteMessage = async () => {
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    const { error } = await supabase.from("messages").delete().eq("id", id).eq("sender_id", user.id);
    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showToast("메시지가 삭제되었습니다.", "success");
    } else {
      showToast("메시지 삭제에 실패했습니다.", "error");
    }
  };

  const startEditMessage = (msg) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const saveEditedMessage = async (msgId) => {
    if (!editContent.trim() || !user?.id) return;
    setSaveLoading(true);
    try {
      const { error } = await supabase.from("messages")
        .update({ content: editContent.trim(), edited_at: new Date().toISOString() })
        .eq("id", msgId)
        .eq("sender_id", user.id);
      if (error) throw error;
      setMessages((prev) => prev.map((msg) =>
        msg.id === msgId ? { ...msg, content: editContent.trim(), edited_at: new Date().toISOString() } : msg
      ));
      cancelEditMessage();
      showToast("메시지가 수정되었습니다.", "success");
    } catch {
      showToast("메시지 수정에 실패했습니다.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast("복사됨", "success", 2000);
    });
  };

  const handleEditKeyDown = (e, msgId) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEditedMessage(msgId); }
    else if (e.key === "Escape") { cancelEditMessage(); }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("이미지는 5MB 이하여야 합니다.", "error");
      return;
    }
    setImageUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = user.id + "/" + Date.now() + "." + ext;
      const { error: ue } = await supabase.storage.from("chat-images").upload(path, file);
      if (ue) throw ue;
      const { data } = supabase.storage.from("chat-images").getPublicUrl(path);
      const { data: md, error: me } = await supabase.from("messages")
        .insert([{ sender_id: user.id, receiver_id: partnerId, content: "이미지", image_url: data.publicUrl }]).select();
      if (!me && md?.length > 0) addMessage(md[0]);
    } catch {
      showToast("이미지 전송에 실패했습니다.", "error");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !user?.id || !partnerId) return;
    const msg = newMessage.trim();
    setNewMessage("");
    setSendLoading(true);
    try {
      const { data, error } = await supabase.from("messages")
        .insert([{ sender_id: user.id, receiver_id: partnerId, content: msg }]).select();
      if (!error && data?.length > 0) addMessage(data[0]);
    } catch {
      showToast("메시지 전송에 실패했습니다.", "error");
    } finally {
      setSendLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  if (loading || chatLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">채팅 불러오는 중...</p>
      </div>
    </div>
  );

  if (!user || !partner) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
        <p className="text-red-600 font-semibold">채팅 상대를 찾을 수 없습니다.</p>
        <button onClick={() => navigate(-1)} className="mt-6 btn-secondary">뒤로 가기</button>
      </div>
    </div>
  );

  const isPartnerOnline = onlineIds.has(partner?.id);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 flex-shrink-0">← 뒤로</button>
        <button onClick={() => navigate("/profile/" + partner.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          {partner.avatar_url ? (
            <img src={partner.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 flex-shrink-0">
              {partner.display_name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{partner.display_name}</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isPartnerOnline ? "bg-emerald-400" : "bg-gray-300"}`} />
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                {isPartnerOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-3xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-sm">첫 메시지를 보내보세요.</div>
        ) : messages.map((msg, idx) => {
          const isMine = msg.sender_id === user.id;
          const tTxt = translations[msg.id];
          const tVis = visibleTranslation[msg.id];
          const tLoad = translationLoading[msg.id];

          const currentDate = new Date(msg.created_at).toLocaleDateString("ko-KR", {
            year: "numeric", month: "long", day: "numeric",
          });
          const prevDate = idx > 0
            ? new Date(messages[idx - 1].created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
            : null;
          const showDateDivider = currentDate !== prevDate;

          return (
            <React.Fragment key={msg.id}>
              {showDateDivider && (
                <div className="flex justify-center my-6">
                  <span className="bg-gray-200/60 text-gray-500 text-[10px] px-3 py-1 rounded-full font-bold">{currentDate}</span>
                </div>
              )}
              <div className={"flex " + (isMine ? "justify-end" : "justify-start") + " group"}>
                <div className="max-w-xs sm:max-w-sm">
                  <div
                    onDoubleClick={() => isMine && !msg.image_url && startEditMessage(msg)}
                    className={"rounded-3xl overflow-hidden text-sm cursor-default " + (isMine ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-900")}
                  >
                    {msg.image_url && (
                      <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                        <img src={msg.image_url} alt="이미지" className="max-w-full max-h-64 object-cover" />
                      </a>
                    )}
                    {!msg.image_url && (
                      <div className="px-4 pt-3 pb-1">
                        {editingMessageId === msg.id ? (
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, msg.id)}
                            rows={3}
                            className="w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-900"
                          />
                        ) : (
                          <p className="leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                    )}
                    <div className={"px-4 pb-3 flex items-center justify-between gap-2 text-xs " + (isMine ? "text-red-200" : "text-gray-400")}>
                      <span>
                        {formatTime(msg.created_at)}
                        {msg.edited_at && <span className="ml-2 text-[10px] text-current opacity-80">(수정됨)</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        {isMine && <span className={msg.read_at ? "text-blue-300" : ""}>{msg.read_at ? "✓✓" : "✓"}</span>}
                        {!msg.image_url && editingMessageId !== msg.id && (
                          <button
                            onClick={() => copyToClipboard(msg.content)}
                            className={"opacity-0 group-hover:opacity-100 transition-opacity text-xs " + (isMine ? "text-red-200 hover:text-white" : "text-gray-400 hover:text-gray-600")}
                          >
                            복사
                          </button>
                        )}
                        {!msg.image_url && (
                          <button
                            onClick={() => translateMessage(msg)}
                            className={"text-xs " + (isMine ? "text-red-200 hover:text-white" : "text-blue-500 hover:text-blue-700")}
                          >
                            {tLoad ? "번역중..." : tTxt ? (tVis ? "숨기기" : "번역보기") : "번역보기"}
                          </button>
                        )}
                        {isMine && editingMessageId === msg.id && (
                          <>
                            <button onClick={() => saveEditedMessage(msg.id)} disabled={saveLoading}
                              className="text-xs rounded-full bg-white bg-opacity-10 px-2 py-1 text-white hover:bg-opacity-20">
                              {saveLoading ? "저장중" : "저장"}
                            </button>
                            <button onClick={cancelEditMessage} className="text-xs text-white hover:underline">취소</button>
                          </>
                        )}
                        {isMine && editingMessageId !== msg.id && (
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-red-200 hover:text-white"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {tTxt && tVis && (
                    <div className={"mt-1 rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-600 " + (isMine ? "text-right" : "")}>
                      {tTxt}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-4 sticky bottom-0">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar max-w-3xl mx-auto">
          {["😀", "😂", "🥰", "😮", "😢", "😡", "👍", "🙌", "✨", "❤️"].map((emoji) => (
            <button key={emoji} onClick={() => handleEmojiClick(emoji)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 text-sm transition-colors">
              {emoji}
            </button>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 max-w-3xl mx-auto items-center">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={imageUploading}
            className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50">
            {imageUploading
              ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <span>📷</span>}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <textarea ref={textareaRef} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown}
            rows={1} className="input-field resize-none flex-1 text-sm py-3 h-11 min-h-[44px] max-h-[120px]"
            placeholder="메시지를 입력하세요..." />
          <button type="submit" disabled={sendLoading || !newMessage.trim()} className="btn-primary px-5 self-end h-10 disabled:opacity-50 flex-shrink-0">
            {sendLoading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : "보내기"}
          </button>
        </form>
      </div>

      {deleteConfirmId && (
        <ConfirmModal
          message="메시지를 삭제하시겠습니까?"
          confirmLabel="삭제하기"
          cancelLabel="취소"
          danger
          onConfirm={confirmDeleteMessage}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
