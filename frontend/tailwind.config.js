/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neon-green': '#39FF14',
                'drip-yellow': '#FFD600',
                'electric-purple': '#9333EA',
                'dark-bg': '#050505',
                'card-gray': '#121212',
            },
            fontFamily: {
                'graffiti': ['"Bangers"', '"Permanent Marker"', 'cursive'],
                'body': ['"Inter"', 'sans-serif'],
            },
            boxShadow: {
                'neon-green': '0 0 10px #39ff14, 0 0 20px #39ff14',
                'neon-purple': '0 0 10px #bf00ff, 0 0 20px #bf00ff',
            }
        },
    },
    plugins: [],
}

