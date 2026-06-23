import { FormEvent } from "react";
import { Link } from "react-router-dom";

import { mediaUrl } from "../../api/client";
import type { DevelopmentRecipe, RecipeVersion } from "../../api/development";

type PublishPanelProps = {
  recipe: DevelopmentRecipe;
  version: RecipeVersion;
  slug: string;
  story: string;
  heroImage: File | null;
  saving: boolean;
  onSlugChange: (value: string) => void;
  onStoryChange: (value: string) => void;
  onHeroImageChange: (file: File | null) => void;
  onPublish: (event: FormEvent<HTMLFormElement>) => void;
  onUnpublish: () => void;
};

export function PublishPanel({
  recipe,
  version,
  slug,
  story,
  heroImage,
  saving,
  onSlugChange,
  onStoryChange,
  onHeroImageChange,
  onPublish,
  onUnpublish,
}: PublishPanelProps) {
  const heroUrl = mediaUrl(version.hero_image);

  return (
    <div className="lab-publish-panel">
      {recipe.status === "published" ? (
        <>
          <p className="lab-page__note">
            Published{recipe.slug ? ` as /r/${recipe.slug}` : ""}.
          </p>
          <div className="lab-spread-actions">
            {recipe.slug ? (
              <Link className="lab-btn lab-btn--ghost" to={`/r/${recipe.slug}`}>
                Open public page
              </Link>
            ) : null}
            <button
              className="lab-btn"
              disabled={saving}
              type="button"
              onClick={onUnpublish}
            >
              Unpublish
            </button>
          </div>
        </>
      ) : (
        <form className="lab-publish-form" onSubmit={onPublish}>
          <label>
            Slug (optional)
            <input value={slug} onChange={(event) => onSlugChange(event.target.value)} />
          </label>
          <label>
            Story (optional)
            <textarea rows={4} value={story} onChange={(event) => onStoryChange(event.target.value)} />
          </label>
          <label>
            Hero image (optional)
            <input
              accept="image/*"
              type="file"
              onChange={(event) =>
                onHeroImageChange(event.target.files?.[0] ?? null)
              }
            />
          </label>
          {heroImage ? (
            <p className="lab-page__note">Selected: {heroImage.name}</p>
          ) : null}
          <button className="lab-btn" disabled={saving} type="submit">
            Publish
          </button>
        </form>
      )}
      {heroUrl ? <img alt="" className="lab-publish-hero" src={heroUrl} /> : null}
    </div>
  );
}
