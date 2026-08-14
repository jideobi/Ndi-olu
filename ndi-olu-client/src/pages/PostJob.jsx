import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";

import { workers } from "../data/workers";
import { useAuth } from "../context/AuthContext";

const locations = [
  "Enugu metropolis",
  "Independence Layout",
  "New Haven",
  "GRA",
  "Uwani",
  "Ogui",
];


function PostJob() {
  const [searchParams] = useSearchParams();

  const { token } = useAuth();

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadServices() {
      try {
        setServicesLoading(true);
        setServicesError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/services`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load services.");
        }

        setServices(data.services || []);
      } catch (error) {
        console.error("Failed to load services:", error);
        setServicesError(error.message || "Failed to load services.");
      } finally {
        setServicesLoading(false);
      }
    }

    loadServices();
  }, []);

  const preferredWorkerId = searchParams.get("worker");
  const preferredWorker = workers.find(
    (worker) => worker.id === preferredWorkerId,
  );

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitError("");
    setIsSubmitting(true);

    if (!token) {
      setSubmitError("Your session has expired. Please sign in again.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(event.currentTarget);

    const payload = {
      title: formData.get("title")?.trim(),
      service: formData.get("service"),
      description: formData.get("description")?.trim(),
      location: formData.get("location"),
      addressNote: formData.get("addressNote")?.trim() || null,
      timing: formData.get("timing"),
      budgetType: formData.get("budgetType"),
      budgetAmount: formData.get("budget")?.trim()
        ? Number(formData.get("budget"))
        : null,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/jobs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to post your job.");
      }

      console.log("Job created:", data);

      setIsSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Job submission failed:", error);

      setSubmitError(
        error.message || "Something went wrong while posting your job.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-ndi-sand text-ndi-ink">
        <Navbar />

        <section className="mx-auto flex max-w-2xl px-5 py-20 sm:px-8">
          <div className="w-full rounded-ndi-panel border border-slate-200 bg-white p-8 text-center shadow-ndi-card sm:p-12">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-ndi-green">
              <CheckCircle2 size={32} />
            </span>

            <p className="mt-7 text-sm font-bold tracking-[0.16em] text-ndi-orange">
              JOB POSTED SUCCESSFULLY
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.05em]">
              Your job has been posted!
            </h1>

            <p className="mt-5 leading-7 text-slate-600">
              Your job is now live on Ndi-Olu. Suitable professionals can review
              your request and send proposals. You can then compare responses and
              choose the right professional for the job.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/find-workers">Browse professionals</Button>

              <Button href="/" variant="secondary">
                Return home
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ndi-sand text-ndi-ink">
      <Navbar />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-ndi-forest transition hover:text-ndi-orange"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <p className="mt-7 text-sm font-bold tracking-[0.18em] text-ndi-orange">
            POST A JOB
          </p>

          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
            Tell professionals what you need.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Clear job details help the right people understand your work and send
            a useful proposal.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-ndi-panel border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            {submitError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {submitError}
              </div>
            )}

            {preferredWorker && (
              <div className="rounded-ndi-card border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-bold text-ndi-forest">
                  Preferred professional selected
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You are preparing a job request after viewing{" "}
                  <span className="font-bold">{preferredWorker.name}</span>’s
                  profile. Other eligible professionals may also be able to
                  respond.
                </p>
              </div>
            )}

            <fieldset>
              <legend className="text-xl font-extrabold">1. Describe the work</legend>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use a clear title and enough detail for a professional to assess
                the work.
              </p>

              <div className="mt-6 grid gap-5">
                <Input
                  id="job-title"
                  name="title"
                  label="Job title"
                  placeholder="Example: Repair an electrical fault at home"
                  required
                />

                <div>
                  <label
                    htmlFor="job-service"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Service needed
                  </label>

                  <select
                    id="job-service"
                    name="service"
                    required
                    defaultValue=""
                    disabled={servicesLoading || !!servicesError}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-ndi-forest focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option value="" disabled>
                      {servicesLoading
                        ? "Loading services..."
                        : servicesError
                          ? "Unable to load services"
                          : "Select a service"}
                    </option>

                    {services.map((service) => (
                      <option key={service.id} value={service.slug}>
                        {service.name}
                      </option>
                    ))}
                  </select>

                  {servicesError && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {servicesError}
                    </p>
                  )}
                </div>

                <Textarea
                  id="job-description"
                  name="description"
                  label="Describe the work"
                  placeholder="Explain what needs to be done, the current situation, and any important details."
                  hint="Do not include your phone number or other private contact details."
                  required
                />
              </div>
            </fieldset>

            <fieldset className="border-t border-slate-100 pt-8">
              <legend className="text-xl font-extrabold">2. Location and timing</legend>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="job-location"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Area in Enugu
                  </label>

                  <select
                    id="job-location"
                    name="location"
                    required
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-ndi-forest focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="" disabled>
                      Select an area
                    </option>

                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="job-timing"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    When is the work needed?
                  </label>

                  <select
                    id="job-timing"
                    name="timing"
                    required
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-ndi-forest focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="" disabled>
                      Select timing
                    </option>
                    <option value="today">As soon as possible</option>
                    <option value="this-week">This week</option>
                    <option value="flexible">I am flexible</option>
                  </select>
                </div>

                <Input
                  id="job-address-note"
                  name="addressNote"
                  label="Location note (optional)"
                  placeholder="Example: Near New Haven Market"
                  className="sm:col-span-2"
                />
              </div>
            </fieldset>

            <fieldset className="border-t border-slate-100 pt-8">
              <legend className="text-xl font-extrabold">3. Budget</legend>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="budget-type"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Budget type
                  </label>

                  <select
                    id="budget-type"
                    name="budgetType"
                    defaultValue="fixed"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-ndi-forest focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="fixed">Fixed price</option>
                    <option value="hourly">Hourly rate</option>
                    <option value="discuss">Open to discussion</option>
                  </select>
                </div>

                <Input
                  id="budget-amount"
                  name="budget"
                  label="Budget amount (₦)"
                  inputMode="numeric"
                  placeholder="Example: 25000"
                  hint="Use an estimate if you are not sure."
                />
              </div>
            </fieldset>

            <fieldset className="border-t border-slate-100 pt-8">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-ndi-forest focus:ring-ndi-forest"
                />
                <span>
                  I understand that Ndi-Olu is designed to keep work discussions
                  clear and respectful. I will provide accurate job details and
                  follow the platform’s safety guidelines.
                </span>
              </label>
            </fieldset>

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={isSubmitting || servicesLoading || !!servicesError}
            >
              {isSubmitting ? "Posting your job..." : "Submit job request"}
            </Button>
          </form>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <div className="rounded-ndi-card bg-ndi-forest p-6 text-white shadow-ndi-panel">
              <FileText size={24} className="text-ndi-gold" />

              <h2 className="mt-5 text-2xl font-extrabold">
                What happens next?
              </h2>

              <ol className="mt-5 space-y-4 text-sm leading-6 text-emerald-100">
                <li>
                  <span className="mr-2 font-bold text-ndi-gold">01</span>
                  Your request is matched with suitable professionals.
                </li>
                <li>
                  <span className="mr-2 font-bold text-ndi-gold">02</span>
                  Interested workers can send proposals.
                </li>
                <li>
                  <span className="mr-2 font-bold text-ndi-gold">03</span>
                  You compare responses and start a conversation.
                </li>
              </ol>
            </div>

            <div className="rounded-ndi-card border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-ndi-forest">
                  <ShieldCheck size={20} />
                </span>

                <div>
                  <p className="font-bold">Protect your privacy</p>
                  <p className="text-sm text-slate-500">
                    Keep private contact details out of job descriptions.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
                <MapPin size={17} className="text-ndi-green" />
                Launching in Enugu State first.
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default PostJob;