import { logger } from "../logger";

export const DEFAULT_THEME = {
  background: "#EEEEEE",
  contentMaxWidth: 576,
  contentBorderRadius: 8,
  contentBorderWidth: 1,
  contentBorderColor: "#D1D5DB",
  typographyLinkColor: "#0069a8",
};

export type Theme = typeof DEFAULT_THEME;

export const CONTENT_MAX_WIDTH_OPTIONS = [320, 384, 448, 512, 576, 672, 768];

export const CONTENT_BORDER_RADIUS_OPTIONS = [
  0, 2, 4, 8, 16, 24, 32, 40, 48, 56, 64,
];

export const CONTENT_BORDER_WIDTH_OPTIONS = [0, 1, 2, 3, 4, 8];

const THEME_VARIABLES_MAP: Record<keyof Theme, string> = {
  background: "--background",
  contentMaxWidth: "--content-max-width",
  contentBorderRadius: "--content-border-radius",
  contentBorderWidth: "--content-border-width",
  contentBorderColor: "--content-border-color",
  typographyLinkColor: "--typography-link-color",
};

export function getEditorStyleVariables(theme: Theme) {
  return Object.entries(theme).reduce(
    (acc, [key, value]) => {
      const variable = THEME_VARIABLES_MAP[key as keyof Theme];

      acc[variable] = renderThemeVariable(value);

      return acc;
    },
    {} as Record<string, string>
  );
}

export function compileTemplateStyles(styles: string, theme: Theme) {
  let output = styles;

  const matches = [...styles.matchAll(/var\((--(\w|-)+)\)/g)];

  for (const match of matches) {
    const variable = match[1];
    const key = variable
      .slice(2)
      .split("-")
      .map((part, i) =>
        i > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
      )
      .join("") as keyof Theme;

    if (!theme[key]) {
      logger.warn(`Theme variable ${variable} not found`);
    }

    output = output.replace(match[0], renderThemeVariable(theme[key]));
  }

  return output;
}

function renderThemeVariable(value: string | number) {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
}
