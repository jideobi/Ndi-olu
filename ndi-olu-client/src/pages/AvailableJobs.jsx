import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    Clock3,
    MapPin,
    Banknote,
    CheckCircle2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";

function AvailableJobs() {
    const { token } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadAvailableJobs() {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/worker/jobs`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to load available jobs.",
                    );
                }

                setJobs(data.jobs || []);
            } catch (error) {
                console.error("Available jobs error:", error);

                setError(
                    error.message || "Unable to load available jobs.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadAvailableJobs();
    }, [token]);

    function formatDate(dateString) {
        if (!dateString) return "—";

        return new Date(dateString).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    function formatBudget(job) {
        if (job.budget_type === "discuss") {
            return "Open to discussion";
        }

        if (
            job.budget_amount === null ||
            job.budget_amount === undefined
        ) {
            return "Not specified";
        }

        const amount = Number(job.budget_amount);

        if (Number.isNaN(amount)) {
            return "Not specified";
        }

        return `₦${amount.toLocaleString("en-NG")}`;
    }

    function formatTiming(timing) {
        if (!timing) return "Flexible";

        const labels = {
            today: "As soon as possible",
            "this-week": "This week",
            flexible: "Flexible",
        };

        return labels[timing] || timing;
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <section>
                <Link
                    to="/worker-dashboard"
                    className="inline-flex items-center gap-2 text-sm font-bold text-ndi-forest transition hover:text-ndi-orange"
                >
                    <ArrowLeft size={16} />
                    Back to dashboard
                </Link>

                <div className="mt-6">
                    <p className="text-sm font-semibold text-ndi-orange">
                        WORKER WORKSPACE
                    </p>

                    <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                        Available Jobs
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                        Find jobs that match your skills and submit proposals
                        to customers looking for professional help.
                    </p>
                </div>
            </section>

            {/* Summary */}
            {!loading && !error && (
                <section className="mt-8">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-ndi-forest">
                                <BriefcaseBusiness size={21} />
                            </span>

                            <div>
                                <p className="text-sm font-semibold text-slate-500">
                                    Available jobs
                                </p>

                                <p className="text-2xl font-extrabold text-slate-950">
                                    {jobs.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Jobs */}
            <section className="mt-8">
                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
                            <BriefcaseBusiness
                                size={26}
                                className="animate-pulse text-slate-400"
                            />
                        </div>

                        <h2 className="mt-4 font-bold text-slate-900">
                            Finding available jobs...
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Please wait while we retrieve jobs for you.
                        </p>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white">
                            <BriefcaseBusiness
                                size={26}
                                className="text-red-500"
                            />
                        </div>

                        <h2 className="mt-4 font-bold text-slate-900">
                            Unable to load available jobs
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                            {error}
                        </p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50">
                            <CheckCircle2
                                size={26}
                                className="text-ndi-forest"
                            />
                        </div>

                        <h2 className="mt-4 text-lg font-extrabold text-slate-900">
                            No jobs available right now
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            New customer jobs will appear here when they are
                            posted and available for you.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-6"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    {/* Job information */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <h2 className="text-lg font-extrabold text-slate-950">
                                                    {job.title}
                                                </h2>

                                                {job.service_name && (
                                                    <p className="mt-1 text-sm font-semibold text-ndi-forest">
                                                        {job.service_name}
                                                    </p>
                                                )}
                                            </div>

                                            {job.has_proposal && (
                                                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                    <CheckCircle2 size={13} />
                                                    Proposal submitted
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                                            {job.description}
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-500">
                                            <span className="inline-flex items-center gap-1.5">
                                                <MapPin
                                                    size={15}
                                                    className="text-ndi-green"
                                                />
                                                {job.location ||
                                                    "Location not specified"}
                                            </span>

                                            <span className="inline-flex items-center gap-1.5">
                                                <Clock3
                                                    size={15}
                                                    className="text-ndi-orange"
                                                />
                                                {formatTiming(job.timing)}
                                            </span>

                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarDays
                                                    size={15}
                                                    className="text-slate-400"
                                                />
                                                {formatDate(job.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Budget */}
                                    <div className="shrink-0 rounded-xl bg-slate-50 px-5 py-4 lg:min-w-48">
                                        <div className="flex items-center gap-2">
                                            <Banknote
                                                size={16}
                                                className="text-ndi-forest"
                                            />

                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Budget
                                            </p>
                                        </div>

                                        <p className="mt-1 text-base font-extrabold text-slate-950">
                                            {formatBudget(job)}
                                        </p>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400">
                                            Customer posted this job
                                        </p>
                                    </div>

                                    {job.has_proposal ? (
                                        <button
                                            type="button"
                                            disabled
                                            className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-400"
                                        >
                                            Proposal Already Submitted
                                        </button>
                                    ) : (
                                        <Link
                                            to={`/worker-jobs/${job.id}`}
                                            className="inline-flex items-center justify-center rounded-xl bg-ndi-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-ndi-forest-dark"
                                        >
                                            View Job & Apply
                                        </Link>
                                    )}
                                </div>

                                {job.address_note && (
                                    <div className="mt-4 border-t border-slate-100 pt-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Location note
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {job.address_note}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </DashboardLayout>
    );
}

export default AvailableJobs;