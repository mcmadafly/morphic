/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
                '3xs': ['0.5rem', { lineHeight: '0.625rem' }],
            },
        },
    },
    plugins: [],
}