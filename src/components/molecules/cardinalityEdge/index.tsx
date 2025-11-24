import { useMemo } from "react";
import {
  BaseEdge,
  Edge,
  EdgeProps,
  getStraightPath,
  useStore,
} from "@xyflow/react";
import { Cardinality } from "../../../types/api/table";
import { getEdgeParams } from "./edgeParams";
import {
  buildSymbols as buildSymbolSpec,
  cardinalityToSymbolPartKinds,
} from "./symbol";
import { CardinalityEdgeData } from "./types";

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
    "#111";

  const parentCardinality = data?.parentCardinality ?? Cardinality.One;
  const childCardinality = data?.childCardinality ?? Cardinality.One;

  const sourceSymbols = buildSymbolSpec(
    sx,
    sy,
    dirX,
    dirY,
    cardinalityToSymbolPartKinds(parentCardinality),
    "source",
    length,
    strokeColor,
  );

  const targetSymbols = buildSymbolSpec(
    tx,
    ty,
    -dirX,
    -dirY,
    cardinalityToSymbolPartKinds(childCardinality),
    "target",
    length,
    strokeColor,
  );

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
