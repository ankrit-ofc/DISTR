"use client";

import { TimelineContent } from "@/components/ui/timeline-animation";
import Image from "next/image";
import { useRef } from "react";

const TESTIMONIALS = [
  {
    quote:
      "DISTRO completely changed how I restock my shop. I place orders at midnight and everything arrives by morning — no more waking up early for the wholesale market.",
    name: "Ram Bahadur Thapa",
    role: "Owner, Thapa General Store",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=687&auto=format&fit=crop",
  },
  {
    quote:
      "The wholesale prices are genuinely lower than what I was getting before. My margins improved within the first month.",
    name: "Sita Sharma",
    role: "Sharma Wines & Spirits",
    image:
      "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?q=80&w=687&auto=format&fit=crop",
  },
  {
    quote:
      "Delivery inside Kathmandu valley is incredibly fast. I ordered at 10 AM and had stock on my shelves by 4 PM the same day.",
    name: "Bikash Rai",
    role: "Owner, Rai Corner Shop",
    image:
      "https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=1021&auto=format&fit=crop",
  },
  {
    quote:
      "As a small shop owner, I couldn't meet the minimum orders from big distributors. DISTRO's low MOQ means I can order what I actually need.",
    name: "Anita Gurung",
    role: "Gurung Beverages, Pokhara",
    image:
      "https://images.unsplash.com/photo-1615109398623-88346a601842?q=80&w=687&auto=format&fit=crop",
  },
  {
    quote:
      "The credit facility is what sold me. I can order stock, sell it, and then pay — just like the old udhari system but digitized and transparent.",
    name: "Deepak Shrestha",
    role: "Shrestha Mart, Lalitpur",
    image:
      "https://images.unsplash.com/photo-1740102074295-c13fae3e4f8a?q=80&w=687&auto=format&fit=crop",
  },
  {
    quote:
      "I used to spend half my day calling distributors and negotiating. Now I just open the app, compare prices, and order. Simple.",
    name: "Sunita Adhikari",
    role: "Adhikari Store, Bhaktapur",
    image:
      "https://images.unsplash.com/photo-1563237023-b1e970526dcb?q=80&w=765&auto=format&fit=crop",
  },
  {
    quote:
      "DISTRO has been a true game-changer for our business. Proper VAT invoices, reliable delivery schedule, and a product range that keeps growing. We've recommended it to every shopkeeper we know.",
    name: "Rajesh Maharjan",
    role: "Maharjan Wholesale, Kirtipur",
    image:
      "https://images.unsplash.com/photo-1590086782957-93c06ef21604?q=80&w=687&auto=format&fit=crop",
  },
];

const revealVariants = {
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.4,
      duration: 0.5,
    },
  }),
  hidden: {
    filter: "blur(10px)",
    y: -20,
    opacity: 0,
  },
};

