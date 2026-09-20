import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-site py-28 text-center">
      <h1 className="display text-5xl">Page not found</h1>
      <p className="mt-4 text-muted">The page you requested is not available.</p>
      <Link href="/" className={buttonClass("dark", "mt-8")}>
        Back home
      </Link>
    </div>
  );
}
