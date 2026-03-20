/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1040px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          500: '#CDAF39',
          400: '#D4BC5A',
          600: '#B89A2E',
        },
        surface: {
          900: '#0a0a0a',
          800: '#141414',
          700: '#1e1e1e',
        },
        text: {
          primary: '#FAFAFA',
          faded: 'rgba(250, 250, 250, 0.5)',
          muted: 'rgba(250, 250, 250, 0.25)',
        },
      },
      fontFamily: {
        serif: ['"mendl-serif-dusk"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 20s) linear infinite',
        'marquee-reverse': 'marquee-reverse var(--marquee-duration, 20s) linear infinite',
        float: 'floatY var(--float-speed, 4s) ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0%)' },
          to: { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0%)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(var(--float-distance, -10px))' },
        },
      },
    },
  },
  plugins: [],
}
