import type { User } from "../api/client";

const BLOCKED_SUBSCRIPTION = new Set<User["subscription_status"]>([
  "expired",
  "cancelled",
]);

export function hasDeveloperAccess(user: User): boolean {
  if (user.role !== "developer") {
    return false;
  }
  if (BLOCKED_SUBSCRIPTION.has(user.subscription_status)) {
    return false;
  }
  if (user.subscription_status === "trial" && user.trial_ends_at) {
    return new Date(user.trial_ends_at) > new Date();
  }
  return true;
}

export function defaultRouteForUser(user: User): string {
  if (user.role === "developer" && hasDeveloperAccess(user)) {
    return "/developer";
  }
  if (user.role === "home_cook") {
    return "/recipe-box";
  }
  return "/";
}
