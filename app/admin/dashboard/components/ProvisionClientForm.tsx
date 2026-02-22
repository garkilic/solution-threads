"use client";

import { useState } from "react";

interface ProvisionedClient {
  id: string;
  name: string;
  slug: string;
  accessCode: string;
  createdAt: string;
}

export default function ProvisionClientForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provisioned, setProvisioned] = useState<ProvisionedClient | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function deriveSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(deriveSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(deriveSlug(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProvisioned(null);

    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setProvisioned(data);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setLoading(false);
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const workflowUrl =
    provisioned
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/workflows/${provisioned.slug}`
      : "";

  return (
    <section>
      <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500">
        Provision New Client
      </h2>

      {provisioned ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-5">
          <div>
            <p className="text-sm font-medium text-emerald-400 mb-1">
              Client provisioned — save these credentials now
            </p>
            <p className="text-xs text-zinc-500">
              The access code is shown once and cannot be recovered. Share the URL and code with your client.
            </p>
          </div>

          <div className="space-y-3">
            <Credential
              label="Client URL"
              value={workflowUrl}
              onCopy={() => copy(workflowUrl, "url")}
              copied={copied === "url"}
            />
            <Credential
              label="Access Code"
              value={provisioned.accessCode}
              onCopy={() => copy(provisioned.accessCode, "code")}
              copied={copied === "code"}
              mono
            />
          </div>

          <button
            onClick={() => setProvisioned(null)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Provision another client
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Client Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ridgeline Capital"
                required
                disabled={loading}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">
                Slug{" "}
                <span className="text-zinc-700 font-normal normal-case tracking-normal">
                  (URL identifier)
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600 select-none">
                  /workflows/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="ridgeline-capital"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-24 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 disabled:opacity-50 font-mono"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-600">
              An access code will be auto-generated and shown once after provisioning.
            </p>
            <button
              type="submit"
              disabled={loading || !name || !slug}
              className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Provisioning..." : "Provision Client"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function Credential({
  label,
  value,
  onCopy,
  copied,
  mono = false,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
        <p className={`text-sm text-zinc-200 truncate ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="shrink-0 rounded-md border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
