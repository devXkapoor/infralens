"use client";

import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

type ServiceNodeData = {
  name: string;
  type: string;
  status: string;
  description: string | null;
};

export function ServiceNode({
  data,
}: NodeProps & { data: ServiceNodeData }) {
  const isHealthy = data.status === "HEALTHY";

  return (
    <div className="min-w-[220px] rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-zinc-400"
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {data.type}
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {data.name}
          </div>
        </div>

        <div
          className={`mt-1 h-2.5 w-2.5 rounded-full ${isHealthy ? "bg-emerald-400" : "bg-red-400"
            }`}
        />
      </div>

      {data.description && (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          {data.description}
        </p>
      )}

      <div className="mt-4 border-t border-zinc-800 pt-3">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${isHealthy ? "text-emerald-400" : "text-red-400"
            }`}
        >
          {data.status}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-zinc-400"
      />
    </div>
  );
}
