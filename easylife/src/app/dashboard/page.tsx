"use client";

import { useState, useEffect } from "react";
import styles from "./pantry.module.css";

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expiry: string;
}

function getExpiryStatus(expiry: string): "expired" | "soon" | "ok" | "none" {
  if (!expiry) return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiry + "T00:00:00");
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "soon";
  return "ok";
}

export default function Pantry() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("Unidad");
  const [expiry, setExpiry] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("easylife_ingredients");
    if (saved) {
      setIngredients(JSON.parse(saved));
    } else {
      const mockData = [
        { id: "1", name: "Tomate", quantity: "3", unit: "Unidades", expiry: "2026-06-23" },
        { id: "2", name: "Huevos", quantity: "6", unit: "Unidades", expiry: "2026-07-01" },
        { id: "3", name: "Arroz", quantity: "1", unit: "Kg", expiry: "2026-12-10" },
        { id: "4", name: "Leche", quantity: "1", unit: "L", expiry: "2026-06-21" },
      ];
      setIngredients(mockData);
      localStorage.setItem("easylife_ingredients", JSON.stringify(mockData));
    }
  }, []);

  const save = (updated: Ingredient[]) => {
    setIngredients(updated);
    localStorage.setItem("easylife_ingredients", JSON.stringify(updated));
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;
    const newIngredient: Ingredient = { id: Date.now().toString(), name, quantity, unit, expiry };
    save([...ingredients, newIngredient]);
    setName(""); setQuantity(""); setUnit("Unidad"); setExpiry("");
    setIsAdding(false);
  };

  const removeIngredient = (id: string) => save(ingredients.filter(i => i.id !== id));

  const filtered = ingredients.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by expiry alerts
  const expiredItems = filtered.filter(i => getExpiryStatus(i.expiry) === "expired");
  const soonItems = filtered.filter(i => getExpiryStatus(i.expiry) === "soon");
  const okItems = filtered.filter(i => !["expired", "soon"].includes(getExpiryStatus(i.expiry)));

  const IngredientCard = ({ ing }: { ing: Ingredient }) => {
    const status = getExpiryStatus(ing.expiry);
    return (
      <div key={ing.id} className={`glass-panel ${styles.ingredientCard} ${styles["expiry_" + status]}`}>
        <div className={styles.ingEmoji}>
          {status === "expired" ? "⛔" : status === "soon" ? "⚠️" : "✅"}
        </div>
        <div className={styles.ingInfo}>
          <h4>{ing.name}</h4>
          <span className={styles.ingQty}>{ing.quantity} {ing.unit}</span>
          {ing.expiry && (
            <span className={`${styles.ingExpiry} ${styles["expiryText_" + status]}`}>
              {status === "expired"
                ? `Venció: ${new Date(ing.expiry + "T00:00:00").toLocaleDateString()}`
                : status === "soon"
                  ? `⚠️ Vence pronto: ${new Date(ing.expiry + "T00:00:00").toLocaleDateString()}`
                  : `Vence: ${new Date(ing.expiry + "T00:00:00").toLocaleDateString()}`}
            </span>
          )}
        </div>
        <button className={styles.deleteBtn} onClick={() => removeIngredient(ing.id)} title="Eliminar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"/>
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <header className={styles.header}>
        <div>
          <h1>Mi Despensa</h1>
          <p className={styles.subtitle}>{ingredients.length} ingrediente(s) en casa</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "✕ Cancelar" : "+ Agregar"}
        </button>
      </header>

      {/* Alertas de vencimiento */}
      {(expiredItems.length > 0 || soonItems.length > 0) && !isAdding && (
        <div className={styles.alertBanner}>
          {expiredItems.length > 0 && (
            <p>⛔ <strong>{expiredItems.length}</strong> ingrediente(s) vencido(s): {expiredItems.map(i => i.name).join(", ")}</p>
          )}
          {soonItems.length > 0 && (
            <p>⚠️ <strong>{soonItems.length}</strong> vence(n) pronto: {soonItems.map(i => i.name).join(", ")}</p>
          )}
        </div>
      )}

      {isAdding && (
        <form className={`glass-panel ${styles.addForm}`} onSubmit={handleAddIngredient}>
          <h3>Nuevo Ingrediente</h3>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label>Nombre</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Pollo" required autoFocus />
            </div>
          </div>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label>Cantidad</label>
              <input type="number" min="0.1" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Ej. 1" required />
            </div>
            <div className={styles.inputGroup}>
              <label>Unidad</label>
              <select value={unit} onChange={e => setUnit(e.target.value)}>
                <option>Unidad</option><option>Kg</option><option>g</option><option>L</option><option>ml</option>
              </select>
            </div>
          </div>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label>Vencimiento (Opcional)</label>
              <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} />
            </div>
          </div>
          <button type="submit" className={styles.saveBtn}>Guardar Ingrediente</button>
        </form>
      )}

      {/* Search */}
      {!isAdding && ingredients.length > 0 && (
        <input
          type="search"
          className={styles.searchInput}
          placeholder="🔍 Buscar ingrediente..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      )}

      <div className={styles.listContainer}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{searchQuery ? "No encontramos ese ingrediente." : "Tu despensa está vacía."}</p>
            <p style={{ fontSize: "0.85rem" }}>Agrega ingredientes para recibir recomendaciones.</p>
          </div>
        ) : (
          <>
            {expiredItems.length > 0 && (
              <div className={styles.groupSection}>
                <p className={styles.groupLabel}>⛔ Vencidos</p>
                {expiredItems.map(ing => <IngredientCard key={ing.id} ing={ing} />)}
              </div>
            )}
            {soonItems.length > 0 && (
              <div className={styles.groupSection}>
                <p className={styles.groupLabel}>⚠️ Por vencer</p>
                {soonItems.map(ing => <IngredientCard key={ing.id} ing={ing} />)}
              </div>
            )}
            {okItems.length > 0 && (
              <div className={styles.groupSection}>
                {(expiredItems.length > 0 || soonItems.length > 0) && <p className={styles.groupLabel}>✅ En buen estado</p>}
                {okItems.map(ing => <IngredientCard key={ing.id} ing={ing} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
