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
        <ConnectionManager />
      </Modal>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
