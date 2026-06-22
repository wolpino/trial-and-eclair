import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError, fetchPublicCookbook, type PublicCookbook } from "../api/client";
import { CookbookViewer } from "../components/CookbookViewer";

export function PublicCookbookPage() {
  const { slug } = useParams<{ slug: string }>();
  const [cookbook, setCookbook] = useState<PublicCookbook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setError("Cookbook not found.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPublicCookbook(slug)
      .then((data) => {
        if (!cancelled) {
          setCookbook(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 404) {
            setError("Cookbook not found.");
          } else {
            setError("Could not load cookbook.");
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <p className="status-message">Loading cookbook…</p>;
  }

  if (error || !cookbook) {
    return (
      <div className="status-message">
        <p>{error ?? "Cookbook not found."}</p>
        <Link to="/">Back home</Link>
      </div>
    );
  }

  return <CookbookViewer cookbook={cookbook} />;
}
