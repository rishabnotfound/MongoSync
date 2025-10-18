/**
 * Command Palette Component
 * Keyboard-driven command interface (Ctrl/Cmd + K)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useStore } from '@/lib/store';
import { Database, Table, Moon, Sun, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    toggleCommandPalette,
    connections,
    setActiveConnection,
    theme,
    setTheme,
    tabs,
    setActiveTab,
  } = useStore();

  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggleCommandPalette]);

  if (!commandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[20vh]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleCommandPalette}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Command Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative z-50 w-full max-w-2xl"
        >
          <Command className="rounded-lg border border-border bg-card shadow-xl overflow-hidden">
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />

            <Command.List className="max-h-[400px] overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>

              {/* Connections */}
              <Command.Group heading="Connections" className="mb-2">
                {connections.map((conn) => (
                  <Command.Item
                    key={conn.id}
                    onSelect={() => {
                      setActiveConnection(conn.id);
                      toggleCommandPalette();
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-accent aria-selected:bg-accent"
                  >
                    <Database className="h-4 w-4" />
                    <span>{conn.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{conn.status}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              {/* Open Tabs */}
              {tabs.length > 0 && (
                <Command.Group heading="Open Collections" className="mb-2">
                  {tabs.map((tab) => (
                    <Command.Item
                      key={tab.id}
                      onSelect={() => {
                        setActiveTab(tab.id);
                        toggleCommandPalette();
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-accent aria-selected:bg-accent"
                    >
                      <Table className="h-4 w-4" />
                      <span>{tab.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Actions */}
              <Command.Group heading="Actions">
                <Command.Item
                  onSelect={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                    toggleCommandPalette();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-accent aria-selected:bg-accent"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>Toggle Theme</span>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
