import svgToDataUri from "mini-svg-data-uri";
import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

const config: Config = {
	content: ["./src/**/*.tsx"],
	theme: {
		extend: {
			colors: {
				gray: colors.zinc,
			},
			fontFamily: {
				sans: ["Inter", ...defaultTheme.fontFamily.sans],
			},
			keyframes: {
				// Used in OTP field
				"caret-blink": {
					"0%,70%,100%": { opacity: "1" },
					"20%,50%": { opacity: "0" },
				},
			},
			animation: {
				// Used in OTP field
				"caret-blink": "caret-blink 1.25s ease-out infinite",
			},
		},
	},
	plugins: [
		animatePlugin,
		({ matchUtilities, theme }) => {
			matchUtilities(
				{
					"bg-grid": (value) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
						)}")`,
					}),
				},
				{
					values: flattenColorPalette(theme("backgroundColor")),
					type: "color",
				},
			);
		},
	],
};

function addVariablesForColors({ addBase, theme }) {
	const allColors = flattenColorPalette(theme("colors"));

	const newVars = Object.fromEntries(
		Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
	);

	addBase({
		":root": newVars,
	});
}

export default config;
