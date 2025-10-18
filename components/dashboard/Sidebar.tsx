/**
 * Sidebar Component
 * Displays database and collection explorer
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Database,
  Table,
  RefreshCw,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { startProgress, stopProgress } from '@/components/ProgressBar';

interface DatabaseNode {
  name: string;
  collections: CollectionNode[];
  isExpanded: boolean;
  isLoading: boolean;
  sizeOnDisk?: number;
}

interface CollectionNode {
  name: string;
  count?: number;
  size?: number;
}

// Helper function to format large numbers (1000 -> 1K, 1000000 -> 1M)
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toLocaleString();
};

// Helper function to format bytes to human-readable size
const formatSize = (bytes: number): string => {
  const kb = bytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;

  if (gb >= 1) {
    return `${gb.toFixed(1)} GB`;
  } else if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  } else {
    return `${kb.toFixed(1)} KB`;
  }
};

export const Sidebar: React.FC = () => {
  const {
    connections,
    activeConnectionId,
    sidebarCollapsed,
    toggleSidebar,
    addTab,
    setActiveConnection,
    tabs,
    activeTabId,
  } = useStore();

  const [databases, setDatabases] = useState<DatabaseNode[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateDbModal, setShowCreateDbModal] = useState(false);
  const [showCreateCollModal, setShowCreateCollModal] = useState(false);
  const [newDbName, setNewDbName] = useState('');
  const [newCollName, setNewCollName] = useState('');
  const [initialCollName, setInitialCollName] = useState(''); // For new database
  const [selectedDb, setSelectedDb] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'database' | 'collection';
    name: string;
    dbName?: string;
  }>({ isOpen: false, type: 'database', name: '' });

  // Track previous activeTabId to detect tab changes
  const prevActiveTabIdRef = useRef<string | null>(null);

  const activeConnection = connections.find((c) => c.id === activeConnectionId);

  const loadDatabases = useCallback(async () => {
    if (!activeConnection) return;

    setIsRefreshing(true);
    startProgress();

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
          sizeOnDisk: db.sizeOnDisk,
        }));
        setDatabases(dbNodes);
      }
    } catch (error) {
      console.error('Error loading databases:', error);
    } finally {
      setIsRefreshing(false);
      stopProgress();
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

  // Auto-expand database when active tab changes
  useEffect(() => {
    if (!activeTabId) return;

    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab || activeTab.connectionId !== activeConnectionId || databases.length === 0) {
      return;
    }

    const db = databases.find((d) => d.name === activeTab.database);
    if (!db) return;

    // If database is not expanded, expand it
    if (!db.isExpanded) {
      if (db.collections.length === 0 && !db.isLoading) {
        // Load collections and expand
        loadCollections(activeTab.database);
      } else if (db.collections.length > 0) {
        // Collections already loaded, just expand
        setDatabases((prev) =>
          prev.map((d) => (d.name === activeTab.database ? { ...d, isExpanded: true } : d))
        );
      }
    }
  }, [activeTabId, databases, activeConnectionId, tabs]);

  const loadCollections = async (databaseName: string) => {
    if (!activeConnection) return;

    setDatabases((prev) =>
      prev.map((db) => (db.name === databaseName ? { ...db, isLoading: true } : db))
    );
    startProgress();

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
        // Fetch stats for each collection
        const collectionsWithStats = await Promise.all(
          result.data.collections.map(async (c: any) => {
            try {
              const statsResponse = await fetch('/api/mongodb/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  uri: activeConnection.uri,
                  database: databaseName,
                  collection: c.name,
                }),
              });
              const statsResult = await statsResponse.json();
              return {
                name: c.name,
                count: statsResult.data?.stats?.count || 0,
                size: statsResult.data?.stats?.size || 0,
              };
            } catch {
              return { name: c.name, count: 0, size: 0 };
            }
          })
        );

        setDatabases((prev) =>
          prev.map((db) =>
            db.name === databaseName
              ? {
                  ...db,
                  collections: collectionsWithStats,
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
    } finally {
      stopProgress();
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

  const handleCreateDatabase = async () => {
    if (!activeConnection || !newDbName.trim() || !initialCollName.trim()) return;

    try {
      // Create collection which will create the database
      const response = await fetch('/api/mongodb/manage-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uri: activeConnection.uri,
          database: newDbName.trim(),
          collection: initialCollName.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateDbModal(false);
        setNewDbName('');
        setInitialCollName('');
        loadDatabases(); // Refresh list
      } else {
        alert('Failed to create database: ' + result.error);
      }
    } catch (error) {
      alert('Error creating database');
    }
  };

  const handleCreateCollection = async () => {
    if (!activeConnection || !selectedDb || !newCollName.trim()) return;

    try {
      const response = await fetch('/api/mongodb/manage-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uri: activeConnection.uri,
          database: selectedDb,
          collection: newCollName.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateCollModal(false);
        setNewCollName('');
        setSelectedDb('');
        loadDatabases(); // Refresh list
      } else {
        alert('Failed to create collection: ' + result.error);
      }
    } catch (error) {
      alert('Error creating collection');
    }
  };

  const handleDelete = async () => {
    if (!activeConnection || !deleteDialog.name) return;

    try {
      if (deleteDialog.type === 'database') {
        const response = await fetch('/api/mongodb/manage-database', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uri: activeConnection.uri,
            database: deleteDialog.name,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setDeleteDialog({ isOpen: false, type: 'database', name: '' });
          loadDatabases(); // Refresh list
        } else {
          alert('Failed to delete database: ' + result.error);
        }
      } else {
        // Collection delete
        const response = await fetch('/api/mongodb/manage-collection', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uri: activeConnection.uri,
            database: deleteDialog.dbName,
            collection: deleteDialog.name,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setDeleteDialog({ isOpen: false, type: 'collection', name: '' });
          loadDatabases(); // Refresh list
        } else {
          alert('Failed to delete collection: ' + result.error);
        }
      }
    } catch (error) {
      alert('Error deleting');
    }
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
            onClick={() => setShowCreateDbModal(true)}
            disabled={!activeConnection}
            className="h-8 w-8"
            title="Create Database"
          >
            <Plus className="h-4 w-4" />
          </Button>
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

            {databases.map((db) => {
              // Check if this database contains the active collection
              const activeTab = tabs.find((t) => t.id === activeTabId);
              const isActiveDatabase = activeTab && activeTab.database === db.name && activeTab.connectionId === activeConnectionId;

              return (
              <div key={db.name} className="group">
                {/* Database Node */}
                <div className="w-full flex flex-col gap-0.5 px-2 py-1.5 rounded hover:bg-accent text-sm transition-colors">
                  <div className="flex items-center gap-1 w-full">
                    <button onClick={() => toggleDatabase(db.name)} className="flex items-center gap-1 flex-1 min-w-0">
                      {!isActiveDatabase && (
                        db.isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )
                      )}
                      <Database className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 text-left truncate">{db.name}</span>
                    </button>
                    {db.isLoading && <RefreshCw className="h-3 w-3 animate-spin flex-shrink-0" />}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDb(db.name);
                          setShowCreateCollModal(true);
                        }}
                        className="p-1 hover:bg-accent-foreground/10 rounded"
                        title="Add Collection"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({ isOpen: true, type: 'database', name: db.name });
                        }}
                        className="p-1 hover:bg-destructive/20 rounded"
                        title="Delete Database"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  </div>
                  {db.sizeOnDisk && (
                    <div className="text-xs text-muted-foreground pl-9">
                      {formatSize(db.sizeOnDisk)}
                    </div>
                  )}
                </div>

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
                      {db.collections.map((collection) => {
                        // Check if this collection is the active one
                        const activeTab = tabs.find((t) => t.id === activeTabId);
                        const isActive = activeTab &&
                                        activeTab.connectionId === activeConnectionId &&
                                        activeTab.database === db.name &&
                                        activeTab.collection === collection.name;

                        return (
                        <div key={collection.name} className={cn(
                          "group/coll w-full flex flex-col gap-0.5 px-2 py-1.5 rounded text-sm transition-colors",
                          isActive ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-accent"
                        )}>
                          <div className="flex items-center gap-1 w-full">
                            <button
                              onClick={() => openCollection(db.name, collection.name)}
                              className="flex items-center gap-1 flex-1 min-w-0"
                            >
                              <Table className={cn(
                                "h-3.5 w-3.5 flex-shrink-0",
                                isActive ? "text-primary" : "text-muted-foreground"
                              )} />
                              <span className={cn(
                                "flex-1 text-left truncate text-sm",
                                isActive && "font-medium text-primary"
                              )}>{collection.name}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialog({ isOpen: true, type: 'collection', name: collection.name, dbName: db.name });
                              }}
                              className="p-1 hover:bg-destructive/20 rounded opacity-0 group-hover/coll:opacity-100 transition-opacity"
                              title="Delete Collection"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </button>
                          </div>
                          {(collection.count !== undefined || collection.size !== undefined) && (
                            <div className="text-xs text-muted-foreground pl-5">
                              {collection.count !== undefined && `${formatCount(collection.count)} docs`}
                              {collection.count !== undefined && collection.size !== undefined && ' • '}
                              {collection.size !== undefined && formatSize(collection.size)}
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Database Modal */}
      <Modal
        isOpen={showCreateDbModal}
        onClose={() => {
          setShowCreateDbModal(false);
          setNewDbName('');
          setInitialCollName('');
        }}
        title="Create Database"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateDbModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDatabase} disabled={!newDbName.trim() || !initialCollName.trim()}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">MongoDB requires at least one collection to create a database.</p>
          <div>
            <label className="block text-sm font-medium mb-2">Database Name</label>
            <Input
              type="text"
              placeholder="my_database"
              value={newDbName}
              onChange={(e) => setNewDbName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Initial Collection Name</label>
            <Input
              type="text"
              placeholder="my_collection"
              value={initialCollName}
              onChange={(e) => setInitialCollName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newDbName.trim() && initialCollName.trim() && handleCreateDatabase()}
            />
          </div>
        </div>
      </Modal>

      {/* Create Collection Modal */}
      <Modal
        isOpen={showCreateCollModal}
        onClose={() => {
          setShowCreateCollModal(false);
          setNewCollName('');
          setSelectedDb('');
        }}
        title="Create Collection"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateCollModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} disabled={!newCollName.trim()}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Database</label>
            <Input
              type="text"
              value={selectedDb}
              disabled
              className="bg-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Collection Name</label>
            <Input
              type="text"
              placeholder="my_collection"
              value={newCollName}
              onChange={(e) => setNewCollName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newCollName.trim() && handleCreateCollection()}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, type: 'database', name: '' })}
        onConfirm={handleDelete}
        title={`Delete ${deleteDialog.type === 'database' ? 'Database' : 'Collection'}`}
        message={`Are you sure you want to delete ${deleteDialog.type} "${deleteDialog.name}"? This action cannot be undone and will permanently delete all data.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </motion.div>
  );
};
