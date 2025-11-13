package com.omi.ClgProject.Domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.Instant;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class GeneratedPost {


    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String title;
    @Column(columnDefinition = "TEXT")
    private String content;
    private Instant createdAt;
}

