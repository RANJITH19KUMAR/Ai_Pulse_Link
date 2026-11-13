
import { useCallback, useEffect, useState } from "react";
import DonorEligibilityChatbot from "../components/DonorEligibilityChatbot";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

function DonorDashboard() {
  const navigate = useNavigate();

  const [donor, setDonor] = useState(null);
  const [available, setAvailable] = useState(true);
  const [requests, setRequests] = useState([]);
  const [activeScreeningRequest, setActiveScreeningRequest] =
  useState(null);

const [screeningResult, setScreeningResult] = useState(null);
const [confirmingRequestId, setConfirmingRequestId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [respondingId, setRespondingId] = useState(null);

  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [message, setMessage] = useState("");

  const donorId = sessionStorage.getItem("pulseLinkDonorId");

  // Load the logged-in donor's profile.
  const loadDonor = useCallback(async () => {
    const response = await fetch(
      `${API_BASE}/donors/${donorId}`
    );

    if (!response.ok) {
      throw new Error("Could not load your donor profile.");
    }

    const data = await response.json();

    setDonor(data);
    setAvailable(Boolean(data.available));
  }, [donorId]);

  // Load real requests assigned to this donor.
  const loadIncomingRequests = useCallback(async () => {
    setRequestsLoading(true);
    setRequestError("");

    try {
      const response = await fetch(
        `${API_BASE}/donors/${donorId}/incoming-requests`
      );

      if (!response.ok) {
        throw new Error("Could not load incoming requests.");
      }

      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setRequestError(
        err.message || "Unable to load incoming requests."
      );
    } finally {
      setRequestsLoading(false);
    }
  }, [donorId]);

  useEffect(() => {
    if (!donorId) {
      navigate("/login");
      return;
    }

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        await loadDonor();
        await loadIncomingRequests();
      } catch (err) {
        setError(
          err.message ||
            "Unable to connect to the backend. Check Spring Boot."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [donorId, navigate, loadDonor, loadIncomingRequests]);

  // Update the donor's availability in the backend.
  async function handleAvailabilityChange() {
    const newAvailability = !available;

    setSavingAvailability(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/donors/${donorId}/availability?available=${newAvailability}`,
        { method: "PATCH" }
      );

      if (!response.ok) {
        throw new Error("Could not update availability.");
      }

      const updatedDonor = await response.json();

      setDonor(updatedDonor);
      setAvailable(Boolean(updatedDonor.available));
      setMessage("Your availability has been updated.");
    } catch (err) {
      setError(err.message || "Unable to update availability.");
    } finally {
      setSavingAvailability(false);
    }
  }

  // Accept or decline a request already assigned to this donor.
  
async function handleResponse(request, decision) {
  // First Accept click: open screening without accepting the request.
  if (decision === "ACCEPTED") {
    setActiveScreeningRequest(request);
    setScreeningResult(null);
    setMessage("");
    setRequestError("");
    return;
  }

  // Decline request through the existing backend API.
  setRespondingId(request.bloodRequestId);
  setRequestError("");
  setMessage("");

  try {
    const response = await fetch(
      `${API_BASE}/blood-requests/${request.bloodRequestId}/responses?donorId=${donorId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responseStatus: decision,
        }),
      }
    );

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(
        responseText ||
          `Unable to ${decision.toLowerCase()} this request.`
      );
    }

    setMessage("Request declined.");
    await loadIncomingRequests();
  } catch (err) {
    setRequestError(
      err.message || "Unable to submit your response."
    );
  } finally {
    setRespondingId(null);
  }
}

