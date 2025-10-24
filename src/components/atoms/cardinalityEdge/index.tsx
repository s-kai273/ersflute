import {
  BaseEdge,
  Edge,
  EdgeProps,
  getStraightPath,
  useStore,
} from "@xyflow/react";
import { getEdgeParams } from "./edgeParams";
import { useMemo } from "react";
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
  const tickLength = 10;
  const tickGap = 12;

  let pathWithTicks = straightPath;

  if (length > 0.0001) {
    const dirX = dx / length;
    const dirY = dy / length;
    const perpX = -dirY;
    const perpY = dirX;
    const halfTick = tickLength / 2;
    const offset = Math.min(tickGap, length / 3);

    const nearTargetX = tx - dirX * offset;
    const nearTargetY = ty - dirY * offset;
    const targetTickStartX = nearTargetX + perpX * halfTick;
    const targetTickStartY = nearTargetY + perpY * halfTick;
    const targetTickEndX = nearTargetX - perpX * halfTick;
    const targetTickEndY = nearTargetY - perpY * halfTick;
    pathWithTicks += ` M ${targetTickStartX} ${targetTickStartY} L ${targetTickEndX} ${targetTickEndY}`;

    const nearSourceX = sx + dirX * offset;
    const nearSourceY = sy + dirY * offset;
    const sourceTickStartX = nearSourceX + perpX * halfTick;
    const sourceTickStartY = nearSourceY + perpY * halfTick;
    const sourceTickEndX = nearSourceX - perpX * halfTick;
    const sourceTickEndY = nearSourceY - perpY * halfTick;
    pathWithTicks += ` M ${sourceTickStartX} ${sourceTickStartY} L ${sourceTickEndX} ${sourceTickEndY}`;
  }

  return (
    <BaseEdge
      id={id}
      path={pathWithTicks}
      style={style}
      markerEnd={markerEnd}
    />
  );
}
