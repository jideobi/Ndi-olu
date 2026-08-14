import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, token, loading: authLoading } = useAuth();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingWorkerId, setApprovingWorkerId] = useState(null);

  async function fetchPendingWorkers() {
    if (!token) {
      setError("Authentication token not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/workers/pending`,
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
          data.message || "Unable to retrieve pending workers.",
        );
      }

      setWorkers(data.workers || []);
    } catch (error) {
      console.error("Fetch pending workers error:", error);

      setError(
        error.message || "Unable to retrieve pending workers.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && token && user?.role === "admin") {
      fetchPendingWorkers();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, token, user]);

  async function handleApprove(workerId) {
    try {
      setApprovingWorkerId(workerId);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/workers/${workerId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to approve worker.",
        );
      }

      // Remove the approved worker from the pending list
      setWorkers((currentWorkers) =>
        currentWorkers.filter(
          (worker) => worker.user_id !== workerId,
        ),
      );
    } catch (error) {
      console.error("Approve worker error:", error);

      setError(
        error.message || "Unable to approve worker.",
      );
    } finally {
      setApprovingWorkerId(null);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Access Denied
          </h1>

          <p className="mt-2 text-slate-600">
            You must be an administrator to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}

        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-600">
            ADMINISTRATION
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Review and approve workers waiting for verification.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* Pending workers */}

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Pending Worker Approvals
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Workers waiting for admin approval.
                </p>
              </div>

              <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                {workers.length} Pending
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-500">
                Loading pending workers...
              </p>
            </div>
          ) : workers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="text-2xl">✓</span>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No pending workers
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                All worker registrations have been reviewed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {workers.map((worker) => (
                <div
                  key={worker.user_id}
                  className="flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between"
                >
                  {/* Worker information */}

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {worker.full_name}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <p>
                        <span className="font-medium">
                          Email:
                        </span>{" "}
                        {worker.email}
                      </p>

                      <p>
                        <span className="font-medium">
                          Phone:
                        </span>{" "}
                        {worker.phone || "Not provided"}
                      </p>

                      <p>
                        <span className="font-medium">
                          Registered:
                        </span>{" "}
                        {new Date(
                          worker.created_at,
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-3">
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        Awaiting Approval
                      </span>
                    </div>
                  </div>

                  {/* Approve button */}

                  <button
                    type="button"
                    onClick={() =>
                      handleApprove(worker.user_id)
                    }
                    disabled={
                      approvingWorkerId === worker.user_id
                    }
                    className="rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {approvingWorkerId === worker.user_id
                      ? "Approving..."
                      : "Approve Worker"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;