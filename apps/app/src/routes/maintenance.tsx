import { Title } from "@solidjs/meta";
import { ConstructionIcon } from "lucide-solid";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";

export default function MaintenancePage() {
	return (
		<GridBgContainer class="h-dvh gap-2">
			<Title>Maintenance - Volamail</Title>

			<ConstructionIcon class="size-16" />
			<h1 class="text-4xl font-bold inline-flex gap-2 items-center">
				Maintenance
			</h1>
			<p class="text-gray-600 text-center">
				We're currently undergoing maintenance.
				<br />
				Please check back later.
			</p>

			<footer class="absolute bottom-4 text-gray-500 left-1/2 -translate-x-1/2  text-xs flex gap-2 items-center">
				<a
					href="https://x.com/volamail"
					rel="noreferrer"
					target="_blank"
					class="hover:text-black transition-colors"
				>
					Twitter
				</a>
				-
				<a
					href="https://discord.gg/2mqaUv4urR"
					rel="noreferrer"
					target="_blank"
					class="hover:text-black transition-colors"
				>
					Discord
				</a>
				-
				<a
					href="https://github.com/volamail/volamail"
					rel="noreferrer"
					target="_blank"
					class="hover:text-black transition-colors"
				>
					GitHub
				</a>
			</footer>
		</GridBgContainer>
	);
}
