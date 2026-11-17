import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiMenu, FiX, FiUser, FiDatabase } from 'react-icons/fi';
import { useAuthStore, useAppStore } from '../store';
import { filesAPI } from '../api';
import FileManager from '../components/FileManager';
import ChannelSelector from '../components/ChannelSelector';
import TemplatePanel from '../components/TemplatePanel';
import SignalChart from '../components/SignalChart';
import StatisticsPanel from '../components/StatisticsPanel';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const { selectedFile, setSelectedFile, setFiles, sidebarOpen, setSidebarOpen } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const files = await filesAPI.list();
      setFiles(files);
    } catch {
      toast.error('Dosyalar yuklenemedi');
    }
  };

  const handleFileSelect = async (fileId: number) => {
    try {
      const file = await filesAPI.get(fileId);
      setSelectedFile(file);
    } catch {
      toast.error('Dosya detaylari alinamadi');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Top bar */}
      <header className="h-12 border-b border-slate-700 bg-slate-800/80 backdrop-blur flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded lg:hidden"
          >
            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">ECUView</span>
          </div>

          {selectedFile && (
            <div className="hidden md:flex items-center gap-2 ml-4 text-xs text-slate-400">
              <FiDatabase className="w-3.5 h-3.5" />
              <span>{selectedFile.original_filename}</span>
              <span className="text-slate-600">|</span>
              <span>{selectedFile.channel_count} kanal</span>
              <span className="text-slate-600">|</span>
              <span>{selectedFile.duration_seconds?.toFixed(0)}s</span>
              <span className="text-slate-600">|</span>
              <span>{selectedFile.file_format} {selectedFile.mdf_version}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <FiUser className="w-4 h-4" />
            <span className="hidden sm:inline">{user?.full_name || user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded"
            title="Cikis Yap"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`w-80 border-r border-slate-700 bg-slate-800/30 flex-shrink-0 flex flex-col overflow-hidden transition-all duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:static inset-y-12 left-0 z-20 lg:z-0`}
        >
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            {/* File Manager */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                Dosyalar
              </h3>
              <FileManager onFileSelect={handleFileSelect} />
            </div>

            {/* Templates */}
            <TemplatePanel />

            {/* Channel Selector */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                Kanallar
              </h3>
              <ChannelSelector />
            </div>
          </div>
        </aside>

        {/* Chart area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <SignalChart />
          <StatisticsPanel />
        </main>
      </div>
    </div>
  );
}
