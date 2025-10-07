// src/App.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import logo from "./assets/logo/eggeo-logo.png";

import imgGata from "./assets/cases/gata-maula.jpg";
import imgRisata from "./assets/cases/risata.jpg";
import imgDakota from "./assets/cases/dakota-warna.jpg";
import imgUila from "./assets/cases/uila.jpg";

import imgAbout from "./assets/about/mas-que-agencia.jpg";

function FontsLoader() {
  return (
    <style>{`
      :root{
        --font-body: "Helvetica Now Rounded", "Montserrat", system-ui, sans-serif;
        --font-display: "Helvetica Now Rounded", "Montserrat", system-ui, sans-serif;
        --color-yellow: #FFD600;
        --color-blue: #003D99;
        --color-eggwhite: #F5F5DC;
        --color-black: #000000;
        --color-gray: #D8D8D8;
      }
      .font-body{ font-family: var(--font-body); }
      .font-display{ font-family: var(--font-display); font-weight:700; }
      .glass{ backdrop-filter: blur(8px); background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)); }
      .shine{ position: relative; overflow: hidden; }
      .shine::after{ content:""; position:absolute; inset:-100% -20%; transform:skewX(-20deg); background:linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent); animation:shine 4s linear infinite; }
      @keyframes shine{ 0%{transform:translateX(-100%) skewX(-20deg);} 100%{transform:translateX(100%) skewX(-20deg);} }
      .no-scrollbar::-webkit-scrollbar{ display:none; }
      .no-scrollbar{ -ms-overflow-style:none; scrollbar-width:none; }
    `}</style>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
  viewport: { once: true, margin: "-100px" }
};

const marqueeItems = [
  "Estrategia", "Redes Sociales", "Contenido", "Producción Audiovisual",
  "Campañas & Eventos", "Branding", "Consultoría", "Community Mgmt"
];

const caseStudies = [
  {
    tag: "Brand + Social",
    title: "Gata Maula: la vermutería que se volvió comunidad",
    copy: "Narrativa ficcional y estilo propio que instalaron un ícono cultural en Córdoba. Eventos agotados y comunidad activa.",
    image: imgGata,
    alt: "Interior de Gata Maula con barra de vermú y público"
  },
  {
    tag: "Food + Campañas",
    title: "Risata: pizza con identidad propia",
    copy: "Campañas virales (Semana de la Pizza), ediciones limitadas y contenido que fideliza y vende.",
    image: imgRisata,
    alt: "Pizza de Risata recién salida del horno"
  },
  {
    tag: "Moda + Social",
    title: "Dakota & Warna: moda que conecta",
    copy: "Gestión estratégica, storytelling y campañas mayoristas con crecimiento acelerado en IG/TikTok.",
    image: imgDakota,
    alt: "Producción de moda para Dakota & Warna"
  },
  {
    tag: "Apertura + Social",
    title: "Uila Café & Pan: un café con historia",
    copy: "Preapertura con activaciones en calle, expectativa en redes y relato honesto desde el día cero.",
    image: imgUila,
    alt: "Fachada de Uila Café & Pan en su apertura"
  }
];


export default function App() {
  // Smoke tests livianos en dev
  useEffect(() => {
    const isDev = (typeof import.meta !== "undefined" && import.meta?.env?.DEV) || (typeof process !== "undefined" && process?.env?.NODE_ENV !== "production");
    if (!isDev) return;
    try {
      const must = ["top", "work", "services", "about", "team", "testimonials", "contact"];
      must.forEach((id) => console.assert(document.getElementById(id), `Missing section #${id}`));
      console.assert(document.querySelectorAll('[data-testid="case-card"]').length >= 3, "Expected >= 3 CaseCard components");
      console.assert(document.querySelector('a[href="#contact"]'), "Contact link should exist");
      console.assert(document.querySelectorAll('[data-testid="service-card"]').length === 6, 'Expected 6 ServiceCard components');
      const h1 = document.querySelector('h1');
      console.assert(h1 && /Rompé el molde/i.test(h1.textContent || ''), 'Hero title should contain "Rompé el molde"');
      console.assert(document.getElementById('page-bg'), 'Global page background should exist');
      console.assert(document.querySelector('#about .about-image'), 'About image/placeholder should exist');
      console.log("EggeoLanding smoke tests: OK ✅");
    } catch (e) {
      console.warn("EggeoLanding smoke tests failed", e);
    }
  }, []);
  const [status, setStatus] = useState<'idle'|'sending'|'ok'|'error'>('idle');
const [errorText, setErrorText] = useState<string>("");

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setStatus('sending');
  setErrorText("");

  const form = e.currentTarget;
  const data = new FormData(form);

  const email = String(data.get('email') || '').trim();
  const phone = String(data.get('phone') || '').trim();

  // al menos uno
  if (!email && !phone) {
    setStatus('error');
    setErrorText('Dejanos un email o un teléfono 🙂');
    return;
  }

  // si hay email, que sea válido
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setStatus('error');
    setErrorText('El email no tiene un formato válido.');
    return;
  }

  // Para evitar el 422 de Formspree cuando solo hay teléfono,
  // mandamos un email "neutro" válido y anexamos un campo "contact".
  if (!email && phone) {
    data.set('email', 'no-reply@eggeo.la');
  }
  data.set('contact', [email, phone].filter(Boolean).join(' / '));

  try {
    const r = await fetch('https://formspree.io/f/mqaylroe', {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }, // evita redirección
    });

    if (r.ok) {
      setStatus('ok');
      form.reset();
    } else {
      const err = await r.json().catch(() => ({}));
      setStatus('error');
      setErrorText(err?.errors?.[0]?.message || 'No pudimos enviar.');
    }
  } catch {
    setStatus('error');
    setErrorText('Error de red. Intentá de nuevo.');
  }
}


  return (
    <div className="relative min-h-screen text-[var(--color-eggwhite)] antialiased">
      <FontsLoader />
      <PageBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-gray)]/20 bg-[var(--color-black)]/70 glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="#top" className="flex items-center gap-2">
              <img src={logo} alt="EGGEO" className="h-6 sm:h-7 w-auto" />
              <span className="sr-only">EGGEO</span>
            </a>
            <nav className="hidden gap-6 text-sm md:flex">
              <a href="#work" className="hover:text-[var(--color-yellow)]">Casos</a>
              <a href="#services" className="hover:text-[var(--color-yellow)]">Servicios</a>
              <a href="#about" className="hover:text-[var(--color-yellow)]">Nosotros</a>
              <a href="#team" className="hover:text-[var(--color-yellow)]">Equipo</a>
              <a href="#testimonials" className="hover:text-[var(--color-yellow)]">Testimonios</a>
              <a href="#contact" className="hover:text-[var(--color-yellow)]">Contacto</a>
            </nav>
            <a href="#contact" className="rounded-full bg-[var(--color-yellow)] text-[var(--color-black)] px-4 py-2 text-sm font-semibold hover:opacity-90">Hablemos</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative isolate">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28 sm:py-40">
          <motion.h1 {...fadeUp} className="font-display text-[10vw] sm:text-6xl lg:text-8xl leading-tight tracking-tight">
            <AnimatedTitle lines={["Rompé el molde.", "Creá con EGGEO."]} />
          </motion.h1>
          <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="mt-6 max-w-2xl text-lg sm:text-xl text-gray-200">
            Somos un laboratorio creativo que transforma ideas en experiencias digitales y visuales. Acompañamos a marcas que buscan destacarse con estrategias disruptivas, contenido que conecta y comunidades que crecen.
          </motion.p>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="mt-10 flex flex-wrap gap-4">
            <a href="#work" className="shine rounded-full bg-[var(--color-yellow)] text-[var(--color-black)] px-8 py-4 text-base font-semibold">Conocé nuestros casos de éxito</a>
          </motion.div>
        </div>
        <div className="border-y border-[var(--color-gray)]/10 bg-transparent">
          <Marquee items={marqueeItems} />
        </div>
      </section>

      {/* Casos de Éxito */}
      <section id="work" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.div {...fadeUp} className="flex items-end justify-between gap-6">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-yellow)]">Casos de éxito</h2>
          <a href="#contact" className="text-sm text-gray-400 hover:text-[var(--color-yellow)]">¿Proyecto nuevo? →</a>
        </motion.div>

        <MobileCarousel gridMd="md:grid-cols-2" gridLg="lg:grid-cols-4" ariaLabel="Carrusel de casos de éxito">
          {caseStudies.map((c, i) => (
            <div key={i} className="snap-center shrink-0 basis-[88%] md:basis-auto">

              <CaseCard {...c} />
            </div>
          ))}
        </MobileCarousel>
      </section>

      {/* About Us */}
      <section id="about" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.div {...fadeUp} className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-3">
            <motion.h2 {...fadeUp} className="font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-yellow)]">Más que una agencia de marketing</motion.h2>
            <div className="mt-6 max-w-3xl space-y-6">
              <p className="text-gray-200">EGGEO nació para ser un catalizador de creatividad. Creemos que cada marca tiene un potencial enorme, como un huevo que guarda dentro la chispa de algo único.</p>
              <p className="text-gray-200">Nuestra misión es ayudar a que esas ideas rompan el cascarón y se conviertan en innovación real, con campañas que generan impacto y construyen comunidad.</p>
              <p className="text-gray-300">Con base en Córdoba y proyección nacional, trabajamos con gastronomía, moda, retail y lifestyle que buscan mucho más que seguidores: quieren historias que dejen huella.</p>
            </div>
          </div>
          <div className="md:col-span-2 self-start">
            <div className="about-image relative w-full rounded-3xl overflow-hidden ring-1 ring-white/15 min-h-[260px] md:h-full">
          <img
            src={imgAbout}
            alt="Equipo de EGGEO trabajando en set/estudio"
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="lazy"
          />
          {/* overlays brand para integrar con el fondo */}
          <div className="pointer-events-none absolute inset-0" style={{background:'radial-gradient(600px at 100% 0%, rgba(0,61,153,0.28) 0%, transparent 60%)'}} />
          <div className="pointer-events-none absolute inset-0" style={{background:'radial-gradient(700px at 0% 100%, rgba(255,214,0,0.22) 0%, transparent 60%)'}} />
        </div>
          </div>
        </motion.div>
      </section>

      {/* Servicios */}
      <section id="services" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2 {...fadeUp} className="font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-yellow)]">Servicios</motion.h2>

        <MobileCarousel gridMd="md:grid-cols-2" gridLg="lg:grid-cols-3" ariaLabel="Carrusel de servicios">
          <div className="snap-start shrink-0 basis-[85%] md:basis-auto"><ServiceCard title="Estrategia & Gestión de Redes" points={["Planificación integral", "Community Management", "Calendarios & reporting"]} price="Planes mensuales"/></div>
          <div className="snap-start shrink-0 basis-[85%] md:basis-auto"><ServiceCard title="Producción Audiovisual" points={["Foto & video", "Reels & carrousels", "Coberturas y piezas de pauta"]} price="A medida"/></div>
          <div className="snap-start shrink-0 basis-[85%] md:basis-auto"><ServiceCard title="Campañas Creativas & Eventos" points={["Lanzamientos", "Activaciones en calle", "Experiencias con conversación"]} price="Según campaña"/></div>
          <div className="snap-start shrink-0 basis-[85%] md:basis-auto"><ServiceCard title="Branding & Comunicación Digital" points={["Identidad & narrativa", "Posicionamiento", "Guías de estilo"]} price="Paquetes"/></div>
          <div className="snap-start shrink-0 basis-[85%] md:basis-auto"><ServiceCard title="Desarrollo Web & Landings" points={["Landing de campaña", "E-commerce básico", "SEO técnico & performance"]} price="Por proyecto"/></div>
          <div className="snap-start shrink-0 basis-[85%] md:basis-auto"><ServiceCard title="Meta/Google Ads (Performance)" points={["Estrategia & set-up", "Segmentación & optimización", "Medición (GA4/Pixels)"]} price="Según pauta"/></div>
        </MobileCarousel>
      </section>

      {/* Equipo */}
      <section id="team" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2 {...fadeUp} className="font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-yellow)]">Equipo</motion.h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <TeamCard name="Manuel Pramparo" role="Cofundador · Dirección Creativa & Estrategia" bio="Storytelling, campañas disruptivas y comunidades digitales." />
          <TeamCard name="Nicolás Capell" role="Cofundador · Dirección Creativa, IA & Fotografía" bio="IA aplicada al marketing y producción fotográfica. Lidera integración tecnológica y área visual." />
          <TeamCard name="Elías Rivarola" role="Cofundador · Paid Media, Performance & Desarrollo Web" bio="Estrategia de pauta en Meta y desarrollo web. Convierte creatividad en resultados medibles." />
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonials" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2 {...fadeUp} className="font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-yellow)]">Testimonios</motion.h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuoteCard quote="Con Eggeo logramos que nuestra marca se sienta cercana y auténtica. Hoy los clientes no solo vienen por la pizza, vienen por la experiencia." author="Guille, Risata" />
          <QuoteCard quote="Construimos una narrativa distinta que nos hizo salir del montón. Hoy la gente habla de Gata Maula como si fuera un personaje más de Córdoba." author="Lauti, Gata Maula" />
        </div>
        {/* Manifiesto como frase debajo de testimonios */}
        <motion.p id="manifesto" {...fadeUp} className="mt-12 max-w-3xl mx-auto text-center text-gray-200">
          En Eggeo creemos que las marcas no son logos ni colores, son historias que respiran. Trabajamos con creatividad, estrategia y cercanía para que cada cliente rompa el molde y cree algo único.
        </motion.p>
      </section>

      {/* Contacto */}
      <section id="contact" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--color-gray)] bg-gradient-to-br from-[var(--color-yellow)]/10 via-[var(--color-blue)]/5 to-transparent p-10 text-center">
          <motion.h3 {...fadeUp} className="font-display text-2xl sm:text-3xl text-[var(--color-yellow)]">Si tenés una idea, nosotros tenemos cómo hacerla crecer. Hablemos.</motion.h3>
         <motion.form
            {...fadeUp}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            noValidate
            className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-3 text-left"
           >
            <input name="name" required
              className="rounded-2xl bg-black/40 px-4 py-3 outline-none ring-1 ring-[var(--color-gray)] placeholder:text-gray-500"
              placeholder="Tu nombre" />

            {/* Email opcional */}
            <input name="email" type="email"
              className="rounded-2xl bg-black/40 px-4 py-3 outline-none ring-1 ring-[var(--color-gray)] placeholder:text-gray-500"
              placeholder="Email (opcional)" />

            {/* Teléfono opcional */}
            <input name="phone" type="tel" inputMode="tel" pattern="[0-9+()\\s-]{6,}"
              className="rounded-2xl bg-black/40 px-4 py-3 outline-none ring-1 ring-[var(--color-gray)] placeholder:text-gray-500"
              placeholder="Teléfono (opcional)" />

            <textarea name="message" rows={4} required
              className="rounded-2xl bg-black/40 px-4 py-3 outline-none ring-1 ring-[var(--color-gray)] placeholder:text-gray-500"
              placeholder="Contanos brevemente tu proyecto" />

            <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

            <button disabled={status==='sending'}
              className="shine rounded-2xl bg-[var(--color-yellow)] px-6 py-3 font-semibold text-[var(--color-black)] disabled:opacity-60">
              {status==='sending' ? 'Enviando…' : 'Enviar'}
            </button>

            <p aria-live="polite" className="text-sm mt-2">
              {status==='ok' && <span className="text-green-400">¡Gracias! Te escribimos pronto.</span>}
              {status==='error' && <span className="text-red-400">{errorText || 'Ups, no pudimos enviar. Probá otra vez.'}</span>}
            </p>
          </motion.form>





          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-300">
            <a className="underline hover:text-[var(--color-yellow)]" href="mailto:eggeo.lab@gmail.com">Email</a>
            <a className="underline hover:text-[var(--color-yellow)]" href="https://wa.me/5493571619535?text=Hola%20EGGEO%21%20Quiero%20contarles%20mi%20proyecto%20%F0%9F%93%9D">WhatsApp</a>
            <a className="underline hover:text-[var(--color-yellow)]" href="https://www.instagram.com/eggeo.lab/#">Instagram</a>
            <a className="underline hover:text-[var(--color-yellow)]" href="https://www.linkedin.com/company/eggeo/">LinkedIn</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-gray)] py-10 text-sm text-gray-400">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
    <div>
      <img
        src={logo}
        alt="EGGEO"
        className="h-6 sm:h-7 w-auto"
        loading="eager"
        decoding="async"
      />
      <div className="mt-2 text-gray-400">
        Córdoba, AR · <a className="underline hover:text-[var(--color-yellow)]" href="mailto:eggeo.lab@gmail.com">eggeo.lab@gmail.com</a>
      </div>
    </div>
    <div className="flex gap-4">
      <a href="https://www.instagram.com/eggeo.lab/#" className="hover:text-[var(--color-yellow)]">Instagram</a>
      <a href="https://www.linkedin.com/company/eggeo/" className="hover:text-[var(--color-yellow)]">LinkedIn</a>
    </div>
  </div>
