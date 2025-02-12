export type Theme = {
  background: string;
  contentBackground: string;
  contentMaxWidth: number;
  contentBorderRadius: number;
  contentBorderWidth: number;
  contentBorderColor: string;
};

export const DEFAULT_THEME: Theme = {
  background: "#EEEEEE",
  contentBackground: "#FFFFFF",
  contentMaxWidth: 576,
  contentBorderRadius: 8,
  contentBorderWidth: 1,
  contentBorderColor: "#D1D5DB",
};

export const CONTENT_MAX_WIDTH_OPTIONS = [320, 384, 448, 512, 576, 672, 768];

export const CONTENT_BORDER_RADIUS_OPTIONS = [
  0, 2, 4, 8, 16, 24, 32, 40, 48, 56, 64,
];

export const CONTENT_BORDER_WIDTH_OPTIONS = [0, 1, 2, 3, 4, 8];

const THEME_VARIABLES_MAP: Record<keyof Theme, string> = {
  background: "--page-background",
  contentBackground: "--content-background",
  contentMaxWidth: "--content-max-width",
  contentBorderRadius: "--content-border-radius",
  contentBorderWidth: "--content-border-width",
  contentBorderColor: "--content-border-color",
};

export function getEditorContainerStyle(theme: Theme) {
  return {
    background: theme.background,
    [THEME_VARIABLES_MAP.contentBackground]: theme.contentBackground,
    [THEME_VARIABLES_MAP.contentMaxWidth]: `${theme.contentMaxWidth}px`,
    [THEME_VARIABLES_MAP.contentBorderRadius]: `${theme.contentBorderRadius}px`,
    [THEME_VARIABLES_MAP.contentBorderWidth]: `${theme.contentBorderWidth}px`,
    [THEME_VARIABLES_MAP.contentBorderColor]: theme.contentBorderColor,
  };
}

export const EDITOR_STYLE_VARIABLES = `
	border-radius: var(${THEME_VARIABLES_MAP.contentBorderRadius});
	border: var(${THEME_VARIABLES_MAP.contentBorderWidth}) solid var(${THEME_VARIABLES_MAP.contentBorderColor});
	background-color: var(${THEME_VARIABLES_MAP.contentBackground});
	max-width: var(${THEME_VARIABLES_MAP.contentMaxWidth});
`;
