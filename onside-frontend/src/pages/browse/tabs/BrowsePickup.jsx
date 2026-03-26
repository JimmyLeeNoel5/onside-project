import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import styles from "./BrowseTab.module.css";
import pickupStyles from "./BrowsePickup.module.css";

const GENDER_LABEL = {
  MALE: "Men's",
  FEMALE: "Women's",
  COED: "Co-Ed",
  OPEN: "Open",
};

const SUBTAB_GENDER_MAP = {
  "pickup-mens": "MALE",
  "pickup-womens": "FEMALE",
  "pickup-coed": "COED",
};

const DAYS = ["Any Day", "Today", "Tomorrow", "This Weekend", "This Week"];

export default function BrowsePickup({ subtab }) {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zipcode, setZipcode] = useState("");
  const [radius, setRadius] = useState("10");
  const [day, setDay] = useState("Any Day");
  const [searched, setSearched] = useState(false);

  // Reset when subtab changes
  useEffect(() => {
    setEvents([]);
    setZipcode("");
    setRadius("10");
    setDay("Any Day");
    setSearched(false);
    setError(null);
  }, [subtab]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!zipcode.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const params = new URLSearchParams({ type: "PICKUP", zipcode: zipcode.trim(), radius });
      const category = SUBTAB_GENDER_MAP[subtab];
      if (category) params.append("category", category);
      if (day !== "Any Day") params.append("day", day);
      const res = await axiosClient.get(`/events/search?${params.toString()}`);
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to search pickup games. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Zipcode search bar */}
      <form className={pickupStyles.zipcodeForm} onSubmit={handleSearch}>
        <div className={pickupStyles.zipcodeWrap}>
          <svg
            className={pickupStyles.zipcodeIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <input
            className={pickupStyles.zipcodeInput}
            type="text"
            placeholder="Enter zip code..."
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            maxLength={10}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Radius</label>
          <select
            className={styles.filter}
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
          >
            <option value="5">5 mi</option>
            <option value="10">10 mi</option>
            <option value="25">25 mi</option>
            <option value="50">50 mi</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Day</label>
          <select
            className={styles.filter}
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            {DAYS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <button type="submit" className={pickupStyles.searchBtn}>
          Find Games
        </button>
      </form>

      {/* States */}
      {loading && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>Searching for pickup games near {zipcode}...</div>
        </div>
      )}

      {error && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⚠️</div>
          <div className={styles.emptyText}>{error}</div>
        </div>
      )}

      {!loading && !error && !searched && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⚽</div>
          <div className={styles.emptyText}>Enter your zip code to find pickup games nearby</div>
        </div>
      )}

      {!loading && !error && searched && (
        <>
          <div className={styles.resultsCount}>
            {events.length} pickup game{events.length !== 1 ? "s" : ""} found near {zipcode}
          </div>

          <div className={styles.grid}>
            {events.map((e) => {
              const genderLabel = GENDER_LABEL[e.genderCategory] || e.genderCategory || "";
              const startDate = e.startDate
                ? new Date(`${e.startDate}T${e.startTime || "00:00:00"}`).toLocaleDateString(
                    "en-US",
                    { weekday: "short", month: "short", day: "numeric" }
                  )
                : null;
              const startTime = e.startTime
                ? new Date(`2000-01-01T${e.startTime}`).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : null;

              return (
                <div
                  key={e.id}
                  className={styles.card}
                  onClick={() => navigate(`/events/${e.slug}`)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}>⚽</div>
                    <span
                      className={styles.statusBadge}
                      style={{
                        color: "#52b788",
                        borderColor: "rgba(82,183,136,0.3)",
                        background: "rgba(82,183,136,0.08)",
                      }}
                    >
                      Pickup
                    </span>
                  </div>
                  <div className={styles.cardName}>{e.name}</div>
                  <div className={styles.cardOrg}>{e.hostClubName || ""}</div>
                  <div className={styles.cardTags}>
                    {genderLabel && <span className={styles.cardTag}>{genderLabel}</span>}
                    {e.skillLevel && <span className={styles.cardTag}>{e.skillLevel}</span>}
                    {e.format && <span className={styles.cardTag}>{e.format}</span>}
                  </div>
                  <div className={styles.cardMeta}>
                    {(e.city || e.state) && (
                      <span>📍 {[e.city, e.state].filter(Boolean).join(", ")}</span>
                    )}
                    {startDate && (
                      <span>📅 {startDate}{startTime ? ` · ${startTime}` : ""}</span>
                    )}
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardFee}>
                      {e.individualFee ? `$${e.individualFee}` : "Free"}
                    </span>
                    <button
                      className={styles.cardBtn}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        navigate(`/events/${e.slug}`);
                      }}
                    >
                      View →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {events.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <div className={styles.emptyText}>
                No pickup games found within {radius} miles of {zipcode}
              </div>
              <button
                className={styles.emptyReset}
                onClick={() => {
                  setZipcode("");
                  setEvents([]);
                  setSearched(false);
                }}
              >
                Clear search
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
