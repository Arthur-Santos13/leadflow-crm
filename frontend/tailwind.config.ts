import type { Config } from 'tailwindcss';

export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#E50914',
                    hover: '#B20710',
                    light: '#FFF1F1',
                    dark: '#2A0A0A',
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
