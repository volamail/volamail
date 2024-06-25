import { type BaseLayoutProps, type DocsLayoutProps } from "fumadocs-ui/layout";
import { pageTree } from "@/app/source";
import { Logo } from "@/components/Logo";

// shared configuration
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div className="flex gap-2 items-center px-1">
        <Logo />
        <span className="font-medium">Volamail</span>
      </div>
    ),
  },
};

// docs layout configuration
export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: pageTree,
};
