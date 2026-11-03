import { useLayoutEffect, useRef } from 'react';

// A one-shot Web Animations API reveal. Unlike scroll-triggered GSAP animations,
// it never leaves opacity, visibility or transforms on the cards after playing.
const DETAILS = '[data-note-media], [data-note-category], [data-note-title], [data-note-summary], [data-note-footer]';
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'; // Smooth power3.out-like easing

function animateOnce(node, frames, options, running) {
  if (!node.animate) return;
  const animation = node.animate(frames, { ...options, easing: EASING, fill: 'backwards' });
  running.push(animation);
  // Clearing the animation returns the element to normal CSS, always visible.
  animation.addEventListener('finish', () => animation.cancel(), { once: true });
}

export default function StaggeredNoteGrid({ children, animationKey, empty = false }) {
  const gridRef = useRef(null);
  const selectedCategoryRef = useRef(null);
  const animatedCategoryRef = useRef(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const scrollArea = grid.closest('.custom-scrollbar');
    if (selectedCategoryRef.current !== animationKey) {
      // Switching sidebar categories should start at the top of the new list.
      selectedCategoryRef.current = animationKey;
      animatedCategoryRef.current = null;
      if (scrollArea) scrollArea.scrollTop = 0;
    }

    const cards = Array.from(grid.querySelectorAll('[data-note-card]'));
    if (!cards.length || animatedCategoryRef.current === animationKey) return;
    animatedCategoryRef.current = animationKey;

    // Accessibility: keep all cards immediately visible when motion is reduced.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Only animate cards visible at the moment a category first opens.
    // All cards below the fold stay visible at every point, including on scroll.
    const viewport = scrollArea ? scrollArea.getBoundingClientRect() : {
      top: 0, bottom: window.innerHeight
    };
    const columns = Math.max(
      1, window.getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length
    );
    const visible = cards.map((card, index) => ({ card, index })).filter(({ card }) => {
      const rect = card.getBoundingClientRect();
      return rect.bottom > viewport.top && rect.top < viewport.bottom;
    });
    const diagonal = visible.sort((a, b) => {
      const distanceA = Math.hypot(Math.floor(a.index / columns), a.index % columns);
      const distanceB = Math.hypot(Math.floor(b.index / columns), b.index % columns);
      return distanceA - distanceB || a.index - b.index;
    });

    const running = [];
    const delayStep = diagonal.length > 1 ? 600 / (diagonal.length - 1) : 0;
    diagonal.forEach(({ card }, rank) => {
      const delay = Math.round(rank * delayStep);
      animateOnce(card, [
        { opacity: 0, transform: 'translateY(30px) scale(0.95)', filter: 'blur(8px)' },
        { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' }
      ], { duration: 720, delay }, running);

      // The image, title, summary and footer follow the card in sequence.
      card.querySelectorAll(DETAILS).forEach((detail, partIndex) => {
        animateOnce(detail, [
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 420, delay: delay + 170 + partIndex * 70 }, running);
      });
    });

    // If the category changes mid-animation, canceling restores normal styling.
    return () => running.forEach((animation) => animation.cancel());
  }, [animationKey, empty]);

  return (
    <div
      ref={gridRef}
      className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20 items-stretch ${empty ? 'hidden' : ''}`}
    >
      {children}
    </div>
  );
}
