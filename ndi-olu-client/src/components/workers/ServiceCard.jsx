import {
  ArrowUpRight,
  Hammer,
  Paintbrush,
  Snowflake,
  Wrench,
  Zap,
} from "lucide-react";

const serviceIcons = {
  electrical: Zap,
  plumbing: Wrench,
  cleaning: Wrench,
  painting: Paintbrush,
  carpentry: Hammer,
  tiling: Hammer,
  "air-conditioning": Snowflake,
  "generator-repair": Wrench,
};

function ServiceCard({ service }) {
  const { name, slug, description } = service;
  const Icon = serviceIcons[slug] || Wrench;

  return (
    <a
      href={`/find-workers?service=${slug}`}
      className="group rounded-ndi-card border border-slate-200 bg-ndi-surface p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-ndi-green hover:shadow-ndi-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ndi-forest"
    >
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-ndi-forest">
        <Icon size={24} strokeWidth={1.9} aria-hidden="true" />
      </span>

      <h3 className="mt-6 text-lg font-bold text-ndi-ink">{name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-ndi-forest">
        Find a professional
        <ArrowUpRight
          size={16}
          aria-hidden="true"
          className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </a>
  );
}

export default ServiceCard;
