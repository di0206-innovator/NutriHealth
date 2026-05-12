import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, List, Save, CheckCircle2, ChevronRight, UtensilsCrossed, Flame, Info, Zap, Database } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function RecipeBuilder({ user }) {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [ingName, setIngName] = useState('');
  const [ingCals, setIngCals] = useState('');
  const [ingProt, setIngProt] = useState('');
  const [ingCarbs, setIngCarbs] = useState('');
  const [ingFat, setIngFat] = useState('');
  const [saved, setSaved] = useState(false);

  const addIngredient = () => {
    if (!ingName || !ingCals) return;
    setIngredients([...ingredients, {
      id: Date.now(),
      name: ingName,
      calories: Number(ingCals),
      protein: Number(ingProt || 0),
      carbs: Number(ingCarbs || 0),
      fat: Number(ingFat || 0)
    }]);
    setIngName(''); setIngCals(''); setIngProt(''); setIngCarbs(''); setIngFat('');
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const totals = ingredients.reduce((acc, i) => ({
    calories: acc.calories + i.calories,
    protein: acc.protein + i.protein,
    carbs: acc.carbs + i.carbs,
    fat: acc.fat + i.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const saveRecipe = async () => {
    if (!recipeName || !ingredients.length || !user) return;
    
    try {
      await addDoc(collection(db, 'users', user.uid, 'recipes'), {
        name: recipeName,
        ingredients: ingredients,
        totals: totals,
        createdAt: serverTimestamp()
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false); setRecipeName(''); setIngredients([]);
      }, 2000);
    } catch (e) {
      console.error("Recipe Save Interrupted:", e);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
      <header>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', fontFamily: 'Orbitron' }}>RECIPE COMPOSER</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>SYNTHESIZE MULTI-COMPONENT NUTRITIONAL UNITS</p>
      </header>

      <div className="glass-card" style={{ padding: '32px' }}>
         <div style={{ marginBottom: '32px' }}>
            <label className="stat-label" style={{ marginBottom: '8px', display: 'block' }}>Recipe Signature</label>
            <input 
              type="text" 
              placeholder="e.g. Grandma's Special Lentil Soup" 
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="input-premium"
              style={{ width: '100%', height: '64px' }}
            />
         </div>

         <div style={{ padding: '24px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--color-secondary)' }}>
               <Database size={18} />
               <span style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ingredient Synthesis</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <input placeholder="Name" value={ingName} onChange={(e) => setIngName(e.target.value)} className="input-premium" style={{ height: '56px', fontSize: '0.85rem' }} />
                <input placeholder="Kcal" type="number" value={ingCals} onChange={(e) => setIngCals(e.target.value)} className="input-premium" style={{ height: '56px', fontSize: '0.85rem' }} />
                <input placeholder="Prot(g)" type="number" value={ingProt} onChange={(e) => setIngProt(e.target.value)} className="input-premium" style={{ height: '56px', fontSize: '0.85rem' }} />
            </div>
            
            <button 
                onClick={addIngredient}
                style={{ width: '100%', height: '56px', background: 'transparent', border: '1px solid var(--color-secondary)', color: 'var(--color-secondary)', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 179, 71, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
                <Plus size={18} /> ATTACH COMPONENT
            </button>
         </div>

         <AnimatePresence>
           {ingredients.length > 0 && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: '32px', overflow: 'hidden' }}>
                <h4 className="stat-label" style={{ marginBottom: '16px' }}>Biological Components</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {ingredients.map(ing => (
                    <motion.div key={ing.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: '16px' }}>
                       <div>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{ing.name}</span>
                          <span style={{ marginLeft: '12px', fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>{ing.calories} kcal · {ing.protein}g protein</span>
                       </div>
                       <button onClick={() => removeIngredient(ing.id)} style={{ color: '#ff3b30', background: 'none', border: 'none', padding: '6px', cursor: 'pointer', opacity: 0.6 }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}><X size={18} /></button>
                    </motion.div>
                  ))}
                </div>
             </motion.div>
           )}
         </AnimatePresence>

         {ingredients.length > 0 && (
            <div style={{ background: 'var(--gradient-primary)', color: 'var(--color-bg-main)', padding: '24px', borderRadius: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                   <span style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', fontFamily: 'Orbitron' }}>Metabolic Yield</span>
                   <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Orbitron' }}>{totals.calories} kcal</span>
                </div>
                <div style={{ display: 'flex', gap: '24px', fontSize: '0.8rem', fontWeight: 800, opacity: 0.9 }}>
                   <span>PROTEIN: {totals.protein}g</span>
                   <span>CARBS: {totals.carbs}g</span>
                   <span>FAT: {totals.fat}g</span>
                </div>
            </div>
         )}

         <button 
           onClick={saveRecipe}
           disabled={!recipeName || !ingredients.length}
           className="btn-premium"
           style={{ width: '100%', background: saved ? '#34c759' : 'var(--gradient-primary)', color: 'var(--color-bg-main)', opacity: (!recipeName || !ingredients.length) ? 0.5 : 1, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
         >
           {saved ? <CheckCircle2 size={24} /> : <Save size={24} />}
           {saved ? 'RECIPE SECURED' : 'COMMIT TO DATABASE'}
         </button>
      </div>
    </motion.div>
  );
}
