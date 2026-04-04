import { motion } from 'framer-motion'
import { Search, Zap, Target, BarChart2 } from 'lucide-react'
import Footer from './Footer'
import './About.css'

function About({ setCurrentPage }) {
  const features = [
    { icon: Search, title: 'Advanced Search', desc: 'Find research papers with intelligent semantic search' },
    { icon: Zap, title: 'Fast Analysis', desc: 'Get AI-powered summaries in seconds' },
    { icon: Target, title: 'Gap Identification', desc: 'Automatically identify research gaps' },
    { icon: BarChart2, title: 'Data Insights', desc: 'Visual analytics and trend analysis' },
  ]

  return (
    <div className="about-page">
      <div className="about-main">
        <div className="about-container">
          <motion.section className="about-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1>About ShunyaAI</h1>
            <p>AI-driven research paper automation platform designed for modern researchers</p>
          </motion.section>

          <motion.section className="about-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2>Our Mission</h2>
            <p>
              ShunyaAI is transforming how researchers discover, analyze, and manage scientific literature. Our mission is to eliminate the time spent on
              manual paper reviews and enable researchers to focus on what matters most: advancing human knowledge.
            </p>
          </motion.section>

          <motion.section className="about-features" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2>Key Features</h2>
            <div className="features-grid">
              {features.map((feature, i) => (
                <motion.div key={i} className="feature-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                  <div className="feature-icon"><feature.icon size={32} /></div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section className="about-cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <h2>Ready to Transform Your Research?</h2>
            <motion.button className="cta-btn" onClick={() => setCurrentPage('register')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Get Started Today
            </motion.button>
          </motion.section>
        </div>
      </div>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  )
}

export default About
