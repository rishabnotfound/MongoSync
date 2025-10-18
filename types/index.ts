/**
 * Core TypeScript types and interfaces for MongoDB Dashboard
 */

import { Document, ObjectId } from 'mongodb';

// Connection-related types
export interface MongoConnection {
  id: string;
  name: string;
  uri: string;
  host: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  databases?: string[];
  createdAt: string;
  lastConnected?: string;
  error?: string;
}

export interface ConnectionFormData {
  name: string;
  uri: string;
}

// Database and Collection types
export interface DatabaseInfo {
  name: string;
  sizeOnDisk?: number;
  empty?: boolean;
  collections: CollectionInfo[];
}

export interface CollectionInfo {
  name: string;
  type: string;
  options?: any;
  info?: {
    readOnly: boolean;
    uuid?: string;
  };
}

export interface CollectionStats {
  ns: string;
  count: number;
  size: number;
  avgObjSize: number;
  storageSize: number;
  totalIndexSize: number;
  indexSizes: { [key: string]: number };
  scaleFactor?: number;
}

// Document-related types
export interface MongoDocument {
  _id: ObjectId | string;
  [key: string]: any;
}

export interface DocumentFilter {
  query: Record<string, any>;
  projection?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

// Tab management
export interface CollectionTab {
  id: string;
  connectionId: string;
  database: string;
  collection: string;
  title: string;
  view: 'documents' | 'query' | 'aggregation' | 'stats';
}

// Query Builder types
export interface QueryField {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex' | 'exists';
  value: any;
}

export interface QueryBuilderState {
  fields: QueryField[];
  projection: Record<string, 1 | 0>;
  sort: Record<string, 1 | -1>;
  limit: number;
  skip: number;
}

// Aggregation types
export interface AggregationStage {
  id: string;
  type: '$match' | '$group' | '$project' | '$sort' | '$limit' | '$skip' | '$lookup' | '$unwind' | '$addFields' | '$count';
  config: Record<string, any>;
}

export interface AggregationPipeline {
  stages: AggregationStage[];
}

// Import/Export types
export interface ImportOptions {
  format: 'json' | 'csv';
  mode: 'insert' | 'upsert';
  upsertKey?: string;
}

export interface ExportOptions {
  format: 'json' | 'csv';
  filter?: DocumentFilter;
  fields?: string[];
}

// Pagination
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// Theme
export type Theme = 'light' | 'dark' | 'system';

// Store state
export interface AppState {
  // Connections
  connections: MongoConnection[];
  activeConnectionId: string | null;

  // Tabs
  tabs: CollectionTab[];
  activeTabId: string | null;

  // Theme
  theme: Theme;

  // UI State
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;

  // Actions
  addConnection: (connection: Omit<MongoConnection, 'id' | 'createdAt' | 'status' | 'host'>) => void;
  updateConnection: (id: string, updates: Partial<MongoConnection>) => void;
  removeConnection: (id: string) => void;
  setActiveConnection: (id: string | null) => void;

  addTab: (tab: Omit<CollectionTab, 'id'>) => void;
  updateTab: (id: string, updates: Partial<CollectionTab>) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string | null) => void;

  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;

  hydrate: () => void;
  persist: () => void;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DatabaseListResponse {
  databases: DatabaseInfo[];
}

export interface CollectionListResponse {
  collections: CollectionInfo[];
}

export interface DocumentListResponse {
  documents: MongoDocument[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryExecutionResponse {
  documents: MongoDocument[];
  executionTime: number;
  count: number;
}

export interface AggregationExecutionResponse {
  results: any[];
  executionTime: number;
}
