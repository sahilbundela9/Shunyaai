package com.shunyaai.backend.repository;

import com.shunyaai.backend.entity.ResearchProject;
import com.shunyaai.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResearchProjectRepository extends JpaRepository<ResearchProject, Long> {

    List<ResearchProject> findByUserOrderByCreatedAtDesc(User user);

    Optional<ResearchProject> findByIdAndUser(Long id, User user);

    boolean existsByNameIgnoreCaseAndUser(String name, User user);
}