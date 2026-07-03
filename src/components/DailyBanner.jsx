import { Sun } from "lucide-react";
import { Icon } from "./Icon";
import { useContent } from "../context/ContentContext";

function getTodaysMessage(messages) {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000,
  );
  return messages[dayOfYear % messages.length];
}

export default function DailyBanner() {
  const { dailyMessages } = useContent();

  return (
    <div className="daily-banner">
      <Icon icon={Sun} size={22} className="daily-banner-icon" />
      <div>
        <p className="daily-banner-label">Today's note for you</p>
        <p className="daily-banner-text">{getTodaysMessage(dailyMessages)}</p>
      </div>
    </div>
  );
}
