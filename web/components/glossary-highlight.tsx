'use client';

import { useEffect } from 'react';

const HIGHLIGHT_CLASS = 'glossary-entry-highlight';

/** Glossary slugs are lowercase letters, numbers, and hyphens only (from data). */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * On mount, if the URL has a hash (e.g. /glossary#module-lwe), finds the
 * element with that id and adds a brief highlight class, then removes it
 * after the animation ends.
 *
 * Security: we use getElementById with a slug-validated hash only; we never
 * use the hash in selectors, markup, or class names. The class we add is a
 * fixed constant, so there is no injection surface.
 */
export function GlossaryHighlight() {
  useEffect(() => {
    const raw = window.location.hash.slice(1);
    if (!raw || !SLUG_REGEX.test(raw)) return;

    const el = document.getElementById(raw);
    if (!el) return;

    el.classList.add(HIGHLIGHT_CLASS);
    const onEnd = () => el.classList.remove(HIGHLIGHT_CLASS);
    el.addEventListener('animationend', onEnd, { once: true });
  }, []);

  return null;
}
