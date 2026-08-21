"use client";

import { useState } from "react";

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

type ServiceInspectorProps = {
  service: Service | null;
  services: Service[];
  connections: Connection[];
  onServiceUpdated: (service: Service) => void;
};

export function ServiceInspector({
  service,
  services,
  connections,
  onServiceUpdated,
}: ServiceInspectorProps) {
  const [environment, setEnvironment] = useState(
    service?.environment ?? "production",
  );

  const [provider, setProvider] = useState(
    service?.provider ?? "",
  );

  const [region, setRegion] = useState(
    service?.region ?? "",
  );

  const [description, setDescription] = useState(
    service?.description ?? "",
  );
  const [status, setStatus] = useState(
    service?.status ?? "HEALTHY",
  );
   const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);


  if (!service) {
    return (
      <aside className="flex h-full w-80 shrink-0 flex-col border-l border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-5 py-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Inspector
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-xs leading-5 text-zinc-600">
            Select a service on the canvas to inspect it.
          </p>
        </div>
      </aside>
    );
  }

  const serviceId = service.id;

  const outgoingConnections = connections.filter(
    (connection) => connection.sourceId === service.id,
  );

  const incomingConnections = connections.filter(
    (connection) => connection.targetId === service.id,
  );

  const getService = (serviceId: string) =>
    services.find((item) => item.id === serviceId);

  async function saveChanges() {
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      const response = await fetch(
        `${API_URL}/projects/${PROJECT_ID}/services/${serviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            environment,
            provider: provider.trim() || null,
            region: region.trim() || null,
            description: description.trim() || null,
            status,
          }),
        },
      );

      const data = (await response.json()) as {
        service?: Service;
        error?: string;
      };

      if (!response.ok || !data.service) {
        throw new Error(data.error ?? "Failed to save service");
      }

      onServiceUpdated(data.service);
      setSaved(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save service",
      );
    } finally {
      setSaving(false);
    }
  }

  const isHealthy = status === "HEALTHY";

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Service
        </div>

        <h2 className="mt-2 text-base font-semibold text-white">
          {service.name}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Type
          </div>

          <div className="mt-1 text-sm text-zinc-300">
            {service.type}
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="service-status"
            className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600"
          >
            Status
          </label>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isHealthy ? "bg-emerald-400" : "bg-red-400"
                }`}
            />

            <select
              id="service-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-zinc-600"
            >
              <option value="HEALTHY">HEALTHY</option>
              <option value="DEGRADED">DEGRADED</option>
              <option value="DOWN">DOWN</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="service-description"
            className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600"
          >
            Description
          </label>

          <textarea
            id="service-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs leading-5 text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-zinc-600"
            placeholder="Describe this service..."
          />
        </div>

        <div className="mt-8 border-t border-zinc-800 pt-6">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Deployment
          </div>

          <div className="mt-5">
            <label
              htmlFor="service-environment"
              className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600"
            >
              Environment
            </label>

            <select
              id="service-environment"
              value={environment}
              onChange={(event) => setEnvironment(event.target.value)}
              className="mt-2 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-zinc-600"
            >
              <option value="development">development</option>
              <option value="staging">staging</option>
              <option value="production">production</option>
            </select>
          </div>

          <div className="mt-5">
            <label
              htmlFor="service-provider"
              className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600"
            >
              Provider
            </label>

            <input
              id="service-provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              placeholder="AWS"
              className="mt-2 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-zinc-600"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="service-region"
              className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600"
            >
              Region
            </label>

            <input
              id="service-region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              placeholder="ap-south-1"
              className="mt-2 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-zinc-600"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={saveChanges}
          disabled={saving}
          className="mt-6 w-full rounded bg-white px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>

        {saved && (
          <p className="mt-3 text-center text-xs text-emerald-400">
            Changes saved
          </p>
        )}

        {saveError && (
          <p className="mt-3 text-center text-xs text-red-400">
            {saveError}
          </p>
        )}

        <div className="mt-8 border-t border-zinc-800 pt-6">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Connections
          </div>

          <div className="mt-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Outgoing
            </div>

            {outgoingConnections.length === 0 ? (
              <p className="mt-2 text-xs text-zinc-700">
                No outgoing connections
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {outgoingConnections.map((connection) => {
                  const target = getService(connection.targetId);

                  return (
                    <div
                      key={connection.id}
                      className="rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2"
                    >
                      <div className="text-xs font-medium text-zinc-300">
                        → {target?.name ?? "Unknown service"}
                      </div>

                      {connection.type && (
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">
                          {connection.type}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Incoming
            </div>

            {incomingConnections.length === 0 ? (
              <p className="mt-2 text-xs text-zinc-700">
                No incoming connections
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {incomingConnections.map((connection) => {
                  const source = getService(connection.sourceId);

                  return (
                    <div
                      key={connection.id}
                      className="rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2"
                    >
                      <div className="text-xs font-medium text-zinc-300">
                        ← {source?.name ?? "Unknown service"}
                      </div>

                      {connection.type && (
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">
                          {connection.type}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}