"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type NodeChange,
  type OnNodeDrag,
  type OnConnect,
  type NodeMouseHandler,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

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
  OnConnect: OnConnect,
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
  OnConnect
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
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
        onConnect = {OnConnect}
        fitView
        nodesDraggable
        nodesConnectable
        elementsSelectable
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}