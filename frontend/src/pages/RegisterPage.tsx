import { FormEvent, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import { fetchRecipeBox } from "../api/collection";
import { defaultRouteForUser } from "../auth/access";
import { useAuth } from "../auth/AuthContext";
import { AuthCard } from "../components/AuthCard";

export function RegisterPage() {
  const { user, register } = useAuth();
  const isGuest = user?.is_guest === true;
  const [guestCards, setGuestCards] = useState<number | null>(null);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isGuest) {
      return;
    }
    fetchRecipeBox()
      .then((cards) => setGuestCards(cards.length))
      .catch(() => setGuestCards(null));
  }, [isGuest]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user = await register({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      });
      navigate(defaultRouteForUser(user), { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || "Could not register.");
      } else {
        setError("Could not register.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      note={
        isGuest
          ? guestCardsNote(guestCards)
          : "New accounts start as home cooks (free). You can start a 14-day developer trial from the home page anytime."
      }
      switchPrompt="Already have an account?"
      switchTo="/login"
      switchLabel="Log in"
    >
      <form className="auth-form paper-form" onSubmit={(event) => void handleSubmit(event)}>
        {error ? <p className="form-error">{error}</p> : null}
        <label>
          Username
          <input
            autoComplete="username"
            className="paper-field"
            name="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label>
          Email <span className="label-optional">(optional)</span>
          <input
            autoComplete="email"
            className="paper-field"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            autoComplete="new-password"
            className="paper-field"
            minLength={8}
            name="password"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label>
          Confirm password
          <input
            autoComplete="new-password"
            className="paper-field"
            minLength={8}
            name="password_confirm"
            required
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
          />
        </label>
        <button className="paper-btn" disabled={submitting} type="submit">
          {submitting ? "Creating account…" : "Register"}
        </button>
      </form>
    </AuthCard>
  );
}

/** Signing up turns the guest into this account, so their cards stay (decision 002). */
function guestCardsNote(count: number | null): string {
  if (count === null) {
    return "Your guest cards stay in your box.";
  }
  return `Your ${count} guest ${count === 1 ? "card stays" : "cards stay"} in your box.`;
}
