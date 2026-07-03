import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import FloatingHearts from "../components/FloatingHearts";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { HER_NAME, landing } = useContent();

  return (
    <div className="app app-landing">
      <FloatingHearts count={20} />
      <div className="landing">
        <p className="landing-eyebrow">{landing.eyebrow}</p>
        <h1 className="landing-name">{HER_NAME}</h1>
        <p className="landing-sub">{landing.subtitle}</p>
        <button className="btn-enter" onClick={() => navigate("/home")}>
          <Icon icon={Sparkles} size={20} />
          {landing.cta}
        </button>
      </div>
    </div>
  );
}
