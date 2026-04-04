package com.shunyaai.backend.controller;

import com.shunyaai.backend.entity.Paper;
import com.shunyaai.backend.service.PaperService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping(value = "/api/papers", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PaperController {

    private final PaperService paperService;

    public PaperController(PaperService paperService) {
        this.paperService = paperService;
    }

    // =============================
    // GET ALL PAPERS
    // =============================
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Paper> getAll() {
        return paperService.getAllPapers();
    }

    // =============================
    // SEARCH PAPERS
    // =============================
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Paper> search(@RequestParam String query) {
        return paperService.search(query);
    }

    // =============================
    // FETCH PAPERS (MULTI-SOURCE)
    // =============================
    @GetMapping(value = "/fetch", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Paper> fetchPapers(
            @RequestParam String query,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "arxiv,crossref") String sources
    ) {
        return paperService.fetchPapers(query, limit, sources);
    }

    // =============================
    // BASIC STATS
    // =============================
    @GetMapping(value = "/stats", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> stats() {
        return paperService.getStats();
    }

    // =============================
    // DASHBOARD STATS
    // =============================
    @GetMapping(value = "/dashboard-stats", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> dashboardStats() {
        return paperService.getDashboardStats();
    }

    // =============================
    // GET SAVED PAPERS
    // =============================
    @GetMapping(value = "/saved", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getSavedPapers(Principal principal) {
        if (principal == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        String email = principal.getName();
        return ResponseEntity.ok(paperService.getSavedPapersForUser(email));
    }

    // =============================
    // CHECK IF PAPER IS SAVED
    // =============================
    @GetMapping(value = "/{id}/saved", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Boolean> isSaved(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return Map.of("saved", false);
        }

        String email = principal.getName();
        boolean saved = paperService.isPaperSaved(id, email);
        return Map.of("saved", saved);
    }

    // =============================
    // SAVE PAPER
    // =============================
    @PostMapping(value = "/save/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> savePaper(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Login required"));
        }

        String email = principal.getName();
        String message = paperService.savePaperForUser(id, email);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // =============================
    // UNSAVE PAPER
    // =============================
    @DeleteMapping(value = "/save/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> unsavePaper(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Login required"));
        }

        String email = principal.getName();
        String message = paperService.unsavePaperForUser(id, email);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // =============================
    // GAP ANALYSIS / INSIGHTS
    // =============================
    @GetMapping(value = "/saved/gap-analysis", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> getGapAnalysis(Principal principal) {
        if (principal == null) {
            return Map.of(
                    "totalSavedPapers", 0,
                    "topTopics", List.of(),
                    "researchGaps", List.of()
            );
        }

        String email = principal.getName();
        return paperService.getSavedPapersGapAnalysis(email);
    }

    // =============================
    // GET PAPER BY ID
    // =============================
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Optional<Paper> getById(@PathVariable Long id) {
        return paperService.getPaperById(id);
    }

    // =============================
    // CREATE SINGLE PAPER
    // =============================
    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Paper create(@RequestBody Paper paper) {
        return paperService.createPaper(paper);
    }

    // =============================
    // BULK INSERT PAPERS
    // =============================
    @PostMapping(value = "/bulk", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> bulkInsert(@RequestBody Map<String, List<Paper>> request) {
        List<Paper> papers = request.get("papers");

        if (papers == null || papers.isEmpty()) {
            throw new RuntimeException("No papers provided");
        }

        return paperService.saveAllPapers(papers);
    }
}