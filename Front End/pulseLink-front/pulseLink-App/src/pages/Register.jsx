
import { Link } from "react-router-dom";

function Register() {
  return (
    <main className="auth-page">
      <section className="auth-card register-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">♡</span>
          <span>PulseLink</span>
        </Link>

        <div className="auth-heading">
          <span className="section-label">JOIN OUR COMMUNITY</span>
          <h1>How would you like to join?</h1>
          <p>
            Every connection can make a difference.
            Choose the account that suits your needs.
          </p>
        </div>

        <div className="role-options">
          <Link
            to="/register/donor"
            className="role-option"
          >
            <span className="role-symbol">♡</span>
            <strong>Become a donor</strong>
            <small>
              Register as a blood donor and help someone in need.
            </small>
            <span>Donor registration →</span>
          </Link>

          <Link
            to="/register/requester"
            className="role-option"
          >
            <span className="role-symbol">⌕</span>
            <strong>Find a donor</strong>
            <small>
              Create an account to find suitable blood donors.
            </small>
            <span>Requester registration →</span>
          </Link>
        </div>

        <p className="auth-switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
