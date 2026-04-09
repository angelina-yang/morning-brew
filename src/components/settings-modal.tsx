"use client";

import { useState } from "react";
import type { ApiKeys, OutputLanguage } from "@/types";
import { LANGUAGES } from "@/hooks/use-api-keys";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
}

export function SettingsModal({ isOpen, onClose, keys, onSave }: SettingsModalProps) {
  const [form, setForm] = useState<ApiKeys>(keys);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");

    try {
      const res = await fetch("/api/validate-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yutoriApiKey: form.yutoriApiKey,
          claudeApiKey: form.claudeApiKey,
        }),
      });

      const data = await res.json();

      if (!data.yutori || !data.claude) {
        const errors: string[] = [];
        if (!data.yutori) errors.push(`Yutori: ${data.errors?.yutori || "Invalid key"}`);
        if (!data.claude) errors.push(`Claude: ${data.errors?.claude || "Invalid key"}`);
        setSaveError(errors.join("\n"));
        setSaving(false);
        return;
      }

      onSave({ ...form, keysValidated: true });
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Validation failed");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "var(--bg-backdrop)" }}
        onClick={onClose}
      />
      <div
        className="relative rounded-2xl w-full max-w-md mx-4 p-6 max-h-[85vh] overflow-y-auto"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-secondary)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Yutori API Key */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Yutori API Key
          </label>
          <input
            type="password"
            value={form.yutoriApiKey}
            onChange={(e) => setForm({ ...form, yutoriApiKey: e.target.value, keysValidated: false })}
            placeholder="yt-..."
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          />
          <a
            href="https://platform.yutori.com/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mt-1 inline-block transition-colors"
            style={{ color: "var(--accent)" }}
          >
            Get your Yutori API key
          </a>
        </div>

        {/* Claude API Key */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Claude API Key (Anthropic)
          </label>
          <input
            type="password"
            value={form.claudeApiKey}
            onChange={(e) => setForm({ ...form, claudeApiKey: e.target.value, keysValidated: false })}
            placeholder="sk-ant-api03-..."
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          />
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mt-1 inline-block transition-colors"
            style={{ color: "var(--accent)" }}
          >
            Get your Claude API key
          </a>
        </div>

        {/* Language */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Digest Language
          </label>
          <select
            value={form.outputLanguage}
            onChange={(e) => setForm({ ...form, outputLanguage: e.target.value as OutputLanguage })}
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Privacy note */}
        <p className="text-xs mb-4" style={{ color: "var(--text-faint)" }}>
          Your API keys are stored safely in your browser. We never save, log,
          or share them with anyone.
        </p>

        {/* Error */}
        {saveError && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-500/10 text-red-400 whitespace-pre-wrap">
            {saveError}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !form.yutoriApiKey.trim() || !form.claudeApiKey.trim()}
          className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          {saving ? "Validating keys..." : "Save"}
        </button>
      </div>
    </div>
  );
}
