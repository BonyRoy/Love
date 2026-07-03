import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Heart, MoreHorizontal, X } from "lucide-react";
import packageJson from "../../package.json";
import FloatingHearts from "./FloatingHearts";
import FloatingChatButton from "./FloatingChatButton";
import { Icon } from "./Icon";
import { useContent } from "../context/ContentContext";
import { getIcon } from "../data/iconMap";

function TopNav({ navigation }) {
  const ALL_NAV = [...navigation.primary, ...navigation.more];
  return (
    <nav className="nav nav-top" aria-label="Main navigation">
      {ALL_NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <Icon icon={getIcon(item.icon)} size={18} className="nav-icon" />
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function BottomNav({ navigation, layout }) {
  const PRIMARY_NAV = navigation.primary;
  const MORE_NAV = navigation.more;
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const moreActive = MORE_NAV.some((item) =>
    location.pathname.startsWith(item.to),
  );

  return (
    <>
      {moreOpen && (
        <button
          className="more-backdrop"
          aria-label="Close menu"
          onClick={() => setMoreOpen(false)}
        />
      )}

      <div className={`more-sheet ${moreOpen ? "open" : ""}`}>
        <div className="more-sheet-header">
          <span>{layout.moreMenuTitle}</span>
          <button
            type="button"
            className="more-close"
            onClick={() => setMoreOpen(false)}
            aria-label="Close"
          >
            <Icon icon={X} size={20} />
          </button>
        </div>
        <div className="more-sheet-links">
          {MORE_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `more-sheet-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMoreOpen(false)}
            >
              <Icon icon={getIcon(item.icon)} size={22} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      <nav className="nav nav-bottom" aria-label="Main navigation">
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `nav-link nav-tab ${isActive ? "active" : ""}`
            }
            aria-label={item.label}
          >
            <Icon icon={getIcon(item.icon)} size={22} className="nav-icon" />
            <span className="nav-tab-label">{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          className={`nav-link nav-tab nav-more ${moreActive ? "active" : ""}`}
          onClick={() => setMoreOpen((o) => !o)}
          aria-label="More pages"
          aria-expanded={moreOpen}
        >
          <Icon icon={MoreHorizontal} size={22} className="nav-icon" />
          <span className="nav-tab-label">{layout.moreMenuTitle}</span>
        </button>
      </nav>
    </>
  );
}

export default function Layout() {
  const { HER_NAME, YOUR_NAME, layout, navigation } = useContent();

  return (
    <div className="app app-shell">
      <FloatingHearts count={10} />

      <header className="header">
        <NavLink to="/home" className="header-title header-title-link">
          {layout.headerBefore}
          <span>{HER_NAME}</span>
          <Icon icon={Heart} size={20} className="header-heart" />
        </NavLink>
        <TopNav navigation={navigation} />
      </header>

      <main className="main page-main">
        <Outlet />
      </main>

      <footer className="footer">
        <p>
          {layout.footerBefore}
          <strong>{YOUR_NAME}</strong>
          <Icon icon={Heart} size={14} className="footer-heart" />
        </p>
        <p className="footer-version">
          <span className="footer-version-label">Version</span>
          <span>v{packageJson.version}</span>
        </p>
      </footer>

      <BottomNav navigation={navigation} layout={layout} />
      <FloatingChatButton />
    </div>
  );
}
