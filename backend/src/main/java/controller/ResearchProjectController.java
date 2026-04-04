package com.shunyaai.backend.controller;

import com.shunyaai.backend.entity.ResearchProject;
import com.shunyaai.backend.service.ResearchProjectService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/projects", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ResearchProjectController {

    private final ResearchProjectService researchProjectService;

    public ResearchProjectController(ResearchProjectService researchProjectService) {
        this.researchProjectService = researchProjectService;
    }

    // =============================
    // GET ALL PROJECTS
    // =============================
    @GetMapping
    public ResponseEntity<?> getProjects(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Login required"));
        }

        List<ResearchProject> projects = researchProjectService.getProjectsForUser(principal.getName());
        return ResponseEntity.ok(projects);
    }

    // =============================
    // GET SINGLE PROJECT
    // =============================
    @GetMapping("/{projectId}")
    public ResponseEntity<?> getProjectById(@PathVariable Long projectId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Login required"));
        }

        return ResponseEntity.ok(
                researchProjectService.getProjectById(principal.getName(), projectId)
        );
    }

    // =============================
    // CREATE PROJECT
    // =============================
    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Map<String, String> body, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Login required"));
        }

        String name = body.get("name");
        String description = body.getOrDefault("description", "");

        ResearchProject project = researchProjectService.createProject(
                principal.getName(),
                name,
                description
        );

        return ResponseEntity.ok(project);
    }

    // =============================
    // SAVE PAPER TO PROJECT
    // =============================
    @PostMapping("/{projectId}/papers/{paperId}")
    public ResponseEntity<?> savePaperToProject(
            @PathVariable Long projectId,
            @PathVariable Long paperId,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Login required"));
        }

        String message = researchProjectService.savePaperToProject(
                principal.getName(),
                projectId,
                paperId
        );

        return ResponseEntity.ok(Map.of("message", message));
    }

    // =============================
    // REMOVE PAPER FROM PROJECT
    // =============================
    @DeleteMapping("/{projectId}/papers/{paperId}")
    public ResponseEntity<?> removePaperFromProject(
            @PathVariable Long projectId,
            @PathVariable Long paperId,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Login required"));
        }

        String message = researchProjectService.removePaperFromProject(
                principal.getName(),
                projectId,
                paperId
        );

        return ResponseEntity.ok(Map.of("message", message));
    }

    // =============================
    // DELETE PROJECT
    // =============================
    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(@PathVariable Long projectId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Login required"));
        }

        String message = researchProjectService.deleteProject(principal.getName(), projectId);
        return ResponseEntity.ok(Map.of("message", message));
    }
}