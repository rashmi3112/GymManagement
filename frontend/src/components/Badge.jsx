// src/components/Badge.jsx
export default function Badge({ children, variant = 'neutral', dot = false }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}
