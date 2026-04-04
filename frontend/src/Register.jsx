import { useState } from 'react'
import { motion } from 'framer-motion'
import { apiRequest } from './utils/api'
import Footer from './Footer'
import './Register.css'

function Register({ setCurrentPage }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await apiRequest(
        "/api/auth/register",
        "POST",
        { name, email, password }
      )

      alert(response.message || "Registration successful")

      if (response.message === "User registered successfully") {
        setCurrentPage("login")
      }
    } catch (error) {
      alert("Registration failed: " + error.message)
    }

    setIsLoading(false)
  }

  return (
    <div className="register-page">
      <div className="register-main">
        <motion.div className="register-container">
          <div className="register-header">
            <h1>Create Account</h1>
            <p>Join ShunyaAI today</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
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
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have an account?{" "}
              <button
                className="link-btn"
                onClick={() => setCurrentPage('login')}
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  )
}

export default Register