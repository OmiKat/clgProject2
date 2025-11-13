package com.omi.ClgProject.Domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RawPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String redditId;
    private String subreddit;
    private String title;
    @Column(columnDefinition = "TEXT")
    private String body;
    private Instant fetchedAt;



}
