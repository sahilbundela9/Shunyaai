package com.shunyaai.backend.service;

import com.shunyaai.backend.entity.Paper;
import com.shunyaai.backend.repository.PaperRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class DraftService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    private final PaperRepository paperRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public DraftService(PaperRepository paperRepository) {
        this.paperRepository = paperRepository;
    }

    public String generateDraft(List<Long> paperIds) {
        List<Paper> papers = paperRepository.findAllById(paperIds);

        StringBuilder context = new StringBuilder();

        for (Paper p : papers) {
            context.append("Title: ").append(p.getTitle()).append("\n");
            context.append("Abstract: ").append(p.getAbstractText()).append("\n\n");
        }

        String systemPrompt = """
You are a research assistant.

Generate a structured research draft based on given papers.

Rules:
- DO NOT create fake research
- Only synthesize information
- Keep it academic
- Provide structured sections

Sections:
1. Title
2. Introduction
3. Literature Review
4. Research Gaps
5. Proposed Approach
6. Methodology
7. Expected Outcomes
8. Future Work
""";

        String userPrompt = "Papers:\n" + context;

        return callAI(systemPrompt, userPrompt);
    }

    private String callAI(String system, String user) {
        String url = "https://openrouter.ai/api/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        JSONObject body = new JSONObject();
        body.put("model", "openai/gpt-3.5-turbo");

        JSONArray messages = new JSONArray();

        messages.put(new JSONObject().put("role", "system").put("content", system));
        messages.put(new JSONObject().put("role", "user").put("content", user));

        body.put("messages", messages);

        HttpEntity<String> request = new HttpEntity<>(body.toString(), headers);

        ResponseEntity<String> response =
                restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        JSONObject json = new JSONObject(response.getBody());

        return json.getJSONArray("choices")
                .getJSONObject(0)
                .getJSONObject("message")
                .getString("content");
    }
}