package com.omi.ClgProject;

import com.omi.ClgProject.Domain.GeneratedPost;
import com.omi.ClgProject.Repo.GeneratedPostRepo;
import com.omi.ClgProject.service.RedditService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class Controller {
    private final GeneratedPostRepo repository;
    private final RedditService redditService;


    @GetMapping
    public List<GeneratedPost> all() {
        return repository.findAll();
    }

    @PostMapping("/fetch")
    public List<UUID> fetch(@RequestParam String subreddit,
                            @RequestParam(defaultValue = "5") int limit,
                            @RequestParam(defaultValue = "false") boolean publish) {
        return redditService.fetchSummarizeAndStore(subreddit, limit, publish);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GeneratedPost> one(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


}
