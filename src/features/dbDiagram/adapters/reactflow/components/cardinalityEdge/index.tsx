import { useMemo } from "react";
import {
  BaseEdge,
  getStraightPath,
  useStore,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { Cardinality, type Relationship } from "@/types/domain/relationship";
import { getEdgeParams } from "./edgeParams";
import { buildSymbols, cardinalityToSymbolPartKinds } from "./symbol";

export function CardinalityEdge({
  id,
  source,
  target,
  data,
  markerEnd,
  style,
}: EdgeProps<Edge<Relationship>>) {
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
    ],
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
      <BaseEdge
        id={id}
        path={straightPath}
        style={style}
        markerEnd={markerEnd}
      />
    );
  }

  const dirX = dx / length;
  const dirY = dy / length;

  const strokeColor =
    (style && typeof style.stroke === "string" ? style.stroke : undefined) ??
    "var(--xy-edge-stroke, var(--xy-edge-stroke-default))";
  const strokeWidth =
    style && typeof style.strokeWidth === "number"
      ? style.strokeWidth
      : undefined;

  const parentCardinality = data?.parentCardinality ?? Cardinality.One;
  const childCardinality = data?.childCardinality ?? Cardinality.One;

  const sourceSymbols = buildSymbols(
    sx,
    sy,
    dirX,
    dirY,
    cardinalityToSymbolPartKinds(parentCardinality),
    "source",
    length,
    strokeColor,
    strokeWidth,
  );

  const targetSymbols = buildSymbols(
    tx,
    ty,
    -dirX,
    -dirY,
    cardinalityToSymbolPartKinds(childCardinality),
    "target",
    length,
    strokeColor,
    strokeWidth,
  );

  const symbols = [...sourceSymbols, ...targetSymbols];

  return (
    <>
      <BaseEdge
        id={id}
        path={straightPath}
        style={style}
        markerEnd={markerEnd}
      />
      {symbols}
    </>
  );
}
