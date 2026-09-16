"use client"

import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getSmoothStepPath } from "reactflow"

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: selected ? 2.5 : 2,
          stroke: selected ? "#f5c84b" : "#94a3b8",
          filter: selected ? "drop-shadow(0 0 5px rgba(245,200,75,0.65))" : undefined,
          ...style,
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "none",
            }}
            className="rounded-full border-2 border-primary/40 bg-card/95 px-2 py-0.5 font-display text-[10px] uppercase tracking-wide text-primary shadow-[0_0_10px_hsl(var(--primary)/0.25)] backdrop-blur-sm"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
