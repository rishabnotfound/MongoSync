/**
 * Connection Manager Component
 * Allows users to add, edit, and manage MongoDB connections
 */

'use client';

import React, { useState } from 'react';
import { Plus, Database, Trash2, CheckCircle2, XCircle, Loader2, Copy } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast, ToastType } from '@/components/ui/Toast';
import { validateMongoUri } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ConnectionManagerProps {
  onConnectionSelect?: () => void;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({ onConnectionSelect }) => {
  const { connections, addConnection, removeConnection, updateConnection, setActiveConnection } =
    useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', uri: '' });
  const [errors, setErrors] = useState({ name: '', uri: '' });
  const [isConnecting, setIsConnecting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors = { name: '', uri: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const uriValidation = validateMongoUri(formData.uri);
    if (!uriValidation.valid) {
      newErrors.uri = uriValidation.error || 'Invalid URI';
    }

    setErrors(newErrors);

    if (newErrors.name || newErrors.uri) {
      return;
    }

    setIsConnecting(true);

    try {
      // Test connection
      const response = await fetch('/api/mongodb/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: formData.uri }),
      });

      const result = await response.json();

      if (!result.success) {
        setErrors({ ...errors, uri: result.error || 'Connection failed' });
        setIsConnecting(false);
        return;
      }

      // Add connection
      addConnection({
        name: formData.name,
        uri: formData.uri,
      });

      // Reset form
      setFormData({ name: '', uri: '' });
      setErrors({ name: '', uri: '' });
      setIsModalOpen(false);
    } catch (error) {
      setErrors({ ...errors, uri: 'Failed to connect' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async (connectionId: string) => {
    const connection = connections.find((c) => c.id === connectionId);
    if (!connection) return;

    updateConnection(connectionId, { status: 'connecting' });

    try {
      const response = await fetch('/api/mongodb/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: connection.uri }),
      });

      const result = await response.json();

      if (result.success) {
        updateConnection(connectionId, {
          status: 'connected',
          databases: result.data?.databases || [],
          lastConnected: new Date().toISOString(),
        });
        setActiveConnection(connectionId);
      } else {
        updateConnection(connectionId, {
          status: 'error',
          error: result.error,
        });
      }
    } catch (error) {
      updateConnection(connectionId, {
        status: 'error',
        error: 'Connection failed',
      });
    }
  };

  const handleDelete = (connectionId: string) => {
    if (confirm('Are you sure you want to delete this connection?')) {
      removeConnection(connectionId);
    }
  };

  const handleCopyUri = async (uri: string) => {
    try {
      await navigator.clipboard.writeText(uri);
      setToast({ message: 'Connection URI copied to clipboard!', type: 'success', visible: true });
    } catch (error) {
      setToast({ message: 'Failed to copy URI', type: 'error', visible: true });
    }
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Connections</h2>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Connection
          </Button>
        </div>

      {/* Connection List */}
      <div className="space-y-2">
        {connections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No connections yet</p>
            <p className="text-sm">Click &quot;Add Connection&quot; to get started</p>
          </div>
        ) : (
          connections.map((connection) => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => {
                if (connection.status !== 'connected') {
                  handleConnect(connection.id);
                } else {
                  setActiveConnection(connection.id);
                }
                // Close the modal after selecting
                onConnectionSelect?.();
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">{connection.name}</h3>
                    {connection.status === 'connected' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {connection.status === 'error' && (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    {connection.status === 'connecting' && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{connection.host}</p>
                  {connection.error && (
                    <p className="text-sm text-destructive mt-1">{connection.error}</p>
                  )}
                  {connection.databases && connection.databases.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {connection.databases.length} database(s)
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {connection.status !== 'connected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect(connection.id);
                      }}
                      disabled={connection.status === 'connecting'}
                    >
                      Connect
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUri(connection.uri);
                    }}
                    className="h-8 w-8"
                    title="Copy Connection URI"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(connection.id);
                    }}
                    className="h-8 w-8"
                    title="Delete Connection"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Connection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ name: '', uri: '' });
          setErrors({ name: '', uri: '' });
        }}
        title="Add MongoDB Connection"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Connection Name</label>
            <Input
              type="text"
              placeholder="My MongoDB"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Connection URI</label>
            <Input
              type="text"
              placeholder="mongodb://localhost:27017 or mongodb+srv://..."
              value={formData.uri}
              onChange={(e) => setFormData({ ...formData, uri: e.target.value })}
              className={errors.uri ? 'border-destructive' : ''}
            />
            {errors.uri && <p className="text-sm text-destructive mt-1">{errors.uri}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Enter your MongoDB connection string (mongodb:// or mongodb+srv://)
            </p>
          </div>
        </form>
      </Modal>
      </div>
    </>
  );
};
