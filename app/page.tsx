/**
 * Main Dashboard Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { CollectionTabs } from '@/components/dashboard/CollectionTabs';
import { MainView } from '@/components/dashboard/MainView';
import { ConnectionManager } from '@/components/dashboard/ConnectionManager';
import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Github, Heart } from 'lucide-react';
import { creator_github, creator_name, source_code } from '@/config';

export default function DashboardPage() {
  const { hydrate, connections } = useStore();
  const [showConnectionManager, setShowConnectionManager] = useState(false);

  useEffect(() => {
    // Hydrate store from localStorage on mount
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Show connection manager if no connections
    if (connections.length === 0) {
      setShowConnectionManager(true);
    }
  }, [connections.length]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Collection Tabs */}
          <CollectionTabs />

          {/* Content */}
          <MainView />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          <span>by</span>
          <a
            href={creator_github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:text-foreground transition-colors"
          >
            {creator_name}
          </a>
          <span className="mx-1">•</span>
          <a
            href={source_code}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>
      </footer>

      {/* Connection Manager Modal */}
      <Modal
        isOpen={showConnectionManager}
        onClose={() => setShowConnectionManager(false)}
        title="Manage Connections"
        size="lg"
        footer={
          <Button onClick={() => setShowConnectionManager(false)}>
            Close
          </Button>
        }
      >
        <ConnectionManager onConnectionSelect={() => setShowConnectionManager(false)} />
      </Modal>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
