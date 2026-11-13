
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.detail ||
          "Invalid email or password."
        );
      }

      if (data.role === "DONOR" && data.donorId) {
  sessionStorage.setItem("pulseLinkDonorId", data.donorId);
  navigate("/donor-dashboard");
} else if (data.role === "REQUESTER") {
  navigate("/requester-dashboard");
} else {
  setError("Unable to identify your profile.");
}
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Check CORS and ensure Spring Boot is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">♡</span>
          <span>PulseLink</span>
        </Link>

        <div className="auth-heading">
          <span className="section-label">WELCOME BACK</span>
          <h1>Welcome back.</h1>
          <p>Log in to continue with PulseLink.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="form-message" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button auth-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          New to PulseLink?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
