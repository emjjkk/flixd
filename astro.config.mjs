// @ts-check
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: [
        // your Gitpod host
        "4321-emjjkk-flixd-zasu2wl4are.ws-eu121.gitpod.io",
      ],
    },
  },
  integrations: [react()],
})
