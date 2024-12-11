export type Theme = {
	background: string;
	contentBackground: string;
	contentMaxWidth: number;
	contentBorderRadius: number;
};

export const DEFAULT_THEME: Theme = {
	background: "#EEEEEE",
	contentBackground: "#FFFFFF",
	contentMaxWidth: 576,
	contentBorderRadius: 8,
};

export const THEME_VARIABLES_MAP: Record<keyof Theme, string> = {
	background: "--page-background",
	contentBackground: "--content-background",
	contentMaxWidth: "--content-max-width",
	contentBorderRadius: "--content-border-radius",
};

export const CONTENT_MAX_WIDTH_OPTIONS = [320, 384, 448, 512, 576, 672, 768];
export const CONTENT_BORDER_RADIUS_OPTIONS = [
	0, 2, 4, 8, 16, 24, 32, 40, 48, 56, 64,
];
