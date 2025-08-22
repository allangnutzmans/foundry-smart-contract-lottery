import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#8A42FF',
        'brand-pink': '#D93B93',
        'dark-bg': '#292A3D',
        'dark-purple': '#1F2032',
        'dark-card': '#302F4C',
        'dark-border': '#3e3e5e',
        'dark-text': '#FFFFFF',
        'dark-text-secondary': '#a0a0c0',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        gradient: 'gradient 8s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
