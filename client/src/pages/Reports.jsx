import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, Calendar, TrendingUp, AlertCircle, CheckCircle2, ChevronRight, Activity, Brain, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function Reports({ meals, profile, user }) {
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
          // If no data yet, show helpful message
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

    // Styled Header
    doc.setFontSize(22);
    doc.setTextColor(0, 255, 163); // var(--color-primary)
    doc.text('NutriLens: Metabolic Analysis Export', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${now}`, 20, 28);
    doc.text(`Client ID: ${profile?.name || user?.email || 'Anonymous User'}`, 20, 33);

    // Summary Section
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
      headStyles: { fillColor: [0, 255, 163] }
    });

    // Clinical Insights
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
        <p style={{ color: 'var(--color-text-dim)', fontWeight: 600, fontFamily: 'Orbitron' }}>CALIBRATING METABOLIC ENGINE...</p>
      </div>
    );
  }

  if (error?.type === 'no_data') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '40px', textAlign: 'center' }} className="glass-card">
        <Activity size={48} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px' }}>Insufficient Data</h3>
        <p style={{ fontWeight: 600, color: 'var(--color-text-dim)' }}>{error.message}</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginTop: '12px' }}>{error.suggestion}</p>
      </motion.div>
    );
  }

  if (!reportData) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
      <div className="glass-card" style={{ padding: '32px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-text-main)' }}>Longitudinal Report</h3>
               <p style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 800, letterSpacing: '0.1em' }}>METABOLIC DATA: LAST 7 DAYS</p>
            </div>
            <button onClick={exportPDF} className="btn-premium" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>
               <FileDown size={18} /> Export PDF
            </button>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'var(--color-bg-elevated)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
               <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Avg Health Score</p>
               <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)' }}>{reportData.averages.health_score}</div>
            </div>
            <div style={{ background: 'var(--color-bg-elevated)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
               <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Status</p>
               <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-secondary)', textTransform: 'capitalize' }}>{reportData.metabolic_status}</div>
            </div>
         </div>

         <div style={{ padding: '24px', background: 'rgba(0, 255, 163, 0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0, 255, 163, 0.1)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '12px' }}>
               <Brain size={20} />
               <span style={{ fontWeight: 800, fontSize: '0.9rem', fontFamily: 'Orbitron' }}>Clinical AI Insight</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: 1.6, fontWeight: 500 }}>
               {reportData.narrative_summary}
            </p>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weekly Averages</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Protein', val: `${reportData.averages.protein}g`, icon: Activity },
                { label: 'Carbs', val: `${reportData.averages.carbs}g`, icon: TrendingUp },
                { label: 'Fat', val: `${reportData.averages.fat}g`, icon: Activity },
                { label: 'Fiber', val: `${reportData.averages.fiber}g`, icon: CheckCircle2 }
              ].map(item => (
                <div key={item.label} style={{ padding: '16px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>{item.label}</p>
                    <p style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{item.val}</p>
                  </div>
                  <item.icon size={16} color="var(--color-secondary)" opacity={0.5} />
                </div>
              ))}
            </div>
         </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '16px', fontFamily: 'Orbitron' }}>RECOMMENDATIONS</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reportData.recommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ background: 'var(--color-bg-elevated)', padding: '6px', borderRadius: '8px' }}>
                <CheckCircle2 size={16} color="var(--color-primary)" />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)', fontWeight: 500 }}>{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
