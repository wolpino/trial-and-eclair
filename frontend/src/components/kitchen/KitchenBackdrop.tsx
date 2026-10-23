import { KitchenClock } from "./KitchenClock";
import "../../styles/kitchen.css";

/**
 * The kitchen, faded, behind every focused view on wide screens (decision 004).
 * A drawing only: hidden from assistive tech and out of reach of clicks and Tab.
 */
export function KitchenBackdrop() {
  return (
    <div className="kitchen kitchen-backdrop" aria-hidden="true" inert>
      <div className="kitchen-wall" />
      <div className="kitchen-counter" />
      <div className="kitchen-shelf-area">
        <div className="kitchen-shelf__plank" />
      </div>
      <KitchenClock />
      <span className="kitchen-object kitchen-board">
        <span className="kitchen-board__cork" />
      </span>
      <span className="kitchen-object kitchen-notebook">
        <span className="kitchen-notebook__cover" />
      </span>
      <span className="kitchen-object kitchen-box">
        <span className="kitchen-box__drawing">
          <span className="kitchen-box__front" />
        </span>
      </span>
    </div>
  );
}
