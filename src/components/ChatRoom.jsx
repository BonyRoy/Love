import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Circle, ImagePlus, Send, SwitchCamera, X } from "lucide-react";
import { Icon } from "./Icon";
import {
  CHAT_EXPIRY_NOTE,
  createOptimisticMessage,
  deleteMessage,
  mergeMessages,
  sendImageMessage,
  sendTextMessage,
  setMessageReaction,
  subscribeToMessages,
  updateMessageBody,
  getReplyPreviewText,
} from "../supabase/chatService";
import { isSupabaseConfigured } from "../supabase/config";
import { markChatRead } from "../utils/chatReadState";
import ChatEmptyState from "./ChatEmptyState";
import ChatImagePreview from "./ChatImagePreview";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatMessageMenu from "./ChatMessageMenu";
import ChatLocationModal from "./ChatLocationModal";
import { getCurrentLocation } from "../utils/geolocation";
import {
  attachStreamToVideo,
  captureHighQualityPhoto,
  getPreferredCameraStream,
  stopCameraStream,
  canFlipCamera as detectCameraFlipSupport,
  switchCameraFacing,
} from "../utils/camera";

function formatDateLabel(iso) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function shouldShowDate(messages, index) {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].created_at).toDateString();
  const curr = new Date(messages[index].created_at).toDateString();
  return prev !== curr;
}

const SCROLL_NEAR_BOTTOM_PX = 80;

function isNearBottom(el) {
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_NEAR_BOTTOM_PX;
}

