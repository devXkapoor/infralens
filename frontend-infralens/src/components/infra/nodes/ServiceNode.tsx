"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

type ServiceNodeData = {
  name: string;
  type: string;
  status: string;
  description: string | null;
};

const statusStyles: Record<
  string,
  {
    dot: string;
    text: string;
    border: string;
  }
> = {
  HEALTHY: {
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  DEGRADED: {
    dot: "bg-amber-400",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  DOWN: {
    dot: "bg-red-400",
    text: "text-red-400",
    border: "border-red-500/20",
  },
};

export function ServiceNode({
  data,
  selected,
}: NodeProps & {
  data: ServiceNodeData;
}) {
  const status = statusStyles[data.status] ?? statusStyles.DOWN;

  return (
    <div
      className={[
        "group relative w-[220px] rounded-xl border bg-[#111318]",
        "px-4 py-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.28)]",
        "transition-all duration-150",
        selected
          ? "border-indigo-400/70 ring-1 ring-indigo-400/20"
          : "border-zinc-800 hover:border-zinc-700",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-2 !border-[#111318] !bg-zinc-500 transition-colors group-hover:!bg-indigo-400"
      />

      <div className="flex items-start gap-3">
        <div
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${status.dot}`}
        />

        <div className="min-w-0 flex-1">
          <div className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
            {data.type}
          </div>

          <div className="mt-1 truncate text-sm font-semibold text-zinc-100">
            {data.name}
          </div>
        </div>

        <span
          className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider ${status.text}`}
        >
          {data.status}
        </span>
      </div>

      {data.description && (
        <p className="mt-3 line-clamp-2 pl-5 text-[11px] leading-4 text-zinc-500">
          {data.description}
        </p>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-2 !border-[#111318] !bg-zinc-500 transition-colors group-hover:!bg-indigo-400"
      />
    </div>
  );
}