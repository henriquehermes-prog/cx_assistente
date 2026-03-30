/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9f4',
          100: '#dcf0e5',
          200: '#bbdece',
          300: '#8dc4aa',
          400: '#58a47f',
          500: '#368762',
          600: '#256b4d',
          700: '#1e553d',
          800: '#163d2c',
          900: '#0b1e16',
          950: '#07130e',
        },
      },
    },
  },
  plugins: [],
}
