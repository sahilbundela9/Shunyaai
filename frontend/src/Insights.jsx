import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Sidebar from './Sidebar'
import Chart3D from './Chart3D'
import { useSidebar } from './contexts/SidebarContext'
import { apiRequest } from './utils/api'
import './Insights.css'

const COLORS = ['#00d4ff', '#a855f7', '#3b82f6', '#06b6d4', '#ec4899']

function AnimatedChart({ data, delay = 0, onBarClick }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const safeBars = data?.bars || []

  return (
    <motion.div
      ref={ref}
      className="chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay }}
    >
      <h3 className="chart-title">{data?.title || 'Analytics'}</h3>

      {safeBars.length > 0 ? (
        <div className="bars-wrapper">
          {safeBars.map((bar, idx) => (
            <div
              key={idx}
              className="bar-item clickable-chart-item"
              onClick={() => onBarClick && onBarClick(bar.fullLabel || bar.label)}
              title={`Open papers for ${bar.fullLabel || bar.label}`}
            >
              <motion.div
                className="bar-fill"
                style={{
                  background: bar.color,
                  height: isInView ? `${bar.value}%` : '0%',
                  cursor: 'pointer',
                }}
                transition={{ duration: 0.8, delay: delay + idx * 0.1, ease: 'easeOut' }}
                animate={{ opacity: [0.7, 1, 0.7] }}
              />
              <span className="bar-label">{bar.label}</span>
              <span className="bar-value">{bar.rawCount || bar.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="insights-status">
          <p>No chart data available yet.</p>
        </div>
      )}
    </motion.div>
  )
}

function ProgressIndicator({ label, percentage, delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <motion.div
      ref={ref}
      className="progress-item"
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="progress-label">
        <span>{label}</span>
        <motion.span
          className="progress-percentage"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: delay + 0.3 }}
        >
          {percentage}%
        </motion.span>
      </div>

      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
          transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}

function KeywordCloud({ keywords = [], onKeywordClick }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const keywordData = keywords.map((item, idx) => ({
    text: item.topic,
    size: Math.max(18, 16 + item.count * 4),
    color: COLORS[idx % COLORS.length],
    count: item.count,
  }))

  return (
    <motion.div
      ref={ref}
      className="keyword-cloud"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="chart-title">Top Research Keywords</h3>

      <div className="keywords-container">
        {keywordData.map((keyword, idx) => (
          <motion.div
            key={idx}
            className="keyword clickable-keyword"
            style={{ fontSize: `${keyword.size}px`, color: keyword.color, cursor: 'pointer' }}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            whileHover={{ scale: 1.12, y: -4 }}
            onClick={() => onKeywordClick && onKeywordClick(keyword.text)}
            title={`Search papers for "${keyword.text}"`}
          >
            <motion.span
              animate={{
                y: [0, -6, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3 + idx * 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {keyword.text}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function GapCard({ gap, index, onGapClick }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const confidence = gap?.opportunityScore || Math.max(55, 90 - (gap.count || 1) * 10)
  const confidenceColor =
    confidence > 70 ? '#10b981' : confidence > 40 ? '#f59e0b' : '#ef4444'

  return (
    <motion.div
      ref={ref}
      className="gap-card glass-card clickable-gap-card"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onClick={() => onGapClick && onGapClick(gap.topic)}
      title={`Explore papers related to ${gap.topic}`}
    >
      <div className="gap-header">
        <h4 className="gap-title">{gap.topic}</h4>

        <motion.div
          className="confidence-score"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          <div className="score-value" style={{ color: confidenceColor }}>
            {confidence}%
          </div>
          <div className="score-label">Confidence</div>
        </motion.div>
      </div>

      <p className="gap-description">
        {gap.reason || 'Potential underexplored research direction based on saved papers.'}
      </p>

      <div className="gap-meta">
        <span className="meta-item">📉 Low frequency</span>
        <span className="meta-item">🔍 {gap.count || 1} paper(s)</span>
      </div>

      <div className="gap-actions">
        <button
          className="gap-action-btn"
          onClick={(e) => {
            e.stopPropagation()
            localStorage.setItem('researchIdeaTopic', gap.topic)
            window.location.reload()
          }}
        >
          Generate Idea
        </button>
      </div>

      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${confidence}%` } : { width: 0 }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
          style={{
            background: `linear-gradient(90deg, ${confidenceColor}, ${confidenceColor}88)`,
          }}
        />
      </div>
    </motion.div>
  )
}

function SimpleAnalyticsCard({ title, items = [], primaryKey, secondaryKey, icon, onItemClick }) {
  return (
    <div className="chart-container glass-card">
      <h3 className="chart-title">{title}</h3>

      {items.length > 0 ? (
        <div className="analytics-list">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="analytics-row clickable-analytics-row"
              onClick={() => onItemClick && onItemClick(item[primaryKey])}
              title={`Explore papers for ${item[primaryKey]}`}
            >
              <div className="analytics-left">
                <span className="analytics-icon">{icon}</span>
                <span className="analytics-name">{item[primaryKey]}</span>
              </div>
              <span className="analytics-count">{item[secondaryKey]}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="insights-status">
          <p>No data available yet.</p>
        </div>
      )}
    </div>
  )
}

function Insights({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('insights')
  const { isSidebarOpen } = useSidebar()

  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGapAnalysis()
  }, [])

  const navigateToPapers = (type, value) => {
    localStorage.setItem('papersFilter', JSON.stringify({ type, value }))
    setCurrentPage('papers')
  }

  const navigateToIdeaGenerator = (topic) => {
  localStorage.setItem('researchIdeaTopic', topic)
  setCurrentPage('idea-generator')
}

  const fetchGapAnalysis = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await apiRequest('/api/papers/saved/gap-analysis')
      console.log('Gap Analysis Response:', data)
      setAnalysis(data)
    } catch (err) {
      console.error('Insights load error:', err)
      setError('Failed to load research insights.')
    } finally {
      setLoading(false)
    }
  }

  const topTopics = analysis?.topTopics || []
  const topKeywords = analysis?.topKeywords || []
  const researchGaps = analysis?.researchGaps || []
  const totalSavedPapers = analysis?.totalSavedPapers || 0
  const topAuthors = analysis?.topAuthors || []
  const sourceDistribution = analysis?.sourceDistribution || []
  const yearDistribution = analysis?.yearDistribution || []

  const chartData = useMemo(() => {
    const source = analysis?.topicDistribution || []
    const maxCount = Math.max(...source.map((t) => t.count || 1), 1)

    return {
      title: 'Saved Topic Distribution',
      bars: source.slice(0, 5).map((t, idx) => ({
        label: t.topic.length > 10 ? t.topic.slice(0, 10) : t.topic,
        fullLabel: t.topic,
        rawCount: t.count,
        value: Math.round((t.count / maxCount) * 100),
        color: COLORS[idx % COLORS.length],
      })),
    }
  }, [analysis])

  const chart3DData = useMemo(() => {
    const source = analysis?.topicDistribution || []
    const maxCount = Math.max(...source.map((t) => t.count || 1), 1)

    return source.slice(0, 5).map((t, idx) => ({
      label: t.topic.length > 10 ? t.topic.slice(0, 10) : t.topic,
      fullLabel: t.topic,
      rawCount: t.count,
      value: Math.round((t.count / maxCount) * 100),
      color: COLORS[idx % COLORS.length],
    }))
  }, [analysis])

  const progressData = useMemo(() => {
    if (!analysis?.researchMaturity) return []
    return [
      { label: 'Research Coverage', percentage: analysis.researchMaturity.researchCoverage || 0 },
      { label: 'Topic Diversity', percentage: analysis.researchMaturity.topicDiversity || 0 },
      { label: 'Gap Discovery Potential', percentage: analysis.researchMaturity.gapDiscoveryPotential || 0 },
      { label: 'Trend Alignment', percentage: analysis.researchMaturity.trendAlignment || 0 },
      { label: 'Novelty Opportunity', percentage: analysis.researchMaturity.noveltyOpportunity || 0 },
    ]
  }, [analysis])

  const secondaryChartData = useMemo(() => {
    const source = analysis?.opportunitySignals || []
    const maxCount = Math.max(...source.map((s) => s.value || 1), 1)

    return {
      title: 'Research Opportunity Signals',
      bars: source.map((s, idx) => ({
        label: s.label,
        fullLabel: s.label,
        rawCount: s.value,
        value: Math.round((s.value / maxCount) * 100),
        color: COLORS[idx % COLORS.length],
      })),
    }
  }, [analysis])

  const keywordCloudData = useMemo(() => {
    return topKeywords.map((k) => ({
      topic: k.keyword,
      count: k.count,
    }))
  }, [topKeywords])

  return (
    <div className="insights-wrapper">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} setCurrentPage={setCurrentPage} />

      <main className={`insights-main ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
        <motion.div
          className="insights-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Research Insights & Trends</h1>
          <p>Discover emerging research areas and identify high-impact research gaps</p>
        </motion.div>

        {loading && <div className="insights-status glass-card"><p>Loading insights...</p></div>}
        {error && !loading && <div className="insights-status insights-error glass-card"><p>{error}</p></div>}

        {!loading && !error && (
          <>
            <div className="insights-summary-row">
              <div className="summary-pill glass-card">
                <span className="summary-label">Saved Papers</span>
                <span className="summary-value">{totalSavedPapers}</span>
              </div>
              <div className="summary-pill glass-card">
                <span className="summary-label">Top Topics</span>
                <span className="summary-value">{topTopics.length}</span>
              </div>
              <div className="summary-pill glass-card">
                <span className="summary-label">Research Gaps</span>
                <span className="summary-value">{researchGaps.length}</span>
              </div>
            </div>

            <div className="top-section">
              <div className="chart-3d-container glass-card">
                <h3 className="chart-title">Research Field Distribution</h3>
                <Chart3D
                  data={chart3DData}
                  onSelectTopic={(topic) => navigateToPapers('topic', topic)}
                />
              </div>

              <div className="progress-container">
                <h3 className="section-title">Research Maturity</h3>
                <div className="progress-items">
                  {progressData.map((item, idx) => (
                    <ProgressIndicator key={idx} label={item.label} percentage={item.percentage} delay={idx * 0.1} />
                  ))}
                </div>
              </div>
            </div>

            <div className="middle-section">
              <div className="charts-row">
                <AnimatedChart
                  data={chartData}
                  delay={0.3}
                  onBarClick={(topic) => navigateToPapers('topic', topic)}
                />
                <AnimatedChart
                  data={secondaryChartData}
                  delay={0.4}
                  onBarClick={(signal) => navigateToPapers('keyword', signal)}
                />
              </div>
            </div>

            <div className="keyword-section glass-card">
              <KeywordCloud
                keywords={keywordCloudData}
                onKeywordClick={(keyword) => navigateToPapers('keyword', keyword)}
              />
            </div>

            <div className="middle-section">
              <div className="charts-row">
                <SimpleAnalyticsCard
                  title="Top Authors"
                  items={topAuthors}
                  primaryKey="author"
                  secondaryKey="count"
                  icon="👤"
                  onItemClick={(author) => navigateToPapers('author', author)}
                />

                <SimpleAnalyticsCard
                  title="Source Distribution"
                  items={sourceDistribution}
                  primaryKey="source"
                  secondaryKey="count"
                  icon="📚"
                  onItemClick={(source) => navigateToPapers('source', source)}
                />
              </div>
            </div>

            <div className="middle-section">
              <div className="charts-row">
                <SimpleAnalyticsCard
                  title="Publication Year Signals"
                  items={yearDistribution}
                  primaryKey="year"
                  secondaryKey="count"
                  icon="📅"
                  onItemClick={(year) => navigateToPapers('year', year)}
                />
              </div>
            </div>

            <div className="gaps-section">
              <h2 className="section-title gaps-title">Critical Research Gaps</h2>

              {researchGaps.length > 0 ? (
                <div className="gaps-grid">
                  {researchGaps.map((gap, idx) => (
                    <GapCard
                      key={idx}
                      gap={gap}
                      index={idx}
                      onGapClick={(topic) => navigateToPapers('topic', topic)}
                    />
                  ))}
                </div>
              ) : (
                <div className="insights-status glass-card">
                  <p>No strong research gaps found yet. Save more diverse papers to improve analysis.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Insights