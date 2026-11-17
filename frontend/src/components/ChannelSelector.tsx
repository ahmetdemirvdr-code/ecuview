import { useState, useMemo } from 'react';
import { FiSearch, FiChevronDown, FiChevronRight, FiCheck } from 'react-icons/fi';
import { useAppStore } from '../store';
import { CATEGORY_LABELS, CHART_COLORS } from '../types';
import type { ChannelInfo } from '../types';

export default function ChannelSelector() {
  const { selectedFile, selectedChannels, toggleChannel, setSelectedChannels, clearChannels } = useAppStore();
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['engine', 'injection', 'temperature']));

  const channels = selectedFile?.channels || [];

  // Group channels by category
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

    // Sort categories by count (descending)
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
      <div className="text-center py-8 text-slate-500">
        <p className="text-sm">Bir dosya secin</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kanal ara..."
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Selection info */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{selectedChannels.length} kanal secili</span>
        {selectedChannels.length > 0 && (
          <button onClick={clearChannels} className="text-red-400 hover:text-red-300">
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
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: `${CHART_COLORS[idx % CHART_COLORS.length]}20`,
                color: CHART_COLORS[idx % CHART_COLORS.length],
                borderLeft: `3px solid ${CHART_COLORS[idx % CHART_COLORS.length]}`,
              }}
              onClick={() => toggleChannel(name)}
            >
              {name}
              <span className="ml-1 opacity-60">&times;</span>
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
            <div key={category} className="border border-slate-700/50 rounded-lg overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <FiChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <FiChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm font-medium text-slate-200">
                    {CATEGORY_LABELS[category] || category}
                  </span>
                  <span className="text-xs text-slate-500">({catChannels.length})</span>
                </div>
                {selectedInCat > 0 && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                    {selectedInCat}
                  </span>
                )}
              </button>

              {/* Channel list */}
              {isExpanded && (
                <div className="border-t border-slate-700/50">
                  {/* Select all in category */}
                  <button
                    onClick={() => selectAllInCategory(catChannels)}
                    className="w-full text-left px-3 py-1.5 text-xs text-blue-400 hover:bg-slate-700/30"
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
                        className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-700/30 transition-colors ${
                          isSelected ? 'bg-blue-500/10' : ''
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                          }`}
                          style={isSelected && color ? { borderColor: color, backgroundColor: color } : {}}
                        >
                          {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs text-slate-200 truncate block">{ch.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-shrink-0">
                          {ch.unit && <span className="text-slate-400">{ch.unit}</span>}
                          <span>{ch.sample_count}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
