import { Link } from "react-router-dom";

/** The one way out of a focused view; replaces Back/Forward (decision 004). */
export function BackToKitchen() {
  return (
    <Link className="kitchen-back" to="/">
      <span aria-hidden="true">←</span> Back to kitchen
    </Link>
  );
}
