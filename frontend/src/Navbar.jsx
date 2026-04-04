import { useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Menu, X, PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import { useSidebar } from './contexts/SidebarContext'
import { useAuth } from './contexts/AuthContext'
import './Navbar.css'

function Navbar({ currentPage, setCurrentPage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isSidebarOpen, toggleSidebar } = useSidebar()
  const { user, logout } = useAuth()

  const navItems = [
    { id: 'home', label: 'Home', page: 'home' },
    ...(user ? [{ id: 'dashboard', label: 'Dashboard', page: 'dashboard' }] : []),
    ...(user ? [{ id: 'research', label: 'Research', page: 'research' }] : []),
    ...(user ? [{ id: 'insights', label: 'Insights', page: 'insights' }] : []),
    { id: 'about', label: 'About', page: 'about' },
  ]

  const handleNavClick = (page) => {
    setCurrentPage(page)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    setCurrentPage("login")
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <motion.button
            className="navbar-logo"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavClick('home')}
          >
            <Rocket className="navbar-logo-icon" size={24} />
            <span className="navbar-logo-text">ShunyaAI</span>
          </motion.button>
        </div>

        <div className="navbar-menu-desktop">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              className={`navbar-item ${currentPage === item.page ? 'active' : ''}`}
              onClick={() => handleNavClick(item.page)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
            </motion.button>
          ))}
        </div>

        {user && (
          <motion.button
            className="navbar-sidebar-toggle"
            onClick={toggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </motion.button>
        )}

        <div className="navbar-auth">
          {!user ? (
            <>
              <motion.button
                className="navbar-login-btn"
                onClick={() => handleNavClick('login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>

              <motion.button
                className="navbar-signup-btn"
                onClick={() => handleNavClick('register')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </>
          ) : (
            <motion.button
              className="navbar-login-btn"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          )}
        </div>

        <motion.button
          className="navbar-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileTap={{ scale: 0.9 }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          className="navbar-menu-mobile"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              className={`navbar-item-mobile ${currentPage === item.page ? 'active' : ''}`}
              onClick={() => handleNavClick(item.page)}
              whileHover={{ x: 5 }}
            >
              {item.label}
            </motion.button>
          ))}

          <div className="navbar-mobile-divider" />

          {!user ? (
            <>
              <motion.button
                className="navbar-login-btn-mobile"
                onClick={() => handleNavClick('login')}
                whileHover={{ x: 5 }}
              >
                Login
              </motion.button>

              <motion.button
                className="navbar-signup-btn-mobile"
                onClick={() => handleNavClick('register')}
                whileHover={{ x: 5 }}
              >
                Sign Up
              </motion.button>
            </>
          ) : (
            <motion.button
              className="navbar-login-btn-mobile"
              onClick={handleLogout}
              whileHover={{ x: 5 }}
            >
              Logout
            </motion.button>
          )}
        </motion.div>
      )}
    </nav>
  )
}

export default Navbar