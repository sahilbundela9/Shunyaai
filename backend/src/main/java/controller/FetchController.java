package com.shunyaai.backend.controller;

import com.shunyaai.backend.service.ArxivFetchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/fetch")
public class FetchController {

    private final ArxivFetchService arxivFetchService;

    public FetchController(ArxivFetchService arxivFetchService) {
        this.arxivFetchService = arxivFetchService;
    }

    @GetMapping("/arxiv")
    public Map<String, Object> fetchArxiv(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int maxResults
    ) {
        return arxivFetchService.fetchFromArxiv(query, maxResults);
    }

    @GetMapping("/test")
    public String test() {
        System.out.println("FETCH CONTROLLER HIT");
        return "OK";
    }
}