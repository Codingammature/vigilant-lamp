import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="glass-container" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <h2 style={{ margin: 0, background: 'var(--secondary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
        PhonePe Clone
      </h2>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/add-funds">Add Funds</Link>
            <Link to="/transfer">Transfer</Link>
            <button onClick={handleLogout} className="btn-glass" style={{ width: 'auto', padding: '10px 20px', marginLeft: '1rem' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
