import React, { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import { useLocale } from "../hooks/useLocale";
import ConfirmModal from "../components/ConfirmModal";
import ReportModal from "../components/ReportModal";
import { formatTime } from "../utils/formatters";
import { startChat } from "../utils/analytics";
import { isRealAvatar, getAvatarGradient } from "../utils/avatarUtils";
import { sendPushNotification } from "../utils/pushNotifications";

const MSG_SELECT =
  "id, sender_id, receiver_id, content, image_url, voice_url, message_type, created_at, read_at, edited_at";

function sortMsgs(msgs) {
  return [...msgs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

function fmtSecs(s) {
  const sec = Math.floor(s || 0);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

const VoicePlayer = React.memo(function VoicePlayer({ url, isMine }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * duration;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 min-w-[200px]">
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          const dur = audioRef.current.duration || 1;
          setCurrentTime(audioRef.current.currentTime);
          setProgress(audioRef.current.currentTime / dur);
        }}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => { setPlaying(false); setProgress(0); setCurrentTime(0); }}
      />
      <button
        type="button"
        onClick={toggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          isMine ? "bg-white/20 hover:bg-white/30" : "bg-red-50 hover:bg-red-100"
        }`}
      >
        {playing ? (
          <svg className={`w-4 h-4 ${isMine ? "text-white" : "text-red-600"}`} fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className={`w-4 h-4 ml-0.5 ${isMine ? "text-white" : "text-red-600"}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>
      <div className="flex-1 flex flex-col gap-1.5">
        <div
          className={`h-1.5 rounded-full cursor-pointer ${isMine ? "bg-white/30" : "bg-gray-200"}`}
          onClick={handleSeek}
        >
          <div
            className={`h-full rounded-full transition-all duration-100 ${isMine ? "bg-white" : "bg-red-500"}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className={`flex justify-between text-[10px] font-mono ${isMine ? "text-red-200" : "text-gray-400"}`}>
          <span>{fmtSecs(currentTime)}</span>
          <span>{duration ? fmtSecs(duration) : "--:--"}</span>
        </div>
      </div>
    </div>
  );
});

export default function ChatPage() {
  const { partnerId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const onlineIds = useOnlineUsers(user?.id);
  const { t } = useLocale();

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
  const [reportOpen, setReportOpen] = useState(false);
  const [hasOlderMsgs, setHasOlderMsgs] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceUploading, setVoiceUploading] = useState(false);

  const [corrections, setCorrections] = useState({});
  const [correctionInputs, setCorrectionInputs] = useState({});
  const [openCorrectionIds, setOpenCorrectionIds] = useState(new Set());
  const [visibleCorrectionIds, setVisibleCorrectionIds] = useState(new Set());
  const [correctionLoading, setCorrectionLoading] = useState({});

  const MSGS_LIMIT = 50;
  const MSGS_LOAD_MORE = 30;
  const MAX_MSG_LENGTH = 1000;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const addMessage = useCallback((msg) => {
    if (!msg?.id) return;
    setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : sortMsgs([...prev, msg]));
  }, []);

  const markRead = useCallback(async () => {
    if (!user?.id || !partnerId) return;
    await supabase.from("messages").update({ read_at: new Date().toISOString() })
      .match({ sender_id: partnerId, receiver_id: user.id }).is("read_at", null);
  }, [user?.id, partnerId]);

  const loadCorrections = useCallback(async (msgIds) => {
    if (!msgIds.length) return;
    const { data } = await supabase.from("corrections")
      .select("message_id, corrected_text, note, corrector_id, original_text, created_at")
      .in("message_id", msgIds);
    if (data) {
      setCorrections((prev) => {
        const next = { ...prev };
        data.forEach((c) => { next[c.message_id] = c; });
        return next;
      });
    }
  }, []);

  useEffect(() => {
    if (!user || !partnerId) return;
    const load = async () => {
      setLoadError(false);
      setChatLoading(true);
      try {
        const pr = await supabase.from("profiles")
          .select("id, display_name, nationality, native_language, learning_language, avatar_url")
          .eq("id", partnerId).maybeSingle();
        const mr = await supabase.from("messages")
          .select(MSG_SELECT)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
          .order("created_at", { ascending: false })
          .limit(MSGS_LIMIT);
        if (pr.error) throw pr.error;
        setPartner(pr.data || { id: partnerId, display_name: t.unknownUser, nationality: "" });
        const sorted = mr.data ? sortMsgs(mr.data) : [];
        setMessages(sorted);
        setHasOlderMsgs((mr.data?.length || 0) === MSGS_LIMIT);
        startChat(partnerId);
        await markRead();
        await loadCorrections(sorted.map((m) => m.id));
      } catch {
        setLoadError(true);
      } finally {
        setChatLoading(false);
      }
    };
    load();
  }, [user, partnerId, markRead, t.unknownUser, loadCorrections]);

  useEffect(() => {
    if (!user?.id || !partnerId) return;
    const ch = supabase.channel("chat-" + partnerId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: "receiver_id=eq." + user.id },
        (p) => { addMessage(p.new); markRead(); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: "sender_id=eq." + user.id },
        (p) => setMessages((prev) => prev.map((m) => m.id === p.new.id ? { ...m, ...p.new } : m)))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" },
        (p) => setMessages((prev) => prev.filter((m) => m.id !== p.old.id)))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "corrections" },
        (p) => setCorrections((prev) => ({ ...prev, [p.new.message_id]: p.new })))
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

  useEffect(() => {
    return () => {
      clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const loadOlderMessages = async () => {
    if (!messages.length || loadingOlder) return;
    setLoadingOlder(true);
    const oldestMsg = messages[0];
    const { data } = await supabase.from("messages")
      .select(MSG_SELECT)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: false })
      .lt("created_at", oldestMsg.created_at)
      .limit(MSGS_LOAD_MORE);
    if (data && data.length > 0) {
      setMessages((prev) => sortMsgs([...data, ...prev]));
      setHasOlderMsgs(data.length === MSGS_LOAD_MORE);
      await loadCorrections(data.map((m) => m.id));
    } else {
      setHasOlderMsgs(false);
    }
    setLoadingOlder(false);
  };

  const uploadVoiceMemo = async (blob) => {
    if (!user?.id || !partnerId) return;
    setVoiceUploading(true);
    try {
      const path = `${user.id}/${Date.now()}.webm`;
      const { error: ue } = await supabase.storage
        .from("voice-memos")
        .upload(path, blob, { contentType: "audio/webm" });
      if (ue) throw ue;
      const { data: urlData } = supabase.storage.from("voice-memos").getPublicUrl(path);
      const { data: md, error: me } = await supabase.from("messages")
        .insert([{ sender_id: user.id, receiver_id: partnerId, content: t.voiceMemo, message_type: "voice", voice_url: urlData.publicUrl }])
        .select();
      if (me) throw me;
      if (md?.length > 0) addMessage(md[0]);
    } catch {
      showToast(t.voiceUploadFailed, "error");
    } finally {
      setVoiceUploading(false);
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size > 500) uploadVoiceMemo(blob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime((s) => s + 1), 1000);
    } catch {
      showToast(t.voicePermissionDenied, "error");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;
    clearInterval(recordingTimerRef.current);
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setRecordingTime(0);
  };

  const toggleCorrectionInput = (msgId) => {
    setOpenCorrectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
    setCorrectionInputs((prev) => prev[msgId] ? prev : { ...prev, [msgId]: { text: "", note: "" } });
  };

  const toggleCorrectionDetail = (msgId) => {
    setVisibleCorrectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  const submitCorrection = async (msgId, originalText) => {
    const input = correctionInputs[msgId];
    if (!input?.text?.trim()) return;
    setCorrectionLoading((prev) => ({ ...prev, [msgId]: true }));
    try {
      const { data: corrData, error } = await supabase.from("corrections").insert({
        message_id: msgId,
        corrector_id: user.id,
        original_text: originalText,
        corrected_text: input.text.trim(),
        note: input.note?.trim() || null,
      }).select().single();
      if (error) throw error;
      if (corrData) setCorrections((prev) => ({ ...prev, [msgId]: corrData }));
      showToast(t.correctDone, "success");
      setOpenCorrectionIds((prev) => { const n = new Set(prev); n.delete(msgId); return n; });
    } catch {
      showToast(t.correctFailed, "error");
    } finally {
      setCorrectionLoading((prev) => ({ ...prev, [msgId]: false }));
    }
  };

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
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(msg.content)}&langpair=${src}|${tgt}`
      );
      const r = await res.json();
      if (r.responseStatus !== 200) throw new Error(r.responseDetails || "translate failed");
      setTranslations((p) => ({ ...p, [msg.id]: r.responseData?.translatedText || "N/A" }));
      setVisibleTranslation((p) => ({ ...p, [msg.id]: true }));
    } catch {
      setTranslations((p) => ({ ...p, [msg.id]: "N/A" }));
      setVisibleTranslation((p) => ({ ...p, [msg.id]: true }));
    } finally {
      setTranslationLoading((p) => ({ ...p, [msg.id]: false }));
    }
  };

  const deleteMessage = (id) => setDeleteConfirmId(id);

  const confirmDeleteMessage = async () => {
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    const { error } = await supabase.from("messages").delete().eq("id", id).eq("sender_id", user.id);
    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showToast(t.msgDeleted, "success");
    } else {
      showToast(t.msgDeleteFailed, "error");
    }
  };

  const startEditMessage = (msg) => { setEditingMessageId(msg.id); setEditContent(msg.content); };
  const cancelEditMessage = () => { setEditingMessageId(null); setEditContent(""); };

  const saveEditedMessage = async (msgId) => {
    if (!editContent.trim() || !user?.id || editContent.length > MAX_MSG_LENGTH) return;
    setSaveLoading(true);
    try {
      const { error } = await supabase.from("messages")
        .update({ content: editContent.trim(), edited_at: new Date().toISOString() })
        .eq("id", msgId).eq("sender_id", user.id);
      if (error) throw error;
      setMessages((prev) => prev.map((msg) =>
        msg.id === msgId ? { ...msg, content: editContent.trim(), edited_at: new Date().toISOString() } : msg
      ));
      cancelEditMessage();
      showToast(t.msgEdited, "success");
    } catch {
      showToast(t.msgEditFailed, "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => showToast(t.copied, "success", 2000));
  };

  const handleEditKeyDown = (e, msgId) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEditedMessage(msgId); }
    else if (e.key === "Escape") cancelEditMessage();
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { showToast(t.errAvatarType, "error"); e.target.value = ""; return; }
    if (file.size > 5 * 1024 * 1024) { showToast(t.imgTooBig, "error"); e.target.value = ""; return; }
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
      showToast(t.imgSendFailed, "error");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !user?.id || !partnerId || newMessage.length > MAX_MSG_LENGTH) return;
    const msg = newMessage.trim();
    setNewMessage("");
    setSendLoading(true);
    try {
      const { data, error } = await supabase.from("messages")
        .insert([{ sender_id: user.id, receiver_id: partnerId, content: msg }]).select();
      if (!error && data?.length > 0) {
        addMessage(data[0]);
        sendPushNotification({
          receiverId: partnerId,
          title: t.pushMsgTitle,
          body: `${partner?.display_name || ""}: ${msg.slice(0, 80)}`,
          url: `/chat/${user.id}`,
        });
      }
    } catch {
      showToast(t.msgSendFailed, "error");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">{t.chatLoading}</p>
      </div>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-md border border-gray-100">
        <p className="text-4xl mb-4">📡</p>
        <p className="text-gray-900 font-extrabold text-lg">{t.chatError}</p>
        <p className="text-sm text-gray-500 mt-2">{t.chatErrorDesc}</p>
        <div className="flex gap-3 mt-6">
          <button onClick={() => navigate(-1)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition">{t.goBack}</button>
          <button onClick={() => { setLoadError(false); setChatLoading(true); }} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white text-sm font-bold hover:shadow-md transition-all">{t.retry}</button>
        </div>
      </div>
    </div>
  );

  if (!user || !partner) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-md">
        <p className="text-red-600 font-semibold">{t.chatNotFound}</p>
        <button onClick={() => navigate(-1)} className="mt-6 btn-secondary">{t.goBack}</button>
      </div>
    </div>
  );

  const isPartnerOnline = onlineIds.has(partner?.id);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet><title>KoriBridge - {partner.display_name || t.tabChat}</title></Helmet>

      <div className="bg-gradient-to-r from-red-600 to-rose-500 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-lg">
        <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white text-sm font-semibold flex-shrink-0 transition">{t.backBtn}</button>
        <button onClick={() => navigate("/profile/" + partner.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          {isRealAvatar(partner.avatar_url) ? (
            <img src={partner.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white/30 flex-shrink-0" />
          ) : (
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(partner.avatar_url, partner.id)} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
              {partner.display_name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-white truncate">{partner.display_name}</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isPartnerOnline ? "bg-emerald-300" : "bg-white/40"}`} />
              <p className="text-[10px] text-white/70 uppercase font-bold tracking-tight">{isPartnerOnline ? "Online" : "Offline"}</p>
            </div>
          </div>
        </button>
        <button onClick={() => setReportOpen(true)} className="text-white/60 hover:text-white flex-shrink-0 p-2 transition" title={t.reportUser}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-3xl w-full mx-auto">
        {hasOlderMsgs && (
          <div className="flex justify-center pt-2 pb-1">
            <button onClick={loadOlderMessages} disabled={loadingOlder}
              className="text-xs text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-full font-semibold transition shadow-sm disabled:opacity-50">
              {loadingOlder ? t.loadingOlder : t.loadOlder}
            </button>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-sm">{t.firstMessage}</div>
        ) : messages.map((msg, idx) => {
          const isMine = msg.sender_id === user.id;
          const isVoice = msg.message_type === "voice";
          const tTxt = translations[msg.id];
          const tVis = visibleTranslation[msg.id];
          const tLoad = translationLoading[msg.id];
          const correction = corrections[msg.id];
          const corrInputOpen = openCorrectionIds.has(msg.id);
          const corrDetailVisible = visibleCorrectionIds.has(msg.id);
          const corrInput = correctionInputs[msg.id] || { text: "", note: "" };
          const corrLoading = correctionLoading[msg.id];

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
                  <span className="bg-gray-200/70 text-gray-500 text-[10px] px-3 py-1 rounded-full font-bold">{currentDate}</span>
                </div>
              )}
              <div className={"flex " + (isMine ? "justify-end" : "justify-start") + " group"}>
                <div className="max-w-xs sm:max-w-sm w-full">
                  <div
                    onDoubleClick={() => isMine && !msg.image_url && !isVoice && startEditMessage(msg)}
                    className={
                      "rounded-3xl overflow-hidden text-sm cursor-default shadow-sm " +
                      (isMine ? "bg-gradient-to-br from-red-600 to-rose-500 text-white" : "bg-white border border-gray-100 text-gray-900")
                    }
                  >
                    {msg.image_url && (
                      <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                        <img src={msg.image_url} alt="img" className="max-w-full max-h-64 object-cover" />
                      </a>
                    )}
                    {isVoice && msg.voice_url && (
                      <VoicePlayer url={msg.voice_url} isMine={isMine} />
                    )}
                    {!msg.image_url && !isVoice && (
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
                        {msg.edited_at && <span className="ml-2 text-[10px] opacity-80">{t.edited}</span>}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {isMine && <span className={msg.read_at ? "text-blue-300" : ""}>{msg.read_at ? "✓✓" : "✓"}</span>}
                        {!msg.image_url && !isVoice && editingMessageId !== msg.id && (
                          <button onClick={() => copyToClipboard(msg.content)}
                            className={"opacity-0 group-hover:opacity-100 transition-opacity " + (isMine ? "text-red-200 hover:text-white" : "text-gray-400 hover:text-gray-600")}>
                            {t.copy}
                          </button>
                        )}
                        {!msg.image_url && !isVoice && (
                          <button onClick={() => translateMessage(msg)}
                            className={"text-xs " + (isMine ? "text-red-200 hover:text-white" : "text-blue-500 hover:text-blue-700")}>
                            {tLoad ? t.translating : tTxt ? (tVis ? t.hideTranslation : t.translateBtn) : t.translateBtn}
                          </button>
                        )}
                        {!isMine && !isVoice && !msg.image_url && !correction && (
                          <button onClick={() => toggleCorrectionInput(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
                            {t.correctBtn}
                          </button>
                        )}
                        {isMine && editingMessageId === msg.id && (
                          <>
                            <button onClick={() => saveEditedMessage(msg.id)} disabled={saveLoading}
                              className="text-xs rounded-full bg-white/10 px-2 py-1 text-white hover:bg-white/20">
                              {saveLoading ? t.savingEdit : t.saveEdit}
                            </button>
                            <button onClick={cancelEditMessage} className="text-xs text-white hover:underline">{t.cancelEdit}</button>
                          </>
                        )}
                        {isMine && editingMessageId !== msg.id && !isVoice && (
                          <button onClick={() => deleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-200 hover:text-white">
                            {t.deleteMsg}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {tTxt && tVis && (
                    <div className={"mt-1 rounded-2xl bg-white border border-gray-100 shadow-sm px-3 py-2 text-xs text-gray-600 " + (isMine ? "text-right" : "")}>
                      {tTxt}
                    </div>
                  )}

                  {isMine && correction && !isVoice && (
                    <div className="mt-1.5 flex justify-end">
                      <div className="max-w-full">
                        <button onClick={() => toggleCorrectionDetail(msg.id)}
                          className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 flex items-center justify-center text-[9px]">✓</span>
                          {corrDetailVisible ? t.correctHide : t.correctBadge}
                        </button>
                        {corrDetailVisible && (
                          <div className="mt-1.5 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-xs space-y-2">
                            <div>
                              <span className="font-bold text-gray-400 text-[10px] uppercase tracking-wider">{t.correctOriginal}</span>
                              <p className="text-gray-500 mt-0.5 line-through">{correction.original_text}</p>
                            </div>
                            <div>
                              <span className="font-bold text-emerald-700 text-[10px] uppercase tracking-wider">{t.correctSuggested}</span>
                              <p className="text-gray-900 font-semibold mt-0.5">{correction.corrected_text}</p>
                            </div>
                            {correction.note && (
                              <p className="text-gray-500 italic text-[11px]">{correction.note}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!isMine && corrInputOpen && !isVoice && (
                    <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                      <textarea
                        value={corrInput.text}
                        onChange={(e) => setCorrectionInputs((prev) => ({ ...prev, [msg.id]: { ...corrInput, text: e.target.value } }))}
                        placeholder={t.correctPlaceholder}
                        rows={2}
                        className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none resize-none"
                      />
                      <input
                        type="text"
                        value={corrInput.note}
                        onChange={(e) => setCorrectionInputs((prev) => ({ ...prev, [msg.id]: { ...corrInput, note: e.target.value } }))}
                        placeholder={t.correctNotePlaceholder}
                        className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs outline-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => toggleCorrectionInput(msg.id)}
                          className="flex-1 py-1.5 text-xs text-gray-500 font-medium hover:text-gray-700 transition">
                          {t.cancel}
                        </button>
                        <button
                          onClick={() => submitCorrection(msg.id, msg.content)}
                          disabled={!corrInput.text.trim() || corrLoading}
                          className="flex-1 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition">
                          {corrLoading ? t.correctSubmitting : t.correctSubmit}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-3 sticky bottom-0 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar max-w-3xl mx-auto">
          {["😀", "😂", "🥰", "😮", "😢", "😡", "👍", "🙌", "✨", "❤️"].map((emoji) => (
            <button key={emoji} onClick={() => handleEmojiClick(emoji)} disabled={isRecording}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full hover:bg-red-50 text-sm transition-colors disabled:opacity-40">
              {emoji}
            </button>
          ))}
        </div>

        {isRecording && (
          <div className="flex items-center gap-3 mb-2 px-4 py-2.5 rounded-2xl bg-red-50 border border-red-100 max-w-3xl mx-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <span className="text-sm font-bold text-red-600">{t.voiceRecording}</span>
            <span className="text-sm font-mono text-red-500 ml-auto">{fmtSecs(recordingTime)}</span>
          </div>
        )}

        <form onSubmit={sendMessage} className="flex gap-2 max-w-3xl mx-auto items-end">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={imageUploading || isRecording}
            className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 mb-0.5 transition-colors">
            {imageUploading
              ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <span>📷</span>}
          </button>
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleImageSelect} />

          <button
            type="button"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); startRecording(); }}
            onPointerUp={stopRecording}
            onPointerCancel={stopRecording}
            disabled={voiceUploading || imageUploading}
            className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center mb-0.5 transition-all select-none touch-none ${
              isRecording
                ? "bg-red-500 text-white shadow-lg shadow-red-200 scale-110"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            } disabled:opacity-50`}
            title={t.voiceHint}
          >
            {voiceUploading
              ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" />
                  <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" />
                </svg>
              )}
          </button>

          <div className="flex-1 flex flex-col gap-1">
            <textarea ref={textareaRef} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown}
              rows={1} className="input-field resize-none text-sm py-3 h-11 min-h-[44px] max-h-[120px]"
              placeholder={isRecording ? t.voiceRecording : t.messagePlaceholder}
              disabled={isRecording}
            />
            {newMessage.length > 800 && (
              <p className={`text-xs text-right pr-1 ${newMessage.length > MAX_MSG_LENGTH ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                {newMessage.length}/{MAX_MSG_LENGTH}
              </p>
            )}
          </div>

          <button type="submit"
            disabled={sendLoading || !newMessage.trim() || newMessage.length > MAX_MSG_LENGTH || isRecording}
            className="flex-shrink-0 mb-0.5 w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 text-white flex items-center justify-center hover:shadow-md active:scale-95 transition-all duration-150 disabled:opacity-50">
            {sendLoading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
          </button>
        </form>
      </div>

      {deleteConfirmId && (
        <ConfirmModal
          message={t.deleteMsgConfirm}
          confirmLabel={t.deleteMsgLabel}
          cancelLabel={t.cancel}
          danger
          onConfirm={confirmDeleteMessage}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
      {reportOpen && partner && (
        <ReportModal targetId={partner.id} onClose={() => setReportOpen(false)} />
      )}
    </div>
  );
}
