import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import styles from "../../dashboard/sections/DashSection.module.css";

export default function ManageClubSection() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    async function fetchClubs() {
      try {
        const res = await axiosClient.get("/clubs/mine");
        const data = Array.isArray(res.data) ? res.data : [];
        setClubs(data);
        if (data.length > 0) {
          setSelectedClub(data[0]);
          setFormData(data[0]);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await axiosClient.put(
        `/clubs/${selectedClub.slug}`,
        formData,
      );
      setSelectedClub(res.data);
      setFormData(res.data);
      setClubs((prev) =>
        prev.map((c) => (c.id === res.data.id ? res.data : c)),
      );
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <div className={styles.greeting}>// Club</div>
            <h1 className={styles.title}>Club Profile</h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Loading clubs...</div>
        </div>
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <div className={styles.greeting}>// Club</div>
            <h1 className={styles.title}>Club Profile</h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏛️</div>
          <div className={styles.emptyText}>
            You don't manage any clubs yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div>
          <div className={styles.greeting}>// Club</div>
          <h1 className={styles.title}>Club Profile</h1>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {saveSuccess && (
            <span
              style={{
                fontSize: "0.85rem",
                fontStyle: "italic",
                color: "#40916c",
              }}
            >
              ✓ Saved
            </span>
          )}
          {editing ? (
            <>
              <button
                className={styles.ghostBtn}
                onClick={() => {
                  setFormData(selectedClub);
                  setEditing(false);
                }}
              >
                Cancel
              </button>
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
              Edit Club
            </button>
          )}
        </div>
      </div>

      {/* Club selector if admin manages multiple clubs */}
      {clubs.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {clubs.map((c) => (
            <button
              key={c.id}
              className={
                selectedClub?.id === c.id ? styles.primaryBtn : styles.ghostBtn
              }
              onClick={() => {
                setSelectedClub(c);
                setFormData(c);
                setEditing(false);
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className={styles.profileGrid}>
        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>
            {selectedClub?.name?.[0] || "C"}
          </div>
          <div className={styles.profileName}>{selectedClub?.name}</div>
          {(selectedClub?.city || selectedClub?.state) && (
            <div className={styles.profileLocation}>
              📍{" "}
              {[selectedClub.city, selectedClub.state]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}
          {selectedClub?.description && (
            <>
              <div className={styles.profileDivider} />
              <div className={styles.profileBioLabel}>About</div>
              <div className={styles.profileBio}>
                {selectedClub.description}
              </div>
            </>
          )}
        </div>

        <div className={styles.profileFields}>
          <div className={styles.fieldGroup}>
            <div className={styles.fieldGroupTitle}>Club Info</div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Club Name</label>
              <input
                className={styles.fieldInput}
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Website</label>
              <input
                className={styles.fieldInput}
                name="website"
                value={formData.website || ""}
                onChange={handleChange}
                disabled={!editing}
                placeholder="https://..."
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
              <label className={styles.fieldLabel}>Description</label>
              <textarea
                className={styles.fieldInput}
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                disabled={!editing}
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
