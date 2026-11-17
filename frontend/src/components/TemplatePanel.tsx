import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { templatesAPI } from '../api';
import { useAppStore } from '../store';
import toast from 'react-hot-toast';
import type { Template, TemplateConfig } from '../types';

export default function TemplatePanel() {
  const { templates, setTemplates, selectedFile, setSelectedChannels } = useAppStore();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await templatesAPI.list();
      setTemplates(data);
    } catch {
      // Templates will be empty
    }
  };

  const applyTemplate = (template: Template) => {
    if (!selectedFile) {
      toast.error('Once bir dosya secin');
      return;
    }

    try {
      const config: TemplateConfig = JSON.parse(template.config);
      const channelNames = config.channels.map((ch) => ch.name);

      const fileChannelNames = selectedFile.channels.map((ch) => ch.name);
      const available = channelNames.filter((n) => fileChannelNames.includes(n));
      const missing = channelNames.filter((n) => !fileChannelNames.includes(n));

      if (available.length === 0) {
        toast.error('Bu sablondaki kanallar dosyada bulunamadi');
        return;
      }

      setSelectedChannels(available);

      if (missing.length > 0) {
        toast(`${missing.length} kanal dosyada bulunamadi`, { icon: 'i' });
      }

      toast.success(`${template.name} sablonu uygulandi`);
    } catch {
      toast.error('Sablon uygulanamadi');
    }
  };

  const categoryIcons: Record<string, string> = {
    engine: 'M',
    injection: 'E',
    rail: 'R',
    temperature: 'S',
    pressure: 'B',
    vehicle: 'A',
    protection: 'K',
  };

  return (
    <div className="space-y-2">
      <h3 className="heading-industrial text-[10px] text-[var(--ecu-text-muted)] tracking-widest px-1">
        // ANALIZ SABLONLARI
      </h3>

      {templates.length === 0 ? (
        <p className="text-xs text-[var(--ecu-text-muted)] px-1 data-mono">Sablon yukleniyor...</p>
      ) : (
        <div className="space-y-1">
          {templates.map((tpl, idx) => (
            <motion.button
              key={tpl.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => applyTemplate(tpl)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 border border-[var(--ecu-border)]
                hover:border-[var(--ecu-accent)] transition-all text-left group bg-[var(--ecu-surface-2)]"
            >
              <div className="w-7 h-7 border border-[var(--ecu-accent)] bg-[var(--ecu-accent-bg)] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-[var(--ecu-accent)] font-[family-name:var(--font-heading)]">
                  {categoryIcons[tpl.category || ''] || 'T'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--ecu-text)] truncate font-medium">{tpl.name}</p>
                <p className="text-[10px] text-[var(--ecu-text-muted)] truncate">{tpl.description}</p>
              </div>
              <Play className="w-3 h-3 text-[var(--ecu-text-muted)] group-hover:text-[var(--ecu-accent)] flex-shrink-0 transition-colors" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
