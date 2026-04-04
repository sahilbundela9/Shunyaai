import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Search,
  FileText,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  Lightbulb // ✅ added proper icon
} from 'lucide-react'

import { useSidebar } from './contexts/SidebarContext'
import { useAuth } from './contexts/AuthContext'
import './Sidebar.css'

function Sidebar({ activeTab, setActiveTab, setCurrentPage }) {
  const { isSidebarOpen } = useSidebar()
  const { logout, user } = useAuth()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
    { id: 'research', label: 'Research', icon: Search, page: 'research' },
    { id: 'papers', label: 'Papers', icon: FileText, page: 'papers' },
    { id: 'analysis', label: 'Insights', icon: BarChart3, page: 'insights' },

    ...(user?.role === 'ADMIN'
      ? [{ id: 'admin', label: 'Admin', icon: Shield, page: 'admin' }]
      : []),

    { id: 'settings', label: 'Settings', icon: Settings, page: 'settings' },

    // ✅ FIXED IDEA GENERATOR
    {
      id: 'idea-generator',
      label: 'Idea Generator',
      icon: Lightbulb,
      page: 'idea-generator'
    }
  ]

  const sidebarVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1 + index * 0.05,
        duration: 0.4,
      },
    }),
  }

  if (!isSidebarOpen) return null

  return (
    <motion.aside
      className="sidebar"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
          const Icon = item.icon

          return (
            <motion.button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id)

                if (item.page && setCurrentPage) {
                  setCurrentPage(item.page)
                }
              }}
              variants={itemVariants}
              custom={index}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* ✅ FIXED ICON RENDER */}
              <Icon className="nav-icon" size={20} />

              <span className="nav-label">{item.label}</span>

              {activeTab === item.id && (
                <motion.div
                  className="nav-indicator"
                  layoutId="indicator"
                  transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <motion.button
          className="btn-logout"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            logout()
            setCurrentPage('login')
          }}
        >
          <LogOut className="logout-icon" size={20} />
          <span>Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  )
}

export default Sidebar