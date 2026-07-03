import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatRoom from "../components/ChatRoom";
import { useContent } from "../context/ContentContext";

export default function AdminChatPage() {
  const navigate = useNavigate();
  const { HER_NAME, YOUR_NAME } = useContent();

  useEffect(() => {
    document.body.classList.add("chat-open");
    return () => document.body.classList.remove("chat-open");
  }, []);

  return (
    <div className="chat-page-root">
      <ChatRoom
        sender="admin"
        title={`Chat with ${HER_NAME}`}
        selfLabel={YOUR_NAME}
        partnerLabel={HER_NAME}
        showSenderLocation
        onClose={() => navigate("/admin")}
      />
    </div>
  );
}
