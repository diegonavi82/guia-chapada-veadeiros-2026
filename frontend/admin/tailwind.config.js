/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#08111f",
        surface: "#0f1b2d",
        accent: "#7dd3fc"
      }
    }
  },
  plugins: []
};
