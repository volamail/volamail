import typographyPlugin from "@tailwindcss/typography";
import svgToDataUri from "mini-svg-data-uri";
import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import colors from "tailwindcss/colors";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";
import plugin from "tailwindcss/plugin";

export default {
	content: ["./app/**/*.tsx"],
	theme: {
		extend: {
			colors: {
				gray: colors.zinc,
				primary: colors.sky,
			},
			keyframes: {
				"caret-blink": {
					"0%,70%,100%": { opacity: "1" },
					"20%,50%": { opacity: "0" },
				},
			},
			animation: {
				"caret-blink": "caret-blink 1.2s ease-out infinite",
			},
		},
	},
	plugins: [animatePlugin, gridAndDotsPlugin(), typographyPlugin],
} satisfies Config;

function gridAndDotsPlugin() {
	return plugin(({ matchUtilities, theme }) => {
		matchUtilities(
			{
				"bg-grid": (value: string) => ({
					backgroundImage: `url("${svgToDataUri(
						`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
					)}")`,
				}),
				"bg-grid-small": (value: string) => ({
					backgroundImage: `url("${svgToDataUri(
						`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
					)}")`,
				}),
				"bg-dot": (value: string) => ({
					backgroundImage: `url("${svgToDataUri(
						`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`,
					)}")`,
				}),
			},
			{ values: flattenColorPalette(theme("backgroundColor")), type: "color" },
		);
	});
}
