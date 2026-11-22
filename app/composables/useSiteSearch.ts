// The site search's state, shared so the home page's button can open it and
// the palette can list what the search term finds
export function useSiteSearch() {
  const open = useState('site-search-open', () => false)
  const term = useState('site-search-term', () => '')

  return { open, term }
}
