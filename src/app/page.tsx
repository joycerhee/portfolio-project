"use client";

import React, { useEffect, useRef, useState, MouseEvent } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
  useInView,
} from "framer-motion";

type Project = {
  id: string;
  type: string;
  title: string;
  description: string;
  role: string;
  tools: string;
  link: string;
  image: string;
  accent: string;
};

const projects: Project[] = [
  {
    id: "museum",
    type: "Interactive Exhibit",
    title: "iPhone Evolution Museum",
    description:
      "A six-room guided museum exploring 19 years of iPhone history. Dark cinematic theme, scroll-driven animations, and a spec-sprint-QA development process using GitHub Copilot and Claude as AI collaborators.",
    role: "Designer and Developer",
    tools: "Next.js, Tailwind CSS, Framer Motion, GitHub Copilot, Claude",
    link: "https://joycerhee.github.io/iphone-museum/",
    image: "/portfolio-photos/iphoneMuseumImage.png",
    accent: "#d4a574",
  },
  {
    id: "research",
    type: "Academic Research",
    title: "Digital Accessibility: Why Businesses Still Fail",
    description:
      "A research paper investigating the gap between accessibility laws and actual implementation. Examined resource barriers, awareness gaps, and why companies treat compliance as a ceiling instead of a floor.",
    role: "Researcher and Author",
    tools: "Academic databases, Google Scholar, peer-reviewed sources",
    link: "https://drive.google.com/file/d/1HTycaDREe-ATnnsXLVcKk6ZYpPDgwSdg/view?usp=sharing",
    image: "/portfolio-photos/WhitePaperImage.png",
    accent: "#c89178",
  },
  {
    id: "canvas",
    type: "UX Research",
    title: "Redesigning the Canvas Experience",
    description:
      "An interview-based usability study with students and professors. Eight participants, thematic analysis, persona profiles, affinity diagrams, and a set of design recommendations for improving how Canvas handles assignments and navigation.",
    role: "UX Researcher",
    tools: "Semi-structured interviews, affinity mapping, persona development",
    link: "https://drive.google.com/file/d/1VpNNOyfG95mUJNr8YxGw1bMvB4Zr8nTl/view?usp=sharing",
    image: "/portfolio-photos/CanvasStudy.png",
    accent: "#a8b89a",
  },
];

/* ---------- Reusable animated wrappers ---------- */

