import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { CheckCircle2, UserRound, Wrench } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";


function SignUp() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(
    searchParams.get("role") === "worker" ? "worker" : "client",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName,
            email,
            phone,
            password,
            role: role === "worker" ? "worker" : "customer",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create your account.",
        );
      }

      console.log("Registration successful:", data);

      setMessage(
        `Your ${role === "worker" ? "worker" : "customer"
        } account has been created successfully.`,
      );

      // Next step:
      // save token through AuthContext
      // redirect user

    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.message || "Unable to create your account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
            role: role === "worker" ? "worker" : "customer",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Google sign-up failed.",
        );
      }

      console.log("Google authentication successful:", data);

      setMessage("Google account connected successfully.");

      // Next step:
      // save token through AuthContext
      // redirect user

    } catch (error) {
      console.error("Google authentication error:", error);

      setError(
        error.message || "Unable to continue with Google.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleError() {
    setError("Google sign-up was not completed. Please try again.");
    setMessage("");
  }

  return (
    <AuthLayout
      title="Create your Ndi-Olu account"
      description="Choose how you want to use Ndi-Olu. You can complete your profile after creating your account."
    >
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("client")}
          className={`rounded-ndi-card border p-4 text-left transition ${role === "client"
            ? "border-ndi-forest bg-emerald-50 ring-2 ring-emerald-100"
            : "border-slate-200 bg-white hover:border-emerald-300"
            }`}
        >
          <UserRound size={22} className="text-ndi-forest" />
          <p className="mt-4 font-bold">I need a worker</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Post jobs and hire professionals.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setRole("worker")}
          className={`rounded-ndi-card border p-4 text-left transition ${role === "worker"
            ? "border-ndi-forest bg-emerald-50 ring-2 ring-emerald-100"
            : "border-slate-200 bg-white hover:border-emerald-300"
            }`}
        >
          <Wrench size={22} className="text-ndi-forest" />
          <p className="mt-4 font-bold">I am a worker</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Build a profile and find jobs.
          </p>
        </button>
      </div>

      <div className="mt-6">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}

        />
      </div>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-bold tracking-[0.13em] text-slate-400">
          OR
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="hidden" name="role" value={role} />

        <Input
          id="full-name"
          name="fullName"
          label="Full name"
          placeholder="Enter your full name"
          autoComplete="name"
          required
        />

        <Input
          id="email"
          name="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <Input
          id="phone"
          name="phone"
          label="Nigerian phone number"
          type="tel"
          placeholder="0801 234 5678"
          autoComplete="tel"
          required
        />

        <Input
          id="password"
          name="password"
          label="Create a password"
          type="password"
          placeholder="At least 8 characters"
          minLength="8"
          autoComplete="new-password"
          required
        />

        <Input
          id="confirm-password"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Enter your password again"
          minLength="8"
          autoComplete="new-password"
          required
        />

        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
          <input
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-slate-300 text-ndi-forest focus:ring-ndi-forest"
          />
          <span>
            I agree to Ndi-Olu’s Terms of Service and Privacy Policy.
          </span>
        </label>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      {error && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-5 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          {message}
        </p>
      )}

      <p className="mt-7 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-ndi-forest hover:text-ndi-orange">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default SignUp;