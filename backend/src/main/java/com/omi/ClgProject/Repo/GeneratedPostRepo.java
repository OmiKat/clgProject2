package com.omi.ClgProject.Repo;

import com.omi.ClgProject.Domain.GeneratedPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GeneratedPostRepo extends JpaRepository<GeneratedPost, UUID> {

}
