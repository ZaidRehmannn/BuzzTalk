/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkPurple: '#1e1b32',
        lightPurple: '#8e44ad',
        softPurple: '#6c3483',
        borderColor: '#4a4a6a',
        lightGray: '#dcdde1',
        inputBg: '#2c2c54',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}