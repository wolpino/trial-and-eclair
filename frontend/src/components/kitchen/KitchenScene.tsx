import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { fetchCookbooks, type Cookbook } from "../../api/development";
import { canStartDeveloperTrial } from "../../auth/access";
import { useAuth } from "../../auth/AuthContext";
import { StartTrialCallout } from "../StartTrialCallout";
import { KitchenClock } from "./KitchenClock";
import "../../styles/kitchen.css";

const LOCKED_TIP = "For developers. Start a 14-day developer trial to use it.";

function Padlock() {
  return (
    <svg className="kitchen-lock" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" strokeWidth="2.5" />
      <rect x="4" y="10" width="16" height="11" rx="2" />
    </svg>
  );
}

/** A clickable object: a link, or a locked button that stays put. */
function KitchenObject({
  name,
  to,
  locked,
  className,
  children,
}: {
  name: string;
  to: string;
  locked: boolean;
  className: string;
  children: ReactNode;
}) {
  if (locked) {
    return (
      <button
        type="button"
        className={`kitchen-object kitchen-object--locked ${className}`}
        aria-label={`${name} (locked)`}
        aria-disabled="true"
        title={LOCKED_TIP}
      >
        {children}
        <Padlock />
      </button>
    );
  }
  return (
    <Link className={`kitchen-object ${className}`} to={to} aria-label={name} title={name}>
      {children}
    </Link>
  );
}

function CorkBoardDrawing() {
  return (
    <span className="kitchen-board__cork" aria-hidden="true">
      <span className="kitchen-board__note kitchen-board__note--a" />
      <span className="kitchen-board__note kitchen-board__note--b" />
      <span className="kitchen-board__note kitchen-board__note--c" />
      <span className="kitchen-board__note kitchen-board__note--d" />
    </span>
  );
}

function NotebookDrawing() {
  return (
    <span className="kitchen-notebook__cover" aria-hidden="true">
      <span className="kitchen-notebook__label">Lab</span>
    </span>
  );
}

function RecipeBoxDrawing() {
  return (
    <span className="kitchen-box__drawing" aria-hidden="true">
      <span className="kitchen-box__card kitchen-box__card--a" />
      <span className="kitchen-box__card kitchen-box__card--b" />
      <span className="kitchen-box__front">
        <span className="kitchen-box__plate">Recipes</span>
      </span>
    </span>
  );
}

function Decoration() {
  return (
    <div className="kitchen-decor" aria-hidden="true">
      {["counter", "shelf"].map((spot) => (
        <span key={spot} className={`kitchen-plant kitchen-plant--${spot}`}>
          <span className="kitchen-plant__leaf kitchen-plant__leaf--a" />
          <span className="kitchen-plant__leaf kitchen-plant__leaf--b" />
          <span className="kitchen-plant__leaf kitchen-plant__leaf--c" />
        </span>
      ))}
      <span className="kitchen-lemons">
        <span className="kitchen-lemon" />
        <span className="kitchen-lemon" />
        <span className="kitchen-lemon" />
      </span>
      <span className="kitchen-mug" />
    </div>
  );
}

/** The signed-in home on wide screens: one drawn kitchen (decision 004). */
export function KitchenScene() {
  const { user, hasDeveloperAccess } = useAuth();
  const [shelfBooks, setShelfBooks] = useState<Cookbook[]>([]);

  useEffect(() => {
    if (!hasDeveloperAccess) {
      setShelfBooks([]);
      return;
    }
    let cancelled = false;
    fetchCookbooks()
      .then((books) => {
        if (!cancelled) {
          setShelfBooks(books.filter((book) => book.on_shelf));
        }
      })
      // The shelf still shows References if cookbooks can't load.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [hasDeveloperAccess]);

  const locked = !hasDeveloperAccess;
  const trialEnded =
    user !== null &&
    !hasDeveloperAccess &&
    user.role === "developer" &&
    !canStartDeveloperTrial(user);

  return (
    <main className="kitchen" aria-label="Kitchen">
      <h1 className="kitchen-title">Trial and Eclair</h1>
      <div className="kitchen-wall" aria-hidden="true" />
      <div className="kitchen-counter" aria-hidden="true" />
      <Decoration />

      <div className="kitchen-shelf-area">
        <ul className="kitchen-shelf" aria-label="Shelf">
          <li>
            <Link
              className="kitchen-object kitchen-references"
              to="/references"
              aria-label="References"
              title="References"
            >
              <span className="kitchen-book kitchen-book--ref-a" aria-hidden="true" />
              <span className="kitchen-book kitchen-book--ref-b" aria-hidden="true" />
              <span className="kitchen-book kitchen-book--ref-c" aria-hidden="true" />
            </Link>
          </li>
          {shelfBooks.map((book) => (
            <li key={book.id}>
              <Link
                className="kitchen-object kitchen-book kitchen-book--cookbook"
                to={`/developer/cookbooks/${book.id}`}
                aria-label={`Cookbook: ${book.title}`}
                title={book.title}
              >
                <span className="kitchen-book__title" aria-hidden="true">
                  {book.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="kitchen-shelf__plank" aria-hidden="true" />
      </div>

      <KitchenClock />

      <KitchenObject name="Cork board" to="/developer" locked={locked} className="kitchen-board">
        <CorkBoardDrawing />
      </KitchenObject>

      <KitchenObject
        name="Lab notebook"
        to="/developer/lab"
        locked={locked}
        className="kitchen-notebook"
      >
        <NotebookDrawing />
      </KitchenObject>

      <KitchenObject name="Recipe box" to="/recipe-box" locked={false} className="kitchen-box">
        <RecipeBoxDrawing />
      </KitchenObject>

      {user && canStartDeveloperTrial(user) ? (
        <div className="kitchen-note">
          <StartTrialCallout />
        </div>
      ) : null}
      {trialEnded ? (
        <p className="kitchen-note home-note">
          Your developer trial has ended. Paid billing is not available yet.
        </p>
      ) : null}
    </main>
  );
}
