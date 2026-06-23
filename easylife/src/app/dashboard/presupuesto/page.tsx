"use client";

import { useState, useEffect } from "react";
import styles from "./presupuesto.module.css";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface CookedRecipe {
  id: string;
  recipeId: string;
  recipeName: string;
  date: string;
  estimatedCost: number;
  estimatedDeliveryCost: number;
}

const CATEGORIES = ["Carnes", "Verduras", "Lácteos", "Granos", "Bebidas", "Snacks", "Limpieza", "Otros"];

const CATEGORY_ICONS: Record<string, string> = {
  "Carnes": "🥩", "Verduras": "🥦", "Lácteos": "🥛",
  "Granos": "🌾", "Bebidas": "🧃", "Snacks": "🍿",
  "Limpieza": "🧹", "Otros": "🛍️"
};

export default function Presupuesto() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cookedRecipes, setCookedRecipes] = useState<CookedRecipe[]>([]);
  const [budget, setBudget] = useState<number>(500);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetInput, setNewBudgetInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [periodFilter, setPeriodFilter] = useState<"monthly" | "weekly">("monthly");

  // Form state
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Otros");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const savedExpenses = localStorage.getItem("easylife_expenses");
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    const savedBudget = localStorage.getItem("easylife_budget");
    if (savedBudget) setBudget(Number(savedBudget));
    const savedCooked = localStorage.getItem("easylife_cooked_recipes");
    if (savedCooked) setCookedRecipes(JSON.parse(savedCooked));
  }, []);

  const saveExpenses = (updated: Expense[]) => {
    setExpenses(updated);
    localStorage.setItem("easylife_expenses", JSON.stringify(updated));
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    const expense: Expense = {
      id: Date.now().toString(),
      description: desc,
      amount: parseFloat(amount),
      category,
      date,
    };
    saveExpenses([expense, ...expenses]);
    setDesc(""); setAmount(""); setCategory("Otros");
    setDate(new Date().toISOString().split("T")[0]);
    setIsAddingExpense(false);
  };

  const handleRemove = (id: string) => {
    saveExpenses(expenses.filter(e => e.id !== id));
  };

  const handleUpdateBudget = () => {
    const val = parseFloat(newBudgetInput);
    if (!isNaN(val) && val > 0) {
      setBudget(val);
      localStorage.setItem("easylife_budget", String(val));
    }
    setIsEditingBudget(false);
    setNewBudgetInput("");
  };

  // Current month/week expenses based on period filter
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const getPeriodExpenses = () => {
    if (periodFilter === "monthly") {
      const currentMonth = today.toISOString().slice(0, 7);
      return expenses.filter(e => e.date.startsWith(currentMonth));
    } else {
      // Weekly: get current week (Monday to Sunday)
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday is 0
      const monday = new Date(today);
      monday.setDate(today.getDate() - diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      return expenses.filter(e => {
        const expDate = new Date(e.date + "T00:00:00");
        return expDate >= monday && expDate <= sunday;
      });
    }
  };
  
  const periodExpenses = getPeriodExpenses();
  
  // Get cooked recipes for the period
  const getPeriodCookedRecipes = () => {
    if (periodFilter === "monthly") {
      const currentMonth = today.toISOString().slice(0, 7);
      return cookedRecipes.filter(r => r.date.startsWith(currentMonth));
    } else {
      // Weekly: get current week (Monday to Sunday)
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      return cookedRecipes.filter(r => {
        const recipeDate = new Date(r.date + "T00:00:00");
        return recipeDate >= monday && recipeDate <= sunday;
      });
    }
  };
  
  const periodCookedRecipes = getPeriodCookedRecipes();
  
  // Calculate savings
  const totalCookingCost = periodCookedRecipes.reduce((sum, r) => sum + r.estimatedCost, 0);
  const totalDeliveryCost = periodCookedRecipes.reduce((sum, r) => sum + r.estimatedDeliveryCost, 0);
  const totalSavings = totalDeliveryCost - totalCookingCost;
  const savingsPercentage = totalDeliveryCost > 0 ? (totalSavings / totalDeliveryCost) * 100 : 0;
  
  // Filter expenses for display
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "Todas" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  const totalSpent = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget - totalSpent;
  const pct = Math.min((totalSpent / budget) * 100, 100);

  // By category
  const byCategory = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    const total = periodExpenses.filter((e: Expense) => e.category === cat).reduce((s: number, e: Expense) => s + e.amount, 0);
    if (total > 0) acc[cat] = total;
    return acc;
  }, {});

  const progressColor = pct < 60 ? "var(--success)" : pct < 85 ? "#f4a261" : "var(--primary)";

  const formatSoles = (n: number) => `S/ ${n.toFixed(2)}`;

  return (
    <div className="animate-fade-in">
      <header className={styles.header}>
        <div>
          <h1>Presupuesto</h1>
          <p className={styles.subtitle}>
            Control de gastos {periodFilter === "monthly" ? "del mes" : "de la semana"}
          </p>
        </div>
        <div className={styles.headerActions}>
          <select
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value as "monthly" | "weekly")}
            className={styles.periodSelect}
          >
            <option value="monthly">Mensual</option>
            <option value="weekly">Semanal</option>
          </select>
          <button className={styles.addBtn} onClick={() => setIsAddingExpense(!isAddingExpense)}>
            {isAddingExpense ? "✕" : "+ Gasto"}
          </button>
        </div>
      </header>

      {/* Search and Filter */}
      <div className={styles.searchFilterRow}>
        <input
          type="search"
          placeholder="🔍 Buscar gasto..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="Todas">Todas las categorías</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
          ))}
        </select>
      </div>

      {/* Budget Overview Card */}
      <div className={`glass-panel ${styles.budgetCard}`}>
        <div className={styles.budgetTop}>
          <div>
            <p className={styles.budgetLabel}>Presupuesto mensual</p>
            {isEditingBudget ? (
              <div className={styles.budgetEditRow}>
                <span className={styles.currency}>S/</span>
                <input
                  type="number"
                  value={newBudgetInput}
                  onChange={e => setNewBudgetInput(e.target.value)}
                  className={styles.budgetInput}
                  placeholder={String(budget)}
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleUpdateBudget()}
                />
                <button className={styles.confirmBtn} onClick={handleUpdateBudget}>✓</button>
              </div>
            ) : (
              <div className={styles.budgetEditRow}>
                <h2 className={styles.budgetAmount}>{formatSoles(budget)}</h2>
                <button className={styles.editBtn} onClick={() => { setIsEditingBudget(true); setNewBudgetInput(String(budget)); }}>
                  ✏️
                </button>
              </div>
            )}
          </div>
          <div className={styles.circleProgress}>
            <svg viewBox="0 0 36 36" className={styles.circleSvg}>
              <path className={styles.circleTrack} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path
                className={styles.circleFill}
                strokeDasharray={`${pct}, 100`}
                style={{ stroke: progressColor }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className={styles.circleText}>{Math.round(pct)}%</text>
            </svg>
          </div>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%`, backgroundColor: progressColor }} />
        </div>

        <div className={styles.summaryRow}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Gastado</span>
            <span className={styles.summaryValue} style={{ color: "var(--primary)" }}>{formatSoles(totalSpent)}</span>
          </div>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Disponible</span>
            <span className={styles.summaryValue} style={{ color: remaining >= 0 ? "var(--success)" : "var(--error)" }}>
              {formatSoles(Math.abs(remaining))} {remaining < 0 ? "(excedido)" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Savings Report */}
      <div className={`glass-panel ${styles.savingsCard}`}>
        <h3>💰 Tu Ahorro</h3>
        {periodCookedRecipes.length === 0 ? (
          <div className={styles.savingsEmpty}>
            <p>Cocina recetas para empezar a calcular tu ahorro</p>
          </div>
        ) : (
          <div className={styles.savingsContent}>
            <div className={styles.savingsMain}>
              <span className={styles.savingsLabel}>Ahorro total</span>
              <span className={styles.savingsAmount} style={{ color: totalSavings >= 0 ? "var(--success)" : "var(--error)" }}>
                {totalSavings >= 0 ? "+" : ""}{formatSoles(totalSavings)}
              </span>
            </div>
            <div className={styles.savingsDetails}>
              <div className={styles.savingsDetail}>
                <span className={styles.savingsDetailLabel}>Costo cocinando</span>
                <span className={styles.savingsDetailValue}>{formatSoles(totalCookingCost)}</span>
              </div>
              <div className={styles.savingsDetail}>
                <span className={styles.savingsDetailLabel}>Costo delivery</span>
                <span className={styles.savingsDetailValue}>{formatSoles(totalDeliveryCost)}</span>
              </div>
              <div className={styles.savingsDetail}>
                <span className={styles.savingsDetailLabel}>Recetas cocinadas</span>
                <span className={styles.savingsDetailValue}>{periodCookedRecipes.length}</span>
              </div>
            </div>
            <div className={styles.savingsProgress}>
              <div className={styles.savingsProgressBar}>
                <div 
                  className={styles.savingsProgressFill}
                  style={{ 
                    width: `${Math.min(savingsPercentage, 100)}%`,
                    backgroundColor: savingsPercentage >= 50 ? "var(--success)" : savingsPercentage >= 20 ? "#f4a261" : "var(--primary)"
                  }}
                />
              </div>
              <span className={styles.savingsProgressText}>
                {savingsPercentage.toFixed(1)}% de ahorro potencial
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Form */}
      {isAddingExpense && (
        <form className={`glass-panel ${styles.addForm}`} onSubmit={handleAddExpense}>
          <h3>Nuevo Gasto</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Descripción</label>
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej. Pollo del mercado" required />
            </div>
            <div className={styles.formGroup}>
              <label>Monto (S/)</label>
              <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
            <div className={styles.formGroup}>
              <label>Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className={styles.saveBtn}>Guardar Gasto</button>
        </form>
      )}

      {/* Category breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <div className={`glass-panel ${styles.categoryCard}`}>
          <h3>Por categoría</h3>
          <div className={styles.categoryList}>
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, total]) => (
              <div key={cat} className={styles.categoryItem}>
                <span className={styles.catIcon}>{CATEGORY_ICONS[cat]}</span>
                <div className={styles.catBar}>
                  <div className={styles.catLabelRow}>
                    <span className={styles.catName}>{cat}</span>
                    <span className={styles.catAmount}>{formatSoles(total)}</span>
                  </div>
                  <div className={styles.catProgressBg}>
                    <div
                      className={styles.catProgressFill}
                      style={{ width: `${(total / totalSpent) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Chart */}
      {periodExpenses.length > 0 && (
        <div className={`glass-panel ${styles.chartCard}`}>
          <h3>Gráfico de Gastos</h3>
          <div className={styles.chartContainer}>
            <div className={styles.chartBars}>
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, total], index) => {
                const maxValue = Math.max(...Object.values(byCategory));
                const height = (total / maxValue) * 100;
                return (
                  <div key={cat} className={styles.chartBarGroup}>
                    <div 
                      className={styles.chartBar}
                      style={{ 
                        height: `${height}%`,
                        backgroundColor: `hsl(${220 + index * 30}, 70%, 50%)`
                      }}
                    />
                    <span className={styles.chartBarLabel}>{CATEGORY_ICONS[cat]}</span>
                    <span className={styles.chartBarValue}>{formatSoles(total)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Expense list */}
      <div className={styles.listSection}>
        <h3>Historial de Gastos</h3>
        {filteredExpenses.length === 0 ? (
          <div className={styles.emptyState}>
            <p style={{ fontSize: "2.5rem" }}>💰</p>
            <p>{expenses.length === 0 ? "No has registrado ningún gasto aún." : "No se encontraron gastos con estos filtros."}</p>
          </div>
        ) : (
          <div className={styles.expenseList}>
            {filteredExpenses.map(exp => (
              <div key={exp.id} className={`glass-panel ${styles.expenseCard}`}>
                <span className={styles.expIcon}>{CATEGORY_ICONS[exp.category] || "🛍️"}</span>
                <div className={styles.expInfo}>
                  <span className={styles.expDesc}>{exp.description}</span>
                  <span className={styles.expMeta}>{exp.category} · {new Date(exp.date + "T00:00:00").toLocaleDateString()}</span>
                </div>
                <span className={styles.expAmount}>{formatSoles(exp.amount)}</span>
                <button className={styles.expDelete} onClick={() => handleRemove(exp.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
