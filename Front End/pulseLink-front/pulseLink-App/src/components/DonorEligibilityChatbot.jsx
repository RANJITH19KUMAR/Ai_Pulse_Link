
import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function DonorEligibilityChatbot({
  donorId,
  bloodRequestId,
  onComplete,
  onCancel,
}) {
  const [baseQuestions, setBaseQuestions] = useState([]);
  const [dateQuestion, setDateQuestion] = useState(null);
  const [screeningId, setScreeningId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Load questions and start or resume the screening.
  useEffect(() => {
    let cancelled = false;

    async function loadScreening() {
      try {
        setLoading(true);
        setError("");

        const questionsResponse = await fetch(
          `${API_BASE}/screening/questions`
        );

        if (!questionsResponse.ok) {
          throw new Error("Could not load screening questions.");
        }

        const questionData = await questionsResponse.json();

        if (!questionData.length) {
          throw new Error("No active screening questions are available.");
        }

        // Load the conditional date question separately.
        const dateResponse = await fetch(
          `${API_BASE}/screening/questions/last-donation-date`
        );

        if (!dateResponse.ok) {
          throw new Error("Could not load the donation-date question.");
        }

        const dateData = await dateResponse.json();

        const startResponse = await fetch(
          `${API_BASE}/screenings/start`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              donorId: Number(donorId),
              bloodRequestId: Number(bloodRequestId),
            }),
          }
        );

        const startData = await startResponse.json();

        if (!startResponse.ok) {
          throw new Error(
            startData.message || "Could not start screening."
          );
        }

        if (startData.status !== "IN_PROGRESS") {
          throw new Error(
            `This screening is already ${startData.status}.`
          );
        }

        const savedResponse = await fetch(
          `${API_BASE}/screenings/${startData.id}`
        );

        const savedData = await savedResponse.json();

        if (!savedResponse.ok) {
          throw new Error("Could not retrieve saved answers.");
        }

        const savedAnswers = {};

        for (const answer of savedData.answers || []) {
          savedAnswers[answer.questionId] = answer.answer;
        }

        if (cancelled) return;

        setBaseQuestions(questionData);
        setDateQuestion(
          Array.isArray(dateData) ? dateData[0] || null : null
        );
        setScreeningId(startData.id);
        setAnswers(savedAnswers);

        // Resume at the first unanswered regular question.
        const firstUnanswered = questionData.findIndex(
          (question) => !savedAnswers[question.id]
        );

        setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (donorId == null || bloodRequestId == null) {
      setError("Donor ID and blood request ID are required.");
      setLoading(false);
    } else {
      loadScreening();
    }

    return () => {
      cancelled = true;
    };
  }, [donorId, bloodRequestId]);

  // Insert the date question after question 2 only when its answer is YES.
  const questions = useMemo(() => {
    const result = [...baseQuestions];

    const previousDonationQuestion = baseQuestions.find(
      (question) => question.displayOrder === 2
    );

    if (
      previousDonationQuestion &&
      answers[previousDonationQuestion.id] === "YES" &&
      dateQuestion
    ) {
      const existingIndex = result.findIndex(
        (question) => question.id === dateQuestion.id
      );

      if (existingIndex !== -1) {
        result.splice(existingIndex, 1);
      }

      const questionIndex = result.findIndex(
        (question) => question.id === previousDonationQuestion.id
      );

      result.splice(questionIndex + 1, 0, dateQuestion);
    }

    return result;
  }, [baseQuestions, dateQuestion, answers]);

  const currentQuestion = questions[currentIndex];

  // Save one answer through the existing Spring Boot API.
  async function saveAnswer(question, answer) {
    if (!screeningId || !question) return false;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/screenings/${screeningId}/answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            answer,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save your answer.");
      }

      setAnswers((previous) => ({
        ...previous,
        [question.id]: answer,
      }));

      return true;
    } catch (err) {
      setError(err.message || "Could not save your answer.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    if (!currentQuestion) return;

    const answer = answers[currentQuestion.id];

    if (!answer) {
      setError("Please answer this question before continuing.");
      return;
    }

    const saved = await saveAnswer(currentQuestion, answer);

    if (saved) {
      setCurrentIndex((index) => index + 1);
      setChatReply("");
    }
  }

  async function handlePrevious() {
    setCurrentIndex((index) => Math.max(0, index - 1));
    setError("");
    setChatReply("");
  }

  async function handleComplete() {
    const unanswered = questions.find(
      (question) => !answers[question.id]
    );

    if (unanswered) {
      setError("Please answer all applicable screening questions.");
      return;
    }

    // Save the current answer before requesting completion.
    if (currentQuestion) {
      const saved = await saveAnswer(
        currentQuestion,
        answers[currentQuestion.id]
      );

      if (!saved) return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/screenings/${screeningId}/complete`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not complete screening."
        );
      }

      if (onComplete) {
        onComplete(data.screening || data);
      }
    } catch (err) {
      setError(err.message || "Could not complete screening.");
    } finally {
      setSaving(false);
    }
  }

  async function explainQuestion() {
    if (!currentQuestion) return;

    try {
      setChatLoading(true);
      setError("");
      setChatReply("");

      const response = await fetch(`${API_BASE}/eligible-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            `Explain this blood donor screening question in simple, ` +
            `polite language: "${currentQuestion.questionText}". ` +
            `Do not decide medical eligibility or invent medical rules.`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI explanation failed.");
      }

      setChatReply(data.reply || "No explanation was returned.");
    } catch (err) {
      setError(err.message || "Could not contact the AI service.");
    } finally {
      setChatLoading(false);
    }
  }

  if (loading) {
    return <p>Loading donor screening...</p>;
  }

  if (error && !currentQuestion) {
    return (
      <section style={styles.card}>
        <p style={styles.error}>{error}</p>
        <button onClick={onCancel} style={styles.secondaryButton}>
          Close
        </button>
      </section>
    );
  }

  if (!currentQuestion) {
    return <p>No screening question is available.</p>;
  }

  const isLastQuestion = currentIndex === questions.length - 1;
  const selectedAnswer = answers[currentQuestion.id] || "";

  return (
    <section style={styles.card}>
      <p style={styles.eyebrow}>PULSELINK · DONOR SCREENING</p>
      <h2 style={styles.heading}>Let's complete your screening</h2>

      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressBar,
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      <p style={styles.muted}>
        Question {currentIndex + 1} of {questions.length}
      </p>

      <p style={styles.category}>{currentQuestion.category}</p>
      <h3 style={styles.question}>{currentQuestion.questionText}</h3>

      {currentQuestion.answerType === "DATE" ? (
        <div style={styles.dateField}>
          <label htmlFor="lastDonationDate">
            Last donation date
          </label>
          <input
            id="lastDonationDate"
            type="date"
            max={new Date().toLocaleDateString("en-CA")}
            value={selectedAnswer}
            disabled={saving}
            onChange={(event) => {
              setAnswers((previous) => ({
                ...previous,
                [currentQuestion.id]: event.target.value,
              }));
              setError("");
            }}
          />
        </div>
      ) : (
        <div style={styles.answerList}>
          {["YES", "NO", "UNSURE"]
            .filter(
              (answer) =>
                answer !== "UNSURE" ||
                currentQuestion.answerType === "YES_NO_UNSURE"
            )
            .map((answer) => (
              <button
                key={answer}
                type="button"
                disabled={saving}
                onClick={() => {
                  setAnswers((previous) => ({
                    ...previous,
                    [currentQuestion.id]: answer,
                  }));
                  setError("");
                }}
                style={{
                  ...styles.answerButton,
                  ...(selectedAnswer === answer
                    ? styles.selectedAnswer
                    : {}),
                }}
              >
                {answer === "UNSURE" ? "I'm not sure" : answer}
              </button>
            ))}
        </div>
      )}

      <button
        type="button"
        onClick={explainQuestion}
        disabled={chatLoading || saving}
        style={styles.secondaryButton}
      >
        {chatLoading ? "Getting explanation..." : "Explain this question"}
      </button>

      {chatReply && (
        <div style={styles.chatBox}>
          <strong>AI assistant</strong>
          <p>{chatReply}</p>
          <p style={styles.muted}>
            The assistant explains questions; it does not determine
            medical eligibility.
          </p>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.footer}>
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || saving}
          style={styles.secondaryButton}
        >
          Previous
        </button>

        {isLastQuestion ? (
          <button
            type="button"
            onClick={handleComplete}
            disabled={saving}
            style={styles.primaryButton}
          >
            {saving ? "Saving..." : "Complete screening"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            style={styles.primaryButton}
          >
            {saving ? "Saving..." : "Save & Next"}
          </button>
        )}
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          style={styles.cancelButton}
        >
          Cancel screening
        </button>
      )}
    </section>
  );
}

