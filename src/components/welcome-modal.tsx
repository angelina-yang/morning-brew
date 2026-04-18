"use client";

import { useState } from "react";
import { isValidEmail } from "@/lib/email-validation";

interface WelcomeModalProps {
  isOpen: boolean;
  onComplete: (name: string, email: string) => void;
}

export function WelcomeModal({ isOpen, onComplete }: WelcomeModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  if (!isOpen) return null;

  const emailOk = isValidEmail(email);
  const showEmailError = email.length > 0 && !emailOk;
  const isValid = name.trim().length > 0 && emailOk && agreedToTerms;

  const handleSubmit = () => {
    if (!isValid) return;

    // Log registration (non-blocking)
    fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), newsletter }),
    }).catch(() => {});

    onComplete(name.trim(), email.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "var(--bg-backdrop)" }}
      />
      <div
        className="relative rounded-2xl w-full max-w-md mx-4 p-6"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-secondary)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "var(--accent-surface)" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Welcome to Daily Brew
          </h1>
          <p className="text-sm mt-1 text-center" style={{ color: "var(--text-muted)" }}>
            Your daily cup of news, handpicked by AI.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1"
              style={{
                background: "var(--bg-input)",
                border: `1px solid ${showEmailError ? "#ef4444" : "var(--border-primary)"}`,
                color: "var(--text-primary)",
              }}
            />
            {showEmailError && (
              <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                Please enter a valid email address.
              </p>
            )}
          </div>
        </div>

        {/* Newsletter opt-in */}
        <label className="flex items-start gap-2 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Subscribe to the{" "}
            <a
              href="https://angelinayang.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="transition-colors hover:underline"
              style={{ color: "var(--accent)" }}
            >
              TwoSetAI newsletter
            </a>
            {" "}— new free AI tools, founder insights, and early access to what I&apos;m building.
          </span>
        </label>

        {/* Terms agreement (required) */}
        <label className="flex items-start gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            I agree to the{" "}
            <a
              href="https://www.twosetai.com/lab/terms/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="transition-colors hover:underline"
              style={{ color: "var(--accent)" }}
            >
              TwoSetAI Lab Terms of Use
            </a>
            . This is a free, BYOK tool — I bring my own API keys and pay my own usage costs.
          </span>
        </label>

        {/* Privacy note */}
        <p className="text-xs mb-5 leading-relaxed" style={{ color: "var(--text-faint)" }}>
          Your API keys are stored safely in your browser. We never save, log, or share them with anyone.
        </p>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
