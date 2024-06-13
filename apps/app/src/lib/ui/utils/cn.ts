export function cn(...inputs: Array<string | undefined | false>) {
  return inputs.filter(Boolean).join(" ");
}
