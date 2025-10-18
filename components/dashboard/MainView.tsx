/**
 * Main View Component
 * Displays the active tab content
 */

'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { DocumentTable } from './DocumentTable';
import { Database } from 'lucide-react';

export const MainView: React.FC = () => {
  const { tabs, activeTabId } = useStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center">
          <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No Collection Selected</h2>
          <p className="text-muted-foreground">
            Select a collection from the sidebar to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      {activeTab.view === 'documents' && (
        <DocumentTable
          connectionId={activeTab.connectionId}
          database={activeTab.database}
          collection={activeTab.collection}
        />
      )}
      {/* Other views can be added here (query, aggregation, stats) */}
    </div>
  );
};
