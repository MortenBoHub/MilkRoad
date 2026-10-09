import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";

/**
 * Inert nav tabs. Only "Log in" is a real route; the rest are set dressing that
 * deliberately do NOT navigate, so we don't ship dead links.
 */
const INERT_TABS = ["Home", "Account", "Cart"];

/**
 * Decorative desert-road scene, drawn inline so it adds no image files (and no
 * Docker weight). `aria-hidden` keeps it out of the accessibility tree.
 */
function BannerScene() {
  return (
    <svg
      className="banner__scene"
      viewBox="0 0 1000 150"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="mr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a120a" />
          <stop offset="1" stopColor="#15240f" />
        </linearGradient>
        <linearGradient id="mr-dune-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c2e15" />
          <stop offset="1" stopColor="#101a0c" />
        </linearGradient>
        <linearGradient id="mr-dune-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#263a1a" />
          <stop offset="1" stopColor="#0c1309" />
        </linearGradient>
      </defs>
      <rect width="1000" height="150" fill="url(#mr-sky)" />
      <circle cx="800" cy="46" r="30" fill="#22371a" />
      <circle cx="800" cy="46" r="18" fill="#2f4a24" />
      <path
        d="M0,96 C160,64 300,96 470,88 C650,80 800,98 1000,72 L1000,150 L0,150 Z"
        fill="url(#mr-dune-far)"
      />
      <path
        d="M0,118 C180,96 340,124 540,112 C720,102 860,126 1000,104 L1000,150 L0,150 Z"
        fill="url(#mr-dune-near)"
      />
      <path
        d="M470,150 C452,120 500,104 482,84 C470,70 500,56 512,44"
        fill="none"
        stroke="#3b5a28"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

/**
 * COMPONENTS layer: the marketplace chrome — banner, wordmark and tab nav.
 */
export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="banner">
        <BannerScene />
        <div className="banner__wordmark">
          <span className="banner__logo">MilkRoad</span>
          <span className="banner__tagline">Fine dairy · delivered discreetly</span>
        </div>
      </div>

      <nav className="nav" aria-label="Primary">
        <ul className="nav__list">
          {INERT_TABS.map((tab) => (
            <li key={tab}>
              <span className="nav__tab">{tab}</span>
            </li>
          ))}
          {user ? (
            <>
              <li>
                <Link className="nav__tab nav__tab--link" to="/sell">
                  Sell
                </Link>
              </li>
              <li>
                <Link className="nav__tab nav__tab--link" to="/orders">
                  Orders
                </Link>
              </li>
              {user.isAdmin ? (
                <li>
                  <Link className="nav__tab nav__tab--link" to="/admin">
                    Admin
                  </Link>
                </li>
              ) : null}
            </>
          ) : null}
          <li className="nav__end">
            {user ? (
              <span className="nav__user">
                <span className="nav__user-name">{user.userName}</span>
                <button
                  type="button"
                  className="nav__logout"
                  onClick={logout}
                >
                  Log out
                </button>
              </span>
            ) : (
              <Link className="nav__tab nav__tab--link" to="/login">
                Log in
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
