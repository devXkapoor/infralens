"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type NodeChange,
  type OnConnect,
  type OnNodeDrag,
  type NodeMouseHandler,
} from "@xyflow/react";

import { ServiceNode } from "./nodes/ServiceNode";

type InfrastructureCanvasProps = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onNodeClick: (nodeId: string) => void;
  onNodeDragStop: (
    nodeId: string,
    positionX: number,
    positionY: number,
  ) => void;
  onConnect: OnConnect;
  onAddService: () => void;
};

const nodeTypes = {
  service: ServiceNode,
};

export function InfrastructureCanvas({
  nodes,
  edges,
  onNodesChange,
  onNodeClick,
  onNodeDragStop,
  onConnect,
  onAddService,
}: InfrastructureCanvasProps) {
  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    onNodeClick(node.id);
  };

  const handleNodeDragStop: OnNodeDrag = (_event, node) => {
    onNodeDragStop(
      node.id,
      node.position.x,
      node.position.y,
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#08090c]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
        onConnect={onConnect}
        fitView={nodes.length > 0}
        fitViewOptions={{
          padding: 0.25,
          minZoom: 0.55,
          maxZoom: 1.25,
        }}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        colorMode="dark"
        minZoom={0.25}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#25272d"
        />

        <Controls
          position="bottom-left"
          showZoom
          showFitView
          showInteractive={false}
          className="infralens-flow-controls"
        />

        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor={(node) =>
            node.data?.status === "HEALTHY"
              ? "#34d399"
              : node.data?.status === "DEGRADED"
                ? "#f59e0b"
                : "#f87171"
          }
          nodeStrokeColor="#27272a"
          nodeStrokeWidth={2}
          maskColor="rgba(0, 0, 0, 0.45)"
          className="infralens-flow-minimap"
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950/95 p-7 text-center shadow-2xl shadow-black/30 backdrop-blur">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300">
              +
            </div>

            <h2 className="mt-4 text-sm font-semibold text-white">
              Your infrastructure is empty
            </h2>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Add your first service to start modeling the
              architecture and its dependencies.
            </p>

            <button
              type="button"
              onClick={onAddService}
              className="mt-5 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Add your first service
            </button>
          </div>
        </div>
      )}
    </div>
  );
}