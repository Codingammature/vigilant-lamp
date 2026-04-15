import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="glass-container" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Create Account</h2>
      {error && <div className="alert-error">{error}</div>}
      <form onSubmit={handleRegister}>
        <input 
          name="name" 
          placeholder="Full Name" 
          className="input-glass" 
          onChange={handleChange} 
          required 
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          className="input-glass" 
          onChange={handleChange} 
          required 
        />
        <input 
          name="phone" 
          placeholder="Phone Number" 
          className="input-glass" 
          onChange={handleChange} 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          className="input-glass" 
          onChange={handleChange} 
          required 
        />
        <button type="submit" className="btn-glass" style={{ marginTop: '1rem' }}>Register</button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
