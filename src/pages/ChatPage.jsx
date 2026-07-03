import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatRoom from "../components/ChatRoom";
import { useContent } from "../context/ContentContext";

export default function ChatPage() {
  const navigate = useNavigate();
  const { HER_NAME, YOUR_NAME } = useContent();

  useEffect(() => {
    document.body.classList.add("chat-open");
    return () => document.body.classList.remove("chat-open");
  }, []);

  return (
    <div className="chat-page-root">
      <ChatRoom
        sender="her"
        title={`Chat with ${YOUR_NAME}`}
        selfLabel={HER_NAME}
        partnerLabel={YOUR_NAME}
        onClose={() => navigate("/home")}
      />
    </div>
  );
}
