import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { jsPDF } from 'jspdf'
import Sidebar from './Sidebar'
import { useSidebar } from './contexts/SidebarContext'
import './ResearchIdea.css'

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'using', 'use',
  'based', 'study', 'research', 'paper', 'approach', 'framework', 'analysis',
  'system', 'systems', 'method', 'methods', 'towards', 'through', 'between',
  'their', 'there', 'have', 'has', 'been', 'being', 'than', 'such', 'more',
  'less', 'most', 'many', 'also', 'these', 'those', 'over', 'under', 'about',
  'within', 'across', 'toward', 'among', 'novel', 'new', 'intelligent', 'artificial',
  'problem', 'problems', 'model', 'models', 'data', 'learning'
])

function cleanWords(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word))
}

function extractKeywordsFromPapers(papers) {
  const freq = {}

  papers.forEach((paper) => {
    const combined = `
      ${paper.title || ''}
      ${paper.abstractText || ''}
      ${paper.keywords || ''}
    `

    const words = cleanWords(combined)

    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1
    })
  })

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }))
}

function inferTheme(keywords) {
  return keywords.slice(0, 4).map((k) => k.word).join(', ')
}

function generateFullDraft(baseIdea) {
  const title = baseIdea.title || 'Untitled Research Draft'
  const theme = baseIdea.themeSummary || (baseIdea.keywords || []).slice(0, 4).join(', ')
  const topKeyword = baseIdea.keywords?.[0] || 'Artificial Intelligence'
  const secondKeyword = baseIdea.keywords?.[1] || 'Adaptive Systems'
  const thirdKeyword = baseIdea.keywords?.[2] || 'Scientific Reasoning'

  return {
    introduction: `Recent advancements in ${topKeyword} have accelerated research across a wide range of intelligent systems and computational applications. Despite substantial progress, many current approaches remain fragmented, narrowly evaluated, or constrained to isolated sub-problems. In particular, the interaction between ${topKeyword}, ${secondKeyword}, and ${thirdKeyword} continues to reveal unresolved challenges related to scalability, generalization, adaptability, and methodological consistency.

This proposed work is motivated by the observation that existing literature often investigates individual components of this domain in separation, rather than developing a unified and research-grounded framework capable of addressing practical and theoretical limitations together. Therefore, this study proposes a structured direction that synthesizes recurring patterns, limitations, and underexplored intersections from the available literature in order to define a stronger research pathway.`,

    relatedWork: `Existing literature demonstrates growing interest in areas related to ${theme}. Prior studies have contributed valuable findings in optimization, modeling, domain-specific experimentation, and theoretical exploration. However, much of the current body of work remains focused on narrow research scopes, often lacking integrated evaluation strategies and cross-context applicability.

A review of recent papers suggests that while isolated advancements have been made, there is still limited work that systematically unifies these ideas into a single coherent research framework. This indicates an opportunity to bridge scattered contributions and formulate a stronger synthesis-driven research direction with improved novelty and publication relevance.`,

    fullProblemStatement: `${baseIdea.researchGap} This gap becomes increasingly important as research systems become more autonomous, data-rich, and context-sensitive. Without a unified and adaptive research framework, current approaches risk remaining limited in scope, reproducibility, and practical transferability.`,

    expectedResults: `The proposed research is expected to produce a structured framework that improves conceptual clarity, methodological alignment, and novelty within the selected domain. The study is also expected to reveal stronger links between fragmented research subtopics and provide a more interpretable pathway for future academic exploration.

Additionally, the resulting framework may support more robust experimentation, clearer benchmark design, and stronger publication potential through better alignment with real-world research gaps and emerging topic intersections.`,

    conclusion: `This work presents a synthesized research direction centered on ${topKeyword}, ${secondKeyword}, and ${thirdKeyword}. By identifying recurring themes and underexplored overlaps, the proposed study aims to transform fragmented insights into a coherent and high-value research contribution.

Overall, this draft establishes a strong foundation for a future journal-style paper by integrating gap analysis, structured ideation, and methodological planning into a single research design workflow.`,

    draftReferences: baseIdea.sourceTitles?.length
      ? baseIdea.sourceTitles.map((title, idx) => `${idx + 1}. ${title}`)
      : [
          `1. Foundational studies in ${topKeyword}`,
          `2. Recent work on ${secondKeyword}`,
          `3. Comparative research in ${thirdKeyword}`
        ]
  }
}

