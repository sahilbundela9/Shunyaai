import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import PaperCard from './PaperCard'
import { useSidebar } from './contexts/SidebarContext'
import { apiRequest } from './utils/api'
import './Papers.css'

function Papers({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('papers')
  const { isSidebarOpen } = useSidebar()

  const [papers, setPapers] = useState([])
  const [savedPapers, setSavedPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [selectedPaperIds, setSelectedPaperIds] = useState([])

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    const storedFilter = localStorage.getItem('papersFilter')

    if (storedFilter) {
      try {
        const parsed = JSON.parse(storedFilter)
        if (parsed?.value) {
          setSearchTerm(parsed.value)
          setShowSavedOnly(false)
        }
      } catch (err) {
        console.error('Failed to parse papersFilter:', err)
      }

      localStorage.removeItem('papersFilter')
    }
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError('')

      const [allPapers, saved] = await Promise.all([
        apiRequest('/api/papers'),
        apiRequest('/api/papers/saved'),
      ])

      setPapers(Array.isArray(allPapers) ? allPapers : [])
      setSavedPapers(Array.isArray(saved) ? saved : [])
    } catch (err) {
      console.error('Papers load error:', err)
      setError('Failed to load papers.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSave = async (paper) => {
    try {
      const isAlreadySaved = savedPapers.some((p) => p.id === paper.id)

      if (isAlreadySaved) {
        // ✅ FIXED: backend expects DELETE /api/papers/save/{id}
        await apiRequest(`/api/papers/save/${paper.id}`, 'DELETE')

        setSavedPapers((prev) => prev.filter((p) => p.id !== paper.id))
        setSelectedPaperIds((prev) => prev.filter((id) => id !== paper.id))
      } else {
        await apiRequest(`/api/papers/save/${paper.id}`, 'POST')
        setSavedPapers((prev) => [...prev, paper])
      }
    } catch (err) {
      console.error('Save toggle error:', err)
      alert('Failed to update saved paper.')
    }
  }

  const handleSelectPaper = (paperId) => {
    setSelectedPaperIds((prev) =>
      prev.includes(paperId)
        ? prev.filter((id) => id !== paperId)
        : [...prev, paperId]
    )
  }

  const handleGenerateFromSelected = () => {
    const selectedPapers = savedPapers.filter((paper) =>
      selectedPaperIds.includes(paper.id)
    )

    if (selectedPapers.length < 2) {
      alert('Please select at least 2 saved papers to generate a combined research idea.')
      return
    }

    localStorage.setItem('selectedResearchPapers', JSON.stringify(selectedPapers))
    setCurrentPage('idea-generator')
  }

  const currentList = showSavedOnly ? savedPapers : papers

  const filteredAndSortedPapers = useMemo(() => {
    let result = [...currentList]

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()

      result = result.filter((paper) => {
        return (
          (paper.title || '').toLowerCase().includes(q) ||
          (paper.authors || '').toLowerCase().includes(q) ||
          (paper.abstractText || '').toLowerCase().includes(q) ||
          (paper.keywords || '').toLowerCase().includes(q) ||
          (paper.source || '').toLowerCase().includes(q) ||
          (paper.journal || '').toLowerCase().includes(q) ||
          String(paper.publicationYear || '').toLowerCase().includes(q)
        )
      })
    }

    if (sortBy === 'recent') {
      result.sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0))
    } else if (sortBy === 'citations') {
      result.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0))
    } else if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    }

    return result
  }, [currentList, searchTerm, sortBy])

  return (
    <div className="papers-wrapper">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} setCurrentPage={setCurrentPage} />

      <main className={`papers-main ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
        <motion.div
          className="papers-header"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Research Papers</h1>
          <p>Explore and manage your real research paper collection</p>
        </motion.div>

        <div className="papers-toggle-row">
          <button
            className={`papers-toggle-btn ${!showSavedOnly ? 'active' : ''}`}
            onClick={() => {
              setShowSavedOnly(false)
              setSelectedPaperIds([])
            }}
          >
            All Papers
          </button>

          <button
            className={`papers-toggle-btn ${showSavedOnly ? 'active' : ''}`}
            onClick={() => setShowSavedOnly(true)}
          >
            Saved Papers ({savedPapers.length})
          </button>
        </div>

        <div className="papers-controls">
          <input
            type="text"
            placeholder="Search by title, author, keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="papers-search"
          />

          <select className="papers-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Sort by Recent</option>
            <option value="citations">Sort by Citations</option>
            <option value="title">Sort by Title</option>
          </select>

          <button className="papers-refresh-btn" onClick={fetchAllData}>
            Refresh
          </button>
        </div>

        {showSavedOnly && savedPapers.length > 0 && (
          <div className="papers-selection-toolbar glass-card">
            <div>
              <strong>{selectedPaperIds.length}</strong> paper(s) selected
            </div>

            <button
              className="generate-selected-btn"
              onClick={handleGenerateFromSelected}
              disabled={selectedPaperIds.length < 2}
            >
              Generate Idea from Selected
            </button>
          </div>
        )}

        {loading && <div className="papers-status glass-card"><p>Loading papers...</p></div>}
        {error && !loading && <div className="papers-status papers-error glass-card"><p>{error}</p></div>}
        {!loading && !error && filteredAndSortedPapers.length === 0 && (
          <div className="papers-status glass-card"><p>No papers found.</p></div>
        )}

        {!loading && !error && filteredAndSortedPapers.length > 0 && (
          <div className="papers-grid">
            {filteredAndSortedPapers.map((paper, index) => (
              <PaperCard
                key={paper.id || index}
                paper={paper}
                isSaved={savedPapers.some((p) => p.id === paper.id)}
                isSelectable={showSavedOnly}
                isSelected={selectedPaperIds.includes(paper.id)}
                onSelect={() => handleSelectPaper(paper.id)}
                onToggleSave={() => handleToggleSave(paper)}
                onOpen={() => {
                  localStorage.setItem('selectedPaperId', paper.id)
                  setCurrentPage('detail')
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Papers