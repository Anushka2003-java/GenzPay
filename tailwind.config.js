/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08080A",
          900: "#0C0C0F",
          800: "#131318",
          700: "#1B1B22",
          600: "#26262F",
          500: "#33333F",
        },
        cream: {
          100: "#FBF8F2",
          200: "#F2ECDF",
          300: "#E6DEC9",
          400: "#CFC5AC",
          500: "#A79E88",
        },
        amber: {
          300: "#EFC77E",
          400: "#DDAB53",
          500: "#C9922F",
          600: "#A87322",
        },
        sage: {
          400: "#8FBF9F",
          500: "#6FA37F",
        },
        clay: {
          400: "#D97A66",
          500: "#C25F49",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        glass: "0 1px 1px rgba(255,255,255,0.04) inset, 0 20px 60px -20px rgba(0,0,0,0.6)",
        glow: "0 0 40px -8px rgba(221,171,83,0.35)",
      },
    },
  },
  plugins: [],
};
