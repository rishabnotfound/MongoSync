/**
 * Document Table Component
 * Displays documents in a paginated table with sorting and filtering
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Eye,
  Database,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MongoDocument } from '@/types';
import { cn, prettyPrintJson } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Toast, ToastType } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DocumentEditor } from './DocumentEditor';

interface DocumentTableProps {
  connectionId: string;
  database: string;
  collection: string;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  connectionId,
  database,
  collection,
}) => {
  const { connections } = useStore();
  const connection = connections.find((c) => c.id === connectionId);

  const [documents, setDocuments] = useState<MongoDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('json');
  const [filterQuery, setFilterQuery] = useState('{}');
  const [lastFilter, setLastFilter] = useState('{}'); // Track last applied filter
  const [customPage, setCustomPage] = useState('');
  const [showCustomPageInput, setShowCustomPageInput] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<MongoDocument | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    document: MongoDocument | null;
  }>({
    isOpen: false,
    document: null,
  });
  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    document: MongoDocument | null;
    mode: 'edit' | 'create';
  }>({
    isOpen: false,
    document: null,
    mode: 'create',
  });

  const loadDocuments = useCallback(async () => {
    if (!connection) return;

    setIsLoading(true);

    try {
      let filter = {};

      // Parse JSON filter query
      try {
        const parsedFilter = JSON.parse(filterQuery);
        // Only use if it's not an empty object or if user explicitly entered {}
        if (Object.keys(parsedFilter).length > 0 || filterQuery.trim() === '{}') {
          filter = parsedFilter;
        }
      } catch {
        // Invalid JSON, use empty object
      }

      const response = await fetch('/api/mongodb/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uri: connection.uri,
          database,
          collection,
          filter,
          options: {
            limit: pageSize,
            skip: (page - 1) * pageSize,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDocuments(result.data.documents);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connection, database, collection, filterQuery, page, pageSize]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    if (filterQuery !== lastFilter) {
      setPage(1);
      setLastFilter(filterQuery);
    }
  }, [filterQuery, lastFilter]);

  // Reset to page 1 when switching collections
  useEffect(() => {
    setPage(1);
    setFilterQuery('{}');
    setLastFilter('{}');
  }, [database, collection]);

  const handleDeleteClick = (doc: MongoDocument) => {
    setDeleteConfirm({ isOpen: true, document: doc });
  };

  const handleDeleteConfirm = async () => {
    if (!connection || !deleteConfirm.document) return;

    try {
      const response = await fetch('/api/mongodb/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uri: connection.uri,
          database,
          collection,
          filter: { _id: deleteConfirm.document._id },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setToast({ message: 'Document deleted successfully', type: 'success', visible: true });
        loadDocuments();
      } else {
        setToast({ message: result.error || 'Failed to delete document', type: 'error', visible: true });
      }
    } catch (error) {
      setToast({ message: 'Failed to delete document', type: 'error', visible: true });
      console.error('Error deleting document:', error);
    }
  };

  const handleCopy = async (doc: MongoDocument) => {
    try {
      await navigator.clipboard.writeText(prettyPrintJson(doc));
      setToast({ message: 'Document copied to clipboard!', type: 'success', visible: true });
    } catch (error) {
      setToast({ message: 'Failed to copy document', type: 'error', visible: true });
    }
  };

  const handleEditClick = (doc: MongoDocument) => {
    setEditorState({ isOpen: true, document: doc, mode: 'edit' });
  };

  const handleAddClick = () => {
    setEditorState({ isOpen: true, document: null, mode: 'create' });
  };

  const handleSaveDocument = async (doc: any) => {
    if (!connection) return;

    try {
      if (editorState.mode === 'edit') {
        // Update existing document
        const { _id, ...updates } = doc;
        const response = await fetch('/api/mongodb/documents', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uri: connection.uri,
            database,
            collection,
            filter: { _id },
            update: updates,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setToast({ message: 'Document updated successfully', type: 'success', visible: true });
          loadDocuments();
        } else {
          throw new Error(result.error || 'Failed to update document');
        }
      } else {
        // Insert new document
        const response = await fetch('/api/mongodb/documents', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uri: connection.uri,
            database,
            collection,
            document: doc,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setToast({ message: 'Document added successfully', type: 'success', visible: true });
          loadDocuments();
        } else {
          throw new Error(result.error || 'Failed to add document');
        }
      }

      // Close editor on success
      setEditorState({ isOpen: false, document: null, mode: 'create' });
    } catch (error) {
      setToast({ message: 'Failed to save document', type: 'error', visible: true });
      throw error;
    }
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(documents, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${database}_${collection}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setToast({ message: 'Documents exported successfully', type: 'success', visible: true });
    } catch (error) {
      setToast({ message: 'Failed to export documents', type: 'error', visible: true });
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      // Show current page and 2 before/after
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleCustomPageGo = () => {
    const pageNum = parseInt(customPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
      setCustomPage('');
      setShowCustomPageInput(false);
    }
  };

  // Extract all unique keys from documents for table headers
  const allKeys = React.useMemo(() => {
    const keys = new Set<string>();
    documents.forEach((doc) => {
      Object.keys(doc).forEach((key) => keys.add(key));
    });
    return Array.from(keys).slice(0, 10); // Limit to first 10 keys
  }, [documents]);

  const renderValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, document: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Document"
        message={`Are you sure you want to delete this document? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      <DocumentEditor
        isOpen={editorState.isOpen}
        onClose={() => setEditorState({ isOpen: false, document: null, mode: 'create' })}
        onSave={handleSaveDocument}
        document={editorState.document}
        mode={editorState.mode}
      />
      <div className="flex flex-col h-full">
      {/* Collection Header - More Prominent */}
      <div className="border-b-2 border-primary/20 px-4 py-3 bg-primary/5">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold text-foreground">{database}</span>
          <span className="text-muted-foreground font-bold">›</span>
          <span className="text-base font-semibold text-primary">{collection}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border p-2 sm:p-3 space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Single MongoDB Query Input (like Compass) */}
          <div className="flex items-center gap-2 flex-1">
            <Input
              placeholder='Filter: {"field": "value"} or {} for all'
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadDocuments()}
              className="flex-1 text-xs sm:text-sm font-mono"
            />
            <Button variant="outline" size="sm" onClick={loadDocuments} className="flex-shrink-0" title="Apply Filter">
              <RefreshCw className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>

          {/* View and Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-md flex-1 sm:flex-initial">
            <Button
              variant={viewMode === 'json' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('json')}
              className="rounded-r-none flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              JSON
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-l-none border-l flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              Table
            </Button>
          </div>

          <Button size="sm" className="text-xs sm:text-sm" onClick={handleAddClick}>
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Add</span>
          </Button>

          <Button size="sm" variant="outline" className="text-xs sm:text-sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading && documents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No documents found</p>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                {allKeys.map((key) => (
                  <th
                    key={key}
                    className="px-4 py-2 text-left text-sm font-medium border-b border-border"
                  >
                    {key}
                  </th>
                ))}
                <th className="px-4 py-2 text-right text-sm font-medium border-b border-border sticky right-0 bg-muted/50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, idx) => (
                <motion.tr
                  key={String(doc._id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-border hover:bg-accent/30"
                >
                  {allKeys.map((key) => (
                    <td key={key} className="px-4 py-2 text-sm max-w-xs truncate">
                      {renderValue(doc[key])}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right sticky right-0 bg-background">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopy(doc)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClick(doc)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDeleteClick(doc)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 space-y-2">
            {documents.map((doc, idx) => (
              <motion.div
                key={String(doc._id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="border border-border rounded-lg p-4 bg-muted/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <code className="text-xs text-muted-foreground">
                    _id: {String(doc._id)}
                  </code>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleCopy(doc)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClick(doc)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDeleteClick(doc)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <pre className="text-xs overflow-x-auto bg-background p-2 rounded border border-border">
                  {prettyPrintJson(doc)}
                </pre>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="border-t border-border p-2 sm:p-3 space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {total === 0 ? 'No documents' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} of ${total.toLocaleString()}`}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border border-border rounded-md px-2 py-1 text-xs sm:text-sm bg-background"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs sm:text-sm"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Prev</span>
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum, idx) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum as number)}
                    className={cn(
                      'px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors',
                      page === pageNum
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-accent'
                    )}
                  >
                    {pageNum}
                  </button>
                )
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Custom Page Input */}
        <div className="flex items-center justify-center gap-2">
          {showCustomPageInput ? (
            <>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={customPage}
                onChange={(e) => setCustomPage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomPageGo()}
                placeholder="Page #"
                className="w-20 h-8 text-xs"
              />
              <Button size="sm" onClick={handleCustomPageGo} className="h-8 text-xs">
                Go
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowCustomPageInput(false);
                  setCustomPage('');
                }}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
            </>
          ) : (
            <button
              onClick={() => setShowCustomPageInput(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Go to page...
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
};
