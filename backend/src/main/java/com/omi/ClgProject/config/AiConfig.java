package com.omi.ClgProject.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Value("&{spring.ai.openai.api-key}")
    private String apikey;

    @Value("${spring.ai.openai.base-url}")
    private String baseUrl;

    @Value("${spring.ai.openai.chat.options.model}")
    private String modelName;

//    @Bean
//    public ChatClient chatClient(){
//        OpenAiChatOptions options = OpenAiChatOptions
//                .builder()
//                .model(modelName)
//                .build();
//
//        return ChatClient.builder;
    }


