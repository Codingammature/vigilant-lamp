import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function AddFunds() {
  const [amount, setAmount] = useState('');
  const [fundingSource, setFundingSource] = useState('CARD'); // CARD, NET_BANKING
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setStatus(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/transactions/add-funds',
        { amount: Number(amount), paymentMethod: fundingSource },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus({ type: 'success', message: `✅ Successfully added ₹${amount} to your wallet!` });
      setAmount('');
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to add funds.' });
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [500, 1000, 5000, 10000];

  return (
    <div className="glass-container" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <Link to="/dashboard" style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'inline-block' }}>← Back to Dashboard</Link>
      <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Top-up Wallet</h2>
      <p style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.9rem', marginBottom: '2rem' }}>
        Add funds securely using an external payment method.
      </p>

      {status && (
        <div className={status.type === 'success' ? 'alert-success' : 'alert-error'}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleAddFunds}>
        <div className="input-group">
          <label className="input-label">Amount to Add</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>₹</span>
            <input 
              type="number" 
              placeholder="0.00" 
              className="input-glass" 
              style={{ paddingLeft: '40px', fontSize: '1.4rem', fontWeight: '500' }}
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              min="1"
              required 
            />
          </div>
          <div className="action-pills" style={{ marginTop: '12px' }}>
            {quickAmounts.map(amt => (
              <button 
                type="button" 
                key={amt} 
                className="pill-btn" 
                onClick={() => setAmount(amt.toString())}
                style={{ background: amount === amt.toString() ? 'var(--glass-highlight)' : '' }}
              >
                +₹{amt}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group" style={{ marginTop: '2.5rem' }}>
          <label className="input-label">Funding Source</label>
          <div className="tabs-container" style={{ margin: '0 0 1rem 0' }}>
            <button type="button" className={`tab-btn ${fundingSource === 'CARD' ? 'active' : ''}`} onClick={() => setFundingSource('CARD')}>Debit / Credit Card</button>
            <button type="button" className={`tab-btn ${fundingSource === 'NET_BANKING' ? 'active' : ''}`} onClick={() => setFundingSource('NET_BANKING')}>Net Banking</button>
          </div>

          {fundingSource === 'CARD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'slideIn 0.3s ease' }}>
              <input type="text" placeholder="Card Number (Dummy)" className="input-glass" maxLength="19" required />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="MM/YY" className="input-glass" maxLength="5" required />
                <input type="password" placeholder="CVV" className="input-glass" maxLength="3" required />
              </div>
            </div>
          )}

          {fundingSource === 'NET_BANKING' && (
            <div style={{ animation: 'slideIn 0.3s ease' }}>
              <select className="input-glass" required>
                <option value="">Select your Bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
              </select>
            </div>
          )}
        </div>

        <button type="submit" className="btn-glass" style={{ marginTop: '1.5rem', height: '56px' }} disabled={isLoading}>
          {isLoading ? 'Processing...' : `Add ₹${amount || '0'} Securely`}
        </button>
      </form>
    </div>
  );
}
