import { useEffect, useRef, useState } from "react";

// Never animate for visitors who have asked their device for less motion.
const ENABLE_QUERY = "(prefers-reduced-motion: no-preference)";

const matchesQuery = () =>
  typeof window !== "undefined" && window.matchMedia(ENABLE_QUERY).matches;

// Defer the heavy work until the browser is idle so the page's text and
// images paint first.
const whenIdle = (fn) =>
  "requestIdleCallback" in window
    ? window.requestIdleCallback(fn, { timeout: 1500 })
    : window.setTimeout(fn, 300);

const cancelIdle = (id) =>
  "cancelIdleCallback" in window
    ? window.cancelIdleCallback(id)
    : window.clearTimeout(id);

/**
 * Lazily mounts a WebGL scene into the returned ref.
 *
 * `load` must be a stable function (define it at module level) that resolves
 * to `create(host) => cleanup`. Using a dynamic import inside it keeps
 * three.js out of the main bundle. The host gets an `is-ready` class once the
 * scene is running, which the styles use to fade it in.
 */
export function useLazyScene(load) {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(matchesQuery);

  // Follow live changes to the reduced-motion setting.
  useEffect(() => {
    const query = window.matchMedia(ENABLE_QUERY);
    const onChange = () => setEnabled(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    let cleanup = null;

    const idleId = whenIdle(() => {
      load()
        .then((create) => {
          if (cancelled || !ref.current) return;
          cleanup = create(ref.current);
          ref.current.classList.add("is-ready");
        })
        .catch(() => {
          /* Decorative only: if it fails to load, show nothing. */
        });
    });

    return () => {
      cancelled = true;
      cancelIdle(idleId);
      if (cleanup) cleanup();
    };
  }, [enabled, load]);

  return { ref, enabled };
}
