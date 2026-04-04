import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import { useSidebar } from './contexts/SidebarContext'
import './AdminDashboard.css'

// Status Indicator Component with pulse animation
function StatusIndicator({ status }) {
  const statusConfig = {
    operational: { color: '#10b981', label: 'Operational', icon: '✓' },
    warning: { color: '#f59e0b', label: 'Warning', icon: '⚠' },
    critical: { color: '#ef4444', label: 'Critical', icon: '✕' },
  }

  const config = statusConfig[status] || statusConfig.operational

  return (
    <div className="status-indicator-wrapper">
      <div className="status-pulse" style={{ '--pulse-color': config.color }}></div>
      <span className="status-dot" style={{ backgroundColor: config.color }}></span>
      <span className="status-label">{config.label}</span>
    </div>
  )
}

// System Status Card Component
function StatusCard({ title, status, value, icon, delay }) {
  const statusConfig = {
    operational: 'status-operational',
    warning: 'status-warning',
    critical: 'status-critical',
  }

  return (
    <motion.div
      className={`status-card ${statusConfig[status]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="status-card-header">
        <span className="status-card-icon">{icon}</span>
        <h3 className="status-card-title">{title}</h3>
      </div>
      <div className="status-card-content">
        <div className="status-card-value">{value}</div>
        <StatusIndicator status={status} />
      </div>
    </motion.div>
  )
}

// Active Users Component
function ActiveUsers({ count, delay }) {
  return (
    <motion.div
      className="active-users-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0, 212, 255, 0.2)' }}
    >
      <div className="active-users-header">
        <h3>Active Users</h3>
        <span className="active-users-badge">{count}</span>
      </div>
      <div className="active-users-content">
        <div className="user-avatars">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="user-avatar"
              style={{
                backgroundColor: ['#00d4ff', '#a855f7', '#10b981', '#f59e0b', '#ef4444'][i],
              }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
            >
              {i + 1}
            </motion.div>
          ))}
        </div>
        <p className="active-users-text">Researchers connected across 12 regions</p>
      </div>
    </motion.div>
  )
}

// Workflow Status Component
function WorkflowStatus({ delay }) {
  const workflows = [
    { id: 1, name: 'Paper Ingestion', progress: 92, status: 'operational' },
    { id: 2, name: 'Auto Classification', progress: 78, status: 'operational' },
    { id: 3, name: 'Summary Generation', progress: 65, status: 'warning' },
    { id: 4, name: 'Gap Analysis', progress: 88, status: 'operational' },
  ]

  const statusColors = {
    operational: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444',
  }

  return (
    <motion.div
      className="workflow-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <h3 className="workflow-title">Automation Workflows</h3>
      <div className="workflow-list">
        {workflows.map((workflow, index) => (
          <motion.div
            key={workflow.id}
            className="workflow-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: delay + index * 0.05 }}
          >
            <div className="workflow-info">
              <span className="workflow-name">{workflow.name}</span>
              <span className="workflow-progress-text">{workflow.progress}%</span>
            </div>
            <div className="workflow-progress-bar">
              <motion.div
                className="workflow-progress-fill"
                style={{ backgroundColor: statusColors[workflow.status] }}
                initial={{ width: 0 }}
                animate={{ width: `${workflow.progress}%` }}
                transition={{ duration: 1, delay: delay + index * 0.05 }}
              />
            </div>
            <span className="workflow-status-dot" style={{ backgroundColor: statusColors[workflow.status] }} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Error Logs Panel Component
function ErrorLogsPanel({ delay }) {
  const [expandedLog, setExpandedLog] = useState(null)

  const errorLogs = [
    {
      id: 1,
      timestamp: '2024-12-20 14:32:15',
      level: 'error',
      message: 'Failed to process paper PDF',
      source: 'Paper Ingestion Service',
      details: 'Error parsing PDF file format. Expected MIME type: application/pdf',
    },
    {
      id: 2,
      timestamp: '2024-12-20 13:45:22',
      level: 'warning',
      message: 'High memory usage detected',
      source: 'Classification Engine',
      details: 'Memory consumption at 78% threshold. Consider scaling resources.',
    },
    {
      id: 3,
      timestamp: '2024-12-20 12:18:09',
      level: 'error',
      message: 'Database connection timeout',
      source: 'Vector Database',
      details: 'Failed to connect after 30 seconds. Retrying connection pool.',
    },
    {
      id: 4,
      timestamp: '2024-12-20 11:05:33',
      level: 'warning',
      message: 'Slow query detected',
      source: 'Analytics Service',
      details: 'Query execution time exceeded 5 seconds. Query optimization recommended.',
    },
  ]

  const errorLevelConfig = {
    error: { color: '#ef4444', label: 'Error', icon: '✕' },
    warning: { color: '#f59e0b', label: 'Warning', icon: '⚠' },
  }

  return (
    <motion.div
      className="error-logs-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="error-logs-header">
        <h3>Recent Error Logs</h3>
        <span className="error-count">{errorLogs.length}</span>
      </div>
      <div className="error-logs-list">
        {errorLogs.map((log, index) => {
          const config = errorLevelConfig[log.level]
          const isExpanded = expandedLog === log.id

          return (
            <motion.div
              key={log.id}
              className={`error-log-item error-${log.level}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: delay + index * 0.05 }}
              onClick={() => setExpandedLog(isExpanded ? null : log.id)}
            >
              <div className="error-log-header">
                <div className="error-log-indicator">
                  <span
                    className="error-level-icon"
                    style={{ color: config.color }}
                  >
                    {config.icon}
                  </span>
                  <span className="error-level-badge" style={{ backgroundColor: config.color }}>
                    {config.label}
                  </span>
                </div>
                <span className="error-timestamp">{log.timestamp}</span>
              </div>
              <div className="error-log-message">{log.message}</div>
              <span className="error-source">{log.source}</span>

              {isExpanded && (
                <motion.div
                  className="error-log-details"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p>{log.details}</p>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// Main AdminDashboard Component
function AdminDashboard({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('admin')
  const { isSidebarOpen } = useSidebar()

  return (
    <div className="admin-dashboard-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} setCurrentPage={setCurrentPage} />

      <main className={`admin-main-content ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
        <div className="admin-header">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="admin-title">System Administration</h1>
            <p className="admin-subtitle">Monitor system health, workflows, and user activity</p>
          </motion.div>
        </div>

        {/* System Status Overview Section */}
        <section className="admin-section">
          <h2 className="section-title">System Status Overview</h2>
          <div className="status-grid">
            <StatusCard
              title="API Gateway"
              status="operational"
              value="99.97%"
              icon="🌐"
              delay={0.1}
            />
            <StatusCard
              title="Database Cluster"
              status="operational"
              value="Healthy"
              icon="🗄️"
              delay={0.2}
            />
            <StatusCard
              title="Processing Queue"
              status="warning"
              value="2,847 items"
              icon="⚙️"
              delay={0.3}
            />
            <StatusCard
              title="Vector Store"
              status="operational"
              value="256.4 GB"
              icon="📦"
              delay={0.4}
            />
          </div>
        </section>

        {/* Active Users and Workflow Status */}
        <section className="admin-section">
          <div className="admin-grid-2col">
            <ActiveUsers count={1248} delay={0.5} />
            <WorkflowStatus delay={0.6} />
          </div>
        </section>

        {/* Error Logs Section */}
        <section className="admin-section">
          <ErrorLogsPanel delay={0.7} />
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard
