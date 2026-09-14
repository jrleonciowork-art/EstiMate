'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building2, HardHat, Compass, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Deep, dark blueprint navy that fits the website theme (#11224D)
const DARK_BLUE_THEME = '#0B1530';

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    // Native direct scrolling without Lenis virtual drag or interpolation delay
    let ctx = gsap.context(() => {
      if (triggerElement) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerElement,
            start: 'top top',
            end: 'bottom top',
            scrub: true, // Direct 1:1 native scroll synchronization (0ms delay)
            invalidateOnRefresh: true,
          },
        });

        const layers = [
          { layer: '1', yPercent: 25 }, // Primary background skyline + ground ridge
          { layer: '2', yPercent: 45 }, // Central brand title & CTA
        ];

        layers.forEach((layerObj, idx) => {
          tl.to(
            triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
            {
              yPercent: layerObj.yPercent,
              ease: 'none',
              force3D: true, // Hardware acceleration for instant GPU rendering
            },
            idx === 0 ? undefined : '<'
          );
        });
      }
    }, parallaxRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="parallax w-full overflow-hidden" ref={parallaxRef} style={{ backgroundColor: DARK_BLUE_THEME }}>
      {/* Parallax Hero Header */}
      <section
        className="parallax__header relative w-full h-screen overflow-hidden"
        style={{ backgroundColor: DARK_BLUE_THEME }}
      >
        <div className="parallax__visuals relative w-full h-full">
          <div className="parallax__black-line-overflow" />

          <div data-parallax-layers className="parallax__layers relative w-full h-full">
            {/* Layer 1: Primary Parallax Background Image (Gemini Metro Manila Skyline) */}
            <div
              data-parallax-layer="1"
              className="parallax__layer absolute inset-x-0 -top-[12%] w-full h-[124%] will-change-transform"
            >
              <img
                src="/Gemini_Generated_Image_ng30agng30agng30.jpg"
                loading="eager"
                alt="Metro Manila Skyline Sunset with Earthy Ridge"
                className="w-full h-full object-cover object-center"
              />
              {/* Blueprint atmospheric overlay for seamless theme integration */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#11224D]/50 via-transparent to-[#0B1530]/85 pointer-events-none" />
            </div>

            {/* Layer 2: Central EstiMate Title & Branding with 1:1 Instant Depth Scrub */}
            <div
              data-parallax-layer="2"
              className="parallax__layer-title absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-10 will-change-transform"
            >
              <h2 className="parallax__title font-sans text-6xl sm:text-8xl md:text-9xl font-extrabold tracking-tight text-white drop-shadow-[0_12px_45px_rgba(0,0,0,0.9)]">
                Esti<span className="text-[#F98125]">Mate</span>
              </h2>

              <p className="mt-4 max-w-xl text-sm sm:text-lg text-white font-medium tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
                The count-tractor you can actually count on
              </p>

              <div className="mt-7 flex items-center gap-3 pointer-events-auto">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 rounded-xl bg-[#F98125] px-7 py-3.5 text-sm font-bold text-white shadow-2xl shadow-orange-950/60 transition hover:bg-[#FB9B50] hover:scale-105"
                >
                  Start Estimating <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Seamless Bottom Gradient Fade into Dark Blueprint Navy (#0B1530) */}
          <div
            className="parallax__fade absolute bottom-0 left-0 w-full h-56 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to bottom, rgba(11, 21, 48, 0) 0%, rgba(11, 21, 48, 0.3) 30%, rgba(11, 21, 48, 0.8) 70%, ${DARK_BLUE_THEME} 100%)`,
            }}
          />
        </div>
      </section>

      {/* Parallax Content Section: Darker shade of blueprint navy (#0B1530) fitting the EstiMate brand */}
      <section
        className="parallax__content relative z-10 min-h-screen px-6 py-24 text-white blueprint-grid"
        style={{ backgroundColor: DARK_BLUE_THEME }}
      >
        <div className="mx-auto max-w-5xl text-center">
          {/* Lucide React Construction / Architecture Icon */}
          <div className="flex justify-center mb-8">
            <div className="grid h-24 w-24 place-items-center rounded-3xl border border-[#2C599D]/80 bg-[#193A6F]/60 text-[#F98125] shadow-2xl shadow-black/40 backdrop-blur-xl">
              <Building2 className="h-12 w-12" strokeWidth={1.8} />
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#5B84C4]">
            Ground-Truth Field Estimating
          </p>

          <h3 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Precision Quantity Surveying for Philippine Sites
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-100/75">
            Turn actual field dimensions into procurement-ready cement bags, rebar steel, CHB block counts, and DOLE NCR-27 compliant labor costs. No spreadsheets, no latency, and works completely offline.
          </p>

          {/* Quick Value Cards with Blueprint Theming */}
          <div className="mt-14 grid gap-6 sm:grid-cols-3 text-left">
            <div className="rounded-2xl border border-[#2C599D]/70 bg-[#193A6F]/50 p-6 backdrop-blur-md shadow-lg shadow-black/20 hover:border-[#F98125]/40 transition">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F98125]/20 text-[#F98125] mb-4">
                <Compass className="h-5 w-5" />
              </span>
              <h4 className="text-lg font-bold text-white">Commercial Yields</h4>
              <p className="mt-2 text-xs leading-relaxed text-blue-100/70">
                Calculates whole cement bags (40kg/50kg), Class AA to C mix proportions, washed sand, and 3/4 gravel volumes with accurate wastage.
              </p>
            </div>

            <div className="rounded-2xl border border-[#2C599D]/70 bg-[#193A6F]/50 p-6 backdrop-blur-md shadow-lg shadow-black/20 hover:border-[#5B84C4] transition">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#5B84C4]/20 text-[#5B84C4] mb-4">
                <HardHat className="h-5 w-5" />
              </span>
              <h4 className="text-lg font-bold text-white">DOLE Wage Baselines</h4>
              <p className="mt-2 text-xs leading-relaxed text-blue-100/70">
                Productivity-based man-days for foremen, skilled masons, and helpers calibrated to official NCR-27 regional wage orders.
              </p>
            </div>

            <div className="rounded-2xl border border-[#2C599D]/70 bg-[#193A6F]/50 p-6 backdrop-blur-md shadow-lg shadow-black/20 hover:border-emerald-400/40 transition">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-4">
                <FileText className="h-5 w-5" />
              </span>
              <h4 className="text-lg font-bold text-white">Instant Master BOQ</h4>
              <p className="mt-2 text-xs leading-relaxed text-blue-100/70">
                Export an itemized Bill of Quantities PDF directly from your phone or tablet on site before presenting to clients.
              </p>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              to="/dashboard"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#F98125] px-8 text-sm font-bold text-white shadow-xl shadow-orange-950/40 transition hover:bg-[#FB9B50] hover:scale-105"
            >
              Open Project Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
