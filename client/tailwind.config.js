/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EAF2FF',
          100: '#D6E6FF',
          200: '#AFCFFF',
          300: '#7DAEFF',
          400: '#4D8DFF',
          500: '#054187',
          600: '#04356F',
          700: '#032B59',
          800: '#022044',
          900: '#01152E',
        },
        secondary: {
          50: '#FFF4E6',
          100: '#FFE8CC',
          200: '#FFD199',
          300: '#FFBA66',
          400: '#FFA333',
          500: '#FF9933',
          600: '#E67F00',
          700: '#B36200',
          800: '#804600',
          900: '#4D2A00',
        },
        success: {
          50: '#EAF7EA',
          100: '#D5EFD5',
          200: '#ABDFAB',
          300: '#81CF81',
          400: '#57BF57',
          500: '#138808',
          600: '#0F6D06',
          700: '#0B5205',
          800: '#073703',
          900: '#031C02',
        },
        surface: {
          100: '#FFFFFF',
          200: '#FAFAFA',
          300: '#F8F9FA',
          400: '#F5F7F2',
          500: '#ECEFF1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
} 