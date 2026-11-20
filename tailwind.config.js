/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#0e2920',
          DEFAULT: '#153c30',
          light: '#215444',
        },
        mint: {
          DEFAULT: '#6f9e87',
          light: '#a9cdbd',
          pale: '#eaf3ee',
          bg: '#f2f7f4',
        },
        gold: {
          DEFAULT: '#c89d38',
          light: '#dfbd68',
          pale: '#fbf5e6',
          dark: '#9d7722',
        },
        ivory: '#fcf9f2',
        cream: '#f6f1e7',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
