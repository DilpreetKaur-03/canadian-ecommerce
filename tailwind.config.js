module.exports = {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandBlue: '#143e63', // header deep blue
        accentYellow: '#FFCC66'
      },
      fontFamily: {
        sans: ['Inter','sans-serif']
      }
    },
  },
  plugins: [],
}