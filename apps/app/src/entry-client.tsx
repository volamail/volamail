// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

import "solid-devtools";

const root = document.getElementById("app") as HTMLElement;

mount(() => <StartClient />, root);
