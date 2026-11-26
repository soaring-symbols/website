<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <UPageHeader :title="meta.title" :description="meta.description" />

    <LegalText :updated="UPDATED">
      <h2>In short</h2>
      <p>
        Soaring Symbols has no accounts, no ads, no tracking cookies and no
        analytics. Nothing you do on this site, with the API or in the apps is
        sold or shared, and the apps send nothing about you or your files to us.
      </p>

      <h2>This website and the API</h2>
      <p>
        soaringsymbols.org and its API (<code>/api/airlines</code>,
        <code>/api/alliances</code>) run on Cloudflare Workers. Like any web
        server, Cloudflare receives each request with your IP address, browser
        and the address asked for, and keeps logs of requests so errors can be
        found and fixed. Those logs are used for nothing else. Cloudflare
        handles them under its own
        <ULink to="https://www.cloudflare.com/privacypolicy/" target="_blank"
          >privacy policy</ULink
        >.
      </p>
      <p>
        Your browser keeps your light or dark mode choice in its local storage,
        which never leaves your device. SVG files you check on the
        <ULink to="/validate">Validate</ULink> page are checked and fixed in
        your browser and never uploaded.
      </p>
      <p>
        Some pages load from other services as you view them: the marks from
        jsDelivr, and the GitHub star count and the release notes from GitHub.
        Those requests go from your browser to them, under their own policies.
      </p>

      <h2>The apps and plugins</h2>
      <p>
        The Webflow app, the Figma and Framer plugins, the Raycast extension and
        the draw.io libraries load the airline lists and the marks from the
        soaring-symbols package on jsDelivr. They have no server of ours behind
        them and send us nothing.
      </p>
      <ul>
        <li>
          Your settings, such as the size and color of inserted marks, stay on
          your device, in the storage each app provides.
        </li>
        <li>
          The Webflow app uploads the marks you insert to your own site’s
          assets, through Webflow’s Designer API, and places them on the page
          you are editing. It reads nothing else from your site and keeps no
          copy.
        </li>
        <li>
          The host app (Webflow, Figma, Framer, Raycast, draw.io) handles its
          own data under its own privacy policy.
        </li>
      </ul>

      <h2>Changes and contact</h2>
      <p>
        If this policy changes, the new version is posted here with a new date.
        Questions go to
        <ULink :to="ISSUES_URL" target="_blank">GitHub issues</ULink>.
      </p>
    </LegalText>
  </div>
</template>

<script setup>
const UPDATED = 'November 26, 2026'
const ISSUES_URL = 'https://github.com/soaring-symbols/soaring-symbols/issues'

const meta = {
  title: 'Privacy policy',
  description:
    'What the Soaring Symbols website, API and apps collect: next to nothing. No accounts, no tracking and no analytics.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

defineOgImage('Site', { title: meta.title, description: meta.description })
</script>
