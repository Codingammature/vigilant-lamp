import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function TransferMoney() {
  const [destType, setDestType] = useState('phone'); // phone, upi
  const [fundingSource, setFundingSource] = useState('WALLET'); // WALLET, CARD, NETBANKING
  
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/transactions/transfer',
        { receiverPhone: receiverId, amount: Number(amount), paymentMethod: fundingSource },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus({ type: 'success', message: '✅ Transfer successful! Amount sent securely.' });
      setReceiverId('');
      setAmount('');
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Transfer failed. Check credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-container" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Send Money</h2>
      <p style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.9rem', marginBottom: '2rem' }}>
        Instant, zero-fee transfers to any user.
      </p>
      
      {status && (
        <div className={status.type === 'success' ? 'alert-success' : 'alert-error'}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleTransfer}>
        {/* Destination Tabs */}
        <div className="input-group">
          <label className="input-label">Send To</label>
          <div className="tabs-container">
            <button type="button" className={`tab-btn ${destType === 'phone' ? 'active' : ''}`} onClick={() => setDestType('phone')}>📱 Phone</button>
            <button type="button" className={`tab-btn ${destType === 'upi' ? 'active' : ''}`} onClick={() => setDestType('upi')}>⚡ UPI ID</button>
          </div>
          
          <input 
            type={destType === 'phone' ? 'tel' : 'email'} 
            placeholder={destType === 'phone' ? 'Enter 10-digit mobile number' : 'e.g. user@ybl (Try email)'} 
            className="input-glass" 
            value={receiverId} 
            onChange={(e) => setReceiverId(e.target.value)} 
            required 
          />
        </div>

        {/* Amount Input */}
        <div className="input-group">
          <label className="input-label">Transfer Amount</label>
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
        </div>

        {/* Funding Source Selection */}
        <div className="input-group" style={{ marginTop: '2.5rem' }}>
          <label className="input-label">Pay Using</label>
          <div className="tabs-container" style={{ margin: '0 0 1rem 0' }}>
            <button type="button" className={`tab-btn ${fundingSource === 'WALLET' ? 'active' : ''}`} onClick={() => setFundingSource('WALLET')}>Wallet</button>
            <button type="button" className={`tab-btn ${fundingSource === 'CARD' ? 'active' : ''}`} onClick={() => setFundingSource('CARD')}>Debit Card</button>
            <button type="button" className={`tab-btn ${fundingSource === 'NET_BANKING' ? 'active' : ''}`} onClick={() => setFundingSource('NET_BANKING')}>Net Banking</button>
          </div>
          
          {fundingSource === 'WALLET' && (
            <div style={{ padding: '12px 18px', background: 'rgba(6, 214, 160, 0.1)', border: '1px solid rgba(6, 214, 160, 0.3)', borderRadius: '14px', fontSize: '0.9rem', color: '#bffff0' }}>
              ✓ Instant deduction from your PhonePe Wallet balance.
            </div>
          )}

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
                <option value="">Select Bank (Dummy)</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
              </select>
            </div>
          )}
        </div>
        
        <button type="submit" className="btn-glass" style={{ marginTop: '1.5rem', height: '56px' }} disabled={isLoading}>
          {isLoading ? 'Processing...' : `Pay ₹${amount || '0'}`}
        </button>
      </form>
    </div>
  );
}
