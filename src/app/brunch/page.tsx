import Link from "next/link";
import styles from "./page.module.css";

const menu = [
  "Something warm from the oven",
  "Seasonal fruit and yoghurt",
  "Fresh coffee, tea, and juice",
];

export const metadata = {
  title: "Brunch at Tanmoy's",
  description: "A small brunch at Tanmoy's.",
};

export default function BrunchPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link className={styles.wordmark} href="/">
          tanmoy&apos;s
        </Link>
        <Link className={styles.homeLink} href="/">
          back home
        </Link>
      </nav>

      <section className={styles.invitation}>
        <p className={styles.kicker}>an invitation</p>
        <h1>Brunch<br /><em>at Tanmoy&apos;s</em></h1>
        <p className={styles.intro}>
          I&apos;m hosting a small brunch and would love for you to join me.
          Nothing formal — just good food, slow conversation, and a relaxed
          Sunday morning.
        </p>

        <div className={styles.details}>
          <div>
            <span className={styles.label}>when</span>
            <p>Sunday, 10:30 am</p>
          </div>
          <div>
            <span className={styles.label}>where</span>
            <p>At my place, Kolkata</p>
          </div>
        </div>

        <a className={styles.rsvp} href="mailto:hello@tanmoysg.com?subject=Brunch%20at%20Tanmoy%27s">
          I&apos;ll be there <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section className={styles.menu} aria-labelledby="menu-title">
        <div>
          <p className={styles.kicker}>a small menu</p>
          <h2 id="menu-title">A few things<br /><em>to share.</em></h2>
        </div>
        <div className={styles.menuList}>
          {menu.map((item, index) => (
            <p key={item}>
              <span>0{index + 1}</span>
              {item}
            </p>
          ))}
          <small>Menu may change a little with the morning.</small>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>come as you are</span>
        <span>tanmoy&apos;s · 2026</span>
      </footer>
    </main>
  );
}
