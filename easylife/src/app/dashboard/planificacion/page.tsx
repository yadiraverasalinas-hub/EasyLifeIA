"use client";

import { useState, useEffect } from "react";
import { RECIPES, Recipe } from "@/lib/recipes";
import styles from "./planificacion.module.css";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEALS = ["Desayuno", "Almuerzo", "Cena"] as const;
type MealTime = typeof MEALS[number];

type WeekPlan = {
  [day: string]: {
    [meal in MealTime]?: string; // recipe id
  };
};

export default function Planificacion() {
  const [plan, setPlan] = useState<WeekPlan>({});
  const [selectedCell, setSelectedCell] = useState<{ day: string; meal: MealTime } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [todayIdx] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // 0=Mon
  });

  useEffect(() => {
    const saved = localStorage.getItem("easylife_week_plan");
    if (saved) setPlan(JSON.parse(saved));
  }, []);

  const savePlan = (updated: WeekPlan) => {
    setPlan(updated);
    localStorage.setItem("easylife_week_plan", JSON.stringify(updated));
  };

  const assignRecipe = (recipe: Recipe) => {
    if (!selectedCell) return;
    const updated = { ...plan };
    if (!updated[selectedCell.day]) updated[selectedCell.day] = {};
    updated[selectedCell.day][selectedCell.meal] = recipe.id;
    savePlan(updated);
    setSelectedCell(null);
    setSearchQuery("");
  };

  const clearCell = (day: string, meal: MealTime) => {
    const updated = { ...plan };
    if (updated[day]) {
      delete updated[day][meal];
      if (Object.keys(updated[day]).length === 0) delete updated[day];
    }
    savePlan(updated);
  };

  const getRecipe = (id?: string) => RECIPES.find(r => r.id === id);

  const filteredRecipes = RECIPES.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute shopping list from the weekly plan
  const generateShoppingList = () => {
    const needed = new Set<string>();
    const saved = localStorage.getItem("easylife_ingredients");
    const pantry: { name: string }[] = saved ? JSON.parse(saved) : [];
    const pantryNames = pantry.map(i => i.name.toLowerCase());

    Object.values(plan).forEach(dayPlan => {
      Object.values(dayPlan).forEach(recipeId => {
        const recipe = getRecipe(recipeId);
        if (recipe) {
          recipe.requiredIngredients.forEach(ri => {
            if (!pantryNames.some(n => n.includes(ri) || ri.includes(n))) {
              needed.add(ri);
            }
          });
        }
      });
    });

    if (needed.size === 0) {
      alert("✅ ¡Tienes todos los ingredientes para tu plan semanal!");
      return;
    }

    const existingSaved = localStorage.getItem("easylife_shopping_list");
    const existing: { id: string; name: string; checked: boolean; fromRecipe?: string }[] = existingSaved ? JSON.parse(existingSaved) : [];
    const newItems = [...needed]
      .filter(m => !existing.some(e => e.name.toLowerCase() === m))
      .map(m => ({ id: Date.now().toString() + Math.random(), name: m, checked: false, fromRecipe: "Plan semanal" }));

    localStorage.setItem("easylife_shopping_list", JSON.stringify([...existing, ...newItems]));
    alert(`✅ Se agregaron ${newItems.length} ingrediente(s) a tu lista de compras.`);
  };

  const mealColors: Record<MealTime, string> = {
    "Desayuno": "#fff3e0",
    "Almuerzo": "#e8f5e9",
    "Cena": "#e8eaf6",
  };

  return (
    <div className="animate-fade-in">
      <header className={styles.header}>
        <div>
          <h1>Plan Semanal</h1>
          <p className={styles.subtitle}>Organiza tus comidas de la semana</p>
        </div>
        <button className={styles.shoppingBtn} onClick={generateShoppingList}>
          🛒 Generar lista
        </button>
      </header>

      {/* Weekly grid */}
      <div className={styles.weekGrid}>
        {DAYS.map((day, idx) => (
          <div key={day} className={`glass-panel ${styles.dayCard} ${idx === todayIdx ? styles.today : ""}`}>
            <div className={styles.dayHeader}>
              <span className={styles.dayName}>{day}</span>
              {idx === todayIdx && <span className={styles.todayBadge}>Hoy</span>}
            </div>
            <div className={styles.mealsColumn}>
              {MEALS.map(meal => {
                const recipeId = plan[day]?.[meal];
                const recipe = getRecipe(recipeId);
                return (
                  <div
                    key={meal}
                    className={styles.mealSlot}
                    style={{ backgroundColor: recipe ? mealColors[meal] : undefined }}
                    onClick={() => {
                      if (!recipe) setSelectedCell({ day, meal });
                    }}
                  >
                    <span className={styles.mealLabel}>{meal}</span>
                    {recipe ? (
                      <div className={styles.assignedRecipe}>
                        <span className={styles.recipeEmoji}>{recipe.emoji}</span>
                        <span className={styles.recipeName}>{recipe.name}</span>
                        <button
                          className={styles.removeBtn}
                          onClick={e => { e.stopPropagation(); clearCell(day, meal); }}
                        >✕</button>
                      </div>
                    ) : (
                      <span className={styles.addSlot}>+ Agregar</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Recipe picker modal */}
      {selectedCell && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCell(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Elegir receta</h3>
              <p className={styles.modalSub}>{selectedCell.day} · {selectedCell.meal}</p>
              <button className={styles.closeBtn} onClick={() => setSelectedCell(null)}>✕</button>
            </div>
            <input
              type="search"
              placeholder="🔍 Buscar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
            <div className={styles.recipePickerList}>
              {filteredRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  className={styles.recipePickerItem}
                  onClick={() => assignRecipe(recipe)}
                >
                  <span className={styles.pickerEmoji}>{recipe.emoji}</span>
                  <div className={styles.pickerInfo}>
                    <span className={styles.pickerName}>{recipe.name}</span>
                    <span className={styles.pickerMeta}>{recipe.timeMinutes} min · {recipe.difficulty}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
