import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import ServiceCard from "../components/workers/ServiceCard";
import { services } from "../data/services";

const steps = [
  {
    number: "01",
    title: "Describe the work",
    text: "Search for a service or post a clear job request with your Enugu location.",
  },
  {
    number: "02",
    title: "Compare your options",
    text: "Review professional profiles, work details, availability and feedback before deciding.",
  },
  {
    number: "03",
    title: "Connect and get it done",
    text: "Use Ndi-Olu to keep the conversation clear, then review the completed work.",
  },
];

const trustPillars = [
  {
    title: "Location-aware discovery",
    text: "Find professionals based on the service you need and the Enugu area where you need it.",
    Icon: MapPin,
  },
  {
    title: "Profiles built for decisions",
    text: "See trade experience, service details, work samples and feedback in one clear profile.",
    Icon: ShieldCheck,
  },
  {
    title: "Clearer conversations",
    text: "Keep job discussions, expectations and follow-up communication in one place.",
    Icon: MessageCircle,
  },
];

function Home() {
  return (
    <main id="top" className="min-h-screen bg-ndi-sand text-ndi-ink">
      <Navbar />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-28 lg:pt-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-ndi-forest">
            <span className="h-2 w-2 rounded-full bg-ndi-orange" />
            BUILT FOR ENUGU STATE
          </div>

          <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-[-0.065em] text-ndi-ink sm:text-6xl lg:text-7xl">
            Find skilled professionals for the work that{" "}
            <span className="text-ndi-green">matters.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
            Ndi-Olu helps residents and businesses discover capable local
            professionals for their homes, projects and everyday needs.
          </p>

          <form
            action="/find-workers"
            method="get"
            className="mt-9 max-w-2xl rounded-ndi-card border border-slate-200 bg-white p-3 shadow-ndi-card"
          >
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <label className="rounded-xl border border-slate-200 px-4 py-3 transition focus-within:border-ndi-forest focus-within:ring-2 focus-within:ring-emerald-100">
                <span className="mb-1 block text-[11px] font-bold tracking-[0.13em] text-slate-500">
                  SERVICE
                </span>

                <select
                  name="service"
                  required
                  defaultValue=""
                  className="w-full appearance-none bg-transparent text-sm font-semibold text-slate-800 outline-none"
                >
                  <option value="" disabled>
                    What do you need?
                  </option>

                  {services.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-xl border border-slate-200 px-4 py-3 transition focus-within:border-ndi-forest focus-within:ring-2 focus-within:ring-emerald-100">
                <span className="mb-1 block text-[11px] font-bold tracking-[0.13em] text-slate-500">
                  LOCATION
                </span>

                <select
                  name="location"
                  defaultValue="enugu-metropolis"
                  className="w-full appearance-none bg-transparent text-sm font-semibold text-slate-800 outline-none"
                >
                  <option value="enugu-metropolis">Enugu metropolis</option>
                  <option value="independence-layout">Independence Layout</option>
                  <option value="new-haven">New Haven</option>
                  <option value="gra">GRA</option>
                  <option value="uwani">Uwani</option>
                  <option value="ogui">Ogui</option>
                </select>
              </label>

              <Button type="submit" variant="accent" className="min-h-[52px]">
                Find help
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={17} className="text-ndi-green" />
              Search by service and area
            </span>

            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={17} className="text-ndi-green" />
              Compare clear professional profiles
            </span>

            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={17} className="text-ndi-green" />
              Keep job conversations in one place
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/post-job" variant="primary">
              Post a job
              <ArrowRight size={17} className="ml-2" />
            </Button>

            <Button href="/signup?role=worker" variant="secondary">
              Join as a worker
            </Button>
          </div>
        </div>

        <aside
          aria-label="Ndi-Olu job request preview"
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="absolute -left-8 top-12 h-40 w-40 rounded-full bg-ndi-gold/30 blur-3xl" />
          <div className="absolute -right-6 bottom-8 h-44 w-44 rounded-full bg-emerald-300/40 blur-3xl" />

          <div className="relative overflow-hidden rounded-ndi-panel bg-ndi-forest p-6 shadow-ndi-panel sm:p-8">
            <div className="flex items-center justify-between border-b border-white/15 pb-5">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-emerald-200">
                  NDI-OLU
                </p>
                <p className="mt-1 text-lg font-bold text-white">
                  A clearer way to hire
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-full bg-ndi-orange text-white">
                <Sparkles size={20} aria-hidden="true" />
              </div>
            </div>

            <div className="mt-6 rounded-ndi-card bg-white p-5 text-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-ndi-forest">
                    <Zap size={21} aria-hidden="true" />
                  </div>

                  <div>
                    <p className="font-bold">Electrician needed</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={14} aria-hidden="true" />
                      New Haven, Enugu
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#C5512E]">
                  Open
                </span>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                Help needed to inspect and repair an electrical connection at home.
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-medium text-slate-500">
                  Job request preview
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-ndi-forest">
                  View details <ArrowRight size={15} aria-hidden="true" />
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-ndi-card border border-white/15 bg-white/10 p-4 text-white">
                <p className="text-lg font-extrabold">Enugu first</p>
                <p className="mt-1 text-xs leading-5 text-emerald-100">
                  Designed around local services, locations and communities.
                </p>
              </div>

              <div className="rounded-ndi-card border border-white/15 bg-white/10 p-4 text-white">
                <p className="text-lg font-extrabold">Built for clarity</p>
                <p className="mt-1 text-xs leading-5 text-emerald-100">
                  Better job details, clearer profiles and better decisions.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section id="services" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold tracking-[0.18em] text-ndi-orange">
                EXPLORE SERVICES
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-ndi-ink">
                Start with the skill you need.
              </h2>
            </div>

            <a
              href="/find-workers"
              className="inline-flex w-fit items-center gap-2 text-sm font-bold text-ndi-forest transition hover:text-ndi-orange"
            >
              See all services <ArrowRight size={16} />
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-ndi-orange">
              BUILT FOR TRUST
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-ndi-ink">
              Trust should be visible, not assumed.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-slate-600">
              Ndi-Olu is being built to make it easier to choose skilled people
              with confidence before inviting anyone into your home or business.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {trustPillars.map(({ title, text, Icon }) => (
              <article
                key={title}
                className="rounded-ndi-card border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-ndi-forest">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-bold text-ndi-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-[0.18em] text-ndi-orange">
              HOW NDI-OLU WORKS
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-ndi-ink">
              A better way to get work done.
            </h2>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step) => (
              <article key={step.number} className="border-t-2 border-ndi-forest pt-5">
                <p className="text-sm font-extrabold tracking-[0.16em] text-ndi-orange">
                  {step.number}
                </p>
                <h3 className="mt-5 text-xl font-bold text-ndi-ink">{step.title}</h3>
                <p className="mt-3 max-w-sm leading-7 text-slate-600">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="for-workers" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="overflow-hidden rounded-ndi-panel bg-ndi-gold px-7 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-[0.18em] text-[#694114]">
              FOR SKILLED PROFESSIONALS
            </p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-[-0.05em] text-ndi-ink">
              Your skill deserves to be seen.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
              Build a professional profile, show your work, and connect with
              people in Enugu looking for your service.
            </p>
          </div>

          <Button
            href="/signup?role=worker"
            size="lg"
            className="mt-8 bg-ndi-ink text-white hover:bg-black lg:mt-0"
          >
            Create your worker profile
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default Home;