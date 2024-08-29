// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { env } from "./lib/environment/env";

const SITE_URL = `${import.meta.env.DEV ? "http" : "https"}://${
  env.SITE_DOMAIN
}`;

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en" class="antialiased">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <meta
            property="og:title"
            content="Volamail · Open-source, AI-powered email"
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={SITE_URL} />
          <meta property="og:image" content={`${SITE_URL}/og_image.png`} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@volamail" />
          <meta name="twitter:creator" content="@volamail" />

          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
          <meta name="msapplication-TileColor" content="#000000" />
          <meta name="theme-color" content="#ffffff" />

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400..900&display=swap"
            rel="stylesheet"
          />

          {assets}
        </head>
        <body class="overscroll-none overflow-x-hidden">
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
