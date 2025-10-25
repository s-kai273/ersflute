import { createElement } from "react";
import type { ReactElement } from "react";

export type CardinalitySymbol = "line" | "circle" | "crowfoot";

const DEFAULT_OFFSET = 16;
const SYMBOL_SPACING = 6;
const LINE_LENGTH = 10;
const CROWFOOT_DEPTH = 10;
const CROWFOOT_SPREAD = 12;
const CIRCLE_RADIUS = 3;
const ADJACENT_SPACING = 2;

type BuildCardinalitySymbolSegmentsArgs = {
  nodeX: number;
  nodeY: number;
  dirX: number;
  dirY: number;
  symbols: CardinalitySymbol[];
  keyPrefix: string;
  pathLength: number;
  strokeColor: string;
};

export type CardinalitySymbolSegments = {
  path: string;
  elements: ReactElement[];
};

export function buildCardinalitySymbolSegments({
  nodeX,
  nodeY,
  dirX,
  dirY,
  symbols,
  keyPrefix,
  pathLength,
  strokeColor,
}: BuildCardinalitySymbolSegmentsArgs): CardinalitySymbolSegments {
  const result: CardinalitySymbolSegments = { path: "", elements: [] };

  if (!symbols.length) {
    return result;
  }

  const maxReach = Math.max(0, pathLength / 2 - 2);
  const totalSpan = symbols.reduce((acc, symbol, index) => {
    if (index === 0) {
      return acc;
    }
    const prev = symbols[index - 1];
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

  symbols.forEach((symbol, index) => {
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
          })
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

    if (index < symbols.length - 1) {
      const next = symbols[index + 1];
      const spacing = shouldUseAdjacentSpacing(symbol, next)
        ? ADJACENT_SPACING
        : SYMBOL_SPACING;
      offset += spacing;
    }
  });

  return result;
}

function shouldUseAdjacentSpacing(
  current: CardinalitySymbol,
  next: CardinalitySymbol
) {
  return (
    (current === "crowfoot" && (next === "line" || next === "circle")) ||
    ((current === "line" || current === "circle") && next === "crowfoot")
  );
}
