import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import {
  FONT_PRESETS,
  THEME_PRESETS,
  useTheme,
  type FontPresetId,
  type ThemePresetId,
} from "../theme/ThemeProvider";

function ThemeSettings() {
  const { theme, font, setTheme, setFont } = useTheme();

  return (
    <div className="app-settings" aria-label="Appearance settings">
      <span className="app-settings-label">Theme</span>
      <div className="app-settings-swatches" role="radiogroup" aria-label="Color theme">
        {THEME_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            role="radio"
            aria-checked={theme === preset.id}
            aria-label={preset.label}
            title={preset.label}
            className={
              theme === preset.id
                ? "app-settings-swatch app-settings-swatch-active"
                : "app-settings-swatch"
            }
            onClick={() => setTheme(preset.id as ThemePresetId)}
          />
        ))}
      </div>
      <label className="app-settings-label">
        Font
        <select
          className="app-settings-select"
          value={font}
          onChange={(event) => setFont(event.target.value as FontPresetId)}
        >
          {FONT_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function ForkVisibilitySetting() {
  const { user, updateProfile } = useAuth();
  if (!user) {
    return null;
  }

  return (
    <label className="app-settings-label">
      <input
        type="checkbox"
        checked={user.show_forks}
        onChange={(event) => {
          void updateProfile({ show_forks: event.target.checked });
        }}
      />
      Show forks
    </label>
  );
}

function PlaceLink({
  to,
  label,
  end = false,
}: {
  to: string;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        isActive ? "frame-nav__link frame-nav__link-active" : "frame-nav__link"
      }
    >
      {label}
    </NavLink>
  );
}

function overflowPlaces(developer: boolean) {
  return (
    <>
      {developer ? <PlaceLink to="/developer" label="Board" end /> : null}
      {developer ? <PlaceLink to="/developer/cookbooks" label="Cookbooks" /> : null}
      <PlaceLink to="/references" label="Shelf" />
    </>
  );
}

function moreRouteActive(pathname: string): boolean {
  return (
    pathname === "/developer" ||
    pathname.startsWith("/developer/cookbooks") ||
    pathname.startsWith("/references")
  );
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) {
    return null;
  }

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <details className="frame-account">
      <summary className="frame-nav__summary">Account</summary>
      <div className="frame-nav__panel frame-account__panel">
        <p className="frame-account__name">{user.username}</p>
        <ThemeSettings />
        <ForkVisibilitySetting />
        <button
          type="button"
          className="nav-button frame-account__logout"
          onClick={() => void handleLogout()}
        >
          Log out
        </button>
      </div>
    </details>
  );
}

export function FrameNav() {
  const { hasDeveloperAccess } = useAuth();
  const location = useLocation();
  const moreActive = moreRouteActive(location.pathname);

  return (
    <nav className="frame-nav" aria-label="Places">
      <PlaceLink to="/recipe-box" label="Box" />
      {hasDeveloperAccess ? <PlaceLink to="/developer/lab" label="Lab" /> : null}
      <div className="frame-nav__places">{overflowPlaces(hasDeveloperAccess)}</div>
      <details className="frame-nav__more">
        <summary
          className={
            moreActive
              ? "frame-nav__summary frame-nav__summary--active"
              : "frame-nav__summary"
          }
        >
          More
        </summary>
        <div className="frame-nav__panel">{overflowPlaces(hasDeveloperAccess)}</div>
      </details>
      <AccountMenu />
    </nav>
  );
}
