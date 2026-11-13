
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function RegisterRequester() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            role: "REQUESTER",
          }),
        }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Registration failed.");
      }

      navigate("/login", {
        state: { message: "Registration successful. Please log in." },
      });
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Check the backend and CORS settings."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card register-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">♡</span>
          <span>PulseLink</span>
        </Link>

        <div className="auth-heading">
          <span className="section-label">REQUESTER COMMUNITY</span>
          <h1>Find a donor.</h1>
          <p>
            Create an account to search for suitable donors
            when blood is needed.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="requester-name">Full name</label>
            <input
              id="requester-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="requester-email">Email address</label>
            <input
              id="requester-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="requester-password">Password</label>
            <input
              id="requester-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="requester-confirm">Confirm password</label>
            <input
              id="requester-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Enter your password again"
              required
            />
          </div>

          <p className="privacy-hint">
            Your personal details should be protected and
            shared only as permitted by the platform's privacy rules.
          </p>

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
            {loading ? "Creating account..." : "Create requester account"}
          </button>
        </form>

        <p className="auth-switch">
          Want to donate blood?{" "}
          <Link to="/register/donor">Register as donor</Link>
        </p>

        <p className="auth-switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterRequester;
