import { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Maximize2, Download, BarChart3, ZoomIn } from 'lucide-react';
import { analysisAPI } from '../api';
import { useAppStore, useThemeStore } from '../store';
import { CHART_COLORS } from '../types';
import type { SignalData } from '../types';
import { Button } from './ui/button';
import { SkeletonChart } from './ui/Skeleton';
import toast from 'react-hot-toast';

export default function SignalChart() {
  const { selectedFile, selectedChannels } = useAppStore();
  const { theme } = useThemeStore();
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

  const isDark = theme === 'dark';

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
    const bgColor = isDark ? 'rgba(10, 10, 15, 0)' : 'rgba(245, 245, 240, 0)';
    const plotBgColor = isDark ? 'rgba(26, 26, 46, 0.5)' : 'rgba(240, 240, 235, 0.5)';
    const gridColor = isDark ? '#1e1e38' : '#e2e2dd';
    const zerolineColor = isDark ? '#2a2a45' : '#d4d4cc';
    const textColor = isDark ? '#8888a0' : '#55556e';
    const legendBg = isDark ? 'rgba(26, 26, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    const legendText = isDark ? '#e8e8f0' : '#1a1a2e';

    const yAxes: Record<string, any> = {};

    signals.forEach((sig, idx) => {
      const key = idx === 0 ? 'yaxis' : `yaxis${idx + 1}`;
      const isLeft = idx % 2 === 0;

      yAxes[key] = {
        title: {
          text: `${sig.name}${sig.unit ? ` (${sig.unit})` : ''}`,
          font: { size: 10, color: CHART_COLORS[idx % CHART_COLORS.length], family: 'JetBrains Mono, monospace' },
        },
        titlefont: { color: CHART_COLORS[idx % CHART_COLORS.length] },
        tickfont: { color: CHART_COLORS[idx % CHART_COLORS.length], size: 9, family: 'JetBrains Mono, monospace' },
        side: isLeft ? 'left' : 'right',
        overlaying: idx > 0 ? 'y' : undefined,
        position: isLeft ? Math.max(0, idx * 0.06) : undefined,
        anchor: idx > 1 ? 'free' : undefined,
        gridcolor: gridColor,
        zerolinecolor: zerolineColor,
      };
    });

    return {
      ...yAxes,
      xaxis: {
        title: { text: 'Zaman (s)', font: { size: 11, color: textColor, family: 'JetBrains Mono, monospace' } },
        tickfont: { size: 9, color: textColor, family: 'JetBrains Mono, monospace' },
        gridcolor: gridColor,
        zerolinecolor: zerolineColor,
        rangeslider: { visible: true, thickness: 0.06 },
      },
      paper_bgcolor: bgColor,
      plot_bgcolor: plotBgColor,
      font: { color: textColor, family: 'JetBrains Mono, monospace' },
      legend: {
        orientation: 'h' as const,
        yanchor: 'bottom' as const,
        y: 1.02,
        xanchor: 'center' as const,
        x: 0.5,
        font: { size: 10, color: legendText, family: 'JetBrains Mono, monospace' },
        bgcolor: legendBg,
        bordercolor: isDark ? '#2a2a45' : '#d4d4cc',
        borderwidth: 1,
      },
      margin: { l: 60, r: 60, t: 40, b: 60 },
      hovermode: 'x unified' as const,
      dragmode: 'zoom' as const,
    };
  }, [signals, isDark]);

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
      <div className="flex-1 flex items-center justify-center text-[var(--ecu-text-muted)]">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="heading-industrial text-sm tracking-wider">Sol panelden bir dosya secin</p>
          <p className="text-xs mt-1 data-mono">MDF/DAT dosyalari yukleyip analiz edin</p>
        </div>
      </div>
    );
  }

  if (selectedChannels.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--ecu-text-muted)]">
        <div className="text-center">
          <ZoomIn className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="heading-industrial text-sm tracking-wider">Kanal secimi yapin</p>
          <p className="text-xs mt-1 data-mono">Grafik olusturmak icin sol panelden kanal(lar) secin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-[var(--ecu-border)]">
        <div className="flex items-center gap-2">
          <span className="data-mono text-xs text-[var(--ecu-text-secondary)]">
            {signals.length} sinyal | {selectedFile.original_filename}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setChartHeight((h) => Math.min(h + 100, 900))}
            title="Grafigi buyut"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-2">
        {loading ? (
          <SkeletonChart />
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
        <div className="border-t-2 border-[var(--ecu-border)] px-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {signals.map((sig, idx) => (
              <div
                key={sig.name}
                className="flex items-center gap-2 text-xs border-l-2 pl-2"
                style={{ borderLeftColor: CHART_COLORS[idx % CHART_COLORS.length] }}
              >
                <span className="font-medium truncate text-[var(--ecu-text)]" style={{ color: CHART_COLORS[idx % CHART_COLORS.length] }}>
                  {sig.name}
                </span>
                <span className="data-mono text-[10px] text-[var(--ecu-text-muted)] flex-shrink-0">
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
