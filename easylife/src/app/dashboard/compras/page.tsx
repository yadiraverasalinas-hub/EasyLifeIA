"use client";

import { useState, useEffect } from "react";
import styles from "./compras.module.css";

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  fromRecipe?: string;
  quantity?: string;
  unit?: string;
  category?: string;
  priority?: "low" | "medium" | "high";
}

export default function Compras() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newUnit, setNewUnit] = useState("Unidad");
  const [newCategory, setNewCategory] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
      unit: newUnit,
      category: newCategory.trim(),
      priority: newPriority,
      checked: false,
    };
    saveItems([...items, item]);
    setNewItem("");
    setNewQty("");
    setNewUnit("Unidad");
    setNewCategory("");
    setNewPriority("medium");
    setIsAdding(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim() || !editingId) return;
    const updatedItems = items.map(i =>
      i.id === editingId ? { ...i, name: newItem.trim(), quantity: newQty.trim(), unit: newUnit, category: newCategory.trim(), priority: newPriority } : i
    );
    saveItems(updatedItems);
    setNewItem("");
    setNewQty("");
    setNewUnit("Unidad");
    setNewCategory("");
    setNewPriority("medium");
    setIsEditing(false);
    setEditingId(null);
  };

  const startEdit = (item: ShoppingItem) => {
    setNewItem(item.name);
    setNewQty(item.quantity || "");
    setNewUnit(item.unit || "Unidad");
    setNewCategory(item.category || "");
    setNewPriority(item.priority || "medium");
    setEditingId(item.id);
    setIsEditing(true);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setNewItem("");
    setNewQty("");
    setNewUnit("Unidad");
    setNewCategory("");
    setNewPriority("medium");
    setIsEditing(false);
    setEditingId(null);
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
        <button className={styles.addBtn} onClick={() => {
          if (isEditing) {
            cancelEdit();
          } else {
            setIsAdding(!isAdding);
          }
        }}>
          {isEditing ? "✕ Cancelar Edición" : isAdding ? "✕" : "+ Añadir"}
        </button>
      </header>

      {(isAdding || isEditing) && (
        <form className={`glass-panel ${styles.addForm}`} onSubmit={isEditing ? handleEdit : handleAdd}>
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
          </div>
          <div className={styles.formRow}>
            <select
              value={newUnit}
              onChange={e => setNewUnit(e.target.value)}
              className={styles.addSelect}
            >
              <option value="Unidad">Unidad</option>
              <option value="Kg">Kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="ml">ml</option>
              <option value="Paquete">Paquete</option>
              <option value="Caja">Caja</option>
              <option value="Botella">Botella</option>
            </select>
            <input
              type="text"
              placeholder="Categoría (opcional)"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className={styles.addInput}
            />
          </div>
          <div className={styles.formRow}>
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as "low" | "medium" | "high")}
              className={styles.addSelect}
            >
              <option value="low">Prioridad baja</option>
              <option value="medium">Prioridad media</option>
              <option value="high">Prioridad alta</option>
            </select>
            <button type="submit" className={styles.saveBtn}>
              {isEditing ? "Actualizar" : "Agregar"}
            </button>
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
                  <div key={item.id} className={`glass-panel ${styles.itemCard} ${styles["priority_" + item.priority]}`}>
                    <button className={styles.checkbox} onClick={() => toggleItem(item.id)}>
                      <div className={styles.checkboxCircle} />
                    </button>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      <div className={styles.itemDetails}>
                        {item.quantity && <span className={styles.itemQty}>{item.quantity} {item.unit}</span>}
                        {item.category && <span className={styles.itemCategory}>{item.category}</span>}
                        {item.fromRecipe && (
                          <span className={styles.itemRecipe}>Para: {item.fromRecipe}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <button className={styles.editBtn} onClick={() => startEdit(item)} title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button className={styles.deleteBtn} onClick={() => removeItem(item.id)}>✕</button>
                    </div>
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
                      <div className={styles.itemDetails}>
                        {item.quantity && <span className={styles.itemQty}>{item.quantity} {item.unit}</span>}
                        {item.category && <span className={styles.itemCategory}>{item.category}</span>}
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <button className={styles.editBtn} onClick={() => startEdit(item)} title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button className={styles.deleteBtn} onClick={() => removeItem(item.id)}>✕</button>
                    </div>
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
