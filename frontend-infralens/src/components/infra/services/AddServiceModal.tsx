"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const PROJECT_ID = "cmszv8zyk0000g0usl412nl31";

const serviceTypes = [
  "API",
  "WORKER",
  "DATABASE",
  "CACHE",
  "LOAD_BALANCER",
  "QUEUE",
  "STORAGE",
  "EXTERNAL",
] as const;

type Service = {
  id: string;
  projectId: string;
  name: string;
  type: string;
  status: string;
  description: string | null;
  environment: string | null;
  provider: string | null;
  region: string | null;
  positionX: number;
  positionY: number;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
};

type AddServiceModalProps = {
  onCreated: (service: Service) => void;
  onClose: () => void;
};

export function AddServiceModal({
  onCreated,
  onClose,
}: AddServiceModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof serviceTypes)[number]>("API");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState("development");
  const [provider, setProvider] = useState("");
  const [region, setRegion] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Service name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/projects/${PROJECT_ID}/services`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            type,
            description: description.trim() || undefined,
            environment,
            provider: provider.trim() || undefined,
            region: region.trim() || undefined,
            positionX: 100,
            positionY: 100,
          }),
        },
      );

      const data = (await response.json()) as {
        service?: Service;
        error?: string;
      };

      if (!response.ok || !data.service) {
        throw new Error(data.error ?? "Failed to create service");
      }

      onCreated(data.service);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create service",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Add service
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Add a service to the infrastructure graph.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 transition-colors hover:text-white"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
          <div>
            <label
              htmlFor="service-name"
              className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600"
            >
              Name
            </label>

            <input
              id="service-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Redis Cache"
              className="mt-2 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="service-type"
              className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600"
            >
              Type
            </label>

            <select
              id="service-type"
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value as (typeof serviceTypes)[number],
                )
              }
              className="mt-2 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-zinc-600"
            >
              {serviceTypes.map((serviceType) => (
                <option key={serviceType} value={serviceType}>
                  {serviceType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="service-description"
              className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600"
            >
              Description
            </label>

            <textarea
              id="service-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={3}
              placeholder="What does this service do?"
              className="mt-2 w-full resize-none rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>

          <div>
            <label
              htmlFor="service-environment"
              className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600"
            >
              Environment
            </label>

            <select
              id="service-environment"
              value={environment}
              onChange={(event) =>
                setEnvironment(event.target.value)
              }
              className="mt-2 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-zinc-600"
            >
              <option value="development">development</option>
              <option value="staging">staging</option>
              <option value="production">production</option>
            </select>
          </div>

          <div>
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
              placeholder="e.g. AWS"
              className="mt-2 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>

          <div>
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
              placeholder="e.g. ap-south-1"
              className="mt-2 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>

          {error && (
            <div className="rounded border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded border border-zinc-800 px-4 py-2 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-white px-4 py-2 text-xs font-semibold text-zinc-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
