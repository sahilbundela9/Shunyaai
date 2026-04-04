package com.shunyaai.backend.service;

import com.shunyaai.backend.entity.Paper;
import com.shunyaai.backend.entity.User;
import com.shunyaai.backend.repository.PaperRepository;
import com.shunyaai.backend.repository.UserRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.w3c.dom.*;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.net.HttpURLConnection;
import java.net.URLEncoder;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaperService {

    private final PaperRepository paperRepository;
    private final UserRepository userRepository;

    public PaperService(PaperRepository paperRepository, UserRepository userRepository) {
        this.paperRepository = paperRepository;
        this.userRepository = userRepository;
    }

    // =============================
    // GET ALL PAPERS
    // =============================
    public List<Paper> getAllPapers() {
        return paperRepository.findAll();
    }

    // =============================
    // GET SINGLE PAPER
    // =============================
    public Optional<Paper> getPaperById(Long id) {
        return paperRepository.findById(id);
    }

    // =============================
    // SEARCH PAPERS
    // =============================
    public List<Paper> search(String query) {
        return paperRepository.search(query);
    }

    // =============================
    // CREATE PAPER
    // =============================
    public Paper createPaper(Paper paper) {
        if (paper.getDoi() != null && paperRepository.existsByDoi(paper.getDoi())) {
            throw new RuntimeException("Paper already exists with DOI");
        }
        return paperRepository.save(paper);
    }

    // =============================
    // BULK INSERT PAPERS
    // =============================
    public Map<String, Object> saveAllPapers(List<Paper> papers) {
        int savedCount = 0;
        int skippedCount = 0;

        for (Paper paper : papers) {
            if (paper.getDoi() != null && paperRepository.existsByDoi(paper.getDoi())) {
                skippedCount++;
                continue;
            }

            paperRepository.save(paper);
            savedCount++;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("saved", savedCount);
        result.put("skipped", skippedCount);

        return result;
    }

    // =============================
    // MULTI-SOURCE PAPER FETCH
    // =============================
    public List<Paper> fetchPapers(String query, int limit, String sources) {
        if (query == null || query.isBlank()) {
            throw new RuntimeException("Query is required");
        }

        int safeLimit = Math.max(10, Math.min(limit, 100));

        Set<String> selectedSources = Arrays.stream(sources.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<Paper> combinedResults = new ArrayList<>();

        int perSourceLimit = Math.max(10, safeLimit / Math.max(selectedSources.size(), 1));

        if (selectedSources.contains("arxiv")) {
            try {
                List<Paper> arxivResults = fetchFromArxiv(query, perSourceLimit);
                combinedResults.addAll(arxivResults);
                System.out.println("✅ arXiv fetched: " + arxivResults.size());
            } catch (Exception e) {
                System.out.println("❌ arXiv fetch failed: " + e.getMessage());
                e.printStackTrace();
            }
        }

        if (selectedSources.contains("crossref")) {
            try {
                List<Paper> crossrefResults = fetchFromCrossref(query, perSourceLimit);
                combinedResults.addAll(crossrefResults);
                System.out.println("✅ Crossref fetched: " + crossrefResults.size());
            } catch (Exception e) {
                System.out.println("❌ Crossref fetch failed: " + e.getMessage());
                e.printStackTrace();
            }
        }

        if (combinedResults.isEmpty()) {
            System.out.println("⚠️ No papers fetched from any source for query: " + query);
            return new ArrayList<>();
        }

        Map<String, Paper> unique = new LinkedHashMap<>();

        for (Paper paper : combinedResults) {
            String key = buildPaperUniquenessKey(paper);
            if (!unique.containsKey(key)) {
                unique.put(key, paper);
            }
        }

        List<Paper> ranked = new ArrayList<>(unique.values());

        ranked.sort((a, b) ->
                Integer.compare(computeRelevanceScore(b, query), computeRelevanceScore(a, query))
        );

        return ranked.stream()
                .limit(safeLimit)
                .collect(Collectors.toList());
    }

    // =============================
    // FETCH FROM ARXIV
    // =============================
    public List<Paper> fetchFromArxiv(String query, int maxResults) {
        List<Paper> savedPapers = new ArrayList<>();

        try {
            String normalizedQuery = buildArxivQuery(query);
            String encodedQuery = URLEncoder.encode(normalizedQuery, StandardCharsets.UTF_8);

            String apiUrl = "https://export.arxiv.org/api/query?search_query="
                    + encodedQuery
                    + "&start=0&max_results=" + maxResults
                    + "&sortBy=relevance&sortOrder=descending";

            String xmlResponse = fetchTextFromUrl(apiUrl, "application/atom+xml");

            if (xmlResponse == null || xmlResponse.isBlank()) {
                throw new RuntimeException("Empty response received from arXiv");
            }

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(false);

            Document doc = factory.newDocumentBuilder()
                    .parse(new InputSource(new StringReader(xmlResponse)));

            NodeList entries = doc.getElementsByTagName("entry");

            for (int i = 0; i < entries.getLength(); i++) {
                Element entry = (Element) entries.item(i);

                Paper paper = new Paper();

                String title = cleanText(getText(entry, "title"));
                paper.setTitle(limit(title, 255));

                String summary = cleanText(getText(entry, "summary"));
                paper.setAbstractText(limit(summary, 10000));

                NodeList authors = entry.getElementsByTagName("author");
                List<String> authorNames = new ArrayList<>();

                for (int j = 0; j < authors.getLength(); j++) {
                    Element author = (Element) authors.item(j);
                    String authorName = cleanText(getText(author, "name"));
                    if (authorName != null && !authorName.isBlank()) {
                        authorNames.add(authorName);
                    }
                }

                paper.setAuthors(limit(String.join(", ", authorNames), 2000));

                String arxivUrl = cleanText(getText(entry, "id"));
                paper.setUrl(limit(arxivUrl, 1000));

                String published = cleanText(getText(entry, "published"));
                if (published != null && published.length() >= 4) {
                    try {
                        paper.setPublicationYear(Integer.parseInt(published.substring(0, 4)));
                    } catch (Exception ignored) {
                        paper.setPublicationYear(null);
                    }
                }

                paper.setJournal("arXiv");
                paper.setSource("arXiv");
                paper.setDoi(limit(arxivUrl, 255));
                paper.setCitationCount(0);

                NodeList categories = entry.getElementsByTagName("category");
                List<String> keywordList = new ArrayList<>();

                for (int j = 0; j < categories.getLength(); j++) {
                    Element cat = (Element) categories.item(j);
                    String term = cleanText(cat.getAttribute("term"));
                    if (term != null && !term.isBlank()) {
                        keywordList.add(term);
                    }
                }

                paper.setKeywords(limit(String.join(", ", keywordList), 2000));

                if (paper.getTitle() == null || paper.getTitle().isBlank()) {
                    continue;
                }

                if (paper.getDoi() == null || paper.getDoi().isBlank()) {
                    paper.setDoi("arxiv-" + UUID.randomUUID());
                }

                savedPapers.add(saveIfNewOrReturnExisting(paper));
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch papers from arXiv: " + e.getMessage());
        }

        return savedPapers;
    }

    // =============================
    // FETCH FROM CROSSREF
    // =============================
    public List<Paper> fetchFromCrossref(String query, int maxResults) {
        List<Paper> savedPapers = new ArrayList<>();

        try {
            String encodedQuery = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);

            String apiUrl = "https://api.crossref.org/works?query.bibliographic="
                    + encodedQuery
                    + "&rows=" + maxResults
                    + "&sort=relevance&order=desc";

            String jsonResponse = fetchTextFromUrl(apiUrl, "application/json");

            JSONObject root = new JSONObject(jsonResponse);
            JSONObject message = root.getJSONObject("message");
            JSONArray items = message.getJSONArray("items");

            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);

                Paper paper = new Paper();

                String title = "";
                if (item.has("title") && item.getJSONArray("title").length() > 0) {
                    title = cleanText(item.getJSONArray("title").optString(0, ""));
                }
                paper.setTitle(limit(title, 255));

                String abstractText = cleanText(stripHtml(item.optString("abstract", "")));
                paper.setAbstractText(limit(abstractText, 10000));

                List<String> authorNames = new ArrayList<>();
                if (item.has("author")) {
                    JSONArray authors = item.getJSONArray("author");
                    for (int j = 0; j < authors.length(); j++) {
                        JSONObject author = authors.getJSONObject(j);
                        String given = cleanText(author.optString("given", ""));
                        String family = cleanText(author.optString("family", ""));
                        String fullName = (given + " " + family).trim();
                        if (!fullName.isBlank()) {
                            authorNames.add(fullName);
                        }
                    }
                }
                paper.setAuthors(limit(String.join(", ", authorNames), 2000));

                String doi = cleanText(item.optString("DOI", ""));
                if (doi != null && !doi.isBlank()) {
                    paper.setDoi(limit(doi, 255));
                    paper.setUrl(limit("https://doi.org/" + doi, 1000));
                } else {
                    paper.setDoi("crossref-" + UUID.randomUUID());
                }

                String journal = "";
                if (item.has("container-title") && item.getJSONArray("container-title").length() > 0) {
                    journal = cleanText(item.getJSONArray("container-title").optString(0, ""));
                }
                paper.setJournal(limit(journal, 255));

                String publisher = cleanText(item.optString("publisher", ""));
                paper.setSource(limit(inferSourceFromPublisherOrJournal(publisher, journal), 255));

                Integer year = extractCrossrefYear(item);
                paper.setPublicationYear(year);

                paper.setCitationCount(item.optInt("is-referenced-by-count", 0));

                List<String> keywords = new ArrayList<>();
                if (item.has("subject")) {
                    JSONArray subjects = item.getJSONArray("subject");
                    for (int j = 0; j < subjects.length(); j++) {
                        String subject = cleanText(subjects.optString(j, ""));
                        if (subject != null && !subject.isBlank()) {
                            keywords.add(subject);
                        }
                    }
                }
                paper.setKeywords(limit(String.join(", ", keywords), 2000));

                if (paper.getTitle() == null || paper.getTitle().isBlank()) {
                    continue;
                }

                savedPapers.add(saveIfNewOrReturnExisting(paper));
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch papers from Crossref: " + e.getMessage());
        }

        return savedPapers;
    }

    // =============================
    // BASIC STATS
    // =============================
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalPapers = paperRepository.count();
        int currentYear = Year.now().getValue();
        long papersThisYear = paperRepository.countByPublicationYear(currentYear);

        stats.put("totalPapers", totalPapers);
        stats.put("papersThisYear", papersThisYear);

        return stats;
    }

    public long getUniqueTopicsCount() {
        List<Paper> papers = paperRepository.findAll();
        Set<String> uniqueKeywords = new HashSet<>();

        for (Paper paper : papers) {
            String keywords = paper.getKeywords();

            if (keywords != null && !keywords.isEmpty()) {
                String[] splitKeywords = keywords.split(",");

                for (String keyword : splitKeywords) {
                    String cleaned = keyword.trim().toLowerCase();

                    if (!cleaned.isEmpty()) {
                        uniqueKeywords.add(cleaned);
                    }
                }
            }
        }

        return uniqueKeywords.size();
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalPapers = paperRepository.count();
        long savedPapers = totalPapers;
        long topics = getUniqueTopicsCount();
        long gaps = topics / 2;

        stats.put("totalPapersFetched", totalPapers);
        stats.put("savedPapers", savedPapers);
        stats.put("researchTopics", topics);
        stats.put("researchGaps", gaps);

        return stats;
    }

    // =============================
    // SAVE PAPER FOR USER (GENERAL SAVE)
    // =============================
    public String savePaperForUser(Long paperId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));

        if (user.getSavedPapers().contains(paper)) {
            return "Paper already saved";
        }

        user.getSavedPapers().add(paper);
        userRepository.save(user);

        return "Paper saved successfully";
    }

    // =============================
    // UNSAVE PAPER FOR USER
    // =============================
    public String unsavePaperForUser(Long paperId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));

        user.getSavedPapers().remove(paper);
        userRepository.save(user);

        return "Paper unsaved successfully";
    }

    // =============================
    // GET SAVED PAPERS FOR USER
    // =============================
    public Set<Paper> getSavedPapersForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getSavedPapers();
    }

    // =============================
    // CHECK IF PAPER IS SAVED
    // =============================
    public boolean isPaperSaved(Long paperId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getSavedPapers().stream()
                .anyMatch(paper -> paper.getId().equals(paperId));
    }

    // =============================
    // RESEARCH GAP + FULL INSIGHTS
    // =============================
    public Map<String, Object> getSavedPapersGapAnalysis(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Paper> savedPapers = user.getSavedPapers();

        Map<String, Integer> topicFrequency = new HashMap<>();
        Map<String, Integer> keywordFrequency = new HashMap<>();
        Map<String, Integer> sourceFrequency = new HashMap<>();
        Map<String, Integer> yearFrequency = new HashMap<>();
        Map<String, Integer> authorFrequency = new HashMap<>();

        Set<String> stopWords = Set.of(
                "ai", "ml", "the", "and", "of", "for", "in", "to", "on", "with",
                "a", "an", "using", "based", "study", "analysis", "approach",
                "system", "method", "methods", "paper", "research", "from",
                "into", "over", "under", "towards", "via", "their", "this"
        );

        for (Paper paper : savedPapers) {

            String source = paper.getSource() != null ? paper.getSource().trim().toLowerCase() : "unknown";
            sourceFrequency.put(source, sourceFrequency.getOrDefault(source, 0) + 1);

            String year = paper.getPublicationYear() != null ? paper.getPublicationYear().toString() : "unknown";
            yearFrequency.put(year, yearFrequency.getOrDefault(year, 0) + 1);

            if (paper.getAuthors() != null && !paper.getAuthors().isBlank()) {
                String[] authors = paper.getAuthors().split(",");

                for (String author : authors) {
                    String cleaned = author.trim();
                    if (!cleaned.isEmpty()) {
                        authorFrequency.put(cleaned, authorFrequency.getOrDefault(cleaned, 0) + 1);
                    }
                }
            }

            if (paper.getKeywords() != null && !paper.getKeywords().isBlank()) {
                String[] keywords = paper.getKeywords().split(",");

                for (String keyword : keywords) {
                    String cleaned = keyword.trim().toLowerCase();

                    if (!cleaned.isEmpty() && !stopWords.contains(cleaned)) {
                        keywordFrequency.put(cleaned, keywordFrequency.getOrDefault(cleaned, 0) + 1);
                        topicFrequency.put(cleaned, topicFrequency.getOrDefault(cleaned, 0) + 1);
                    }
                }
            }

            if (paper.getTitle() != null) {
                String[] words = paper.getTitle()
                        .toLowerCase()
                        .replaceAll("[^a-zA-Z0-9 ]", "")
                        .split("\\s+");

                for (String word : words) {
                    if (word.length() > 3 && !stopWords.contains(word)) {
                        topicFrequency.put(word, topicFrequency.getOrDefault(word, 0) + 1);
                    }
                }
            }

            if (paper.getAbstractText() != null) {
                String[] words = paper.getAbstractText()
                        .toLowerCase()
                        .replaceAll("[^a-zA-Z0-9 ]", "")
                        .split("\\s+");

                for (String word : words) {
                    if (word.length() > 5 && !stopWords.contains(word)) {
                        keywordFrequency.put(word, keywordFrequency.getOrDefault(word, 0) + 1);
                    }
                }
            }
        }

        List<Map<String, Object>> sortedTopics = topicFrequency.entrySet()
                .stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("topic", entry.getKey());
                    item.put("count", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> sortedKeywords = keywordFrequency.entrySet()
                .stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(15)
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("keyword", entry.getKey());
                    item.put("count", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> sourceDistribution = sourceFrequency.entrySet()
                .stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("source", entry.getKey());
                    item.put("count", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> yearDistribution = yearFrequency.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("year", entry.getKey());
                    item.put("count", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> topAuthors = authorFrequency.entrySet()
                .stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(8)
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("author", entry.getKey());
                    item.put("count", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> topTopics = sortedTopics.stream()
                .limit(8)
                .collect(Collectors.toList());

        List<Map<String, Object>> researchGaps = sortedTopics.stream()
                .filter(item -> ((Integer) item.get("count")) <= 1)
                .limit(8)
                .map(item -> {
                    Map<String, Object> gap = new HashMap<>();
                    gap.put("topic", item.get("topic"));
                    gap.put("count", item.get("count"));
                    gap.put("reason", "Low frequency but potentially valuable underexplored topic");
                    gap.put("opportunityScore", 75);
                    return gap;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> opportunitySignals = new ArrayList<>();
        opportunitySignals.add(signal("saved", Math.min(savedPapers.size() * 10, 100)));
        opportunitySignals.add(signal("topics", Math.min(topTopics.size() * 12, 100)));
        opportunitySignals.add(signal("gaps", Math.min(researchGaps.size() * 15, 100)));
        opportunitySignals.add(signal("novel", Math.min(researchGaps.size() * 18, 100)));
        opportunitySignals.add(signal("scope", Math.min(sortedKeywords.size() * 6, 100)));

        int researchCoverage = Math.min((int) savedPapers.size() * 15, 100);
        int topicDiversity = Math.min((int) topTopics.size() * 12, 100);
        int gapDiscoveryPotential = Math.min((int) researchGaps.size() * 18, 100);
        int trendAlignment = Math.min((int) sortedKeywords.size() * 5, 100);
        int noveltyOpportunity = Math.min((int) (researchGaps.size() * 10 + topTopics.size() * 5), 100);

        Map<String, Object> researchMaturity = new HashMap<>();
        researchMaturity.put("researchCoverage", researchCoverage);
        researchMaturity.put("topicDiversity", topicDiversity);
        researchMaturity.put("gapDiscoveryPotential", gapDiscoveryPotential);
        researchMaturity.put("trendAlignment", trendAlignment);
        researchMaturity.put("noveltyOpportunity", noveltyOpportunity);

        Map<String, Object> result = new HashMap<>();
        result.put("totalSavedPapers", savedPapers.size());
        result.put("topTopics", topTopics);
        result.put("researchGaps", researchGaps);
        result.put("topKeywords", sortedKeywords);
        result.put("topicDistribution", topTopics);
        result.put("sourceDistribution", sourceDistribution);
        result.put("yearDistribution", yearDistribution);
        result.put("topAuthors", topAuthors);
        result.put("researchMaturity", researchMaturity);
        result.put("opportunitySignals", opportunitySignals);

        return result;
    }

    private Paper saveIfNewOrReturnExisting(Paper paper) {
        if (paper.getDoi() != null && !paper.getDoi().isBlank()) {
            Optional<Paper> existing = paperRepository.findAll().stream()
                    .filter(p -> paper.getDoi().equalsIgnoreCase(p.getDoi()))
                    .findFirst();

            if (existing.isPresent()) {
                return existing.get();
            }

            return paperRepository.save(paper);
        }

        return paperRepository.save(paper);
    }

    private String buildPaperUniquenessKey(Paper paper) {
        if (paper.getDoi() != null && !paper.getDoi().isBlank()) {
            return "doi:" + paper.getDoi().trim().toLowerCase();
        }
        return "title:" + Optional.ofNullable(paper.getTitle()).orElse("").trim().toLowerCase();
    }

    private int computeRelevanceScore(Paper paper, String query) {
        String q = normalize(query);
        List<String> tokens = tokenize(query);

        String title = normalize(paper.getTitle());
        String abs = normalize(paper.getAbstractText());
        String keywords = normalize(paper.getKeywords());
        String authors = normalize(paper.getAuthors());
        String source = normalize(paper.getSource());
        String journal = normalize(paper.getJournal());

        int score = 0;

        if (title.contains(q)) score += 120;
        if (keywords.contains(q)) score += 90;
        if (abs.contains(q)) score += 70;
        if (authors.contains(q)) score += 20;
        if (source.contains(q) || journal.contains(q)) score += 15;

        for (String token : tokens) {
            if (title.contains(token)) score += 15;
            if (keywords.contains(token)) score += 12;
            if (abs.contains(token)) score += 8;
            if (authors.contains(token)) score += 3;
            if (source.contains(token) || journal.contains(token)) score += 2;
        }

        if (paper.getPublicationYear() != null) {
            score += Math.max(0, paper.getPublicationYear() - 2016);
        }

        if (paper.getCitationCount() != null) {
            score += Math.min(paper.getCitationCount() / 5, 40);
        }

        return score;
    }

    private String buildArxivQuery(String userQuery) {
        List<String> tokens = tokenize(userQuery);

        if (tokens.isEmpty()) {
            return "all:" + userQuery;
        }

        return "all:" + String.join("+AND+", tokens);
    }

    private Integer extractCrossrefYear(JSONObject item) {
        try {
            if (item.has("published-print")) {
                JSONArray parts = item.getJSONObject("published-print").getJSONArray("date-parts");
                return parts.getJSONArray(0).getInt(0);
            }
            if (item.has("published-online")) {
                JSONArray parts = item.getJSONObject("published-online").getJSONArray("date-parts");
                return parts.getJSONArray(0).getInt(0);
            }
            if (item.has("created")) {
                JSONArray parts = item.getJSONObject("created").getJSONArray("date-parts");
                return parts.getJSONArray(0).getInt(0);
            }
        } catch (Exception ignored) {}

        return null;
    }

    private String inferSourceFromPublisherOrJournal(String publisher, String journal) {
        String text = (normalize(publisher) + " " + normalize(journal)).trim();

        if (text.contains("ieee")) return "IEEE";
        if (text.contains("association for computing machinery") || text.contains("acm")) return "ACM";
        if (text.contains("springer")) return "Springer";
        if (text.contains("elsevier") || text.contains("sciencedirect")) return "ScienceDirect / Elsevier";
        if (text.contains("nature")) return "Nature";
        if (text.contains("wiley")) return "Wiley";
        if (text.contains("taylor") || text.contains("francis")) return "Taylor & Francis";
        if (text.contains("mdpi")) return "MDPI";
        if (text.contains("sage")) return "SAGE";
        if (text.contains("frontiers")) return "Frontiers";

        return !publisher.isBlank() ? publisher : "Crossref";
    }

    private String fetchTextFromUrl(String apiUrl, String acceptHeader) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(apiUrl).openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(12000);
        connection.setReadTimeout(20000);
        connection.setRequestProperty("User-Agent", "ShunyaAI/1.0 (Research Paper Fetcher)");
        connection.setRequestProperty("Accept", acceptHeader);

        int status = connection.getResponseCode();

        if (status != 200) {
            throw new RuntimeException("External API returned HTTP " + status);
        }

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8)
        );

        StringBuilder response = new StringBuilder();
        String line;

        while ((line = reader.readLine()) != null) {
            response.append(line).append("\n");
        }

        reader.close();
        connection.disconnect();

        return response.toString();
    }

    private String getText(Element element, String tag) {
        NodeList list = element.getElementsByTagName(tag);
        if (list.getLength() > 0 && list.item(0) != null) {
            return list.item(0).getTextContent().trim();
        }
        return null;
    }

    private String cleanText(String text) {
        if (text == null) return null;
        return text.replaceAll("\\s+", " ").trim();
    }

    private String stripHtml(String text) {
        if (text == null) return null;
        return text.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
    }

    private String limit(String text, int max) {
        if (text == null) return null;
        return text.length() <= max ? text : text.substring(0, max);
    }

    private String normalize(String text) {
        return Optional.ofNullable(text).orElse("").toLowerCase().trim();
    }

    private List<String> tokenize(String text) {
        return Arrays.stream(normalize(text).split("[\\s,./()_-]+"))
                .map(String::trim)
                .filter(token -> token.length() > 1)
                .toList();
    }

    private Map<String, Object> signal(String label, int value) {
        Map<String, Object> item = new HashMap<>();
        item.put("label", label);
        item.put("value", value);
        return item;
    }
}