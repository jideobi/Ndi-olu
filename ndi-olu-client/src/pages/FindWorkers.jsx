import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import WorkerCard from "../components/workers/WorkerCard";

const locations = [
  { value: "enugu-metropolis", label: "All Enugu metropolis" },

  { value: "abakpa", label: "Abakpa" },
  { value: "abakiliki-road", label: "Abakiliki Road" },
  { value: "asata", label: "Asata" },
  { value: "ayi", label: "Ayi" },
  { value: "coal-camp", label: "Coal Camp" },
  { value: "emene", label: "Emene" },
  { value: "enu-agu", label: "Enu-Agu" },
  { value: "gariki", label: "Gariki" },
  { value: "gra", label: "GRA" },
  { value: "independence-layout", label: "Independence Layout" },
  { value: "ikeja", label: "Ikeja" },
  { value: "new-haven", label: "New Haven" },
  { value: "ogui", label: "Ogui" },
  { value: "ogui-new-layout", label: "Ogui New Layout" },
  { value: "trans-ekulu", label: "Trans-Ekulu" },
  { value: "uwani", label: "Uwani" },
  { value: "wellington-bassey", label: "Wellington Bassey" },
];

function FindWorkers() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("search") ?? "");
  const [service, setService] = useState(searchParams.get("service") ?? "");
  const [location, setLocation] = useState(
    searchParams.get("location") ?? "enugu-metropolis",
  );
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const queryString = searchParams.toString();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const [workersResponse, servicesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/workers?${queryString}`),
          fetch(`${import.meta.env.VITE_API_URL}/api/services`),
        ]);
        const workersData = await workersResponse.json();
        const servicesData = await servicesResponse.json();

        if (!workersResponse.ok) throw new Error(workersData.message || "Unable to load professionals.");
        if (!servicesResponse.ok) throw new Error(servicesData.message || "Unable to load services.");

        setWorkers(workersData.workers || []);
        setServices(servicesData.services || []);
      } catch (loadError) {
        console.error("Find workers error:", loadError);
        setError(loadError.message || "Unable to load professionals.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [queryString]);

  function updateSearch(event) {
    event.preventDefault();

    const nextParams = {};

    if (keyword.trim()) nextParams.search = keyword.trim();
    if (service) nextParams.service = service;
    if (location) nextParams.location = location;
    if (verifiedOnly) nextParams.verified = "true";

    setSearchParams(nextParams);
  }

  function clearFilters() {
    setKeyword("");
    setService("");
    setLocation("enugu-metropolis");
    setVerifiedOnly(false);
    setSearchParams({});
  }

  return (
    <main className="min-h-screen bg-ndi-sand text-ndi-ink">
      <Navbar />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-ndi-forest transition hover:text-ndi-orange"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <p className="mt-7 text-sm font-bold tracking-[0.18em] text-ndi-orange">
            FIND PROFESSIONALS
          </p>

          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
            Find skilled workers in Enugu.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Search by skill and location, compare profiles, and choose the
            professional that fits your work.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <form
          onSubmit={updateSearch}
          className="rounded-ndi-card border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr_1fr_auto]">
            <label className="relative">
              <span className="sr-only">Search workers</span>

              <Search
                size={18}
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search by name or skill"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-ndi-forest focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="sr-only">
              Service
              <select
                value={service}
                onChange={(event) => setService(event.target.value)}
              >
                <option value="">All services</option>
              </select>
            </label>

            <select
              aria-label="Filter by service"
              value={service}
              onChange={(event) => setService(event.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-ndi-forest focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">All services</option>

              {services.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-ndi-forest focus:ring-2 focus:ring-emerald-100"
            >
              {locations.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <Button type="submit" variant="primary">
              <SlidersHorizontal size={17} className="mr-2" />
              Apply filters
            </Button>
          </div>

          <label className="mt-4 inline-flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(event) => setVerifiedOnly(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-ndi-forest focus:ring-ndi-forest"
            />
            Show verified professionals only
          </label>
        </form>

        <div className="mt-10 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold tracking-[0.15em] text-ndi-orange">
              SEARCH RESULTS
            </p>

            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">
              {loading
                ? "Loading professionals..."
                : `${workers.length} professional${workers.length === 1 ? "" : "s"} found`}
            </h2>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="w-fit text-sm font-bold text-ndi-forest transition hover:text-ndi-orange"
          >
            Clear all filters
          </button>
        </div>

        {error ? (
          <div className="mt-8 rounded-ndi-card border border-red-200 bg-red-50 px-6 py-8 text-center text-sm font-medium text-red-700">
            {error}
          </div>
        ) : workers.length > 0 ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {workers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-ndi-card border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <Search
              size={30}
              aria-hidden="true"
              className="mx-auto text-ndi-forest"
            />

            <h2 className="mt-5 text-xl font-extrabold">
              No professionals match those filters.
            </h2>

            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
              Try another service or area. You can also post a job and let
              suitable professionals reach out to you.
            </p>

            <Button
              onClick={clearFilters}
              variant="secondary"
              className="mt-6"
            >
              Clear filters
            </Button>
          </div>
        )}

        <aside className="mt-12 flex flex-col gap-6 rounded-ndi-panel bg-ndi-forest px-7 py-9 text-white sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.16em] text-emerald-200">
              CAN’T FIND THE RIGHT FIT?
            </p>

            <h2 className="mt-3 text-2xl font-extrabold">
              Post your job and invite proposals.
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-emerald-100">
              Describe what you need, where the work is, and when you need it.
              Professionals with the right skills can respond.
            </p>
          </div>

          <Button href="/post-job" variant="accent" className="w-fit whitespace-nowrap">
            Post a job
          </Button>
        </aside>

        <p className="mt-6 flex items-center gap-2 text-xs leading-5 text-slate-500">
          <CheckCircle2 size={15} className="shrink-0 text-ndi-green" />
          These profiles are from approved Ndi-Olu worker accounts.
        </p>
      </section>

      <Footer />
    </main>
  );
}

export default FindWorkers;
