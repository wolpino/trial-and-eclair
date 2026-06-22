import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main className="home-page">
      <h1>Trial and Eclair</h1>
      <p>Recipe development and collection — not a blog.</p>
      <p className="home-note">
        Developer tools arrive in later phases. Open a published recipe at{" "}
        <code>/r/your-recipe-slug</code>.
      </p>
      <p>
        <Link to="/r/example">Example route</Link> (404 until you publish one)
      </p>
    </main>
  );
}
