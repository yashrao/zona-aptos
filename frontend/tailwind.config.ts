import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "zona-green": "#23F98A",
        "zona-red": "#D8515F",
        "card-bg": "#0F1216",
        "card-border": "#222226",
        "text-grey": "#AFAFAF",
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
      textColor: {
        "interactive-button": "#000000",
        "interactive-button-hover": "#23F98A",
      },
      borderRadius: {
        "interactive-button": "10px",
      },
      backgroundColor: {
        "interactive-button": "#23F98A",
        "interactive-button-hover": "transparent",
      },
      transitionProperty: {
        "interactive-button": "transform",
      },
      transitionDuration: {
        "interactive-button": "300ms",
      },
      transitionTimingFunction: {
        "interactive-button": "ease-in-out",
      },
      scale: {
        "interactive-button-hover": "1.05",
      },
    },
  },
  plugins: ["prettier-plugin-tailwindcss", require("@tailwindcss/forms"),require('tailwind-scrollbar-hide')],
};

export default config;
