"use client";

import { useState, useEffect, useCallback } from "react";
import { useApiKeys } from "@/hooks/use-api-keys";
import { useUser } from "@/hooks/use-user";
import { useTheme } from "@/hooks/use-theme";
import { useScouts } from "@/hooks/use-scouts";
import { useDigest, isDigestFresh } from "@/hooks/use-digest";
import { useDraftInstructions } from "@/hooks/use-draft-instructions";
import { Header } from "@/components/header";
import { WelcomeModal } from "@/components/welcome-modal";
import { SettingsModal } from "@/components/settings-modal";
import { EmptyState } from "@/components/empty-state";
import { ScoutManager } from "@/components/scout-manager";
import { DigestFeed } from "@/components/digest-feed";
import { DigestSkeleton } from "@/components/digest-skeleton";
import { ShareBar } from "@/components/share-bar";
import { DraftModal } from "@/components/draft-modal";
import { Footer } from "@/components/footer";
import type { DigestItem, Platform } from "@/types";

export default function Home() {
  const { keys, hasKeys, loaded, saveKeys } = useApiKeys();
  const { isRegistered, loaded: userLoaded, register } = useUser();
  const { isDark, toggleTheme, loaded: themeLoaded } = useTheme();
  const { instructions, setInstructions } = useDraftInstructions();

  const { scouts, loading: scoutsLoading, fetchScouts, createScout, togglePause, deleteScout, pauseAll, resumeAll } = useScouts(keys);
  const { digest, loading: digestLoading, generateDigest, toggleSelect, deselectAll, selectedItems } = useDigest(keys);

  const [showSettings, setShowSettings] = useState(false);
  const [draftModal, setDraftModal] = useState<{
    isOpen: boolean;
    platform: Platform;
    item: DigestItem | null;
  }>({ isOpen: false, platform: "tweet", item: null });

  // Guard: wait for localStorage to load
  if (!loaded || !userLoaded || !themeLoaded) return null;

  // Auto-fetch scouts on mount when keys are ready
  // Using a component that handles the effect
  return (
    <div className="flex flex-col min-h-screen">
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setShowSettings(true)}
        onRefresh={() => generateDigest(scouts)}
        isRefreshing={digestLoading}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Scout manager (always visible when keys are set) */}
        {hasKeys && (
          <ScoutManagerWithAutoFetch
            keys={keys}
            scouts={scouts}
            scoutsLoading={scoutsLoading}
            fetchScouts={fetchScouts}
            createScout={createScout}
            togglePause={togglePause}
            deleteScout={deleteScout}
            pauseAll={pauseAll}
            resumeAll={resumeAll}
            generateDigest={generateDigest}
            cachedDigest={digest}
          />
        )}

        {/* Digest area */}
        {!hasKeys ? (
          <EmptyState hasKeys={false} onOpenSettings={() => setShowSettings(true)} />
        ) : scouts.length === 0 && !scoutsLoading ? (
          <EmptyState hasKeys={true} onOpenSettings={() => setShowSettings(true)} />
        ) : digestLoading ? (
          <DigestSkeleton />
        ) : digest && digest.items.length > 0 ? (
          <DigestFeed
            items={digest.items}
            generatedAt={digest.generatedAt}
            onToggleSelect={toggleSelect}
            onDraft={(item, platform) => setDraftModal({ isOpen: true, platform, item })}
          />
        ) : digest && digest.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Your brew is still steeping. Check back later or add more topics.
            </p>
          </div>
        ) : null}
      </main>

      {/* Share bar */}
      <ShareBar selectedItems={selectedItems} onDeselectAll={deselectAll} />

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <WelcomeModal
        isOpen={!isRegistered}
        onComplete={(name, email) => {
          register(name, email);
          if (!hasKeys) setShowSettings(true);
        }}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        keys={keys}
        onSave={saveKeys}
      />

      <DraftModal
        isOpen={draftModal.isOpen}
        platform={draftModal.platform}
        onClose={() => setDraftModal({ isOpen: false, platform: "tweet", item: null })}
        summary={draftModal.item?.summary || ""}
        title={draftModal.item?.title || ""}
        sourceUrl={draftModal.item?.sourceUrl}
        claudeApiKey={keys.claudeApiKey}
        instructions={instructions[draftModal.platform]}
        onInstructionsChange={(val) => setInstructions({ [draftModal.platform]: val })}
      />
    </div>
  );
}

// Separate component to handle useEffect for auto-fetching
function ScoutManagerWithAutoFetch({
  keys,
  scouts,
  scoutsLoading,
  fetchScouts,
  createScout,
  togglePause,
  deleteScout,
  pauseAll,
  resumeAll,
  generateDigest,
  cachedDigest,
}: {
  keys: { yutoriApiKey: string; claudeApiKey: string };
  scouts: import("@/types").YutoriScout[];
  scoutsLoading: boolean;
  fetchScouts: () => Promise<void>;
  createScout: (query: string) => Promise<void>;
  togglePause: (id: string, status: string) => Promise<void>;
  deleteScout: (id: string) => Promise<void>;
  pauseAll: () => Promise<void>;
  resumeAll: () => Promise<void>;
  generateDigest: (scouts: import("@/types").YutoriScout[]) => Promise<void>;
  cachedDigest: import("@/types").Digest | null;
}) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && keys.yutoriApiKey) {
      setInitialized(true);
      fetchScouts();
    }
  }, [initialized, keys.yutoriApiKey, fetchScouts]);

  // Auto-generate digest after scouts are loaded — but only if cache is stale
  useEffect(() => {
    if (initialized && scouts.length > 0 && keys.claudeApiKey) {
      if (!isDigestFresh(cachedDigest)) {
        generateDigest(scouts);
      }
    }
    // Only run when scouts change after initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, scouts.length]);

  return (
    <ScoutManager
      scouts={scouts}
      onCreateScout={createScout}
      onTogglePause={togglePause}
      onDeleteScout={deleteScout}
      onPauseAll={pauseAll}
      onResumeAll={resumeAll}
      disabled={scoutsLoading}
    />
  );
}
