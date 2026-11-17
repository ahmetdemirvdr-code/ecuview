import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 flex items-center justify-center rounded border transition-colors
        border-[var(--ecu-border)] hover:border-[var(--ecu-accent)]
        bg-[var(--ecu-surface-2)] hover:bg-[var(--ecu-surface-3)]"
      title={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      aria-label="Tema değiştir"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-[var(--ecu-accent)]" />
        ) : (
          <Moon className="w-4 h-4 text-[var(--ecu-accent)]" />
        )}
      </motion.div>
    </button>
  );
}
