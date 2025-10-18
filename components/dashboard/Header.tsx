/**
 * Header Component
 * Top navigation bar with connection selector and theme toggle
 */

'use client';

import React, { useState } from 'react';
import { Database, Moon, Sun, Command } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConnectionManager } from './ConnectionManager';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { connections, activeConnectionId, setActiveConnection, theme, setTheme, toggleCommandPalette } = useStore();
  const [showConnectionManager, setShowConnectionManager] = useState(false);

  const activeConnection = connections.find((c) => c.id === activeConnectionId);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b border-border bg-card px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center justify-between gap-2">
        {/* Logo and Connection Selector */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Database className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-sm sm:text-xl font-bold hidden sm:block">MongoDB Web</h1>
            <h1 className="text-sm font-bold sm:hidden">MongoDB</h1>
          </div>

          {connections.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline">Connection:</span>
              <select
                value={activeConnectionId || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__add_new__') {
                    setShowConnectionManager(true);
                  } else {
                    setActiveConnection(value || null);
                  }
                }}
                className="border border-border rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-background min-w-0 flex-1 max-w-[200px] sm:max-w-xs"
              >
                {connections.map((conn) => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name} ({conn.status})
                  </option>
                ))}
                <option value="__add_new__">+ Add New Connection</option>
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCommandPalette}
            className="hidden md:flex"
          >
            <Command className="h-4 w-4 mr-1" />
            <span className="text-xs">⌘K</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 sm:h-10 sm:w-10">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
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
        <ConnectionManager onConnectionSelect={() => setShowConnectionManager(false)} />
      </Modal>
    </header>
  );
};
