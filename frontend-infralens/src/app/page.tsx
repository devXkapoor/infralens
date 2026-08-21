"use client";

import { useEffect, useState } from "react";
import {
  applyNodeChanges,
  MarkerType,
  type Edge,
  type Node,
  type NodeChange,
  type OnConnect,
} from "@xyflow/react";
import { InfrastructureCanvas } from "@/components/infra/InfrastructureCanvas";
import { ServiceInspector } from "@/components/infra/inspector/ServiceInspector";
import { AddServiceModal } from "@/components/infra/services/AddServiceModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const PROJECT_ID = "cmszv8zyk0000g0usl412nl31";

type Service = {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string | null;
  environment: string | null;
  provider: string | null;
  region: string | null;
  positionX: number;
  positionY: number;
};

type Connection = {
  id: string;
  sourceId: string;
  targetId: string;
  type: string | null;
};

type ServicesResponse = {
  services: Service[];
};

type ConnectionsResponse = {
  connections: Connection[];
};

export default function Home() {

  const [services, setServices] = useState<Service[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInfrastructure() {
      try {
        setLoading(true);
        setError(null);

        const [servicesResponse, connectionsResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/projects/${PROJECT_ID}/services`,
            ),
            fetch(
              `${API_URL}/projects/${PROJECT_ID}/connections`,
            ),
          ]);

        if (!servicesResponse.ok) {
          throw new Error("Failed to load services");
        }

        if (!connectionsResponse.ok) {
          throw new Error("Failed to load connections");
        }

        const servicesData =
          (await servicesResponse.json()) as ServicesResponse;

        setServices(servicesData.services);

        const connectionsData =
          (await connectionsResponse.json()) as ConnectionsResponse;

        setConnections(connectionsData.connections);

        const flowNodes: Node[] = servicesData.services.map(
          (service) => ({
            id: service.id,
            type: "service",
            position: {
              x: service.positionX,
              y: service.positionY,
            },
            data: {
              name: service.name,
              type: service.type,
              status: service.status,
              description: service.description,
            },
          }),
        );

        const flowEdges: Edge[] =
          connectionsData.connections.map((connection) => ({
            id: connection.id,
            source: connection.sourceId,
            target: connection.targetId,
            type: "smoothstep",
            label: connection.type ?? undefined,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            labelStyle: {
              fontSize: 10,
              fontWeight: 600,
            },
            labelBgStyle: {
              fill: "#09090b",
              fillOpacity: 0.95,
            },
            labelBgPadding: [6, 3],
            labelBgBorderRadius: 4,
          }));

        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    }

    loadInfrastructure();
  }, []);

  function handleServiceCreated(service: Service) {
    setServices((currentServices) => [
      ...currentServices,
      service,
    ]);

    const newNode: Node = {
      id: service.id,
      type: "service",
      position: {
        x: service.positionX,
        y: service.positionY,
      },
      data: {
        name: service.name,
        type: service.type,
        status: service.status,
        description: service.description,
      },
    };

    setNodes((currentNodes) => [
      ...currentNodes,
      newNode,
    ]);

    setSelectedServiceId(service.id);
    setShowAddServiceModal(false);
  }

  function handleNodesChange(changes: NodeChange[]) {
    setNodes((currentNodes) =>
      applyNodeChanges(changes, currentNodes),
    );
  }

  async function handleNodeDragStop(
    nodeId: string,
    positionX: number,
    positionY: number,
  ) {
    try {
      const response = await fetch(
        `${API_URL}/projects/${PROJECT_ID}/services/${nodeId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            positionX,
            positionY,
          }),
        },
      );

      const data = (await response.json()) as {
        service?: Service;
        error?: string;
      };

      if (!response.ok || !data.service) {
        throw new Error(
          data.error ?? "Failed to save service position",
        );
      }

      setServices((currentServices) =>
        currentServices.map((service) =>
          service.id === data.service!.id
            ? data.service!
            : service,
        ),
      );
    } catch (error) {
      console.error("Failed to save service position:", error);
    }
  }

  async function handleConnect(connection: Parameters<OnConnect>[0]) {
    if (!connection.source || !connection.target) {
      return;
    }

    if (connection.source === connection.target) {
      return;
    }

    const connectionAlreadyExists = connections.some(
      (existingConnection) =>
        existingConnection.sourceId === connection.source &&
        existingConnection.targetId === connection.target,
    );

    if (connectionAlreadyExists) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/projects/${PROJECT_ID}/connections`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceId: connection.source,
            targetId: connection.target,
          }),
        },
      );

      const data = (await response.json()) as {
        connection?: Connection;
        error?: string;
      };

      if (!response.ok || !data.connection) {
        throw new Error(
          data.error ?? "Failed to create connection",
        );
      }

      setConnections((currentConnections) => [
        ...currentConnections,
        data.connection!,
      ]);

      setEdges((currentEdges) => [
        ...currentEdges,
        {
          id: data.connection!.id,
          source: data.connection!.sourceId,
          target: data.connection!.targetId,
          type: "smoothstep",
          label: data.connection!.type ?? undefined,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          labelStyle: {
            fontSize: 10,
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: "#09090b",
            fillOpacity: 0.95,
          },
          labelBgPadding: [6, 3],
          labelBgBorderRadius: 4,
        },
      ]);
    } catch (error) {
      console.error("Failed to create connection:", error);
    }
  }

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-200">
        Loading infrastructure...
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex h-screen items-center justify-center bg-zinc-950 text-red-400">
        {error}
      </main>
    );
  }


  return (
    <main className="h-screen bg-zinc-950">
      <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-5">
        <div>
          <h1 className="text-sm font-semibold text-white">
            InfraLens
          </h1>

          <p className="text-xs text-zinc-500">
            E-commerce Platform
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddServiceModal(true)}
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
        >
          + Add Service
        </button>
      </header>

      <section className="flex h-[calc(100vh-3.5rem)]">
        <div className="min-w-0 flex-1">
          <InfrastructureCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onNodeClick={setSelectedServiceId}
            onNodeDragStop={handleNodeDragStop}
            OnConnect={handleConnect}
          />
        </div>

        <ServiceInspector
          key={selectedServiceId ?? "no-service"}
          service={
            services.find(
              (service) => service.id === selectedServiceId,
            ) ?? null
          }
          services={services}
          connections={connections}
          onServiceUpdated={(updatedService) => {
            setServices((currentServices) =>
              currentServices.map((service) =>
                service.id === updatedService.id
                  ? updatedService
                  : service,
              ),
            );
          }}
        />
      </section>
      {showAddServiceModal && (
        <AddServiceModal
          onCreated={handleServiceCreated}
          onClose={() => setShowAddServiceModal(false)}
        />
      )}
    </main>
  );
}