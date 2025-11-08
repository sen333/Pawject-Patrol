/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        accent: '#7b2cbf',
        muted: '#8d99ae',
        bg: '#f2f7c9'
      }
    }
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./public/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        primary: "var(--font-primary)", // Montserrat
        secondary: "var(--font-secondary)", // Manrope
      },
    },
  },
  plugins: [],
};
