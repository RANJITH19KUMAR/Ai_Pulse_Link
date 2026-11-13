
import { useState,useEffect } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:8080";

function RequesterDashboard() {
  const [form, setForm] = useState({
    requesterName: "",
    requesterPhone: "",
    bloodGroup: "",
    city: "",
    unitsRequired: 1,
    hospitalName: "",
  });

  const [requestId, setRequestId] = useState(null);
  const [donors, setDonors] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const [responseStatuses, setResponseStatuses] = useState([]);
const [acceptedDonor, setAcceptedDonor] = useState(null);
  
  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");
    setDonors([]);
    setRequestId(null);
    setRequestSent(false);

    try {
      // Step 1: Create the blood request.
      const response = await fetch(`${API}/blood-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          unitsRequired: Number(form.unitsRequired),
        }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 400
            ? "Please check the details you entered."
            : "Could not create your blood request. Please try again."
        );
      }

      const request = await response.json();
      setRequestId(request.id);

      // Step 2: Find matching donors.
      const matchResponse = await fetch(
        `${API}/blood-requests/${request.id}/matching-donors`
      );

      if (!matchResponse.ok) {
        throw new Error(
          "Your request was created, but matching donors could not be loaded. Please try refreshing the matches."
        );
      }

      const matches = await matchResponse.json();
      setDonors(matches);

      if (matches.length > 0) {
        showMessage(
          `${matches.length} matching donor(s) found. You can now notify them together.`,
          "success"
        );
      } else {
        showMessage(
          "Your request was created, but no matching donors are available right now.",
          "info"
        );
      }
    } catch (err) {
      setError(
        err.message || "Unable to connect to PulseLink. Check your connection."
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendToAllMatchingDonors() {
    if (!requestId || donors.length === 0) {
      showMessage("Create a request and find matching donors first.", "error");
      return;
    }

    if (requestSent) {
      showMessage(
        "You have already sent invitations for this request. Check the request status instead of sending it again.",
        "info"
      );
      return;
    }

    setSending(true);
    setError("");
    setMessage("");

    try {
      /*
       * This endpoint must be added to your Spring Boot backend.
       * It should create invitations for all suitable matching donors.
       */
      const response = await fetch(
        `${API}/blood-requests/${requestId}/send-to-matching-donors`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            "Invitations have already been created for this request. Please check its status."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "The bulk-send API is not available yet. Add the backend endpoint before using this feature."
          );
        }

        throw new Error(
          `Could not send invitations (HTTP ${response.status}). Please try again.`
        );
      }

      const result = await response.json();

      setRequestSent(true);

      const sentCount =
        result.sentCount ??
        result.invitedCount ??
        result.totalSent;

      showMessage(
        typeof sentCount === "number"
          ? `Your request was sent to ${sentCount} matching donor(s). You will see responses as they arrive.`
          : "Your request was sent to matching donors. You will see responses as they arrive.",
        "success"
      );
    } catch (err) {
      setError(
        err.message || "Unable to send invitations. Please try again."
      );
    } finally {
      setSending(false);
    }
  }
  
useEffect(() => {
  if (!requestId || !requestSent) {
    return;
  }

  let cancelled = false;

  async function checkResponses() {
    try {
      const response = await fetch(
        `${API}/blood-requests/${requestId}/responses`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (cancelled) {
        return;
      }

      setResponseStatuses(data);

      const accepted = data.find(
        (item) =>
          item.responseStatus?.toUpperCase() === "ACCEPTED"
      );

      setAcceptedDonor(accepted || null);

      if (accepted) {
        showMessage(
          `${accepted.donorName || "A donor"} has accepted your request.`,
          "success"
        );
      }
    } catch (err) {
      console.error("Could not refresh donor responses:", err);
    }
  }

  checkResponses();

  const intervalId = setInterval(checkResponses, 5000);

  return () => {
    cancelled = true;
    clearInterval(intervalId);
  };
}, [requestId, requestSent]);


  return (
    <main className="auth-page dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <Link to="/" className="auth-brand">
            <span className="auth-brand-icon">♡</span>
            <span>PulseLink</span>
          </Link>

          <span className="section-label">REQUESTER DASHBOARD</span>
        </header>

        <div className="auth-heading">
          <span className="section-label">FIND A DONOR</span>
          <h1>Request blood.</h1>
          <p>
            Share the required details to find and notify suitable donors.
          </p>
        </div>

        <form className="dashboard-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="requesterName">Your name</label>
            <input
              id="requesterName"
              name="requesterName"
              value={form.requesterName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="requesterPhone">Your phone number</label>
            <input
              id="requesterPhone"
              name="requesterPhone"
              type="tel"
              value={form.requesterPhone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="bloodGroup">Required blood group</label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
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
            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="unitsRequired">Units required</label>
            <input
              id="unitsRequired"
              name="unitsRequired"
              type="number"
              min="1"
              max="20"
              value={form.unitsRequired}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="hospitalName">Hospital name</label>
            <input
              id="hospitalName"
              name="hospitalName"
              value={form.hospitalName}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="button auth-submit"
            type="submit"
            disabled={loading || sending}
          >
            {loading ? "Finding donors..." : "Find Matching Donors"}
          </button>
        </form>

        {message && (
          <div
            className={`request-message request-message-${messageType}`}
            role="status"
            aria-live="polite"
          >
            {message}
          </div>
        )}

        {error && (
          <div className="request-message request-message-error" role="alert">
            {error}
          </div>
        )}

        {donors.length > 0 && (
          <section className="matching-section">
            <div className="auth-heading">
              <span className="section-label">YOUR MATCHES</span>
              <h2>Matching donors</h2>
              <p>
                Review available matches. Contact details remain private until
                the required acceptance and authorization checks are completed.
              </p>
            </div>

            <div className="matching-grid">
              {donors.map((donor) => (
                <article className="matching-card" key={donor.id}>
                  <div className="donor-card-top">
                    <span className="blood-group-badge">
                      {donor.bloodGroup}
                    </span>

                    <span className="availability-label">
                      {donor.available === false
                        ? "Unavailable"
                        : "Available"}
                    </span>
                  </div>

                  <div className="donor-avatar" aria-hidden="true">
                    {donor.name?.trim()?.charAt(0)?.toUpperCase() || "D"}
                  </div>

                  <h3>{donor.name}</h3>
                  <p className="donor-city">{donor.city}</p>

                  <div className="donor-card-details">
                    <span>
                      <span aria-hidden="true">●</span> Blood group match
                    </span>
                    <span>
                      <span aria-hidden="true">🔒</span> Contact protected
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div className="bulk-request-panel">
              <div>
                <h3>Notify matching donors</h3>
                <p>
                  Send this request to all suitable matches in one step instead
                  of contacting each donor separately.
                </p>
              </div>
{/* Display donor response statuses */}
{requestSent && (
  <div className="response-section">
    <h3>Donor Response Statuses</h3>

    {responseStatuses.length === 0 ? (
      <p>Waiting for donor responses...</p>
    ) : (
      responseStatuses.map((item) => (
        <div key={item.responseId} className="response-card">

          <p>
            <strong>Status:</strong>{" "}
            {item.responseStatus}
          </p>

          {item.responseStatus?.toUpperCase() === "ACCEPTED" && (
            <div>
              <p>
                <strong>Donor Name:</strong> {item.donorName}
              </p>
              <p>
                <strong>Donor Phone:</strong> {item.donorPhone}
              </p>
            </div>
          )}
        </div>
      ))
    )}
  </div>
)}
              <button
                type="button"
                className="button auth-submit"
                onClick={sendToAllMatchingDonors}
                disabled={sending || requestSent}
              >
                {sending
                  ? "Sending invitations..."
                  : requestSent
                    ? "Invitations Sent"
                    : "Send to All Matching Donors"}
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default RequesterDashboard;