import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store';
import { authAPI } from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Kullanici adi ve sifre gerekli');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.login(username, password);
      login(data.access_token, data.user);
      toast.success('Giris basarili!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Giris basarisiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ecu-bg)] industrial-grid px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-3 mb-3"
          >
            <div className="w-12 h-12 border-2 border-[var(--ecu-accent)] bg-[var(--ecu-accent-bg)] flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2L18.5 5.5L22.5 4.5L23.5 8.5L27.5 8.5L27 12.5L30.5 14.5L28.5 18L31 21L28 23.5L29 27.5L25.5 28L24 31.5L20.5 29.5L16 31L11.5 29.5L8 31.5L6.5 28L3 27.5L4 23.5L1 21L3.5 18L1.5 14.5L5 12.5L4.5 8.5L8.5 8.5L9.5 4.5L13.5 5.5L16 2Z"
                  stroke="var(--ecu-text-secondary)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 18H11L13 12L16 22L19 14L21 18H24"
                  stroke="var(--ecu-accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="heading-industrial text-3xl text-[var(--ecu-text)] tracking-widest">
              ECU<span className="text-[var(--ecu-accent)]">View</span>
            </h1>
          </motion.div>
          <p className="text-[var(--ecu-text-secondary)] text-sm font-[family-name:var(--font-mono)]">
            Motor ECU Veri Analiz Platformu
          </p>
        </div>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          onSubmit={handleSubmit}
          className="bg-[var(--ecu-surface)] border-2 border-[var(--ecu-border)] p-8 space-y-5 relative"
        >
          {/* Accent corner markers */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--ecu-accent)]" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--ecu-accent)]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--ecu-accent)]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--ecu-accent)]" />

          <h2 className="heading-industrial text-lg text-[var(--ecu-text)] text-center tracking-widest">
            // GIRIS YAP
          </h2>

          <div>
            <label className="block text-xs font-[family-name:var(--font-heading)] font-medium text-[var(--ecu-text-secondary)] mb-1.5 uppercase tracking-wider">
              Kullanici Adi
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="kullaniciadi"
            />
          </div>

          <div>
            <label className="block text-xs font-[family-name:var(--font-heading)] font-medium text-[var(--ecu-text-secondary)] mb-1.5 uppercase tracking-wider">
              Sifre
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'GIRIS YAPILIYOR...' : 'GIRIS YAP'}
          </Button>

          <p className="text-center text-sm text-[var(--ecu-text-secondary)]">
            Hesabiniz yok mu?{' '}
            <Link to="/register" className="text-[var(--ecu-accent)] hover:underline font-medium">
              Kayit Ol
            </Link>
          </p>
        </motion.form>

        {/* Version info */}
        <div className="text-center mt-4">
          <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--ecu-text-muted)]">
            v1.0.0 // INDUSTRIAL DATA PLATFORM
          </span>
        </div>
      </motion.div>
    </div>
  );
}
