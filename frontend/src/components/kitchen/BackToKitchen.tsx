import { useCallback, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { useDismiss } from "../../lib/useDismiss";
import { placesFor } from "../FrameNav";

/**
 * Top-left of a focused view: "← Kitchen" goes home, and the Places menu goes
 * straight to another place (decision 004, issue #136).
 */
export function PlacesMenu() {
  const { hasDeveloperAccess } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // After the press that closed it, which would otherwise move focus to the page.
    setTimeout(() => buttonRef.current?.focus());
  }, []);
  useDismiss(menuRef, open, close);

  return (
    <nav className="kitchen-places" aria-label="Places">
      <Link className="kitchen-back" to="/" aria-label="Back to kitchen">
        <span aria-hidden="true">←</span> Kitchen
      </Link>
      <div className="kitchen-places__menu" ref={menuRef}>
        <button
          ref={buttonRef}
          type="button"
          className="kitchen-back kitchen-places__button"
          aria-expanded={open}
          aria-controls={open ? "kitchen-places-list" : undefined}
          onClick={() => setOpen((value) => !value)}
        >
          Places <span aria-hidden="true">▾</span>
        </button>
        {open ? (
          <ul
            id="kitchen-places-list"
            className="frame-nav__panel kitchen-places__list"
            aria-label="Places"
          >
            {placesFor(hasDeveloperAccess).map((place) => (
              <li key={place.to}>
                <NavLink
                  to={place.to}
                  end={place.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    isActive ? "frame-nav__link frame-nav__link-active" : "frame-nav__link"
                  }
                >
                  {place.label}
                </NavLink>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </nav>
  );
}
