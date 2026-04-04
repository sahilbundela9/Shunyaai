import { motion } from 'framer-motion'
import { Rocket } from 'lucide-react'
import './Footer.css'

function Footer({ setCurrentPage }) {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', action: () => setCurrentPage('home') },
        { label: 'Pricing', action: () => setCurrentPage('home') },
        { label: 'Dashboard', action: () => setCurrentPage('dashboard') },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', action: () => setCurrentPage('about') },
        { label: 'Blog', action: () => setCurrentPage('home') },
        { label: 'Careers', action: () => setCurrentPage('home') },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Research', action: () => setCurrentPage('research') },
        { label: 'Insights', action: () => setCurrentPage('insights') },
        { label: 'Documentation', action: () => setCurrentPage('home') },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', action: () => setCurrentPage('home') },
        { label: 'Terms', action: () => setCurrentPage('home') },
        { label: 'Contact', action: () => setCurrentPage('home') },
      ],
    },
  ]

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <motion.div
              className="footer-logo"
              whileHover={{ scale: 1.05 }}
            >
              <Rocket className="footer-logo-icon" size={24} />
              <span className="footer-logo-text">ShunyaAI</span>
            </motion.div>
            <p className="footer-description">
              AI-Driven Research Paper Automation Platform. Discover, analyze, and accelerate your research workflow with intelligent automation.
            </p>
          </div>

          {/* Links Grid */}
          <div className="footer-links-grid">
            {footerSections.map((section, index) => (
              <motion.div
                key={index}
                className="footer-section"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h4 className="footer-section-title">{section.title}</h4>
                <ul className="footer-section-links">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <motion.button
                        className="footer-link"
                        onClick={link.action}
                        whileHover={{ x: 5, color: '#00d4ff' }}
                      >
                        {link.label}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} ShunyaAI. All rights reserved.
          </p>
          <div className="footer-socials">
            <motion.a
              href="#"
              className="footer-social-link"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              Twitter
            </motion.a>
            <motion.a
              href="#"
              className="footer-social-link"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              GitHub
            </motion.a>
            <motion.a
              href="#"
              className="footer-social-link"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              LinkedIn
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
