package com.omi.ClgProject.service;

import com.omi.ClgProject.Domain.RawPost;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;

@Service
public class AIService {

    private final ChatClient chatClient;

    public AIService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String summarize(String title, String body) {
        String prompt = """
You are an expert blog writer skilled at transforming informal Reddit discussions into polished, engaging blog articles.

Rewrite the following Reddit post into a full blog-style article that:
- Has a clear title, introduction, body, and conclusion.
- Keeps facts accurate but removes Reddit formatting and noise.
- Flows naturally and reads like a human-written blog post.
- Uses smooth transitions, conversational tone, and clear paragraphs.
- Adds brief context where needed so a general reader can understand without seeing the Reddit post.
- If relevant, mention community takeaways or insights.
- Keep the length between 400–600 words.

Reddit Post Title: %s
Reddit Post Content:
%s

Now produce the final blog article in plain text — no markdown, no lists, just a well-written narrative.
""".formatted(title, body == null ? "" : body);


        System.out.println(prompt);

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }
}
