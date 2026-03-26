import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import styles from "../../dashboard/sections/DashSection.module.css";

const ROLE_LABEL = {
  OWNER: "Owner",
  ADMIN: "Admin",
  COACH: "Coach",
  ASSISTANT_COACH: "Asst. Coach",
  MANAGER: "Manager",
  STAFF: "Staff",
};

export default function ManageStaffSection() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(false);

  useEffect(() => {
    async function fetchClubs() {
      try {
        const res = await axiosClient.get("/clubs/mine");
        const data = Array.isArray(res.data) ? res.data : [];
        setClubs(data);
        if (data.length > 0) setSelectedClub(data[0]);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

  useEffect(() => {
    if (!selectedClub) return;
    async function fetchStaff() {
      setLoadingStaff(true);
      try {
        const res = await axiosClient.get(`/clubs/${selectedClub.slug}/staff`);
        setStaff(Array.isArray(res.data) ? res.data : []);
      } catch {
        setStaff([]);
      } finally {
        setLoadingStaff(false);
      }
    }
    fetchStaff();
  }, [selectedClub]);

  async function handleRemoveStaff(userId) {
    if (!window.confirm("Remove this staff member?")) return;
    try {
      await axiosClient.delete(`/clubs/${selectedClub.slug}/staff/${userId}`);
      setStaff((prev) => prev.filter((s) => s.userId !== userId));
    } catch {}
  }

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <div>
            <div className={styles.greeting}>// Club</div>
            <h1 className={styles.title}>Staff</h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div>
          <div className={styles.greeting}>// Club</div>
          <h1 className={styles.title}>Staff</h1>
        </div>
      </div>

      {/* Club selector */}
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
              onClick={() => setSelectedClub(c)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>{selectedClub?.name} — Staff</div>
          <span
            style={{
              fontSize: "0.82rem",
              fontStyle: "italic",
              color: "#64748b",
            }}
          >
            {staff.length} members
          </span>
        </div>

        {loadingStaff ? (
          <div className={styles.emptyText} style={{ padding: "1rem 0" }}>
            Loading staff...
          </div>
        ) : staff.length === 0 ? (
          <div className={styles.emptyText} style={{ padding: "1rem 0" }}>
            No staff members found.
          </div>
        ) : (
          <div className={styles.rosterTable}>
            <div className={styles.rosterHead}>
              <span>Name</span>
              <span>Role</span>
              <span>Email</span>
              <span>Action</span>
            </div>
            {staff.map((s, i) => (
              <div key={s.userId || i} className={styles.rosterRow}>
                <span className={styles.rosterName}>
                  {s.firstName} {s.lastName}
                </span>
                <span className={styles.rosterPos}>
                  {ROLE_LABEL[s.role] || s.role || "—"}
                </span>
                <span
                  className={styles.rosterPos}
                  style={{ fontSize: "0.8rem", color: "#64748b" }}
                >
                  {s.email || "—"}
                </span>
                <button
                  className={styles.ghostBtn}
                  style={{
                    fontSize: "0.75rem",
                    color: "#e63946",
                    borderColor: "rgba(230,57,70,0.3)",
                    padding: "0.25rem 0.6rem",
                  }}
                  onClick={() => handleRemoveStaff(s.userId)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add staff note */}
      <div className={styles.card} style={{ marginTop: "1rem" }}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Add Staff Member</div>
        </div>
        <div
          style={{
            padding: "0.5rem 0",
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: "italic",
            color: "#64748b",
            fontSize: "0.9rem",
          }}
        >
          To add a staff member, use the API: POST /clubs/{"{slug}"}/staff with
          their userId and role. A staff invite flow will be added in a future
          release.
        </div>
      </div>
    </div>
  );
}
