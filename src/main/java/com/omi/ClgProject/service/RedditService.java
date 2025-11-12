package com.omi.ClgProject.service;

import com.omi.ClgProject.Domain.GeneratedPost;
import com.omi.ClgProject.Domain.RawPost;
import com.omi.ClgProject.Repo.GeneratedPostRepo;
import com.omi.ClgProject.Repo.RawPostRepo;
import lombok.RequiredArgsConstructor;
import net.dean.jraw.RedditClient;
import net.dean.jraw.models.Submission;
import net.dean.jraw.models.SubredditSort;
import net.dean.jraw.pagination.DefaultPaginator;
import net.dean.jraw.references.SubredditReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RedditService {

    private final RedditClient redditClient;
    private final AIService aiService;
    private final RawPostRepo rawRepo;
    private final GeneratedPostRepo genRepo;

    @Transactional
    public List<UUID> fetchSummarizeAndStore(String subreddit, int limit, boolean publish) {
        SubredditReference ref = redditClient.subreddit(subreddit);
        DefaultPaginator<Submission> paginator = ref.posts()
                .sorting(SubredditSort.HOT)
                .limit(Math.max(1, Math.min(limit, 50)))
                .build();

        List<Submission> submissions = paginator.next();
        List<UUID> generatedIds = new ArrayList<>();

        for (Submission s : submissions) {
            String body = s.getSelfText() == null ? "" : s.getSelfText();

            //! 1) save raw
            RawPost raw = new RawPost(null, s.getId(), subreddit, s.getTitle(), body , Instant.now());
            raw = rawRepo.save(raw);

            //! 2) summarize
            String article = aiService.summarize(s.getTitle(), body);

            //! 3) save generated
            GeneratedPost gp = new GeneratedPost(null, s.getTitle(), article, Instant.now());
            gp = genRepo.save(gp);

            generatedIds.add(gp.getId());
        }
        return generatedIds;
    }
}

