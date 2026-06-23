"use client";

import { useState, useEffect } from "react";
import styles from "./compras.module.css";

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  fromRecipe?: string;
  quantity?: string;
}

export default function Compras() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newQty, setNewQty] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("easylife_shopping_list");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const saveItems = (updated: ShoppingItem[]) => {
    setItems(updated);
    localStorage.setItem("easylife_shopping_list", JSON.stringify(updated));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const item: ShoppingItem = {
      id: Date.now().toString(),
      name: newItem.trim(),
      quantity: newQty.trim(),
      checked: false,
    };
    saveItems([...items, item]);
    setNewItem("");
    setNewQty("");
    setIsAdding(false);
  };

  const toggleItem = (id: string) => {
    saveItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const removeItem = (id: string) => {
    saveItems(items.filter(i => i.id !== id));
  };

  const clearChecked = () => {
    saveItems(items.filter(i => !i.checked));
  };

  // Move checked to pantry
  const moveToPantry = () => {
    const checkedItems = items.filter(i => i.checked);
    if (checkedItems.length === 0) return;

    const saved = localStorage.getItem("easylife_ingredients");
    const pantry: { id: string; name: string; quantity: string; unit: string; expiry: string }[] = saved ? JSON.parse(saved) : [];

    const newPantryItems = checkedItems.map(item => ({
      id: Date.now().toString() + Math.random(),
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      quantity: item.quantity || "1",
      unit: "Unidad",
      expiry: "",
    }));

    localStorage.setItem("easylife_ingredients", JSON.stringify([...pantry, ...newPantryItems]));
    saveItems(items.filter(i => !i.checked));
    alert(`✅ ${newPantryItems.length} ítem(s) movidos a tu despensa.`);
  };

  const pending = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);

  return (
    <div className="animate-fade-in">
      <header className={styles.header}>
        <div>
          <h1>Lista de Compras</h1>
          <p className={styles.subtitle}>{pending.length} pendiente(s) · {checked.length} comprado(s)</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "✕" : "+ Añadir"}
        </button>
      </header>

      {isAdding && (
        <form className={`glass-panel ${styles.addForm}`} onSubmit={handleAdd}>
          <div className={styles.formRow}>
            <input
              type="text"
              placeholder="Nombre del ítem"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              className={styles.addInput}
              required
              autoFocus
            />
            <input
              type="text"
              placeholder="Cantidad"
              value={newQty}
              onChange={e => setNewQty(e.target.value)}
              className={styles.addQtyInput}
            />
            <button type="submit" className={styles.saveBtn}>Agregar</button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <p style={{ fontSize: "3rem" }}>🛒</p>
          <p>Tu lista de compras está vacía.</p>
          <p style={{ fontSize: "0.85rem" }}>Puedes agregar ítems manualmente o desde una receta.</p>
        </div>
      ) : (
        <>
          {/* Pending items */}
          {pending.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Por comprar</h3>
              <div className={styles.list}>
                {pending.map(item => (
                  <div key={item.id} className={`glass-panel ${styles.itemCard}`}>
                    <button className={styles.checkbox} onClick={() => toggleItem(item.id)}>
                      <div className={styles.checkboxCircle} />
                    </button>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      {item.quantity && <span className={styles.itemQty}>{item.quantity}</span>}
                      {item.fromRecipe && (
                        <span className={styles.itemRecipe}>Para: {item.fromRecipe}</span>
                      )}
                    </div>
                    <button className={styles.deleteBtn} onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checked items */}
          {checked.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Comprados ✅</h3>
                <div className={styles.actionBtns}>
                  <button className={styles.actionBtn} onClick={moveToPantry}>
                    📦 Mover a despensa
                  </button>
                  <button className={`${styles.actionBtn} ${styles.clearBtn}`} onClick={clearChecked}>
                    🗑 Limpiar
                  </button>
                </div>
              </div>
              <div className={styles.list}>
                {checked.map(item => (
                  <div key={item.id} className={`glass-panel ${styles.itemCard} ${styles.checkedCard}`}>
                    <button className={`${styles.checkbox} ${styles.checkboxDone}`} onClick={() => toggleItem(item.id)}>
                      <div className={styles.checkboxCircleFill}>✓</div>
                    </button>
                    <div className={styles.itemInfo}>
                      <span className={`${styles.itemName} ${styles.strikethrough}`}>{item.name}</span>
                      {item.quantity && <span className={styles.itemQty}>{item.quantity}</span>}
                    </div>
                    <button className={styles.deleteBtn} onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
