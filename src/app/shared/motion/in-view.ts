/**
 * One shared IntersectionObserver per margin: calls `cb` once when `el` comes into view.
 * Cheaper than a ScrollTrigger per element — no layout reads while the page loads or scrolls.
 * Returns a function that stops watching.
 */
const observers = new Map<string, { io: IntersectionObserver; cbs: Map<Element, () => void> }>();

export function onceInView(el: Element, cb: () => void, rootMargin = '0px 0px -12% 0px'): () => void {
  let entry = observers.get(rootMargin);
  if (!entry) {
    const cbs = new Map<Element, () => void>();
    const io = new IntersectionObserver(
      (items) => {
        for (const it of items) {
          if (!it.isIntersecting) continue;
          const fn = cbs.get(it.target);
          cbs.delete(it.target);
          io.unobserve(it.target);
          fn?.();
        }
      },
      { rootMargin },
    );
    entry = { io, cbs };
    observers.set(rootMargin, entry);
  }
  const e = entry;
  e.cbs.set(el, cb);
  e.io.observe(el);
  return () => {
    e.cbs.delete(el);
    e.io.unobserve(el);
  };
}
