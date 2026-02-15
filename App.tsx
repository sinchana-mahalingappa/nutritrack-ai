
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NutrientData, UserProfile, NutrientGoal, FoodItem, DietType, FoodCategory, HistoryMap } from './types';
import { DEFAULT_GOALS, calculatePersonalizedGoals, FOOD_DATABASE } from './constants';
import { generateDailyInsights } from './services/geminiService';
import { notificationService } from './services/notificationService';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const getTodayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayKey = getTodayKey();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nutritrack_auth_token') === 'true';
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('nutritrack_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [customNutrients, setCustomNutrients] = useState<NutrientGoal[]>(() => {
    const saved = localStorage.getItem('nutritrack_custom_nutrients');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyRecords, setDailyRecords] = useState<HistoryMap>(() => {
    const saved = localStorage.getItem('nutritrack_history');
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('nutritrack_today_foods');
    return saved ? JSON.parse(saved) : [];
  });

  const [customFoodDatabase, setCustomFoodDatabase] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('nutritrack_custom_food_database');
    return saved ? JSON.parse(saved) : [];
  });

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeNutrient, setActiveNutrient] = useState<string | null>(null);
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [isAddingNutrient, setIsAddingNutrient] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [achievedGoals, setAchievedGoals] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [waterGoalNotified, setWaterGoalNotified] = useState<boolean>(() => {
    return localStorage.getItem(`nutritrack_notified_water_${todayKey}`) === 'true';
  });

  const allBaseGoals = useMemo(() => [...DEFAULT_GOALS, ...customNutrients], [customNutrients]);
  const goals = useMemo(() => userProfile ? calculatePersonalizedGoals(userProfile, allBaseGoals) : allBaseGoals, [userProfile, allBaseGoals]);
  
  const workingFoodDatabase = useMemo(() => [...FOOD_DATABASE, ...customFoodDatabase], [customFoodDatabase]);
  const waterGoal = useMemo(() => userProfile ? Math.round(userProfile.weight * 35) : 2500, [userProfile]);

  const currentWater = dailyRecords[todayKey]?.water || 0;

  const [manualFoodForm, setManualFoodForm] = useState<Record<string, string>>({
    name: '', dietType: 'vegan'
  });

  const [newNutrientForm, setNewNutrientForm] = useState({
    label: '', unit: '', goal: '', color: 'bg-emerald-500', icon: 'fa-vial', description: ''
  });
  
  const suggestionPanelRef = useRef<HTMLDivElement>(null);

  const todayPlate = useMemo(() => {
    return selectedFoodIds
      .map(id => workingFoodDatabase.find(f => f.id === id))
      .filter((food): food is FoodItem => !!food);
  }, [selectedFoodIds, workingFoodDatabase]);

  const totals = useMemo(() => {
    return selectedFoodIds.reduce((acc, id) => {
      const food = workingFoodDatabase.find(f => f.id === id);
      if (food) {
        Object.keys(food.nutrients).forEach((key) => {
          acc[key] = (acc[key] || 0) + food.nutrients[key];
        });
      }
      return acc;
    }, {} as NutrientData);
  }, [selectedFoodIds, workingFoodDatabase]);

  useEffect(() => {
    if (activeNutrient && suggestionPanelRef.current) {
      const timeoutId = setTimeout(() => {
        suggestionPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [activeNutrient]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (!isAuthenticated) return;
    localStorage.setItem('nutritrack_today_foods', JSON.stringify(selectedFoodIds));
    localStorage.setItem('nutritrack_custom_nutrients', JSON.stringify(customNutrients));
    
    setDailyRecords(prev => {
      const current = prev[todayKey];
      if (JSON.stringify(current?.totals) === JSON.stringify(totals)) return prev;
      
      const updated = {
        ...prev,
        [todayKey]: {
          date: todayKey,
          totals: totals,
          water: current?.water || 0
        }
      };
      localStorage.setItem('nutritrack_history', JSON.stringify(updated));
      return updated;
    });
  }, [selectedFoodIds, totals, isAuthenticated, todayKey, customNutrients]);

  useEffect(() => {
    if (!isAuthenticated) return;
    localStorage.setItem('nutritrack_custom_food_database', JSON.stringify(customFoodDatabase));
  }, [customFoodDatabase, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    goals.forEach(goal => {
      const val = totals[goal.key] || 0;
      if (val >= goal.goal && !achievedGoals.includes(goal.key)) {
        setAchievedGoals(prev => [...prev, goal.key]);
        notificationService.sendNotification("Goal Achieved! 🎉", `Reached your daily ${goal.label} target.`);
      }
    });
  }, [totals, goals, achievedGoals, isAuthenticated]);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('nutritrack_auth_token', 'true');
    localStorage.setItem('nutritrack_user_email', email);
    localStorage.setItem('nutritrack_current_user', email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nutritrack_auth_token');
    localStorage.removeItem('nutritrack_user_email');
    localStorage.removeItem('nutritrack_current_user');
    setIsSettingsOpen(false);
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('nutritrack_profile', JSON.stringify(profile));
  };

  const handleUpdateWater = (amount: number) => {
    setDailyRecords(prev => {
      const current = prev[todayKey] || { date: todayKey, totals: {}, water: 0 };
      const updated = {
        ...prev,
        [todayKey]: {
          ...current,
          water: Math.max(0, current.water + amount)
        }
      };
      localStorage.setItem('nutritrack_history', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFoodIntake = (id: string) => {
    setSelectedFoodIds(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const resetDay = () => {
    setSelectedFoodIds([]);
    localStorage.setItem('nutritrack_today_foods', JSON.stringify([]));
    setDailyRecords(prev => {
      const updated = { ...prev, [todayKey]: { date: todayKey, totals: {}, water: 0 } };
      localStorage.setItem('nutritrack_history', JSON.stringify(updated));
      return updated;
    });
    setAiInsight(null);
    setAchievedGoals([]);
    setWaterGoalNotified(false);
    localStorage.removeItem(`nutritrack_notified_water_${todayKey}`);
    setToast({ message: "Today's intake has been reset.", type: 'success' });
    setIsResetConfirmOpen(false);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const insight = await generateDailyInsights(totals, goals, currentWater, waterGoal);
      setAiInsight(insight);
    } catch (err) {
      setToast({ message: "AI analysis failed.", type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRecommendedFoods = (nutrientKey: string) => {
    const currentDiet = userProfile?.dietType || 'vegetarian';
    const goalObj = goals.find(g => g.key === nutrientKey);
    let threshold = goalObj ? (['protein', 'carbs', 'fats'].includes(nutrientKey) ? goalObj.goal * 0.05 : goalObj.goal * 0.03) : 0;
    
    return workingFoodDatabase.filter(f => {
      if ((f.nutrients[nutrientKey] || 0) < threshold) return false;
      if (currentDiet === 'vegan') return f.dietType === 'vegan';
      if (currentDiet === 'vegetarian') return ['vegan', 'vegetarian'].includes(f.dietType);
      if (currentDiet === 'eggitarian') return f.dietType !== 'non-veg';
      return true;
    }).sort((a, b) => (b.nutrients[nutrientKey] || 0) - (a.nutrients[nutrientKey] || 0));
  };

  const handleFullReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleOpenEditModal = (food: FoodItem) => {
    setEditingFoodId(food.id);
    const initialForm: Record<string, string> = {
      name: food.name,
      dietType: food.dietType
    };
    goals.forEach(g => {
      initialForm[g.key] = (food.nutrients[g.key] || 0).toString();
    });
    setManualFoodForm(initialForm);
    setIsAddingManual(true);
  };

  const handleOpenAddModal = () => {
    setEditingFoodId(null);
    const initialForm: Record<string, string> = { name: '', dietType: 'vegan' };
    goals.forEach(g => { initialForm[g.key] = ''; });
    setManualFoodForm(initialForm);
    setIsAddingManual(true);
  };

  const handleManualFoodSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFoodForm.name) return;
    
    const nutrientData: NutrientData = {};
    goals.forEach(g => {
      nutrientData[g.key] = parseFloat(manualFoodForm[g.key]) || 0;
    });

    if (editingFoodId) {
      setCustomFoodDatabase(prev => prev.map(f => f.id === editingFoodId ? { ...f, name: manualFoodForm.name, dietType: manualFoodForm.dietType as FoodCategory, nutrients: nutrientData } : f));
      setToast({ message: "Custom food updated successfully.", type: 'success' });
    } else {
      const newFood: FoodItem = {
        id: `custom-${Date.now()}`,
        name: manualFoodForm.name,
        dietType: manualFoodForm.dietType as FoodCategory,
        nutrients: nutrientData
      };
      setCustomFoodDatabase(prev => [...prev, newFood]);
      toggleFoodIntake(newFood.id);
      setToast({ message: "Custom food added to your plate.", type: 'success' });
    }
    setEditingFoodId(null);
    setIsAddingManual(false);
  };

  const handleAddNutrient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNutrientForm.label || !newNutrientForm.goal) return;

    const key = newNutrientForm.label.toLowerCase().replace(/\s+/g, '-');
    if (goals.some(g => g.key === key)) {
      setToast({ message: "Nutrient with this name already exists.", type: 'error' });
      return;
    }

    const newNutrient: NutrientGoal = {
      label: newNutrientForm.label,
      key,
      unit: newNutrientForm.unit || 'g',
      goal: parseFloat(newNutrientForm.goal) || 0,
      color: newNutrientForm.color,
      icon: newNutrientForm.icon,
      description: newNutrientForm.description || 'Custom tracked nutrient.',
      isCustom: true
    };

    setCustomNutrients(prev => [...prev, newNutrient]);
    setIsAddingNutrient(false);
    setNewNutrientForm({ label: '', unit: '', goal: '', color: 'bg-emerald-500', icon: 'fa-vial', description: '' });
    setToast({ message: "New nutrient added permanently.", type: 'success' });
  };

  const deleteCustomNutrient = (key: string) => {
    setCustomNutrients(prev => prev.filter(n => n.key !== key));
    setToast({ message: "Nutrient removed.", type: 'success' });
  };

  // Helper to get category style
  const getCategoryStyle = (category: FoodCategory) => {
    switch (category) {
      case 'vegan': return { color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', icon: 'fa-leaf' };
      case 'vegetarian': return { color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200', icon: 'fa-cheese' };
      case 'egg': return { color: 'text-sky-700', bg: 'bg-sky-100', border: 'border-sky-200', icon: 'fa-egg' };
      case 'non-veg': return { color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-200', icon: 'fa-drumstick-bite' };
      default: return { color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200', icon: 'fa-utensils' };
    }
  };

  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen pb-32 max-w-7xl mx-auto px-4 sm:px-8">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-bold border ${
              toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
            }`}>
            <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>


      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onResetProfile={handleFullReset} onLogout={handleLogout} />

      <ConfirmDialog 
        isOpen={isResetConfirmOpen}
        title="Reset Today's Data"
        description="Are you sure you want to reset today's intake? This will clear your food intake and water logs for today. This action cannot be undone."
        confirmLabel="Confirm Reset"
        variant="danger"
        onConfirm={resetDay}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* MODAL: ADD NUTRIENT */}
      <AnimatePresence>
        {isAddingNutrient && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-lg p-10 rounded-[3rem] shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
              <button onClick={() => setIsAddingNutrient(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><i className="fas fa-times text-xl"></i></button>
              <h3 className="text-xl font-black text-slate-900 mb-6">Create Custom Nutrient</h3>
              <form onSubmit={handleAddNutrient} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nutrient Label</label>
                  <input required type="text" placeholder="e.g. Vitamin C, Magnesium" value={newNutrientForm.label} onChange={e => setNewNutrientForm({...newNutrientForm, label: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border rounded-2xl outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                    <input required type="text" placeholder="mg, mcg, g" value={newNutrientForm.unit} onChange={e => setNewNutrientForm({...newNutrientForm, unit: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border rounded-2xl outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Daily Goal</label>
                    <input required type="number" step="0.1" placeholder="90" value={newNutrientForm.goal} onChange={e => setNewNutrientForm({...newNutrientForm, goal: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border rounded-2xl outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Color</label>
                  <div className="flex flex-wrap gap-2">
                    {['bg-emerald-500', 'bg-rose-500', 'bg-sky-500', 'bg-amber-500', 'bg-indigo-500', 'bg-teal-500'].map(c => (
                      <button key={c} type="button" onClick={() => setNewNutrientForm({...newNutrientForm, color: c})} className={`w-8 h-8 rounded-full ${c} ${newNutrientForm.color === c ? 'ring-4 ring-offset-2 ring-slate-900' : ''}`} />
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-xs tracking-widest">Add Permanently</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD FOOD */}
      <AnimatePresence>
        {isAddingManual && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl p-10 rounded-[3rem] shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
              <button onClick={() => { setIsAddingManual(false); setEditingFoodId(null); }} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><i className="fas fa-times text-xl"></i></button>
              <h3 className="text-xl font-black text-slate-900 mb-6">{editingFoodId ? 'Edit Custom Food' : 'Add Custom Food'}</h3>
              <form onSubmit={handleManualFoodSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Food Name</label>
                    <input required type="text" placeholder="e.g. Grandma's Apple Pie" value={manualFoodForm.name} onChange={e => setManualFoodForm({...manualFoodForm, name: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diet Type</label>
                    <select value={manualFoodForm.dietType} onChange={e => setManualFoodForm({...manualFoodForm, dietType: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none">
                      <option value="vegan">Vegan</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="egg">Eggitarian</option>
                      <option value="non-veg">Non-Veg</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {goals.map(g => (
                    <div key={g.key} className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{g.label} ({g.unit})</label>
                      <input type="number" step="0.1" placeholder="0" value={manualFoodForm[g.key] || ''} onChange={e => setManualFoodForm({...manualFoodForm, [g.key]: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => { setIsAddingManual(false); setEditingFoodId(null); }} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">Cancel</button>
                  <button type="submit" className="flex-2 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20">{editingFoodId ? 'Update Food' : 'Add to Plate'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="py-12 flex justify-between items-center flex-wrap gap-8">
        <div className="flex-1 min-w-[300px]">
          <h1 className="text-4xl font-extrabold text-slate-900">{userProfile ? `Hello, ${userProfile.name}!` : "Today's Balance"}</h1>
          <div className="flex items-center gap-4 mt-2 text-slate-500 font-medium">
             <span>Diet: <b className="text-emerald-600">{userProfile?.dietType}</b></span>
             <span className="w-1 h-1 rounded-full bg-slate-300"></span>
             <span>Calories: <b className="text-slate-800 tracking-tight">{Math.round(totals.calories || 0)} kcal</b></span>
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsResetConfirmOpen(true)} title="Reset Day" className="w-12 h-12 rounded-2xl glass text-slate-400 hover:text-rose-500 flex items-center justify-center shadow-lg"><i className="fas fa-rotate text-lg"></i></motion.button>
          <motion.button whileHover={{ scale: 1.05, rotate: 90 }} whileTap={{ scale: 0.95 }} onClick={() => setIsSettingsOpen(true)} title="Settings" className="w-12 h-12 rounded-2xl glass text-slate-400 hover:text-emerald-500 flex items-center justify-center shadow-lg"><i className="fas fa-cog text-xl"></i></motion.button>
        </div>
      </motion.header>

      {/* TODAY'S PLATE SECTION - NOW COLOURFUL */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 bg-white/70 p-8 rounded-[2.5rem] border border-white shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
            <span className="text-2xl">🍱</span> Today's Plate
          </h3>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            {todayPlate.length} items logged
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          <AnimatePresence mode="popLayout">
            {todayPlate.length > 0 ? (
              todayPlate.map((food) => {
                const style = getCategoryStyle(food.dietType);
                return (
                  <motion.div 
                    key={`${food.id}-${food.name}`} 
                    layout 
                    initial={{ opacity: 0, scale: 0.5, y: 10 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.5, y: 10 }} 
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`flex items-center gap-3 px-5 py-2.5 ${style.bg} ${style.color} rounded-2xl border-2 ${style.border} shadow-sm group relative`}
                  >
                    <i className={`fas ${style.icon} text-sm opacity-60`}></i>
                    <span className="text-sm font-extrabold tracking-tight">{food.name}</span>
                    
                    <div className="flex items-center gap-1.5 ml-2">
                      {food.id.startsWith('custom-') && (
                        <button 
                          onClick={() => handleOpenEditModal(food)} 
                          className="w-5 h-5 flex items-center justify-center rounded-lg bg-white/50 hover:bg-white text-[10px] transition-all" 
                          title="Edit"
                        >
                          <i className="fas fa-pencil"></i>
                        </button>
                      )}
                      <button 
                        onClick={() => toggleFoodIntake(food.id)} 
                        className="w-5 h-5 flex items-center justify-center rounded-lg bg-white/50 hover:bg-rose-500 hover:text-white text-[10px] transition-all"
                        title="Remove"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="w-full py-10 flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-200">
                  <i className="fas fa-utensils text-xl"></i>
                </div>
                <p className="text-sm text-slate-400 font-bold italic tracking-wide">
                  Your plate is empty. Start adding some healthy fuel!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <div key={goal.key} onClick={() => setActiveNutrient(activeNutrient === goal.key ? null : goal.key)}>
                  goal={goal} 
                  current={totals[goal.key] || 0} 
                  isActive={activeNutrient === goal.key} 
                  onDelete={goal.isCustom ? deleteCustomNutrient : undefined}
                />
              </div>
            ))}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsAddingNutrient(true)}
              className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex flex-col items-center justify-center gap-3 text-slate-400 group"
            >
              <i className="fas fa-plus-circle text-2xl group-hover:text-emerald-500 transition-colors"></i>
              <span className="text-xs font-black uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Add Nutrient</span>
            </motion.button>
          </div>
          <HistoryHeatmap history={dailyRecords} goals={goals} />
          
          <div className="bg-white/40 p-10 rounded-[2.5rem] border border-white/50 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest"><i className="fas fa-wand-magic-sparkles text-emerald-500 mr-2"></i> AI Insights</h3>
               <button disabled={isAnalyzing} onClick={runAnalysis} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black">
                 {isAnalyzing ? "Analyzing..." : "Analyze Day"}
               </button>
             </div>
             {aiInsight && <div className="p-8 bg-emerald-50/50 rounded-3xl text-slate-700 whitespace-pre-line leading-relaxed">{aiInsight}</div>}
          </div>
        </div>

        <div className="lg:col-span-4" ref={suggestionPanelRef}>
          <div className="sticky top-8">
            <AnimatePresence mode="wait">
              {activeNutrient ? (
                <motion.div key={activeNutrient} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-emerald-50 animate-section-glow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-xl text-slate-900">{goals.find(g => g.key === activeNutrient)?.label} Sources</h3>
                    <button onClick={handleOpenAddModal} className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors" title="Add Custom Food">
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {getRecommendedFoods(activeNutrient).map(food => (
                      <div key={food.id} className="relative group">
                        <button onClick={() => toggleFoodIntake(food.id)} className={`w-full flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${selectedFoodIds.includes(food.id) ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-transparent hover:border-emerald-200'}`}>
                          <div className="flex items-center gap-2">
                            <i className={`fas ${getCategoryStyle(food.dietType).icon} text-[10px] opacity-40`}></i>
                            <span className="text-sm font-bold text-slate-800">{food.name}</span>
                          </div>
                          <span className="text-[11px] font-black text-emerald-600">+{(food.nutrients[activeNutrient] || 0).toFixed(1)}</span>
                        </button>
                        {food.id.startsWith('custom-') && (
                          <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(food); }} className="absolute right-[-8px] top-[-8px] w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-slate-50">
                            <i className="fas fa-pencil text-[8px] text-slate-500"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="bg-emerald-900 text-white rounded-[2.5rem] p-10 h-[400px] flex flex-col justify-center shadow-2xl relative overflow-hidden">
                  <i className="fas fa-bullseye text-4xl mb-6 text-emerald-400"></i>
                  <h3 className="text-2xl font-bold mb-4">Nutrient Library</h3>
                  <p className="text-emerald-100/60 leading-relaxed">Select a nutrient to explore high-impact food choices for your daily balance.</p>
                  <button onClick={handleOpenAddModal} className="mt-8 px-6 py-3 bg-white text-slate-900 text-xs font-bold uppercase rounded-2xl transition-transform active:scale-95">Add Custom Food</button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
