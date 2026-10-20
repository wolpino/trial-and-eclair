import { useEffect, type RefObject } from "react";

/** A press on an element with this attribute closes the open menu and still acts on it. */
const PASSTHROUGH = "[data-dismiss-passthrough]";

/** Eats the click that follows an outside press, so that press only closes. */
function swallowNextClick() {
  function onClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    stop();
  }
  function stop() {
    window.removeEventListener("click", onClick, true);
    window.removeEventListener("pointerdown", stop, true);
    window.removeEventListener("pointercancel", stop, true);
    window.removeEventListener("keydown", stop, true);
  }
  window.addEventListener("click", onClick, true);
  // A press that never becomes a click (a scroll, a drag) must not eat a later one.
  window.addEventListener("pointerdown", stop, true);
  window.addEventListener("pointercancel", stop, true);
  window.addEventListener("keydown", stop, true);
}

/**
 * While `open`, calls `onDismiss` on Escape or on a press outside `ref`.
 * Listens to pointerdown, so the click that opened a menu can't close it.
 * An outside press only closes: its click doesn't reach what is underneath,
 * unless it lands on a `data-dismiss-passthrough` element (another menu's toggle).
 * `onDismiss` returns false when there was nothing open to close.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => boolean | void,
): void {
  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!ref.current || ref.current.contains(target) || onDismiss() === false) {
        return;
      }
      if (!(target instanceof Element && target.closest(PASSTHROUGH))) {
        swallowNextClick();
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, open, onDismiss]);
}
