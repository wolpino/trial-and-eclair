import { Link } from "react-router-dom";

import type { Cookbook } from "../../api/development";

type CookbookSpineProps = {
  cookbook: Cookbook;
};

export function CookbookSpine({ cookbook }: CookbookSpineProps) {
  return (
    <Link
      className="cookbook-spine"
      to={`/developer/cookbooks/${cookbook.id}`}
      title={cookbook.title}
    >
      <p className="cookbook-spine__title">{cookbook.title}</p>
      <span className="cookbook-spine__meta">
        {cookbook.entries.length} · {cookbook.status}
      </span>
    </Link>
  );
}
