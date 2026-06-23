import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyLife AI",
  description: "Tu asistente culinario personal. Planea, cocina y ahorra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
