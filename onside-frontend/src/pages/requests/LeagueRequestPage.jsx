import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import styles from "./RequestPage.module.css";

const LEAGUE_TYPES = [
  "Men's Recreational",
  "Women's Recreational",
  "Co-Ed Recreational",
  "Men's Competitive",
  "Women's Competitive",
  "Youth (Boys)",
  "Youth (Girls)",
  "Youth (Co-Ed)",
  "Indoor / Futsal",
  "College Club",
  "Semi-Pro",
  "Other",
];

function Field({ label, required, error, hint, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      {children}
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}

const INITIAL = {
  leagueName: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  city: "",
  state: "",
  leagueType: "",
  teamCount: "",
  message: "",
};

export default function LeagueRequestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  function validate() {
    const e = {};
    if (!form.leagueName.trim()) e.leagueName = "League name is required";
    if (!form.contactName.trim()) e.contactName = "Contact name is required";
    if (!form.contactEmail.trim()) e.contactEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.contactEmail))
      e.contactEmail = "Must be a valid email";
    return e;
  }

  async function handleSubmit() {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await axiosClient.post("/requests/league", {
        leagueName: form.leagueName.trim(),
        contactName: form.contactName.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim().toUpperCase() || undefined,
        leagueType: form.leagueType || undefined,
        teamCount: form.teamCount ? parseInt(form.teamCount) : undefined,
        message: form.message.trim() || undefined,
      });
      setSubmitted(true);
    } catch {
      setSubmitError("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate("/")}>
            ← Back
          </button>
          <div className={styles.topBarCenter}>
            <div className={styles.logoIcon}>⚽</div>
            <span className={styles.logoText}>Onside</span>
          </div>
          <div style={{ minWidth: 80 }} />
        </div>
        <div className={styles.successWrap}>
          <div className={styles.successIcon}>🏆</div>
          <h1 className={styles.successTitle}>Request Submitted</h1>
          <p className={styles.successText}>
            Thanks for reaching out! We'll review your league request and get
            back to you at <strong>{form.contactEmail}</strong> within 2–3
            business days.
          </p>
          <button className={styles.successBtn} onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className={styles.topBarCenter}>
          <div className={styles.logoIcon}>⚽</div>
          <span className={styles.logoText}>Onside</span>
        </div>
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.pageLabel}>// Leagues</div>
          <h1 className={styles.pageTitle}>Add Your League</h1>
          <p className={styles.pageSubtitle}>
            Want to list your league on Onside? Fill out the form below and
            we'll be in touch within 2–3 business days.
          </p>
        </div>

        {submitError && <div className={styles.submitError}>{submitError}</div>}
        {Object.keys(errors).length > 0 && (
          <div className={styles.errorSummary}>
            Please fix the errors below before submitting.
          </div>
        )}

        <div className={styles.formLayout}>
          <div className={styles.formMain}>
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>01</span>
                <h2 className={styles.sectionTitle}>League Info</h2>
              </div>
              <div className={styles.sectionBody}>
                <Field label="League Name" required error={errors.leagueName}>
                  <input
                    className={`${styles.input} ${errors.leagueName ? styles.inputError : ""}`}
                    name="leagueName"
                    value={form.leagueName}
                    onChange={handleChange}
                    placeholder="e.g. Atlanta Adult Soccer League"
                  />
                </Field>
                <div className={styles.fieldRow}>
                  <Field label="League Type">
                    <select
                      className={styles.input}
                      name="leagueType"
                      value={form.leagueType}
                      onChange={handleChange}
                    >
                      <option value="">Select type</option>
                      {LEAGUE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Number of Teams"
                    hint="Approximate number of teams"
                  >
                    <input
                      className={styles.input}
                      name="teamCount"
                      type="number"
                      min={1}
                      value={form.teamCount}
                      onChange={handleChange}
                      placeholder="e.g. 12"
                    />
                  </Field>
                </div>
                <div className={styles.fieldRow}>
                  <Field label="City">
                    <input
                      className={styles.input}
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Atlanta"
                    />
                  </Field>
                  <Field label="State">
                    <input
                      className={styles.input}
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="GA"
                      maxLength={2}
                    />
                  </Field>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>02</span>
                <h2 className={styles.sectionTitle}>Contact Info</h2>
              </div>
              <div className={styles.sectionBody}>
                <Field label="Your Name" required error={errors.contactName}>
                  <input
                    className={`${styles.input} ${errors.contactName ? styles.inputError : ""}`}
                    name="contactName"
                    value={form.contactName}
                    onChange={handleChange}
                    placeholder="Full name"
                  />
                </Field>
                <div className={styles.fieldRow}>
                  <Field label="Email" required error={errors.contactEmail}>
                    <input
                      className={`${styles.input} ${errors.contactEmail ? styles.inputError : ""}`}
                      name="contactEmail"
                      type="email"
                      value={form.contactEmail}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="Phone" hint="Optional">
                    <input
                      className={styles.input}
                      name="contactPhone"
                      value={form.contactPhone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                    />
                  </Field>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>03</span>
                <h2 className={styles.sectionTitle}>Additional Info</h2>
              </div>
              <div className={styles.sectionBody}>
                <Field
                  label="Message"
                  hint="Tell us anything else about your league"
                >
                  <textarea
                    className={styles.textarea}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Any other details you'd like us to know..."
                    rows={4}
                  />
                </Field>
              </div>
            </div>
          </div>

          <aside className={styles.formSidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardTitle}>What happens next?</div>
              <div className={styles.sidebarSteps}>
                <div className={styles.sidebarStep}>
                  <div className={styles.stepDot}>1</div>
                  <div className={styles.stepText}>
                    We review your request within 2–3 business days
                  </div>
                </div>
                <div className={styles.sidebarStep}>
                  <div className={styles.stepDot}>2</div>
                  <div className={styles.stepText}>
                    We reach out to confirm details and set up your league
                  </div>
                </div>
                <div className={styles.sidebarStep}>
                  <div className={styles.stepDot}>3</div>
                  <div className={styles.stepText}>
                    Your league goes live on Onside
                  </div>
                </div>
              </div>
              <div className={styles.sidebarDivider} />
              <button
                className={styles.createBtn}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Request →"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
