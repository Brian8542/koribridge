import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function sortMessages(messages) {
  return [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

function mergeMessages(existing, next) {
  const map = new Map();
  sortMessages([...existing, ...next]).forEach((message) => {
    map.set(message.id, message);
  });
  return Array.from(map.values());
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
  const messageEndRef = useRef(null);

  const roomId = useMemo(() => {
    if (!user || !partnerId) return null;
    return [user.id, partnerId].sort().join(":");
  }, [user, partnerId]);

  useEffect(() => {
    if (!user || !partnerId) return;

    const loadChat = async () => {
      const partnerResult = await supabase
        .from("profiles")
        .select("id, display_name, nationality, native_language, learning_language")
        .eq("id", partnerId)
        .maybeSingle();

      const messagesResult = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (partnerResult.error) {
        setPartner(null);
      } else if (!partnerResult.data) {
        setPartner({
          id: partnerId,
          display_name: "알 수 없는 사용자",
          nationality: "",
          native_language: "",
          learning_language: "",
        });
      } else {
        setPartner(partnerResult.data);
      }

      setMessages(messagesResult.data ? sortMessages(messagesResult.data) : []);
      setChatLoading(false);
    };

    loadChat();
  }, [user, partnerId]);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const message = payload.new;
          if (
            (message.sender_id === user.id && message.receiver_id === partnerId) ||
            (message.sender_id === partnerId && message.receiver_id === user.id)
          ) {
            setMessages((prev) => mergeMessages(prev, [message]));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user, partnerId]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !user || !partnerId) return;

    setSendLoading(true);
    const content = newMessage.trim();

    const { data, error } = await supabase.from("messages").insert([
      {
        sender_id: user.id,
        receiver_id: partnerId,
        content,
      },
    ]);

    setSendLoading(false);

    if (!error && data?.length > 0) {
      setMessages((prev) => mergeMessages(prev, data));
      setNewMessage("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (loading || chatLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">채팅 로딩 중...</div>
      </div>
    );
  }

  if (!user || !partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-semibold">채팅 상대를 찾을 수 없습니다.</p>
          <button onClick={() => navigate(-1)} className="mt-6 btn-secondary">
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800">
          ← 뒤로
        </button>
        <div>
          <p className="text-sm text-gray-500">채팅 상대</p>
          <p className="text-lg font-bold text-gray-900">{partner.display_name}</p>
        </div>
        <div className="w-16" />
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto grid gap-4">
        <div className="card overflow-hidden">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-4 py-5">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-20">첫 메시지를 보내보세요.</div>
            ) : (
              messages.map((message) => {
                const isMine = message.sender_id === user.id;
                return (
                  <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm ${
                        isMine ? "bg-red-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="mt-2 text-[11px] text-gray-400 text-right">{formatTime(message.created_at)}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messageEndRef} />
          </div>
        </div>

        <form onSubmit={handleSend} className="grid gap-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            className="input-field resize-none"
            placeholder="메시지를 입력하세요..."
          />
          <button type="submit" disabled={sendLoading || !newMessage.trim()} className="btn-primary">
            {sendLoading ? "전송 중..." : "보내기"}
          </button>
        </form>
      </div>
    </div>
  );
}
