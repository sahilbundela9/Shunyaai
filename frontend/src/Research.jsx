import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import PaperCard from './PaperCard'
import SkeletonLoader from './SkeletonLoader'
import { useSidebar } from './contexts/SidebarContext'
import './Research.css'

function Research({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('research')
  const { isSidebarOpen } = useSidebar()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [isSearching, setIsSearching] = useState(false)
  const [papers, setPapers] = useState([])
  const [showResults, setShowResults] = useState(false)

  // Sample data
  const samplePapers = [
    {
      id: 1,
      title: 'Attention Is All You Need: Transformer Architecture for Deep Learning',
      authors: 'Vaswani et al.',
      year: 2023,
      domain: 'Machine Learning',
      source: 'ArXiv',
      abstract:
        'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. This paper revolutionized the field of natural language processing.',
    },
    {
      id: 2,
      title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
      authors: 'Devlin, Chang, Lee, Toutanova',
      year: 2022,
      domain: 'NLP',
      source: 'Google Research',
      abstract:
        'We introduce BERT, a method of pre-training language representations that obtains state-of-the-art results on a wide array of Natural Language Processing tasks. The model learns bidirectional representations.',
    },
    {
      id: 3,
      title: 'Vision Transformers: An Image is Worth 16x16 Words',
      authors: 'Dosovitskiy et al.',
      year: 2023,
      domain: 'Computer Vision',
      source: 'Google DeepMind',
      abstract:
        'We demonstrate that a pure transformer applied directly to sequences of image patches can perform very well on image classification tasks when pre-trained on large quantities of image data.',
    },
    {
      id: 4,
      title: 'Efficient Scaling of Language Models with Sparse Mixture-of-Experts',
      authors: 'Lepikhin et al.',
      year: 2022,
      domain: 'Machine Learning',
      source: 'Google Research',
      abstract:
        'We present techniques for scaling transformer-based language models to extreme parameter counts while maintaining computational efficiency through sparse expert routing.',
    },
    {
      id: 5,
      title: 'Federated Learning: Challenges, Methods, and Future Directions',
      authors: 'Kairouz et al.',
      year: 2023,
      domain: 'Distributed Computing',
      source: 'Google Research',
      abstract:
        'Federated learning is a machine learning technique that trains an algorithm across multiple decentralized edge devices or servers holding local data samples.',
    },
    {
      id: 6,
      title: 'Generative Adversarial Networks: An Overview',
      authors: 'Goodfellow et al.',
      year: 2021,
      domain: 'Deep Learning',
      source: 'ArXiv',
      abstract:
        'We present the generative adversarial nets framework in which two models contest with each other: a generative model that synthesizes new instances and a discriminative model.',
    },
  ]

  const years = ['all', '2023', '2022', '2021', '2020', '2019']
  const domains = [
    'all',
    'Machine Learning',
    'NLP',
    'Computer Vision',
    'Distributed Computing',
    'Deep Learning',
  ]
  const sources = ['all', 'ArXiv', 'Google Research', 'Google DeepMind', 'IEEE', 'ACM']

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setShowResults(false)

    // Simulate API call delay
    setTimeout(() => {
      const filtered = samplePapers.filter((paper) => {
        const matchesQuery = paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paper.authors.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesYear = selectedYear === 'all' || paper.year.toString() === selectedYear
        const matchesDomain = selectedDomain === 'all' || paper.domain === selectedDomain
        const matchesSource = selectedSource === 'all' || paper.source === selectedSource

        return matchesQuery && matchesYear && matchesDomain && matchesSource
      })

      setPapers(filtered)
      setIsSearching(false)
      setShowResults(true)
    }, 1500)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="research-wrapper">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} setCurrentPage={setCurrentPage} />

      <main className={`research-main ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
        {/* Header */}
        <motion.div
          className="research-header"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <h1>Research Paper Discovery</h1>
          <p>Find and analyze research papers across multiple domains</p>
        </motion.div>

        {/* Search Section */}
        <motion.div className="search-section" variants={containerVariants} initial="hidden" animate="visible">
          {/* Search Input */}
          <motion.div className="search-input-wrapper" variants={itemVariants}>
            <input
              type="text"
              className="search-input"
              placeholder="Search papers by title, authors, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <motion.div className="search-glow" />
          </motion.div>

          {/* Filters */}
          <motion.div className="filters-container" variants={itemVariants}>
            {/* Year Filter */}
            <div className="filter-group">
              <label>Year</label>
              <select
                className="filter-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year === 'all' ? 'All Years' : year}
                  </option>
                ))}
              </select>
            </div>

            {/* Domain Filter */}
            <div className="filter-group">
              <label>Domain</label>
              <select
                className="filter-select"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain === 'all' ? 'All Domains' : domain}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div className="filter-group">
              <label>Source</label>
              <select
                className="filter-select"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source === 'all' ? 'All Sources' : source}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <motion.button
              className="btn-search"
              onClick={handleSearch}
              disabled={isSearching}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                animate={isSearching ? { rotate: 360 } : { rotate: 0 }}
                transition={isSearching ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
              >
                🔍
              </motion.span>
              <span>{isSearching ? 'Searching...' : 'Search'}</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              className="results-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Results Header */}
              <motion.div className="results-header" variants={itemVariants}>
                <h2>Found {papers.length} papers</h2>
                <p className="results-query">
                  Showing results for "<span className="query-highlight">{searchQuery}</span>"
                </p>
              </motion.div>

              {/* Loading State */}
              {isSearching ? (
                <SkeletonLoader count={3} />
              ) : papers.length > 0 ? (
                <motion.div
                  className="papers-list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {papers.map((paper, index) => (
                    <PaperCard
                      key={paper.id}
                      paper={paper}
                      index={index}
                      onViewSummary={() => setCurrentPage('detail')}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  className="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="no-results-icon">🔭</p>
                  <h3>No papers found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial State */}
        {!showResults && !isSearching && (
          <motion.div
            className="initial-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.p className="initial-icon" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              📚
            </motion.p>
            <h3>Start your research journey</h3>
            <p>Enter a search query and apply filters to discover relevant papers</p>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default Research
