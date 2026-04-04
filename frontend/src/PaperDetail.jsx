import { useEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import HolographicDoc from './HolographicDoc'
import { apiRequest } from './utils/api'
import { motion, useInView } from 'framer-motion'
import './PaperDetail.css'

function ScrollSection({ children, delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

function PaperDetail({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('papers')
  const detailMainRef = useRef(null)

  const [paper, setPaper] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (detailMainRef.current) {
      detailMainRef.current.scrollTop = 0
    }

    fetchPaperDetail()
  }, [])

  const fetchPaperDetail = async () => {
    try {
      setLoading(true)
      setError('')

      const selectedPaperId = localStorage.getItem('selectedPaperId')

      if (!selectedPaperId) {
        setError('No paper selected.')
        setLoading(false)
        return
      }

      const data = await apiRequest(`/api/papers/${selectedPaperId}`)
      setPaper(data)
    } catch (err) {
      console.error('Error fetching paper detail:', err)
      setError('Failed to load paper details.')
    } finally {
      setLoading(false)
    }
  }

  const getKeywords = () => {
    if (!paper?.keywords) return []
    return paper.keywords.split(',').map((k) => k.trim()).filter(Boolean)
  }

  const generateSimpleSummary = () => {
    if (!paper?.abstractText) return 'No AI summary available yet.'
    if (paper.abstractText.length <= 320) return paper.abstractText
    return `${paper.abstractText.slice(0, 320)}...`
  }

  const generateResearchGaps = () => {
    const keywords = getKeywords()

    return [
      {
        title: `Underexplored Area in ${keywords[0] || 'This Topic'}`,
        description:
          'This paper suggests opportunities for deeper experimentation, broader benchmarking, and domain-specific adaptation.',
        insight:
          'Future research can investigate stronger real-world validation and more robust comparative analysis.'
      },
      {
        title: 'Scalability and Generalization',
        description:
          'The work opens questions around scaling to larger datasets, more diverse environments, and broader populations.',
        insight:
          'A valuable next step would be testing across multiple datasets and cross-domain scenarios.'
      },
      {
        title: 'Interpretability and Practical Use',
        description:
          'The research may benefit from clearer interpretability, deployment studies, and applied impact measurement.',
        insight:
          'There is room to explore explainability, user trust, and real-world adoption challenges.'
      }
    ]
  }

  if (loading) {
    return (
      <div className="detail-wrapper">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setCurrentPage={setCurrentPage}
        />
        <main className="detail-main">
          <div className="detail-state">Loading paper details...</div>
        </main>
      </div>
    )
  }

  if (error || !paper) {
    return (
      <div className="detail-wrapper">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setCurrentPage={setCurrentPage}
        />
        <main className="detail-main">
          <div className="detail-state error">{error || 'Paper not found.'}</div>
        </main>
      </div>
    )
  }

  const keywords = getKeywords()
  const researchGaps = generateResearchGaps()

  return (
    <div className="detail-wrapper">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setCurrentPage={setCurrentPage}
      />

      <main className="detail-main" ref={detailMainRef}>
        <motion.div
          className="detail-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-content">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="paper-title">{paper.title}</h1>
            </motion.div>

            <motion.div
              className="paper-meta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="authors-section">
                <p className="label">Authors</p>
                <p className="authors-list">{paper.authors || 'Unknown'}</p>
              </div>

              <div className="meta-divider" />

              <div className="meta-section">
                <div className="meta-item">
                  <span className="meta-label">Year</span>
                  <span className="meta-value">{paper.publicationYear || 'N/A'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Source</span>
                  <span className="meta-value">{paper.source || 'Unknown'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Journal</span>
                  <span className="meta-value">{paper.journal || 'N/A'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Citations</span>
                  <span className="meta-value">{paper.citationCount || 0}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="hero-3d">
            <HolographicDoc />
          </div>
        </motion.div>

        <div className="content-grid">
          <div className="content-left">
            <ScrollSection delay={0.1}>
              <div className="glass-card section-card">
                <h2 className="section-title">Abstract</h2>
                <p className="section-text">{paper.abstractText || 'No abstract available.'}</p>
              </div>
            </ScrollSection>

            <ScrollSection delay={0.2}>
              <div className="glass-card summary-card">
                <div className="summary-header">
                  <h2 className="section-title">AI-Generated Summary</h2>
                  <span className="ai-badge">AI</span>
                </div>
                <p className="summary-text">{generateSimpleSummary()}</p>
                <div className="summary-highlight">
                  <p className="highlight-label">Key Insight:</p>
                  <p className="highlight-text">
                    This paper contributes to the broader research direction of{' '}
                    {keywords[0] || 'modern AI research'} and opens pathways for
                    deeper experimentation, validation, and applied innovation.
                  </p>
                </div>
              </div>
            </ScrollSection>

            <ScrollSection delay={0.3}>
              <div className="glass-card section-card">
                <h3 className="subsection-title">Keywords</h3>
                <div className="detail-keywords">
                  {keywords.length > 0 ? (
                    keywords.map((keyword, idx) => (
                      <span key={idx} className="detail-keyword-tag">
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="section-text">No keywords available.</p>
                  )}
                </div>
              </div>
            </ScrollSection>

            <ScrollSection delay={0.4}>
              <div className="glass-card section-card">
                <h3 className="subsection-title">Reference Info</h3>
                <p className="section-text"><strong>DOI:</strong> {paper.doi || 'N/A'}</p>
                <p className="section-text">
                  <strong>URL:</strong>{' '}
                  {paper.url ? (
                    <a href={paper.url} target="_blank" rel="noreferrer">
                      {paper.url}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </ScrollSection>
          </div>

          <div className="content-right">
            <ScrollSection delay={0.2}>
              <div className="research-gaps-container">
                <h2 className="section-title gaps-title">Research Gaps & Opportunities</h2>

                {researchGaps.map((gap, idx) => (
                  <motion.div
                    key={idx}
                    className="gap-card glass-card"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="gap-header">
                      <h3 className="gap-title">{gap.title}</h3>
                      <span className="gap-number">{idx + 1}</span>
                    </div>

                    <p className="gap-description">{gap.description}</p>

                    <motion.div
                      className="gap-insight"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <span className="insight-label">Research Opportunity:</span>
                      <p className="insight-text">{gap.insight}</p>
                    </motion.div>

                    <motion.div className="gap-glow" />
                  </motion.div>
                ))}
              </div>
            </ScrollSection>

            <ScrollSection delay={0.4}>
              <div className="action-buttons">
                <motion.button
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paper.url && window.open(paper.url, '_blank')}
                >
                  <span>🔗</span> View Original
                </motion.button>

                <motion.button
                  className="btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage('papers')}
                >
                  <span>←</span> Back to Papers
                </motion.button>
              </div>
            </ScrollSection>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PaperDetail