const styles = {
  card: {
    maxWidth: "620px",
    margin: "24px auto",
    padding: "28px",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    background: "#ffffff",
    color: "#1e293b",
    fontFamily: "Arial, sans-serif",
    boxShadow: "0 8px 28px rgba(15, 23, 42, 0.06)",
  },
  eyebrow: {
    color: "#0f766e",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  heading: { fontSize: "25px", marginBottom: "20px" },
  progressTrack: {
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "8px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    background: "#0f766e",
    transition: "width 0.2s",
  },
  muted: { color: "#64748b", fontSize: "13px" },
  category: {
    color: "#0f766e",
    fontSize: "13px",
    fontWeight: "bold",
  },
  question: { fontSize: "19px", lineHeight: 1.5 },
  answerList: { display: "grid", gap: "10px", margin: "20px 0" },
  answerButton: {
    padding: "13px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    background: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
  },
  selectedAnswer: {
    border: "2px solid #0f766e",
    background: "#f0fdfa",
    fontWeight: "bold",
  },
  dateField: {
    display: "grid",
    gap: "8px",
    margin: "20px 0",
  },
  primaryButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "9px",
    background: "#0f766e",
    color: "#ffffff",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#334155",
    cursor: "pointer",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "24px",
  },
  chatBox: {
    marginTop: "16px",
    padding: "14px",
    background: "#f0fdfa",
    borderRadius: "10px",
    lineHeight: 1.6,
  },
  error: { color: "#b91c1c", marginTop: "14px" },
  cancelButton: {
    marginTop: "16px",
    padding: "8px 0",
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
  },
};
