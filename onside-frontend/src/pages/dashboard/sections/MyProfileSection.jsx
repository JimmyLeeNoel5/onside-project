import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import styles from "./DashSection.module.css";

// ─────────────────────────────────────────────────────────────────────────────
// ENUM OPTIONS
// These must match the backend enum values EXACTLY (case-sensitive).
// The select dropdowns use these as option values. When submitted,
// the string "MIDFIELDER" is sent to the backend, and Spring/Jackson
// deserializes it into the PlayerPosition.MIDFIELDER enum automatically.
// ─────────────────────────────────────────────────────────────────────────────

const POSITIONS = [
  { value: "", label: "Select position" },
  { value: "GOALKEEPER", label: "Goalkeeper (GK)" },
  { value: "DEFENDER", label: "Defender (DF)" },
  { value: "MIDFIELDER", label: "Midfielder (MF)" },
  { value: "FORWARD", label: "Forward (FW)" },
  { value: "WINGER", label: "Winger" },
  { value: "STRIKER", label: "Striker" },
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

const DOMINANT_FEET = [
  { value: "", label: "Select foot" },
  { value: "RIGHT", label: "Right" },
  { value: "LEFT", label: "Left" },
  { value: "BOTH", label: "Both" },
];

export default function MyProfileSection() {
  // ── State ──────────────────────────────────────────────────────────────────

  const [profile, setProfile] = useState(null); // data returned by GET /users/me
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // editing controls whether the form inputs are enabled or disabled
  const [editing, setEditing] = useState(false);

  // saving is true while the PUT /users/me request is in flight
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // formData holds the live values of all editable fields.
  // It starts as a copy of the API response and is updated as the user types.
  // When the user saves, formData is what gets sent to the backend.
  // When the user cancels, formData is reset back to `profile` (last saved state).
  const [formData, setFormData] = useState({});

  // ── Fetch profile on mount ─────────────────────────────────────────────────
  // GET /users/me returns a flat object with fields from both the `users`
  // table (email, authProvider) and `user_profiles` table (name, soccer info).
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosClient.get("/users/me");
        setProfile(res.data);
        // Pre-populate formData so inputs show real values when edit mode opens
        setFormData(res.data);
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // ── Generic change handler ─────────────────────────────────────────────────
  // One handler for all inputs — reads e.target.name to know which field to update.
  // The `name` attribute on each input must match the field name in UserUpdateDto.
  // Checkboxes use `checked` instead of `value`, hence the type check.
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // ── Save handler ───────────────────────────────────────────────────────────
  // Sends formData to PUT /users/me.
  // The backend does null-safe partial updates — only non-null fields are saved.
  // On success, we update `profile` with the response and exit edit mode.
  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await axiosClient.put("/users/me", formData);
      // Update both profile (source of truth) and formData with the response
      setProfile(res.data);
      setFormData(res.data);
      setEditing(false);
      setSaveSuccess(true);
      // Auto-hide the success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Cancel handler ─────────────────────────────────────────────────────────
  // Resets formData back to the last successfully saved profile.
  // This discards any unsaved changes the user made.
  function handleCancel() {
    setFormData(profile); // profile is always the last saved state
    setEditing(false);
    setSaveError(null);
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <div className={styles.greeting}>// Account</div>
            <h1 className={styles.title}>My Profile</h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Loading profile...</div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <div className={styles.greeting}>// Account</div>
            <h1 className={styles.title}>My Profile</h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚠️</div>
          <div className={styles.emptyText}>
            {error || "Profile not found."}
          </div>
        </div>
      </div>
    );
  }

  // Build avatar initials from first + last name
  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.section}>
      {/* ── Header ────────────────────────────────────────────────────────────
          Shows either the Edit button (view mode) or Save + Cancel (edit mode).
          The Save button is disabled while the PUT request is in flight.
      ────────────────────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <div className={styles.greeting}>// Account</div>
          <h1 className={styles.title}>My Profile</h1>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* Success toast — appears briefly after a successful save */}
          {saveSuccess && (
            <span
              style={{
                fontSize: "0.85rem",
                fontStyle: "italic",
                color: "#40916c",
              }}
            >
              ✓ Changes saved
            </span>
          )}
          {editing ? (
            <>
              {/* Cancel resets formData to last saved state */}
              <button className={styles.ghostBtn} onClick={handleCancel}>
                Cancel
              </button>
              {/* Save calls PUT /users/me */}
              <button
                className={styles.primaryBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              className={styles.primaryBtn}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Inline error message if the save fails */}
      {saveError && (
        <div
          style={{
            color: "#e63946",
            fontStyle: "italic",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          {saveError}
        </div>
      )}

      <div className={styles.profileGrid}>
        {/* ── Left column: identity card ──────────────────────────────────────
            Read-only summary — avatar initials, full name, email, location.
            Stats are still "—" until a /users/me/stats endpoint is built.
        ────────────────────────────────────────────────────────────────────── */}
        <div className={styles.profileCard}>
          {/* Avatar — initials placeholder until avatarUrl is implemented */}
          <div className={styles.profileAvatar}>{initials}</div>
          <div className={styles.profileName}>
            {profile.firstName} {profile.lastName}
          </div>
          <div className={styles.profileHandle}>{profile.email}</div>
          {(profile.city || profile.state) && (
            <div className={styles.profileLocation}>
              📍 {[profile.city, profile.state].filter(Boolean).join(", ")}
            </div>
          )}

          <div className={styles.profileDivider} />

          {/* Stats — mock "—" until GET /users/me/stats endpoint is built */}
          <div className={styles.profileStatGrid}>
            <div className={styles.profileStat}>
              <div className={styles.profileStatVal}>—</div>
              <div className={styles.profileStatLabel}>Leagues</div>
            </div>
            <div className={styles.profileStat}>
              <div className={styles.profileStatVal}>—</div>
              <div className={styles.profileStatLabel}>Teams</div>
            </div>
            <div className={styles.profileStat}>
              <div className={styles.profileStatVal}>—</div>
              <div className={styles.profileStatLabel}>Matches</div>
            </div>
          </div>

          {/* Bio — only rendered if the user has set one */}
          {profile.bio && (
            <>
              <div className={styles.profileDivider} />
              <div className={styles.profileBioLabel}>Bio</div>
              <div className={styles.profileBio}>{profile.bio}</div>
            </>
          )}
        </div>

        {/* ── Right column: editable fields ───────────────────────────────────
            All inputs are disabled when editing=false (view mode).
            When editing=true, inputs are live and update formData via handleChange.
            The `name` prop on each input MUST match the UserUpdateDto field name exactly.
        ────────────────────────────────────────────────────────────────────── */}
        <div className={styles.profileFields}>
          {/* Personal Info */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldGroupTitle}>Personal Info</div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>First Name</label>
                <input
                  className={styles.fieldInput}
                  name="firstName" // matches UserUpdateDto.firstName
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Last Name</label>
                <input
                  className={styles.fieldInput}
                  name="lastName" // matches UserUpdateDto.lastName
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>
            </div>

            {/* Email is always read-only — changing email requires a separate auth flow */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Email</label>
              <input
                className={styles.fieldInput}
                value={profile.email}
                disabled
                type="email"
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>City</label>
                <input
                  className={styles.fieldInput}
                  name="city"
                  value={formData.city || ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>State</label>
                <input
                  className={styles.fieldInput}
                  name="state"
                  value={formData.state || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  maxLength={2}
                  placeholder="GA"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Bio</label>
              {/* textarea for multi-line bio */}
              <textarea
                className={styles.fieldInput}
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                disabled={!editing}
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          {/* Soccer Info */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldGroupTitle}>Soccer Info</div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Primary Position</label>
                {/* Value sent to backend: "MIDFIELDER" — matches PlayerPosition enum */}
                <select
                  className={styles.fieldInput}
                  name="primaryPosition"
                  value={formData.primaryPosition || ""}
                  onChange={handleChange}
                  disabled={!editing}
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Preferred Foot</label>
                {/* Value sent to backend: "RIGHT" — matches DominantFoot enum */}
                <select
                  className={styles.fieldInput}
                  name="dominantFoot"
                  value={formData.dominantFoot || ""}
                  onChange={handleChange}
                  disabled={!editing}
                >
                  {DOMINANT_FEET.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Skill Level</label>
                {/* Value sent to backend: "RECREATIONAL" — matches SkillLevel enum */}
                <select
                  className={styles.fieldInput}
                  name="skillLevel"
                  value={formData.skillLevel || ""}
                  onChange={handleChange}
                  disabled={!editing}
                >
                  {SKILL_LEVELS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Jersey Number</label>
                <input
                  className={styles.fieldInput}
                  name="jerseyNumber"
                  type="number"
                  min={0}
                  max={99}
                  value={formData.jerseyNumber ?? ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldGroupTitle}>Security</div>
            {/* Change Password will need its own endpoint — placeholder for now */}
            <button className={styles.ghostBtn}>Change Password →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
