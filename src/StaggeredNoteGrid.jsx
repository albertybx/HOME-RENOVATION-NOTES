import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DETAILS = '[data-note-media], [data-note-category], [data-note-title], [data-note-summary], [data-note-footer]';
const inOrder = (elements) => Array.from(elements).sort(
  (a, b) => Number(a.dataset.staggerIndex) - Number(b.dataset.staggerIndex)
);

export default function StaggeredNoteGrid({ children, scrollerRef, animationKey }) {
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    const scroller = scrollerRef.current;
    if (!grid || !scroller) return;
    const cards = Array.from(grid.querySelectorAll('[data-note-card]'));
    if (!cards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const inner = cards.flatMap(card => Array.from(card.querySelectorAll(DETAILS)));
    gsap.set(cards, { y: 30, scale: 0.95, autoAlpha: 0, filter: 'blur(8px)', transformOrigin: 'center bottom' });
    gsap.set(inner, { y: 12, autoAlpha: 0 });

    const reveal = (batch) => {
      const ordered = inOrder(batch);
      const step = ordered.length > 1 ? 0.6 / (ordered.length - 1) : 0;
      gsap.set(ordered, { y: 30, scale: 0.95, autoAlpha: 0, filter: 'blur(8px)' });
      gsap.to(ordered, {
        y: 0, scale: 1, autoAlpha: 1, filter: 'blur(0px)',
        duration: 0.72, ease: 'power3.out',
        stagger: { grid: 'auto', from: 'start', amount: 0.6 },
        overwrite: 'auto'
      });
      ordered.forEach((card, index) => {
        const parts = card.querySelectorAll(DETAILS);
        gsap.set(parts, { y: 12, autoAlpha: 0 });
        gsap.to(parts, {
          y: 0, autoAlpha: 1, duration: 0.42,
          delay: 0.17 + index * step, stagger: 0.07,
          ease: 'power3.out', overwrite: 'auto'
        });
      });
    };

    // Fade out in reverse order only after scrolling out of view.
    const fadeOut = (batch) => {
      const reversed = inOrder(batch).reverse();
      const parts = reversed.flatMap(card => Array.from(card.querySelectorAll(DETAILS)));
      gsap.to(parts, { y: -10, autoAlpha: 0, duration: 0.24, ease: 'power3.in', overwrite: 'auto' });
      gsap.to(reversed, {
        y: -24, scale: 0.95, autoAlpha: 0, filter: 'blur(8px)',
        duration: 0.42, stagger: { each: 0.08 }, ease: 'power3.in', overwrite: 'auto'
      });
    };

    const triggers = ScrollTrigger.batch(cards, {
      scroller, start: 'top 88%', end: 'bottom 12%',
      interval: 0.08, batchMax: 6,
      onEnter: reveal, onEnterBack: reveal,
      onLeave: fadeOut, onLeaveBack: fadeOut
    });
    ScrollTrigger.refresh();

    return () => {
      triggers.forEach(trigger => trigger.kill());
      gsap.killTweensOf([...cards, ...inner]);
      gsap.set([...cards, ...inner], { clearProps: 'opacity,visibility,transform,filter' });
    };
  }, [animationKey, scrollerRef]);

  return (
    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20 items-stretch">
      {children}
    </div>
  );
}
