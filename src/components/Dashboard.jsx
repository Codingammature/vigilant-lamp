import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Chatbot from './Chatbot';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userRes, txRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/me', config),
          axios.get('http://localhost:5000/api/transactions/history', config)
        ]);
        
        setUser(userRes.data);
        setTransactions(txRes.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (!user) return <div style={{ marginTop: '2rem', textAlign: 'center' }}>Loading your financial overview...</div>;

  return (
    <div className="dashboard-grid">
      {/* Left Column - Wallet & Actions */}
      <div>
        <div className="glass-container" style={{ padding: '2rem' }}>
          <h3 style={{ margin: 0, opacity: 0.9, fontSize: '1.2rem' }}>Welcome back,</h3>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {user.name}
          </h2>
          <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '2rem' }}>UPI: {user.phone}@ybl</p>
          
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.8rem', opacity: 0.8 }}>Available Balance</p>
            <h1 style={{ margin: '0.5rem 0', fontSize: '2.8rem', color: '#fff' }}>
              <span style={{ opacity: 0.7, fontSize: '2rem' }}>₹</span>{user.walletBalance.toLocaleString()}
            </h1>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ opacity: 0.8, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Quick Actions</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Link to="/transfer" className="btn-glass" style={{ textAlign: 'center', padding: '12px', fontSize: '0.95rem' }}>Send Money</Link>
              <Link to="/add-funds" className="btn-glass" style={{ textAlign: 'center', padding: '12px', fontSize: '0.95rem', background: 'var(--secondary-gradient)' }}>Top-up Wallet</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Transactions Feed */}
      <div className="glass-container" style={{ padding: '2rem', minHeight: '60vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Recent Activity</h3>
          <span style={{ fontSize: '0.85rem', opacity: 0.6, cursor: 'pointer' }}>View All</span>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.5 }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💸</div>
            <p>No transactions yet.<br/>Start by adding funds or sending money!</p>
          </div>
        ) : (
          <ul className="tx-list">
            {transactions.map(tx => {
              const isSender = tx.senderId?._id === user._id;
              const isAddFunds = tx.type === 'ADD_FUNDS';
              
              let title = '';
              let initial = '';
              if (isAddFunds) {
                title = 'Wallet Top-up';
                initial = '+';
              } else if (isSender) {
                title = `Sent to ${tx.receiverId?.name || 'Unknown'}`;
                initial = tx.receiverId?.name ? tx.receiverId.name[0].toUpperCase() : '?';
              } else {
                title = `Received from ${tx.senderId?.name || 'Unknown'}`;
                initial = tx.senderId?.name ? tx.senderId.name[0].toUpperCase() : '?';
              }

              let badgeClass = 'badge-pending';
              if (tx.status === 'SUCCESS') badgeClass = 'badge-success';
              if (tx.status === 'FAILED') badgeClass = 'badge-failed';

              return (
                <li key={tx._id} className="tx-item">
                  <div className="tx-details">
                    <div className="tx-avatar" style={{ background: isAddFunds ? 'var(--success-color)' : (isSender ? 'var(--primary-gradient)' : 'var(--secondary-gradient)') }}>
                      {initial}
                    </div>
                    <div>
                      <strong style={{ fontSize: '1.05rem', display: 'block' }}>{title}</strong>
                      <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '2px' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                      {tx.paymentMethod && tx.paymentMethod !== 'WALLET' && (
                        <div className="badge badge-method" style={{ fontSize: '0.65rem' }}>Via {tx.paymentMethod.replace('_', ' ')}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: isAddFunds || !isSender ? 'var(--success-color)' : 'white' }}>
                      {isAddFunds || !isSender ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </div>
                    <div className={`badge ${badgeClass}`} style={{ marginTop: '6px' }}>{tx.status}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Bottom Section - Fraud & Support */}
      <div className="glass-container" style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--error-color)' }}>🚨 Report Fraud</h3>
          </div>
          <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '0.5rem' }}>If you notice suspicious activity, freeze your account and contact our 24/7 fraud department.</p>
          <div style={{ background: 'rgba(255, 77, 109, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 77, 109, 0.3)', marginTop: '1rem' }}>
            <div style={{ fontWeight: '600' }}>National Cyber Crime Helpline</div>
            <div style={{ fontSize: '1.2rem', margin: '4px 0', fontWeight: 'bold' }}>📞 1930</div>
            <div>🌐 <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" style={{color: 'var(--text-primary)'}}>cybercrime.gov.in</a></div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--secondary-color)' }}>📞 Help & Support</h3>
          </div>
          <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '1rem' }}>Need assistance with a transfer or wallet issue? Our support team is here to help.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.95rem' }}>
            <li style={{ marginBottom: '10px' }}><strong>Toll Free:</strong> <span style={{opacity: 0.9}}>1800-419-0157</span></li>
            <li style={{ marginBottom: '10px' }}><strong>Email:</strong> <span style={{opacity: 0.9}}>support@phonepe-clone.com</span></li>
            <li><strong>Availability:</strong> <span style={{opacity: 0.9}}>24/7 Phone & Email Support</span></li>
          </ul>
        </div>
      </div>

      <Chatbot />
    </div>
  );
}
