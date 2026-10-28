/** One disposable controller per Astro page. No click interception. */
export function installCursor(): () => void {
  const layer = document.querySelector<HTMLElement>("#custom-cursor");
  const point = layer?.querySelector<HTMLElement>(".cursor-point");
  const frame = layer?.querySelector<SVGSVGElement>(".cursor-bracket");
  const outline = frame?.querySelector<SVGPathElement>(".cursor-outline");
  if (!layer || !point || !frame || !outline) return () => {};
  const media = matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  const abort = new AbortController();
  const { signal } = abort;
  const posts = [
    ...document.querySelectorAll<HTMLElement>("[data-post-hit]"),
  ].map((root) => ({
    root,
    surface: root.querySelector<HTMLElement>("[data-post-surface]")!,
    x: 0,
    y: 0,
    rect: root.getBoundingClientRect(),
  }));
  let x = 0,
    y = 0,
    cx = 0,
    cy = 0,
    w = 24,
    h = 24,
    join = 0;
  let visible = false,
    initialized = false,
    raf = 0,
    last = 0,
    entered = 0;
  let target: HTMLElement | null = null;
  let targetRect: DOMRect | null = null;
  let dirty = true,
    trackUntil = 0;
  const clamp = (n: number) => Math.max(-1, Math.min(1, n));
  const wake = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const invalidate = () => {
    dirty = true;
    trackUntil = performance.now() + 350;
    wake();
  };
  const hide = () => {
    visible = false;
    layer.removeAttribute("data-visible");
    layer.removeAttribute("data-pressed");
    document.documentElement.classList.remove("cursor-enabled");
    wake();
  };
  function tick(now: number) {
    raf = 0;
    const dt = Math.min(last ? now - last : 16, 40);
    last = now;
    const enabled = media.matches && visible && !document.hidden;
    const alpha = 1 - Math.exp(-dt / 45);
    let moving = false;
    if (dirty) {
      for (const post of posts) post.rect = post.root.getBoundingClientRect();
      targetRect = null;
      dirty = false;
    }
    const hit = enabled ? document.elementFromPoint(x, y) : null;
    const native = !!hit?.closest(
      "input, textarea, select, [contenteditable]:not([contenteditable='false']), iframe",
    );
    const activePost =
      enabled && !native
        ? posts.find((p) => hit?.closest("[data-post-hit]") === p.root)
        : undefined;
    // Root stays still: no transformed-center feedback or boundary oscillation.
    for (const post of posts) {
      const r = post.rect;
      const dx =
        activePost === post
          ? clamp((x - r.left - r.width / 2) / (r.width / 2)) * 8
          : 0;
      const dy =
        activePost === post
          ? clamp((y - r.top - r.height / 2) / (r.height / 2)) * 6
          : 0;
      const a = activePost === post ? alpha : 1 - Math.exp(-dt / 65);
      post.x += (dx - post.x) * a;
      post.y += (dy - post.y) * a;
      if (Math.abs(dx - post.x) + Math.abs(dy - post.y) < 0.02) {
        post.x = dx;
        post.y = dy;
      } else moving = true;
      post.surface.style.transform = `translate3d(${post.x}px,${post.y}px,0)`;
    }
    let next =
      enabled && !native
        ? (hit?.closest<HTMLElement>("[data-cursor]") ?? null)
        : null;
    const disabled = !!next?.matches(":disabled, [aria-disabled='true']");
    if (disabled) next = null;
    if (!next && activePost && !disabled)
      next = activePost.root.querySelector<HTMLElement>(".post-entry");
    if (next !== target) {
      if (!target && next) entered = now;
      target = next;
      targetRect = null;
    }
    const show = enabled && !native;
    layer.toggleAttribute("data-visible", show);
    document.documentElement.classList.toggle("cursor-enabled", show);
    layer.toggleAttribute("data-snapped", !!target);
    let tx = x,
      ty = y,
      tw = 24,
      th = 24;
    if (target?.isConnected) {
      const isArticle = target.dataset.cursor === "article";
      const surface = isArticle ? activePost?.surface : target;
      if (surface) {
        if (!targetRect || activePost || now < trackUntil)
          targetRect = surface.getBoundingClientRect();
        const r = targetRect;
        const pad = isArticle || target.dataset.cursor === "tag" ? 0 : 3;
        tx = r.left + r.width / 2;
        ty = r.top + r.height / 2;
        tw = r.width + pad * 2;
        th = r.height + pad * 2;
      }
    }
    if (!initialized && show) {
      cx = tx;
      cy = ty;
      initialized = true;
    }
    cx += (tx - cx) * alpha;
    cy += (ty - cy) * alpha;
    w += (tw - w) * alpha;
    h += (th - h) * alpha;
    const desiredJoin = target && now - entered >= 40 ? 1 : 0;
    join += (desiredJoin - join) * (1 - Math.exp(-dt / (target ? 50 : 40)));
    if (Math.abs(join - desiredJoin) < 0.002) join = desiredJoin;
    const pressed = layer.hasAttribute("data-pressed") ? 0.8 : 1;
    point.style.transform = `translate3d(${x}px,${y}px,0) scale(${pressed})`;
    // Align both ends to the physical pixel grid: fractional transforms otherwise
    // rasterize short corners and long connecting strokes at different weights.
    const ratio = window.devicePixelRatio || 1;
    const snap = (value: number) => Math.round(value * ratio) / ratio;
    const left = snap(cx - w / 2);
    const top = snap(cy - h / 2);
    frame.style.transform = `translate3d(${left}px,${top}px,0)`;
    const pw = Math.max(1, Math.round(w * ratio));
    const ph = Math.max(1, Math.round(h * ratio));
    frame.style.width = `${pw / ratio}px`;
    frame.style.height = `${ph / ratio}px`;
    frame.setAttribute("viewBox", `0 0 ${pw} ${ph}`);
    // Draw one filled shape in physical-pixel coordinates. Unlike a 1px CSS
    // border, the thickness cannot split asymmetrically at 125%/150% scaling.
    const thickness = Math.max(1, Math.round(ratio));
    const corner = Math.min(Math.round(6 * ratio), pw / 2, ph / 2);
    const horizontal = corner + Math.round((pw / 2 - corner) * join);
    const vertical = corner + Math.round((ph / 2 - corner) * join);
    const rect = (rx: number, ry: number, rw: number, rh: number) =>
      `M${rx} ${ry}h${rw}v${rh}h${-rw}z`;
    outline.setAttribute(
      "d",
      [
        rect(0, 0, horizontal, thickness),
        rect(pw - horizontal, 0, horizontal, thickness),
        rect(0, ph - thickness, horizontal, thickness),
        rect(pw - horizontal, ph - thickness, horizontal, thickness),
        rect(0, 0, thickness, vertical),
        rect(pw - thickness, 0, thickness, vertical),
        rect(0, ph - vertical, thickness, vertical),
        rect(pw - thickness, ph - vertical, thickness, vertical),
      ].join(""),
    );
    const unsettled =
      Math.abs(tx - cx) +
        Math.abs(ty - cy) +
        Math.abs(tw - w) +
        Math.abs(th - h) >
        0.05 || join !== desiredJoin;
    if (
      moving ||
      (show &&
        (unsettled || (target && now - entered < 40) || now < trackUntil))
    )
      wake();
    else last = 0;
  }
  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse" || !media.matches) {
        hide();
        return;
      }
      x = event.clientX;
      y = event.clientY;
      visible = true;
      wake();
    },
    { signal, passive: true },
  );
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType !== "mouse") {
        hide();
        return;
      }
      if (
        event.target instanceof Element &&
        event.target.closest(":disabled, [aria-disabled='true']")
      )
        return;
      if (event.button === 0 && media.matches) {
        layer.setAttribute("data-pressed", "");
        trackUntil = performance.now() + 250;
        wake();
      }
    },
    { signal },
  );
  window.addEventListener(
    "pointerup",
    () => {
      layer.removeAttribute("data-pressed");
      invalidate();
    },
    { signal },
  );
  document.addEventListener("pointerleave", hide, { signal });
  document.addEventListener("pointercancel", hide, { signal });
  window.addEventListener("blur", hide, { signal });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) hide();
    },
    { signal },
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Tab") hide();
    },
    { signal },
  );
  window.addEventListener("scroll", invalidate, {
    signal,
    passive: true,
    capture: true,
  });
  window.addEventListener("resize", invalidate, { signal, passive: true });
  document.addEventListener("theme-changed", invalidate, { signal });
  media.addEventListener(
    "change",
    () => {
      hide();
      invalidate();
    },
    { signal },
  );
  const observer = new ResizeObserver(invalidate);
  observer.observe(document.body);
  for (const post of posts) observer.observe(post.root);
  document.fonts.ready.then(() => {
    if (!signal.aborted) invalidate();
  });
  return () => {
    abort.abort();
    observer.disconnect();
    cancelAnimationFrame(raf);
    document.documentElement.classList.remove("cursor-enabled");
    layer.removeAttribute("data-visible");
    layer.removeAttribute("data-pressed");
    for (const post of posts) post.surface.style.removeProperty("transform");
  };
}
