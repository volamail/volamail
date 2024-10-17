import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";

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
	plugins: [animatePlugin],
};

export default config;
