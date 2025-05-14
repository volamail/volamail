import { type JSONContent, getSchema } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import { Node } from "@tiptap/pm/model";
import { renderToString } from "react-dom/server";
import { getExtensionsFromTheme } from "./extensions";
import css from "./template-styles.css?raw";
import { type Theme, compileTemplateStyles } from "./theme";

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

	const renderedCss = compileTemplateStyles(css, theme);

	return renderToString(
		<html lang="en">
			<head>
`				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="color-scheme" content="light" />`

				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: fuck off*/}
				<style dangerouslySetInnerHTML={{ __html: renderedCss }} />
			</head>
			<body className="root">
				<table
					width="100%"
					cellPadding={0}
					cellSpacing={0}
					style={{ border: "none" }}
				>
					<tbody>
						<tr>
							<td>
								<table
									align="center"
									cellPadding={0}
									cellSpacing={0}
									className="content"
									// style={{
									// 	maxWidth: `${theme.contentMaxWidth}px`,
									// 	width: "100%",
									// 	border: `${theme.contentBorderWidth}px solid ${theme.contentBorderColor}`,
									// 	borderRadius: `${theme.contentBorderRadius}px`,
									// 	overflow: "hidden",
									// }}
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
