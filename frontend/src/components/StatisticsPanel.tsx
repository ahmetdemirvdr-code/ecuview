import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { analysisAPI } from '../api';
import { useAppStore } from '../store';
import { SkeletonTable } from './ui/Skeleton';
import type { ChannelStatistics } from '../types';

export default function StatisticsPanel() {
  const { selectedFile, selectedChannels } = useAppStore();
  const [stats, setStats] = useState<ChannelStatistics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedFile || selectedChannels.length === 0) {
      setStats([]);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await analysisAPI.getStatistics(selectedFile.id, selectedChannels);
        setStats(data);
      } catch {
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedFile?.id, selectedChannels]);

  if (!selectedFile || selectedChannels.length === 0) return null;

  return (
    <div className="border-t-2 border-[var(--ecu-border)] bg-[var(--ecu-surface)]">
      <div className="px-4 py-2 flex items-center gap-2 border-b border-[var(--ecu-border)]">
        <BarChart3 className="w-4 h-4 text-[var(--ecu-accent)]" />
        <span className="heading-industrial text-[10px] text-[var(--ecu-text)] tracking-widest">
          // ISTATISTIKLER
        </span>
      </div>

      {loading ? (
        <SkeletonTable rows={3} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[var(--ecu-text-muted)] border-b border-[var(--ecu-border)]">
                <th className="text-left px-3 py-2 font-[family-name:var(--font-heading)] font-medium uppercase tracking-wider text-[10px]">Kanal</th>
                <th className="text-right px-3 py-2 font-[family-name:var(--font-heading)] font-medium uppercase tracking-wider text-[10px]">Birim</th>
                <th className="text-right px-3 py-2 font-[family-name:var(--font-heading)] font-medium uppercase tracking-wider text-[10px]">Min</th>
                <th className="text-right px-3 py-2 font-[family-name:var(--font-heading)] font-medium uppercase tracking-wider text-[10px]">Max</th>
                <th className="text-right px-3 py-2 font-[family-name:var(--font-heading)] font-medium uppercase tracking-wider text-[10px]">Ortalama</th>
                <th className="text-right px-3 py-2 font-[family-name:var(--font-heading)] font-medium uppercase tracking-wider text-[10px]">Std</th>
                <th className="text-right px-3 py-2 font-[family-name:var(--font-heading)] font-medium uppercase tracking-wider text-[10px]">Medyan</th>
                <th className="text-right px-3 py-2 font-[family-name:var(--font-heading)] font-medium uppercase tracking-wider text-[10px]">Ornekler</th>
                <th className="text-right px-3 py-2 font-[family-name:var(--font-heading)] font-medium uppercase tracking-wider text-[10px]">Hz</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.name} className="border-b border-[var(--ecu-border)] hover:bg-[var(--ecu-surface-2)] transition-colors">
                  <td className="px-3 py-1.5 text-[var(--ecu-text)] font-medium">{s.name}</td>
                  <td className="text-right px-3 py-1.5 text-[var(--ecu-text-muted)] data-mono">{s.unit || '-'}</td>
                  <td className="text-right px-3 py-1.5 text-[var(--ecu-info)] data-mono">{s.min.toFixed(4)}</td>
                  <td className="text-right px-3 py-1.5 text-[var(--ecu-danger)] data-mono">{s.max.toFixed(4)}</td>
                  <td className="text-right px-3 py-1.5 text-[var(--ecu-success)] data-mono">{s.mean.toFixed(4)}</td>
                  <td className="text-right px-3 py-1.5 text-[var(--ecu-text)] data-mono">{s.std.toFixed(4)}</td>
                  <td className="text-right px-3 py-1.5 text-[var(--ecu-accent)] data-mono">{s.median.toFixed(4)}</td>
                  <td className="text-right px-3 py-1.5 text-[var(--ecu-text-muted)] data-mono">{s.sample_count.toLocaleString()}</td>
                  <td className="text-right px-3 py-1.5 text-[var(--ecu-text-muted)] data-mono">{s.sample_rate.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
