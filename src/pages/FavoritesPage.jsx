import { Star } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

export default function FavoritesPage() {
  const { herFavorites, HER_NAME } = useContent();

  return (
    <div className="page">
      <div className="page-hero">
        <Icon icon={Star} size={32} className="page-hero-icon" />
        <h1>{HER_NAME}'s Favorites</h1>
        <p>Little things I notice and love about what you love.</p>
      </div>

      <div className="favorites-grid">
        {herFavorites.map((item, i) => (
          <div key={i} className="favorite-card">
            <h3>{item.thing}</h3>
            <p>{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
