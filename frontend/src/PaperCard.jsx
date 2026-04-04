import { motion } from 'framer-motion'
import './PaperCard.css'

function PaperCard({
  paper,
  isSaved = false,
  isSelectable = false,
  isSelected = false,
  onSelect,
  onToggleSave,
  onOpen,
}) {
  return (
    <motion.div
      className={`paper-card glass-card ${isSelected ? 'paper-selected' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -6 }}
    >
      {isSelectable && (
        <div className="paper-select-box">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="paper-card-header">
        <h3 className="paper-title" onClick={onOpen}>
          {paper.title || 'Untitled Paper'}
        </h3>

        <button
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleSave()
          }}
          title={isSaved ? 'Unsave Paper' : 'Save Paper'}
        >
          {isSaved ? '★' : '☆'}
        </button>
      </div>

      <p className="paper-authors">{paper.authors || 'Unknown authors'}</p>

      <p className="paper-abstract">
        {paper.abstractText
          ? `${paper.abstractText.slice(0, 240)}${paper.abstractText.length > 240 ? '...' : ''}`
          : 'No abstract available.'}
      </p>

      <div className="paper-meta">
        <span>{paper.publicationYear || 'Unknown Year'}</span>
        <span>{paper.source || paper.journal || 'Unknown Source'}</span>
      </div>

      {paper.keywords && (
        <div className="paper-keywords">
          {paper.keywords
            .split(',')
            .slice(0, 4)
            .map((keyword, idx) => (
              <span key={idx} className="keyword-chip">
                {keyword.trim()}
              </span>
            ))}
        </div>
      )}

      <div className="paper-actions">
        <button className="paper-open-btn" onClick={onOpen}>
          View Details
        </button>
      </div>
    </motion.div>
  )
}

export default PaperCard