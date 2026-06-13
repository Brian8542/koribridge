import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
}

function sortMessages(messages) {
  return [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

export default function ChatPage() {
  const { partnerId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [translations, setTranslations] = useState({});
  const [translationLoading, setTranslationLoading] = useState({});
  const [visibleTranslation, setVisibleTranslation] = useState({});
  const messageEndRef = useRef(null);

  const addMessage = (message) => {
    if (!message?.id) return;
    setMessages((prev) => {
      if (prev.some((item) => item.id === message.id)) return prev;
      return sortMessages([...prev, message]);
    });
  };

  const markMessagesRead = async () => {
    if (!user?.id || !partnerId) return;
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .match({ sender_id: partnerId, receiver_id: user.id })
      .is("read_at", null);
  };

  useEffect(() => {
    if (!user || !partnerId) return;

    const loadChat = async () => {
      const partnerResult = await supabase
        .from("profiles")
        .select("id, display_name, nationality, native_language, learning_language, avatar_url")
        .eq("id", partnerId)
        .maybeSingle();

      const messagesResult = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at, read_at")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (!partnerResult.data) {
        setPartner({ id: partnerId, display_name: "알 수 없는 사용자", nationality: "" });
      } else {
        setPartner(partnerResult.data);
      }

      setMessages(messagesResult.data ? sortMessages(messagesResult.data) : []);
      setChatLoading(false);
      await markMessagesRead();
    };

    loadChat();
  }, [user, partnerId]);

  useEffect(() => {
    if (!user?.id || !partnerId) return;

    const channel = supabase
      .channel(`chat-${partnerId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${user.id}`,
      }, (payload) => {
        addMessage(payload.new);
        markMessagesRead();
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `sender_id=eq.${user.id}`,
      }, (payload) => {
        // 읽음 상태 업데이트 반영
        setMessages((prev) =>
          prev.map((m) => m.id === payload.new.id ? { ...m, read_at: payload.new.read_at } : m)
        );
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id, partnerId]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const translateMessage = async (message) => {
    if (!message?.id) return;
    const isVisible = visibleTranslation[message.id];
    if (translations[message.id]) {
      setVisibleTranslation((prev) => ({ ...prev, [message.id]: !isVisible }));
      return;
    }

    const targetLang = message.sender_id === user.id ? "ko" : "en";
    const sourceLang = targetLang === "ko" ? "en" : "ko";
    setTranslationLoading((prev) => ({ ...prev, [message.id]: true }));

    try {
      const response = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: message.content, source: sourceLang, target: targetLang, format: "text" }),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setTranslations((prev) => ({ ...prev, [message.id]: result.translatedText || "번역 불가" }));
      setVisibleTranslation((prev) => ({ ...prev, [message.id]: true }));
    } catch {
      setTranslations((prev) => ({ ...prev, [message.id]: "번역 실패" }));
      setVisibleTranslation((prev) => ({ ...prev, [message.id]: true }));
    } finally {
      setTranslationLoading((prev) => ({ ...prev, [message.id]: false }));
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm("메시지를 삭제하시겠습니까?")) return;
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)
      .eq("sender_id", user.id); // 본인 메시지만 삭제 가능
    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !user?.id || !partnerId) return;
    const msgToSend = newMessage.trim();
    setNewMessage("");
    setSendLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([{ sender_id: user.id, receiver_id: partnerId, content: msgToSend }])
        .select();
      if (!error && data?.length > 0) addMessage(data[0]);
    } catch (err) {
      console.error("메시지 전송 실패:", err);
    } finally {
      setSendLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading || chatLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">채팅 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user || !partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-semibold">채팅 상대를 찾을 수 없습니다.</p>
          <button onClick={() => navigate(-1)} className="mt-6 btn-secondary">뒤로 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800 flex-shrink-0">← 뒤로</button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {partner.avatar_url ? (
            <img src={partner.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 flex-shrink-0">
              {partner.display_name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{partner.display_name}</p>
            <p className="text-xs text-gray-400 truncate">{partner.nationality}</p>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-3xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-sm">첫 메시지를 보내보세요.</div>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === user.id;
            const translatedText = translations[message.id];
            const isVisible = visibleTranslation[message.id];
            const isLoading = translationLoading[message.id];
            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"} group`}>
                <div className="max-w-[80%]">
                  <div className={`rounded-3xl px-4 py-3 text-sm ${isMine ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-900"}`}>
                    <p className="leading-relaxed">{message.content}</p>
                    <div className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${isMine ? "text-red-200" : "text-gray-400"}`}>
                      <span>{formatTime(message.created_at)}</span>
                      <div className="flex items-center gap-2">
                        {isMine && (
                          <span className={message.read_at ? "text-blue-300" : "text-red-200"}>
                            {message.read_at ? "✓✓" : "✓"}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => translateMessage(message)}
                          className={`text-xs ${isMine ? "text-red-200 hover:text-white" : "text-blue-500 hover:text-blue-700"}`}
                        >
                          {isLoading ? "번역 중..." : translatedText ? (isVisible ? "숨기기" : "번역 보기") : "번역 보기"}
                        </button>
                        {isMine && (
                          <button
                            type="button"
                            onClick={() => deleteMessage(message.id)}
                            className="text-xs text-red-200 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="삭제"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {translatedText && isVisible && (
                    <div className={`mt-1.5 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-2.5 text-xs text-gray-600 ${isMine ? "text-right" : ""}`}>
                      {translatedText}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 sticky bottom-0">
        <form onSubmit={sendMessage} className="flex gap-2 max-w-3xl mx-auto">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="input-field resize-none flex-1 text-sm"
            placeholder="메시지를 입력하세요... (Enter로 전송)"
          />
          <button
            type="submit"
            disabled={sendLoading || !newMessage.trim()}
            className="btn-primary px-5 self-end disabled:opacity-50"
          >
            {sendLoading ? "..." : "보내기"}
          </button>
        </form>
      </div>
    </div>
  );
}
