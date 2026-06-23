import type { ReactNode } from "react";

type RecipeBoxFrameProps = {
  rail: ReactNode;
  children: ReactNode;
};

export function RecipeBoxFrame({ rail, children }: RecipeBoxFrameProps) {
  return (
    <div className="recipe-box-frame">
      {rail}
      <div className="recipe-box-frame__body">{children}</div>
    </div>
  );
}
