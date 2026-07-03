import { Link } from "react-router-dom";
import { Icon } from "./Icon";
import { getIcon } from "../data/iconMap";

export default function HomeSectionCard({ card }) {
  const className = `home-card ${card.color} ${card.wide ? "home-card-wide" : ""}`;
  const body = (
    <>
      <Icon icon={getIcon(card.icon)} size={24} className="home-card-icon" />
      <div className="home-card-body">
        <h3>{card.title}</h3>
        <p>{card.desc}</p>
      </div>
    </>
  );

  if (card.href) {
    return (
      <a href={card.href} className={className}>
        {body}
      </a>
    );
  }

  return (
    <Link to={card.to} className={className}>
      {body}
    </Link>
  );
}
