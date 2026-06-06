/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

// Create the Auth Context
export const AuthContext = createContext(null)

// Custom hook to consume the Auth Context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function App({ children }) {
  const [count, setCount] = useState(0)
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((err) => {
      console.error('Error fetching session:', err)
      setLoading(false)
    })

    // Listen to auth state changes (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Auth helper methods
  const signUpWithEmail = async (email, password, options = {}) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        ...options,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const loginWithEmail = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async (options = {}) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        ...options,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signUpWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children || (
        <>
          <section id="center">
            <div className="hero">
              <img src={heroImg} className="base" width="170" height="179" alt="" />
              <img src={reactLogo} className="framework" alt="React logo" />
              <img src={viteLogo} className="vite" alt="Vite logo" />
            </div>
            <div>
              <h1>Get started</h1>
              <p>
                Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
              </p>
            </div>
            <button
              type="button"
              className="counter"
              onClick={() => setCount((count) => count + 1)}
            >
              Count is {count}
            </button>
          </section>

          <div className="ticks"></div>

          <section id="next-steps">
            <div id="docs">
              <svg className="icon" role="presentation" aria-hidden="true">
                <use href="/icons.svg#documentation-icon"></use>
              </svg>
              <h2>Documentation</h2>
              <p>Your questions, answered</p>
              <ul>
                <li>
                  <a href="https://vite.dev/" target="_blank">
                    <img className="logo" src={viteLogo} alt="" />
                    Explore Vite
                  </a>
                </li>
                <li>
                  <a href="https://react.dev/" target="_blank">
                    <img className="button-icon" src={reactLogo} alt="" />
                    Learn more
                  </a>
                </li>
              </ul>
            </div>
            <div id="social">
              <svg className="icon" role="presentation" aria-hidden="true">
                <use href="/icons.svg#social-icon"></use>
              </svg>
              <h2>Connect with us</h2>
              <p>Join the Vite community</p>
              <ul>
                <li>
                  <a href="https://github.com/vitejs/vite" target="_blank">
                    <svg
                      className="button-icon"
                      role="presentation"
                      aria-hidden="true"
                    >
                      <use href="/icons.svg#github-icon"></use>
                    </svg>
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://chat.vite.dev/" target="_blank">
                    <svg
                      className="button-icon"
                      role="presentation"
                      aria-hidden="true"
                    >
                      <use href="/icons.svg#discord-icon"></use>
                    </svg>
                    Discord
                  </a>
                </li>
                <li>
                  <a href="https://x.com/vite_js" target="_blank">
                    <svg
                      className="button-icon"
                      role="presentation"
                      aria-hidden="true"
                    >
                      <use href="/icons.svg#x-icon"></use>
                    </svg>
                    X.com
                  </a>
                </li>
                <li>
                  <a href="https://bsky.app/profile/vite.dev" target="_blank">
                    <svg
                      className="button-icon"
                      role="presentation"
                      aria-hidden="true"
                    >
                      <use href="/icons.svg#bluesky-icon"></use>
                    </svg>
                    Bluesky
                  </a>
                </li>
              </ul>
            </div>
          </section>

          <div className="ticks"></div>
          <section id="spacer"></section>
        </>
      )}
    </AuthContext.Provider>
  )
}

export default App
