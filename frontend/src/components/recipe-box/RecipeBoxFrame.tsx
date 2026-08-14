import type { ReactNode } from "react";

type RecipeBoxFrameProps = {
  lid: ReactNode;
  children: ReactNode;
};

export function RecipeBoxFrame({ lid, children }: RecipeBoxFrameProps) {
  return (
    <div className="recipe-box-open">
      <div className="recipe-box-open__label" aria-hidden="true">
        Recipe box
      </div>
      <div className="recipe-box-lid">
        <div className="recipe-box-lid__slot">{lid}</div>
      </div>
      <div className="recipe-box-well">
        <div className="recipe-box-well__perspective">
          <div className="recipe-box-well__floor">{children}</div>
        </div>
      </div>
    </div>
  );
}
