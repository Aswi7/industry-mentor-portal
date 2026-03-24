/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7fa',
          100: '#eaedf4',
          200: '#cbd4e5',
          300: '#9cb1d0',
          400: '#6886b5',
          500: '#45669a',
          600: '#34507f',
          700: '#2b4168',
          800: '#263757',
          900: '#0B1F3A', // Deep Midnight Indigo (Trustworthy)
          950: '#071325',
        },
        slate: {
          50: '#f8fafc',
          900: '#0f172a', // Slate Accent
        },
        accent: {
          blue: '#3b82f6',
          emerald: '#10b981',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
