package com.shunyaai.backend.service;

import com.shunyaai.backend.entity.Paper;
import com.shunyaai.backend.entity.ResearchProject;
import com.shunyaai.backend.entity.User;
import com.shunyaai.backend.repository.PaperRepository;
import com.shunyaai.backend.repository.ResearchProjectRepository;
import com.shunyaai.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ResearchProjectService {

    private final ResearchProjectRepository researchProjectRepository;
    private final UserRepository userRepository;
    private final PaperRepository paperRepository;

    public ResearchProjectService(
            ResearchProjectRepository researchProjectRepository,
            UserRepository userRepository,
            PaperRepository paperRepository
    ) {
        this.researchProjectRepository = researchProjectRepository;
        this.userRepository = userRepository;
        this.paperRepository = paperRepository;
    }

    // =============================
    // GET ALL PROJECTS FOR USER
    // =============================
    public List<ResearchProject> getProjectsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return researchProjectRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // =============================
    // CREATE PROJECT
    // =============================
    public ResearchProject createProject(String email, String name, String description) {
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Project name is required");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (researchProjectRepository.existsByNameIgnoreCaseAndUser(name.trim(), user)) {
            throw new RuntimeException("Project already exists with this name");
        }

        ResearchProject project = new ResearchProject();
        project.setName(name.trim());
        project.setDescription(description != null ? description.trim() : "");
        project.setUser(user);

        return researchProjectRepository.save(project);
    }

    // =============================
    // SAVE PAPER TO PROJECT
    // =============================
    public String savePaperToProject(String email, Long projectId, Long paperId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ResearchProject project = researchProjectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));

        // Also keep it in global saved papers
        user.getSavedPapers().add(paper);
        userRepository.save(user);

        if (project.getPapers().contains(paper)) {
            return "Paper already exists in this project";
        }

        project.getPapers().add(paper);
        researchProjectRepository.save(project);

        return "Paper saved to project successfully";
    }

    // =============================
    // REMOVE PAPER FROM PROJECT
    // =============================
    public String removePaperFromProject(String email, Long projectId, Long paperId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ResearchProject project = researchProjectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));

        project.getPapers().remove(paper);
        researchProjectRepository.save(project);

        return "Paper removed from project successfully";
    }

    // =============================
    // DELETE PROJECT
    // =============================
    public String deleteProject(String email, Long projectId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ResearchProject project = researchProjectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        researchProjectRepository.delete(project);

        return "Project deleted successfully";
    }

    // =============================
    // GET SINGLE PROJECT
    // =============================
    public ResearchProject getProjectById(String email, Long projectId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return researchProjectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }
}