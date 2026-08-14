import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    BriefcaseBusiness,
    CheckCircle2,
    Clock3,
    MapPin,
    Search,
    UserCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";

function WorkerDashboard() {
    const { user, token } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [proposalCount, setProposalCount] = useState(0);
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
                setProposalCount(Number(data.proposalCount || 0));
            } catch (error) {
                console.error("Worker dashboard error:", error);

                setError(
                    error.message || "Unable to load available jobs.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadAvailableJobs();
    }, [token]);

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
            {/* Welcome */}
            <section>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-ndi-orange">
                            Worker workspace
                        </p>

                        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                            Welcome,{" "}
                            {user?.full_name?.split(" ")[0] || "there"} 👋
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                            Find jobs that match your skills and submit proposals
                            to customers looking for professional help.
                        </p>
                    </div>

                    <Link
                        to="/available-jobs"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-ndi-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-ndi-forest-dark"
                    >
                        <Search size={18} />
                        Find available jobs
                    </Link>
                </div>
            </section>

            {/* Quick stats */}
            <section className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-500">
                            Available jobs
                        </p>

                        <BriefcaseBusiness
                            size={19}
                            className="text-ndi-forest"
                        />
                    </div>

                    <p className="mt-3 text-3xl font-extrabold text-slate-950">
                        {loading ? "—" : jobs.length}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Jobs currently open
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-500">
                            My proposals
                        </p>

                        <Clock3
                            size={19}
                            className="text-ndi-orange"
                        />
                    </div>

                    <p className="mt-3 text-3xl font-extrabold text-slate-950">
                        {loading ? "—" : proposalCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        {proposalCount === 1
                            ? "Proposal submitted"
                            : "Proposals submitted"}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-500">
                            Worker status
                        </p>

                        <UserCheck
                            size={19}
                            className="text-ndi-forest"
                        />
                    </div>

                    <p className="mt-3 text-lg font-extrabold text-emerald-700">
                        Approved
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        You can submit proposals
                    </p>
                </div>
            </section>

            {/* Available jobs */}
            <section className="mt-10">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-950">
                            Available Jobs
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Jobs posted by customers that you can apply for.
                        </p>
                    </div>

                    <Link
                        to="/available-jobs"
                        className="flex items-center gap-1 text-sm font-bold text-ndi-forest"
                    >
                        View all
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="mt-4">
                    {loading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
                                <BriefcaseBusiness
                                    size={26}
                                    className="animate-pulse text-slate-400"
                                />
                            </div>

                            <h3 className="mt-4 font-bold text-slate-900">
                                Loading available jobs...
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Looking for jobs that match your profile.
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

                            <h3 className="mt-4 font-bold text-slate-900">
                                {error.includes("awaiting approval")
                                    ? "Profile awaiting approval"
                                    : "Unable to load available jobs"}
                            </h3>

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

                            <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                                No available jobs right now
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Check back later. New customer jobs will appear
                                here when they are posted.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.slice(0, 5).map((job) => (
                                <div
                                    key={job.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-6"
                                >
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <h3 className="text-lg font-extrabold text-slate-950">
                                                        {job.title}
                                                    </h3>

                                                    {job.service_name && (
                                                        <p className="mt-1 text-sm font-semibold text-ndi-forest">
                                                            {job.service_name}
                                                        </p>
                                                    )}
                                                </div>

                                                {job.has_proposal && (
                                                    <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                        Proposal submitted
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                                {job.description}
                                            </p>

                                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-500">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPin
                                                        size={15}
                                                        className="text-ndi-forest"
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
                                            </div>
                                        </div>

                                        <div className="shrink-0 rounded-xl bg-slate-50 px-5 py-4 lg:min-w-48">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Budget
                                            </p>

                                            <p className="mt-1 text-base font-extrabold text-slate-950">
                                                {formatBudget(job)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                                        <Link
                                            to={`/worker-jobs/${job.id}`}
                                            className="inline-flex items-center gap-2 rounded-xl bg-ndi-forest px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ndi-forest-dark"
                                        >
                                            View job
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Bottom */}
            <div className="mt-8 flex items-center gap-2 text-xs font-medium text-slate-400">
                <MapPin size={14} />
                Serving professionals and customers across Enugu State
            </div>
        </DashboardLayout>
    );
}

export default WorkerDashboard;