function generateFromSelectedPapers(papers) {
  const keywords = extractKeywordsFromPapers(papers)
  const topWords = keywords.map((k) => k.word)
  const mainTheme = inferTheme(keywords)
  const topTopic = topWords[0] || 'Artificial Intelligence'
  const secondTopic = topWords[1] || 'Adaptive Systems'
  const thirdTopic = topWords[2] || 'Scientific Reasoning'

  const titles = papers.map((p) => p.title).filter(Boolean)
  const sources = [...new Set(papers.map((p) => p.source || p.journal || 'Unknown'))]
  const years = papers.map((p) => p.publicationYear).filter(Boolean)

  const title = `A Unified Research Framework for ${topTopic} and ${secondTopic} in ${thirdTopic}-Driven Intelligent Systems`

  const baseIdea = {
    mode: 'multi-paper',
    title,
    sourcePapersCount: papers.length,
    sourceTitles: titles,
    sourceList: papers,
    themeSummary: mainTheme,

    problemStatement: `The selected papers collectively highlight strong research activity around ${mainTheme}, but they also reveal fragmentation across methods, objectives, and application settings. Existing studies often investigate isolated aspects of ${topTopic} and ${secondTopic}, while lacking unified approaches that integrate these concepts into scalable and research-grounded intelligent systems.`,

    abstract: `This proposed research synthesizes insights from ${papers.length} selected research papers and identifies a promising new direction at the intersection of ${topTopic}, ${secondTopic}, and ${thirdTopic}. By combining recurring concepts, underexplored overlaps, and research trends observed across the selected literature, this work proposes a unified framework aimed at improving generalizability, adaptability, and practical research value. The proposed study is expected to contribute a novel direction for future research by bridging fragmented subtopics into a more coherent and experimentally meaningful research pathway.`,

    researchGap: `A major gap across the selected papers is the limited integration of ${topTopic}, ${secondTopic}, and ${thirdTopic} into a single structured framework. While individual works address related sub-problems, there is insufficient research focused on cross-domain synthesis, generalized applicability, and adaptive evaluation under realistic or evolving environments.`,

    objectives: [
      `To synthesize major research patterns across the selected papers.`,
      `To identify underexplored intersections between ${topTopic}, ${secondTopic}, and ${thirdTopic}.`,
      `To design a structured and scalable framework grounded in the selected literature.`,
      `To evaluate how the proposed direction improves novelty, applicability, and research depth.`,
    ],

    methodology: [
      `Perform comparative analysis of the ${papers.length} selected papers to identify common and missing research dimensions.`,
      `Construct a thematic framework using repeated keywords, overlapping concepts, and recurring limitations.`,
      `Design a conceptual or computational model that unifies ${topTopic}, ${secondTopic}, and ${thirdTopic}.`,
      `Validate the proposed approach through benchmarking, simulation, or structured evaluation methodology.`,
      `Interpret outcomes with respect to novelty, feasibility, and future publication potential.`,
    ],

    expectedContribution: [
      `A multi-paper synthesized research direction.`,
      `A structured framework grounded in existing literature.`,
      `Improved novelty through topic intersection and gap fusion.`,
      `A strong foundation for future journal or conference paper development.`,
    ],

    futureScope: `Future work can extend this research by incorporating larger literature corpora, automated citation mapping, domain-specific datasets, and LLM-assisted experimentation pipelines. The framework may also be adapted for dynamic knowledge discovery and automated scientific ideation systems.`,

    keywords: [
      ...topWords.slice(0, 6),
      'Multi-paper synthesis',
      'Research gap analysis',
      'Scientific ideation',
    ],

    sources,
    years,
  }

  return {
    ...baseIdea,
    fullDraft: generateFullDraft(baseIdea)
  }
}

