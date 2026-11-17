import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Trash2, Clock, Layers, Activity } from 'lucide-react';
import { filesAPI } from '../api';
import { useAppStore } from '../store';
import { Badge } from './ui/badge';
import toast from 'react-hot-toast';

interface Props {
  onFileSelect: (fileId: number) => void;
}

export default function FileManager({ onFileSelect }: Props) {
  const { files, setFiles } = useAppStore();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await filesAPI.upload(file, (percent) => {
        setUploadProgress(percent);
      });
      toast.success(`${file.name} basariyla yuklendi! ${result.channel_count} kanal bulundu.`);

      const updatedFiles = await filesAPI.list();
      setFiles(updatedFiles);
      onFileSelect(result.id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Dosya yuklenemedi');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [setFiles, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.dat', '.mdf', '.mf4'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleDelete = async (e: React.MouseEvent, fileId: number) => {
    e.stopPropagation();
    if (!confirm('Bu dosyayi silmek istediginizden emin misiniz?')) return;

    try {
      await filesAPI.delete(fileId);
      const updatedFiles = await filesAPI.list();
      setFiles(updatedFiles);
      toast.success('Dosya silindi');
    } catch {
      toast.error('Dosya silinemedi');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-5 text-center cursor-pointer transition-all
          ${isDragActive
            ? 'border-[var(--ecu-accent)] bg-[var(--ecu-accent-bg)]'
            : 'border-[var(--ecu-border-accent)] hover:border-[var(--ecu-accent)] hover:bg-[var(--ecu-accent-bg)]'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--ecu-text-muted)]" />
        {uploading ? (
          <div>
            <p className="text-[var(--ecu-text)] text-sm data-mono mb-2">Yukleniyor... %{uploadProgress}</p>
            <div className="w-full bg-[var(--ecu-surface-2)] h-1.5">
              <motion.div
                className="bg-[var(--ecu-accent)] h-1.5"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <p className="text-[var(--ecu-accent)] font-medium text-sm">Dosyayi buraya birakin</p>
        ) : (
          <div>
            <p className="text-[var(--ecu-text)] font-medium text-sm">MDF/DAT dosyasi yukleyin</p>
            <p className="text-[var(--ecu-text-muted)] text-xs mt-1 data-mono">.dat, .mdf, .mf4, .csv (max 500MB)</p>
          </div>
        )}
      </div>

      {/* File List */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {files.map((file, idx) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onFileSelect(file.id)}
              className="border border-[var(--ecu-border)] bg-[var(--ecu-surface-2)] p-2.5 cursor-pointer
                hover:border-[var(--ecu-accent)] transition-all group relative"
            >
              {/* Left accent line */}
              <div className="absolute left-0 top-0 w-[3px] h-full bg-[var(--ecu-info)] group-hover:bg-[var(--ecu-accent)] transition-colors" />

              <div className="flex items-start justify-between pl-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-[var(--ecu-accent)] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--ecu-text)] truncate">
                      {file.original_filename}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--ecu-text-muted)] data-mono">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span className="flex items-center gap-0.5">
                        <Layers className="w-3 h-3" />
                        {file.channel_count}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDuration(file.duration_seconds)}
                      </span>
                      <Badge variant="info" className="text-[9px] py-0 px-1">
                        {file.file_format}
                      </Badge>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, file.id)}
                  className="p-1 text-[var(--ecu-text-muted)] hover:text-[var(--ecu-danger)] opacity-0 group-hover:opacity-100 transition-all"
                  title="Dosyayi Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {files.length === 0 && (
          <div className="text-center py-8 text-[var(--ecu-text-muted)]">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs data-mono">Henuz dosya yuklenmemis</p>
          </div>
        )}
      </div>
    </div>
  );
}
