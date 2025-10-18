/**
 * Document Editor Component
 * Modal for editing MongoDB documents with JSON validation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MongoDocument } from '@/types';
import { prettyPrintJson, parseJsonSafely } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface DocumentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: any) => Promise<void>;
  document: MongoDocument | null;
  mode: 'edit' | 'create';
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  document,
  mode,
}) => {
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (document && mode === 'edit') {
      // Remove _id for editing (will be added back on save)
      const { _id, ...docWithoutId } = document;
      setJsonString(prettyPrintJson(docWithoutId));
    } else {
      setJsonString('{\n  \n}');
    }
    setError('');
  }, [document, mode, isOpen]);

  const handleSave = async () => {
    const parsed = parseJsonSafely(jsonString);

    if (!parsed.success) {
      setError(parsed.error || 'Invalid JSON');
      return;
    }

    setIsSaving(true);
    try {
      // If editing, add back the _id
      const docToSave = mode === 'edit' && document
        ? { _id: document._id, ...parsed.data }
        : parsed.data;

      await onSave(docToSave);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (value: string) => {
    setJsonString(value);
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Document' : 'Add New Document'}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {mode === 'edit' && document && (
          <div className="text-sm text-muted-foreground">
            Document ID: <code className="px-2 py-1 bg-muted rounded">{String(document._id)}</code>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Document JSON {mode === 'edit' && '(without _id)'}
          </label>
          <textarea
            value={jsonString}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-96 p-3 font-mono text-sm border border-border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder='{\n  "field": "value"\n}'
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/50 rounded-md">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Invalid JSON</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Use valid JSON format</p>
          <p>• {mode === 'edit' ? '_id will be preserved automatically' : '_id will be generated automatically if not provided'}</p>
          <p>• Use double quotes for keys and string values</p>
        </div>
      </div>
    </Modal>
  );
};
