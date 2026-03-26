import styles from "./MarqueeSection.module.css";

const PHOTOS = [
  "/images/web2.jpg",
  "/images/web4.jpg",
  "/images/web5.jpg",
  "/images/web7.jpg",
  "/images/web9.jpg",
  "/images/web12.jpg",
  "/images/web8.jpg",
  "/images/web14.jpg",
];

export default function MarqueeSection() {
  // Duplicate the array so the scroll loops seamlessly
  const photos = [...PHOTOS, ...PHOTOS];

  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        {photos.map((src, i) => (
          <div key={i} className={styles.item}>
            <img src={src} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}
