// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

const root = document.getElementById("app") as HTMLElement;

mount(() => <StartClient />, root);
