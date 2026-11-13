
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DonorEligibilityChatbot from "./components/DonorEligibilityChatbot";
import { useState } from "react";
import Login from "./pages/login";
import Register from "./pages/Register";
import "./App.css";
import RegisterDonor from "./pages/RegisterDonor";
import RegisterRequester from "./pages/RegisterRequester";
import RequesterDashboard from "./pages/RequesterDashboard";
import DonorDashboard from "./pages/DonorDashboard";


// Reusable logo component for the PulseLink brand.
function Logo() {
  return (
    <a className="brand" href="#home" aria-label="PulseLink home">
      <span className="brand-mark" aria-hidden="true">
        <svg
          viewBox="0 0 40 40"
          width="38"
          height="38"
          fill="none"
        >
          <path
            d="M20 3 C15 12 5 20 5 26
               C5 34 11 38 20 38
               C29 38 35 34 35 26
               C35 20 25 12 20 3Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M20 28 L14 22
               C10 17 17 13 20 19
               C23 13 30 17 26 22Z"
            fill="#C95B5B"
          />
        </svg>
      </span>

      <span className="brand-copy">
        <strong>PulseLink</strong>
        <small>Connecting donors. Supporting lives.</small>
      </span>
    </a>
  );
}

// Reusable button-style link.
function ActionLink({ href, children, variant = "primary" }) {
  return (
    <a className={`button button-${variant}`} href={href}>
      {children}
    </a>
  );
}

// The main landing page.
function Home() {
  return (
    <>
      <header className="site-header">
        <div className="container nav-layout">
          <Logo />

          <nav className="navigation" aria-label="Main navigation">
            <a href="#home">Home</a>
            <a href="#how-it-works">How it works</a>
            <a href="#about">About</a>
            <a href="#help">Help</a>
          </nav>

          <div className="nav-actions">
            <ActionLink href="/login" variant="outline">
              Login
            </ActionLink>
            <ActionLink href="/register">
              Register
            </ActionLink>
          </div>
        </div>
      </header>
{/* // body page */}
      <main>
        <section className="hero" id="home">
          <div className="container hero-layout">
            <div className="hero-content">
              <span className="eyebrow">
                <span aria-hidden="true">♡</span>
                Blood donation made simpler
              </span>

              <h1>
                Every drop
                <br />
                brings <span>hope.</span>
              </h1>

              <p className="hero-description">
                PulseLink helps connect people who need blood
                with willing donors. Find a match, send a request,
                and connect with care.
              </p>

              <div className="hero-actions">
                <ActionLink href="#find-donor">
                  Find a donor <span aria-hidden="true">→</span>
                </ActionLink>

                <ActionLink href="#become-donor" variant="outline">
                  ♡ Become a donor
                </ActionLink>
              </div>

              <p className="hero-note">
                A community-powered platform built to help people.
              </p>
            </div>

            <div className="hero-art" aria-label="A symbol of care and connection">
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />

              <div className="art-card">
                <span className="art-heart">♥</span>
                <p>Small acts of kindness can make a difference.</p>
                <span className="art-leaf" aria-hidden="true">✳</span>
              </div>

              <span className="floating-note note-one">
                Care
              </span>
              <span className="floating-note note-two">
                Community
              </span>
            </div>
          </div>
        </section>

        <section className="steps-section" id="how-it-works">
          <div className="container">
            <div className="section-heading">
              <span className="section-label">HOW IT WORKS</span>
              <h2>Three simple steps</h2>
              <p>
                Getting help or becoming a donor starts with
                a few simple steps.
              </p>
            </div>

            <div className="steps-grid">
              <article className="step-card">
                <span className="step-number">01</span>
                <div className="step-icon">♧</div>
                <h3>Register or log in</h3>
                <p>
                  Create your account as a donor or a person
                  requesting blood.
                </p>
              </article>

              <article className="step-card">
                <span className="step-number">02</span>
                <div className="step-icon">⌕</div>
                <h3>Find a match</h3>
                <p>
                  Explore available donors who match the
                  blood group and location you enter.
                </p>
              </article>

              <article className="step-card">
                <span className="step-number">03</span>
                <div className="step-icon">♡</div>
                <h3>Connect with care</h3>
                <p>
                  Send a request, wait for the donor's response,
                  and connect when accepted.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="help-section" id="help">
          <div className="container help-panel">
            <div className="help-symbol" aria-hidden="true">✳</div>

            <div className="help-copy" id="about">
              <span className="section-label">FIRST TIME HERE?</span>
              <h2>We're here to help.</h2>
              <p>
                New to PulseLink? Learn how it works, what to
                expect, and how we help protect your information.
              </p>
              <a className="text-link" href="#how-it-works">
                Learn how PulseLink works <span>→</span>
              </a>
            </div>

            <div className="trust-list">
              <div>
                <span className="trust-icon">◇</span>
                <p>
                  <strong>Privacy matters</strong>
                  <small>Contact details should be shared securely.</small>
                </p>
              </div>

              <div>
                <span className="trust-icon">⌖</span>
                <p>
                  <strong>Find local donors</strong>
                  <small>Search based on your entered location.</small>
                </p>
              </div>

              <div>
                <span className="trust-icon">♡</span>
                <p>
                  <strong>People helping people</strong>
                  <small>Built around care, trust, and community.</small>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="next-section" id="find-donor">
          <div className="container next-panel">
            <div>
              <span className="section-label">YOUR NEXT STEP</span>
              <h2>How would you like to help?</h2>
              <p>
                Choose the path that fits your needs.
              </p>
            </div>

            <div className="next-actions" id="become-donor">
              <ActionLink href="#register">
                I need blood
              </ActionLink>
              <ActionLink href="#register" variant="outline">
                I want to donate
              </ActionLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="register">
        <div className="container footer-layout">
          <Logo />
          <p>Made with care for a community that gives.</p>
        </div>
      </footer>
    </>
  );
}

function App() {
  const [showScreening, setShowScreening] = useState(false);
const [screeningResult, setScreeningResult] = useState(null);
  return(

    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/register" element={<Register/>}/>
      <Route path ="/register/donor" element={<RegisterDonor/>}/>
      <Route path ="/register/requester" element={<RegisterRequester/>}/>
      <Route path ="/requester-dashboard" element={<RequesterDashboard/>}/>
       <Route path ="/donor-dashboard" element={<DonorDashboard/>}/>

        <Route
          path="/donor-screening"
          element={
            <div style={{ padding: "24px" }}>
              {showScreening ? (
                <DonorEligibilityChatbot
                  donorId={1}
                  bloodRequestId={1}
                  onComplete={(result) => {
                    setScreeningResult(result);
                    setShowScreening(false);
                  }}
                  onCancel={() => setShowScreening(false)}
                />
              ) : (
                <button onClick={() => setShowScreening(true)}>
                  Start Donor Screening
                </button>
              )}

              {screeningResult && (
                <p>
                  Screening status: {screeningResult.status}
                </p>
              )}
            </div>
          }
        />
      
      </Routes>
    </BrowserRouter>
  );
  
}
export default App;