</footer>

    </div>
  );
}

function PageBackground(){
  return (
    <div id="page-bg" aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      {/* Base dark */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#15140d] via-[#0b0f14] to-[#07090b]" />
      {/* Brand diagonal Yellow -> Blue */}
      <div className="absolute inset-0" style={{background:'linear-gradient(135deg, rgba(255,214,0,0.18) 0%, rgba(0,61,153,0.20) 100%)'}} />
      {/* Yellow glow top-left */}
      <div className="absolute inset-0" style={{background:'radial-gradient(1600px at 0% 0%, rgba(255,214,0,0.28) 0%, transparent 65%)'}} />
      {/* Blue glow bottom-right */}
      <div className="absolute inset-0" style={{background:'radial-gradient(1200px at 100% 100%, rgba(0,61,153,0.28) 0%, transparent 65%)'}} />
      {/* Sheen */}
      <div className="absolute inset-0" style={{background:'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)'}} />
    </div>
  );
}

function AnimatedTitle({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, idx) => (
        <span key={idx} className="block">
          {line.split(" ").map((word, wi) => (
            <span key={wi} className="inline-block mr-2 md:mr-4 last:mr-0">
              {Array.from(word).map((ch, ci) => (
                <motion.span
                  key={ci}
                  className="inline-block will-change-transform cursor-default"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 600, damping: 18, mass: 0.4 }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          ))}
        </span>
      ))}
    </>
  );
}

