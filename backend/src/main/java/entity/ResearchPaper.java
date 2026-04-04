package com.shunyaai.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "research_papers")
public class ResearchPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String abstractText;

    private String domain;

    private String source;

    private String authors;

    private int citations;

    private LocalDateTime createdAt;

    public ResearchPaper() {}

    public ResearchPaper(String title, String abstractText, String domain,
                         String source, String authors, int citations) {
        this.title = title;
        this.abstractText = abstractText;
        this.domain = domain;
        this.source = source;
        this.authors = authors;
        this.citations = citations;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters below
}
