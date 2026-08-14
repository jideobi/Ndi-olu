import { ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../ui/Badge";

function WorkerCard({ worker }) {
  const name = worker.name || worker.full_name || "Ndi-Olu professional";
  const initials = worker.initials || name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const rating = Number(worker.rating || 0).toFixed(1);
  const reviewCount = worker.reviewCount ?? worker.review_count ?? 0;
  const yearsExperience = worker.yearsExperience ?? worker.years_experience ?? 0;
  const jobsCompleted = worker.jobsCompleted ?? worker.jobs_completed ?? 0;

  return (
    <article className="rounded-ndi-card border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-ndi-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {worker.profile_image_url ? (
            <img src={worker.profile_image_url} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-sm font-extrabold text-ndi-forest">
              {initials}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-ndi-ink">{name}</h2>
              {worker.verified && (
                <Badge variant="verified">
                  <ShieldCheck size={13} aria-hidden="true" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm font-semibold text-ndi-green">{worker.service}</p>
          </div>
        </div>
        <Badge variant="accent">{worker.availability || "Available this week"}</Badge>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-600">
        {worker.bio || "This professional has not added a description yet."}
      </p>

      {worker.skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {worker.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
        <span className="flex items-center gap-1.5">
          <MapPin size={15} className="text-ndi-green" aria-hidden="true" />
          {worker.area || worker.location || "Enugu"}
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={15} className="fill-ndi-gold text-ndi-gold" aria-hidden="true" />
          {rating} ({reviewCount})
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
        <span className="text-sm text-slate-500">
          {yearsExperience} years experience · {jobsCompleted} jobs
        </span>
        <Link to={`/workers/${worker.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-ndi-forest transition hover:text-ndi-orange">
          View profile
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default WorkerCard;
