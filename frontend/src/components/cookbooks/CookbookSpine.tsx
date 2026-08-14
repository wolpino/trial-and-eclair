import { Link } from "react-router-dom";

import type { Cookbook } from "../../api/development";

type CookbookSpineProps = {
  cookbook: Cookbook;
};

export function CookbookSpine({ cookbook }: CookbookSpineProps) {
  const cloth = cookbook.status === "published" ? "published" : "draft";

  return (
    <Link
      className={`cookbook-spine cookbook-spine--${cloth}`}
      to={`/developer/cookbooks/${cookbook.id}`}
      title={cookbook.title}
    >
      <span className="cookbook-spine__band" aria-hidden="true" />
      <p className="cookbook-spine__title">{cookbook.title}</p>
      <span className="cookbook-spine__meta">
        {cookbook.entries.length} {cookbook.entries.length === 1 ? "card" : "cards"} · {cookbook.status}
      </span>
    </Link>
  );
}
