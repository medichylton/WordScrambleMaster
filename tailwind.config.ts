import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      colors: {
        game: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
