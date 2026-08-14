import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
ArrowRight,
BriefcaseBusiness,
CalendarDays,
CheckCircle2,
Clock3,
MapPin,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";

function WorkerProposals() {
    const { token } = useAuth();

    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProposals() {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/proposals/mine`,
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
                        data.message || "Unable to load your proposals.",
                    );
                }

                setProposals(data.proposals || []);
            } catch (error) {
                console.error("Worker proposals error:", error);

                setError(
                    error.message || "Unable to load your proposals.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadProposals();
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

    function formatStatus(status) {
        const labels = {
            pending: "Pending",
            accepted: "Accepted",
            rejected: "Rejected",
            withdrawn: "Withdrawn",
        };

        return labels[status] || status || "Pending";
    }

    function statusClasses(status) {
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
            {/* Header */}
            <section>
                <p className="text-sm font-semibold text-ndi-orange">
                    WORKER WORKSPACE
                </p>

                <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                            My proposals
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                            Track the proposals you have submitted to
                            customers.
                        </p>
                    </div>

                    <Link
                        to="/available-jobs"
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-ndi-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-ndi-forest-dark"
                    >
                        <BriefcaseBusiness size={18} />
                        Find more jobs
                    </Link>
                </div>
            </section>

            {/* Content */}
            <section className="mt-8">
                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
                            <BriefcaseBusiness
                                size={26}
                                className="animate-pulse text-slate-400"
                            />
                        </div>

                        <h2 className="mt-4 font-bold text-slate-900">
                            Loading your proposals...
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Please wait while we retrieve your proposals.
                        </p>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
                        <h2 className="font-bold text-slate-900">
                            Unable to load proposals
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                            {error}
                        </p>
                    </div>
                ) : proposals.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50">
                            <BriefcaseBusiness
                                size={26}
                                className="text-ndi-forest"
                            />
                        </div>

                        <h2 className="mt-4 text-xl font-extrabold text-slate-900">
                            No proposals yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            You haven't submitted any proposals yet. Browse
                            available jobs and apply for one that matches your
                            skills.
                        </p>

                        <Link
                            to="/available-jobs"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ndi-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-ndi-forest-dark"
                        >
                            Find available jobs
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {proposals.map((proposal) => (
                            <article
                                key={proposal.id}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                            >
                                {/* Top */}
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-xl font-extrabold text-slate-950">
                                                {proposal.title}
                                            </h2>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(
                                                    proposal.status,
                                                )}`}
                                            >
                                                {formatStatus(
                                                    proposal.status,
                                                )}
                                            </span>
                                        </div>

                                        {proposal.service_name && (
                                            <p className="mt-1 text-sm font-semibold text-ndi-forest">
                                                {proposal.service_name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="rounded-xl bg-slate-50 px-5 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Your proposal
                                        </p>

                                        <p className="mt-1 text-lg font-extrabold text-slate-950">
                                            {formatAmount(
                                                proposal.proposed_amount,
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Job info */}
                                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-sm text-slate-500">
                                    <span className="inline-flex items-center gap-2">
                                        <MapPin
                                            size={16}
                                            className="text-ndi-forest"
                                        />
                                        {proposal.location ||
                                            "Location not specified"}
                                    </span>

                                    <span className="inline-flex items-center gap-2">
                                        <Clock3
                                            size={16}
                                            className="text-ndi-orange"
                                        />
                                        {proposal.estimated_duration ||
                                            "Duration not specified"}
                                    </span>

                                    <span className="inline-flex items-center gap-2">
                                        <CalendarDays
                                            size={16}
                                            className="text-slate-400"
                                        />
                                        Submitted{" "}
                                        {formatDate(proposal.created_at)}
                                    </span>
                                </div>

                                {/* Message */}
                                <div className="mt-5 rounded-xl bg-slate-50 p-5">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                        Your message
                                    </p>

                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                        {proposal.message}
                                    </p>
                                </div>

                                {/* Action */}
{/* Proposal status message */}
{proposal.status === "accepted" && (
    <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={18} />
            Your proposal was accepted by the customer.
        </div>

        <p className="mt-1 text-sm leading-6 text-emerald-700/80">
            You have been selected for this job.
        </p>
    </div>
)}

{proposal.status === "rejected" && (
    <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
        <div className="text-sm font-bold text-red-700">
            Your proposal was not selected.
        </div>

        <p className="mt-1 text-sm leading-6 text-red-700/80">
            The customer selected another proposal for this job.
        </p>
    </div>
)}

{proposal.status === "pending" && (
    <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
        <div className="text-sm font-bold text-amber-700">
            Your proposal is awaiting review.
        </div>

        <p className="mt-1 text-sm leading-6 text-amber-700/80">
            The customer has not made a decision yet.
        </p>
    </div>
)}

{/* Action */}
<div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
    <Link
        to={`/worker-jobs/${proposal.job_id}`}
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
            </section>
        </DashboardLayout>
    );
}

export default WorkerProposals;