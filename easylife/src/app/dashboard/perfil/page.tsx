"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RECIPES } from "@/lib/recipes";
import styles from "./perfil.module.css";

interface UserProfile {
  email: string;
  name: string;
  dietaryRestrictions: string[];
  preferences: {
    maxCookingTime: number;
    favoriteCategories: string[];
    dislikedIngredients: string[];
  };
}

export default function Perfil() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [ingredientCount, setIngredientCount] = useState(0);
  const [shoppingCount, setShoppingCount] = useState(0);
  const [recipeCount, setRecipeCount] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [cookedRecipes, setCookedRecipes] = useState<any[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("easylife_user");
    if (user) setEmail(JSON.parse(user).email || "usuario@ejemplo.com");
    const pantry = localStorage.getItem("easylife_ingredients");
    if (pantry) setIngredientCount(JSON.parse(pantry).length);
    const cart = localStorage.getItem("easylife_shopping_list");
    if (cart) setShoppingCount(JSON.parse(cart).filter((i: { checked: boolean }) => !i.checked).length);
    setRecipeCount(RECIPES.length);
    
    const savedProfile = localStorage.getItem("easylife_profile");
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    
    const savedCooked = localStorage.getItem("easylife_cooked_recipes");
    if (savedCooked) setCookedRecipes(JSON.parse(savedCooked));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("easylife_user");
    router.push("/");
  };

  const handleClearAll = () => {
    if (confirm("¿Seguro que deseas limpiar toda la aplicación? Se eliminarán todos tus datos.")) {
      localStorage.removeItem("easylife_ingredients");
      localStorage.removeItem("easylife_shopping_list");
      alert("Datos limpiados correctamente.");
      router.refresh();
    }
  };

  const handleSavePreferences = (newProfile: UserProfile) => {
    localStorage.setItem("easylife_profile", JSON.stringify(newProfile));
    setProfile(newProfile);
    setIsEditingPreferences(false);
    alert("Preferencias guardadas correctamente.");
  };

  function PreferencesForm({ 
    profile, 
    onSave, 
    onCancel 
  }: { 
    profile: UserProfile; 
    onSave: (p: UserProfile) => void; 
    onCancel: () => void; 
  }) {
    const [restrictions, setRestrictions] = useState<string[]>(profile.dietaryRestrictions);
    const [maxTime, setMaxTime] = useState(profile.preferences.maxCookingTime);
    const [categories, setCategories] = useState<string[]>(profile.preferences.favoriteCategories);
    
    const ALL_RESTRICTIONS = ["Vegetariano", "Sin gluten", "Sin lactosa", "Vegano", "Bajo en sodio"];
    const ALL_CATEGORIES = ["Arroz", "Pastas", "Sopas", "Ensaladas", "Desayuno", "Pollo", "Carnes", "Snacks"];
    
    const toggleRestriction = (r: string) => {
      setRestrictions(prev => 
        prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
      );
    };
    
    const toggleCategory = (c: string) => {
      setCategories(prev => 
        prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
      );
    };
    
    const handleSave = () => {
      onSave({
        ...profile,
        dietaryRestrictions: restrictions,
        preferences: {
          ...profile.preferences,
          maxCookingTime: maxTime,
          favoriteCategories: categories
        }
      });
    };
    
    return (
      <div className={styles.preferencesForm}>
        <div className={styles.formSection}>
          <label>Restricciones alimenticias:</label>
          <div className={styles.checkboxGroup}>
            {ALL_RESTRICTIONS.map(r => (
              <label key={r} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={restrictions.includes(r)}
                  onChange={() => toggleRestriction(r)}
                />
                {r}
              </label>
            ))}
          </div>
        </div>
        
        <div className={styles.formSection}>
          <label>Tiempo máximo de cocción (minutos):</label>
          <input
            type="number"
            min="5"
            max="120"
            value={maxTime}
            onChange={e => setMaxTime(Number(e.target.value))}
            className={styles.numberInput}
          />
        </div>
        
        <div className={styles.formSection}>
          <label>Categorías favoritas:</label>
          <div className={styles.checkboxGroup}>
            {ALL_CATEGORIES.map(c => (
              <label key={c} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={categories.includes(c)}
                  onChange={() => toggleCategory(c)}
                />
                {c}
              </label>
            ))}
          </div>
        </div>
        
        <div className={styles.formActions}>
          <button onClick={onCancel} className={styles.cancelBtn}>Cancelar</button>
          <button onClick={handleSave} className={styles.saveBtn}>Guardar</button>
        </div>
      </div>
    );
  }

  function NutritionReport({ cookedRecipes }: { cookedRecipes: any[] }) {
    const DAILY_CALORIES = 2000;
    
    // Get recipes from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRecipes = cookedRecipes.filter((r: any) => {
      const recipeDate = new Date(r.date + "T00:00:00");
      return recipeDate >= sevenDaysAgo;
    });
    
    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    recentRecipes.forEach((cooked: any) => {
      const recipe = RECIPES.find((r) => r.id === cooked.recipeId);
      if (recipe?.nutrition) {
        totalCalories += recipe.nutrition.calories;
        totalProtein += recipe.nutrition.protein;
        totalCarbs += recipe.nutrition.carbs;
        totalFat += recipe.nutrition.fat;
      }
    });
    
    const caloriePercentage = Math.min((totalCalories / DAILY_CALORIES) * 100, 100);
    const isWithinRange = totalCalories <= DAILY_CALORIES * 1.1 && totalCalories >= DAILY_CALORIES * 0.9;
    
    if (recentRecipes.length === 0) {
      return (
        <div className={styles.nutritionEmpty}>
          <p>Cocina recetas para ver tu reporte nutricional</p>
        </div>
      );
    }
    
    return (
      <div className={styles.nutritionContent}>
        <div className={styles.nutritionSummary}>
          <div className={styles.calorieMain}>
            <span className={styles.calorieLabel}>Calorías totales</span>
            <span 
              className={styles.calorieAmount}
              style={{ color: isWithinRange ? "var(--success)" : totalCalories > DAILY_CALORIES ? "var(--error)" : "#f4a261" }}
            >
              {totalCalories} kcal
            </span>
            <span className={styles.calorieTarget}>/ {DAILY_CALORIES} kcal objetivo</span>
          </div>
          <div className={styles.calorieBar}>
            <div 
              className={styles.calorieFill}
              style={{ 
                width: `${caloriePercentage}%`,
                backgroundColor: isWithinRange ? "var(--success)" : totalCalories > DAILY_CALORIES ? "var(--error)" : "#f4a261"
              }}
            />
          </div>
        </div>
        
        <div className={styles.macronutrients}>
          <div className={styles.macroItem}>
            <span className={styles.macroLabel}>Proteínas</span>
            <span className={styles.macroValue}>{totalProtein}g</span>
            <div className={styles.macroBar}>
              <div className={styles.macroFill} style={{ width: `${(totalProtein / 100) * 100}%`, backgroundColor: "#3b82f6" }} />
            </div>
          </div>
          <div className={styles.macroItem}>
            <span className={styles.macroLabel}>Carbos</span>
            <span className={styles.macroValue}>{totalCarbs}g</span>
            <div className={styles.macroBar}>
              <div className={styles.macroFill} style={{ width: `${(totalCarbs / 250) * 100}%`, backgroundColor: "#10b981" }} />
            </div>
          </div>
          <div className={styles.macroItem}>
            <span className={styles.macroLabel}>Grasas</span>
            <span className={styles.macroValue}>{totalFat}g</span>
            <div className={styles.macroBar}>
              <div className={styles.macroFill} style={{ width: `${(totalFat / 70) * 100}%`, backgroundColor: "#f59e0b" }} />
            </div>
          </div>
        </div>
        
        <div className={styles.nutritionFooter}>
          <span className={styles.recipeCount}>{recentRecipes.length} recetas cocinadas</span>
          <span className={styles.periodLabel}>Últimos 7 días</span>
        </div>
      </div>
    );
  }

  const avatar = email.charAt(0).toUpperCase();

  return (
    <div className="animate-fade-in">
      <header className={styles.header}>
        <h1>Mi Perfil</h1>
      </header>

      <div className={`glass-panel ${styles.avatarCard}`}>
        <div className={styles.avatarCircle}>{avatar}</div>
        <div>
          <h2 className={styles.userName}>{email.split("@")[0]}</h2>
          <p className={styles.userEmail}>{email}</p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={`glass-panel ${styles.statCard}`}>
          <span className={styles.statNum}>{ingredientCount}</span>
          <span className={styles.statLabel}>Ingredientes</span>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <span className={styles.statNum}>{recipeCount}</span>
          <span className={styles.statLabel}>Recetas disponibles</span>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <span className={styles.statNum}>{shoppingCount}</span>
          <span className={styles.statLabel}>Por comprar</span>
        </div>
      </div>

      <div className={`glass-panel ${styles.preferencesCard}`}>
        <div className={styles.preferencesHeader}>
          <h3>🥗 Preferencias Alimenticias</h3>
          <button 
            className={styles.editBtn}
            onClick={() => setIsEditingPreferences(!isEditingPreferences)}
          >
            {isEditingPreferences ? "✕" : "✏️ Editar"}
          </button>
        </div>
        
        {isEditingPreferences ? (
          <PreferencesForm 
            profile={profile || { email, name: email.split("@")[0], dietaryRestrictions: [], preferences: { maxCookingTime: 30, favoriteCategories: [], dislikedIngredients: [] }}}
            onSave={handleSavePreferences}
            onCancel={() => setIsEditingPreferences(false)}
          />
        ) : (
          <div className={styles.preferencesDisplay}>
            {profile ? (
              <>
                <div className={styles.preferenceSection}>
                  <span className={styles.preferenceLabel}>Restricciones:</span>
                  <span className={styles.preferenceValue}>
                    {profile.dietaryRestrictions.length > 0 ? profile.dietaryRestrictions.join(", ") : "Ninguna"}
                  </span>
                </div>
                <div className={styles.preferenceSection}>
                  <span className={styles.preferenceLabel}>Tiempo máximo:</span>
                  <span className={styles.preferenceValue}>{profile.preferences.maxCookingTime} min</span>
                </div>
                <div className={styles.preferenceSection}>
                  <span className={styles.preferenceLabel}>Categorías favoritas:</span>
                  <span className={styles.preferenceValue}>
                    {profile.preferences.favoriteCategories.length > 0 ? profile.preferences.favoriteCategories.join(", ") : "No especificadas"}
                  </span>
                </div>
              </>
            ) : (
              <p className={styles.noPreferences}>No has configurado tus preferencias aún</p>
            )}
          </div>
        )}
      </div>

      {/* Nutritional Report */}
      <div className={`glass-panel ${styles.nutritionCard}`}>
        <div className={styles.nutritionHeader}>
          <h3>🥗 Reporte Nutricional</h3>
          <span className={styles.nutritionPeriod}>Últimos 7 días</span>
        </div>
        <NutritionReport cookedRecipes={cookedRecipes} />
      </div>

      {/* Subscription */}
      <div className={`glass-panel ${styles.subscriptionCard}`}>
        <div className={styles.subscriptionHeader}>
          <h3>⭐ Suscripción Premium</h3>
          <span className={styles.currentPlan}>Plan Gratuito</span>
        </div>
        <div className={styles.subscriptionContent}>
          <p className={styles.subscriptionDesc}>
            Obtén acceso a funciones premium como recetas ilimitadas, reportes avanzados y más.
          </p>
          <button className={styles.upgradeBtn}>
            Actualizar a Premium - S/ 19.90/mes
          </button>
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Recetas ilimitadas</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Reportes nutricionales detallados</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Planificación inteligente con IA</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`glass-panel ${styles.settingsCard}`}>
        <h3>Configuración</h3>
        <button className={styles.settingItem} onClick={handleClearAll}>
          <span>🗑 Limpiar mis datos</span>
          <span className={styles.arrow}>›</span>
        </button>
        <div className={styles.divider} />
        <button className={`${styles.settingItem} ${styles.logoutItem}`} onClick={handleLogout}>
          <span>🚪 Cerrar sesión</span>
          <span className={styles.arrow}>›</span>
        </button>
      </div>

      <p className={styles.version}>EasyLife AI · MVP v1.0</p>
    </div>
  );
}
