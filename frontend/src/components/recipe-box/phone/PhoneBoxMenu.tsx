import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { GUEST_CARD_LIMIT } from "../../../auth/access";
import { useAuth } from "../../../auth/AuthContext";

/** Closes on Escape and moves focus into the panel while it is open. */
function useDialogKeys(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) {
      return;
    }
    panelRef.current?.querySelector<HTMLElement>("button, input")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeRef.current();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);
  return panelRef;
}

type PhoneBoxMenuProps = {
  /** The person's own cards, for "Guest · 3 of 5 cards". */
  cardCount: number;
  simpleList: boolean;
  onToggleSimpleList: () => void;
  onSearch: () => void;
  onAdd: () => void;
};

/** The ☰ menu: Account, Add recipe, View, then Sign out (decision 003, Menu). */
export function PhoneBoxMenu({
  cardCount,
  simpleList,
  onToggleSimpleList,
  onSearch,
  onAdd,
}: PhoneBoxMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useDialogKeys(open, () => {
    setOpen(false);
    buttonRef.current?.focus();
  });

  function choose(action: () => void) {
    setOpen(false);
    action();
  }

  async function signOut() {
    await logout(() => navigate("/", { replace: true }));
  }

  return (
    <>
      <button
        ref={buttonRef}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Menu"
        className="phone-box-menu-btn"
        type="button"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>
      {open ? (
        <div className="phone-box-backdrop" onClick={() => setOpen(false)}>
          <div
            ref={panelRef}
            aria-label="Menu"
            aria-modal="true"
            className="phone-box-menu"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <section className="phone-box-menu__section">
              <h2 className="phone-box-menu__label">Account</h2>
              {user && !user.is_guest ? (
                <p className="phone-box-menu__name">{user.first_name || user.username}</p>
              ) : null}
              {user?.is_guest ? (
                <>
                  <p className="phone-box-menu__name">
                    Guest · {cardCount} of {GUEST_CARD_LIMIT} cards
                  </p>
                  <button
                    className="phone-box-menu__item"
                    type="button"
                    onClick={() => choose(() => navigate("/register"))}
                  >
                    Sign up to keep your cards
                  </button>
                </>
              ) : null}
              {!user || user.is_guest ? (
                <button
                  className="phone-box-menu__item"
                  type="button"
                  onClick={() => choose(() => navigate("/login"))}
                >
                  Sign in
                </button>
              ) : null}
            </section>
            <section className="phone-box-menu__section">
              <h2 className="phone-box-menu__label">Add recipe</h2>
              <button className="phone-box-menu__item" type="button" onClick={() => choose(onAdd)}>
                Type, link or scan
              </button>
            </section>
            <section className="phone-box-menu__section">
              <h2 className="phone-box-menu__label">View</h2>
              <button
                aria-pressed={simpleList}
                className="phone-box-menu__item"
                type="button"
                onClick={() => choose(onToggleSimpleList)}
              >
                Simple list
              </button>
              <button className="phone-box-menu__item" type="button" onClick={() => choose(onSearch)}>
                Search
              </button>
            </section>
            {user && !user.is_guest ? (
              <button
                className="phone-box-menu__item phone-box-menu__signout"
                type="button"
                onClick={() => void signOut()}
              >
                Sign out
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

type PhoneAddSheetProps = {
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

/** Full-screen sheet holding the Add forms (type, URL, scan). */
export function PhoneAddSheet({ title = "Add recipe", onClose, children }: PhoneAddSheetProps) {
  const panelRef = useDialogKeys(true, onClose);
  return (
    <div ref={panelRef} aria-labelledby="phone-add-title" aria-modal="true" className="phone-box-sheet" role="dialog">
      <div className="phone-box-sheet__head">
        <h2 id="phone-add-title">{title}</h2>
        <button className="phone-box-btn" type="button" onClick={onClose}>
          Close
        </button>
      </div>
      {children}
    </div>
  );
}
