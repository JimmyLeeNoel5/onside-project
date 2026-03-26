import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import styles from "./RequestPage.module.css";

const ACCESS_TYPES = [
  { value: "CLUB", label: "Club Admin — manage a club and its teams" },
  {
    value: "TEAM",
    label: "Team Manager — manage a specific team's roster and events",
  },
  {
    value: "LEAGUE",
    label: "League Admin — manage a league, seasons, and standings",
  },
  {
    value: "COACH",
    label: "Coach — manage training sessions and player development",
  },
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
  fullName: "",
  email: "",
  phone: "",
  accessType: "",
  organizationName: "",
  role: "",
  reason: "",
};

export default function AdminRequestPage() {
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
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Must be a valid email";
    if (!form.accessType) e.accessType = "Please select an access type";
    if (!form.organizationName.trim())
      e.organizationName = "Organization name is required";
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
      await axiosClient.post("/requests/admin-access", {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        accessType: form.accessType,
        organizationName: form.organizationName.trim(),
        role: form.role.trim() || undefined,
        reason: form.reason.trim() || undefined,
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
          <div className={styles.successIcon}>🔐</div>
          <h1 className={styles.successTitle}>Request Submitted</h1>
          <p className={styles.successText}>
            Thanks! We'll review your admin access request and follow up at{" "}
            <strong>{form.email}</strong> within 2–3 business days.
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
          <div className={styles.pageLabel}>// Access</div>
          <h1 className={styles.pageTitle}>Request Admin Access</h1>
          <p className={styles.pageSubtitle}>
            Want to manage a club, team, or league on Onside? Submit a request
            and we'll review and grant the appropriate access.
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
                <h2 className={styles.sectionTitle}>Access Type</h2>
              </div>
              <div className={styles.sectionBody}>
                <Field
                  label="What do you want to manage?"
                  required
                  error={errors.accessType}
                >
                  <div className={styles.accessTypeGrid}>
                    {ACCESS_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        className={`${styles.accessTypeCard} ${form.accessType === type.value ? styles.accessTypeCardActive : ""}`}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            accessType: type.value,
                          }));
                          if (errors.accessType)
                            setErrors((prev) => ({
                              ...prev,
                              accessType: null,
                            }));
                        }}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  {errors.accessType && (
                    <span className={styles.fieldError}>
                      {errors.accessType}
                    </span>
                  )}
                </Field>

                <Field
                  label="Organization Name"
                  required
                  error={errors.organizationName}
                  hint="Name of the club, team, or league you want to manage"
                >
                  <input
                    className={`${styles.input} ${errors.organizationName ? styles.inputError : ""}`}
                    name="organizationName"
                    value={form.organizationName}
                    onChange={handleChange}
                    placeholder="e.g. Atlanta United FC"
                  />
                </Field>

                <Field
                  label="Your Role"
                  hint="e.g. Head Coach, Club Director, League Commissioner"
                >
                  <input
                    className={styles.input}
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="Your current role"
                  />
                </Field>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>02</span>
                <h2 className={styles.sectionTitle}>Your Info</h2>
              </div>
              <div className={styles.sectionBody}>
                <Field label="Full Name" required error={errors.fullName}>
                  <input
                    className={`${styles.input} ${errors.fullName ? styles.inputError : ""}`}
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Full name"
                  />
                </Field>
                <div className={styles.fieldRow}>
                  <Field label="Email" required error={errors.email}>
                    <input
                      className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="Phone" hint="Optional">
                    <input
                      className={styles.input}
                      name="phone"
                      value={form.phone}
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
                <h2 className={styles.sectionTitle}>Why do you need access?</h2>
              </div>
              <div className={styles.sectionBody}>
                <Field label="Reason" hint="Help us understand your use case">
                  <textarea
                    className={styles.textarea}
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Describe why you need admin access and how you plan to use it..."
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
                    We verify your identity and organization
                  </div>
                </div>
                <div className={styles.sidebarStep}>
                  <div className={styles.stepDot}>3</div>
                  <div className={styles.stepText}>
                    Admin access is granted and you're notified by email
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
