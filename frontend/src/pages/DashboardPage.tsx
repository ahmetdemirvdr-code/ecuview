import { useEffect } from 'react';
import { Menu, X, Database } from 'lucide-react';
import { useAppStore } from '../store';
import { filesAPI } from '../api';
import FileManager from '../components/FileManager';
import ChannelSelector from '../components/ChannelSelector';
import TemplatePanel from '../components/TemplatePanel';
import SignalChart from '../components/SignalChart';
import StatisticsPanel from '../components/StatisticsPanel';
import Navbar from '../components/layout/Navbar';
import { Badge } from '../components/ui/badge';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { selectedFile, setSelectedFile, setFiles, sidebarOpen, setSidebarOpen } = useAppStore();

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

  return (
    <div className="h-screen flex flex-col bg-[var(--ecu-bg)]">
      <Navbar />

      {/* File info bar */}
      {selectedFile && (
        <div className="h-8 border-b border-[var(--ecu-border)] bg-[var(--ecu-surface-2)] flex items-center px-4 gap-3 flex-shrink-0">
          <Database className="w-3.5 h-3.5 text-[var(--ecu-accent)]" />
          <span className="data-mono text-xs text-[var(--ecu-text)]">{selectedFile.original_filename}</span>
          <span className="text-[var(--ecu-border-accent)]">|</span>
          <span className="data-mono text-xs text-[var(--ecu-text-secondary)]">{selectedFile.channel_count} kanal</span>
          <span className="text-[var(--ecu-border-accent)]">|</span>
          <span className="data-mono text-xs text-[var(--ecu-text-secondary)]">{selectedFile.duration_seconds?.toFixed(0)}s</span>
          <Badge variant="info" className="text-[9px] py-0">
            {selectedFile.file_format} {selectedFile.mdf_version}
          </Badge>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 left-4 z-30 lg:hidden w-10 h-10 bg-[var(--ecu-accent)] text-[#0a0a0f] flex items-center justify-center shadow-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Sidebar */}
        <aside
          className={`w-80 border-r-2 border-[var(--ecu-border)] bg-[var(--ecu-surface)] flex-shrink-0 flex flex-col overflow-hidden
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:static inset-y-0 top-12 left-0 z-20 lg:z-0 transition-transform duration-300`}
        >
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            {/* File Manager */}
            <div>
              <h3 className="heading-industrial text-[10px] text-[var(--ecu-text-muted)] tracking-widest mb-2 px-1">
                // DOSYALAR
              </h3>
              <FileManager onFileSelect={handleFileSelect} />
            </div>

            {/* Templates */}
            <TemplatePanel />

            {/* Channel Selector */}
            <div>
              <h3 className="heading-industrial text-[10px] text-[var(--ecu-text-muted)] tracking-widest mb-2 px-1">
                // KANALLAR
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