function Reveal({
  children,
  delay = 0,
  y = 24,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MagneticButton({
  children,
  className = "",
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });

  function handleMove(e: MouseEvent<HTMLButtonElement>) {
    const rect = ref.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left - rect.width / 2;
    const my = e.clientY - rect.top - rect.height / 2;
    x.set(mx * 0.25);
    y.set(my * 0.25);
  }
  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

function TiltCard({
  children,
  onClick,
  className = "",
  ariaLabel,
  delay = 0,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });
  const inView = useInView(ref, { once: true, margin: "-80px" });

  function handleMove(e: MouseEvent<HTMLButtonElement>) {
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 8);
    rx.set(-py * 8);
  }
  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      aria-label={ariaLabel}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/* ---------- Page ---------- */

export default function Home() {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [cursor, setCursor] = useState({ x: -200, y: -200 });

  // Top scroll progress bar
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // Hero parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(heroProgress, [0, 1], [1, 0.4]);
  const blob1Y = useTransform(heroProgress, [0, 1], [0, -80]);
  const blob2Y = useTransform(heroProgress, [0, 1], [0, 100]);

  // Cursor glow
  useEffect(() => {
    const move = (e: globalThis.MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = activeProject ? "hidden" : "";
  }, [activeProject]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const active = projects.find((p) => p.id === activeProject);

  return (
    <main className="min-h-screen bg-[#f5efe6] text-[#2d2117] font-sans selection:bg-[#d4a574] selection:text-[#2d2117]">
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: progressX, transformOrigin: "0% 50%" }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-[#8b5e3c] z-[60]"
      />

      {/* Cursor glow (desktop only) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] hidden md:block"
        style={{
          background: `radial-gradient(300px circle at ${cursor.x}px ${cursor.y}px, rgba(212,165,116,0.10), transparent 60%)`,
          transition: "background 80ms linear",
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 backdrop-blur-md bg-[#f5efe6]/80 border-b border-[#e3d3bf]"
      >
        <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4 lg:px-8">
          <button
            onClick={() => scrollToSection("hero")}
            className="font-serif text-xl font-semibold tracking-tight"
          >
            Joyce Rhee
          </button>
          <div className="hidden md:flex items-center gap-8 text-sm">
            {["about me", "work", "skills", "contact"].map((id) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="capitalize text-[#5a4838] hover:text-[#8b5e3c] transition-colors relative group"
              >
                {id}
                <span className="absolute left-0 -bottom-1 h-px w-full bg-[#8b5e3c] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </button>
            ))}
          </div>
          <MagneticButton
            onClick={() => scrollToSection("contact")}
            className="hidden sm:inline-flex rounded-full bg-[#2d2117] text-[#faf5ec] text-xs font-medium px-4 py-2 hover:bg-[#8b5e3c] transition-colors"
          >
            Say hi
          </MagneticButton>
        </nav>
      </motion.header>

      {/* Hero */}
      <section
        id="hero"
        ref={heroRef}
        className="relative overflow-hidden px-6 pt-20 pb-32 lg:px-8 lg:pt-28 lg:pb-40"
      >
        {/* Decorative animated blobs */}
        <motion.div
          style={{ y: blob1Y }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-[#d4a574]/30 blur-3xl"
        />
        <motion.div
          style={{ y: blob2Y }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute top-40 -left-32 h-[380px] w-[380px] rounded-full bg-[#a8b89a]/25 blur-3xl"
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative mx-auto max-w-6xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#8b5e3c]/30 bg-[#faf5ec]/70 px-4 py-1.5 text-xs font-medium text-[#5a4838]"
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-[#8b5e3c]"
            />
            UX Research · Front-End · Accessibility
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
            }}
            className="mt-8 font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight max-w-4xl"
          >
            {[
              "The best digital products start with the people ",
            ].map((chunk, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
              >
                {chunk}
              </motion.span>
            ))}
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="relative inline-block italic text-[#8b5e3c]"
            >
              everyone else overlooks
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "0% 50%" }}
                className="absolute left-0 -bottom-2 h-[3px] w-full bg-[#d4a574]"
              />
            </motion.span>
            <motion.span
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.6 } },
              }}
            >
              .
            </motion.span>
          </motion.h1>

          <Reveal delay={0.4} className="mt-10 grid gap-6 max-w-2xl">
            <p className="text-lg text-[#5a4838] leading-relaxed">
              I study how real people use digital products, then I build interfaces that
              actually work for all of them. Sophomore at NJIT studying Information
              Technology, focused on accessibility and human-centered design.
            </p>
            <p className="text-base text-[#5a4838] leading-relaxed">
              <span className="font-semibold text-[#2d2117]">Built for </span>
              Product teams that treat accessibility as a design decision, not a
              compliance checkbox.
            </p>
          </Reveal>

          <Reveal delay={0.55} className="mt-10 flex flex-wrap gap-4">
            <MagneticButton
              onClick={() => scrollToSection("work")}
              className="group rounded-full bg-[#8b5e3c] px-7 py-3.5 text-sm font-semibold text-[#faf5ec] hover:bg-[#6f472d] transition-all hover:shadow-lg hover:shadow-[#8b5e3c]/30 inline-flex items-center gap-2"
            >
              See my work
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </MagneticButton>
            <MagneticButton
              onClick={() => scrollToSection("contact")}
              className="rounded-full border border-[#8b5e3c]/40 bg-[#faf5ec] px-7 py-3.5 text-sm font-semibold text-[#2d2117] hover:bg-[#ecdfd0] transition-colors"
            >
              Let's talk
            </MagneticButton>
          </Reveal>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-16 flex items-center gap-3 text-xs text-[#8b5e3c]"
          >
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              ↓
            </motion.span>
            scroll
          </motion.div>
        </motion.div>
      </section>

      {/* About */}
      <section id="about me" className="relative px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-[1.4fr_1fr] gap-16">
          <Reveal>
            <span className="text-xs uppercase tracking-[0.2em] text-[#8b5e3c] font-semibold">
              Who I am
            </span>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl leading-tight tracking-tight">
              Building toward accessibility, research, and front-end craft —{" "}
              <span className="italic text-[#8b5e3c]">with intention.</span>
            </h2>
            <p className="mt-6 text-[#5a4838] leading-relaxed">
              This semester changed how I think about design. Through four research
              projects, I learned that the most important design decisions happen before
              you open a code editor. I interview real users, map their pain points, build
              affinity diagrams, and write recommendations that actually lead somewhere.
            </p>
            <p className="mt-4 text-[#5a4838] leading-relaxed">
              I also write the front-end code, because research that never ships is just a
              PDF nobody reads. I am a student who found her direction early and is
              building toward it with intention.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <motion.div
  whileHover={{ y: -6 }}
  transition={{ type: "spring", stiffness: 200, damping: 18 }}
  className="rounded-[2rem] bg-[#faf5ec] border border-[#e3d3bf] p-8 space-y-6"
>
  <div className="flex items-center gap-4">
    <motion.div
      whileHover={{ scale: 1.05, rotate: 2 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden border-2 border-[#d4a574]"
    >
      <img
        src="/portfolio-photos/portfoliopicofme.jpg"
        alt="Joyce Rhee"
        className="h-full w-full object-cover"
      />
    </motion.div>
    <div className="flex -space-x-2">
      <span className="h-8 w-8 rounded-full bg-[#d4a574]" />
      <span className="h-8 w-8 rounded-full bg-[#a8b89a]" />
    </div>
  </div>
  <div>
    <p className="text-xs uppercase tracking-widest text-[#8b5e3c]">Currently</p>
    <p className="mt-1 font-serif text-xl">Sophomore @ NJIT</p>
  </div>
  <motion.div
    animate={{ rotate: [0, 2, -2, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    className="inline-flex items-center gap-2 rounded-full bg-[#ecdfd0] px-4 py-2 text-xs font-medium text-[#2d2117]"
  >
    ✦ Open to internships
  </motion.div>
</motion.div>

          </Reveal>
        </div>
      </section>

      {/* Work */}
      <section id="work" className="relative px-6 py-24 lg:px-8 lg:py-32 bg-[#efe6d8]">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between flex-wrap gap-6">
            <Reveal>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8b5e3c] font-semibold">
                Selected Work
              </span>
              <h2 className="mt-4 font-serif text-4xl sm:text-5xl leading-tight tracking-tight max-w-2xl">
                Projects that combine{" "}
                <span className="italic text-[#8b5e3c]">research, design, and code.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <span className="text-sm text-[#5a4838]">Click any card for details</span>
            </Reveal>
          </div>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <TiltCard
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                ariaLabel={`Open details for ${project.title}`}
                delay={i * 0.1}
                className={`group relative overflow-hidden rounded-[2rem] bg-[#faf5ec] border border-[#e3d3bf] p-6 text-left transition-shadow hover:shadow-2xl hover:shadow-[#8b5e3c]/15 ${
                  i === 1 ? "lg:translate-y-8" : ""
                }`}
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-[#ecdfd0]">
                  <motion.img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(180deg, transparent 40%, ${project.accent}40)`,
                    }}
                  />
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute top-4 right-4 h-9 w-9 rounded-full bg-[#faf5ec] text-[#2d2117] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    →
                  </motion.span>
                </div>
                <span className="text-xs uppercase tracking-widest text-[#8b5e3c] font-semibold">
                  {project.type}
                </span>
                <h3 className="mt-2 font-serif text-2xl leading-snug">{project.title}</h3>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setActiveProject(null)}
            className="fixed inset-0 z-[70] bg-[#2d2117]/70 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-[#faf5ec] p-8 sm:p-10"
            >
              <button
                onClick={() => setActiveProject(null)}
                aria-label="Close"
                className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ecdfd0] hover:bg-[#8b5e3c] hover:text-[#faf5ec] text-[#2d2117] flex items-center justify-center transition-colors"
              >
                ✕
              </button>
              <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-[#ecdfd0]">
                <img src={active.image} alt={active.title} className="h-full w-full object-cover" />
              </div>
              <span className="text-xs uppercase tracking-widest text-[#8b5e3c] font-semibold">
                {active.type}
              </span>
              <h3 className="mt-2 font-serif text-3xl leading-tight">{active.title}</h3>
              <p className="mt-4 text-[#5a4838] leading-relaxed">{active.description}</p>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#f5efe6] p-4">
                  <p className="text-xs uppercase tracking-widest text-[#8b5e3c] font-semibold">Role</p>
                  <p className="mt-1 text-sm text-[#2d2117]">{active.role}</p>
                </div>
                <div className="rounded-2xl bg-[#f5efe6] p-4">
                  <p className="text-xs uppercase tracking-widest text-[#8b5e3c] font-semibold">Tools</p>
                  <p className="mt-1 text-sm text-[#2d2117]">{active.tools}</p>
                </div>
              </div>
              <a
                href={active.link}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-[#faf5ec] hover:bg-[#6f472d] transition-colors"
              >
                View the project →
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills */}
      <section id="skills" className="relative px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="text-xs uppercase tracking-[0.2em] text-[#8b5e3c] font-semibold">
              Tools & Skills
            </span>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl leading-tight tracking-tight">
              What I use every day.
            </h2>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Development",
                icon: "◐",
                items: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Tailwind CSS", "Git", "GitHub"],
              },
              {
                title: "Research & Design",
                icon: "✦",
                items: ["User Interviews", "Affinity Diagramming", "Persona Development", "Usability Testing", "WCAG Accessibility", "Wireframing"],
              },
              {
                title: "AI Workflow",
                icon: "❋",
                items: ["GitHub Copilot", "Claude", "Lovable", "Spec-sprint-QA process"],
              },
            ].map((group, gi) => (
              <Reveal key={group.title} delay={gi * 0.12}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="rounded-[2rem] bg-[#faf5ec] border border-[#e3d3bf] p-7 h-full"
                >
                  <div className="flex items-center gap-3">
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ecdfd0] text-[#8b5e3c] text-lg"
                    >
                      {group.icon}
                    </motion.span>
                    <h3 className="font-serif text-xl">{group.title}</h3>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {group.items.map((item, ii) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: ii * 0.04, duration: 0.4 }}
                        whileHover={{ scale: 1.06, backgroundColor: "#d4a574" }}
                        className="rounded-full bg-[#f5efe6] border border-[#e3d3bf] px-3 py-1.5 text-xs text-[#2d2117] cursor-default"
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How I Work */}
      <section className="relative px-6 py-24 lg:px-8 lg:py-32 bg-[#efe6d8]">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="text-xs uppercase tracking-[0.2em] text-[#8b5e3c] font-semibold">
              Process
            </span>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl leading-tight tracking-tight">
              How I work.
            </h2>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                title: "Research before design",
                body: "I talk to real users before I sketch anything. Interviews, observation, and data come first.",
              },
              {
                n: "02",
                title: "Accessibility is not optional",
                body: "I design with WCAG guidelines from the start. Inclusion is a design decision, not a last-minute fix.",
              },
              {
                n: "03",
                title: "Ship what I find",
                body: "I code in HTML, CSS, and JavaScript. My research turns into real interfaces, not just slide decks.",
              },
            ].map((step, si) => (
              <Reveal key={step.n} delay={si * 0.12}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="rounded-[2rem] bg-[#faf5ec] border border-[#e3d3bf] p-7 h-full relative overflow-hidden"
                >
                  <motion.span
                    initial={{ opacity: 0.15 }}
                    whileHover={{ opacity: 0.3, scale: 1.1 }}
                    className="absolute -top-2 -right-2 font-serif text-7xl text-[#d4a574]"
                  >
                    {step.n}
                  </motion.span>
                  <p className="font-serif text-xl mt-2">{step.title}</p>
                  <p className="mt-3 text-sm text-[#5a4838] leading-relaxed">{step.body}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative px-6 py-24 lg:px-8 lg:py-32 bg-[#2d2117] text-[#faf5ec]">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-14">
          <Reveal>
            <span className="text-xs uppercase tracking-[0.2em] text-[#d4a574] font-semibold">
              Get in touch
            </span>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl leading-tight tracking-tight">
              Let's connect.
            </h2>
            <p className="mt-6 text-[#ecdfd0] leading-relaxed max-w-md">
              I am looking for internships and junior roles on product teams where
              research and accessibility drive decisions. If that sounds like your team,
              reach out.
            </p>

            <div className="mt-10 space-y-4">
              <a href="mailto:jjr66@njit.edu" className="flex items-center gap-3 group">
                <span className="h-10 w-10 rounded-full bg-[#faf5ec]/10 flex items-center justify-center group-hover:bg-[#d4a574] group-hover:text-[#2d2117] transition-colors">
                  ✉
                </span>
                <span className="text-lg group-hover:text-[#d4a574] transition-colors">
                  jjr66@njit.edu
                </span>
              </a>
              <a href="https://github.com/joycerhee" target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
                <span className="h-10 w-10 rounded-full bg-[#faf5ec]/10 flex items-center justify-center group-hover:bg-[#d4a574] group-hover:text-[#2d2117] transition-colors">
                  ◉
                </span>
                <span className="text-lg group-hover:text-[#d4a574] transition-colors">GitHub</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
                <span className="h-10 w-10 rounded-full bg-[#faf5ec]/10 flex items-center justify-center group-hover:bg-[#d4a574] group-hover:text-[#2d2117] transition-colors">
                  in
                </span>
                <span className="text-lg group-hover:text-[#d4a574] transition-colors">LinkedIn</span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.target as HTMLFormElement;
                const name = (f.elements.namedItem("name") as HTMLInputElement).value;
                const msg = (f.elements.namedItem("message") as HTMLTextAreaElement).value;
                window.location.href = `mailto:jjr66@njit.edu?subject=Portfolio message from ${name}&body=${msg}`;
              }}
              className="rounded-[2rem] bg-[#faf5ec] text-[#2d2117] p-8 space-y-5 shadow-2xl"
            >
              <label className="block">
                <span className="text-sm font-semibold">Name</span>
                <input
                  name="name"
                  required
                  className="mt-2 w-full rounded-2xl border border-[#d9c5b1] bg-[#f7efe4] px-4 py-3 outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Email</span>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-2xl border border-[#d9c5b1] bg-[#f7efe4] px-4 py-3 outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Message</span>
                <textarea
                  name="message"
                  rows={5}
                  required
                  className="mt-2 w-full rounded-2xl border border-[#d9c5b1] bg-[#f7efe4] px-4 py-3 outline-none focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/20"
                />
              </label>
              <MagneticButton
                type="submit"
                className="w-full rounded-full bg-[#8b5e3c] px-6 py-3.5 text-sm font-semibold text-[#faf5ec] hover:bg-[#6f472d] transition-colors"
              >
                Send message
              </MagneticButton>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e3d3bf] bg-[#f5efe6] px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#5a4838]">
          <div className="font-serif text-lg text-[#2d2117]">
            Joyce <span className="text-[#8b5e3c]">Rhee</span>
          </div>
          <div>© 2026 - Portfolio</div>
        </div>
      </footer>
    </main>
  );
}
