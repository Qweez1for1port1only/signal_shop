/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#151719",
        steel: "#555B61",
        accent: "#3157FF",
        amberline: "#C7FF43",
        paper: "#F4F1E8",
        coral: "#FF6B4A"
      },
      fontFamily: {
        sans: [
          "Arial",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
