import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import {
  importFromUrl,
  saveUrlImport,
  scanImport,
  type ForkType,
  type UrlRecipeImport,
} from "../api/imports";

type RecipeImportPanelProps = {
  destination: "box" | "lab";
};

function previewTitle(record: UrlRecipeImport): string {
  return record.source_title || record.normalized_url;
}

export function RecipeImportPanel({ destination }: RecipeImportPanelProps) {
  const navigate = useNavigate();
  const forkType: ForkType = destination === "lab" ? "rework" : "save_to_box";
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<UrlRecipeImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);

  async function handleFetch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFetching(true);
    setError(null);
    setPreview(null);
    try {
      setPreview(await importFromUrl(url.trim()));
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not fetch that URL.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSave() {
    if (!preview) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await saveUrlImport(preview.id, forkType);
      navigate(
        destination === "lab"
          ? `/developer/lab/${result.recipe.id}`
          : `/recipe-box/${result.recipe.id}`,
      );
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save the import.");
    } finally {
      setSaving(false);
    }
  }

  async function handleScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("scan") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      setError("Choose a photo or PDF first.");
      return;
    }
    setScanning(true);
    setError(null);
    try {
      const result = await scanImport(file, destination);
      navigate(
        destination === "lab"
          ? `/developer/lab/${result.recipe.id}`
          : `/recipe-box/${result.recipe.id}`,
      );
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not upload the scan.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <section className="recipe-import" aria-label="Import a recipe">
      <h2 className="recipe-import__heading">Import</h2>
      {error ? <p className="form-error">{error}</p> : null}

      <form className="recipe-import__row" onSubmit={(event) => void handleFetch(event)}>
        <label>
          From URL
          <input
            type="url"
            required
            placeholder="https://"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </label>
        <button className="paper-btn paper-btn--ghost" disabled={fetching} type="submit">
          {fetching ? "Fetching…" : "Preview"}
        </button>
      </form>

      {preview ? (
        <div className="recipe-import__preview">
          <p className="recipe-import__preview-title">{previewTitle(preview)}</p>
          <p className="recipe-import__preview-meta">
            {[preview.source_author, preview.source_site, preview.normalized_url]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {preview.fetch_error ? (
            <p className="form-error">{preview.fetch_error}</p>
          ) : null}
          <button
            className="paper-btn"
            disabled={saving || Boolean(preview.fetch_error)}
            type="button"
            onClick={() => void handleSave()}
          >
            {saving
              ? "Saving…"
              : destination === "lab"
                ? "Open in lab"
                : "Save to box"}
          </button>
        </div>
      ) : null}

      <form className="recipe-import__row" onSubmit={(event) => void handleScan(event)}>
        <label>
          Photo or PDF
          <input accept="image/*,.pdf,application/pdf" name="scan" type="file" />
        </label>
        <button className="paper-btn paper-btn--ghost" disabled={scanning} type="submit">
          {scanning ? "Uploading…" : "Upload scan"}
        </button>
      </form>
      <p className="recipe-import__note">
        Scans open a draft titled from the filename. Ingredients and steps still need to be added.
      </p>
    </section>
  );
}
