import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0A0E17",
        panel: "#111827",
        "panel-secondary": "#151D2E",
        border: "#1E2A3E",
        "border-hover": "#2A3B57",
        critical: "#FF4D4F",
        medium: "#FFA940",
        low: "#4096FF",
        safe: "#52C41A",
        primary: "#2F54EB",
        cyan: "#13C2C2",
        network: "#B37FEB",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
