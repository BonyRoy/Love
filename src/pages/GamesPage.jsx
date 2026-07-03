import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";
import { getIcon } from "../data/iconMap";

export default function GamesPage() {
  const { games, gamesPage } = useContent();

  return (
    <div className="page">
      <div className="page-hero">
        <Icon icon={Gamepad2} size={32} className="page-hero-icon" />
        <h1>{gamesPage.title}</h1>
        <p>{gamesPage.subtitle}</p>
      </div>

      <div className="card-grid">
        {games.map((game) => (
          <Link
            key={game.to}
            to={game.to}
            className={`home-card ${game.color}`}
          >
            <Icon
              icon={getIcon(game.icon)}
              size={28}
              className="home-card-icon"
            />
            <h3>{game.title}</h3>
            <p>{game.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
