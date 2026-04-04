package com.shunyaai.backend.service;

import com.shunyaai.backend.entity.Paper;
import com.shunyaai.backend.repository.PaperRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Value("${openrouter.api.key}")
    private String openRouterApiKey;

    @Value("${openrouter.model:openai/gpt-3.5-turbo}")
    private String model;

    private final PaperRepository paperRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public ChatService(PaperRepository paperRepository) {
        this.paperRepository = paperRepository;
    }

    public String askQuestion(String query, List<Long> paperIds, String mode) {
        try {
            List<Paper> papers = loadPapers(paperIds);
            String paperContext = buildPaperContext(papers);

            String systemPrompt = """
                    You are an AI Research Assistant for a SaaS research platform.

                    Your role:
                    - Answer ONLY using the provided paper context when possible
                    - If the user asks for summary, comparison, gaps, methodology, datasets, limitations, future work, or project ideas, answer clearly
                    - Be academically useful
                    - If context is insufficient, say so honestly
                    - Keep answers structured and helpful
                    - Never fabricate paper-specific facts
                    """;

            String userPrompt = """
                    USER QUESTION:
                    %s

                    MODE:
                    %s

                    PAPER CONTEXT:
                    %s
                    """.formatted(query, mode, paperContext);

            return callOpenRouter(systemPrompt, userPrompt);

        } catch (Exception e) {
            e.printStackTrace();
            return "Sorry, I could not process your research question right now.";
        }
    }

    public List<String> generateSuggestions(String partialQuery) {
        try {
            if (partialQuery == null || partialQuery.trim().length() < 2) {
                return List.of();
            }

            String systemPrompt = """
                    You are a research search assistant.

                    Generate 5 short academic search suggestions based on the partial query.

                    Rules:
                    - Suggestions must be useful for searching research papers
                    - Keep each suggestion concise
                    - Cover different relevant directions if possible
                    - Return ONLY suggestions
                    - One suggestion per line
                    - No numbering
                    - No bullets
                    - No explanation
                    """;

            String userPrompt = "Partial query: " + partialQuery.trim();

            String response = callOpenRouter(systemPrompt, userPrompt);

            if (response == null || response.isBlank()) {
                return List.of();
            }

            return response.lines()
                    .map(String::trim)
                    .filter(line -> !line.isBlank())
                    .map(line -> line.replaceFirst("^[\\-\\*\\d\\.\\)\\s]+", "").trim())
                    .distinct()
                    .limit(6)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private List<Paper> loadPapers(List<Long> paperIds) {
        if (paperIds == null || paperIds.isEmpty()) {
            return new ArrayList<>();
        }
        return paperRepository.findAllById(paperIds);
    }

    private String buildPaperContext(List<Paper> papers) {
        if (papers == null || papers.isEmpty()) {
            return "No paper context provided.";
        }

        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < papers.size(); i++) {
            Paper p = papers.get(i);

            sb.append("Paper ").append(i + 1).append(":\n");
            sb.append("Title: ").append(nullSafe(p.getTitle())).append("\n");
            sb.append("Authors: ").append(nullSafe(p.getAuthors())).append("\n");
            sb.append("Year: ").append(p.getPublicationYear() != null ? p.getPublicationYear() : "N/A").append("\n");
            sb.append("Source: ").append(nullSafe(p.getSource())).append("\n");
            sb.append("Journal: ").append(nullSafe(p.getJournal())).append("\n");
            sb.append("Keywords: ").append(nullSafe(p.getKeywords())).append("\n");
            sb.append("Abstract: ").append(nullSafe(p.getAbstractText())).append("\n");
            sb.append("--------------------------------------------------\n");
        }

        return sb.toString();
    }

    private String callOpenRouter(String systemPrompt, String userPrompt) {
        String url = "https://openrouter.ai/api/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openRouterApiKey);
        headers.add("HTTP-Referer", "http://localhost:5173");
        headers.add("X-Title", "ShunyaAI Research Platform");

        JSONObject requestBody = new JSONObject();
        requestBody.put("model", model);

        JSONArray messages = new JSONArray();

        JSONObject systemMsg = new JSONObject();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);

        JSONObject userMsg = new JSONObject();
        userMsg.put("role", "user");
        userMsg.put("content", userPrompt);

        messages.put(systemMsg);
        messages.put(userMsg);

        requestBody.put("messages", messages);

        HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                String.class
        );

        JSONObject json = new JSONObject(response.getBody());
        JSONArray choices = json.getJSONArray("choices");

        if (choices.isEmpty()) {
            return "No response received from AI.";
        }

        return choices.getJSONObject(0)
                .getJSONObject("message")
                .getString("content")
                .trim();
    }

    private String nullSafe(String value) {
        return value == null ? "N/A" : value;
    }
}