export function animateRoutePath(pathElement: SVGPathElement) {
  const length = pathElement.getTotalLength();
  pathElement.style.strokeDasharray = String(length);
  pathElement.style.strokeDashoffset = String(length);
  pathElement.animate(
    [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
    { duration: 1000 }
  );
}