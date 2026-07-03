import { Sun } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

function getTodaysMessage(messages) {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000,
  );
  return messages[dayOfYear % messages.length];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DailyPage() {
  const { dailyMessages, HER_NAME } = useContent();
  const message = getTodaysMessage(dailyMessages);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="page">
      <div className="section daily-page-card">
        <Icon icon={Sun} size={36} className="daily-page-icon" />
        <p className="daily-greeting">
          {getGreeting()}, {HER_NAME}
        </p>
        <p className="daily-date">{today}</p>
        <blockquote className="daily-quote">"{message}"</blockquote>
      </div>
    </div>
  );
}
