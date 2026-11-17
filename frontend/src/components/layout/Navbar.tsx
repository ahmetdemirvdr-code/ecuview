import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, LogOut, Settings, Home, BarChart3, Info, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store';
import ThemeToggle from '../ui/ThemeToggle';
import BrandLogo from '../BrandLogo';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';

const navLinks = [
  { to: '/', label: 'Ana Sayfa', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/about', label: 'Hakkinda', icon: Info },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <header className="h-12 border-b-2 border-[var(--ecu-border)] bg-[var(--ecu-surface)] flex items-center justify-between px-4 flex-shrink-0 relative z-30">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center group" aria-label="ECUView ana sayfa">
          <BrandLogo size="compact" className="opacity-95 group-hover:opacity-100 transition-opacity" />
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(link.to);
            const Icon = link.icon;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors font-[family-name:var(--font-heading)] uppercase tracking-wider ${
                  isActive
                    ? 'text-[var(--ecu-accent)]'
                    : 'text-[var(--ecu-text-muted)] hover:text-[var(--ecu-text)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-[var(--ecu-accent)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Theme toggle + User dropdown */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1.5 text-sm border border-[var(--ecu-border)] hover:border-[var(--ecu-accent)] bg-[var(--ecu-surface-2)] transition-colors">
              <div className="w-6 h-6 bg-[var(--ecu-accent-bg)] border border-[var(--ecu-accent)] flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-[var(--ecu-accent)]" />
              </div>
              <span className="hidden sm:inline text-xs font-medium text-[var(--ecu-text)] font-[family-name:var(--font-heading)] uppercase tracking-wider">
                {user?.full_name || user?.username || 'Kullanici'}
              </span>
              <ChevronDown className="w-3 h-3 text-[var(--ecu-text-muted)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{user?.email || 'Kullanici'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <Settings className="w-4 h-4" />
              <span>Profil & Ayarlar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/about')}>
              <Info className="w-4 h-4" />
              <span>Hakkinda</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-[var(--ecu-danger)]">
              <LogOut className="w-4 h-4" />
              <span>Cikis Yap</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
