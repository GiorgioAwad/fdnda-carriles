import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Control de Carriles",
  description: "Panel operativo para control de carriles en piscina"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
