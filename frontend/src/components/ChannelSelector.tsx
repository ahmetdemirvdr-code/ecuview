import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, Check, X } from 'lucide-react';
import { useAppStore } from '../store';
import { CATEGORY_LABELS, CHART_COLORS } from '../types';
import type { ChannelInfo } from '../types';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export default function ChannelSelector() {
  const { selectedFile, selectedChannels, toggleChannel, setSelectedChannels, clearChannels } = useAppStore();
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['engine', 'injection', 'temperature']));

  const channels = selectedFile?.channels || [];

  const grouped = useMemo(() => {
    const groups: Record<string, ChannelInfo[]> = {};
    const filtered = channels.filter(
      (ch) =>
        ch.name.toLowerCase().includes(search.toLowerCase()) ||
        (ch.unit && ch.unit.toLowerCase().includes(search.toLowerCase()))
    );

    for (const ch of filtered) {
      const cat = ch.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(ch);
    }

    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [channels, search]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const selectAllInCategory = (catChannels: ChannelInfo[]) => {
    const names = catChannels.map((ch) => ch.name);
    const allSelected = names.every((n) => selectedChannels.includes(n));
    if (allSelected) {
      setSelectedChannels(selectedChannels.filter((n) => !names.includes(n)));
    } else {
      const newChannels = [...new Set([...selectedChannels, ...names])];
      setSelectedChannels(newChannels);
    }
  };

  if (!selectedFile) {
    return (
      <div className="text-center py-8 text-[var(--ecu-text-muted)]">
        <p className="text-xs data-mono">Bir dosya secin</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ecu-text-muted)]" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kanal ara..."
          className="pl-9 h-8 text-xs"
        />
      </div>

      {/* Selection info */}
      <div className="flex items-center justify-between text-xs">
        <span className="data-mono text-[var(--ecu-text-muted)]">{selectedChannels.length} secili</span>
        {selectedChannels.length > 0 && (
          <button
            onClick={clearChannels}
            className="flex items-center gap-1 text-[var(--ecu-danger)] hover:underline text-xs"
          >
            <X className="w-3 h-3" />
            Temizle
          </button>
        )}
      </div>

      {/* Selected channels tags */}
      {selectedChannels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedChannels.map((name, idx) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium cursor-pointer hover:opacity-80 border-l-2 bg-[var(--ecu-surface-2)]"
              style={{
                borderLeftColor: CHART_COLORS[idx % CHART_COLORS.length],
                color: CHART_COLORS[idx % CHART_COLORS.length],
              }}
              onClick={() => toggleChannel(name)}
            >
              {name}
              <X className="w-2.5 h-2.5 opacity-60" />
            </span>
          ))}
        </div>
      )}

      {/* Channel groups */}
      <div className="space-y-1 max-h-[calc(100vh-400px)] overflow-y-auto pr-1">
        {grouped.map(([category, catChannels]) => {
          const isExpanded = expandedCategories.has(category);
          const selectedInCat = catChannels.filter((ch) => selectedChannels.includes(ch.name)).length;

          return (
            <div key={category} className="border border-[var(--ecu-border)] overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[var(--ecu-surface-2)] hover:bg-[var(--ecu-surface-3)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--ecu-text-muted)]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ecu-text-muted)]" />
                  )}
                  <span className="text-xs font-medium text-[var(--ecu-text)] font-[family-name:var(--font-heading)] uppercase tracking-wider">
                    {CATEGORY_LABELS[category] || category}
                  </span>
                  <span className="data-mono text-[10px] text-[var(--ecu-text-muted)]">({catChannels.length})</span>
                </div>
                {selectedInCat > 0 && (
                  <Badge variant="default" className="text-[9px] py-0 px-1">
                    {selectedInCat}
                  </Badge>
                )}
              </button>

              {/* Channel list */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-[var(--ecu-border)]"
                  >
                    {/* Select all */}
                    <button
                      onClick={() => selectAllInCategory(catChannels)}
                      className="w-full text-left px-2.5 py-1 text-[10px] text-[var(--ecu-accent)] hover:bg-[var(--ecu-surface-2)] font-[family-name:var(--font-heading)] uppercase tracking-wider"
                    >
                      Tumunu sec/kaldir
                    </button>

                    {catChannels.map((ch) => {
                      const isSelected = selectedChannels.includes(ch.name);
                      const colorIdx = selectedChannels.indexOf(ch.name);
                      const color = colorIdx >= 0 ? CHART_COLORS[colorIdx % CHART_COLORS.length] : undefined;

                      return (
                        <button
                          key={`${ch.name}-${ch.group_index}`}
                          onClick={() => toggleChannel(ch.name)}
                          className={`w-full text-left px-2.5 py-1.5 flex items-center gap-2 hover:bg-[var(--ecu-surface-2)] transition-colors ${
                            isSelected ? 'bg-[var(--ecu-accent-bg)]' : ''
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center ${
                              isSelected ? '' : 'border-[var(--ecu-border-accent)]'
                            }`}
                            style={isSelected && color ? { borderColor: color, backgroundColor: color } : {}}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] text-[var(--ecu-text)] truncate block">{ch.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] data-mono text-[var(--ecu-text-muted)] flex-shrink-0">
                            {ch.unit && <span className="text-[var(--ecu-text-secondary)]">{ch.unit}</span>}
                            <span>{ch.sample_count}</span>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
