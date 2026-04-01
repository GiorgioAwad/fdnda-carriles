import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",       // slate-900, dark foundation
        ocean: "#334155",     // slate-700, secondary dark
        surf: "#0284c7",      // sky-600, primary accent
        foam: "#f0f9ff",      // sky-50, lightest blue
        sun: "#eab308",       // yellow-500
        coral: "#ef4444",     // red-500
        mint: "#10b981",      // emerald-500
        slateblue: "#4f46e5"  // indigo-600
      },
      boxShadow: {
        float: "0 10px 30px rgba(15, 23, 42, 0.08)",
        "float-hover": "0 20px 40px rgba(15, 23, 42, 0.12)"
      },
      backgroundImage: {
        "pool-grid":
          "linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
