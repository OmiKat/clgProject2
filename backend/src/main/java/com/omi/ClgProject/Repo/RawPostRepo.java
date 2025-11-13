package com.omi.ClgProject.Repo;

import com.omi.ClgProject.Domain.RawPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RawPostRepo extends JpaRepository<RawPost, UUID> {

//    Optional<RedditPost> findByRedditId(String redditId);

}
