import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../App';
import styles from './Auth.module.css';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, options?: any) => Promise<any>;
  loginWithEmail: (email: string, password: string) => Promise<any>;
  loginWithGoogle: (options?: any) => Promise<any>;
  logout: () => Promise<any>;
}

export default function Auth() {
  const { t } = useTranslation();
  const { user, signUpWithEmail, loginWithEmail, loginWithGoogle } = useAuth() as AuthContextType;
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get the redirect path from state, defaulting to Home '/'
  const from = (location.state as any)?.from || '/';

  // If already logged in, redirect away
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError(t('auth.errorEmptyFields', '請填寫所有必要欄位'));
      return;
    }

    if (activeTab === 'register' && password !== confirmPassword) {
      setError(t('auth.errorPasswordMismatch', '密碼與確認密碼不一致'));
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'login') {
        const { error: loginErr } = await loginWithEmail(email, password);
        if (loginErr) throw loginErr;
        setSuccess(t('auth.loginSuccess', '登入成功！'));
      } else {
        const { error: signUpErr } = await signUpWithEmail(email, password);
        if (signUpErr) throw signUpErr;
        setSuccess(t('auth.registerSuccess', '註冊成功！請檢查您的電子郵件信箱以完成驗證。'));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('auth.errorGeneric', '發生錯誤，請稍後再試'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: googleErr } = await loginWithGoogle();
      if (googleErr) throw googleErr;
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('auth.errorGeneric', '發生錯誤，請稍後再試'));
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>{t('auth.title', '和弦分享工具')}</h1>
          <p>{t('auth.subtitle', '編輯個人曲目、轉調與樂器偏好')}</p>
        </div>

        {/* OAuth Google Sign In */}
        <div className={styles.oauthSection}>
          <button 
            type="button" 
            className={styles.googleBtn} 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className={styles.googleIcon} viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.3C17.24 1.24 14.8.4 12 .4 7.35.4 3.4 3.08 1.6 7l3.96 3.1c.93-2.83 3.58-5.06 6.44-5.06z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.275c0-.825-.075-1.613-.21-2.375H12v4.51h6.44c-.28 1.48-1.11 2.73-2.37 3.58l3.69 2.87c2.16-2 3.73-4.94 3.73-8.585z"
              />
              <path
                fill="#FBBC05"
                d="M5.56 14.9c-.24-.7-.37-1.46-.37-2.25s.13-1.55.37-2.25L1.6 7.3C.58 9.36 0 11.62 0 13.9s.58 4.54 1.6 6.6l3.96-3.2z"
              />
              <path
                fill="#34A853"
                d="M12 23.6c3.24 0 5.97-1.08 7.96-2.91l-3.69-2.87c-1.02.69-2.33 1.1-4.27 1.1-2.86 0-5.51-2.23-6.44-5.06L1.6 17.06C3.4 20.92 7.35 23.6 12 23.6z"
              />
            </svg>
            <span>{t('auth.googleBtn', '使用 Google 帳號登入')}</span>
          </button>
        </div>

        <div className={styles.divider}>
          <span>{t('auth.or', '或')}</span>
        </div>

        {/* Tab Selectors */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'login' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('login')}
          >
            {t('auth.tabLogin', '登入')}
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'register' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('register')}
          >
            {t('auth.tabRegister', '註冊')}
          </button>
        </div>

        {/* Feedback Messages */}
        {error && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>{success}</div>}

        {/* Form Fields */}
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">{t('auth.email', '電子郵件')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">{t('auth.password', '密碼')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              disabled={loading}
              required
            />
          </div>

          {activeTab === 'register' && (
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">{t('auth.confirmPassword', '確認密碼')}</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                disabled={loading}
                required
              />
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span>{t('auth.loading', '處理中...')}</span>
            ) : (
              <span>
                {activeTab === 'login' ? t('auth.btnSubmitLogin', '登入') : t('auth.btnSubmitRegister', '註冊帳號')}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
