import { Link } from "@tanstack/react-router";

export function NotFound() {
	return (
		<div className="h-dvh flex flex-col gap-4 justify-center items-center">
			<h1 className="text-4xl font-bold">Page not found</h1>
			<p className="text-gray-600 dark:text-gray-400">
				The page you are looking for does not exist. Click{" "}
				<Link
					href="/"
					className="font-medium hover:text-gray-300 dark:hover:text-gray-600"
				>
					here
				</Link>{" "}
				to go back to the home page.
			</p>
		</div>
	);
}
