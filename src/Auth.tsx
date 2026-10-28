
import { useState, type FormEvent } from 'react'
import { supabase } from './supabase'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim()
            }
          }
        })

        if (error) throw error

        setSuccess(
          'Registration successful! Please check your email to confirm your account.'
        )
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">K</div>

        <h1>{isLogin ? 'Welcome back!' : 'Create your account'}</h1>

        <p className="auth-subtitle">
          {isLogin
            ? 'Sign in to continue to Klyro.'
            : 'Join the Klyro community today.'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <label htmlFor="auth-username">USERNAME</label>
              <input
                id="auth-username"
                type="text"
                placeholder="Your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                minLength={3}
                maxLength={24}
                required
              />
            </>
          )}

          <label htmlFor="auth-email">EMAIL</label>
          <input
            id="auth-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label htmlFor="auth-password">PASSWORD</label>
          <input
            id="auth-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin
            ? "Don't have an account?"
            : 'Already have an account?'}

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setSuccess('')
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
