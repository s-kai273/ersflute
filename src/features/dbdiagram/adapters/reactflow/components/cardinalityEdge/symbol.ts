import { createElement } from "react";
import type { ReactElement } from "react";
import { Cardinality } from "@/types/api/table";

const DEFAULT_OFFSET = 16;
const SYMBOL_SPACING = 6;
const LINE_LENGTH = 10;
const CROWFOOT_DEPTH = 10;
const CROWFOOT_SPREAD = 12;
const CIRCLE_RADIUS = 3;
const ADJACENT_SPACING = 2;

type SymbolPartKind = "line" | "circle" | "crowfoot";

type SymbolSpec = {
  path: string;
  elements: ReactElement[];
};

export const cardinalityToSymbolPartKinds = (
  value: Cardinality,
): SymbolPartKind[] => {
  switch (value) {
    case Cardinality.One:
      return ["line"];
    case Cardinality.ZeroOne:
      return ["circle", "line"];
    case Cardinality.OneN:
      return ["crowfoot", "line"];
    case Cardinality.ZeroN:
      return ["crowfoot", "circle"];
  }
};

export function buildSymbols(
  nodeX: number,
  nodeY: number,
  dirX: number,
  dirY: number,
  symbolPartKinds: SymbolPartKind[],
  keyPrefix: string,
  pathLength: number,
  strokeColor: string,
): SymbolSpec {
  const result: SymbolSpec = { path: "", elements: [] };

  if (!symbolPartKinds.length) {
    return result;
  }

  const maxReach = Math.max(0, pathLength / 2 - 2);
  const totalSpan = symbolPartKinds.reduce((acc, symbol, index) => {
    if (index === 0) {
      return acc;
    }
    const prev = symbolPartKinds[index - 1];
    const spacing = shouldUseAdjacentSpacing(prev, symbol)
      ? ADJACENT_SPACING
      : SYMBOL_SPACING;
    return acc + spacing;
  }, 0);
  const startOffset = Math.min(DEFAULT_OFFSET, maxReach - totalSpan);

  if (!Number.isFinite(startOffset) || startOffset <= 0) {
    return result;
  }

  const perpX = -dirY;
  const perpY = dirX;

  let offset = startOffset;

  symbolPartKinds.forEach((symbol, index) => {
    const clampedOffset = Math.min(offset, maxReach);
    const centerX = nodeX + dirX * clampedOffset;
    const centerY = nodeY + dirY * clampedOffset;

    switch (symbol) {
      case "line": {
        const halfLine = LINE_LENGTH / 2;
        const startX = centerX + perpX * halfLine;
        const startY = centerY + perpY * halfLine;
        const endX = centerX - perpX * halfLine;
        const endY = centerY - perpY * halfLine;
        result.path += ` M ${startX} ${startY} L ${endX} ${endY}`;
        break;
      }
      case "circle": {
        result.elements.push(
          createElement("circle", {
            key: `${keyPrefix}-circle-${index}`,
            cx: centerX,
            cy: centerY,
            r: CIRCLE_RADIUS,
            fill: strokeColor,
          }),
        );
        break;
      }
      case "crowfoot": {
        const tipX = centerX;
        const tipY = centerY;
        const baseX = tipX - dirX * CROWFOOT_DEPTH;
        const baseY = tipY - dirY * CROWFOOT_DEPTH;
        const halfSpread = CROWFOOT_SPREAD / 2;
        const leftX = baseX + perpX * halfSpread;
        const leftY = baseY + perpY * halfSpread;
        const rightX = baseX - perpX * halfSpread;
        const rightY = baseY - perpY * halfSpread;
        result.path += ` M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY}`;
        break;
      }
    }

    if (index < symbolPartKinds.length - 1) {
      const next = symbolPartKinds[index + 1];
      const spacing = shouldUseAdjacentSpacing(symbol, next)
        ? ADJACENT_SPACING
        : SYMBOL_SPACING;
      offset += spacing;
    }
  });

  return result;
}

function shouldUseAdjacentSpacing(
  current: SymbolPartKind,
  next: SymbolPartKind,
) {
  return (
    (current === "crowfoot" && (next === "line" || next === "circle")) ||
    ((current === "line" || current === "circle") && next === "crowfoot")
  );
}
