import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    Clock3,
    MapPin,
    Wallet,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProposalForm from "../components/workers/ProposalForm";

function WorkerJobDetails() {
    const { id } = useParams();
    const { token } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showProposalForm, setShowProposalForm] = useState(false);
    const [proposalSuccess, setProposalSuccess] = useState("");


    function handleProposalSuccess() {
        setShowProposalForm(false);

        setProposalSuccess(
            "Your proposal has been submitted successfully.",
        );

        setJob((currentJob) => ({
            ...currentJob,
            has_proposal: true,
        }));
    }
    useEffect(() => {
        async function loadJob() {
            if (!token || !id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/worker/jobs/${id}`,
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
                console.error("Worker job details error:", error);

                setError(
                    error.message || "Unable to load this job.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadJob();
    }, [token, id]);

    function formatDate(dateString) {
        if (!dateString) return "—";

        return new Date(dateString).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    function formatBudget() {
        if (!job) return "Not specified";

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

    if (loading) {
        return (
            <DashboardLayout>
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
                        <BriefcaseBusiness
                            size={26}
                            className="animate-pulse text-slate-400"
                        />
                    </div>

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
                <Link
                    to="/available-jobs"
                    className="inline-flex items-center gap-2 text-sm font-bold text-ndi-forest"
                >
                    <ArrowLeft size={16} />
                    Back to available jobs
                </Link>

                <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
                    <h2 className="font-bold text-slate-900">
                        Unable to load job
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                        {error}
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (!job) {
        return (
            <DashboardLayout>
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                    <h2 className="font-bold text-slate-900">
                        Job not found
                    </h2>

                    <Link
                        to="/available-jobs"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ndi-forest px-5 py-3 text-sm font-bold text-white"
                    >
                        <ArrowLeft size={17} />
                        Back to available jobs
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Back */}
            <Link
                to="/available-jobs"
                className="inline-flex items-center gap-2 text-sm font-bold text-ndi-forest transition hover:text-ndi-orange"
            >
                <ArrowLeft size={16} />
                Back to available jobs
            </Link>

            {/* Header */}
            <section className="mt-6">
                <p className="text-sm font-semibold text-ndi-orange">
                    WORKER WORKSPACE
                </p>

                <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                            {job.title}
                        </h1>

                        {job.service_name && (
                            <p className="mt-2 text-base font-bold text-ndi-forest">
                                {job.service_name}
                            </p>
                        )}
                    </div>

                    <div className="rounded-xl bg-slate-50 px-6 py-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Budget
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-slate-950">
                            {formatBudget()}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main content */}
            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
                {/* Job information */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                    <h2 className="text-xl font-extrabold text-slate-950">
                        Job description
                    </h2>

                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                        {job.description || "No description provided."}
                    </p>

                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-400">
                            Job information
                        </h3>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <MapPin
                                    size={20}
                                    className="mt-0.5 text-ndi-forest"
                                />

                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        Location
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {job.location || "Not specified"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock3
                                    size={20}
                                    className="mt-0.5 text-ndi-orange"
                                />

                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        Timing
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {formatTiming(job.timing)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CalendarDays
                                    size={20}
                                    className="mt-0.5 text-slate-400"
                                />

                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        Posted
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {formatDate(job.created_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Wallet
                                    size={20}
                                    className="mt-0.5 text-slate-400"
                                />

                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        Budget
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {formatBudget()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {job.address_note && (
                        <div className="mt-8 rounded-xl bg-slate-50 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Location note
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {job.address_note}
                            </p>
                        </div>
                    )}
                </div>

                {/* Apply card */}
                {/* Apply card */}
                <aside>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-ndi-forest">
                            <BriefcaseBusiness size={22} />
                        </div>

                        <h2 className="mt-5 text-lg font-extrabold text-slate-950">
                            Interested in this job?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Submit a proposal to let the customer know you
                            are available to handle this job.
                        </p>

                        {proposalSuccess && (
                            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                <p className="text-sm font-semibold leading-6 text-emerald-700">
                                    {proposalSuccess}
                                </p>
                            </div>
                        )}

                        {job.has_proposal ? (
                            <div className="mt-6 rounded-xl bg-emerald-50 p-4">
                                <p className="text-sm font-bold text-emerald-700">
                                    Proposal submitted
                                </p>

                                <p className="mt-1 text-xs leading-5 text-emerald-600">
                                    You have already submitted a proposal for this job.
                                    The customer can now review it.
                                </p>
                            </div>
                        ) : showProposalForm ? (
                            <ProposalForm
                                jobId={job.id}
                                onSuccess={handleProposalSuccess}
                                onCancel={() => setShowProposalForm(false)}
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setProposalSuccess("");
                                    setShowProposalForm(true);
                                }}
                                className="mt-6 w-full rounded-xl bg-ndi-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-ndi-forest-dark"
                            >
                                Submit a proposal
                            </button>
                        )}
                    </div>
                </aside>
            </section>
        </DashboardLayout>
    );
}

export default WorkerJobDetails;