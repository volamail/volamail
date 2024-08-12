import Illustration from "./context-hint-illustration.svg";

export default function ContextHintIllustration() {
  return (
    <img
      src={Illustration}
      alt="Add a project description"
      class="absolute animate-in fade-in duration-1000 -left-48 -top-10 w-48 hidden xl:block"
    />
  );
}