export default function ClientFeedback() {
  const testimonialRef = useRef<HTMLDivElement>(null);

  return (
    <section
      className="relative bg-white rounded-2xl border border-[color:var(--gray)] py-14"
      ref={testimonialRef}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <article className="max-w-screen-md mx-auto text-center space-y-2 px-6">
        <TimelineContent
          as="h2"
          className="font-display font-extrabold text-[28px] md:text-4xl text-[color:var(--ink)]"
          animationNum={0}
          customVariants={revealVariants}
          timelineRef={testimonialRef}
        >
          Trusted by shopkeepers across Nepal
        </TimelineContent>
        <TimelineContent
          as="p"
          className="text-[color:var(--gray2)] text-base"
          animationNum={1}
          customVariants={revealVariants}
          timelineRef={testimonialRef}
        >
          Hear from the store owners who made the switch to DISTRO
        </TimelineContent>
      </article>

      {/* ── Grid ────────────────────────────────────────────── */}
      <div className="lg:grid lg:grid-cols-3 gap-2 flex flex-col w-full lg:py-10 pt-10 pb-4 lg:px-10 px-4">
        {/* Column 1 */}
        <div className="md:flex lg:flex-col lg:space-y-2 h-full lg:gap-0 gap-2">
          {/* Featured card — blue bg with grid pattern */}
          <TimelineContent
            animationNum={0}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="lg:flex-[7] flex-[6] flex flex-col justify-between relative bg-[color:var(--blue)] text-white overflow-hidden rounded-xl border border-[color:var(--gray)] p-5"
          >
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:50px_56px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            <article className="relative mt-auto">
              <p className="leading-relaxed">
                &ldquo;{TESTIMONIALS[0].quote}&rdquo;
              </p>
              <div className="flex justify-between items-end pt-5">
                <div>
                  <h3 className="font-display font-semibold lg:text-xl text-sm">
                    {TESTIMONIALS[0].name}
                  </h3>
                  <p className="text-blue-200 text-sm">
                    {TESTIMONIALS[0].role}
                  </p>
                </div>
                <Image
                  src={TESTIMONIALS[0].image}
                  alt={TESTIMONIALS[0].name}
                  width={200}
                  height={200}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              </div>
            </article>
          </TimelineContent>

          {/* Accent card — green */}
          <TimelineContent
            animationNum={1}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="lg:flex-[3] flex-[4] lg:h-fit lg:shrink-0 flex flex-col justify-between relative bg-[color:var(--green)] text-white overflow-hidden rounded-xl border border-[color:var(--gray)] p-5"
          >
            <article className="mt-auto">
              <p className="leading-relaxed">
                &ldquo;{TESTIMONIALS[1].quote}&rdquo;
              </p>
              <div className="flex justify-between items-end pt-5">
                <div>
                  <h3 className="font-display font-semibold text-xl">
                    {TESTIMONIALS[1].name}
                  </h3>
                  <p className="text-green-100 text-sm">
                    {TESTIMONIALS[1].role}
                  </p>
                </div>
                <Image
                  src={TESTIMONIALS[1].image}
                  alt={TESTIMONIALS[1].name}
                  width={200}
                  height={200}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              </div>
            </article>
          </TimelineContent>
        </div>

        {/* Column 2 — three dark cards */}
        <div className="lg:h-full md:flex lg:flex-col h-fit lg:space-y-2 lg:gap-0 gap-2">
          {[2, 3, 4].map((idx) => (
            <TimelineContent
              key={idx}
              animationNum={idx}
              customVariants={revealVariants}
              timelineRef={testimonialRef}
              className="flex flex-col justify-between relative bg-[color:var(--ink)] text-white overflow-hidden rounded-xl border border-[color:var(--gray)] p-5"
            >
              <article className="mt-auto">
                <p className="2xl:text-base text-sm leading-relaxed">
                  &ldquo;{TESTIMONIALS[idx].quote}&rdquo;
                </p>
                <div className="flex justify-between items-end pt-5">
                  <div>
                    <h3 className="font-display font-semibold lg:text-xl text-lg">
                      {TESTIMONIALS[idx].name}
                    </h3>
                    <p className="text-[color:var(--gray2)] lg:text-base text-sm">
                      {TESTIMONIALS[idx].role}
                    </p>
                  </div>
                  <Image
                    src={TESTIMONIALS[idx].image}
                    alt={TESTIMONIALS[idx].name}
                    width={200}
                    height={200}
                    className="lg:w-16 lg:h-16 w-12 h-12 rounded-xl object-cover"
                  />
                </div>
              </article>
            </TimelineContent>
          ))}
        </div>

        {/* Column 3 */}
        <div className="h-full md:flex lg:flex-col lg:space-y-2 lg:gap-0 gap-2">
          {/* Accent card — green */}
          <TimelineContent
            animationNum={5}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="lg:flex-[3] flex-[4] flex flex-col justify-between relative bg-[color:var(--green)] text-white overflow-hidden rounded-xl border border-[color:var(--gray)] p-5"
          >
            <article className="mt-auto">
              <p className="leading-relaxed">
                &ldquo;{TESTIMONIALS[5].quote}&rdquo;
              </p>
              <div className="flex justify-between items-end pt-5">
                <div>
                  <h3 className="font-display font-semibold text-xl">
                    {TESTIMONIALS[5].name}
                  </h3>
                  <p className="text-green-100 text-sm">
                    {TESTIMONIALS[5].role}
                  </p>
                </div>
                <Image
                  src={TESTIMONIALS[5].image}
                  alt={TESTIMONIALS[5].name}
                  width={200}
                  height={200}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              </div>
            </article>
          </TimelineContent>

          {/* Featured card — blue bg with grid pattern */}
          <TimelineContent
            animationNum={6}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="lg:flex-[7] flex-[6] flex flex-col justify-between relative bg-[color:var(--blue)] text-white overflow-hidden rounded-xl border border-[color:var(--gray)] p-5"
          >
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:50px_56px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            <article className="relative mt-auto">
              <p className="leading-relaxed">
                &ldquo;{TESTIMONIALS[6].quote}&rdquo;
              </p>
              <div className="flex justify-between items-end pt-5">
                <div>
                  <h3 className="font-display font-semibold text-xl">
                    {TESTIMONIALS[6].name}
                  </h3>
                  <p className="text-blue-200 text-sm">
                    {TESTIMONIALS[6].role}
                  </p>
                </div>
                <Image
                  src={TESTIMONIALS[6].image}
                  alt={TESTIMONIALS[6].name}
                  width={200}
                  height={200}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              </div>
            </article>
          </TimelineContent>
        </div>
      </div>

      {/* ── Bottom decorative border ────────────────────────── */}
      <div className="absolute border-b-2 border-[color:var(--gray)] bottom-4 h-16 z-[2] md:w-full w-[90%] md:left-0 left-[5%]">
        <div className="max-w-6xl mx-auto w-full h-full relative before:absolute before:-left-2 before:-bottom-2 before:w-4 before:h-4 before:bg-white before:shadow-sm before:border before:border-[color:var(--gray)] after:absolute after:-right-2 after:-bottom-2 after:w-4 after:h-4 after:bg-white after:shadow-sm after:border after:border-[color:var(--gray)]" />
      </div>
    </section>
  );
}
