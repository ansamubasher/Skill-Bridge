/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f05a28",
        "primary-hover": "#d94e20",
        "sb-orange": "#E85D24",
        "sb-orange-hover": "#c94d1a",
        "bg-light": "#e5e5e5",
        "card-bg": "#e1dcd6",
        "sb-border": "#e0e0e0",
      }
    },
  },
  plugins: [],
}
