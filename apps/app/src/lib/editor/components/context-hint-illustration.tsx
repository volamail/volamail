import Illustration from "./context-hint-illustration.svg";

export default function ContextHintIllustration() {
  return (
    <img
      src={Illustration}
      alt="Add a project description"
      class="absolute -left-48 -top-10 w-48 animate-pulse hidden xl:block"
    />
  );
}
