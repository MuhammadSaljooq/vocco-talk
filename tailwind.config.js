/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#5B8C5A",
        "primary-glow": "#83af82",
        "accent": "#E3655B",
        "secondary-dark": "#1A1D21",
        "secondary-grey": "#889096",
        "background-dark": "#020304", 
        "surface-dark": "#0A0C0E",
        "surface-card": "#131518",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "mono": ["monospace"]
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at 50% 0%, rgba(91, 140, 90, 0.15), transparent 70%)',
        'button-gradient': 'linear-gradient(to bottom, #659a64, #5B8C5A)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