function generateResearchIdea(topic) {
  const cleanTopic = topic || 'Artificial Intelligence'

  const baseIdea = {
    mode: 'single-topic',
    title: `An Intelligent Framework for Advancing ${cleanTopic} Through Adaptive Research-Driven Modeling`,

    problemStatement: `Current research in ${cleanTopic} has shown strong growth, but many practical and theoretical gaps still remain. Existing approaches often focus on narrow benchmarks, limited datasets, or isolated problem settings, which reduces generalizability and real-world impact. There is a need for a more adaptive, scalable, and insight-driven framework that can better address unresolved challenges in ${cleanTopic}.`,

    abstract: `This research proposes a novel framework in the domain of ${cleanTopic} aimed at improving adaptability, interpretability, and real-world applicability. The study identifies underexplored limitations in current literature and develops a structured approach that integrates intelligent modeling, data-driven experimentation, and gap-oriented analysis. The proposed work is expected to contribute both theoretically and practically by establishing a stronger research foundation, improving experimental relevance, and enabling more robust future developments in ${cleanTopic}.`,

    researchGap: `A significant gap in ${cleanTopic} lies in the limited exploration of adaptive, scalable, and generalized approaches that can perform effectively beyond controlled experimental settings. Most prior studies emphasize optimization or accuracy, but insufficient attention has been given to explainability, domain transferability, and long-term usability.`,

    objectives: [
      `To analyze existing limitations and underexplored areas in ${cleanTopic}.`,
      `To design a structured framework addressing practical and theoretical weaknesses.`,
      `To evaluate the effectiveness of the proposed model using measurable performance metrics.`,
      `To identify how the proposed research can contribute novelty and long-term research value.`,
    ],

    methodology: [
      `Perform a systematic literature review on recent works related to ${cleanTopic}.`,
      `Collect and preprocess relevant datasets, benchmark tasks, or research references.`,
      `Design a conceptual or computational model aligned with the identified research gap.`,
      `Evaluate the framework using experimental validation, comparison studies, and performance analysis.`,
      `Interpret results with respect to novelty, research impact, and future applicability.`,
    ],

    expectedContribution: [
      `A new research direction in ${cleanTopic}.`,
      `A structured problem-to-solution framework.`,
      `Improved interpretability and research clarity.`,
      `Potential foundation for future journal or conference publication.`,
    ],

    futureScope: `Future work can extend this research into real-time systems, domain-specific deployment, cross-disciplinary integration, and AI-assisted automation pipelines. The proposed framework can also be expanded using larger datasets, hybrid models, or advanced generative AI systems.`,

    keywords: [
      cleanTopic,
      'Research Gap Analysis',
      'Adaptive Framework',
      'AI-driven Research',
      'Scientific Innovation',
      'Methodology Design',
    ],
  }

  return {
    ...baseIdea,
    fullDraft: generateFullDraft(baseIdea)
  }
}

