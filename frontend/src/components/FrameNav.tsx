import { useCallback, useRef, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { useKitchenHome } from "./kitchen/useKitchenHome";
import {
  FONT_PRESETS,
  THEME_PRESETS,
  useTheme,
  type FontPresetId,
  type ThemePresetId,
} from "../theme/ThemeProvider";
import { useDismiss } from "../lib/useDismiss";

/** A native <details> menu that closes on an outside press and on Escape. */
function DismissableMenu({
  className,
  summary,
  children,
}: {
  className: string;
  summary: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  // Always listening: React state would learn of the native toggle a task late,
  // and an Escape pressed right after opening would be missed.
  const close = useCallback(() => {
    if (!ref.current?.open) {
      return false;
    }
    ref.current.open = false;
  }, []);
  useDismiss(ref, true, close);

  return (
    <details ref={ref} className={className}>
      {summary}
      {children}
    </details>
  );
}

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

/** The places a person can reach; developer places only for developers. */
export const PLACES: { to: string; label: string; end?: boolean; developer?: boolean }[] = [
  { to: "/recipe-box", label: "Box" },
  { to: "/developer/lab", label: "Lab", developer: true },
  { to: "/developer", label: "Board", end: true, developer: true },
  { to: "/developer/cookbooks", label: "Cookbooks", developer: true },
  { to: "/references", label: "Shelf" },
];

export function placesFor(developer: boolean) {
  return PLACES.filter((place) => developer || !place.developer);
}

/** Box and Lab sit in the strip; the rest go under More on a phone. */
const STRIP_PLACES = ["/recipe-box", "/developer/lab"];

function overflowPlaces(developer: boolean) {
  return placesFor(developer)
    .filter((place) => !STRIP_PLACES.includes(place.to))
    .map((place) => <PlaceLink key={place.to} {...place} />);
}

function moreRouteActive(pathname: string): boolean {
  return (
    pathname === "/developer" ||
    pathname.startsWith("/developer/cookbooks") ||
    pathname.startsWith("/references")
  );
}

export function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) {
    return null;
  }

  async function handleLogout() {
    await logout(() => navigate("/", { replace: true }));
  }

  return (
    <DismissableMenu
      className="frame-account"
      summary={
        <summary className="frame-nav__summary" data-dismiss-passthrough>
          Account
        </summary>
      }
    >
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
    </DismissableMenu>
  );
}

export function FrameNav() {
  const { hasDeveloperAccess } = useAuth();
  const location = useLocation();
  const moreActive = moreRouteActive(location.pathname);
  const kitchenHome = useKitchenHome();

  // The kitchen scene replaces the top nav; only the account menu stays, top-right.
  // Wide focused views don't render FrameNav (AppLayout gives them PlacesMenu and
  // AccountMenu), so the strip below is the phone's bottom bar.
  if (kitchenHome) {
    return (
      <div className="frame-account-corner">
        <AccountMenu />
      </div>
    );
  }

  return (
    <nav className="frame-nav" aria-label="Places">
      {placesFor(hasDeveloperAccess)
        .filter((place) => STRIP_PLACES.includes(place.to))
        .map((place) => (
          <PlaceLink key={place.to} {...place} />
        ))}
      <div className="frame-nav__places">{overflowPlaces(hasDeveloperAccess)}</div>
      <DismissableMenu
        className="frame-nav__more"
        summary={
          <summary
            className={
              moreActive
                ? "frame-nav__summary frame-nav__summary--active"
                : "frame-nav__summary"
            }
            data-dismiss-passthrough
          >
            More
          </summary>
        }
      >
        <div className="frame-nav__panel">{overflowPlaces(hasDeveloperAccess)}</div>
      </DismissableMenu>
      <AccountMenu />
    </nav>
  );
}