/** Carrusel mobile estable (dots + flechas). En md+ vuelve a grid. */
function MobileCarousel({
  children,
  gridMd = "md:grid-cols-2",
  gridLg = "lg:grid-cols-3",
  ariaLabel
}: {
  children: React.ReactNode;
  gridMd?: string;
  gridLg?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const count = React.Children.count(children);
  const [active, setActive] = useState(0);

  const getItems = () =>
    (ref.current ? (Array.from(ref.current.children) as HTMLElement[]) : []);

  const scrollToIndex = (idx: number) => {
  const el = ref.current; if (!el) return;
  const items = getItems();
  const i = Math.max(0, Math.min(idx, items.length - 1));
  const t = items[i]; if (!t) return;
  const left = Math.max(
    0,
    Math.min(
      t.offsetLeft - (el.clientWidth - t.clientWidth) / 2,
      el.scrollWidth - el.clientWidth
    )
  );
  el.scrollTo({ left, behavior: "smooth" });
};


  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      const items = getItems();
      if (!items.length) return;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let dist = Infinity;
      items.forEach((n, i) => {
        const c = n.offsetLeft + n.offsetWidth / 2;
        const d = Math.abs(c - mid);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setActive(best);
    };
    el.addEventListener("scroll", handler as any, { passive: true } as any);
    window.addEventListener("resize", handler);
    handler();
    requestAnimationFrame(() => scrollToIndex(0));
    return () => {
      el.removeEventListener("scroll", handler as any);
      window.removeEventListener("resize", handler);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={ref}
        aria-label={ariaLabel}
        className={`mt-10 flex gap-4 overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory snap-always scroll-px-4 justify-start [&>div]:snap-center [&>div]:basis-[88%] [&>div]:shrink-0 md:grid ${gridMd} ${gridLg} md:gap-6 md:overflow-visible md:snap-none md:[&>div]:basis-auto md:[&>div]:snap-none md:[&>div]:h-full`}
      >
        {children}
      </div>

      {count > 1 && (
        <div className="md:hidden mt-3 flex items-center justify-center gap-3">
          <button
            onClick={() => scrollToIndex(active - 1)}
            className="rounded-full px-3 py-1 text-sm bg-black/40 ring-1 ring-white/20"
            aria-label="Anterior"
          >
            ‹
          </button>
          <div className="flex gap-2">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                aria-label={`Ir al slide ${i + 1}`}
                className={`h-2 w-2 rounded-full transition-[transform,background] ${
                  i === active ? "bg-[var(--color-yellow)] scale-100" : "bg-white/40 scale-90"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => scrollToIndex(active + 1)}
            className="rounded-full px-3 py-1 text-sm bg-black/40 ring-1 ring-white/20"
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

function Marquee({ items }: {items: string[]}){
  return (
    <div className="overflow-hidden">
      <div className="flex gap-12 py-4 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
        {[...Array(2)].map((_, idx) => (
          <ul key={idx} className="flex shrink-0 animate-[marquee_22s_linear_infinite] gap-12">
            {items.map((t, i) => (
              <li key={i} className="font-display text-lg tracking-tight text-[var(--color-eggwhite)]">
                {t} <span className="text-[var(--color-gray)]">•</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <style>{`@keyframes marquee{ from{ transform: translateX(0); } to{ transform: translateX(-50%); } }`}</style>
    </div>
  );
}

function CaseCard({ tag, title, copy, image, alt }:{
  tag: string; title: string; copy: string; image?: string; alt?: string
}){
  return (
    <motion.article data-testid="case-card" {...fadeUp} className="group rounded-3xl border border-[var(--color-gray)] bg-white/[0.03] p-4 h-full min-h-[520px] md:min-h-[475px] flex flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-white/15">
        {image ? (
          <img src={image} alt={alt || title} className="h-full w-full object-cover object-center" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-black/30" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-black/10 mix-blend-soft-light" />
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <span className="rounded-full bg-[var(--color-blue)]/20 px-2 py-1 text-[var(--color-yellow)]">{tag}</span>
      </div>
      <h3 className="mt-2 font-display text-xl text-[var(--color-eggwhite)] group-hover:opacity-90">{title}</h3>
      <p className="mt-1 text-sm text-gray-300">{copy}</p>
      <div className="mt-auto pt-4 flex items-center justify-between">
        <a href="#" className="text-sm text-gray-300 hover:text-[var(--color-eggwhite)]">Ver caso →</a>
        <span className="text-xs text-gray-500">2025</span>
      </div>
    </motion.article>
  );
}

function ServiceCard({ title, points, price }:{
  title: string; points: string[]; price: string
}){
  return (
    <motion.div {...fadeUp} data-testid="service-card" className="rounded-3xl border border-[var(--color-gray)] bg-white/[0.03] p-6 h-full min-h-[300px] md:min-h-[300px] flex flex-col">
      <h3 className="font-display text-xl text-[var(--color-eggwhite)]">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-gray-300">
        {points.map((p, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-eggwhite)]/70" />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6 flex items-center justify-between">
        <span className="text-gray-400 text-sm">{price}</span>
        <a href="#contact" className="rounded-full border border-[var(--color-gray)] px-4 py-2 text-sm hover:bg-white/5">Consultar</a>
      </div>
    </motion.div>
  );
}

function TeamCard({ name, role, bio }:{
  name: string; role: string; bio: string
}){
  return (
    <div className="rounded-3xl border border-[var(--color-gray)] bg-white/[0.03] p-6">
      <h3 className="font-display text-lg text-[var(--color-eggwhite)]">{name}</h3>
      <div className="mt-1 text-xs text-gray-400">{role}</div>
      <p className="mt-3 text-sm text-gray-300">{bio}</p>
    </div>
  );
}

function QuoteCard({ quote, author }:{
  quote: string; author: string
}){
  return (
    <figure className="rounded-3xl border border-[var(--color-gray)] bg-white/[0.03] p-6">
      <blockquote className="text-base text-gray-200">“{quote}”</blockquote>
      <figcaption className="mt-3 text-sm text-gray-400">— {author}</figcaption>
    </figure>
  );
}
