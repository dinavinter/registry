import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { netlifyPlugin } from "@netlify/remix-adapter/plugin";
import tailwindcss from '@tailwindcss/vite'
import { installGlobals } from "@remix-run/node";

installGlobals();

export default defineConfig({


  plugins: [remix({
    future: {
      v3_singleFetch: true,
      v3_lazyRouteDiscovery: true,
      v3_throwAbortReason: true,

    },
  }), netlifyPlugin(), tsconfigPaths(), tailwindcss()],
});
