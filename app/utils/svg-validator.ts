export type { SvgValidation } from "soaring-symbols/svg-validator";
export { runSvgValidations } from "soaring-symbols/svg-validator";

export function computeSvgBBox(svgEl: SVGSVGElement): DOMRect | null {
  const ns = "http://www.w3.org/2000/svg";
  const container = document.createElementNS(ns, "svg") as SVGSVGElement;
  container.setAttribute("xmlns", ns);
  container.style.cssText =
    "position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;";
  const vb = svgEl.getAttribute("viewBox");
  if (vb) container.setAttribute("viewBox", vb);
  Array.from(svgEl.children).forEach((child) => {
    if (child.tagName.toLowerCase() !== "title")
      container.appendChild(child.cloneNode(true));
  });
  document.body.appendChild(container);
  let bbox: DOMRect | null = null;
  try {
    bbox = container.getBBox();
  } catch {}
  document.body.removeChild(container);
  return bbox && bbox.width > 0 ? bbox : null;
}
