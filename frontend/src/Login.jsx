import { useState } from 'react'
import { motion } from 'framer-motion'
import { apiRequest } from './utils/api'
import { useAuth } from './contexts/AuthContext'
import Footer from './Footer'
import './Login.css'

function Login({ setCurrentPage }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await apiRequest(
        "/api/auth/login",
        "POST",
        { email, password }
      )

      console.log("Login response:", response)

      if (response.accessToken) {
        login({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          role: response.role
        })

        setCurrentPage("dashboard")
      } else {
        alert(response.message || "Login failed")
      }

    } catch (error) {
      alert("Login failed: " + error.message)
    }

    setIsLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-main">
        <motion.div className="login-container">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your ShunyaAI account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="form-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <button
                className="link-btn"
                onClick={() => setCurrentPage('register')}
              >
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  )
}

export default Login