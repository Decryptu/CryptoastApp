/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
	  extend: {
		colors: {
		  primary: {
			400: '#F2BF42',
			600: '#EDA73B',
		  }
		}
	  },
	},
	darkMode: "media",
	plugins: [],
  };