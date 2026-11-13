
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function RegisterDonor() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !phone.trim() ||
      !bloodGroup ||
      !city.trim()
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
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
            role: "DONOR",
            phone: phone.trim(),
            bloodGroup,
            city: city.trim(),
          }),
        }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Registration failed.");
      }

      navigate("/login", {
        state: { message: "Donor registration successful. Please log in." },
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
          <span className="section-label">DONOR COMMUNITY</span>
          <h1>Become a donor.</h1>
          <p>
            Create your account to help connect people
            with potential blood donors.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="donor-name">Full name</label>
            <input
              id="donor-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="donor-email">Email address</label>
            <input
              id="donor-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="donor-phone">Phone number</label>
            <input
              id="donor-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              autoComplete="tel"
              placeholder="10-digit phone number"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="donor-blood">Blood group</label>
            <select
              id="donor-blood"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              required
            >
              <option value="">Select blood group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                (group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="donor-city">City</label>
            <input
              id="donor-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
              placeholder="Enter your city"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="donor-password">Password</label>
            <input
              id="donor-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="donor-confirm">Confirm password</label>
            <input
              id="donor-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Enter your password again"
              required
            />
          </div>

          <p className="privacy-hint">
            Your contact details should only be shared with
            authorized users when permitted by the platform's
            privacy rules.
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
            {loading ? "Creating account..." : "Register as donor"}
          </button>
        </form>

        <p className="auth-switch">
          Want to request blood?{" "}
          <Link to="/register/requester">Register as requester</Link>
        </p>

        <p className="auth-switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterDonor;
