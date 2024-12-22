import { type JSONContent, getSchema } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import { Node } from "@tiptap/pm/model";
import { renderToString } from "react-dom/server";
import { getExtensionsFromTheme } from "./editor-extensions";
import css from "./template-styles.css?raw";
import type { Theme } from "./theme";

export function renderTemplateToHtml(template: {
	contents: JSONContent;
	theme: Theme;
}) {
	const { theme } = template;

	let contents = generateHTML(
		template.contents,
		getExtensionsFromTheme(template.theme),
	);

	const P_REGEX = /(<p\s?((style=".*"))?>)(<\/p>)/g;

	contents = contents.replace(P_REGEX, "$1<br>$4");

	return renderToString(
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: fuck off*/}
				<style dangerouslySetInnerHTML={{ __html: css }} />
			</head>
			<body
				style={{
					backgroundColor: theme.background,
					padding: "1em",
				}}
			>
				<table width="100%" cellPadding={0} cellSpacing={0} border={0}>
					<tbody>
						<tr>
							<td>
								<table
									align="center"
									cellPadding={0}
									cellSpacing={0}
									style={{
										maxWidth: `${theme.contentMaxWidth}px`,
										width: "100%",
										padding: "3em",
										//border: "1px solid #ddd",
										backgroundColor: theme.contentBackground,
										borderRadius: `${theme.contentBorderRadius}px`,
									}}
								>
									<tbody>
										<tr>
											{/* biome-ignore lint/security/noDangerouslySetInnerHtml: fuck off */}
											<td dangerouslySetInnerHTML={{ __html: contents }} />
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
					</tbody>
				</table>
			</body>
		</html>,
	);
}

export function renderTemplateToText(template: {
	contents: JSONContent;
	theme: Theme;
}) {
	const { contents, theme } = template;

	const schema = getSchema(getExtensionsFromTheme(theme));

	const contentNode = Node.fromJSON(schema, contents);

	return contentNode.textBetween(0, contentNode.content.size, "\n\n");
}
