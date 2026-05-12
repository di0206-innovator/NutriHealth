import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, Calendar, TrendingUp, AlertCircle, CheckCircle2, ChevronRight, Activity, Brain, Loader2, Zap, Shield, BarChart3 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function Reports({ profile, user }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/report/weekly?user_id=${user.uid}`);
        const result = await response.json();
        
        if (result.success) {
          setReportData(result.data);
        } else {
          if (result.error === 'no_data') {
            setError({ type: 'no_data', message: result.message, suggestion: result.suggestion });
          } else {
            throw new Error(result.message || 'Failed to fetch report');
          }
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError({ type: 'error', message: 'Metabolic analysis failed. Please try again later.' });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [user?.uid]);

  const exportPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const now = new Date().toLocaleDateString();

    doc.setFontSize(22);
    doc.setTextColor(255, 45, 85); 
    doc.text('NutriLens: Metabolic Analysis Export', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${now}`, 20, 28);
    doc.text(`Client ID: ${profile?.name || user?.email || 'Anonymous User'}`, 20, 33);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('30-Day Nutritional Summary', 20, 45);
    
    const summaryData = [
      ['Metric', 'Value'],
      ['Average Health Score', `${reportData.averages.health_score}/10`],
      ['Total Calories Avg', `${reportData.averages.calories} kcal`],
      ['Protein Avg', `${reportData.averages.protein}g`],
      ['Carbs Avg', `${reportData.averages.carbs}g`],
      ['Fat Avg', `${reportData.averages.fat}g`],
      ['Metabolic Status', reportData.metabolic_status]
    ];

    doc.autoTable({
      startY: 50,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [255, 45, 85] }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Clinic AI Insights', 20, finalY);
    doc.setFontSize(10);
    doc.text(reportData.narrative_summary, 20, finalY + 10, { maxWidth: 170 });

    doc.save(`NutriLens_Report_${now.replace(/\//g, '-')}.pdf`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
        <p style={{ color: 'var(--color-text-dim)', fontWeight: 800, fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>CALIBRATING METABOLIC ENGINE...</p>
      </div>
    );
  }

  if (error?.type === 'no_data') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '60px', textAlign: 'center' }} className="glass-card">
        <Activity size={48} color="var(--color-text-muted)" style={{ marginBottom: '24px' }} />
        <h3 style={{ marginBottom: '12px', fontFamily: 'Orbitron' }}>INSUFFICIENT DATA</h3>
        <p style={{ fontWeight: 600, color: 'var(--color-text-dim)' }}>{error.message}</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginTop: '20px', fontWeight: 800 }}>{error.suggestion}</p>
      </motion.div>
    );
  }

  if (!reportData) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', fontFamily: 'Orbitron' }}>METABOLIC INTELLIGENCE</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>LONG-TERM CLINICAL PERFORMANCE</p>
        </div>
        <button onClick={exportPDF} className="btn-premium" style={{ padding: '10px 20px', fontSize: '0.75rem' }}>
          <FileDown size={18} /> EXPORT PDF
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '24px' }}>
          <Shield size={24} color="var(--color-primary)" style={{ marginBottom: '12px' }} />
          <div className="stat-value" style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>{reportData.averages.health_score}</div>
          <div className="stat-label">AVG SCORE</div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '24px' }}>
          <Activity size={24} color="var(--color-secondary)" style={{ marginBottom: '12px' }} />
          <div className="stat-value" style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}>{reportData.metabolic_status}</div>
          <div className="stat-label">STATUS</div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '24px' }}>
          <Zap size={24} color="var(--color-warning)" style={{ marginBottom: '12px' }} />
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{reportData.averages.calories}</div>
          <div className="stat-label">DAILY KCAL</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.05 }}>
          <Brain size={200} color="var(--color-primary)" />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-primary)', marginBottom: '20px' }}>
          <Brain size={24} />
          <h3 style={{ fontWeight: 900, fontSize: '1.1rem', fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>CLINICAL AI ANALYSIS</h3>
        </div>
        
        <p style={{ fontSize: '1rem', color: 'var(--color-text-main)', lineHeight: 1.8, fontWeight: 500, position: 'relative', zIndex: 1 }}>
          {reportData.narrative_summary}
        </p>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <BarChart3 size={20} color="var(--color-secondary)" />
          <h3 style={{ fontWeight: 900, fontSize: '0.9rem', fontFamily: 'Orbitron', color: 'var(--color-text-main)' }}>BIOLOGICAL BREAKDOWN</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Protein', val: `${reportData.averages.protein}g`, icon: Activity, color: 'var(--color-primary)' },
            { label: 'Carbohydrates', val: `${reportData.averages.carbs}g`, icon: TrendingUp, color: 'var(--color-secondary)' },
            { label: 'Total Fats', val: `${reportData.averages.fat}g`, icon: Activity, color: '#ffb347' },
            { label: 'Dietary Fiber', val: `${reportData.averages.fiber}g`, icon: CheckCircle2, color: '#34c759' }
          ].map(item => (
            <div key={item.label} style={{ padding: '20px', background: 'var(--color-surface-bg)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="stat-label">{item.label}</p>
                <p className="stat-value" style={{ fontSize: '1.1rem' }}>{item.val}</p>
              </div>
              <item.icon size={18} color={item.color} style={{ opacity: 0.8 }} />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid var(--color-primary)' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-text-main)', marginBottom: '24px', fontFamily: 'Orbitron' }}>SYSTEM RECOMMENDATIONS</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reportData.recommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255, 45, 85, 0.1)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(255, 45, 85, 0.2)' }}>
                <CheckCircle2 size={16} color="var(--color-primary)" />
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-dim)', fontWeight: 500, lineHeight: 1.5 }}>{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
