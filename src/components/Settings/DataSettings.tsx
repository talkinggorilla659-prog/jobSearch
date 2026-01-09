import { useState, useRef } from 'react';
import { Button, Card, CardContent, Modal } from '../UI';
import { exportAllData, importAllData, clearAllData, downloadJson } from '../../lib/dataManager';

export function DataSettings() {
  const [showClearModal, setShowClearModal] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const data = await exportAllData();
    const filename = `jobhunt-backup-${new Date().toISOString().split('T')[0]}.json`;
    downloadJson(data, filename);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('idle');
    setImportError('');

    try {
      const text = await file.text();
      await importAllData(text);
      setImportStatus('success');
    } catch (err) {
      setImportStatus('error');
      setImportError(err instanceof Error ? err.message : 'Failed to import data');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAll = async () => {
    await clearAllData();
    setShowClearModal(false);
    window.location.href = '/';
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">
              Your data is stored locally on this device only
            </p>
            <p className="text-sm text-amber-700 mt-1">
              There are no accounts or cloud sync. If you clear your browser data, cookies, or site data,
              your job search information will be permanently deleted. Use Export below to backup your data regularly.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent>
          <h3 className="font-medium text-gray-900 mb-2">Export Data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Download all your data as a JSON file for backup.
          </p>
          <Button onClick={handleExport}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export All Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="font-medium text-gray-900 mb-2">Import Data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Restore from a previously exported backup file. This will replace all current data.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="secondary" onClick={handleImportClick}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import from File
          </Button>
          {importStatus === 'success' && (
            <p className="mt-2 text-sm text-green-600">
              Data imported successfully! Refresh the page to see changes.
            </p>
          )}
          {importStatus === 'error' && (
            <p className="mt-2 text-sm text-red-600">{importError}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="font-medium text-gray-900 mb-2">Clear All Data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete all your data including profile, jobs, and settings.
            This action cannot be undone.
          </p>
          <Button variant="danger" onClick={() => setShowClearModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Data"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete all your data? This includes:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
          <li>Your profile and resume</li>
          <li>All saved jobs and analysis</li>
          <li>Generated resumes and cover letters</li>
          <li>API keys and settings</li>
        </ul>
        <p className="text-sm text-red-600 mb-4">This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClearAll}>
            Delete Everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}
