import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cerrado: {
          50: "#f1f8f4",
          500: "#2f7d55",
          700: "#225f42",
          900: "#0f3d2e"
        },
        areia: "#f4e7c5"
      }
    }
  },
  plugins: [typography]
};
