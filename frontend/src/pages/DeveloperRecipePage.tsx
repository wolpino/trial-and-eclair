import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError, mediaUrl } from "../api/client";
import { AddIngredientLineForm } from "../components/AddIngredientLineForm";
import {
  compareVersions,
  createJournalEntry,
  createVersionIngredientLine,
  deleteJournalEntry,
  deleteVersionIngredientLine,
  fetchDevelopmentRecipe,
  fetchJournal,
  fetchRecipeVersions,
  patchRecipeVersion,
  publishRecipe,
  saveNewVersion,
  unpublishRecipe,
  type DevelopmentRecipe,
  type JournalEntry,
  type RecipeVersion,
  type VersionDiff,
} from "../api/development";
import { displayUnit, formatQuantity } from "../lib/recipeFormat";
import type { PublicIngredientLine } from "../api/client";

export function DeveloperRecipePage() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [recipe, setRecipe] = useState<DevelopmentRecipe | null>(null);
  const [versions, setVersions] = useState<RecipeVersion[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [diff, setDiff] = useState<VersionDiff | null>(null);
  const [leftVersion, setLeftVersion] = useState("");
  const [rightVersion, setRightVersion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [journalBody, setJournalBody] = useState("");
  const [publishSlug, setPublishSlug] = useState("");
  const [publishStory, setPublishStory] = useState("");

  useEffect(() => {
    if (!recipeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      fetchDevelopmentRecipe(recipeId),
      fetchRecipeVersions(recipeId),
      fetchJournal(recipeId),
    ])
      .then(([recipeData, versionData, journalData]) => {
        setRecipe(recipeData);
        setVersions(versionData);
        setJournal(journalData);
        if (versionData.length > 0) {
          setLeftVersion((current) => current || versionData[0].id);
        }
        if (versionData.length > 1) {
          setRightVersion(
            (current) => current || versionData[versionData.length - 1].id,
          );
        }
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load recipe.");
      })
      .finally(() => setLoading(false));
  }, [recipeId]);

  async function reload() {
    if (!recipeId) {
      return;
    }
    const [recipeData, versionData, journalData] = await Promise.all([
      fetchDevelopmentRecipe(recipeId),
      fetchRecipeVersions(recipeId),
      fetchJournal(recipeId),
    ]);
    setRecipe(recipeData);
    setVersions(versionData);
    setJournal(journalData);
  }

  if (loading) {
    return <p className="status-message">Loading recipe…</p>;
  }

  if (error || !recipe) {
    return (
      <main className="page-shell">
        <p className="form-error">{error ?? "Recipe not found."}</p>
        <Link to="/developer/lab">Back to lab</Link>
      </main>
    );
  }

  const version = recipe.current_version;

  async function handleSaveVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const v = recipe!.current_version;
    setSaving(true);
    try {
      await patchRecipeVersion(recipe!.id, v.id, {
        title: v.title,
        description: v.description,
        version_notes: v.version_notes,
        equipment_notes: v.equipment_notes,
        prep_minutes: v.prep_minutes,
        cook_minutes: v.cook_minutes,
        story: v.story,
      });
      await reload();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNewVersion() {
    setSaving(true);
    try {
      await saveNewVersion(recipe!.id, version.version_notes);
      await reload();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save version.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCompare() {
    if (!leftVersion || !rightVersion) {
      return;
    }
    try {
      setDiff(await compareVersions(recipe!.id, leftVersion, rightVersion));
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not compare.");
    }
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await publishRecipe(recipe!.id, {
        slug: publishSlug || undefined,
        story: publishStory || undefined,
      });
      setRecipe(updated);
      await reload();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not publish.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublish() {
    setSaving(true);
    try {
      const updated = await unpublishRecipe(recipe!.id);
      setRecipe(updated);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not unpublish.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddJournal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createJournalEntry({
        recipe: recipe!.id,
        body: journalBody,
        version_snapshot: version.id,
      });
      setJournalBody("");
      setJournal(await fetchJournal(recipe!.id));
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save journal entry.");
    }
  }

  function updateVersionField<K extends keyof RecipeVersion>(
    field: K,
    value: RecipeVersion[K],
  ) {
    setRecipe({
      ...recipe!,
      current_version: { ...version, [field]: value },
    });
  }

  const heroUrl = mediaUrl(version.hero_image);

  return (
    <main className="page-shell recipe-editor">
      <p>
        <Link to="/developer/lab">← Lab</Link>
      </p>
      <header className="section-header">
        <h1>{recipe.title}</h1>
        <p className="item-meta">
          Version {version.version_number} · {recipe.status}
          {recipe.slug ? (
            <>
              {" "}
              · <Link to={`/r/${recipe.slug}`}>View public</Link>
            </>
          ) : null}
        </p>
      </header>

      {error ? <p className="form-error">{error}</p> : null}

      <form className="editor-form panel" onSubmit={(event) => void handleSaveVersion(event)}>
        <h2>Current version</h2>
        <label>
          Title
          <input
            value={version.title}
            onChange={(event) => updateVersionField("title", event.target.value)}
          />
        </label>
        <label>
          Description
          <textarea
            rows={3}
            value={version.description}
            onChange={(event) =>
              updateVersionField("description", event.target.value)
            }
          />
        </label>
        <label>
          Version notes
          <textarea
            rows={2}
            value={version.version_notes}
            onChange={(event) =>
              updateVersionField("version_notes", event.target.value)
            }
          />
        </label>
        <label>
          Equipment notes
          <textarea
            rows={2}
            value={version.equipment_notes}
            onChange={(event) =>
              updateVersionField("equipment_notes", event.target.value)
            }
          />
        </label>
        <div className="inline-form-row">
          <label>
            Prep (min)
            <input
              type="number"
              min={0}
              value={version.prep_minutes ?? ""}
              onChange={(event) =>
                updateVersionField(
                  "prep_minutes",
                  event.target.value ? Number(event.target.value) : null,
                )
              }
            />
          </label>
          <label>
            Cook (min)
            <input
              type="number"
              min={0}
              value={version.cook_minutes ?? ""}
              onChange={(event) =>
                updateVersionField(
                  "cook_minutes",
                  event.target.value ? Number(event.target.value) : null,
                )
              }
            />
          </label>
        </div>
        <div className="button-row">
          <button disabled={saving} type="submit">
            Save changes
          </button>
          <button
            disabled={saving}
            type="button"
            onClick={() => void handleSaveNewVersion()}
          >
            Save new version
          </button>
        </div>
      </form>

      <section className="panel">
        <h2>Ingredients</h2>
        <ul className="ingredient-edit-list">
          {version.ingredient_lines.map((line) => (
            <li key={line.id}>
              <span className="ingredient-qty">
                {formatQuantity(line.quantity)}{" "}
                {displayUnit(line as PublicIngredientLine)}
              </span>{" "}
              {line.ingredient_name}
              {line.prep_note ? (
                <span className="ingredient-note"> ({line.prep_note})</span>
              ) : null}
              <button
                className="text-button"
                type="button"
                onClick={() =>
                  void deleteVersionIngredientLine(version.id, line.id).then(reload)
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <AddIngredientLineForm
          sortOrder={version.ingredient_lines.length}
          onAdded={() => void reload()}
          onAdd={(data) => createVersionIngredientLine(version.id, data)}
        />
      </section>

      <section className="panel">
        <h2>Compare versions</h2>
        <div className="inline-form-row">
          <select
            value={leftVersion}
            onChange={(event) => setLeftVersion(event.target.value)}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.version_number}
              </option>
            ))}
          </select>
          <select
            value={rightVersion}
            onChange={(event) => setRightVersion(event.target.value)}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.version_number}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => void handleCompare()}>
            Compare
          </button>
        </div>
        {diff ? (
          <div className="diff-panel">
            {diff.field_changes.length > 0 ? (
              <ul>
                {diff.field_changes.map((change) => (
                  <li key={change.field}>
                    <strong>{change.field}</strong>: {String(change.left)} →{" "}
                    {String(change.right)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="page-note">No field changes.</p>
            )}
            {diff.ingredient_changes.added.length > 0 ? (
              <p>Added: {diff.ingredient_changes.added.map((l) => l.ingredient_name).join(", ")}</p>
            ) : null}
            {diff.ingredient_changes.removed.length > 0 ? (
              <p>
                Removed:{" "}
                {diff.ingredient_changes.removed.map((l) => l.ingredient_name).join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h2>Publish</h2>
        {recipe.status === "published" ? (
          <div className="button-row">
            {recipe.slug ? (
              <Link to={`/r/${recipe.slug}`}>Open public page</Link>
            ) : null}
            <button disabled={saving} type="button" onClick={() => void handleUnpublish()}>
              Unpublish
            </button>
          </div>
        ) : (
          <form className="editor-form" onSubmit={(event) => void handlePublish(event)}>
            <label>
              Slug (optional)
              <input
                value={publishSlug}
                onChange={(event) => setPublishSlug(event.target.value)}
              />
            </label>
            <label>
              Story (optional)
              <textarea
                rows={3}
                value={publishStory}
                onChange={(event) => setPublishStory(event.target.value)}
              />
            </label>
            <button disabled={saving} type="submit">
              Publish
            </button>
          </form>
        )}
        {heroUrl ? (
          <img alt="" className="editor-hero" src={heroUrl} />
        ) : null}
      </section>

      <section className="panel">
        <h2>Journal</h2>
        <ul className="journal-list">
          {journal.map((entry) => (
            <li key={entry.id}>
              <p>{entry.body}</p>
              <span className="item-meta">{new Date(entry.logged_at).toLocaleString()}</span>
              <button
                className="text-button"
                type="button"
                onClick={() =>
                  void deleteJournalEntry(entry.id).then(() =>
                    fetchJournal(recipe!.id).then(setJournal),
                  )
                }
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <form className="editor-form" onSubmit={(event) => void handleAddJournal(event)}>
          <label>
            New entry
            <textarea
              required
              rows={3}
              value={journalBody}
              onChange={(event) => setJournalBody(event.target.value)}
            />
          </label>
          <button type="submit">Log entry</button>
        </form>
      </section>
    </main>
  );
}
