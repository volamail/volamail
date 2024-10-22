import { type JSONContent, getSchema } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import { Node } from "@tiptap/pm/model";
import { renderToStringAsync } from "solid-js/web";

import { getExtensionsFromTheme } from "../editor/extensions";
import type { Theme } from "./theme";

export function renderTemplateToHtml(jsonContents: JSONContent, theme: Theme) {
	const contents = generateHTML(jsonContents, getExtensionsFromTheme(theme));

	return renderToStringAsync(() => (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<body
				style={{
					margin: 0,
					"background-color": theme.background,
					padding: "5em",
					"font-family": "Helvetica, sans-serif",
				}}
			>
				<table width="100%" cellpadding="0" cellspacing="0" border="0">
					<tbody>
						<tr>
							<td>
								<table
									align="center"
									cellpadding="0"
									cellspacing="0"
									style={{
										"max-width": theme.contentMaxWidth,
										width: "100%",
										padding: "2.5em",
										border: "1px solid #ddd",
										"background-color": theme.contentBackground,
										"border-radius": `${theme.contentBorderRadius}px`,
									}}
								>
									<tbody>
										<tr>
											<td innerHTML={contents} />
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
					</tbody>
				</table>
			</body>
		</html>
	));
}

export function renderTemplateToText(jsonContents: JSONContent, theme: Theme) {
	const schema = getSchema(getExtensionsFromTheme(theme));

	const contentNode = Node.fromJSON(schema, jsonContents);

	return contentNode.textBetween(0, contentNode.content.size, "\n\n");
}

declare module "solid-js" {
	namespace JSX {
		interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
			width?: string;
			cellpadding?: string;
			cellspacing?: string;
			border?: string;
			align?: string;
		}
	}
}
