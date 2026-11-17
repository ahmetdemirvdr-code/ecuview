import { useEffect } from 'react';
import { FiPlay } from 'react-icons/fi';
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

      // Check which channels exist in the current file
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
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
        Analiz Sablonlari
      </h3>

      {templates.length === 0 ? (
        <p className="text-xs text-slate-500 px-1">Sablon yukleniyor...</p>
      ) : (
        <div className="space-y-1">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-700/50 transition-colors text-left group"
            >
              <div className="w-7 h-7 rounded-md bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-400">
                  {categoryIcons[tpl.category || ''] || 'T'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200 truncate">{tpl.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{tpl.description}</p>
              </div>
              <FiPlay className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
