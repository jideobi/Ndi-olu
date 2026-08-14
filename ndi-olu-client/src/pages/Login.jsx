import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { CheckCircle2, LogIn } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import AuthLayout from "../components/layout/AuthLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const role =
        searchParams.get("role") === "worker" ? "worker" : "customer";

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setMessage("");
        setLoading(true);

        const formData = new FormData(event.currentTarget);

        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            // Save JWT
            login(data);

            setMessage("Login successful. Welcome back!");

            // Give the user a moment to see the success message
            setTimeout(() => {
                navigate(
                    data.user?.role === "worker"
                        ? "/worker-profile"
                        : "/customer-dashboard",
                );
            }, 500);
        } catch (error) {
            console.error("Login error:", error);

            setError(error.message || "Unable to login. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSuccess(credentialResponse) {
        setError("");
        setMessage("");
        setLoading(true);

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
                        role,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Google login failed.");
            }

            login(data);

            setMessage("Google login successful. Welcome back!");

            setTimeout(() => {
                navigate(
                    data.user?.role === "worker"
                        ? "/worker-profile"
                        : "/customer-dashboard",
                );
            }, 500);
        } catch (error) {
            console.error("Google login error:", error);

            setError(
                error.message || "Unable to continue with Google.",
            );
        } finally {
            setLoading(false);
        }
    }

    function handleGoogleError() {
        setLoading(false);
        setError("Google login was not completed. Please try again.");
        setMessage("");
    }

    return (
        <AuthLayout
            title="Welcome back to Ndi-Olu"
            description="Sign in to your account to continue."
        >
            {/* Google Login */}
            <div className="mt-2">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                />
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-slate-200" />

                <span className="text-xs font-bold tracking-[0.13em] text-slate-400">
                    OR
                </span>

                <span className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                />

                <div className="flex justify-end">
                    <Link
                        to="/forgot-password"
                        className="text-sm font-semibold text-ndi-forest hover:text-ndi-orange"
                    >
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                >
                    <span className="flex items-center justify-center gap-2">
                        <LogIn size={18} />

                        {loading ? "Signing in..." : "Sign in"}
                    </span>
                </Button>
            </form>

            {/* Error */}
            {error && (
                <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </p>
            )}

            {/* Success */}
            {message && (
                <p className="mt-5 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

                    {message}
                </p>
            )}

            {/* Signup link */}
            <p className="mt-7 text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                    to="/signup"
                    className="font-bold text-ndi-forest hover:text-ndi-orange"
                >
                    Sign up
                </Link>
            </p>
        </AuthLayout>
    );
}

export default Login;
