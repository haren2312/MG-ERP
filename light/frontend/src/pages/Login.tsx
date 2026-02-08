import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../i18n';
import LanguageSelector from '../components/LanguageSelector';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();
  console.log("Current detected language:", i18n.language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        padding: '40px',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <LanguageSelector />
          <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '28px' }}>
            🏪 {t('app_name')}
          </h1>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
            {t('login_page_under_title')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('username')}</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('enter_username')}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('enter_password')}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '5px',
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button button-primary"
            style={{ width: '100%', padding: '12px', fontSize: '16px' }}
          >
            {loading ? t('signing_in_loading') : t('sign_in')}
          </button>
        </form>       
      </div>
    </div>
  );
}

export default Login;
