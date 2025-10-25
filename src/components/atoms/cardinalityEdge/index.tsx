import {
  BaseEdge,
  Edge,
  EdgeProps,
  getStraightPath,
  useStore,
} from "@xyflow/react";
import { useMemo } from "react";
import { Cardinality } from "../../../types/table";
import { getEdgeParams } from "./edgeParams";
import { CardinalityEdgeData } from "./types";
import {
  buildCardinalitySymbolSegments,
  type CardinalitySymbol,
} from "./symbolSegments";

const cardinalityToSymbols = (
  value?: CardinalityEdgeData["parentCardinality"]
): CardinalitySymbol[] => {
  switch (value) {
    case Cardinality.One:
      return ["line"];
    case Cardinality.ZeroOne:
      return ["circle", "line"];
    case Cardinality.OneN:
      return ["crowfoot", "line"];
    case Cardinality.ZeroN:
      return ["crowfoot", "circle"];
    default:
      return [];
  }
};

export function CardinalityEdge({
  id,
  source,
  target,
  data,
  markerEnd,
  style,
}: EdgeProps<Edge<CardinalityEdgeData>>) {
  const sourceNode = useStore((s) => s.nodeLookup.get(source));
  const targetNode = useStore((s) => s.nodeLookup.get(target));
  if (!sourceNode || !targetNode) {
    return null;
  }
  const { sx, sy, tx, ty } = useMemo(
    () => getEdgeParams(sourceNode, targetNode),
    [
      sourceNode.id,
      sourceNode.position.x,
      sourceNode.position.y,
      sourceNode.measured?.width,
      sourceNode.measured?.height,
      targetNode.id,
      targetNode.position.x,
      targetNode.position.y,
      targetNode.measured?.width,
      targetNode.measured?.height,
    ]
  );

  const [straightPath] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  });

  const dx = tx - sx;
  const dy = ty - sy;
  const length = Math.hypot(dx, dy);

  if (length <= 0.0001) {
    return (
      <BaseEdge id={id} path={straightPath} style={style} markerEnd={markerEnd} />
    );
  }

  const dirX = dx / length;
  const dirY = dy / length;

  const strokeColor =
    (style && typeof style.stroke === "string" ? style.stroke : undefined) ??
    "#111";

  const sourceSymbols = buildCardinalitySymbolSegments({
    nodeX: sx,
    nodeY: sy,
    dirX,
    dirY,
    symbols: cardinalityToSymbols(data?.parentCardinality),
    keyPrefix: "source",
    pathLength: length,
    strokeColor,
  });

  const targetSymbols = buildCardinalitySymbolSegments({
    nodeX: tx,
    nodeY: ty,
    dirX: -dirX,
    dirY: -dirY,
    symbols: cardinalityToSymbols(data?.childCardinality),
    keyPrefix: "target",
    pathLength: length,
    strokeColor,
  });

  const pathWithSymbols = `${straightPath}${sourceSymbols.path}${targetSymbols.path}`;
  const extraElements = [...sourceSymbols.elements, ...targetSymbols.elements];

  return (
    <>
      <BaseEdge
        id={id}
        path={pathWithSymbols}
        style={style}
        markerEnd={markerEnd}
      />
      {extraElements}
    </>
  );
}
