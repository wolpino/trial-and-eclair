import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ApiError,
  fetchPublicRecipe,
  mediaUrl,
  type PublicRecipe,
} from "../api/client";
import { RecipeViewer } from "../components/RecipeViewer";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import "../styles/public.css";

export function PublicRecipePage() {
  const { slug } = useParams<{ slug: string }>();
  const [recipe, setRecipe] = useState<PublicRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setError("Recipe not found.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPublicRecipe(slug)
      .then((data) => {
        if (!cancelled) {
          setRecipe(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 404) {
            setError("Recipe not found.");
          } else {
            setError("Could not load recipe.");
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

  const heroAbsolute = recipe?.hero_image ? mediaUrl(recipe.hero_image) ?? undefined : undefined;

  useDocumentMeta({
    title: recipe ? `${recipe.title} · Trial and Eclair` : "Trial and Eclair",
    description: recipe?.description || recipe?.story || undefined,
    image: heroAbsolute,
  });

  if (loading) {
    return <p className="status-message">Loading recipe…</p>;
  }

  if (error || !recipe) {
    return (
      <div className="status-message">
        <p>{error ?? "Recipe not found."}</p>
        <Link to="/">Back home</Link>
      </div>
    );
  }

  return (
    <div className="public-page">
      <RecipeViewer recipe={recipe} />
    </div>
  );
}
