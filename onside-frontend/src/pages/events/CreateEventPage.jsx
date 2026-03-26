import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import styles from "./CreateEventPage.module.css";

// ENUM OPTIONS
// Values must match backend enums exactly.
// Spring deserializes "TRYOUT" -> EventType.TRYOUT automatically.

const EVENT_TYPES = [
  { value: "", label: "Select type" },
  { value: "GAME", label: "Game" },
  { value: "TRYOUT", label: "Tryout" },
  { value: "TOURNAMENT", label: "Tournament" },
  { value: "ID_CAMP", label: "ID Camp" },
  { value: "COMBINE", label: "Combine" },
  { value: "PICKUP", label: "Pickup" },
  { value: "OTHER", label: "Other" },
];

const GENDER_CATEGORIES = [
  { value: "", label: "Select gender" },
  { value: "MALE", label: "Men's" },
  { value: "FEMALE", label: "Women's" },
  { value: "COED", label: "Co-Ed" },
  { value: "OPEN", label: "Open" },
];

const SKILL_LEVELS = [
  { value: "", label: "Select level" },
  { value: "RECREATIONAL", label: "Recreational" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "COMPETITIVE", label: "Competitive" },
  { value: "ELITE", label: "Elite" },
  { value: "SEMI_PRO", label: "Semi-Pro" },
  { value: "PROFESSIONAL", label: "Professional" },
];

// Initial form state - all fields empty
const INITIAL_FORM = {
  title: "",
  description: "",
  eventType: "",
  genderCategory: "",
  skillLevel: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  location: "",
  city: "",
  state: "",
  maxCapacity: "",
  entryFee: "",
  requirements: "",
};

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

