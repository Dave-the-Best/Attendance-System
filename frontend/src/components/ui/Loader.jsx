export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="content">
      <div className="loader">
        <div className="spinner" />
        {label}
      </div>
    </div>
  );
}
