import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError } from "../api/client";
import { ComparePanel } from "../components/lab/ComparePanel";
import { LabJournal } from "../components/lab/LabJournal";
import { LabTestSessions } from "../components/lab/LabTestSessions";
import { MarginTools } from "../components/lab/MarginTools";
import { NotebookMargin } from "../components/lab/NotebookMargin";
import { NotebookOverlay } from "../components/lab/NotebookOverlay";
import { NotebookSpread } from "../components/lab/NotebookSpread";
import { PublishPanel } from "../components/lab/PublishPanel";
import {
  SpreadActions,
  SpreadHeader,
  SpreadIngredients,
  SpreadSteps,
  VersionNotes,
} from "../components/lab/SpreadContent";
import { VersionFlip } from "../components/lab/VersionFlip";
import {
  compareVersions,
  createJournalEntry,
  createTestSession,
  createVersionIngredientLine,
  createVersionStep,
  deleteJournalEntry,
  deleteTestSession,
  deleteTestSessionPhoto,
  deleteVersionIngredientLine,
  deleteVersionStep,
  fetchDevelopmentRecipe,
  fetchJournal,
  fetchRecipeVersions,
  fetchTestSessions,
  patchRecipeVersion,
  patchVersionStep,
  publishRecipe,
  saveNewVersion,
  unpublishRecipe,
  uploadTestSessionPhoto,
  type DevelopmentRecipe,
  type JournalEntry,
  type RecipeVersion,
  type TestSession,
  type VersionDiff,
} from "../api/development";
import "../styles/lab.css";

