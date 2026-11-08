import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { fetchCookbooks, type Cookbook } from "../../api/development";
import { canStartDeveloperTrial } from "../../auth/access";
import { useAuth } from "../../auth/AuthContext";
import { usePhoneLayout } from "../../lib/usePhoneLayout";
import { StartTrialCallout } from "../StartTrialCallout";
import { KitchenClock } from "./KitchenClock";
import { KitchenLight } from "./KitchenLight";
import { useSunlight } from "./useSunlight";
import "../../styles/kitchen.css";

/** A clickable object. `sample` opens the read-only sample view (home cooks). */
function KitchenObject({
  name,
  to,
  sample = false,
  className,
  children,
}: {
  name: string;
  to: string;
  sample?: boolean;
  className: string;
  children: ReactNode;
}) {
  const label = sample ? `${name} (sample)` : name;
  return (
    <Link
      className={`kitchen-object ${className}`}
      to={to}
      aria-label={label}
      title={sample ? `${name}: a read-only sample` : name}
    >
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

/**
 * The signed-in home: one drawn kitchen (decision 004). A phone, upright or
 * sideways, gets a simpler crop of the same objects (`kitchen--phone`).
 */
export function KitchenScene() {
  const { user, hasDeveloperAccess } = useAuth();
  const [shelfBooks, setShelfBooks] = useState<Cookbook[]>([]);
  const sun = useSunlight();
  const phone = usePhoneLayout({ sideways: true });

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

  const sample = !hasDeveloperAccess;
  const trialEnded =
    user !== null &&
    !hasDeveloperAccess &&
    user.role === "developer" &&
    !canStartDeveloperTrial(user);

  return (
    <main
      className={phone ? "kitchen kitchen--phone" : "kitchen"}
      aria-label="Kitchen"
      data-light={sun.phase}
      style={sun.style}
    >
      <h1 className="kitchen-title">Trial and Eclair</h1>
      <div className="kitchen-wall" aria-hidden="true" />
      <div className="kitchen-counter" aria-hidden="true" />
      <KitchenLight sun={sun} />
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

      <KitchenObject
        name="Cork board"
        to={sample ? "/sample/board" : "/developer"}
        sample={sample}
        className="kitchen-board"
      >
        <CorkBoardDrawing />
      </KitchenObject>

      <KitchenObject
        name="Lab notebook"
        to={sample ? "/sample/lab" : "/developer/lab"}
        sample={sample}
        className="kitchen-notebook"
      >
        <NotebookDrawing />
      </KitchenObject>

      <KitchenObject name="Recipe box" to="/recipe-box" className="kitchen-box">
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
