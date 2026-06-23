"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./onboarding.module.css";

const STEPS = [
  {
    emoji: "👋",
    title: "¡Bienvenido a EasyLife AI!",
    desc: "Tu asistente culinario inteligente. Organiza tu despensa, planifica tus comidas y ahorra dinero.",
    btnLabel: "Empezar",
  },
  {
    emoji: "🥦",
    title: "Gestiona tu despensa",
    desc: "Registra los ingredientes que tienes en casa y recibe alertas cuando estén por vencer.",
    btnLabel: "Siguiente",
  },
  {
    emoji: "🍽️",
    title: "Descubre recetas",
    desc: "Te sugerimos recetas basadas en lo que ya tienes. Sin desperdicios, sin complicaciones.",
    btnLabel: "Siguiente",
  },
  {
    emoji: "📅",
    title: "Planifica tu semana",
    desc: "Organiza tus comidas de la semana y genera automáticamente tu lista de compras.",
    btnLabel: "Siguiente",
  },
  {
    emoji: "💰",
    title: "Controla tu presupuesto",
    desc: "Lleva el registro de tus gastos alimenticios y mantente dentro de tu presupuesto mensual.",
    btnLabel: "¡Comenzar ahora!",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem("easylife_onboarding_done", "true");
      router.push("/registro");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("easylife_onboarding_done", "true");
    router.push("/registro");
  };

  const current = STEPS[step];

  return (
    <main className={styles.container}>
      <div className={styles.skipRow}>
        {step < STEPS.length - 1 && (
          <button className={styles.skipBtn} onClick={handleSkip}>Omitir</button>
        )}
      </div>

      <div className={styles.slideWrapper}>
        <div className={styles.slide} key={step}>
          <div className={styles.emojiCircle}>{current.emoji}</div>
          <h1 className={styles.title}>{current.title}</h1>
          <p className={styles.desc}>{current.desc}</p>
        </div>
      </div>

      <div className={styles.dots}>
        {STEPS.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === step ? styles.dotActive : ""}`}
            onClick={() => setStep(i)}
          />
        ))}
      </div>

      <button className={styles.nextBtn} onClick={handleNext}>
        {current.btnLabel} →
      </button>

      <p className={styles.loginHint}>
        ¿Ya tienes cuenta?{" "}
        <button className={styles.loginLink} onClick={() => router.push("/")}>
          Inicia sesión
        </button>
      </p>
    </main>
  );
}
