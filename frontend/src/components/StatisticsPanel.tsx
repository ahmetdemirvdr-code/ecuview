import { useState, useEffect } from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { analysisAPI } from '../api';
import { useAppStore } from '../store';
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
    <div className="border-t border-slate-700 bg-slate-800/30">
      <div className="px-4 py-2 flex items-center gap-2 border-b border-slate-700/50">
        <FiBarChart2 className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-slate-200">Istatistikler</span>
      </div>

      {loading ? (
        <div className="p-4 text-center text-sm text-slate-500">Hesaplaniyor...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700/50">
                <th className="text-left px-3 py-2 font-medium">Kanal</th>
                <th className="text-right px-3 py-2 font-medium">Birim</th>
                <th className="text-right px-3 py-2 font-medium">Min</th>
                <th className="text-right px-3 py-2 font-medium">Max</th>
                <th className="text-right px-3 py-2 font-medium">Ortalama</th>
                <th className="text-right px-3 py-2 font-medium">Std</th>
                <th className="text-right px-3 py-2 font-medium">Medyan</th>
                <th className="text-right px-3 py-2 font-medium">Ornekler</th>
                <th className="text-right px-3 py-2 font-medium">Hz</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.name} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="px-3 py-1.5 text-slate-200 font-medium">{s.name}</td>
                  <td className="text-right px-3 py-1.5 text-slate-400">{s.unit || '-'}</td>
                  <td className="text-right px-3 py-1.5 text-blue-300">{s.min.toFixed(4)}</td>
                  <td className="text-right px-3 py-1.5 text-red-300">{s.max.toFixed(4)}</td>
                  <td className="text-right px-3 py-1.5 text-green-300">{s.mean.toFixed(4)}</td>
                  <td className="text-right px-3 py-1.5 text-slate-300">{s.std.toFixed(4)}</td>
                  <td className="text-right px-3 py-1.5 text-amber-300">{s.median.toFixed(4)}</td>
                  <td className="text-right px-3 py-1.5 text-slate-400">{s.sample_count.toLocaleString()}</td>
                  <td className="text-right px-3 py-1.5 text-slate-400">{s.sample_rate.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
