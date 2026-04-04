package com.shunyaai.backend.service;

import com.shunyaai.backend.entity.ResearchPaper;
import com.shunyaai.backend.repository.ResearchPaperRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResearchPaperService {

    private final ResearchPaperRepository repository;

    public ResearchPaperService(ResearchPaperRepository repository) {
        this.repository = repository;
    }

    public ResearchPaper createPaper(ResearchPaper paper) {
        return repository.save(paper);
    }

    public List<ResearchPaper> getAllPapers() {
        return repository.findAll();
    }

    public ResearchPaper getPaperById(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new RuntimeException("Paper not found"));
    }

    public List<ResearchPaper> getByDomain(String domain) {
        return repository.findByDomain(domain);
    }
}
