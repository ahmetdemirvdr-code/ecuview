import { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { FiZoomIn, FiMaximize2, FiDownload, FiBarChart2 } from 'react-icons/fi';
import { analysisAPI } from '../api';
import { useAppStore } from '../store';
import { CHART_COLORS } from '../types';
import type { SignalData } from '../types';
import toast from 'react-hot-toast';

export default function SignalChart() {
  const { selectedFile, selectedChannels } = useAppStore();
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartHeight, setChartHeight] = useState(500);

  useEffect(() => {
    if (!selectedFile || selectedChannels.length === 0) {
      setSignals([]);
      return;
    }

    const fetchSignals = async () => {
      setLoading(true);
      try {
        const data = await analysisAPI.getSignals(selectedFile.id, selectedChannels, {
          downsample: 5000,
        });
        setSignals(data);
      } catch (err: any) {
        toast.error('Sinyal verileri alinamadi');
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, [selectedFile?.id, selectedChannels]);

  const plotData = useMemo(() => {
    return signals.map((sig, idx) => ({
      x: sig.timestamps,
      y: sig.values,
      type: 'scattergl' as const,
      mode: 'lines' as const,
      name: `${sig.name}${sig.unit ? ` (${sig.unit})` : ''}`,
      line: {
        color: CHART_COLORS[idx % CHART_COLORS.length],
        width: 1.5,
      },
      yaxis: signals.length > 1 && idx > 0 ? `y${idx + 1}` : 'y',
      hovertemplate: `%{y:.4f}${sig.unit ? ' ' + sig.unit : ''}<br>%{x:.3f}s<extra>${sig.name}</extra>`,
    }));
  }, [signals]);

  const layout = useMemo(() => {
    const yAxes: Record<string, any> = {};

    signals.forEach((sig, idx) => {
      const key = idx === 0 ? 'yaxis' : `yaxis${idx + 1}`;
      const isLeft = idx % 2 === 0;

      yAxes[key] = {
        title: {
          text: `${sig.name}${sig.unit ? ` (${sig.unit})` : ''}`,
          font: { size: 10, color: CHART_COLORS[idx % CHART_COLORS.length] },
        },
        titlefont: { color: CHART_COLORS[idx % CHART_COLORS.length] },
        tickfont: { color: CHART_COLORS[idx % CHART_COLORS.length], size: 9 },
        side: isLeft ? 'left' : 'right',
        overlaying: idx > 0 ? 'y' : undefined,
        position: isLeft ? Math.max(0, idx * 0.06) : undefined,
        anchor: idx > 1 ? 'free' : undefined,
        gridcolor: '#1e293b',
        zerolinecolor: '#334155',
      };
    });

    return {
      ...yAxes,
      xaxis: {
        title: { text: 'Zaman (s)', font: { size: 11, color: '#94a3b8' } },
        tickfont: { size: 9, color: '#94a3b8' },
        gridcolor: '#1e293b',
        zerolinecolor: '#334155',
        rangeslider: { visible: true, thickness: 0.06 },
      },
      paper_bgcolor: 'rgba(15, 23, 42, 0)',
      plot_bgcolor: 'rgba(30, 41, 59, 0.5)',
      font: { color: '#94a3b8' },
      legend: {
        orientation: 'h' as const,
        yanchor: 'bottom' as const,
        y: 1.02,
        xanchor: 'center' as const,
        x: 0.5,
        font: { size: 10, color: '#e2e8f0' },
        bgcolor: 'rgba(30, 41, 59, 0.8)',
      },
      margin: { l: 60, r: 60, t: 40, b: 60 },
      hovermode: 'x unified' as const,
      dragmode: 'zoom' as const,
    };
  }, [signals]);

  const handleExport = async () => {
    if (!selectedFile || selectedChannels.length === 0) return;

    try {
      const blob = await analysisAPI.exportData(selectedFile.id, selectedChannels);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile.original_filename.replace(/\.[^.]+$/, '')}_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV dosyasi indirildi');
    } catch {
      toast.error('Disa aktarma basarisiz');
    }
  };

  if (!selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <FiBarChart2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Sol panelden bir dosya secin</p>
          <p className="text-sm mt-1">MDF/DAT dosyalari yukleyip analiz edin</p>
        </div>
      </div>
    );
  }

  if (selectedChannels.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <FiZoomIn className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Kanal secimi yapin</p>
          <p className="text-sm mt-1">Grafik olusturmak icin sol panelden kanal(lar) secin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">
            {signals.length} sinyal  |  {selectedFile.original_filename}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartHeight((h) => Math.min(h + 100, 900))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
            title="Grafigi buyut"
          >
            <FiMaximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <Plot
            data={plotData as any}
            layout={layout as any}
            config={{
              responsive: true,
              displayModeBar: true,
              modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              displaylogo: false,
              scrollZoom: true,
            }}
            style={{ width: '100%', height: `${chartHeight}px` }}
          />
        )}
      </div>

      {/* Statistics bar */}
      {signals.length > 0 && (
        <div className="border-t border-slate-700 px-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {signals.map((sig, idx) => (
              <div
                key={sig.name}
                className="flex items-center gap-2 text-xs"
                style={{ color: CHART_COLORS[idx % CHART_COLORS.length] }}
              >
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                />
                <span className="font-medium truncate">{sig.name}</span>
                <span className="text-slate-400 flex-shrink-0">
                  Min:{sig.min.toFixed(2)} Max:{sig.max.toFixed(2)} Ort:{sig.mean.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
