// The package's GitHub releases, for the changelog. GitHub renders each
// release's notes to HTML (pull request numbers become links), so the site
// shows the notes as written there and keeps no copy of its own.
export const RELEASES_URL =
  'https://github.com/soaring-symbols/soaring-symbols/releases'
export const RELEASES_FEED_URL = `${RELEASES_URL}.atom`

const API_URL =
  'https://api.github.com/repos/soaring-symbols/soaring-symbols/releases?per_page=100'

export interface Release {
  tag: string
  // When the release commit was made, which is when the version reached
  // npm; GitHub's published_at is when its release page was created
  date: string
  url: string
  html: string
}

interface GitHubRelease {
  tag_name: string
  created_at: string
  html_url: string
  body_html?: string
  draft: boolean
  prerelease: boolean
}

// Newest first, as the API returns them. Throws when GitHub can't be reached
// or rate-limits the request (60 an hour per IP without a token).
export async function fetchReleases(): Promise<Release[]> {
  const releases = await $fetch<GitHubRelease[]>(API_URL, {
    headers: { Accept: 'application/vnd.github.html+json' },
  })

  return releases
    .filter((release) => !release.draft && !release.prerelease)
    .map((release) => ({
      tag: release.tag_name,
      date: release.created_at,
      url: release.html_url,
      html: release.body_html ?? '',
    }))
}

// Read while the page is prerendered, so it works without JavaScript and
// search engines see it, then again in the browser: notes are written after a
// release, often after the last deploy. A failed read keeps what the page
// has (an empty list when the build couldn't reach GitHub either).
export function useReleases() {
  const { data } = useAsyncData('releases', () =>
    fetchReleases().catch(() => []),
  )

  onMounted(async () => {
    try {
      data.value = await fetchReleases()
    } catch {
      // Keep the prerendered list
    }
  })

  return data
}
