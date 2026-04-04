package com.shunyaai.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "papers")
public class Paper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 10000)
    private String abstractText;

    @Column(length = 2000)
    private String authors;

    private String journal;

    private Integer publicationYear;

    private Integer citationCount;

    private String doi;

    private String url;

    private String source; // arxiv, crossref etc

    @Column(length = 2000)
    private String keywords;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // =============================
    // 🔥 SAVED BY USERS RELATION
    // =============================
    @JsonIgnore
    @ManyToMany(mappedBy = "savedPapers")
    private Set<User> savedByUsers = new HashSet<>();

    // =============================
    // Lifecycle Hooks
    // =============================
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // =============================
    // Getters & Setters
    // =============================

    public Long getId() { return id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractText() { return abstractText; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }

    public String getAuthors() { return authors; }
    public void setAuthors(String authors) { this.authors = authors; }

    public String getJournal() { return journal; }
    public void setJournal(String journal) { this.journal = journal; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

    public Integer getCitationCount() { return citationCount; }
    public void setCitationCount(Integer citationCount) { this.citationCount = citationCount; }

    public String getDoi() { return doi; }
    public void setDoi(String doi) { this.doi = doi; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public Set<User> getSavedByUsers() { return savedByUsers; }
    public void setSavedByUsers(Set<User> savedByUsers) { this.savedByUsers = savedByUsers; }
}