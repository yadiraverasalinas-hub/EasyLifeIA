"use client";

import { useState, useEffect } from "react";
import { RECIPES, Recipe } from "@/lib/recipes";
import styles from "./recetas.module.css";

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expiry: string;
}

export default function Recetas() {
  const [pantryIngredients, setPantryIngredients] = useState<string[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [filterMode, setFilterMode] = useState<"available" | "all" | "quick">("available");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("easylife_ingredients");
    const pantry: Ingredient[] = saved ? JSON.parse(saved) : [];
    const names = pantry.map(i => i.name.toLowerCase().trim());
    setPantryIngredients(names);

    const savedProfile = localStorage.getItem("easylife_profile");
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));

    const sorted = [...RECIPES].sort((a, b) => {
      const aMatch = a.requiredIngredients.filter(ri => names.some(n => n.includes(ri) || ri.includes(n))).length;
      const bMatch = b.requiredIngredients.filter(ri => names.some(n => n.includes(ri) || ri.includes(n))).length;
      return bMatch - aMatch;
    });
    setAllRecipes(sorted);
  }, []);

  useEffect(() => {
    let result = [...allRecipes];
    
    // Apply user preferences if available
    if (userProfile) {
      // Filter by max cooking time
      if (userProfile.preferences?.maxCookingTime) {
        result = result.filter(r => r.timeMinutes <= userProfile.preferences.maxCookingTime);
      }
      
      // Prioritize favorite categories
      if (userProfile.preferences?.favoriteCategories?.length > 0) {
        result = result.sort((a, b) => {
          const aFav = userProfile.preferences.favoriteCategories.includes(a.category) ? 1 : 0;
          const bFav = userProfile.preferences.favoriteCategories.includes(b.category) ? 1 : 0;
          return bFav - aFav;
        });
      }
    }
    
    if (filterMode === "available") {
      result = result.filter(r =>
        r.requiredIngredients.some(ri =>
          pantryIngredients.some(n => n.includes(ri) || ri.includes(n))
        )
      );
    } else if (filterMode === "quick") {
      result = result.filter(r => r.timeMinutes <= 20);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }
    setFilteredRecipes(result);
  }, [filterMode, allRecipes, pantryIngredients, searchQuery, userProfile]);

  const getMatchCount = (recipe: Recipe) => {
    return recipe.requiredIngredients.filter(ri =>
      pantryIngredients.some(n => n.includes(ri) || ri.includes(n))
    ).length;
  };

  const getMatchPercent = (recipe: Recipe) => {
    const total = recipe.requiredIngredients.length;
    const match = getMatchCount(recipe);
    return total === 0 ? 100 : Math.round((match / total) * 100);
  };

  const isFavoriteCategory = (recipe: Recipe) => {
    return userProfile?.preferences?.favoriteCategories?.includes(recipe.category);
  };

  const isWithinTimeLimit = (recipe: Recipe) => {
    if (!userProfile?.preferences?.maxCookingTime) return true;
    return recipe.timeMinutes <= userProfile.preferences.maxCookingTime;
  };

  const addMissingToCart = (recipe: Recipe) => {
    const missing = recipe.requiredIngredients.filter(
      ri => !pantryIngredients.some(n => n.includes(ri) || ri.includes(n))
    );
    if (missing.length === 0) {
      alert("¡Ya tienes todos los ingredientes necesarios!");
      return;
    }
    const saved = localStorage.getItem("easylife_shopping_list");
    const existing: { id: string; name: string; checked: boolean; fromRecipe?: string }[] = saved ? JSON.parse(saved) : [];
    const newItems = missing
      .filter(m => !existing.some(e => e.name.toLowerCase() === m))
      .map(m => ({ id: Date.now().toString() + Math.random(), name: m, checked: false, fromRecipe: recipe.name }));
    localStorage.setItem("easylife_shopping_list", JSON.stringify([...existing, ...newItems]));
    alert(`✅ Se agregaron ${newItems.length} ingrediente(s) a tu lista de compras.`);
  };

  const markAsCooked = (recipe: Recipe) => {
    // Estimate costs (simplified calculation)
    const estimatedCookingCost = recipe.timeMinutes * 0.5; // S/0.50 per minute of cooking
    const estimatedDeliveryCost = estimatedCookingCost * 2.5; // Delivery is ~2.5x more expensive
    
    const cookedRecipe = {
      id: Date.now().toString(),
      recipeId: recipe.id,
      recipeName: recipe.name,
      date: new Date().toISOString().split("T")[0],
      estimatedCost: estimatedCookingCost,
      estimatedDeliveryCost: estimatedDeliveryCost
    };
    
    const saved = localStorage.getItem("easylife_cooked_recipes");
    const existing = saved ? JSON.parse(saved) : [];
    localStorage.setItem("easylife_cooked_recipes", JSON.stringify([...existing, cookedRecipe]));
    
    const savings = estimatedDeliveryCost - estimatedCookingCost;
    alert(`✅ ¡Receta cocinada! Ahorraste aproximadamente S/ ${savings.toFixed(2)} comparado con pedir delivery.`);
  };

  if (selectedRecipe) {
    const matchPct = getMatchPercent(selectedRecipe);
    const missing = selectedRecipe.requiredIngredients.filter(
      ri => !pantryIngredients.some(n => n.includes(ri) || ri.includes(n))
    );
    return (
      <div className="animate-fade-in">
        <button className={styles.backBtn} onClick={() => setSelectedRecipe(null)}>
          ← Volver
        </button>
        <div className={`glass-panel ${styles.detailCard}`}>
          <div className={styles.detailHeader}>
            <span className={styles.bigEmoji}>{selectedRecipe.emoji}</span>
            <div>
              <h1>{selectedRecipe.name}</h1>
              <p className={styles.detailDesc}>{selectedRecipe.description}</p>
            </div>
          </div>
          <div className={styles.detailMeta}>
            <span>⏱ {selectedRecipe.timeMinutes} min</span>
            <span>👥 {selectedRecipe.servings} porciones</span>
            <span>📊 {selectedRecipe.difficulty}</span>
          </div>

          <div className={styles.matchBanner} style={{ "--pct": `${matchPct}%` } as React.CSSProperties}>
            <div className={styles.matchBar}><div className={styles.matchFill} /></div>
            <p>{matchPct}% de ingredientes disponibles</p>
          </div>

          {missing.length > 0 && (
            <div className={styles.missingBox}>
              <p>❗ Faltan: <strong>{missing.join(", ")}</strong></p>
              <button className={styles.cartBtn} onClick={() => addMissingToCart(selectedRecipe)}>
                + Agregar a Lista de Compras
              </button>
            </div>
          )}

          <button className={styles.cookBtn} onClick={() => markAsCooked(selectedRecipe)}>
            🍳 Marcar como cocinada
          </button>

          <h3>Ingredientes principales</h3>
          <ul className={styles.ingList}>
            {selectedRecipe.requiredIngredients.map(ri => {
              const have = pantryIngredients.some(n => n.includes(ri) || ri.includes(n));
              return (
                <li key={ri} className={have ? styles.ingHave : styles.ingMissing}>
                  {have ? "✅" : "❌"} {ri}
                </li>
              );
            })}
          </ul>

          <h3>Pasos</h3>
          <ol className={styles.stepsList}>
            {selectedRecipe.steps.map((step, i) => (
              <li key={i} className={styles.step}>{step}</li>
            ))}
          </ol>

          {selectedRecipe.tips && (
            <div className={styles.tipBox}>
              <p>💡 <strong>Tip:</strong> {selectedRecipe.tips}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className={styles.header}>
        <div>
          <h1>Recetas</h1>
          <p className={styles.subtitle}>Basadas en tu despensa</p>
        </div>
      </header>

      <div className={styles.searchBar}>
        <input
          type="search"
          placeholder="🔍 Buscar receta..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.filterChips}>
        <button
          className={`${styles.chip} ${filterMode === "available" ? styles.chipActive : ""}`}
          onClick={() => setFilterMode("available")}
        >
          Con mis ingredientes
        </button>
        <button
          className={`${styles.chip} ${filterMode === "quick" ? styles.chipActive : ""}`}
          onClick={() => setFilterMode("quick")}
        >
          ⚡ Rápidas (&lt;20 min)
        </button>
        <button
          className={`${styles.chip} ${filterMode === "all" ? styles.chipActive : ""}`}
          onClick={() => setFilterMode("all")}
        >
          Todas
        </button>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className={styles.emptyState}>
          <p style={{ fontSize: "3rem" }}>🥺</p>
          <p>No encontramos recetas que coincidan.</p>
          <p style={{ fontSize: "0.85rem" }}>Intenta agregar más ingredientes a tu despensa.</p>
        </div>
      ) : (
        <div className={styles.recipesGrid}>
          {filteredRecipes.map(recipe => {
            const pct = getMatchPercent(recipe);
            return (
              <div
                key={recipe.id}
                className={`glass-panel ${styles.recipeCard}`}
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className={styles.cardTop}>
                  <span className={styles.emoji}>{recipe.emoji}</span>
                  <div className={styles.badgeGroup}>
                    <span className={`${styles.diffBadge} ${styles["diff_" + recipe.difficulty.toLowerCase().replace("á","a").replace("é","e").replace("í","i")]}`}>
                      {recipe.difficulty}
                    </span>
                    {isFavoriteCategory(recipe) && (
                      <span className={styles.favBadge}>⭐ Favorita</span>
                    )}
                    {isWithinTimeLimit(recipe) && userProfile?.preferences?.maxCookingTime && (
                      <span className={styles.timeBadge}>⏱ Tiempo ok</span>
                    )}
                  </div>
                </div>
                <h3 className={styles.recipeName}>{recipe.name}</h3>
                <p className={styles.recipeDesc}>{recipe.description}</p>
                <div className={styles.cardMeta}>
                  <span>⏱ {recipe.timeMinutes} min</span>
                  <span>👥 {recipe.servings}</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? "var(--success)" : pct >= 40 ? "#f4a261" : "var(--primary)" }}
                  />
                </div>
                <p className={styles.matchLabel}>{pct}% de ingredientes disponibles</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
