import { Phone } from "lucide-react";
import { Icon } from "./Icon";

const SOS_PHONE = "+918369877891";

export default function SosCallButton() {
  return (
    <a
      href={`tel:${SOS_PHONE}`}
      className="home-sos-card"
      aria-label={`SOS call ${SOS_PHONE}`}
    >
      <span className="home-sos-icon-wrap">
        <Icon icon={Phone} size={22} />
      </span>
      <div className="home-sos-text">
        <strong>SOS</strong>
        <span>Tap to call me anytime</span>
      </div>
    </a>
  );
}
