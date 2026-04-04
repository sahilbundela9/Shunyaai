package com.shunyaai.backend.repository;

import com.shunyaai.backend.entity.ResearchPaper;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResearchPaperRepository extends JpaRepository<ResearchPaper, Long> {

    List<ResearchPaper> findByDomain(String domain);
}
