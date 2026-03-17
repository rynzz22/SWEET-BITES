/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  ChevronRight,
  Calculator,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---

interface Expense {
  id: string;
  item: string;
  cost: number;
}

interface Sale {
  id: string;
  product: string;
  quantity: number;
  price: number;
}

interface AnalysisResult {
  totalExpenses: number;
  totalSales: number;
  profit: number;
  aiAdvice: string;
  isLoading: boolean;
}

// --- Components ---

const FloatingDesign = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 10, 0],
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-20 left-[10%] w-64 h-64 bg-pink-100/50 rounded-full blur-3xl"
    />
    <motion.div
      animate={{
        y: [0, 30, 0],
        rotate: [0, -15, 0],
      }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute bottom-40 right-[15%] w-80 h-80 bg-rose-50/60 rounded-full blur-3xl"
    />
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-50/30 rounded-full blur-[100px]"
    />
  </div>
);

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', item: 'Flour', cost: 500 },
    { id: '2', item: 'Sugar', cost: 300 },
  ]);
  const [sales, setSales] = useState<Sale[]>([
    { id: '1', product: 'Donuts', quantity: 50, price: 20 },
  ]);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Calculations ---

  const totals = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.cost, 0);
    const totalSales = sales.reduce((sum, s) => sum + (s.quantity * s.price), 0);
    return {
      totalExpenses,
      totalSales,
      profit: totalSales - totalExpenses
    };
  }, [expenses, sales]);

  // --- Handlers ---

  const addExpense = () => {
    setExpenses([...expenses, { id: crypto.randomUUID(), item: '', cost: 0 }]);
  };

  const updateExpense = (id: string, field: keyof Expense, value: string | number) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const addSale = () => {
    setSales([...sales, { id: crypto.randomUUID(), product: '', quantity: 0, price: 0 }]);
  };

  const updateSale = (id: string, field: keyof Sale, value: string | number) => {
    setSales(sales.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSale = (id: string) => {
    setSales(sales.filter(id_ => id_ !== id));
  };

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          You are an AI financial consultant for a small pastry business called Sweet Bites.
          Analyze this data and provide actionable advice.
          
          Expenses: ${expenses.map(e => `${e.item}: ₱${e.cost}`).join(', ')}
          Sales: ${sales.map(s => `${s.product}: ${s.quantity} pcs at ₱${s.price}`).join(', ')}
          
          Tasks:
          1. Calculate total expenses, total sales, and profit.
          2. Suggest optimal selling price for each product to maintain 40–50% profit margin.
          3. Identify cost reduction opportunities.
          4. Highlight top-performing products and suggest focus areas.
          5. Provide general business strategy tips for improving profits and sales.
          
          Keep it concise, friendly, and use bullet points. Format with markdown.
        `,
      });

      const response = await model;
      setAiAdvice(response.text || 'Could not generate advice.');
    } catch (error) {
      console.error(error);
      setAiAdvice('Error connecting to AI consultant. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-pink-100">
      <FloatingDesign />
      
      {/* Navigation / Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-pink-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sweet<span className="text-pink-500">Bites</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-pink-500 transition-colors">Dashboard</a>
            <a href="#" className="hover:text-pink-500 transition-colors">Inventory</a>
            <a href="#" className="hover:text-pink-500 transition-colors">Reports</a>
          </div>
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-md">
            Export Data
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Intro Section */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          >
            Financial Intelligence
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight"
          >
            Your Personal AI <br />
            <span className="text-pink-500">Pastry Consultant</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 leading-relaxed"
          >
            Input your daily numbers and let our AI analyze your margins, 
            suggest pricing, and optimize your Sweet Bites business.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Expenses Section */}
            <section className="bg-white rounded-3xl p-8 border border-pink-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <Calculator className="w-5 h-5 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Expenses</h3>
                </div>
                <button 
                  onClick={addExpense}
                  className="flex items-center gap-2 text-sm font-bold text-pink-500 hover:text-pink-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {expenses.map((expense) => (
                    <motion.div 
                      key={expense.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex gap-4 items-center"
                    >
                      <input 
                        type="text" 
                        placeholder="Item name (e.g. Flour)"
                        value={expense.item}
                        onChange={(e) => updateExpense(expense.id, 'item', e.target.value)}
                        className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 transition-all"
                      />
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={expense.cost || ''}
                          onChange={(e) => updateExpense(expense.id, 'cost', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border-none rounded-xl pl-7 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 transition-all"
                        />
                      </div>
                      <button 
                        onClick={() => removeExpense(expense.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {/* Sales Section */}
            <section className="bg-white rounded-3xl p-8 border border-pink-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-50 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Sales</h3>
                </div>
                <button 
                  onClick={addSale}
                  className="flex items-center gap-2 text-sm font-bold text-pink-500 hover:text-pink-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {sales.map((sale) => (
                    <motion.div 
                      key={sale.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="grid grid-cols-12 gap-4 items-center"
                    >
                      <div className="col-span-5">
                        <input 
                          type="text" 
                          placeholder="Product (e.g. Donuts)"
                          value={sale.product}
                          onChange={(e) => updateSale(sale.id, 'product', e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 transition-all"
                        />
                      </div>
                      <div className="col-span-3">
                        <input 
                          type="number" 
                          placeholder="Qty"
                          value={sale.quantity || ''}
                          onChange={(e) => updateSale(sale.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 transition-all"
                        />
                      </div>
                      <div className="col-span-3 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span>
                        <input 
                          type="number" 
                          placeholder="Price"
                          value={sale.price || ''}
                          onChange={(e) => updateSale(sale.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border-none rounded-xl pl-7 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-200 transition-all"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button 
                          onClick={() => removeSale(sale.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>

          {/* Right Column: Analysis */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-pink-50 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Sales</p>
                <h4 className="text-2xl font-bold text-slate-900">₱{totals.totalSales.toLocaleString()}</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-pink-50 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expenses</p>
                <h4 className="text-2xl font-bold text-slate-900">₱{totals.totalExpenses.toLocaleString()}</h4>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit</p>
                </div>
                <h4 className="text-4xl font-bold mb-6">₱{totals.profit.toLocaleString()}</h4>
                
                <button 
                  onClick={analyzeWithAI}
                  disabled={isAnalyzing}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-slate-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all group"
                >
                  {isAnalyzing ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      Consult AI Advisor
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              {/* Background Glow */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* AI Advice Display */}
            <AnimatePresence>
              {aiAdvice && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-8 border border-pink-100 shadow-lg shadow-pink-50/50"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-pink-500 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Consultant Advice</h3>
                  </div>
                  <div className="prose prose-pink prose-sm max-w-none text-slate-600 leading-relaxed">
                    {aiAdvice.split('\n').map((line, i) => (
                      <p key={i} className="mb-2">{line}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Placeholder if no advice */}
            {!aiAdvice && !isAnalyzing && (
              <div className="bg-pink-50/30 border border-dashed border-pink-100 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <PieChart className="w-8 h-8 text-pink-200" />
                </div>
                <p className="text-slate-400 text-sm font-medium">
                  Click the advisor button to get <br /> professional financial insights.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-pink-50 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm">
            © 2026 Sweet Bites AI Consultant. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
            <a href="#" className="hover:text-pink-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-pink-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-pink-500 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