export function DeveloperRecipePage() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [recipe, setRecipe] = useState<DevelopmentRecipe | null>(null);
  const [versions, setVersions] = useState<RecipeVersion[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [activeVersionId, setActiveVersionId] = useState("");
  const [draftVersion, setDraftVersion] = useState<RecipeVersion | null>(null);
  const [diff, setDiff] = useState<VersionDiff | null>(null);
  const [leftVersion, setLeftVersion] = useState("");
  const [rightVersion, setRightVersion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [journalBody, setJournalBody] = useState("");
  const [journalOpen, setJournalOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishSlug, setPublishSlug] = useState("");
  const [publishStory, setPublishStory] = useState("");
  const [publishHeroImage, setPublishHeroImage] = useState<File | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionOutcome, setSessionOutcome] = useState("");
  const [sessionPhotos, setSessionPhotos] = useState<File[]>([]);

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
      .then(async ([recipeData, versionData, journalData]) => {
        setRecipe(recipeData);
        setVersions(versionData);
        setJournal(journalData);
        setActiveVersionId(recipeData.current_version.id);
        setDraftVersion(recipeData.current_version);
        setTestSessions(
          await fetchTestSessions(recipeData.current_version.id),
        );
        if (versionData.length > 0) {
          setLeftVersion(versionData[0].id);
        }
        if (versionData.length > 1) {
          setRightVersion(versionData[versionData.length - 1].id);
        }
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load recipe.");
      })
      .finally(() => setLoading(false));
  }, [recipeId]);

  const currentVersionId = recipe?.current_version.id ?? "";
  const isCurrentVersion = activeVersionId === currentVersionId;

  const displayedVersion = useMemo(() => {
    if (isCurrentVersion && draftVersion) {
      return draftVersion;
    }
    return versions.find((version) => version.id === activeVersionId) ?? draftVersion;
  }, [activeVersionId, draftVersion, isCurrentVersion, versions]);

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
    setActiveVersionId(recipeData.current_version.id);
    setDraftVersion(recipeData.current_version);
    const versionId =
      activeVersionId === recipeData.current_version.id
        ? recipeData.current_version.id
        : activeVersionId;
    if (versionId) {
      setTestSessions(await fetchTestSessions(versionId));
    }
  }

  async function reloadTestSessions(versionId: string) {
    setTestSessions(await fetchTestSessions(versionId));
  }

  function selectVersion(versionId: string) {
    setActiveVersionId(versionId);
    if (versionId === currentVersionId && recipe && activeVersionId !== currentVersionId) {
      setDraftVersion(recipe.current_version);
    }
    void reloadTestSessions(versionId);
  }

  function updateDraftField<K extends keyof RecipeVersion>(
    field: K,
    value: RecipeVersion[K],
  ) {
    if (!draftVersion) {
      return;
    }
    setDraftVersion({ ...draftVersion, [field]: value });
  }

  async function handleSaveVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recipe || !draftVersion || !isCurrentVersion) {
      return;
    }
    setSaving(true);
    try {
      await patchRecipeVersion(recipe.id, draftVersion.id, {
        title: draftVersion.title,
        description: draftVersion.description,
        version_notes: draftVersion.version_notes,
        equipment_notes: draftVersion.equipment_notes,
        prep_minutes: draftVersion.prep_minutes,
        cook_minutes: draftVersion.cook_minutes,
        story: draftVersion.story,
      });
      await reload();
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNewVersion() {
    if (!recipe || !draftVersion || !isCurrentVersion) {
      return;
    }
    setSaving(true);
    try {
      await patchRecipeVersion(recipe.id, draftVersion.id, {
        title: draftVersion.title,
        description: draftVersion.description,
        version_notes: draftVersion.version_notes,
        equipment_notes: draftVersion.equipment_notes,
        prep_minutes: draftVersion.prep_minutes,
        cook_minutes: draftVersion.cook_minutes,
        story: draftVersion.story,
      });
      await saveNewVersion(recipe.id, draftVersion.version_notes);
      await reload();
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save version.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCompare() {
    if (!recipe || !leftVersion || !rightVersion) {
      return;
    }
    try {
      setDiff(await compareVersions(recipe.id, leftVersion, rightVersion));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not compare.");
    }
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recipe) {
      return;
    }
    setSaving(true);
    try {
      await publishRecipe(recipe.id, {
        slug: publishSlug || undefined,
        story: publishStory || undefined,
        hero_image: publishHeroImage ?? undefined,
      });
      await reload();
      setPublishOpen(false);
      setPublishHeroImage(null);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not publish.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublish() {
    if (!recipe) {
      return;
    }
    setSaving(true);
    try {
      await unpublishRecipe(recipe.id);
      await reload();
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not unpublish.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddTestSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayedVersion) {
      return;
    }
    try {
      const session = await createTestSession(displayedVersion.id, {
        notes: sessionNotes,
        outcome: sessionOutcome,
      });
      for (const photo of sessionPhotos) {
        await uploadTestSessionPhoto(session.id, photo);
      }
      setSessionNotes("");
      setSessionOutcome("");
      setSessionPhotos([]);
      await reloadTestSessions(displayedVersion.id);
      setJournalOpen(true);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not log bake session.");
    }
  }

  async function handleAddJournal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recipe || !displayedVersion) {
      return;
    }
    try {
      await createJournalEntry({
        recipe: recipe.id,
        body: journalBody,
        version_snapshot: displayedVersion.id,
      });
      setJournalBody("");
      setJournal(await fetchJournal(recipe.id));
      setJournalOpen(true);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save journal entry.");
    }
  }

  if (loading) {
    return <p className="status-message">Loading notebook…</p>;
  }

  if (error && !recipe) {
    return (
      <main className="lab-page">
        <p className="lab-form-error">{error}</p>
        <Link className="lab-back-link" to="/developer/lab">
          Back to lab
        </Link>
      </main>
    );
  }

  if (!recipe || !displayedVersion) {
    return (
      <main className="lab-page">
        <p className="lab-form-error">Recipe not found.</p>
        <Link className="lab-back-link" to="/developer/lab">
          Back to lab
        </Link>
      </main>
    );
  }

  return (
    <main className="lab-page">
      <Link className="lab-back-link" to="/developer/lab">
        ← Lab shelf
      </Link>

      <div className="lab-status-bar">
        <span>{recipe.status}</span>
        {recipe.slug ? (
          <Link to={`/r/${recipe.slug}`}>Public page</Link>
        ) : null}
        {!isCurrentVersion ? (
          <span className="lab-readonly-badge">
            Viewing v{displayedVersion.version_number} (read-only)
          </span>
        ) : null}
      </div>

      {error ? <p className="lab-form-error">{error}</p> : null}

      <div className="lab-notebook lab-notebook--marbled">
        <NotebookMargin side="left">
          <VersionFlip
            versions={versions}
            activeVersionId={activeVersionId}
            currentVersionId={currentVersionId}
            onSelect={selectVersion}
          />
          <MarginTools
            journalOpen={journalOpen}
            onCompare={() => setCompareOpen(true)}
            onPublish={() => setPublishOpen(true)}
            onToggleJournal={() => setJournalOpen((open) => !open)}
          />
        </NotebookMargin>

        <div className="lab-notebook__center">
          <NotebookSpread
            header={
              <>
                <SpreadHeader
                  version={displayedVersion}
                  editable={isCurrentVersion}
                  onFieldChange={updateDraftField}
                />
                <SpreadActions
                  editable={isCurrentVersion}
                  saving={saving}
                  onSave={(event) => void handleSaveVersion(event)}
                  onSaveNewVersion={() => void handleSaveNewVersion()}
                />
              </>
            }
          >
            <SpreadIngredients
              version={displayedVersion}
              editable={isCurrentVersion}
              onRemoveLine={(lineId) =>
                void deleteVersionIngredientLine(displayedVersion.id, lineId).then(reload)
              }
              onAddLine={(data) => createVersionIngredientLine(displayedVersion.id, data)}
              onAdded={() => void reload()}
            />
            <SpreadSteps
              version={displayedVersion}
              editable={isCurrentVersion}
              onAdd={(data) => createVersionStep(displayedVersion.id, data)}
              onUpdate={(stepId, data) =>
                patchVersionStep(displayedVersion.id, stepId, data)
              }
              onDelete={(stepId) => deleteVersionStep(displayedVersion.id, stepId)}
              onChanged={() => void reload()}
            />
          </NotebookSpread>
        </div>

        <NotebookMargin side="right">
          <VersionNotes
            value={
              isCurrentVersion && draftVersion
                ? draftVersion.version_notes
                : displayedVersion.version_notes
            }
            editable={isCurrentVersion}
            onChange={(value) => updateDraftField("version_notes", value)}
          />
        </NotebookMargin>
      </div>

      <LabJournal
        entries={journal}
        open={journalOpen}
        onToggle={() => setJournalOpen((open) => !open)}
        body={journalBody}
        onBodyChange={setJournalBody}
        onSubmit={(event) => void handleAddJournal(event)}
        onDelete={(entryId) =>
          void deleteJournalEntry(entryId).then(() =>
            recipeId ? fetchJournal(recipeId).then(setJournal) : undefined,
          )
        }
        testSessions={
          <LabTestSessions
            sessions={testSessions}
            editable={isCurrentVersion}
            notes={sessionNotes}
            outcome={sessionOutcome}
            photos={sessionPhotos}
            onNotesChange={setSessionNotes}
            onOutcomeChange={setSessionOutcome}
            onPhotosChange={setSessionPhotos}
            onSubmit={(event) => void handleAddTestSession(event)}
            onDelete={(sessionId) =>
              void deleteTestSession(displayedVersion.id, sessionId).then(() =>
                reloadTestSessions(displayedVersion.id),
              )
            }
            onDeletePhoto={(sessionId, photoId) =>
              void deleteTestSessionPhoto(sessionId, photoId).then(() =>
                reloadTestSessions(displayedVersion.id),
              )
            }
          />
        }
      />

      <NotebookOverlay
        title="Compare versions"
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
      >
        <ComparePanel
          versions={versions}
          leftVersion={leftVersion}
          rightVersion={rightVersion}
          diff={diff}
          onLeftChange={setLeftVersion}
          onRightChange={setRightVersion}
          onCompare={() => void handleCompare()}
        />
      </NotebookOverlay>

      <NotebookOverlay
        title="Publish"
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
      >
        <PublishPanel
          recipe={recipe}
          version={displayedVersion}
          slug={publishSlug}
          story={publishStory}
          heroImage={publishHeroImage}
          saving={saving}
          onSlugChange={setPublishSlug}
          onStoryChange={setPublishStory}
          onHeroImageChange={setPublishHeroImage}
          onPublish={(event) => void handlePublish(event)}
          onUnpublish={() => void handleUnpublish()}
        />
      </NotebookOverlay>
    </main>
  );
}
