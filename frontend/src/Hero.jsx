import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import NeuralNetworkCanvas from './NeuralNetwork'
import './App.css'

function Hero({ setCurrentPage }) {
  const [hoveredButton, setHoveredButton] = useState(null)
  const [showScroll, setShowScroll] = useState(false)

  // Showw scroll indicator ONLY while scrolling
  useEffect(() => {
    let timeout

    const handleScroll = () => {
      setShowScroll(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowScroll(false), 800)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeout)
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  }

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1 } },
  }

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
  }

  const glowVariants = {
    initial: { boxShadow: '0 0 20px rgba(0,212,255,0.3)' },
    hover: {
      boxShadow: [
        '0 0 20px rgba(0,212,255,0.3)',
        '0 0 40px rgba(0,212,255,0.7)',
        '0 0 60px rgba(0,212,255,1)',
      ],
      transition: { duration: 0.6, repeat: Infinity },
    },
  }

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 3, repeat: Infinity },
    },
  }

  return (
    <div className="hero-container">
      {/* Background */}
      <div className="neural-network-background">
        <NeuralNetworkCanvas />
      </div>

      {/* Glow Orbs */}
      <motion.div className="glow-sphere glow-sphere-1" animate={{ x: [0, 30, -30, 0], y: [0, -40, 40, 0] }} transition={{ duration: 20, repeat: Infinity }} />
      <motion.div className="glow-sphere glow-sphere-2" animate={{ x: [0, -40, 40, 0], y: [0, 30, -30, 0] }} transition={{ duration: 25, repeat: Infinity }} />
      <motion.div className="glow-sphere glow-sphere-3" animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }} transition={{ duration: 30, repeat: Infinity }} />

      {/* Content */}
      <motion.div className="hero-content" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="hero-accent-line" variants={textVariants}>
          Powered by Advanced AI
        </motion.div>

        <motion.h1 className="hero-headline" variants={textVariants}>
          <span className="text-gradient">AI-Driven</span><br />
          <span className="text-gradient-secondary">Research Paper</span><br />
          <span className="text-gradient">Automation</span>
        </motion.h1>

        <motion.p className="hero-subtext" variants={textVariants}>
          Discover research papers automatically, identify gaps in the literature,
          and accelerate your research workflow with intelligent AI analysis
        </motion.p>

        {/* Buttons */}
        <motion.div className="hero-buttons" variants={containerVariants}>
          <motion.button
            className={`btn btn-primary ${hoveredButton === 'explore' ? 'active' : ''}`}
            variants={buttonVariants}
            onHoverStart={() => setHoveredButton('explore')}
            onHoverEnd={() => setHoveredButton(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="btn-text">Explore Research</span>
            <span className="btn-icon">→</span>
            <motion.div className="btn-glow" variants={glowVariants} initial="initial" animate={hoveredButton === 'explore' ? 'hover' : 'initial'} />
          </motion.button>

          <motion.button
            className={`btn btn-secondary ${hoveredButton === 'dashboard' ? 'active' : ''}`}
            variants={buttonVariants}
            onHoverStart={() => setHoveredButton('dashboard')}
            onHoverEnd={() => setHoveredButton(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="btn-text">View Dashboard</span>
            <span className="btn-icon">→</span>
            <motion.div className="btn-glow" variants={glowVariants} initial="initial" animate={hoveredButton === 'dashboard' ? 'hover' : 'initial'} />
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div className="hero-stats" variants={textVariants}>
          <motion.div className="stat-item" variants={pulseVariants} animate="animate">
            <span className="stat-number">10M+</span>
            <span className="stat-label">Papers Indexed</span>
          </motion.div>
          <div className="stat-divider" />
          <motion.div className="stat-item" variants={pulseVariants} animate="animate">
            <span className="stat-number">99.2%</span>
            <span className="stat-label">Accuracy Rate</span>
          </motion.div>
          <div className="stat-divider" />
          <motion.div className="stat-item" variants={pulseVariants} animate="animate">
            <span className="stat-number">50K+</span>
            <span className="stat-label">Active Researchers</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className={`scroll-indicator ${showScroll ? 'visible' : ''}`}
        animate={showScroll ? { y: [0, 10, 0] } : { y: 0 }}
        transition={showScroll ? { duration: 2, repeat: Infinity } : {}}
      >
        <span>Scroll to explore</span>
        <div className="scroll-arrow" />
      </motion.div>
    </div>
  )
}

export default Hero
