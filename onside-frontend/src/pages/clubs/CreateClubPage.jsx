import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useAuthModal } from "../../context/AuthModalContext";
import useAuth from "../../hooks/useAuth";
import styles from "./CreateClubPage.module.css";

const CLUB_ROLES = ["TEAM_MANAGER", "LEAGUE_ADMIN", "SUPER_ADMIN"];

// Field wrapper with label and optional error
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

// Numbered section wrapper
function FormSection({ number, title, children }) {
  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>{number}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

const INITIAL_FORM = {
  name: "",
  shortName: "",
  description: "",
  website: "",
  logoUrl: "",
  city: "",
  state: "",
  foundedYear: "",
};

export default function CreateClubPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { openLogin } = useAuthModal();
  const hasRole = user?.roles?.some((r) => CLUB_ROLES.includes(r));

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Club name is required";
    if (form.name.trim().length > 150)
      e.name = "Must be 150 characters or fewer";
    if (form.shortName.length > 30)
      e.shortName = "Must be 30 characters or fewer";
    if (form.state && form.state.length !== 2)
      e.state = "Must be a 2-letter state code (e.g. GA)";
    if (
      form.foundedYear &&
      (isNaN(form.foundedYear) ||
        form.foundedYear < 1800 ||
        form.foundedYear > new Date().getFullYear())
    ) {
      e.foundedYear = "Enter a valid year";
    }
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
      const payload = {
        name: form.name.trim(),
        shortName: form.shortName.trim() || undefined,
        description: form.description.trim() || undefined,
        website: form.website.trim() || undefined,
        logoUrl: form.logoUrl.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim().toUpperCase() || undefined,
        foundedYear: form.foundedYear ? parseInt(form.foundedYear) : undefined,
      };

      const res = await axiosClient.post("/clubs", payload);
      // On success navigate to the admin dashboard club section
      navigate("/admin", {
        state: { section: "club", clubSlug: res.data.slug },
      });
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "Failed to create club. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return null;

  // Not logged in — show login gate
  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <span>←</span> Back
          </button>
          <div className={styles.topBarCenter}>
            <div className={styles.logoIcon}>⚽</div>
            <span className={styles.logoText}>Onside</span>
          </div>
          <div style={{ minWidth: 100 }} />
        </div>
        <div className={styles.gate}>
          <div className={styles.gateIcon}>🏛️</div>
          <h1 className={styles.gateTitle}>Start a Club</h1>
          <p className={styles.gateText}>
            You need an account to create a club on Onside.
          </p>
          <button
            className={styles.gatePrimary}
            onClick={() => openLogin({ returnTo: "/clubs/new" })}
          >
            Sign In to Continue
          </button>
          <button className={styles.gateSecondary} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Logged in but missing role — redirect to request access
  if (!hasRole) {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <span>←</span> Back
          </button>
          <div className={styles.topBarCenter}>
            <div className={styles.logoIcon}>⚽</div>
            <span className={styles.logoText}>Onside</span>
          </div>
          <div style={{ minWidth: 100 }} />
        </div>
        <div className={styles.gate}>
          <div className={styles.gateIcon}>🔐</div>
          <h1 className={styles.gateTitle}>Admin Access Required</h1>
          <p className={styles.gateText}>
            Creating a club requires admin access. Request elevated permissions
            and we'll review your application within 2–3 business days.
          </p>
          <button
            className={styles.gatePrimary}
            onClick={() => navigate("/admin/request")}
          >
            Request Admin Access
          </button>
          <button className={styles.gateSecondary} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Sticky top bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span>←</span> Back
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
          {submitting ? "Creating..." : "Create Club"}
        </button>
      </div>

      <div className={styles.container}>
        {/* Page header */}
        <div className={styles.pageHeader}>
          <div className={styles.pageLabel}>// Clubs</div>
          <h1 className={styles.pageTitle}>Start a Club</h1>
          <p className={styles.pageSubtitle}>
            Set up your club profile. Once created you can add teams, manage
            rosters, and post events from your admin dashboard.
          </p>
        </div>

        {/* Global error */}
        {submitError && <div className={styles.submitError}>{submitError}</div>}

        {/* Validation summary */}
        {Object.keys(errors).length > 0 && (
          <div className={styles.errorSummary}>
            Please fix the errors below before submitting.
          </div>
        )}

        <div className={styles.formLayout}>
          {/* Left column: form sections */}
          <div className={styles.formMain}>
            <FormSection number="01" title="Club Info">
              <Field label="Club Name" required error={errors.name}>
                <input
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Atlanta United FC"
                  maxLength={150}
                />
              </Field>

              <Field
                label="Short Name"
                error={errors.shortName}
                hint="An abbreviated name shown in tight spaces (e.g. AUFC)"
              >
                <input
                  className={`${styles.input} ${errors.shortName ? styles.inputError : ""}`}
                  name="shortName"
                  value={form.shortName}
                  onChange={handleChange}
                  placeholder="e.g. AUFC"
                  maxLength={30}
                />
              </Field>

              <Field label="Description">
                <textarea
                  className={styles.textarea}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tell players about your club — your history, mission, and what makes you stand out."
                  rows={4}
                />
              </Field>
            </FormSection>

            <FormSection number="02" title="Location">
              <div className={styles.fieldRow}>
                <Field label="City" error={errors.city}>
                  <input
                    className={`${styles.input} ${errors.city ? styles.inputError : ""}`}
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Atlanta"
                  />
                </Field>
                <Field label="State" error={errors.state}>
                  <input
                    className={`${styles.input} ${errors.state ? styles.inputError : ""}`}
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="GA"
                    maxLength={2}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection number="03" title="Details">
              <div className={styles.fieldRow}>
                <Field label="Founded Year" error={errors.foundedYear}>
                  <input
                    className={`${styles.input} ${errors.foundedYear ? styles.inputError : ""}`}
                    name="foundedYear"
                    type="number"
                    value={form.foundedYear}
                    onChange={handleChange}
                    placeholder={new Date().getFullYear().toString()}
                    min={1800}
                    max={new Date().getFullYear()}
                  />
                </Field>
                <Field label="Website">
                  <input
                    className={styles.input}
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://yourclub.com"
                  />
                </Field>
              </div>

              <Field
                label="Logo URL"
                hint="Paste a link to your club logo image (PNG or SVG recommended)"
              >
                <input
                  className={styles.input}
                  name="logoUrl"
                  value={form.logoUrl}
                  onChange={handleChange}
                  placeholder="https://yourclub.com/logo.png"
                />
              </Field>

              {/* Logo preview */}
              {form.logoUrl && (
                <div className={styles.logoPreview}>
                  <img
                    src={form.logoUrl}
                    alt="Logo preview"
                    className={styles.logoPreviewImg}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </FormSection>
          </div>

          {/* Right column: sidebar */}
          <aside className={styles.formSidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardTitle}>What happens next?</div>
              <div className={styles.sidebarSteps}>
                <div className={styles.sidebarStep}>
                  <div className={styles.stepDot}>1</div>
                  <div className={styles.stepText}>
                    Your club profile is created
                  </div>
                </div>
                <div className={styles.sidebarStep}>
                  <div className={styles.stepDot}>2</div>
                  <div className={styles.stepText}>
                    You're taken to the admin dashboard
                  </div>
                </div>
                <div className={styles.sidebarStep}>
                  <div className={styles.stepDot}>3</div>
                  <div className={styles.stepText}>
                    Add teams, staff, and post events
                  </div>
                </div>
              </div>

              <div className={styles.sidebarDivider} />

              <button
                className={styles.createBtn}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Club →"}
              </button>

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
