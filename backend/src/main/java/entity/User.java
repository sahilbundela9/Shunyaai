package com.shunyaai.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    // =============================
    // SAVED PAPERS RELATION
    // =============================
    @ManyToMany
    @JoinTable(
            name = "saved_papers",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "paper_id")
    )
    private Set<Paper> savedPapers = new HashSet<>();

    // =============================
    // USER PROJECTS RELATION
    // =============================
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ResearchProject> projects = new HashSet<>();

    public User() {}

    public User(String name, String email, String password, Role role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public Long getId() { return id; }

    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public Role getRole() { return role; }
    public Set<Paper> getSavedPapers() { return savedPapers; }
    public Set<ResearchProject> getProjects() { return projects; }

    public void setId(Long id) { this.id = id; }

    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(Role role) { this.role = role; }
    public void setSavedPapers(Set<Paper> savedPapers) { this.savedPapers = savedPapers; }
    public void setProjects(Set<ResearchProject> projects) { this.projects = projects; }
}