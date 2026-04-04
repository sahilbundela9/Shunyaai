package com.shunyaai.backend.repository;

import com.shunyaai.backend.entity.Paper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PaperRepository extends JpaRepository<Paper, Long> {

    // Basic search (title + abstract)
    @Query("SELECT p FROM Paper p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.abstractText) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Paper> search(String query);

    long countByPublicationYear(Integer year);

    boolean existsByDoi(String doi);
}