import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

const profileExtras = {
  electrician: {
    specialties: [
      "Electrical fault diagnosis",
      "House wiring and rewiring",
      "Lighting and socket installation",
      "Consumer-unit maintenance",
    ],
    serviceAreas: ["New Haven", "Ogui", "GRA", "Independence Layout"],
  },
  plumber: {
    specialties: [
      "Leak detection and repairs",
      "Bathroom and kitchen fittings",
      "Water-tank installation",
      "Pipe maintenance",
    ],
    serviceAreas: ["Independence Layout", "New Haven", "GRA", "Uwani"],
  },
  "ac-technician": {
    specialties: [
      "AC servicing and maintenance",
      "Installation and relocation",
      "Gas refills",
      "Cooling-system diagnosis",
    ],
    serviceAreas: ["GRA", "New Haven", "Ogui", "Uwani"],
  },
  "solar-technician": {
    specialties: [
      "Solar panel installation",
      "Inverter installation",
      "Battery replacement",
      "Backup-power maintenance",
    ],
    serviceAreas: ["Uwani", "New Haven", "GRA", "Independence Layout"],
  },
};

function WorkerProfile() {
  const { workerId } = useParams();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorker() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/workers/${workerId}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Worker not found");
        }

        setWorker(data.worker);
      } catch (error) {
        console.error("Worker profile error:", error);
        setWorker(null);
      } finally {
        setLoading(false);
      }
    }

    loadWorker();
  }, [workerId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-ndi-sand text-ndi-ink">
        <Navbar />
        <div className="flex min-h-80 items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-ndi-forest" />
        </div>
      </main>
    );
  }

  if (!worker) {
    return <Navigate to="/find-workers" replace />;
  }

  const details = profileExtras[worker.serviceSlug] ?? {
    specialties: ["Professional service delivery"],
    serviceAreas: [worker.area],
  };

  return (
    <main className="min-h-screen bg-ndi-sand text-ndi-ink">
      <Navbar />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
          <Link
            to="/find-workers"
            className="inline-flex items-center gap-2 text-sm font-bold text-ndi-forest transition hover:text-ndi-orange"
          >
            <ArrowLeft size={16} />
            Back to professionals
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="rounded-ndi-panel border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {worker.profile_image_url ? (
                <img src={worker.profile_image_url} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
              ) : (
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-xl font-extrabold text-ndi-forest">
                  {worker.initials}
                </div>
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">
                    {worker.name}
                  </h1>

                  {worker.verified && (
                    <Badge variant="verified">
                      <ShieldCheck size={14} aria-hidden="true" />
                      Verified profile
                    </Badge>
                  )}
                </div>

                <p className="mt-2 text-lg font-bold text-ndi-green">
                  {worker.service}
                </p>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={16} className="text-ndi-green" aria-hidden="true" />
                    {worker.area}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Star
                      size={16}
                      className="fill-ndi-gold text-ndi-gold"
                      aria-hidden="true"
                    />
                    {worker.rating} rating from {worker.reviewCount} reviews
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase size={16} className="text-ndi-green" aria-hidden="true"/>
                    {worker.jobsCompleted} completed jobs
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <p className="text-sm font-bold tracking-[0.16em] text-ndi-orange">
                ABOUT
              </p>

              <h2 className="mt-3 text-2xl font-extrabold">
                Professional service, clearly presented.
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                {worker.bio} {worker.name.split(" ")[0]} has{" "}
                {worker.yearsExperience} years of relevant trade experience.
              </p>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <p className="text-sm font-bold tracking-[0.16em] text-ndi-orange">
                SPECIALTIES
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {details.specialties.map((specialty) => (
                  <div
                    key={specialty}
                    className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-ndi-forest"
                  >
                    <CheckCircle2 size={17} aria-hidden="true" />
                    {specialty}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <p className="text-sm font-bold tracking-[0.16em] text-ndi-orange">
                SKILLS
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {worker.skills?.map((skill) => (
                  <Badge key={skill} variant="neutral">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <p className="text-sm font-bold tracking-[0.16em] text-ndi-orange">
                SERVICE AREAS
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {details.serviceAreas.map((area) => (
                  <Badge key={area} variant="neutral">
                    <MapPin size={13} aria-hidden="true" />
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-ndi-card border border-slate-200 bg-ndi-sand p-6">
              <p className="text-sm font-bold tracking-[0.16em] text-ndi-orange">
                REVIEWS AND JOB HISTORY
              </p>

              <h2 className="mt-3 text-xl font-extrabold">
                Feedback is earned after completed work.
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Ndi-Olu will show ratings and reviews only after a client
                confirms that the job has been completed. This helps keep
                feedback useful and accountable.
              </p>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <div className="rounded-ndi-card bg-ndi-forest p-6 text-white shadow-ndi-panel">
              <Badge variant="accent">{worker.availability}</Badge>

              <h2 className="mt-5 text-2xl font-extrabold">
                Interested in this professional?
              </h2>

              <p className="mt-3 leading-7 text-emerald-100">
                Tell us what you need, where the work is, and when you need it.
                You can reference this professional when submitting your request.
              </p>

              <div className="mt-6 grid gap-3">
                <Button
                  href={`/post-job?worker=${worker.id}`}
                  variant="accent"
                  className="w-full"
                >
                  Post a job request
                </Button>

                <Button
                  href={`/chat?worker=${worker.id}`}
                  variant="secondary"
                  className="w-full"
                >
                  <MessageCircle size={17} className="mr-2" />
                  Chat with worker
                </Button>
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-emerald-200">
                Contact details remain private until the appropriate in-platform
                connection flow is completed.
              </p>
            </div>

            <div className="rounded-ndi-card border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-ndi-forest">
                  <Clock size={19} aria-hidden="true" />
                </div>

                <div>
                  <p className="font-bold">How hiring starts</p>
                  <p className="text-sm text-slate-500">
                    Clear details lead to better work.
                  </p>
                </div>
              </div>

              <ol className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
                <li>
                  <span className="mr-2 font-bold text-ndi-orange">01</span>
                  Describe the work, budget and location.
                </li>
                <li>
                  <span className="mr-2 font-bold text-ndi-orange">02</span>
                  Review the response and agree on details.
                </li>
                <li>
                  <span className="mr-2 font-bold text-ndi-orange">03</span>
                  Keep communication and job records in Ndi-Olu.
                </li>
              </ol>
            </div>

            <Link
              to="/find-workers"
              className="flex items-center justify-center gap-2 text-sm font-bold text-ndi-forest transition hover:text-ndi-orange"
            >
              <MessageCircle size={16} />
              View more professionals
            </Link>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default WorkerProfile;
