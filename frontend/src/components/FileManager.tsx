import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiTrash2, FiClock, FiLayers, FiActivity } from 'react-icons/fi';
import { filesAPI } from '../api';
import { useAppStore } from '../store';
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

      // Refresh file list
      const updatedFiles = await filesAPI.list();
      setFiles(updatedFiles);

      // Auto-select the uploaded file
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
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-amber-400 bg-amber-400/10' : 'border-slate-600 hover:border-blue-500 hover:bg-blue-500/5'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <FiUploadCloud className="w-10 h-10 mx-auto mb-3 text-slate-400" />
        {uploading ? (
          <div>
            <p className="text-slate-300 mb-2">Yukleniyor... %{uploadProgress}</p>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <p className="text-amber-400 font-medium">Dosyayi buraya birakin</p>
        ) : (
          <div>
            <p className="text-slate-300 font-medium">MDF/DAT dosyasi yukleyin</p>
            <p className="text-slate-500 text-sm mt-1">.dat, .mdf, .mf4, .csv (max 500MB)</p>
          </div>
        )}
      </div>

      {/* File List */}
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => onFileSelect(file.id)}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 cursor-pointer hover:bg-slate-700/50 hover:border-blue-500/50 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <FiFile className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {file.original_filename}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span className="flex items-center gap-1">
                      <FiLayers className="w-3 h-3" />
                      {file.channel_count} kanal
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {formatDuration(file.duration_seconds)}
                    </span>
                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-medium">
                      {file.file_format}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(e, file.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                title="Dosyayi Sil"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {files.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <FiActivity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Henuz dosya yuklenmemis</p>
          </div>
        )}
      </div>
    </div>
  );
}