function ResearchIdea({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('idea-generator')
  const { isSidebarOpen } = useSidebar()
  const [selectedTopic, setSelectedTopic] = useState('Artificial Intelligence')
  const [customTopic, setCustomTopic] = useState('')
  const [generatedIdea, setGeneratedIdea] = useState(null)
  const [showFullDraft, setShowFullDraft] = useState(false)

  useEffect(() => {
    const selectedPapersRaw = localStorage.getItem('selectedResearchPapers')
    const storedTopic = localStorage.getItem('researchIdeaTopic')

    if (selectedPapersRaw) {
      try {
        const parsedPapers = JSON.parse(selectedPapersRaw)
        if (Array.isArray(parsedPapers) && parsedPapers.length > 0) {
          setGeneratedIdea(generateFromSelectedPapers(parsedPapers))
          localStorage.removeItem('selectedResearchPapers')
          return
        }
      } catch (err) {
        console.error('Failed to parse selectedResearchPapers:', err)
      }
    }

    if (storedTopic) {
      setSelectedTopic(storedTopic)
      setGeneratedIdea(generateResearchIdea(storedTopic))
      localStorage.removeItem('researchIdeaTopic')
    } else {
      setGeneratedIdea(generateResearchIdea('Artificial Intelligence'))
    }
  }, [])

  const handleGenerate = () => {
    const finalTopic = customTopic.trim() || selectedTopic || 'Artificial Intelligence'
    setSelectedTopic(finalTopic)
    setGeneratedIdea(generateResearchIdea(finalTopic))
    setShowFullDraft(false)
  }

  const keywordString = useMemo(() => {
    return generatedIdea?.keywords?.join(', ') || ''
  }, [generatedIdea])

  const handleCopyDraft = async () => {
    if (!generatedIdea) return

    const draftText = `
TITLE:
${generatedIdea.title}

ABSTRACT:
${generatedIdea.abstract}

KEYWORDS:
${keywordString}

PROBLEM STATEMENT:
${generatedIdea.problemStatement}

RESEARCH GAP:
${generatedIdea.researchGap}

OBJECTIVES:
- ${generatedIdea.objectives.join('\n- ')}

METHODOLOGY:
- ${generatedIdea.methodology.join('\n- ')}

EXPECTED CONTRIBUTION:
- ${generatedIdea.expectedContribution.join('\n- ')}

FUTURE SCOPE:
${generatedIdea.futureScope}

INTRODUCTION:
${generatedIdea.fullDraft.introduction}

RELATED WORK:
${generatedIdea.fullDraft.relatedWork}

FULL PROBLEM STATEMENT:
${generatedIdea.fullDraft.fullProblemStatement}

EXPECTED RESULTS:
${generatedIdea.fullDraft.expectedResults}

CONCLUSION:
${generatedIdea.fullDraft.conclusion}

REFERENCES:
- ${generatedIdea.fullDraft.draftReferences.join('\n- ')}
    `.trim()

    try {
      await navigator.clipboard.writeText(draftText)
      alert('Full draft copied successfully!')
    } catch (err) {
      console.error('Copy failed:', err)
      alert('Failed to copy draft.')
    }
  }

  const handleExportPDF = () => {
    if (!generatedIdea) return

    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const maxWidth = pageWidth - margin * 2
    let y = 20

    const addSectionTitle = (title) => {
      if (y > pageHeight - 25) {
        doc.addPage()
        y = 20
      }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(title, margin, y)
      y += 8
    }

    const addParagraph = (text) => {
      if (!text) return
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      const lines = doc.splitTextToSize(text, maxWidth)

      lines.forEach((line) => {
        if (y > pageHeight - 15) {
          doc.addPage()
          y = 20
        }
        doc.text(line, margin, y)
        y += 6
      })

      y += 4
    }

    const addBulletList = (items) => {
      if (!items || !items.length) return

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)

      items.forEach((item) => {
        const lines = doc.splitTextToSize(`• ${item}`, maxWidth)

        lines.forEach((line) => {
          if (y > pageHeight - 15) {
            doc.addPage()
            y = 20
          }
          doc.text(line, margin, y)
          y += 6
        })
      })

      y += 4
    }

    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    const titleLines = doc.splitTextToSize(generatedIdea.title, maxWidth)
    titleLines.forEach((line) => {
      doc.text(line, margin, y)
      y += 8
    })
    y += 4

    addSectionTitle('Abstract')
    addParagraph(generatedIdea.abstract)

    addSectionTitle('Keywords')
    addParagraph(keywordString)

    addSectionTitle('Problem Statement')
    addParagraph(generatedIdea.problemStatement)

    addSectionTitle('Research Gap')
    addParagraph(generatedIdea.researchGap)

    addSectionTitle('Research Objectives')
    addBulletList(generatedIdea.objectives)

    addSectionTitle('Proposed Methodology')
    addBulletList(generatedIdea.methodology)

    addSectionTitle('Expected Contribution')
    addBulletList(generatedIdea.expectedContribution)

    addSectionTitle('Future Scope')
    addParagraph(generatedIdea.futureScope)

    if (generatedIdea.fullDraft) {
      addSectionTitle('Introduction')
      addParagraph(generatedIdea.fullDraft.introduction)

      addSectionTitle('Related Work')
      addParagraph(generatedIdea.fullDraft.relatedWork)

      addSectionTitle('Expanded Problem Statement')
      addParagraph(generatedIdea.fullDraft.fullProblemStatement)

      addSectionTitle('Expected Results')
      addParagraph(generatedIdea.fullDraft.expectedResults)

      addSectionTitle('Conclusion')
      addParagraph(generatedIdea.fullDraft.conclusion)

      addSectionTitle('Draft References')
      addBulletList(generatedIdea.fullDraft.draftReferences)
    }

    const safeTitle = (generatedIdea.title || 'research-draft')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()

    doc.save(`${safeTitle}.pdf`)
  }

  return (
    <div className="idea-wrapper">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} setCurrentPage={setCurrentPage} />

      <main className={`idea-main ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
        <motion.div
          className="idea-header"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>AI Research Idea Generator</h1>
          <p>Generate publishable-style research ideas and full structured paper drafts from topics, gaps, and selected papers</p>
        </motion.div>

        <div className="idea-top-panel glass-card">
          <div className="idea-input-group">
            <label>Custom Topic (Optional)</label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder={`Current topic: ${selectedTopic}`}
              className="idea-input"
            />
          </div>

          <button className="idea-generate-btn" onClick={handleGenerate}>
            Generate Research Idea
          </button>
        </div>

        {generatedIdea && (
          <motion.div
            className="idea-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            {generatedIdea.mode === 'multi-paper' && (
              <section className="idea-card glass-card">
                <h2>Multi-Paper Synthesis Summary</h2>
                <p><strong>Selected Papers:</strong> {generatedIdea.sourcePapersCount}</p>
                <p><strong>Detected Theme:</strong> {generatedIdea.themeSummary}</p>
                <p><strong>Sources:</strong> {(generatedIdea.sources || []).join(', ')}</p>

                {generatedIdea.sourceTitles?.length > 0 && (
                  <div style={{ marginTop: '14px' }}>
                    <strong>Used Paper Titles:</strong>
                    <ul style={{ marginTop: '10px' }}>
                      {generatedIdea.sourceTitles.map((title, idx) => (
                        <li key={idx}>{title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            <section className="idea-card glass-card">
              <h2>Suggested Research Title</h2>
              <p>{generatedIdea.title}</p>
            </section>

            <section className="idea-card glass-card">
              <h2>Problem Statement</h2>
              <p>{generatedIdea.problemStatement}</p>
            </section>

            <section className="idea-card glass-card">
              <h2>Abstract</h2>
              <p>{generatedIdea.abstract}</p>
            </section>

            <section className="idea-card glass-card">
              <h2>Research Gap</h2>
              <p>{generatedIdea.researchGap}</p>
            </section>

            <section className="idea-card glass-card">
              <h2>Research Objectives</h2>
              <ul>
                {generatedIdea.objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </section>

            <section className="idea-card glass-card">
              <h2>Proposed Methodology</h2>
              <ul>
                {generatedIdea.methodology.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </section>

            <section className="idea-card glass-card">
              <h2>Expected Contribution</h2>
              <ul>
                {generatedIdea.expectedContribution.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="idea-card glass-card">
              <h2>Future Scope</h2>
              <p>{generatedIdea.futureScope}</p>
            </section>

            <section className="idea-card glass-card">
              <h2>Keywords</h2>
              <p>{keywordString}</p>
            </section>

            <div className="idea-actions">
              <button className="full-draft-btn" onClick={() => setShowFullDraft(!showFullDraft)}>
                {showFullDraft ? 'Hide Full Draft' : 'Generate Full Research Paper Draft'}
              </button>

              <button className="copy-draft-btn" onClick={handleCopyDraft}>
                Copy Full Draft
              </button>

              <button className="export-pdf-btn" onClick={handleExportPDF}>
                Export PDF
              </button>
            </div>

            {showFullDraft && generatedIdea.fullDraft && (
              <motion.div
                className="full-draft-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <section className="idea-card glass-card">
                  <h2>Introduction</h2>
                  <p>{generatedIdea.fullDraft.introduction}</p>
                </section>

                <section className="idea-card glass-card">
                  <h2>Related Work</h2>
                  <p>{generatedIdea.fullDraft.relatedWork}</p>
                </section>

                <section className="idea-card glass-card">
                  <h2>Expanded Problem Statement</h2>
                  <p>{generatedIdea.fullDraft.fullProblemStatement}</p>
                </section>

                <section className="idea-card glass-card">
                  <h2>Expected Results</h2>
                  <p>{generatedIdea.fullDraft.expectedResults}</p>
                </section>

                <section className="idea-card glass-card">
                  <h2>Conclusion</h2>
                  <p>{generatedIdea.fullDraft.conclusion}</p>
                </section>

                <section className="idea-card glass-card">
                  <h2>Draft References</h2>
                  <ul>
                    {generatedIdea.fullDraft.draftReferences.map((ref, idx) => (
                      <li key={idx}>{ref}</li>
                    ))}
                  </ul>
                </section>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default ResearchIdea