export default function ChatRoom({
  sender,
  title,
  selfLabel,
  partnerLabel,
  onClose,
  showSenderLocation = false,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("environment");
  const [canFlipCamera, setCanFlipCamera] = useState(false);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [locationMessage, setLocationMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [partnerInChat, setPartnerInChat] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const galleryRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const pendingRef = useRef([]);
  const refreshRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const hasInitialScrolledRef = useRef(false);
  const prevLastMessageIdRef = useRef(null);

  const applyServerMessages = useCallback((serverMessages) => {
    pendingRef.current = pendingRef.current.filter((m) => m.pending);
    setMessages(mergeMessages(serverMessages, pendingRef.current));
  }, []);

  const addOptimistic = useCallback((msg) => {
    pendingRef.current = [...pendingRef.current, msg];
    setMessages((prev) => mergeMessages(
      prev.filter((m) => !m.pending),
      pendingRef.current,
    ));
  }, []);

  const confirmOptimistic = useCallback((tempId, saved) => {
    pendingRef.current = pendingRef.current.filter((m) => m.id !== tempId);
    setMessages((prev) => {
      const without = prev.filter((m) => m.id !== tempId);
      const exists = without.some((m) => m.id === saved.id);
      if (exists) return without;
      return [...without, saved].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    });
  }, []);

  const removeOptimistic = useCallback((tempId) => {
    pendingRef.current = pendingRef.current.filter((m) => m.id !== tempId);
    setMessages((prev) => prev.filter((m) => m.id !== tempId));
  }, []);

  const closeMenu = useCallback(() => setActionMessage(null), []);
  const closeLocation = useCallback(() => setLocationMessage(null), []);

  const captureSendLocation = useCallback(async () => {
    try {
      return await getCurrentLocation();
    } catch {
      return null;
    }
  }, []);

  const handleOpenMessageMenu = useCallback((msg) => {
    setActionMessage(msg);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingMessage(null);
    setText("");
  }, []);

  const cancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const resolveReplyPreview = useCallback(
    (replyToId) => {
      if (!replyToId) return null;
      const original = messages.find((m) => m.id === replyToId);
      if (!original) {
        return { label: "Reply", text: "Message unavailable" };
      }
      const label =
        original.sender === sender ? selfLabel : partnerLabel;
      return { label, text: getReplyPreviewText(original) };
    },
    [messages, sender, selfLabel, partnerLabel],
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError("Chat needs Supabase. Run supabase/chat.sql first.");
      return;
    }
    const sub = subscribeToMessages(applyServerMessages, {
      sender,
      onPartnerInChat: setPartnerInChat,
    });
    refreshRef.current = sub.refresh;
    return () => sub.unsubscribe();
  }, [applyServerMessages, sender]);

  useEffect(() => {
    markChatRead(sender);
  }, [sender, messages]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return undefined;

    const onScroll = () => {
      isNearBottomRef.current = isNearBottom(el);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const visible = messages.filter((m) => m.body || m.image_url || m.pending);
    if (visible.length === 0) return;

    const lastMsg = visible[visible.length - 1];
    const prevLastId = prevLastMessageIdRef.current;
    const isFirstLoad = !hasInitialScrolledRef.current;
    const isNewTail = prevLastId !== null && lastMsg.id !== prevLastId;
    const shouldScroll =
      isFirstLoad
      || (isNewTail && (lastMsg.sender === sender || isNearBottomRef.current));

    if (shouldScroll) {
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (!el) return;
        el.scrollTo({
          top: el.scrollHeight,
          behavior: isFirstLoad ? "auto" : "smooth",
        });
        isNearBottomRef.current = true;
      });
      hasInitialScrolledRef.current = true;
    }

    prevLastMessageIdRef.current = lastMsg.id;
  }, [messages, sender]);

  useEffect(() => {
    return () => {
      stopCameraStream(streamRef.current);
    };
  }, []);

  useEffect(() => {
    if (!cameraOpen || cameraLoading) return;

    const stream = streamRef.current;
    const video = videoRef.current;
    if (!stream || !video) return;

    let cancelled = false;

    attachStreamToVideo(video, stream).catch(() => {
      if (!cancelled) {
        setError("Could not start camera preview. Try gallery instead.");
        closeCamera();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cameraOpen, cameraLoading]);

  const openCamera = async () => {
    setError("");
    setCameraZoom(1);
    setCameraOpen(true);
    setCameraLoading(true);

    try {
      const { stream, facingMode } = await getPreferredCameraStream();
      streamRef.current = stream;
      setCameraFacing(facingMode === "user" ? "user" : "environment");
      setCanFlipCamera(await detectCameraFlipSupport());
    } catch {
      setCameraOpen(false);
      setError(
        "Could not access camera. Allow camera permission, use HTTPS, or try gallery.",
      );
    } finally {
      setCameraLoading(false);
    }
  };

  const closeCamera = () => {
    stopCameraStream(streamRef.current);
    streamRef.current = null;
    setCameraZoom(1);
    setCameraFacing("environment");
    setCanFlipCamera(false);
    setCameraLoading(false);
    setCameraOpen(false);
  };

  const flipCamera = async () => {
    if (!canFlipCamera || cameraLoading) return;
    setCameraLoading(true);
    setError("");
    try {
      const { stream, facingMode } = await switchCameraFacing(
        cameraFacing,
        streamRef.current,
      );
      streamRef.current = stream;
      setCameraFacing(facingMode === "user" ? "user" : "environment");
      setCameraZoom(1);
    } catch {
      setError("Could not switch camera.");
    } finally {
      setCameraLoading(false);
    }
  };

  const cycleCameraZoom = () => {
    setCameraZoom((z) => (z >= 3 ? 1 : z + 1));
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;

    try {
      const blob = await captureHighQualityPhoto(stream, video, {
        zoom: cameraZoom,
        mirror: cameraFacing === "user",
      });
      if (!blob) return;
      closeCamera();
      await uploadFile(new File([blob], "camera.jpg", { type: "image/jpeg" }));
    } catch {
      setError("Could not capture photo. Try again or use gallery.");
    }
  };

  const uploadFile = async (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    const replyId = replyTo?.id ?? null;
    const previewUrl = URL.createObjectURL(file);
    const optimistic = createOptimisticMessage(sender, {
      image_url: previewUrl,
      reply_to: replyId,
    });
    addOptimistic(optimistic);
    setSending(true);
    setError("");
    cancelReply();

    try {
      const location = await captureSendLocation();
      const saved = await sendImageMessage(sender, file, location, replyId);
      URL.revokeObjectURL(previewUrl);
      confirmOptimistic(optimistic.id, saved);
      refreshRef.current?.();
    } catch (err) {
      URL.revokeObjectURL(previewUrl);
      removeOptimistic(optimistic.id);
      setError(err.message ?? "Failed to send image.");
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    const value = text.trim();
    if (!value || sending) return;

    if (editingMessage) {
      setSending(true);
      setError("");
      try {
        const saved = await updateMessageBody(editingMessage.id, value);
        if (saved) {
          setMessages((prev) => prev.map((m) => (m.id === saved.id ? saved : m)));
          cancelEdit();
          refreshRef.current?.();
        }
      } catch (err) {
        setError(err.message ?? "Failed to edit message.");
      } finally {
        setSending(false);
      }
      return;
    }

    const replyId = replyTo?.id ?? null;
    const optimistic = createOptimisticMessage(sender, {
      body: value,
      reply_to: replyId,
    });
    addOptimistic(optimistic);
    setText("");
    cancelReply();
    setSending(true);
    setError("");

    try {
      const location = await captureSendLocation();
      const saved = await sendTextMessage(sender, value, location, replyId);
      if (saved) {
        confirmOptimistic(optimistic.id, saved);
        refreshRef.current?.();
      }
    } catch (err) {
      removeOptimistic(optimistic.id);
      setText(value);
      setError(err.message ?? "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!actionMessage) return;
    setSending(true);
    setError("");
    try {
      await deleteMessage(actionMessage);
      setMessages((prev) => prev.filter((m) => m.id !== actionMessage.id));
      closeMenu();
      refreshRef.current?.();
    } catch (err) {
      setError(err.message ?? "Failed to delete message.");
    } finally {
      setSending(false);
    }
  };

  const handleEdit = () => {
    if (!actionMessage?.body) return;
    cancelReply();
    setEditingMessage(actionMessage);
    setText(actionMessage.body);
    closeMenu();
    inputRef.current?.focus();
  };

  const handleReply = () => {
    if (!actionMessage || actionMessage.pending) return;
    cancelEdit();
    setReplyTo(actionMessage);
    closeMenu();
    inputRef.current?.focus();
  };

  const handleReact = async (emoji) => {
    if (!actionMessage) return;
    setError("");
    try {
      const updated = await setMessageReaction(actionMessage.id, sender, emoji);
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      closeMenu();
      refreshRef.current?.();
    } catch (err) {
      setError(err.message ?? "Failed to react.");
    }
  };

  const visibleMessages = messages.filter(
    (m) => m.body || m.image_url || m.pending,
  );

  const actionMine = actionMessage?.sender === sender;
  const canEdit = Boolean(
    actionMessage?.body && !actionMessage?.image_url && actionMine && !actionMessage?.pending,
  );

  return (
    <div className={`chat-screen ${actionMessage || locationMessage ? "menu-open" : ""}`}>
      <header className="chat-header">
        <div className="chat-header-info">
          <h1>{title}</h1>
          {partnerInChat && (
            <div className="chat-live-badge" aria-label={`${partnerLabel} is in chat`}>
              <span className="chat-live-dot" aria-hidden="true" />
              <span className="chat-live-label">{partnerLabel} is here</span>
            </div>
          )}
          <p className="chat-expiry-note">{CHAT_EXPIRY_NOTE}</p>
        </div>
        <button
          type="button"
          className="chat-close"
          onClick={onClose}
          aria-label="Close chat and go back"
        >
          <Icon icon={X} size={24} />
        </button>
      </header>

      <div className="chat-messages" ref={listRef}>
        {visibleMessages.length === 0 && <ChatEmptyState />}
        {visibleMessages.map((msg, index) => {
          const mine = msg.sender === sender;
          return (
            <div key={msg.id}>
              {shouldShowDate(visibleMessages, index) && (
                <div className="chat-date-divider">
                  <span>{formatDateLabel(msg.created_at)}</span>
                </div>
              )}
              <ChatMessageBubble
                msg={msg}
                mine={mine}
                partnerLabel={partnerLabel}
                replyPreview={resolveReplyPreview(msg.reply_to)}
                isSelected={actionMessage?.id === msg.id || locationMessage?.id === msg.id}
                onOpenMenu={handleOpenMessageMenu}
                onImageClick={setPreviewImage}
              />
            </div>
          );
        })}
      </div>

      {error && <p className="chat-error">{error}</p>}

      {editingMessage && (
        <div className="chat-editing-banner">
          <span>Editing message</span>
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        </div>
      )}

      {replyTo && !editingMessage && (
        <div className="chat-reply-banner">
          <div className="chat-reply-banner-content">
            <span className="chat-reply-banner-label">
              Replying to {replyTo.sender === sender ? selfLabel : partnerLabel}
            </span>
            <span className="chat-reply-banner-text">
              {getReplyPreviewText(replyTo)}
            </span>
          </div>
          <button type="button" onClick={cancelReply} aria-label="Cancel reply">
            <Icon icon={X} size={18} />
          </button>
        </div>
      )}

      <div className="chat-composer">
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="chat-file-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="chat-tool-btn"
          onClick={() => galleryRef.current?.click()}
          aria-label="Send from gallery"
          disabled={sending || Boolean(editingMessage)}
        >
          <Icon icon={ImagePlus} size={20} />
        </button>
        <button
          type="button"
          className="chat-tool-btn"
          onClick={openCamera}
          aria-label="Take photo"
          disabled={sending || Boolean(editingMessage)}
        >
          <Icon icon={Camera} size={20} />
        </button>
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder={
            editingMessage
              ? "Edit message..."
              : replyTo
                ? "Reply..."
                : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={sending}
        />
        <button
          type="button"
          className="chat-send-btn"
          onClick={handleSend}
          disabled={sending || !text.trim()}
          aria-label={editingMessage ? "Save edit" : "Send message"}
        >
          <Icon icon={Send} size={20} />
        </button>
      </div>

      {locationMessage && (
        <ChatLocationModal
          message={locationMessage}
          senderLabel={partnerLabel}
          onClose={closeLocation}
        />
      )}

      {actionMessage && (
        <ChatMessageMenu
          message={actionMessage}
          currentSender={sender}
          mine={actionMine}
          canEdit={canEdit}
          showLocation={showSenderLocation && !actionMine && !actionMessage.pending}
          onClose={closeMenu}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onReact={handleReact}
          onReply={handleReply}
          onViewLocation={() => {
            setLocationMessage(actionMessage);
            closeMenu();
          }}
        />
      )}

      {previewImage && (
        <ChatImagePreview
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {cameraOpen && (
        <div className="chat-camera-modal">
          <div className="chat-camera-card">
            <div className={`chat-camera-video-wrap${cameraLoading ? " is-loading" : ""}`}>
              {cameraLoading ? (
                <div className="chat-camera-loading">Opening camera...</div>
              ) : (
                <video
                  ref={videoRef}
                  className="chat-camera-video"
                  style={{
                    transform:
                      cameraFacing === "user"
                        ? `scaleX(-1) scale(${cameraZoom})`
                        : `scale(${cameraZoom})`,
                  }}
                  playsInline
                  autoPlay
                  muted
                />
              )}
              <button
                type="button"
                className="chat-camera-close"
                onClick={closeCamera}
                aria-label="Close camera"
              >
                <Icon icon={X} size={22} />
              </button>
            </div>
            <div className="chat-camera-actions">
              <button
                type="button"
                className="chat-camera-grid-btn chat-camera-flip"
                onClick={flipCamera}
                disabled={!canFlipCamera || cameraLoading}
                aria-label={
                  canFlipCamera ? "Switch camera" : "Camera switch unavailable"
                }
              >
                <Icon icon={SwitchCamera} size={22} />
              </button>
              <button
                type="button"
                className="chat-camera-grid-btn chat-camera-capture"
                onClick={capturePhoto}
                aria-label="Capture and send"
              >
                <Icon icon={Circle} size={30} fill="currentColor" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                className="chat-camera-grid-btn chat-camera-zoom"
                onClick={cycleCameraZoom}
                aria-label={`Zoom ${cameraZoom}x`}
              >
                {cameraZoom}X
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
