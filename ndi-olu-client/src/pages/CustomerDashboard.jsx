import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    BriefcaseBusiness,
    CheckCircle2,
    Clock3,
    MapPin,
    Plus,
    Search,
    Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";

function CustomerDashboard() {
    const { user, token } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [proposalsLoading, setProposalsLoading] = useState(true);
    const [error, setError] = useState("");
    const [proposalsError, setProposalsError] = useState("");
    const [showAllProposals, setShowAllProposals] = useState(false);

    useEffect(() => {
        async function loadDashboard() {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/customer/dashboard`,
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
                        data.message || "Unable to load your dashboard.",
                    );
                }

                setDashboard(data);
            } catch (error) {
                console.error("Customer dashboard error:", error);
                setError(
                    error.message || "Unable to load your dashboard.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [token]);

    useEffect(() => {
        async function loadCustomerProposals() {
            if (!token) {
                setProposalsLoading(false);
                return;
            }

            try {
                setProposalsLoading(true);
                setProposalsError("");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/proposals/customer`,
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
                        data.message || "Unable to load received proposals.",
                    );
                }

                setProposals(data.proposals || []);
            } catch (error) {
                console.error("Customer proposals error:", error);

                setProposalsError(
                    error.message || "Unable to load received proposals.",
                );
            } finally {
                setProposalsLoading(false);
            }
        }

        loadCustomerProposals();
    }, [token]);

    function formatAmount(amount) {
        if (
            amount === null ||
            amount === undefined ||
            amount === ""
        ) {
            return "Open to discussion";
        }

        const value = Number(amount);

        if (Number.isNaN(value)) {
            return "Open to discussion";
        }

        return `₦${value.toLocaleString("en-NG")}`;
    }

    function formatDate(dateString) {
        if (!dateString) return "—";

        return new Date(dateString).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    function formatProposalStatus(status) {
        const labels = {
            pending: "Pending",
            accepted: "Accepted",
            rejected: "Rejected",
            withdrawn: "Withdrawn",
        };

        return labels[status] || status || "Pending";
    }

    function proposalStatusClasses(status) {
        switch (status) {
            case "accepted":
                return "bg-emerald-50 text-emerald-700";

            case "rejected":
                return "bg-red-50 text-red-700";

            case "withdrawn":
                return "bg-slate-100 text-slate-600";

            case "pending":
            default:
                return "bg-amber-50 text-amber-700";
        }
    }

    return (
        <DashboardLayout>
            {/* Welcome section */}
            <section>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-ndi-orange">
                            Customer workspace
                        </p>

                        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                            Good morning,{" "}
                            {user?.full_name?.split(" ")[0] || "there"} 👋
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                            What do you need help with today? Find a trusted professional
                            or post a job and let skilled workers come to you.
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

            {/* Search */}
            <section className="mt-8">
                <div className="relative overflow-hidden rounded-3xl bg-ndi-forest p-6 shadow-sm sm:p-8">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                            <Sparkles size={17} />
                            Find the right professional
                        </div>

                        <h2 className="mt-2 max-w-xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                            What service are you looking for?
                        </h2>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <div className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3">
                                <Search size={20} className="shrink-0 text-slate-400" />

                                <input
                                    type="text"
                                    placeholder="e.g. plumber, electrician, cleaner..."
                                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                />
                            </div>

                            <Link
                                to="/find-workers"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ndi-orange px-6 py-3 text-sm font-bold text-white transition hover:brightness-95"
                            >
                                Search
                                <ArrowRight size={17} />
                            </Link>
                        </div>
                    </div>

                    <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/10" />
                    <div className="absolute -bottom-32 right-24 h-72 w-72 rounded-full bg-emerald-300/10" />
                </div>
            </section>

            {/* Popular services */}
            <section className="mt-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-950">
                            Popular services
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Get help from professionals around you.
                        </p>
                    </div>

                    <Link
                        to="/find-workers"
                        className="hidden items-center gap-1 text-sm font-bold text-ndi-forest sm:flex"
                    >
                        View all
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        ["🔧", "Plumbing"],
                        ["⚡", "Electrical"],
                        ["🧹", "Cleaning"],
                        ["🎨", "Painting"],
                    ].map(([icon, label]) => (
                        <Link
                            key={label}
                            to={`/find-workers?service=${label.toLowerCase()}`}
                            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm"
                        >
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-xl">
                                {icon}
                            </span>

                            <span className="text-sm font-bold text-slate-800">
                                {label}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-500">
                            Jobs posted
                        </p>

                        <BriefcaseBusiness size={19} className="text-ndi-forest" />
                    </div>

                    <p className="mt-3 text-3xl font-extrabold text-slate-950">
                        {loading ? "—" : dashboard?.stats?.jobsPosted ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Total jobs you've created
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-500">
                            Active jobs
                        </p>

                        <Clock3 size={19} className="text-ndi-orange" />
                    </div>

                    <p className="mt-3 text-3xl font-extrabold text-slate-950">
                        {loading ? "—" : dashboard?.stats?.activeJobs ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Jobs currently in progress
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-500">
                            Completed
                        </p>

                        <CheckCircle2 size={19} className="text-ndi-forest" />
                    </div>

                    <p className="mt-3 text-3xl font-extrabold text-slate-950">
                        {loading ? "—" : dashboard?.stats?.completedJobs ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Successfully completed jobs
                    </p>
                </div>
            </section>

            {/* Recent jobs */}
            <section className="mt-10">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-950">
                            Recent jobs
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Keep track of your latest requests.
                        </p>
                    </div>

                    <Link
                        to="/customer-jobs"
                        className="flex items-center gap-1 text-sm font-bold text-ndi-forest"
                    >
                        View jobs
                        <ArrowRight size={16} />
                    </Link>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
                                <BriefcaseBusiness
                                    size={25}
                                    className="animate-pulse text-slate-400"
                                />
                            </div>

                            <h3 className="mt-4 font-bold text-slate-900">
                                Loading your jobs...
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Please wait while we retrieve your latest activity.
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50">
                                <BriefcaseBusiness
                                    size={25}
                                    className="text-red-500"
                                />
                            </div>

                            <h3 className="mt-4 font-bold text-slate-900">
                                Unable to load jobs
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                {error}
                            </p>
                        </div>
                    ) : dashboard?.recentJobs?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50">
                                <BriefcaseBusiness
                                    size={25}
                                    className="text-ndi-forest"
                                />
                            </div>

                            <h3 className="mt-4 font-bold text-slate-900">
                                No jobs yet
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                When you post a job, you'll see its status, proposals,
                                and progress here.
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
                        <div className="divide-y divide-slate-100">
                            {dashboard.recentJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <h3 className="truncate font-bold text-slate-900">
                                            {job.title}
                                        </h3>

                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                            {job.location && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin size={13} />
                                                    {job.location}
                                                </span>
                                            )}

                                            {job.timing && (
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold">
                                                    {job.timing}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <span
                                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${job.status === "completed"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : job.status === "in_progress"
                                                ? "bg-orange-50 text-orange-700"
                                                : job.status === "cancelled"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-blue-50 text-blue-700"
                                            }`}
                                    >
                                        {job.status?.replace("_", " ") || "open"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            {/* Received proposals */}
            {/* Received proposals */}
            <section className="mt-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-950">
                            Received proposals
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Review proposals from professionals who applied to your jobs.
                        </p>
                    </div>

                    {!proposalsLoading && proposals.length > 3 && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowAllProposals((current) => !current)
                            }
                            className="inline-flex items-center gap-2 text-sm font-bold text-ndi-forest transition hover:text-ndi-forest-dark"
                        >
                            {showAllProposals
                                ? "Show less"
                                : `View all proposals (${proposals.length})`}

                            <ArrowRight
                                size={16}
                                className={`transition-transform ${showAllProposals ? "-rotate-90" : "rotate-0"
                                    }`}
                            />
                        </button>
                    )}
                </div>

                <div className="mt-4">
                    {proposalsLoading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
                            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
                                <BriefcaseBusiness
                                    size={25}
                                    className="animate-pulse text-slate-400"
                                />
                            </div>

                            <h3 className="mt-4 font-bold text-slate-900">
                                Loading proposals...
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Please wait while we retrieve proposals from workers.
                            </p>
                        </div>
                    ) : proposalsError ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center">
                            <h3 className="font-bold text-slate-900">
                                Unable to load proposals
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                                {proposalsError}
                            </p>
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
                            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-50">
                                <BriefcaseBusiness
                                    size={25}
                                    className="text-slate-400"
                                />
                            </div>

                            <h3 className="mt-4 font-bold text-slate-900">
                                No proposals yet
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                When workers apply to your jobs, their proposals will
                                appear here.
                            </p>

                            <Link
                                to="/customer-jobs"
                                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-ndi-forest"
                            >
                                View my jobs
                                <ArrowRight size={17} />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(showAllProposals
                                ? proposals
                                : proposals.slice(0, 3)
                            ).map((proposal) => (
                                <article
                                    key={proposal.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                                >
                                    {/* Proposal header */}
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-lg font-extrabold text-slate-950">
                                                    {proposal.worker_name ||
                                                        "Professional"}
                                                </h3>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${proposalStatusClasses(
                                                        proposal.status,
                                                    )}`}
                                                >
                                                    {formatProposalStatus(
                                                        proposal.status,
                                                    )}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-sm font-semibold text-ndi-forest">
                                                Applied to: {proposal.title}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-slate-50 px-5 py-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Proposed amount
                                            </p>

                                            <p className="mt-1 text-lg font-extrabold text-slate-950">
                                                {formatAmount(
                                                    proposal.proposed_amount,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Worker information */}
                                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-sm text-slate-500">
                                        {proposal.worker_phone && (
                                            <span>
                                                📞 {proposal.worker_phone}
                                            </span>
                                        )}

                                        {proposal.worker_email && (
                                            <span>
                                                ✉️ {proposal.worker_email}
                                            </span>
                                        )}

                                        {proposal.estimated_duration && (
                                            <span className="inline-flex items-center gap-2">
                                                <Clock3
                                                    size={15}
                                                    className="text-ndi-orange"
                                                />
                                                {proposal.estimated_duration}
                                            </span>
                                        )}

                                        <span>
                                            Submitted{" "}
                                            {formatDate(proposal.created_at)}
                                        </span>
                                    </div>

                                    {/* Proposal message */}
                                    <div className="mt-5 rounded-xl bg-slate-50 p-5">
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Worker proposal
                                        </p>

                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                            {proposal.message}
                                        </p>
                                    </div>

                                    {/* Action */}
                                    <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                                        <Link
                                            to={`/customer-jobs/${proposal.job_id}`}
                                            className="inline-flex items-center gap-2 rounded-xl bg-ndi-forest px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ndi-forest-dark"
                                        >
                                            View job
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom View All button */}
                {!proposalsLoading &&
                    !proposalsError &&
                    proposals.length > 3 &&
                    !showAllProposals && (
                        <div className="mt-5 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setShowAllProposals(true)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-ndi-forest"
                            >
                                View all {proposals.length} proposals
                                <ArrowRight size={17} />
                            </button>
                        </div>
                    )}
            </section>

            {/* Location */}
            <div className="mt-8 flex items-center gap-2 text-xs font-medium text-slate-400">
                <MapPin size={14} />
                Serving customers and professionals across Enugu State
            </div>
        </DashboardLayout>
    );
}

export default CustomerDashboard;