async function handleConfirmAcceptance(request) {
  setConfirmingRequestId(request.bloodRequestId);
  setRequestError("");
  setMessage("");

  try {
    const response = await fetch(
      `${API_BASE}/blood-requests/${request.bloodRequestId}/responses?donorId=${donorId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responseStatus: "ACCEPTED",
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Could not confirm acceptance.");
    }

    setMessage("Request acceptance confirmed.");
    setScreeningResult(null);
    await loadIncomingRequests();
  } catch (err) {
    setRequestError(err.message || "Could not confirm acceptance.");
  } finally {
    setConfirmingRequestId(null);
  }
}


  async function handleRefresh() {
    setMessage("");
    await loadIncomingRequests();
  }

  function handleLogout() {
    sessionStorage.removeItem("pulseLinkDonorId");
    navigate("/login");
  }

  if (loading) {
    return (
      <main className="auth-page dashboard-page">
        <div className="dashboard-shell">
          <p className="dashboard-loading">
            Loading your donor dashboard...
          </p>
        </div>
      </main>
    );
  }

  
if (activeScreeningRequest) {
  return (
    <main className="auth-page dashboard-page">
      <div className="dashboard-shell">
        <DonorEligibilityChatbot
          donorId={Number(donorId)}
          bloodRequestId={activeScreeningRequest.bloodRequestId}
         onComplete={async (result) => {
  setScreeningResult(result);

  const screening = result.screening || result;

  if (screening.status === "AWAITING_MEDICAL_APPROVAL") {
    setActiveScreeningRequest(null);

    // Digital screening passed. Now confirm acceptance.
    await handleConfirmAcceptance(activeScreeningRequest);

  } else if (screening.status === "NEEDS_MEDICAL_REVIEW") {
    setActiveScreeningRequest(null);

    setMessage(
      "Your answers need further attention. Please consult the blood bank before proceeding."
    );
  }
}}
          onCancel={() => {
            setActiveScreeningRequest(null);
          }}
        />
      </div>
    </main>
  );
}

  return (
    <main className="auth-page dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="section-label">PULSELINK · DONOR SPACE</p>
            <h1>Welcome, {donor.name}</h1>
            <p className="dashboard-subtitle">
              Your kindness can help someone get the blood they need.
            </p>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </header>

        {error && (
          <p className="form-message error-message">{error}</p>
        )}

        {message && (
          <p className="form-message success-message">{message}</p>
        )}
        {screeningResult && (
  <p className="privacy-hint">
    Screening status:{" "}
    {screeningResult.screening?.status ||
      screeningResult.status ||
      "Completed"}
  </p>
)}

        <section className="donor-dashboard-grid">
          <article className="dashboard-panel profile-panel">
            <p className="section-label">YOUR PROFILE</p>
            <h2>Donor details</h2>

            <div className="donor-blood-summary">
              <span className="blood-group-badge">
                {donor.bloodGroup}
              </span>
              <div>
                <strong>{donor.name}</strong>
                <p>{donor.city}</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-detail">
                <span>Email</span>
                <strong>{donor.email || "Not provided"}</strong>
              </div>

              <div className="profile-detail">
                <span>Phone</span>
                <strong>{donor.phone || "Not provided"}</strong>
              </div>

              <div className="profile-detail">
                <span>Last donation</span>
                <strong>
                  {donor.lastDonationDate || "Not provided"}
                </strong>
              </div>

              <div className="profile-detail">
                <span>Account status</span>
                <strong>
                  {donor.active ? "Active" : "Inactive"}
                </strong>
              </div>
            </div>

            <p className="privacy-hint">
              Blood bank staff determine your final eligibility to donate.
            </p>
          </article>

          <article className="dashboard-panel availability-panel">
            <p className="section-label">DONATION STATUS</p>
            <h2>Your availability</h2>

            <div
              className={`availability-status ${
                available ? "status-available" : "status-unavailable"
              }`}
            >
              <span className="status-dot" />
              {available
                ? "Available to be contacted"
                : "Currently unavailable"}
            </div>

            <p>
              {available
                ? "You may appear in matching results."
                : "You will not appear as an available donor in matching results."}
            </p>

            <button
              className="button auth-submit availability-button"
              onClick={handleAvailabilityChange}
              disabled={savingAvailability || !donor.active}
            >
              {savingAvailability
                ? "Updating..."
                : available
                ? "Mark as unavailable"
                : "Mark as available"}
            </button>

            {!donor.active && (
              <p className="form-message error-message">
                Your account is inactive. Contact the administrator for help.
              </p>
            )}
          </article>
        </section>

        <section className="dashboard-panel requests-panel">
          <div className="requests-heading">
            <div>
              <p className="section-label">DONATION REQUESTS</p>
              <h2>Requests for you</h2>
            </div>

            <button
              className="logout-button"
              onClick={handleRefresh}
              disabled={requestsLoading}
            >
              {requestsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {requestError && (
            <p className="form-message error-message">
              {requestError}
            </p>
          )}

          {requestsLoading && requests.length === 0 ? (
            <p className="request-info">Loading incoming requests...</p>
          ) : requests.length === 0 ? (
            <div className="empty-requests">
              <div className="empty-requests-icon">♡</div>
              <h3>No incoming requests yet</h3>
              <p>
                When a requester selects you and sends a request,
                it will appear here.
              </p>
            </div>
          ) : (
            <div className="incoming-requests-list">
              {requests.map((request) => {
                const pending =
                  request.responseStatus?.toUpperCase() === "PENDING";

                const accepted =
                  request.responseStatus?.toUpperCase() === "ACCEPTED";

                const busy =
                  respondingId === request.bloodRequestId;

                return (
                  <article
                    className="incoming-request-card"
                    key={request.responseId}
                  >
                    <div className="incoming-request-top">
                      <span className="blood-group-badge">
                        {request.bloodGroup}
                      </span>

                      <span
                        className={`request-status ${
                          accepted
                            ? "request-status-accepted"
                            : "request-status-pending"
                        }`}
                      >
                        {request.responseStatus}
                      </span>
                    </div>

                    <h3>{request.requesterName}</h3>

                    <div className="request-details">
                      <p>
                        <strong>City:</strong> {request.city}
                      </p>
                      <p>
                        <strong>Hospital:</strong>{" "}
                        {request.hospitalName || "Not provided"}
                      </p>
                      <p>
                        <strong>Units needed:</strong>{" "}
                        {request.unitsRequired}
                      </p>
                    </div>

                    {accepted && (
                      <div className="accepted-contact">
                        <strong>Requester contact</strong>
                        <p>
                          {request.requesterPhone ||
                            "Contact details not provided"}
                        </p>
                      </div>
                    )}

                    
{pending && (
  <div className="request-actions">
    <button
      className="button auth-submit"
      onClick={() => handleResponse(request, "ACCEPTED")}
      disabled={busy}
    >
      Accept request
    </button>

    <button
      className="decline-button"
      onClick={() => handleResponse(request, "DECLINED")}
      disabled={busy}
    >
      Decline
    </button>
  </div>
)}



                  </article>
                );
              })}
            </div>
          )}

          <p className="privacy-hint">
            Refresh to check for new requests. Requester contact
            details should be revealed only after acceptance and
            backend authorization.
          </p>
        </section>

        <footer className="dashboard-footer">
          <span>PulseLink</span>
          <span>Connect with care. Donate with confidence.</span>
        </footer>
      </div>
    </main>
  );
}

export default DonorDashboard;
