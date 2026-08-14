import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    Clock3,
    MapPin,
    Plus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";

function CustomerJobs() {
    const { token } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadJobs() {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/jobs`,
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
                        data.message || "Unable to load your jobs.",
                    );
                }

                setJobs(data.jobs || []);
            } catch (error) {
                console.error("Customer jobs error:", error);

                setError(
                    error.message || "Unable to load your jobs.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadJobs();
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

    function formatStatus(status) {
        if (!status) return "Open";

        return status
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    function getStatusClasses(status) {
        switch (status) {
            case "completed":
                return "bg-emerald-50 text-emerald-700";

            case "in_progress":
                return "bg-orange-50 text-orange-700";

            case "cancelled":
                return "bg-red-50 text-red-700";

            default:
                return "bg-blue-50 text-blue-700";
        }
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <section>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Link
                            to="/customer-dashboard"
                            className="inline-flex items-center gap-2 text-sm font-bold text-ndi-forest transition hover:text-ndi-orange"
                        >
                            <ArrowLeft size={16} />
                            Back to dashboard
                        </Link>

                        <p className="mt-6 text-sm font-semibold text-ndi-orange">
                            WORKSPACE
                        </p>

                        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                            My Jobs
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                            View and keep track of all the jobs you have posted.
                        </p>
                    </div>

                    <Link
                        to="/post-job"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-ndi-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-ndi-forest-dark"
                    >
                        <Plus size={18} />
                        Post a new job
                    </Link>
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
                                    Total jobs
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
                            Loading your jobs...
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Please wait while we retrieve your jobs.
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
                            Unable to load your jobs
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                            {error}
                        </p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50">
                            <BriefcaseBusiness
                                size={26}
                                className="text-ndi-forest"
                            />
                        </div>

                        <h2 className="mt-4 text-lg font-extrabold text-slate-900">
                            You haven't posted any jobs yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Post your first job and connect with skilled
                            professionals around you.
                        </p>

                        <Link
                            to="/post-job"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ndi-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-ndi-forest-dark"
                        >
                            <Plus size={17} />
                            Post your first job
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
<Link
    key={job.id}
    to={`/customer-jobs/${job.id}`}
    className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-6"
>
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    {/* Main information */}
                                    <div className="min-w-0">
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

                                            <span
                                                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                                                    job.status,
                                                )}`}
                                            >
                                                {formatStatus(job.status)}
                                            </span>
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
                                                {job.location || "Location not specified"}
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
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Budget
                                        </p>

                                        <p className="mt-1 text-base font-extrabold text-slate-950">
                                            {formatBudget(job)}
                                        </p>

                                        {job.budget_type &&
                                            job.budget_type !== "discuss" && (
                                                <p className="mt-1 text-xs capitalize text-slate-500">
                                                    {job.budget_type} pricing
                                                </p>
                                            )}
                                    </div>
                                </div>

                                {job.address_note && (
                                    <div className="mt-5 border-t border-slate-100 pt-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Location note
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {job.address_note}
                                        </p>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </DashboardLayout>
    );
}

export default CustomerJobs;