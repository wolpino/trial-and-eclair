import type { Sunlight } from "./useSunlight";

/** Window light over the wall and counter: sun by day, moon by night. */
export function KitchenLight({ sun }: { sun: Sunlight }) {
  return (
    <div
      className="kitchen-light"
      data-testid="kitchen-light"
      data-light={sun.phase}
      style={sun.style}
      aria-hidden="true"
    >
      <div className="kitchen-light__tint" />
      <div className="kitchen-light__glow" />
    </div>
  );
}
