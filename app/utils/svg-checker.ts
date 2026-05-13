export interface SvgCheck {
  label: string;
  pass: boolean;
  detail: string;
}

function r(n: number): number {
  return Math.round(n * 1000) / 1000;
}

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

export function runSvgChecks(
  svg: SVGSVGElement,
  type: "logo" | "icon",
  bbox: DOMRect | null,
): SvgCheck[] {
  const size = type === "logo" ? 64 : 24;
  const expectedViewBox = `0 0 ${size} ${size}`;

  const viewBox = svg.getAttribute("viewBox");
  const role = svg.getAttribute("role");
  const xmlns = svg.getAttribute("xmlns");
  const title = svg.querySelector("title");
  const hasScript = !!svg.querySelector("script");

  const checks: SvgCheck[] = [
    {
      label: "viewBox",
      pass: viewBox === expectedViewBox,
      detail: viewBox ?? "missing",
    },
    {
      label: 'role="img"',
      pass: role === "img",
      detail: role ? `"${role}"` : "missing",
    },
    {
      label: "xmlns",
      pass: xmlns === "http://www.w3.org/2000/svg",
      detail: xmlns ?? "missing",
    },
    {
      label: "<title>",
      pass: !!title && !!title.textContent?.trim(),
      detail: title?.textContent?.trim()
        ? `"${title.textContent.trim()}"`
        : "missing",
    },
    {
      label: "No embedded scripts",
      pass: !hasScript,
      detail: hasScript ? "script element found" : "clean",
    },
  ];

  if (bbox) {
    const tolerance = 0.5;
    const fits =
      bbox.x >= -tolerance &&
      bbox.y >= -tolerance &&
      bbox.x + bbox.width <= size + tolerance &&
      bbox.y + bbox.height <= size + tolerance;
    checks.push({
      label: "Fits viewBox",
      pass: fits,
      detail: fits
        ? `${r(bbox.width)} × ${r(bbox.height)} at (${r(bbox.x)}, ${r(bbox.y)})`
        : `extends to (${r(bbox.x)}, ${r(bbox.y)}) → (${r(bbox.x + bbox.width)}, ${r(bbox.y + bbox.height)})`,
    });

    const maxDim = Math.max(bbox.width, bbox.height);
    const fills = maxDim / size >= 0.999;
    checks.push({
      label: "Fills viewBox",
      pass: fills,
      detail: fills
        ? `${r(bbox.width)} × ${r(bbox.height)}`
        : `${r(bbox.width)} × ${r(bbox.height)}, need ${size} px in largest dimension`,
    });

    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    const maxOffset = size * 0.05;
    const isCentered =
      Math.abs(cx - size / 2) <= maxOffset &&
      Math.abs(cy - size / 2) <= maxOffset;
    checks.push({
      label: "Centered",
      pass: isCentered,
      detail: isCentered
        ? `center (${r(cx)}, ${r(cy)})`
        : `center (${r(cx)}, ${r(cy)}), expected (${size / 2}, ${size / 2})`,
    });
  }

  return checks;
}
