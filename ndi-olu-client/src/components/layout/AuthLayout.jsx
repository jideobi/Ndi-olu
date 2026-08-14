import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function AuthLayout({ children, title, description }) {
  return (
    <main className="min-h-screen bg-ndi-sand text-ndi-ink lg:grid lg:grid-cols-2">
      <section className="hidden bg-ndi-forest px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link
          to="/"
          className="text-3xl font-extrabold tracking-[-0.06em] text-white"
        >
          Ndi<span className="text-ndi-orange">-</span>Olu
        </Link>

        <div className="max-w-lg">
          <p className="text-sm font-bold tracking-[0.18em] text-emerald-200">
            ENUGU STATE, NIGERIA
          </p>

          <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] tracking-[-0.06em]">
            Better connections create better work.
          </h1>

          <p className="mt-6 text-lg leading-8 text-emerald-100">
            Ndi-Olu is built to help clients find skilled professionals and help
            professionals grow their work with confidence.
          </p>
        </div>

        <div className="space-y-4 text-sm text-emerald-100">
          <p className="flex items-center gap-3">
            <CheckCircle2 size={19} className="text-ndi-gold" />
            Clear professional profiles
          </p>
          <p className="flex items-center gap-3">
            <CheckCircle2 size={19} className="text-ndi-gold" />
            Job requests and proposals in one place
          </p>
          <p className="flex items-center gap-3">
            <ShieldCheck size={19} className="text-ndi-gold" />
            Safer, accountable work conversations
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-[-0.06em] text-ndi-forest lg:hidden"
          >
            Ndi<span className="text-ndi-orange">-</span>Olu
          </Link>

          <h2 className="mt-10 text-3xl font-extrabold tracking-[-0.05em]">
            {title}
          </h2>

          <p className="mt-3 leading-7 text-slate-600">{description}</p>

          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;