// Label + input wrapper with optional error message
function Field({ label, required, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {children}
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}

export default function CreateEventPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Single handler for all inputs - uses e.target.name to update the right field
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  // Client-side validation - only checks required fields
  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.eventType) e.eventType = "Event type is required";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.startTime) e.startTime = "Start time is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    return e;
  }

  // Builds the request body matching EventRequest DTO field names exactly.
  //
  // Field name mapping (frontend -> backend):
  //   title       -> name           EventRequest uses `name`
  //   eventType   -> type           EventRequest uses `type`
  //   location    -> venueName      EventRequest uses `venueName`
  //   maxCapacity -> capacity       EventRequest uses `capacity` (Short)
  //   entryFee    -> individualFee  EventRequest uses `individualFee` (BigDecimal)
  //   published   -> isPublished    EventRequest uses `isPublished`
  //
  // Date/time: EventRequest uses separate LocalDate + LocalTime fields.
  //   startDate: "2025-04-12"   (LocalDate - from the date input)
  //   startTime: "10:00:00"     (LocalTime - HH:mm from input + appended :00)
  function buildPayload(publish = false) {
    return {
      name: form.title.trim(),
      type: form.eventType,
      description: form.description.trim() || undefined,
      genderCategory: form.genderCategory || undefined,
      skillLevel: form.skillLevel || undefined,

      // Separate LocalDate and LocalTime - NOT a combined ISO datetime string
      startDate: form.startDate || undefined,
      startTime: form.startTime ? `${form.startTime}:00` : undefined,
      endDate: form.endDate || undefined,
      endTime: form.endTime ? `${form.endTime}:00` : undefined,

      venueName: form.location.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,

      capacity: form.maxCapacity ? parseInt(form.maxCapacity) : undefined,
      individualFee:
        form.entryFee !== "" ? parseFloat(form.entryFee) : undefined,

      isPublished: publish,
    };
  }

  // Save as draft - POST /events with isPublished: false
  async function handleSaveDraft() {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await axiosClient.post("/events", buildPayload(false));
      navigate(`/events/${res.data.slug}`);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "Failed to save event. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Publish immediately - POST /events with isPublished: true
  async function handlePublish() {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await axiosClient.post("/events", buildPayload(true));
      navigate(`/events/${res.data.slug}`);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "Failed to publish event. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* Sticky top bar with back button and action buttons */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          Back
        </button>
        <div className={styles.topBarActions}>
          <button
            className={styles.draftBtn}
            onClick={handleSaveDraft}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Draft"}
          </button>
          <button
            className={styles.publishBtn}
            onClick={handlePublish}
            disabled={submitting}
          >
            {submitting ? "Publishing..." : "Publish Event"}
          </button>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.pageLabel}>// Create</div>
          <h1 className={styles.pageTitle}>New Event</h1>
          <p className={styles.pageSubtitle}>
            Fill in the details below. Save as a draft and publish later, or
            publish immediately.
          </p>
        </div>

        {/* Global submit error */}
        {submitError && <div className={styles.submitError}>{submitError}</div>}

        {/* Validation summary */}
        {Object.keys(errors).length > 0 && (
          <div className={styles.errorSummary}>
            Please fix the errors below before submitting.
          </div>
        )}

        <div className={styles.formLayout}>
          {/* Left column: main form sections */}
          <div className={styles.formMain}>
            {/* Section 1: Basic Info */}
            <FormSection number="01" title="Basic Info">
              <Field label="Event Title" required error={errors.title}>
                <input
                  className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Tryout 2025"
                  maxLength={200}
                />
              </Field>

              <Field label="Description">
                <textarea
                  className={styles.textarea}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your event — what to expect, who it's for, what to bring..."
                  rows={4}
                />
              </Field>

              <div className={styles.fieldRow}>
                <Field label="Event Type" required error={errors.eventType}>
                  <select
                    className={`${styles.select} ${errors.eventType ? styles.inputError : ""}`}
                    name="eventType"
                    value={form.eventType}
                    onChange={handleChange}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Gender Category">
                  <select
                    className={styles.select}
                    name="genderCategory"
                    value={form.genderCategory}
                    onChange={handleChange}
                  >
                    {GENDER_CATEGORIES.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Skill Level">
                  <select
                    className={styles.select}
                    name="skillLevel"
                    value={form.skillLevel}
                    onChange={handleChange}
                  >
                    {SKILL_LEVELS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </FormSection>

            {/* Section 2: Date & Time */}
            <FormSection number="02" title="Date & Time">
              <div className={styles.fieldRow}>
                <Field label="Start Date" required error={errors.startDate}>
                  <input
                    className={`${styles.input} ${errors.startDate ? styles.inputError : ""}`}
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </Field>
                <Field label="Start Time" required error={errors.startTime}>
                  <input
                    className={`${styles.input} ${errors.startTime ? styles.inputError : ""}`}
                    name="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={handleChange}
                  />
                </Field>
              </div>
              <div className={styles.fieldRow}>
                <Field label="End Date">
                  <input
                    className={styles.input}
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                  />
                </Field>
                <Field label="End Time">
                  <input
                    className={styles.input}
                    name="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </FormSection>

            {/* Section 3: Location */}
            <FormSection number="03" title="Location">
              <Field label="Venue / Address" required error={errors.location}>
                <input
                  className={`${styles.input} ${errors.location ? styles.inputError : ""}`}
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Lakewood Stadium, Field 3"
                />
              </Field>
              <div className={styles.fieldRow}>
                <Field label="City" required error={errors.city}>
                  <input
                    className={`${styles.input} ${errors.city ? styles.inputError : ""}`}
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Atlanta"
                  />
                </Field>
                <Field label="State" required error={errors.state}>
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

            {/* Section 4: Requirements */}
            <FormSection number="04" title="Requirements">
              <Field label="Requirements & Notes">
                <textarea
                  className={styles.textarea}
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  placeholder="e.g. Players must be 18+. Bring cleats and shin guards."
                  rows={3}
                />
              </Field>
            </FormSection>
          </div>

          {/* Right column: sticky sidebar */}
          <aside className={styles.formSidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarCardTitle}>Registration</div>

              <Field label="Max Capacity">
                <input
                  className={styles.input}
                  name="maxCapacity"
                  type="number"
                  min={1}
                  value={form.maxCapacity}
                  onChange={handleChange}
                  placeholder="Unlimited"
                />
              </Field>

              <Field label="Entry Fee ($)">
                <input
                  className={styles.input}
                  name="entryFee"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.entryFee}
                  onChange={handleChange}
                  placeholder="0.00 (Free)"
                />
              </Field>

              <div className={styles.sidebarDivider} />

              <button
                className={styles.publishBtnFull}
                onClick={handlePublish}
                disabled={submitting}
              >
                {submitting ? "Publishing..." : "Publish Event"}
              </button>
              <button
                className={styles.draftBtnFull}
                onClick={handleSaveDraft}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save as Draft"}
              </button>

              <p className={styles.sidebarNote}>
                Drafts are only visible to you. Published events are visible to
                everyone.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
