/**
 * Sidebar Component
 * Displays database and collection explorer
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Database,
  Table,
  RefreshCw,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DatabaseNode {
  name: string;
  collections: string[];
  isExpanded: boolean;
  isLoading: boolean;
}

export const Sidebar: React.FC = () => {
  const {
    connections,
    activeConnectionId,
    sidebarCollapsed,
    toggleSidebar,
    addTab,
    setActiveConnection,
  } = useStore();

  const [databases, setDatabases] = useState<DatabaseNode[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeConnection = connections.find((c) => c.id === activeConnectionId);

  const loadDatabases = useCallback(async () => {
    if (!activeConnection) return;

    setIsRefreshing(true);

    try {
      const response = await fetch('/api/mongodb/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: activeConnection.uri }),
      });

      const result = await response.json();

      if (result.success) {
        const dbNodes: DatabaseNode[] = result.data.databases.map((db: any) => ({
          name: db.name,
          collections: [],
          isExpanded: false,
          isLoading: false,
        }));
        setDatabases(dbNodes);
      }
    } catch (error) {
      console.error('Error loading databases:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeConnection]);

  // Load databases when connection changes
  useEffect(() => {
    if (activeConnection && activeConnection.status === 'connected') {
      loadDatabases();
    } else {
      setDatabases([]);
    }
  }, [activeConnection, loadDatabases]);

  const loadCollections = async (databaseName: string) => {
    if (!activeConnection) return;

    setDatabases((prev) =>
      prev.map((db) => (db.name === databaseName ? { ...db, isLoading: true } : db))
    );

    try {
      const response = await fetch('/api/mongodb/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uri: activeConnection.uri,
          database: databaseName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDatabases((prev) =>
          prev.map((db) =>
            db.name === databaseName
              ? {
                  ...db,
                  collections: result.data.collections.map((c: any) => c.name),
                  isLoading: false,
                }
              : db
          )
        );
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      setDatabases((prev) =>
        prev.map((db) => (db.name === databaseName ? { ...db, isLoading: false } : db))
      );
    }
  };

  const toggleDatabase = (databaseName: string) => {
    const db = databases.find((d) => d.name === databaseName);
    if (!db) return;

    if (!db.isExpanded && db.collections.length === 0) {
      loadCollections(databaseName);
    }

    setDatabases((prev) =>
      prev.map((d) => (d.name === databaseName ? { ...d, isExpanded: !d.isExpanded } : d))
    );
  };

  const openCollection = (database: string, collection: string) => {
    if (!activeConnectionId) return;

    addTab({
      connectionId: activeConnectionId,
      database,
      collection,
      title: `${database}.${collection}`,
      view: 'documents',
    });
  };

  if (sidebarCollapsed) {
    return (
      <div className="w-12 border-r border-border bg-card p-2 flex flex-col items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 280 }}
      className="border-r border-border bg-card flex flex-col"
    >
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <h2 className="font-semibold">Explorer</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadDatabases}
            disabled={isRefreshing || !activeConnection}
            className="h-8 w-8"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {!activeConnection && (
          <div className="text-center py-8 px-4">
            <Database className="h-12 w-12 mx-auto mb-2 opacity-50 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No connection selected</p>
          </div>
        )}

        {activeConnection && activeConnection.status !== 'connected' && (
          <div className="text-center py-8 px-4">
            <Database className="h-12 w-12 mx-auto mb-2 opacity-50 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {activeConnection.status === 'connecting' ? 'Connecting...' : 'Not connected'}
            </p>
          </div>
        )}

        {activeConnection && activeConnection.status === 'connected' && (
          <div className="space-y-1">
            {databases.length === 0 && !isRefreshing && (
              <p className="text-sm text-muted-foreground text-center py-4">No databases found</p>
            )}

            {databases.map((db) => (
              <div key={db.name}>
                {/* Database Node */}
                <button
                  onClick={() => toggleDatabase(db.name)}
                  className="w-full flex items-center gap-1 px-2 py-1.5 rounded hover:bg-accent text-sm transition-colors"
                >
                  {db.isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <Database className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-left truncate">{db.name}</span>
                  {db.isLoading && <RefreshCw className="h-3 w-3 animate-spin flex-shrink-0" />}
                </button>

                {/* Collections */}
                <AnimatePresence>
                  {db.isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-6"
                    >
                      {db.collections.length === 0 && !db.isLoading && (
                        <p className="text-xs text-muted-foreground py-1 px-2">
                          No collections
                        </p>
                      )}
                      {db.collections.map((collection) => (
                        <button
                          key={collection}
                          onClick={() => openCollection(db.name, collection)}
                          className="w-full flex items-center gap-1 px-2 py-1.5 rounded hover:bg-accent text-sm transition-colors"
                        >
                          <Table className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="flex-1 text-left truncate text-sm">{collection}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
