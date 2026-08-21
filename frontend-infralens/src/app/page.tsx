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
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
} from "lucide-react";

import { InfrastructureCanvas } from "@/components/infra/InfrastructureCanvas";
import { ServiceInspector } from "@/components/infra/inspector/ServiceInspector";
import { AddServiceModal } from "@/components/infra/services/AddServiceModal";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const DEFAULT_PROJECT_NAME = "E-commerce Platform";

type Project = {
  id: string;
  name: string;
  description: string | null;
};

type Service = {
  id: string;
  projectId?: string;
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

type ProjectsResponse = {
  projects: Project[];
};

type ServicesResponse = {
  services: Service[];
};

type ConnectionsResponse = {
  connections: Connection[];
};

function createFlowNode(service: Service): Node {
  return {
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
}

function createFlowEdge(connection: Connection): Edge {
  return {
    id: connection.id,
    source: connection.sourceId,
    target: connection.targetId,
    type: "smoothstep",
    label: connection.type ?? undefined,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      stroke: "#71717a",
      strokeWidth: 1.5,
    },
    labelStyle: {
      fontSize: 10,
      fontWeight: 600,
      fill: "#a1a1aa",
    },
    labelBgStyle: {
      fill: "#111318",
      fillOpacity: 0.96,
    },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 4,
  };
}

export default function Home() {
  const [project, setProject] = useState<Project | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedServiceId, setSelectedServiceId] =
    useState<string | null>(null);

  const [showAddServiceModal, setShowAddServiceModal] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(
    null,
  );

  async function loadInfrastructure() {
    try {
      setLoading(true);
      setError(null);

      const projectsResponse = await fetch(
        `${API_URL}/projects`,
      );

      if (!projectsResponse.ok) {
        throw new Error("Unable to reach the InfraLens API.");
      }

      const projectsData =
        (await projectsResponse.json()) as ProjectsResponse;

      let activeProject = projectsData.projects.find(
        (item) => item.name === DEFAULT_PROJECT_NAME,
      );

      if (!activeProject) {
        const createResponse = await fetch(
          `${API_URL}/projects`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: DEFAULT_PROJECT_NAME,
              description:
                "Infrastructure model for the InfraLens demo.",
            }),
          },
        );

        const createData = (await createResponse.json()) as {
          project?: Project;
          error?: string;
        };

        if (!createResponse.ok || !createData.project) {
          throw new Error(
            createData.error ??
              "Unable to create the default project.",
          );
        }

        activeProject = createData.project;
      }

      setProject(activeProject);

      const [servicesResponse, connectionsResponse] =
        await Promise.all([
          fetch(
            `${API_URL}/projects/${activeProject.id}/services`,
          ),
          fetch(
            `${API_URL}/projects/${activeProject.id}/connections`,
          ),
        ]);

      if (!servicesResponse.ok) {
        throw new Error("Unable to load services.");
      }

      if (!connectionsResponse.ok) {
        throw new Error("Unable to load connections.");
      }

      const servicesData =
        (await servicesResponse.json()) as ServicesResponse;

      const connectionsData =
        (await connectionsResponse.json()) as ConnectionsResponse;

      setServices(servicesData.services);
      setConnections(connectionsData.connections);
      setNodes(servicesData.services.map(createFlowNode));
      setEdges(connectionsData.connections.map(createFlowEdge));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading InfraLens.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInfrastructure();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function handleServiceCreated(service: Service) {
    setServices((current) => [...current, service]);

    setNodes((current) => [
      ...current,
      createFlowNode(service),
    ]);

    setSelectedServiceId(service.id);
    setShowAddServiceModal(false);
    setActionError(null);
  }

  function handleNodesChange(changes: NodeChange[]) {
    setNodes((current) =>
      applyNodeChanges(changes, current),
    );
  }

  async function handleNodeDragStop(
    nodeId: string,
    positionX: number,
    positionY: number,
  ) {
    if (!project) return;

    try {
      const response = await fetch(
        `${API_URL}/projects/${project.id}/services/${nodeId}`,
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
          data.error ?? "Failed to save service position.",
        );
      }

      setServices((current) =>
        current.map((service) =>
          service.id === data.service!.id
            ? data.service!
            : service,
        ),
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to save service position.",
      );
    }
  }

  async function handleConnect(
    connection: Parameters<OnConnect>[0],
  ) {
    if (!project || !connection.source || !connection.target) {
      return;
    }

    if (connection.source === connection.target) {
      setActionError("A service cannot connect to itself.");
      return;
    }

    const connectionAlreadyExists = connections.some(
      (existing) =>
        existing.sourceId === connection.source &&
        existing.targetId === connection.target,
    );

    if (connectionAlreadyExists) {
      setActionError("That connection already exists.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/projects/${project.id}/connections`,
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
          data.error ?? "Failed to create connection.",
        );
      }

      setConnections((current) => [
        ...current,
        data.connection!,
      ]);

      setEdges((current) => [
        ...current,
        createFlowEdge(data.connection!),
      ]);

      setActionError(null);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to create connection.",
      );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090c] text-zinc-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-indigo-400" />

          <p className="text-xs text-zinc-500">
            Loading infrastructure...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090c] px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-900/40 bg-zinc-950 p-7 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertCircle size={18} />
          </div>

          <h1 className="mt-4 text-sm font-semibold text-white">
            InfraLens couldn&apos;t load
          </h1>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            {error}
          </p>

          <button
            type="button"
            onClick={loadInfrastructure}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      </main>
    );
  }

  const selectedService =
    services.find(
      (service) => service.id === selectedServiceId,
    ) ?? null;

  const nextServicePosition = {
    x: 80 + (services.length % 3) * 280,
    y: 80 + Math.floor(services.length / 3) * 190,
  };

  return (
    <main className="h-screen overflow-hidden bg-[#08090c] text-zinc-100">
      <header className="flex h-16 items-center justify-between border-b border-zinc-800/80 bg-[#0b0c10] px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
            <Activity size={15} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white">
                InfraLens
              </h1>

              <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-500">
                Infrastructure
              </span>
            </div>

            <p className="truncate text-xs text-zinc-500">
              {project?.name ?? DEFAULT_PROJECT_NAME}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-2.5 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <span className="text-[10px] font-medium text-emerald-400">
              Connected
            </span>
          </div>

          <div className="hidden text-right sm:block">
            <div className="text-[9px] uppercase tracking-wider text-zinc-600">
              Services
            </div>

            <div className="text-xs font-medium text-zinc-300">
              {services.length}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActionError(null);
              setShowAddServiceModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white"
          >
            <Plus size={14} />
            Add service
          </button>
        </div>
      </header>

      <section className="flex h-[calc(100vh-4rem)] min-h-0">
        <div className="relative min-w-0 flex-1">
          <InfrastructureCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onNodeClick={setSelectedServiceId}
            onNodeDragStop={handleNodeDragStop}
            onConnect={handleConnect}
            onAddService={() => {
              setActionError(null);
              setShowAddServiceModal(true);
            }}
          />

          {actionError && (
            <div className="absolute right-5 top-5 z-20 flex max-w-sm items-start gap-2 rounded-lg border border-red-900/50 bg-zinc-950/95 px-3 py-2.5 shadow-xl backdrop-blur">
              <AlertCircle
                size={14}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <p className="text-xs leading-5 text-red-300">
                {actionError}
              </p>

              <button
                type="button"
                onClick={() => setActionError(null)}
                className="ml-2 text-zinc-600 hover:text-zinc-300"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {services.length > 0 && !selectedService && (
            <div className="pointer-events-none absolute left-5 top-5 z-10 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 backdrop-blur">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={13}
                  className="text-emerald-400"
                />

                <span className="text-xs text-zinc-400">
                  Select a service to inspect its configuration
                </span>
              </div>
            </div>
          )}
        </div>

        <ServiceInspector
          key={selectedServiceId ?? "no-service"}
          projectId={project?.id ?? ""}
          service={selectedService}
          services={services}
          connections={connections}
          onServiceUpdated={(updatedService) => {
            setServices((current) =>
              current.map((service) =>
                service.id === updatedService.id
                  ? updatedService
                  : service,
              ),
            );

            setNodes((current) =>
              current.map((node) =>
                node.id === updatedService.id
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        name: updatedService.name,
                        type: updatedService.type,
                        status: updatedService.status,
                        description:
                          updatedService.description,
                      },
                    }
                  : node,
              ),
            );

            setActionError(null);
          }}
        />
      </section>

      {showAddServiceModal && project && (
        <AddServiceModal
          projectId={project.id}
          initialPosition={nextServicePosition}
          onCreated={handleServiceCreated}
          onClose={() => setShowAddServiceModal(false)}
        />
      )}
    </main>
  );
}