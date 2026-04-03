/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  darkMode: 'class',
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
        },
        dark: {
          bg: '#111827',
          card: '#1F2937',
          border: '#374151',
          text: '#F9FAFB',
          subtext: '#9CA3AF'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px - Sub-headers
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px - Main Headings
      },
      spacing: {
        'px': '1px',
        '0': '0',
        '1': '0.25rem', // 4px
        '2': '0.5rem',  // 8px
        '3': '0.75rem',
        '4': '1rem',    // 16px
        '5': '1.25rem',
        '6': '1.5rem',  // 24px
        '8': '2rem',    // 32px
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem', // 6px
        'lg': '0.5rem',   // 8px
        'xl': '0.75rem',  // 12px
        '2xl': '1rem',    // 16px
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
