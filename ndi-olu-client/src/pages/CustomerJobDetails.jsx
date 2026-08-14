import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Mail,
    MapPin,
    Phone,
    User,
    XCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";

function CustomerJobDetails() {
    const { jobId } = useParams();
    const { token } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [proposals, setProposals] = useState([]);
    const [proposalsLoading, setProposalsLoading] = useState(true);
    const [proposalsError, setProposalsError] = useState("");
    const [completing, setCompleting] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewMessage, setReviewMessage] = useState("");

    useEffect(() => {
        async function loadJob() {
            if (!token || !jobId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/jobs/${jobId}`,
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
                        data.message || "Unable to load this job.",
                    );
                }

                setJob(data.job);
            } catch (error) {
                console.error("Job details error:", error);

                setError(
                    error.message || "Unable to load this job.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadJob();
    }, [token, jobId]);

    useEffect(() => {
        async function loadProposals() {
            if (!token || !jobId) {
                setProposalsLoading(false);
                return;
            }

            try {
                setProposalsLoading(true);
                setProposalsError("");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/proposals/customer/jobs/${jobId}`,
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
                        data.message || "Unable to load job proposals.",
                    );
                }

                setProposals(data.proposals || []);
            } catch (error) {
                console.error("Job proposals error:", error);

                setProposalsError(
                    error.message || "Unable to load job proposals.",
                );
            } finally {
                setProposalsLoading(false);
            }
        }

        loadProposals();
    }, [token, jobId]);

    function formatDate(dateString) {
        if (!dateString) return "—";

        return new Date(dateString).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    function formatTiming(timing) {
        const labels = {
            today: "As soon as possible",
            "this-week": "This week",
            flexible: "Flexible",
        };

        return labels[timing] || timing || "Flexible";
    }

    function formatBudget() {
        if (!job) return "—";

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

    async function handleAcceptProposal(proposalId) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/proposals/customer/${proposalId}/accept`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            const data = await response.json();

            console.log("Accept proposal response:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to accept proposal.",
                );
            }

            // Update proposals immediately
            setProposals((currentProposals) =>
                currentProposals.map((proposal) => {
                    if (proposal.id === proposalId) {
                        return {
                            ...proposal,
                            status: "accepted",
                        };
                    }

                    // Backend rejects all other pending proposals
                    if (proposal.status === "pending") {
                        return {
                            ...proposal,
                            status: "rejected",
                        };
                    }

                    return proposal;
                }),
            );

            // Update job status in the page
            setJob((currentJob) => ({
                ...currentJob,
                status: "in_progress",
            }));

        } catch (error) {
            console.error("Accept proposal error:", error);

            alert(
                error.message || "Unable to accept this proposal.",
            );
        }
    }

    function formatProposalAmount(amount) {
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

    function formatProposalStatus(status) {
        const labels = {
            pending: "Pending review",
            accepted: "Accepted",
            rejected: "Rejected",
            withdrawn: "Withdrawn",
        };

        return labels[status] || status || "Pending review";
    }

    function getProposalStatusClasses(status) {
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

    async function rejectProposal(proposalId) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/proposals/customer/${proposalId}/reject`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to reject this proposal.",
                );
            }

            // Update the proposal immediately in the UI
            setProposals((currentProposals) =>
                currentProposals.map((proposal) =>
                    proposal.id === proposalId
                        ? {
                            ...proposal,
                            status: "rejected",
                        }
                        : proposal,
                ),
            );
        } catch (error) {
            console.error("Reject proposal error:", error);

            alert(
                error.message ||
                "Unable to reject this proposal.",
            );
        }
    }

    async function completeJob() {
        try {
            setCompleting(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}/complete`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to mark this job complete.");
            setJob((current) => ({ ...current, status: "completed" }));
        } catch (completionError) {
            alert(completionError.message);
        } finally {
            setCompleting(false);
        }
    }

    async function submitReview(event) {
        event.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/jobs/${jobId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to save your review.");
            setReviewMessage("Thanks — your review has been saved.");
        } catch (reviewError) {
            setReviewMessage(reviewError.message);
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
                    <BriefcaseBusiness
                        size={30}
                        className="mx-auto animate-pulse text-slate-400"
                    />

                    <h2 className="mt-4 font-bold text-slate-900">
                        Loading job...
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Please wait while we retrieve the job details.
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-20 text-center">
                    <BriefcaseBusiness
                        size={30}
                        className="mx-auto text-red-500"
                    />

                    <h2 className="mt-4 font-bold text-slate-900">
                        Unable to load job
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                        {error}
                    </p>

                    <Link
                        to="/customer-jobs"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ndi-forest px-5 py-3 text-sm font-bold text-white"
                    >
                        <ArrowLeft size={17} />
                        Back to my jobs
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    if (!job) {
        return null;
    }



    return (
        <DashboardLayout>
            {/* Header */}
            <section>
                <Link
                    to="/customer-jobs"
                    className="inline-flex items-center gap-2 text-sm font-bold text-ndi-forest transition hover:text-ndi-orange"
                >
                    <ArrowLeft size={16} />
                    Back to my jobs
                </Link>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-ndi-orange">
                            JOB DETAILS
                        </p>

                        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                            {job.title}
                        </h1>

                        {job.service_name && (
                            <p className="mt-2 font-semibold text-ndi-forest">
                                {job.service_name}
                            </p>
                        )}
                    </div>

                    <span
                        className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-bold ${getStatusClasses(
                            job.status,
                        )}`}
                    >
                        {formatStatus(job.status)}
                    </span>
                </div>
            </section>

            {job.status !== "open" && proposals.find((proposal) => proposal.status === "accepted") && (
                <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
                    <div>
                        <p className="font-extrabold text-emerald-800">You selected {proposals.find((proposal) => proposal.status === "accepted").worker_name}.</p>
                        <p className="mt-1 text-sm leading-6 text-emerald-700">Use the job conversation to coordinate the work and keep a record of agreements.</p>
                    </div>
                    <Link to={`/messages?jobId=${jobId}`} className="mt-4 inline-flex w-fit rounded-xl bg-ndi-forest px-4 py-2.5 text-sm font-bold text-white hover:bg-ndi-forest-dark sm:mt-0">Message worker</Link>
                </section>
            )}

            {job.status === "in_progress" && (
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
                    <div><h2 className="font-extrabold text-slate-950">Work completed?</h2><p className="mt-1 text-sm leading-6 text-slate-500">Mark this job complete once you are satisfied with the work.</p></div>
                    <button type="button" onClick={completeJob} disabled={completing} className="mt-4 rounded-xl bg-ndi-forest px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 sm:mt-0">{completing ? "Marking complete..." : "Mark work complete"}</button>
                </section>
            )}

            {job.status === "completed" && (
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-extrabold text-slate-950">Rate the completed work</h2>
                    {reviewMessage ? <p className="mt-3 text-sm font-semibold text-emerald-700">{reviewMessage}</p> : <form onSubmit={submitReview} className="mt-4 space-y-4"><label className="block text-sm font-bold text-slate-700">Rating <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))} className="ml-3 rounded-lg border border-slate-200 px-3 py-2">{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}</select></label><textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Share a short review (optional)" className="min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-ndi-forest" /><button type="submit" className="rounded-xl bg-ndi-forest px-4 py-2.5 text-sm font-bold text-white">Submit review</button></form>}
                </section>
            )}

            {/* Main content */}
            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Description */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-extrabold text-slate-950">
                            Description
                        </h2>

                        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                            {job.description}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-extrabold text-slate-950">
                            Location
                        </h2>

                        <div className="mt-5 flex items-start gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-ndi-forest">
                                <MapPin size={19} />
                            </span>

                            <div>
                                <p className="font-bold text-slate-900">
                                    {job.location}
                                </p>

                                {job.address_note && (
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        {job.address_note}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <aside>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-6">
                        <h2 className="text-lg font-extrabold text-slate-950">
                            Job summary
                        </h2>

                        <div className="mt-5 space-y-5">
                            <div className="flex items-start gap-3">
                                <Clock3
                                    size={18}
                                    className="mt-0.5 text-ndi-orange"
                                />

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Timing
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {formatTiming(job.timing)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <BriefcaseBusiness
                                    size={18}
                                    className="mt-0.5 text-ndi-forest"
                                />

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Budget
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {formatBudget()}
                                    </p>

                                    {job.budget_type !== "discuss" && (
                                        <p className="mt-1 text-xs capitalize text-slate-500">
                                            {job.budget_type} pricing
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CalendarDays
                                    size={18}
                                    className="mt-0.5 text-slate-400"
                                />

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Posted
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {formatDate(job.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </section>

            {/* Workers who applied */}
            <section className="mt-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-950">
                            Workers who applied
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Review professionals who submitted proposals for this job.
                        </p>
                    </div>

                    {!proposalsLoading && (
                        <span className="text-sm font-semibold text-slate-500">
                            {proposals.length}{" "}
                            {proposals.length === 1 ? "proposal" : "proposals"}
                        </span>
                    )}
                </div>

                <div className="mt-5">
                    {proposalsLoading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
                            <BriefcaseBusiness
                                size={30}
                                className="mx-auto animate-pulse text-slate-400"
                            />

                            <h3 className="mt-4 font-bold text-slate-900">
                                Loading proposals...
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                We're finding workers who applied to this job.
                            </p>
                        </div>
                    ) : proposalsError ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center">
                            <XCircle
                                size={30}
                                className="mx-auto text-red-500"
                            />

                            <h3 className="mt-4 font-bold text-slate-900">
                                Unable to load proposals
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                                {proposalsError}
                            </p>
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
                            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-50">
                                <User
                                    size={26}
                                    className="text-slate-400"
                                />
                            </div>

                            <h3 className="mt-4 font-bold text-slate-900">
                                No workers have applied yet
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                When professionals submit proposals for this job,
                                you'll be able to review them here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {proposals.map((proposal) => (
                                <article
                                    key={proposal.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                                >
                                    {/* Worker header */}
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-ndi-forest">
                                                <User size={25} />
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-lg font-extrabold text-slate-950">
                                                        {proposal.worker_name ||
                                                            "Professional"}
                                                    </h3>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold ${getProposalStatusClasses(
                                                            proposal.status,
                                                        )}`}
                                                    >
                                                        {formatProposalStatus(
                                                            proposal.status,
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Professional who applied for this job
                                                </p>
                                            </div>
                                        </div>

                                        {/* Proposed amount */}
                                        <div className="rounded-xl bg-slate-50 px-5 py-3 lg:min-w-[170px]">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Proposed amount
                                            </p>

                                            <p className="mt-1 text-xl font-extrabold text-slate-950">
                                                {formatProposalAmount(
                                                    proposal.proposed_amount,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Contact information */}
                                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-100 pt-5">
                                        {proposal.worker_phone && (
                                            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                                                <Phone
                                                    size={15}
                                                    className="text-ndi-forest"
                                                />

                                                {proposal.worker_phone}
                                            </span>
                                        )}

                                        {proposal.worker_email && (
                                            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                                                <Mail
                                                    size={15}
                                                    className="text-ndi-forest"
                                                />

                                                {proposal.worker_email}
                                            </span>
                                        )}

                                        {proposal.estimated_duration && (
                                            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                                                <Clock3
                                                    size={15}
                                                    className="text-ndi-orange"
                                                />

                                                {proposal.estimated_duration}
                                            </span>
                                        )}
                                    </div>

                                    {/* Proposal message */}
                                    <div className="mt-5 rounded-xl bg-slate-50 p-5">
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Proposal
                                        </p>

                                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                                            {proposal.message ||
                                                "The worker did not include a message with this proposal."}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    {proposal.status === "pending" && (
                                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                            <button
                                                type="button"
                                                onClick={() => rejectProposal(proposal.id)}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                                            >
                                                <XCircle size={17} />
                                                Reject
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleAcceptProposal(proposal.id)}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ndi-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-ndi-forest-dark"
                                            >
                                                <CheckCircle2 size={17} />
                                                Accept proposal
                                            </button>
                                        </div>
                                    )}

                                    {proposal.status === "accepted" && (
                                        <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                                                <CheckCircle2 size={17} />
                                                This worker has been selected for this job.
                                            </div>
                                        </div>
                                    )}

                                    {proposal.status === "rejected" && (
                                        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
                                            <div className="flex items-center gap-2 text-sm font-bold text-red-700">
                                                <XCircle size={17} />
                                                This proposal was rejected.
                                            </div>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

        </DashboardLayout>
    );
}

export default CustomerJobDetails;
