import { motion } from 'framer-motion';
import { Code, Database, BarChart3, Shield, Cpu, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/layout/Navbar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const technologies = [
  { name: 'React 19', category: 'Frontend', icon: Code },
  { name: 'TypeScript 7', category: 'Dil', icon: Code },
  { name: 'Tailwind CSS v4', category: 'Stil', icon: Code },
  { name: 'Vite 8', category: 'Build', icon: Gauge },
  { name: 'Framer Motion', category: 'Animasyon', icon: BarChart3 },
  { name: 'Plotly.js', category: 'Grafik', icon: BarChart3 },
  { name: 'FastAPI', category: 'Backend', icon: Database },
  { name: 'PostgreSQL', category: 'Veritabani', icon: Database },
  { name: 'Docker', category: 'Deploy', icon: Shield },
  { name: 'Zustand', category: 'State', icon: Cpu },
];

export default function AboutPage() {
  return (
    <div className="h-screen flex flex-col bg-[var(--ecu-bg)]">
      <Navbar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="heading-industrial text-2xl text-[var(--ecu-text)] tracking-wider mb-2">
                // HAKKINDA
              </h1>
              <p className="text-[var(--ecu-text-secondary)] font-[family-name:var(--font-mono)] text-sm">
                ECUView Motor ECU Veri Analiz Platformu
              </p>
            </motion.div>

            {/* Main Info Card */}
            <motion.div variants={itemVariants} className="mb-6">
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--ecu-accent)]" />
                <CardContent className="p-8 pl-6">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 border-2 border-[var(--ecu-accent)] bg-[var(--ecu-accent-bg)] flex items-center justify-center flex-shrink-0">
                      <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
                        <path
                          d="M16 2L18.5 5.5L22.5 4.5L23.5 8.5L27.5 8.5L27 12.5L30.5 14.5L28.5 18L31 21L28 23.5L29 27.5L25.5 28L24 31.5L20.5 29.5L16 31L11.5 29.5L8 31.5L6.5 28L3 27.5L4 23.5L1 21L3.5 18L1.5 14.5L5 12.5L4.5 8.5L8.5 8.5L9.5 4.5L13.5 5.5L16 2Z"
                          stroke="var(--ecu-text-secondary)"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 18H11L13 12L16 22L19 14L21 18H24"
                          stroke="var(--ecu-accent)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="heading-industrial text-xl text-[var(--ecu-text)] tracking-wider mb-2">
                        ECU<span className="text-[var(--ecu-accent)]">View</span>
                      </h2>
                      <p className="text-sm text-[var(--ecu-text-secondary)] leading-relaxed mb-4">
                        ECUView, motor ECU (Electronic Control Unit) verilerini analiz etmek icin gelistirilmis
                        profesyonel bir veri analiz platformudur. MDF, DAT ve CSV formatindaki dosyalari
                        yukleyebilir, kanal bazli sinyal analizi yapabilir, istatistiksel veriler elde edebilir
                        ve grafik goruntuleyici ile verileri gorsellestirebilirsiniz.
                      </p>
                      <div className="flex items-center gap-3">
                        <Badge variant="default">v1.0.0</Badge>
                        <Badge variant="secondary">Stabil</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features */}
            <motion.div variants={itemVariants} className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>// Ozellikler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'MDF/DAT/CSV dosya formati destegi',
                      'Coklu kanal sinyal analizi',
                      'Interaktif grafik goruntuleyici',
                      'Istatistiksel analiz (min, max, ort, std)',
                      'Sablon bazli hizli analiz',
                      'CSV disa aktarma',
                      'Acik/Koyu tema destegi',
                      'Mobil uyumlu arayuz',
                    ].map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 border-l-2 border-[var(--ecu-accent)] pl-3"
                      >
                        <span className="data-mono text-[10px] text-[var(--ecu-text-muted)]">
                          [{String(idx + 1).padStart(2, '0')}]
                        </span>
                        <span className="text-sm text-[var(--ecu-text)]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Technologies */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>// Kullanilan Teknolojiler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {technologies.map((tech) => {
                      const Icon = tech.icon;
                      return (
                        <div
                          key={tech.name}
                          className="p-3 border border-[var(--ecu-border)] bg-[var(--ecu-surface-2)] hover:border-[var(--ecu-accent)] transition-colors text-center"
                        >
                          <Icon className="w-5 h-5 mx-auto mb-2 text-[var(--ecu-accent)]" />
                          <p className="text-xs font-medium text-[var(--ecu-text)]">{tech.name}</p>
                          <p className="text-[10px] text-[var(--ecu-text-muted)]">{tech.category}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
