import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Breadcrumbs as BreadcrumbsPrimitive } from "@kobalte/core/breadcrumbs";
import { ChevronRightIcon } from "lucide-solid";

type Crumb = {
	label: string;
	href?: string;
};

type Props = {
	crumbs: Array<Crumb>;
};

export function Breadcrumbs(props: Props) {
	return (
		<BreadcrumbsPrimitive separator={<ChevronRightIcon class="size-4" />}>
			<ol class="flex items-center gap-2">
				<For each={props.crumbs}>
					{(crumb, index) => (
						<>
							<Show
								when={crumb.href}
								fallback={
									<span class="text-sm font-medium">{crumb.label}</span>
								}
							>
								{(href) => (
									<BreadcrumbsPrimitive.Link
										as={A}
										href={href()}
										class="text-sm font-medium text-gray-500 hover:text-gray-800 cursor-default transition-colors"
									>
										{crumb.label}
									</BreadcrumbsPrimitive.Link>
								)}
							</Show>
							<Show when={index() < props.crumbs.length - 1}>
								<BreadcrumbsPrimitive.Separator />
							</Show>
						</>
					)}
				</For>
			</ol>
		</BreadcrumbsPrimitive>
	);
}
