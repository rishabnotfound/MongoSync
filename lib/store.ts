/**
 * Zustand store for global state management
 */

import { create } from 'zustand';
import { AppState, MongoConnection, CollectionTab, Theme } from '@/types';
import { generateId, extractHostFromUri } from './utils';

const STORAGE_KEYS = {
  CONNECTIONS: 'mongodb-dashboard-connections',
  THEME: 'mongodb-dashboard-theme',
  SIDEBAR: 'mongodb-dashboard-sidebar',
};

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  connections: [],
  activeConnectionId: null,
  tabs: [],
  activeTabId: null,
  theme: 'dark',
  sidebarCollapsed: false,
  commandPaletteOpen: false,

  // Connection actions
  addConnection: (connection) => {
    const newConnection: MongoConnection = {
      ...connection,
      id: generateId(),
      host: extractHostFromUri(connection.uri),
      status: 'disconnected',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      connections: [...state.connections, newConnection],
    }));

    // Auto-select if it's the first connection
    if (get().connections.length === 1) {
      get().setActiveConnection(newConnection.id);
    }

    get().persist();
  },

  updateConnection: (id, updates) => {
    set((state) => ({
      connections: state.connections.map((conn) =>
        conn.id === id ? { ...conn, ...updates } : conn
      ),
    }));
    get().persist();
  },

  removeConnection: (id) => {
    set((state) => {
      // Remove all tabs for this connection
      const newTabs = state.tabs.filter((tab) => tab.connectionId !== id);
      const newActiveTabId =
        state.activeTabId && state.tabs.find((tab) => tab.id === state.activeTabId)?.connectionId === id
          ? null
          : state.activeTabId;

      return {
        connections: state.connections.filter((conn) => conn.id !== id),
        activeConnectionId: state.activeConnectionId === id ? null : state.activeConnectionId,
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    });
    get().persist();
  },

  setActiveConnection: (id) => {
    set({ activeConnectionId: id });
  },

  // Tab actions
  addTab: (tab) => {
    const existingTab = get().tabs.find(
      (t) =>
        t.connectionId === tab.connectionId &&
        t.database === tab.database &&
        t.collection === tab.collection
    );

    if (existingTab) {
      // Just activate the existing tab
      get().setActiveTab(existingTab.id);
      return;
    }

    const newTab: CollectionTab = {
      ...tab,
      id: generateId(),
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
  },

  updateTab: (id, updates) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab)),
    }));
  },

  removeTab: (id) => {
    set((state) => {
      const newTabs = state.tabs.filter((tab) => tab.id !== id);
      let newActiveTabId = state.activeTabId;

      // If we're closing the active tab, activate the next or previous tab
      if (state.activeTabId === id) {
        const currentIndex = state.tabs.findIndex((tab) => tab.id === id);
        if (newTabs.length > 0) {
          const nextIndex = Math.min(currentIndex, newTabs.length - 1);
          newActiveTabId = newTabs[nextIndex].id;
        } else {
          newActiveTabId = null;
        }
      }

      return {
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    });
  },

  setActiveTab: (id) => {
    set({ activeTabId: id });
  },

  // Theme actions
  setTheme: (theme) => {
    set({ theme });

    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }

      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
  },

  // UI actions
  toggleSidebar: () => {
    set((state) => {
      const collapsed = !state.sidebarCollapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR, JSON.stringify(collapsed));
      }
      return { sidebarCollapsed: collapsed };
    });
  },

  toggleCommandPalette: () => {
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen }));
  },

  // Persistence
  hydrate: () => {
    if (typeof window === 'undefined') return;

    try {
      // Load connections
      const connectionsData = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
      if (connectionsData) {
        const connections = JSON.parse(connectionsData);
        set({ connections });
      }

      // Load theme
      const theme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme;
      if (theme) {
        get().setTheme(theme);
      } else {
        get().setTheme('dark'); // Default theme
      }

      // Load sidebar state
      const sidebarData = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
      if (sidebarData) {
        set({ sidebarCollapsed: JSON.parse(sidebarData) });
      }
    } catch (error) {
      console.error('Error hydrating store:', error);
    }
  },

  persist: () => {
    if (typeof window === 'undefined') return;

    try {
      const { connections } = get();
      localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections));
    } catch (error) {
      console.error('Error persisting store:', error);
    }
  },
}));
