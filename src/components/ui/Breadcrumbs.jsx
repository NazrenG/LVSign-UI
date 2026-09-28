import { Fragment } from "react";
import { Link } from "react-router-dom";

/** items: [{ label, to? }] — the last item is the current page. */
export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-ink-muted">
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && <li aria-hidden>/</li>}
            <li>
              {item.to ? (
                <Link to={item.to} className="text-primary hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={index === items.length - 1 ? "page" : undefined}
                  className="text-ink"
                >
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
