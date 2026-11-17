import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, BarChart3, FileText, Clock, Layers, Activity } from 'lucide-react';
import { useAuthStore, useAppStore } from '../store';
import { filesAPI } from '../api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HomePage() {
  const { user } = useAuthStore();
  const { files, setFiles } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await filesAPI.list();
      setFiles(data);
    } catch {
      toast.error('Dosyalar yuklenemedi');
    }
  };

  const totalChannels = files.reduce((sum, f) => sum + (f.channel_count || 0), 0);
  const totalSize = files.reduce((sum, f) => sum + f.file_size, 0);
  const latestFile = files.length > 0 ? files[files.length - 1] : null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const stats = [
    { label: 'Toplam Dosya', value: files.length.toString(), icon: FileText, color: 'var(--ecu-info)' },
    { label: 'Toplam Kanal', value: totalChannels.toString(), icon: Layers, color: 'var(--ecu-accent)' },
    { label: 'Toplam Boyut', value: formatFileSize(totalSize), icon: Activity, color: 'var(--ecu-success)' },
    { label: 'Son Dosya', value: latestFile?.original_filename?.substring(0, 15) || '-', icon: Clock, color: 'var(--ecu-danger)' },
  ];

  return (
    <div className="h-screen flex flex-col bg-[var(--ecu-bg)]">
      <Navbar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Welcome */}
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="heading-industrial text-2xl text-[var(--ecu-text)] tracking-wider mb-2">
                // HOS GELDINIZ
              </h1>
              <p className="text-[var(--ecu-text-secondary)] font-[family-name:var(--font-mono)] text-sm">
                {user?.full_name || user?.username}, ECUView platformuna hos geldiniz.
              </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: stat.color }} />
                    <CardContent className="p-4 pl-5">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-5 h-5" style={{ color: stat.color }} />
                        <Badge variant="secondary" className="text-[10px]">
                          {stat.label}
                        </Badge>
                      </div>
                      <p className="data-mono text-xl font-bold text-[var(--ecu-text)]">
                        {stat.value}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="hover:border-[var(--ecu-accent)] transition-colors cursor-pointer group"
                    onClick={() => navigate('/dashboard')}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 border-2 border-[var(--ecu-accent)] bg-[var(--ecu-accent-bg)] flex items-center justify-center group-hover:bg-[var(--ecu-accent)] transition-colors">
                    <BarChart3 className="w-6 h-6 text-[var(--ecu-accent)] group-hover:text-[#0a0a0f] transition-colors" />
                  </div>
                  <div>
                    <h3 className="heading-industrial text-sm text-[var(--ecu-text)] tracking-wider">
                      Dashboard
                    </h3>
                    <p className="text-xs text-[var(--ecu-text-secondary)] mt-1">
                      Veri analizi ve grafik goruntuleyici
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:border-[var(--ecu-accent)] transition-colors cursor-pointer group"
                    onClick={() => navigate('/dashboard')}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 border-2 border-[var(--ecu-info)] bg-[var(--ecu-info)]/10 flex items-center justify-center group-hover:bg-[var(--ecu-info)] transition-colors">
                    <Upload className="w-6 h-6 text-[var(--ecu-info)] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="heading-industrial text-sm text-[var(--ecu-text)] tracking-wider">
                      Dosya Yukle
                    </h3>
                    <p className="text-xs text-[var(--ecu-text-secondary)] mt-1">
                      MDF/DAT dosyasi yukle ve analiz et
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Files */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>// Son Dosyalar</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {files.length === 0 ? (
                    <div className="text-center py-12 text-[var(--ecu-text-muted)]">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-[family-name:var(--font-mono)] text-sm">Henuz dosya yuklenmemis</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate('/dashboard')}
                      >
                        Dosya Yukle
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--ecu-border)]">
                      {files.slice(-5).reverse().map((file) => (
                        <motion.div
                          key={file.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-[var(--ecu-surface-2)] transition-colors cursor-pointer"
                          whileHover={{ x: 4 }}
                          onClick={() => navigate('/dashboard')}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-[var(--ecu-accent)]" />
                            <div>
                              <p className="text-sm font-medium text-[var(--ecu-text)]">
                                {file.original_filename}
                              </p>
                              <p className="text-xs text-[var(--ecu-text-muted)] data-mono">
                                {formatFileSize(file.file_size)} | {file.channel_count} kanal
                              </p>
                            </div>
                          </div>
                          <Badge variant="info">{file.file_format}</Badge>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
