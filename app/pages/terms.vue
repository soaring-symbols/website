<template>
  <div class="pt-8 pb-16 sm:pt-12">
    <UPageHeader :title="meta.title" :description="meta.description" />

    <LegalText :updated="UPDATED">
      <h2>What these terms cover</h2>
      <p>
        These terms cover soaringsymbols.org, its API, the soaring-symbols npm
        package and the apps built on it: the Webflow and Miro apps, the Figma
        and Framer plugins, the Raycast extension and the draw.io libraries.
        Using any of them means you accept these terms.
      </p>

      <h2>The code</h2>
      <p>
        The code of the package, the website and the apps is open source under
        the MIT license, as each repository on
        <ULink to="https://github.com/soaring-symbols" target="_blank"
          >GitHub</ULink
        >
        states. You may use, copy and change it under that license.
      </p>

      <h2>The airline marks</h2>
      <p>
        The logos, icons and tails are trademarks of their airlines and
        alliances. Soaring Symbols claims no ownership of them and is not
        affiliated with or endorsed by their owners. The MIT license covers the
        code, not the marks: how you may use a mark is up to its owner, as the
        <ULink :to="DISCLAIMER_URL" target="_blank">disclaimer</ULink> explains.
        You are responsible for using them lawfully, for example to refer to an
        airline, not to suggest it backs you.
      </p>
      <p>
        A trademark owner who wants a mark removed can ask through
        <ULink :to="ISSUES_URL" target="_blank">GitHub issues</ULink>; it is
        taken out in the next release.
      </p>

      <h2>Using the API and the apps</h2>
      <ul>
        <li>The API and the apps are free and need no key or account.</li>
        <li>
          Don’t overload the API or use it to harm others; requests that do may
          be limited or blocked.
        </li>
        <li>
          The Webflow app adds the marks you insert to your site’s assets and
          pages; what you publish with them is yours to answer for.
        </li>
        <li>
          The Miro app adds the marks you pick to your boards; what you share
          with them is yours to answer for.
        </li>
      </ul>

      <h2>No warranty</h2>
      <p>
        Everything is provided as is, without warranty of any kind. The data and
        marks are curated with care but may be incomplete, out of date or wrong,
        and the services may change or stop. To the extent the law allows,
        Soaring Symbols and its contributors are not liable for any damage
        arising from their use.
      </p>

      <h2>Changes and contact</h2>
      <p>
        These terms may change; the new version is posted here with a new date,
        and using the services after that means you accept it. Questions go to
        <ULink :to="ISSUES_URL" target="_blank">GitHub issues</ULink>. See also
        the <ULink to="/privacy">privacy policy</ULink>.
      </p>
    </LegalText>
  </div>
</template>

<script setup>
const UPDATED = 'November 27, 2026'
const ISSUES_URL = 'https://github.com/soaring-symbols/soaring-symbols/issues'

const meta = {
  title: 'Terms of service',
  description:
    'The terms for the Soaring Symbols website, API, package and apps: free to use, open source code, and airline marks that belong to their owners.',
}

useSeoMeta({
  title: meta.title,
  description: meta.description,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

defineOgImage('Site', { title: meta.title, description: meta.description })
</script>
