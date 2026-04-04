import { motion } from 'framer-motion'
import './SkeletonLoader.css'

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <motion.div
        className="skeleton-line skeleton-title"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="skeleton-line skeleton-subtitle"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
      />
      <motion.div
        className="skeleton-line skeleton-text"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="skeleton-line skeleton-text short"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
      />
    </div>
  )
}

export default function SkeletonLoader({ count = 3 }) {
  return (
    <div className="skeleton-loader">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div> 
  )
}
