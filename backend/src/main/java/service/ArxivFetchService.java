package com.shunyaai.backend.service;

import com.shunyaai.backend.entity.Paper;
import com.shunyaai.backend.repository.PaperRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ArxivFetchService {

    private final PaperRepository paperRepository;

    public ArxivFetchService(PaperRepository paperRepository) {
        this.paperRepository = paperRepository;
    }

    public Map<String, Object> fetchFromArxiv(String query, int maxResults) {

        String url = "https://export.arxiv.org/api/query?search_query=all:"
                + query.replace(" ", "+")
                + "&start=0&max_results=" + maxResults;

        RestTemplate restTemplate = new RestTemplate();

        // ✅ Add headers so arXiv does not reject request
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "ShunyaAI/1.0 (Research Platform; contact: shunyaai@example.com)");
        headers.setAccept(List.of(MediaType.APPLICATION_XML));

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
        );

        String xmlResponse = response.getBody();

        if (xmlResponse == null || xmlResponse.isEmpty()) {
            throw new RuntimeException("Failed to fetch data from arXiv");
        }

        Document doc = Jsoup.parse(xmlResponse, "", org.jsoup.parser.Parser.xmlParser());
        Elements entries = doc.select("entry");

        int savedCount = 0;
        int skippedCount = 0;
        List<Paper> fetchedPapers = new ArrayList<>();

        for (Element entryEl : entries) {
            Paper paper = parseEntry(entryEl);

            if (paper.getDoi() != null && !paper.getDoi().isBlank()
                    && paperRepository.existsByDoi(paper.getDoi())) {
                skippedCount++;
                continue;
            }

            paperRepository.save(paper);
            fetchedPapers.add(paper);
            savedCount++;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("query", query);
        result.put("totalFetched", entries.size());
        result.put("saved", savedCount);
        result.put("skipped", skippedCount);
        result.put("papers", fetchedPapers);

        return result;
    }

    private Paper parseEntry(Element entry) {
        Paper paper = new Paper();

        String title = getText(entry, "title");
        String summary = getText(entry, "summary");
        String published = getText(entry, "published");
        String id = getText(entry, "id");

        // Authors
        Elements authorElements = entry.select("author > name");
        List<String> authorsList = new ArrayList<>();
        for (Element author : authorElements) {
            authorsList.add(author.text());
        }
        String authors = String.join(", ", authorsList);

        // Categories as keywords
        Elements categoryElements = entry.select("category");
        Set<String> keywordsSet = new HashSet<>();
        for (Element category : categoryElements) {
            String term = category.attr("term");
            if (term != null && !term.isBlank()) {
                keywordsSet.add(term);
            }
        }
        String keywords = String.join(", ", keywordsSet);

        // DOI (optional in arXiv)
        String doi = null;
        Element doiElement = entry.selectFirst("arxiv\\:doi, doi");
        if (doiElement != null) {
            doi = doiElement.text();
        }

        // Year extraction
        Integer year = null;
        if (published != null && published.length() >= 4) {
            try {
                year = Integer.parseInt(published.substring(0, 4));
            } catch (Exception ignored) {}
        }

        paper.setTitle(title);
        paper.setAbstractText(summary);
        paper.setAuthors(authors);
        paper.setJournal("arXiv");
        paper.setPublicationYear(year);
        paper.setCitationCount(0);

        // fallback unique identifier if DOI missing
        paper.setDoi(doi != null ? doi : "arxiv-" + UUID.randomUUID());

        paper.setSource("arXiv");
        paper.setUrl(id);
        paper.setKeywords(keywords);

        return paper;
    }

    private String getText(Element parent, String tag) {
        Element element = parent.selectFirst(tag);
        return element != null ? element.text().trim() : null;
    }
}