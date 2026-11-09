import { useNavigate } from "react-router-dom";

import { GUEST_CARD_LIMIT } from "../../../auth/access";

export const GUEST_CLEANUP_NOTE = "Guest cards are deleted after 30 days without use.";

/** Shown instead of a form once a guest has 5 cards (decision 002, Card limit). */
export function PhoneSignUpCard() {
  const navigate = useNavigate();
  return (
    <section aria-labelledby="phone-signup-title" className="phone-box-signup">
      <h3 className="phone-box-signup__title" id="phone-signup-title">
        Sign up to save more cards
      </h3>
      <p>
        Guests can keep {GUEST_CARD_LIMIT} cards. Sign up to keep yours and add more. You can
        still open, edit and delete the cards you have.
      </p>
      <p className="phone-box-signup__note">{GUEST_CLEANUP_NOTE}</p>
      <button
        className="phone-box-btn phone-box-btn--primary phone-box-btn--tall"
        type="button"
        onClick={() => navigate("/register")}
      >
        Sign up to keep your cards
      </button>
      <button className="phone-box-btn phone-box-btn--tall" type="button" onClick={() => navigate("/login")}>
        Sign in
      </button>
    </section>
  );
}
