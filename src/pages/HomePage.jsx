import SecretHeart from "../components/SecretHeart";
import DaysTogether from "../components/DaysTogether";
import DailyBanner from "../components/DailyBanner";
import SosCallButton from "../components/SosCallButton";
import { Link } from "react-router-dom";
import HomeSectionCard from "../components/HomeSectionCard";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";
import { getIcon } from "../data/iconMap";
import { BEATIFY_LINK_ENABLED } from "../config/features";
import { isBeatifyUrl } from "../utils/beatifyLaunch";

export default function HomePage() {
  const { games, home, homeSections } = useContent();
  const gamePreviews = games.filter((game) => game.previewLabel);

  const visibleSections = homeSections
    .map((section) => ({
      ...section,
      cards: section.cards.filter(
        (card) => BEATIFY_LINK_ENABLED || !card.href || !isBeatifyUrl(card.href),
      ),
    }))
    .filter((section) => section.cards.length > 0);

  return (
    <div className="home-page">
      <aside className="home-aside">
        <div className="home-top home-flow-top">
          <DaysTogether />
          <DailyBanner />
          <SosCallButton />
        </div>

        <div className="game-preview-strip home-flow-games">
          <p className="strip-label">{home.gameStripLabel}</p>
          <div className="strip-items strip-scroll">
            {gamePreviews.map((g) => (
              <Link key={g.to} to={g.to} className="strip-item">
                <Icon icon={getIcon(g.icon)} size={16} />
                {g.previewLabel}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      <div className="home-content">
        <div className="home-sections home-flow-sections">
          {visibleSections.map((section) => (
            <section key={section.title} className="home-section">
              <h2 className="home-section-title">{section.title}</h2>
              <div className="card-grid">
                {section.cards.map((card) => (
                  <HomeSectionCard key={card.href || card.to} card={card} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="home-flow-secret">
          <SecretHeart />
        </div>
      </div>
    </div>
  );
}
