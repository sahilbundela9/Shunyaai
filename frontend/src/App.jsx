import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from './Hero'
import Dashboard from './Dashboard'
import Research from './Research'
import PaperDetail from './PaperDetail'
import Insights from './Insights'
import AdminDashboard from './AdminDashboard'
import Login from './Login'
import Register from './Register'
import About from './About'
import Settings from './Settings'
import Papers from './Papers'
import Navbar from './Navbar'
import Background3D from './Background3D'
import { useTheme } from './hooks/useTheme'
import { SidebarProvider } from './contexts/SidebarContext'
import { useAuth } from './contexts/AuthContext'
import ResearchIdea from './ResearchIdea'
import './App.css'

function PageWrapper({ children }) {
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 40,
      filter: 'blur(10px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.45,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -30,
      filter: 'blur(10px)',
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    },
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  )
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const { user, loading } = useAuth()

  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'home'
  })

  useEffect(() => {
    if (!loading) {
      const protectedPages = [
        'dashboard',
        'papers',
        'detail',
        'insights',
        'admin',
        'settings',
        'research',
        'idea-generator'
      ]

      if (protectedPages.includes(currentPage) && !user) {
        setCurrentPage('login')
      }
    }
  }, [currentPage, user, loading])

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage)
  }, [currentPage])

  const pages = {
    home: { component: Hero, key: 'home' },
    dashboard: { component: Dashboard, key: 'dashboard' },
    research: { component: Research, key: 'research' },
    detail: { component: PaperDetail, key: 'detail' },
    insights: { component: Insights, key: 'insights' },
    admin: { component: AdminDashboard, key: 'admin' },
    login: { component: Login, key: 'login' },
    register: { component: Register, key: 'register' },
    about: { component: About, key: 'about' },
    settings: { component: Settings, key: 'settings' },
    papers: { component: Papers, key: 'papers' },
    'idea-generator': { component: ResearchIdea, key: 'idea-generator' },
  }

  const pageConfig = pages[currentPage] || pages.home
  const PageComponent = pageConfig.component

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading...</div>
  }

  return (
    <SidebarProvider>
      <div className="app">
        <Background3D />
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} theme={theme} />

        <AnimatePresence mode="wait">
          <PageWrapper key={pageConfig.key}>
            <PageComponent
              setCurrentPage={setCurrentPage}
              toggleTheme={toggleTheme}
              theme={theme}
            />
          </PageWrapper>
        </AnimatePresence>
      </div>
    </SidebarProvider>
  )
}

export default App