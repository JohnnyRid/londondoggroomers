import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gray: {
          500: '#64748b',
          600: '#475569',
          700: '#374151',
          800: '#1f2937', // Darkened for better contrast
          900: '#111827', // Added for maximum contrast
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          600: '#1d4ed8', // Darkened for better button contrast
          700: '#1e40af', // Adjusted for better contrast
          800: '#1e3a8a', // Darkened for better text contrast
          900: '#172554', // Added for maximum contrast
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
