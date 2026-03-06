/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        steward: {
          green: '#1B5E20',
          'green-light': '#4CAF50',
          'green-dark': '#0D3B13',
          gold: '#F9A825',
          red: '#D32F2F',
          cream: '#FFF8E1',
        },
      },
    },
  },
  plugins: [],
};
