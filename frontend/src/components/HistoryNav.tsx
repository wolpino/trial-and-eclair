import { useEffect, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";

function historyIndex(): number {
  const idx = window.history.state?.idx;
  return typeof idx === "number" ? idx : 0;
}

export function HistoryNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const action = useNavigationType();
  const idx = historyIndex();
  const [maxIdx, setMaxIdx] = useState(idx);

  useEffect(() => {
    if (action === "POP") {
      setMaxIdx((current) => Math.max(current, idx));
      return;
    }
    setMaxIdx(idx);
  }, [action, idx, location.key]);

  return (
    <div className="history-nav" role="group" aria-label="Page history">
      <button
        type="button"
        className="nav-button"
        disabled={idx <= 0}
        onClick={() => navigate(-1)}
      >
        Back
      </button>
      <button
        type="button"
        className="nav-button"
        disabled={idx >= maxIdx}
        onClick={() => navigate(1)}
      >
        Forward
      </button>
    </div>
  );
}
