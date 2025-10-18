/**
 * Collection Tabs Component
 * Manages multiple open collection tabs
 */

'use client';

import React, { useState } from 'react';
import { X, XCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const CollectionTabs: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, removeTab, setActiveConnection } = useStore();
  const [showCloseAllDialog, setShowCloseAllDialog] = useState(false);

  if (tabs.length === 0) {
    return null;
  }

  const handleCloseAll = () => {
    // Close all tabs
    tabs.forEach((tab) => removeTab(tab.id));
    setShowCloseAllDialog(false);
  };

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;

            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={cn(
                  'group relative flex items-center gap-2 px-4 py-2.5 border-r border-border cursor-pointer transition-colors min-w-[180px] max-w-[220px]',
                  isActive
                    ? 'bg-background text-foreground'
                    : 'bg-card hover:bg-accent/50 text-muted-foreground'
                )}
                onClick={() => {
                  setActiveTab(tab.id);
                  // Auto-switch connection when clicking tab
                  setActiveConnection(tab.connectionId);
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Tab title */}
                <span className="flex-1 text-sm truncate">{tab.title}</span>

                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-accent p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}

          {/* Close All button - only show if there are multiple tabs */}
          {tabs.length > 1 && (
            <button
              onClick={() => setShowCloseAllDialog(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors border-r border-border"
              title="Close all tabs"
            >
              <XCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Close All</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showCloseAllDialog}
        onClose={() => setShowCloseAllDialog(false)}
        onConfirm={handleCloseAll}
        title="Close All Tabs"
        message={`Are you sure you want to close all ${tabs.length} tabs?`}
        confirmText="Close All"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};
