import { getSchema, type JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import { Node } from "@tiptap/pm/model";

import StarterKit from "@tiptap/starter-kit";
import { renderToStringAsync } from "solid-js/web";

function getExtensions() {
	return [StarterKit];
}

export function renderTemplateToHtml(jsonContents: JSONContent) {
	const contents = generateHTML(jsonContents, getExtensions());

	return renderToStringAsync(() => (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<body style="margin: 0; background-color: #eee; padding: 5em; font-family: Helvetica, sans-serif;">
				<table width="100%" cellpadding="0" cellspacing="0" border="0">
					<tbody>
						<tr>
							<td>
								<table
									align="center"
									cellpadding="0"
									cellspacing="0"
									style="max-width: 600px; width: 100%; padding: 2.5em; border: 1px solid #ddd; background-color: #fff;"
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

export function renderTemplateToText(jsonContents: JSONContent) {
	const schema = getSchema(getExtensions());

	const contentNode = Node.fromJSON(schema, jsonContents);

	return contentNode.textBetween(0, contentNode.content.size, "\n\n");
}
