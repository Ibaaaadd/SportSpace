import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealSection } from "../components/shared/motion/Reveal";
import ScrollLink from "../components/shared/ScrollLink";
import ThemeToggle from "../components/shared/ThemeToggle";

const highlights = [
  {
    title: "Realtime slot",
    description: "Ketersediaan selalu update, tidak perlu refresh halaman.",
  },
  {
    title: "Lock 15 menit",
    description: "Slot aman saat checkout supaya tidak berebut.",
  },
  {
    title: "Multi-venue",
    description: "Kelola banyak lokasi dan banyak jenis olahraga.",
  },
];

const stats = [
  { label: "Lapangan aktif", value: "42" },
  { label: "Booking per hari", value: "1.2K" },
  { label: "Waktu konfirmasi", value: "< 2m" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink text-text-primary">
      <div className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(27,111,255,0.45),transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute -left-24 top-72 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(25,230,162,0.35),transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,184,255,0.4),transparent_70%)] blur-3xl" />

      <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6 md:px-12">
        <div className="flex items-center gap-3">
          <Image src="/img/logo.png" alt="Sport Space logo" width={44} height={44} />
          <div className="leading-tight">
            <p className="text-lg font-semibold tracking-tight">Sport Space</p>
            <p className="text-xs text-text-muted">Smart booking arena</p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-text-muted md:flex">
          <ScrollLink href="#features" className="hover:text-text-primary">
            Features
          </ScrollLink>
          <ScrollLink href="#venues" className="hover:text-text-primary">
            Venues
          </ScrollLink>
          <ScrollLink href="#pricing" className="hover:text-text-primary">
            Pricing
          </ScrollLink>
        </nav>
        <div className="flex flex-nowrap items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-primary transition hover:border-primary sm:hidden"
            aria-label="Operator Login"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M16.5 20.5a4.5 4.5 0 0 0-9 0" />
              <circle cx="12" cy="9" r="4" />
            </svg>
          </button>
          <button className="hidden rounded-full border border-border px-4 py-2 text-sm text-text-primary transition hover:border-primary sm:inline-flex">
            Operator Login
          </button>
          <button className="hidden rounded-full bg-gradient-to-r from-primary via-secondary to-accent px-5 py-2 text-sm font-semibold text-ink shadow-[0_0_24px_rgba(25,230,162,0.35)] transition hover:brightness-110 sm:inline-flex">
            Book Now
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 md:gap-16 md:px-12">
        <section className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-12">
          <Reveal className="flex flex-col gap-6" y={28}>
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-text-muted">
              Next-gen sport booking
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              Booking lapangan jadi cepat, rapi, dan realtime.
            </h1>
            <p className="text-sm leading-relaxed text-text-muted sm:text-base md:text-lg">
              Sport Space membantu venue olahraga mengelola jadwal, harga, dan
              pembayaran dalam satu sistem. Customer bisa pilih slot, bayar, dan
              dapat konfirmasi tanpa drama.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="w-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent px-6 py-3 text-sm font-semibold text-ink shadow-[0_0_24px_rgba(0,184,255,0.35)] transition hover:brightness-110 sm:w-auto">
                Explore Venues
              </button>
              <button className="w-full rounded-full border border-border px-6 py-3 text-sm text-text-primary transition hover:border-secondary sm:w-auto">
                See Live Pricing
              </button>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-text-muted sm:gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-lg font-semibold text-text-primary">
                    {stat.value}
                  </span>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal
            className="rounded-3xl border border-border bg-surface/80 p-5 shadow-[0_0_40px_rgba(0,0,0,0.35)] sm:p-6"
            delay={0.1}
            y={32}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Live availability</p>
                <p className="text-xl font-semibold">Padel Arena A</p>
              </div>
              <span className="rounded-full bg-accent/20 px-3 py-1 text-xs text-accent">
                8 slots open
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs sm:mt-6 sm:grid-cols-3">
              {[
                "06:00",
                "07:00",
                "08:00",
                "09:00",
                "10:00",
                "11:00",
              ].map((time) => (
                <div
                  key={time}
                  className="flex items-center justify-center rounded-xl border border-border bg-ink-2 px-3 py-4 text-text-primary"
                >
                  {time}
                </div>
              ))}
              <div className="col-span-2 rounded-2xl border border-border bg-gradient-to-r from-primary/15 via-secondary/15 to-accent/15 px-4 py-3 sm:col-span-3">
                <p className="text-sm text-text-primary">
                  Auto lock selama 15 menit saat checkout.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="features" className="grid gap-5 sm:gap-6 md:grid-cols-3">
          {highlights.map((item, index) => (
            <Reveal
              key={item.title}
              className="rounded-2xl border border-border bg-surface/70 p-6 text-sm shadow-[0_0_20px_rgba(0,0,0,0.25)]"
              delay={index * 0.08}
            >
              <h3 className="text-lg font-semibold text-text-primary">
                {item.title}
              </h3>
              <p className="mt-3 text-text-muted">{item.description}</p>
            </Reveal>
          ))}
        </section>

        <section id="venues" className="grid gap-6 md:grid-cols-[0.7fr_1.3fr]">
          <Reveal className="rounded-3xl border border-border bg-ink-2 p-6">
            <p className="text-sm text-text-muted">Multi-sport ready</p>
            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
              Padel, futsal, mini soccer, hingga tennis indoor.
            </h2>
            <p className="mt-4 text-sm text-text-muted">
              Semua venue dalam satu dashboard, lengkap dengan pricing rules dan
              promo per jam.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {["Padel", "Futsal", "Mini Soccer"].map((sport, index) => (
              <Reveal
                key={sport}
                className="rounded-2xl border border-border bg-surface/80 p-5 text-sm"
                delay={index * 0.08}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                  {sport}
                </p>
                <p className="mt-4 text-lg font-semibold">4 venue aktif</p>
                <p className="mt-2 text-text-muted">Harga fleksibel per jam.</p>
              </Reveal>
            ))}
          </div>
        </section>

        <RevealSection
          id="pricing"
          className="rounded-3xl border border-border bg-gradient-to-r from-ink-2 via-surface to-ink-2 p-6 sm:p-8"
        >
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-text-muted">Pricing rules</p>
              <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                Atur harga otomatis berdasarkan hari dan jam.
              </h2>
            </div>
            <button className="w-full rounded-full border border-border px-6 py-3 text-sm text-text-primary transition hover:border-secondary sm:w-auto">
              Preview Rules
            </button>
          </div>
        </RevealSection>
      </main>
    </div>
  );
}
