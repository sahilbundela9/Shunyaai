import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import { useTheme } from './hooks/useTheme'
import { useSidebar } from './contexts/SidebarContext'
import './Settings.css'

function Settings({ setCurrentPage, toggleTheme, theme }) {
  const [activeTab, setActiveTab] = useState('general')
  const { toggleTheme: themeToggle, theme: currentTheme } = useTheme()
  const { isSidebarOpen } = useSidebar()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoSave: true,
    researchNotifications: true,
  })

  const settingsTabs = [
    { id: 'general', label: 'General' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'account', label: 'Account' },
  ]

  const handleToggle = (key) => {
    if (key === 'darkMode') {
      themeToggle()
    } else {
      setSettings({ ...settings, [key]: !settings[key] })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  }

  return (
    <div className="settings-container">
      <Sidebar activeTab="settings" setActiveTab={setActiveTab} setCurrentPage={setCurrentPage} />
      <main className={`settings-main ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
        <motion.div className="settings-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1>Settings</h1>
          <p>Manage your account and preferences</p>
        </motion.div>

        <div className="settings-layout">
          <div className="settings-tabs">
            {settingsTabs.map((tab) => (
              <motion.button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ x: 5 }}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          <motion.div className="settings-content" variants={containerVariants} initial="hidden" animate="visible">
            {activeTab === 'general' && (
              <>
                <div className="settings-section">
                  <h2>General Settings</h2>
                  <div className="settings-item">
                    <div className="settings-item-info">
                      <label>Dark Mode</label>
                      <p>Use dark theme across the application</p>
                    </div>
                    <motion.button className={`toggle ${currentTheme === 'dark' ? 'enabled' : ''}`} onClick={() => handleToggle('darkMode')} whileTap={{ scale: 0.95 }}>
                      <span className="toggle-indicator" />
                    </motion.button>
                  </div>

                  <div className="settings-item">
                    <div className="settings-item-info">
                      <label>Auto-Save</label>
                      <p>Automatically save your research data</p>
                    </div>
                    <motion.button className={`toggle ${settings.autoSave ? 'enabled' : ''}`} onClick={() => handleToggle('autoSave')} whileTap={{ scale: 0.95 }}>
                      <span className="toggle-indicator" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <div className="settings-section">
                  <h2>Notification Settings</h2>
                  <div className="settings-item">
                    <div className="settings-item-info">
                      <label>Email Notifications</label>
                      <p>Receive email updates about your account</p>
                    </div>
                    <motion.button className={`toggle ${settings.emailNotifications ? 'enabled' : ''}`} onClick={() => handleToggle('emailNotifications')} whileTap={{ scale: 0.95 }}>
                      <span className="toggle-indicator" />
                    </motion.button>
                  </div>

                  <div className="settings-item">
                    <div className="settings-item-info">
                      <label>Research Alerts</label>
                      <p>Get notified about new research in your interest areas</p>
                    </div>
                    <motion.button className={`toggle ${settings.researchNotifications ? 'enabled' : ''}`} onClick={() => handleToggle('researchNotifications')} whileTap={{ scale: 0.95 }}>
                      <span className="toggle-indicator" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'privacy' && (
              <>
                <div className="settings-section">
                  <h2>Privacy Settings</h2>
                  <p className="settings-description">Control how your data is used and shared</p>
                  <motion.button className="settings-btn" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Manage Privacy Preferences
                  </motion.button>
                </div>
              </>
            )}

            {activeTab === 'account' && (
              <>
                <div className="settings-section">
                  <h2>Account Settings</h2>
                  <p className="settings-description">Manage your account information</p>
                  <motion.button className="settings-btn danger" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Delete Account
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Settings
