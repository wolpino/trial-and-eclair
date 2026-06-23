import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

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

export function AppLayout() {
  const { user, hasDeveloperAccess, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link className="app-brand" to="/">
            Trial and Eclair
          </Link>
          <nav className="app-nav" aria-label="Main">
            {user && hasDeveloperAccess ? (
              <>
                <NavLink
                  to="/developer"
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  Cork board
                </NavLink>
                <NavLink
                  to="/developer/lab"
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  Lab
                </NavLink>
                <NavLink
                  to="/developer/cookbooks"
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  Cookbooks
                </NavLink>
              </>
            ) : null}
            {user ? (
              <NavLink
                to="/recipe-box"
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
              >
                Recipe box
              </NavLink>
            ) : null}
            {user ? (
              <NavLink
                to="/references"
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
              >
                References
              </NavLink>
            ) : null}
            <ThemeSettings />
            {user ? (
              <>
                <span className="nav-user">{user.username}</span>
                <button
                  type="button"
                  className="nav-button"
                  onClick={() => void handleLogout()}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
