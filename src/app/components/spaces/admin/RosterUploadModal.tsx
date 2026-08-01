import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseCSVText, uploadRosterToSpace } from '../../../../../lib/rosterParser';

interface RosterUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  spaceName: string;
  actor: { id: string; name: string };
  onSuccess?: () => void;
}

export default function RosterUploadModal({
  isOpen,
  onClose,
  spaceId,
  spaceName,
  actor,
  onSuccess
}: RosterUploadModalProps) {
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [parsedInfo, setParsedInfo] = useState<{ count: number; sampleName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);

      const parsed = parseCSVText(text);
      if (parsed.entries.length === 0) {
        setError('Could not parse any valid roster rows from CSV.');
        setParsedInfo(null);
      } else {
        setParsedInfo({
          count: parsed.entries.length,
          sampleName: parsed.entries[0].name,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmUpload = async () => {
    if (!fileContent || !parsedInfo) return;
    setUploading(true);

    const parsed = parseCSVText(fileContent);
    const success = await uploadRosterToSpace(spaceId, parsed.entries, actor);

    setUploading(false);
    if (success) {
      alert(`Successfully uploaded ${parsed.entries.length} roster entries to ${spaceName}!`);
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError('Failed to write roster to database. Please check permissions.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Upload size={20} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Upload Roster CSV
          </h3>
        </div>

        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-5">
          Upload an official CSV roster (Admission Numbers, Employee IDs, or Member IDs) to enable automatic verification for members joining <strong className="text-slate-800 dark:text-slate-200">{spaceName}</strong>.
        </p>

        {/* File Dropzone */}
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer mb-4">
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <FileText size={32} className="mx-auto text-indigo-500 mb-2" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {fileName || 'Click or drag CSV file here'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Format: Column 1 = ID (e.g. ADM-101), Column 2 = Full Name
          </p>
        </div>

        {parsedInfo && (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              Ready to import <strong>{parsedInfo.count} entries</strong> (e.g. {parsedInfo.sampleName}).
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-medium border border-red-200 flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmUpload}
            disabled={!parsedInfo || uploading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {uploading ? 'Importing...' : 'Confirm & Import Roster'}
          </button>
        </div>
      </div>
    </div>
  );
}
