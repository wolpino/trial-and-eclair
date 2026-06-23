import type { IdeaStatus } from "../../api/development";

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  researching: "Researching",
  testing: "Testing",
  ready: "Ready to publish",
  archived: "Archived",
};

export const IDEA_STATUS_OPTIONS: IdeaStatus[] = [
  "researching",
  "testing",
  "ready",
  "archived",
];
