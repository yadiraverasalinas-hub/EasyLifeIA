"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../page.module.css";

export default function Registro() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const onboardingDone = localStorage.getItem("easylife_onboarding_done");
    if (!onboardingDone) {
      router.push("/onboarding");
    }
  }, [router]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirm) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    localStorage.setItem("easylife_user", JSON.stringify({ email, name }));
    router.push("/dashboard");
  };

  return (
    <main className={styles.loginContainer}>
      <div className="animate-fade-in" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

        <div className={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="var(--primary)"/>
            <path d="M13.5 16.5C14.05 16.5 14.5 16.05 14.5 15.5C14.5 14.95 14.05 14.5 13.5 14.5C12.95 14.5 12.5 14.95 12.5 15.5C12.5 16.05 12.95 16.5 13.5 16.5Z" fill="var(--primary)"/>
            <path d="M12 6.5C9.79 6.5 8 8.29 8 10.5C8 11.83 8.65 12.99 9.64 13.72L10.36 12.72C9.57 12.14 9.06 11.23 9.06 10.23C9.06 8.64 10.36 7.34 11.95 7.34C13.54 7.34 14.84 8.64 14.84 10.23C14.84 11.39 14.15 12.4 13.06 12.83V14.33C14.67 13.82 15.84 12.33 15.84 10.5C15.84 8.29 14.05 6.5 12 6.5Z" fill="var(--primary)"/>
          </svg>
          EasyLife <span>AI</span>
        </div>

        <p className={styles.subtitle}>Crea tu cuenta y empieza a cocinar</p>

        <form className={`glass-panel ${styles.formCard}`} onSubmit={handleRegister}>
          <h2>Crear Cuenta</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Únete a EasyLife AI hoy</p>

          {error && (
            <div style={{ color: "var(--error)", background: "var(--primary-light)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              className={styles.input}
              placeholder="Tu nombre"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className={styles.input}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirm">Confirmar contraseña</label>
            <input
              type="password"
              id="confirm"
              className={styles.input}
              placeholder="Repite tu contraseña"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} style={{ marginTop: "0.5rem" }}>
            Registrarme
          </button>

          <p className={styles.registerLink}>
            ¿Ya tienes una cuenta? <Link href="/">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
