"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expiry: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [expiringIngredients, setExpiringIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("easylife_ingredients");
    if (saved) {
      const ingredients: Ingredient[] = JSON.parse(saved);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const expiring = ingredients.filter(ing => {
        if (!ing.expiry) return false;
        const exp = new Date(ing.expiry + "T00:00:00");
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
      });
      
      setExpiringIngredients(expiring);
    }
  }, [pathname]); // Refresh on route change

  const navItems = [
    {
      href: "/dashboard",
      label: "Despensa",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
    },
    {
      href: "/dashboard/recetas",
      label: "Recetas",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/>
        </svg>
      ),
    },
    {
      href: "/dashboard/planificacion",
      label: "Planificación",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
      ),
    },
    {
      href: "/dashboard/compras",
      label: "Compras",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 5.9 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.37 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      ),
    },
    {
      href: "/dashboard/presupuesto",
      label: "Presupuesto",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </svg>
      ),
    },
    {
      href: "/dashboard/perfil",
      label: "Perfil",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <main className={styles.mainContent}>
        {/* Notification Bell */}
        <div className={styles.notificationContainer}>
          <button
            className={styles.notificationBell}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
            </svg>
            {expiringIngredients.length > 0 && (
              <span className={styles.notificationBadge}>{expiringIngredients.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.notificationHeader}>
                <h4>Alertas de Vencimiento</h4>
                <button onClick={() => setShowNotifications(false)}>✕</button>
              </div>
              {expiringIngredients.length === 0 ? (
                <div className={styles.notificationEmpty}>
                  <p>✅ No hay ingredientes por vencer</p>
                </div>
              ) : (
                <div className={styles.notificationList}>
                  {expiringIngredients.map(ing => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const exp = new Date(ing.expiry + "T00:00:00");
                    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const isExpired = diffDays < 0;
                    
                    return (
                      <div key={ing.id} className={styles.notificationItem}>
                        <span className={styles.notificationIcon}>{isExpired ? "⛔" : "⚠️"}</span>
                        <div className={styles.notificationContent}>
                          <span className={styles.notificationTitle}>{ing.name}</span>
                          <span className={styles.notificationDate}>
                            {isExpired 
                              ? `Venció el ${exp.toLocaleDateString()}`
                              : diffDays === 0 
                                ? "Vence hoy" 
                                : `Vence en ${diffDays} día(s)`
                            }
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link href="/dashboard" className={styles.notificationLink} onClick={() => setShowNotifications(false)}>
                Ver despensa →
              </Link>
            </div>
          )}
        </div>

        {children}
      </main>

      <nav className={styles.bottomNav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)) ? styles.active : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
