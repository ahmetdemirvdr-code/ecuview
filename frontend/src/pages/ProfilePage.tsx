import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building, Lock, Sun, Moon } from 'lucide-react';
import { useAuthStore, useThemeStore } from '../store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error('Yeni sifreler eslesmiyor');
      return;
    }
    if (passwords.newPass.length < 6) {
      toast.error('Sifre en az 6 karakter olmali');
      return;
    }
    // Backend API for password change is not available yet
    toast.error('Sifre degistirme henuz desteklenmiyor');
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--ecu-bg)]">
      <Navbar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="heading-industrial text-2xl text-[var(--ecu-text)] tracking-wider mb-2">
                // PROFIL & AYARLAR
              </h1>
              <p className="text-[var(--ecu-text-secondary)] font-[family-name:var(--font-mono)] text-sm">
                Hesap bilgileriniz ve uygulama ayarlariniz
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Info Card */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>// Kullanici Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-[var(--ecu-surface-2)] border border-[var(--ecu-border)]">
                      <User className="w-4 h-4 text-[var(--ecu-accent)]" />
                      <div>
                        <p className="text-[10px] font-[family-name:var(--font-heading)] text-[var(--ecu-text-muted)] uppercase tracking-wider">
                          Kullanici Adi
                        </p>
                        <p className="text-sm text-[var(--ecu-text)] data-mono">{user?.username || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[var(--ecu-surface-2)] border border-[var(--ecu-border)]">
                      <Mail className="w-4 h-4 text-[var(--ecu-info)]" />
                      <div>
                        <p className="text-[10px] font-[family-name:var(--font-heading)] text-[var(--ecu-text-muted)] uppercase tracking-wider">
                          E-posta
                        </p>
                        <p className="text-sm text-[var(--ecu-text)] data-mono">{user?.email || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[var(--ecu-surface-2)] border border-[var(--ecu-border)]">
                      <User className="w-4 h-4 text-[var(--ecu-success)]" />
                      <div>
                        <p className="text-[10px] font-[family-name:var(--font-heading)] text-[var(--ecu-text-muted)] uppercase tracking-wider">
                          Ad Soyad
                        </p>
                        <p className="text-sm text-[var(--ecu-text)] data-mono">{user?.full_name || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[var(--ecu-surface-2)] border border-[var(--ecu-border)]">
                      <Building className="w-4 h-4 text-[var(--ecu-danger)]" />
                      <div>
                        <p className="text-[10px] font-[family-name:var(--font-heading)] text-[var(--ecu-text-muted)] uppercase tracking-wider">
                          Firma
                        </p>
                        <p className="text-sm text-[var(--ecu-text)] data-mono">{user?.company || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Theme Settings Card */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>// Tema Ayarlari</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-[var(--ecu-text-secondary)]">
                      Gorunum tercihlerinizi ayarlayin
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-4 border-2 transition-all flex flex-col items-center gap-2 ${
                          theme === 'light'
                            ? 'border-[var(--ecu-accent)] bg-[var(--ecu-accent-bg)]'
                            : 'border-[var(--ecu-border)] hover:border-[var(--ecu-border-accent)]'
                        }`}
                      >
                        <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-[var(--ecu-accent)]' : 'text-[var(--ecu-text-muted)]'}`} />
                        <span className="text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider text-[var(--ecu-text)]">
                          Acik Tema
                        </span>
                      </button>

                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-4 border-2 transition-all flex flex-col items-center gap-2 ${
                          theme === 'dark'
                            ? 'border-[var(--ecu-accent)] bg-[var(--ecu-accent-bg)]'
                            : 'border-[var(--ecu-border)] hover:border-[var(--ecu-border-accent)]'
                        }`}
                      >
                        <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-[var(--ecu-accent)]' : 'text-[var(--ecu-text-muted)]'}`} />
                        <span className="text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider text-[var(--ecu-text)]">
                          Koyu Tema
                        </span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Password Change Card */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>// Sifre Degistir</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-[family-name:var(--font-heading)] font-medium text-[var(--ecu-text-secondary)] mb-1.5 uppercase tracking-wider">
                          Mevcut Sifre
                        </label>
                        <Input
                          type="password"
                          value={passwords.current}
                          onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                          placeholder="********"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-[family-name:var(--font-heading)] font-medium text-[var(--ecu-text-secondary)] mb-1.5 uppercase tracking-wider">
                          Yeni Sifre
                        </label>
                        <Input
                          type="password"
                          value={passwords.newPass}
                          onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                          placeholder="********"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-[family-name:var(--font-heading)] font-medium text-[var(--ecu-text-secondary)] mb-1.5 uppercase tracking-wider">
                          Yeni Sifre (Tekrar)
                        </label>
                        <Input
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                          placeholder="********"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Button type="submit" variant="outline" className="gap-2">
                          <Lock className="w-4 h-4" />
                          SIFRE DEGISTIR
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
