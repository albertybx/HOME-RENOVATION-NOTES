import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

const DETAILS = '[data-note-media], [data-note-category], [data-note-title], [data-note-summary], [data-note-footer]';

// Reveal the whole grid once on initial entry and whenever the selected category changes.
// Scrolling and searching do not restart the animation or hide cards.
export default function StaggeredNoteGrid({ children, animationKey, empty = false }) {
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    const gridElement = gridRef.current;
    if (!gridElement) return;

    const cards = Array.from(gridElement.querySelectorAll('[data-note-card]'));
    if (!cards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const details = cards.flatMap((card) => Array.from(card.querySelectorAll(DETAILS)));
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          // Once revealed, restore normal CSS visibility and hover behavior permanently.
          gsap.set(cards, { clearProps: 'transform,opacity,visibility,filter' });
          gsap.set(details, { clearProps: 'transform,opacity,visibility' });
        }
      });

      timeline.fromTo(cards, {
        y: 30, scale: 0.95, autoAlpha: 0, filter: 'blur(8px)'
      }, {
        y: 0, scale: 1, autoAlpha: 1, filter: 'blur(0px)',
        duration: 0.72,
        stagger: { grid: 'auto', from: 'start', amount: 0.6 }
      }, 0);

      const step = cards.length > 1 ? 0.6 / (cards.length - 1) : 0;
      cards.forEach((card, index) => {
        const parts = card.querySelectorAll(DETAILS);
        timeline.fromTo(parts, { y: 12, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1,
          duration: 0.42, stagger: 0.07
        }, 0.17 + index * step);
      });
    }, gridElement);

    return () => ctx.revert();
  }, [animationKey]);

  return (
    <div
      ref={gridRef}
      className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20 items-stretch ${empty ? 'hidden' : ''}`}
    >
      {children}
    </div>
  );
}
