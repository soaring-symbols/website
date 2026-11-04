declare module '#airline-assets' {
  // Airline slug to the SVG variants it ships, e.g. ['icon', 'logo', 'logo-mono']
  const assets: Record<string, string[]>
  export default assets
  // Variants the site derives itself and the package does not ship, e.g.
  // a mono version of a single-color icon
  export const derived: Record<string, string[]>
}
