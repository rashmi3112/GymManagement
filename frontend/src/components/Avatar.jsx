// src/components/Avatar.jsx
const COLORS = [
  ['#6c63ff', '#4d44dd'],
  ['#ff6b9d', '#d44f7e'],
  ['#00d4b1', '#00a88d'],
  ['#ffd166', '#cc9f33'],
  ['#ff5757', '#cc3333'],
  ['#4cc9f0', '#1a9fc7'],
];

function getColor(name = '') {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[idx];
}

export default function Avatar({ name = '', photoURL, size = 'md', className = '' }) {
  const sizeClass = `avatar-${size}`;
  const [bg, end] = getColor(name);
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        className={`avatar ${sizeClass} ${className}`}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }

  return (
    <div
      className={`avatar-placeholder ${sizeClass} ${className}`}
      style={{ background: `linear-gradient(135deg, ${bg}, ${end})`, color: 'white' }}
      title={name}
    >
      {initials}
    </div>
  );
}
