import { useState } from "react";
import { Send, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function ProposalForm({ jobId, onSuccess, onCancel }) {
    const { token } = useAuth();

    const [message, setMessage] = useState("");
    const [proposedAmount, setProposedAmount] = useState("");
    const [estimatedDuration, setEstimatedDuration] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        if (!message.trim()) {
            setError("Please enter a message for the customer.");
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/proposals/jobs/${jobId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: message.trim(),
                        proposedAmount:
                            proposedAmount.trim() === ""
                                ? null
                                : proposedAmount,
                        estimatedDuration:
                            estimatedDuration.trim() === ""
                                ? null
                                : estimatedDuration.trim(),
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to submit proposal.",
                );
            }

            onSuccess(data.proposal);
        } catch (error) {
            console.error("Submit proposal error:", error);

            setError(
                error.message || "Unable to submit proposal.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-extrabold text-slate-950">
                        Submit your proposal
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        Tell the customer why you are suitable for this job
                        and provide your proposed price.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onCancel}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900"
                >
                    <X size={17} />
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-5 space-y-4"
            >
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                )}

                {/* Message */}
                <div>
                    <label
                        htmlFor="proposal-message"
                        className="text-sm font-bold text-slate-800"
                    >
                        Proposal message
                    </label>

                    <textarea
                        id="proposal-message"
                        value={message}
                        onChange={(event) =>
                            setMessage(event.target.value)
                        }
                        rows={5}
                        placeholder="Explain your experience and how you will handle this job..."
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-ndi-forest focus:ring-2 focus:ring-ndi-forest/10"
                    />
                </div>

                {/* Proposed amount */}
                <div>
                    <label
                        htmlFor="proposal-amount"
                        className="text-sm font-bold text-slate-800"
                    >
                        Your proposed amount
                    </label>

                    <div className="relative mt-2">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                            ₦
                        </span>

                        <input
                            id="proposal-amount"
                            type="number"
                            min="0"
                            value={proposedAmount}
                            onChange={(event) =>
                                setProposedAmount(event.target.value)
                            }
                            placeholder="5000"
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-ndi-forest focus:ring-2 focus:ring-ndi-forest/10"
                        />
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                        Leave blank if you want to discuss the price with
                        the customer.
                    </p>
                </div>

                {/* Duration */}
                <div>
                    <label
                        htmlFor="proposal-duration"
                        className="text-sm font-bold text-slate-800"
                    >
                        Estimated duration
                    </label>

                    <input
                        id="proposal-duration"
                        type="text"
                        value={estimatedDuration}
                        onChange={(event) =>
                            setEstimatedDuration(event.target.value)
                        }
                        placeholder="e.g. 2 hours, 1 day"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-ndi-forest focus:ring-2 focus:ring-ndi-forest/10"
                    />
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ndi-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-ndi-forest-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Send size={17} />

                        {submitting
                            ? "Submitting..."
                            : "Submit proposal"}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProposalForm;