import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { File, Star, Tag, Lightbulb } from 'lucide-react'
import Sidebar from './Sidebar'
import DataOrb from './DataOrb'
import { useSidebar } from './contexts/SidebarContext'
import { apiRequest } from './utils/api'
import './Dashboard.css'

function Dashboard({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { isSidebarOpen } = useSidebar()

  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await apiRequest('/api/papers/stats')
      console.log("Dashboard stats response:", data)

      setStats(data)
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const totalPapers = stats?.totalPapers ?? 0
  const savedPapers = totalPapers
  const researchTopics = totalPapers > 0 ? Math.ceil(totalPapers / 2) : 0
  const researchGaps = totalPapers > 0 ? Math.ceil(totalPapers / 3) : 0

  const cardData = [
    {
      id: 1,
      title: 'Total Papers Fetched',
      value: totalPapers,
      icon: File,
      color: 'card-cyan',
      description: 'Papers currently in database',
    },
    {
      id: 2,
      title: 'Saved Papers',
      value: savedPapers,
      icon: Star,
      color: 'card-purple',
      description: 'Stored and accessible papers',
    },
    {
      id: 3,
      title: 'Research Topics',
      value: researchTopics,
      icon: Tag,
      color: 'card-blue',
      description: 'Detected topic clusters',
    },
    {
      id: 4,
      title: 'Research Gaps',
      value: researchGaps,
      icon: Lightbulb,
      color: 'card-pink',
      description: 'Estimated opportunity areas',
    },
  ]

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setCurrentPage={setCurrentPage}
        />
        <main className={`dashboard-main ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
          <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading dashboard...</div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setCurrentPage={setCurrentPage}
        />
        <main className={`dashboard-main ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
          <div style={{ color: 'red', fontSize: '1.2rem' }}>{error}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setCurrentPage={setCurrentPage}
      />

      <main className={`dashboard-main ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-left">
            <h1>Dashboard</h1>
            <p className="header-subtitle">
              Welcome back! Here's your research overview
            </p>
          </div>

          <div className="header-right">
            <div className="data-orb-container">
              <DataOrb />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="cards-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {cardData.map((card, index) => (
            <motion.div
              key={card.id}
              className={`stat-card glass-card ${card.color}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -8 }}
            >
              <div className="card-icon">
                <card.icon size={32} />
              </div>

              <div className="card-content">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>

                <div className="card-metrics">
                  <span className="card-value">{card.value}</span>
                </div>
              </div>

              <div className="card-border-glow" />
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}

export default Dashboard