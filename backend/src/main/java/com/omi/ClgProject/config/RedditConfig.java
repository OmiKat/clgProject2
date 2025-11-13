package com.omi.ClgProject.config;

import lombok.RequiredArgsConstructor;
import net.dean.jraw.RedditClient;
import net.dean.jraw.http.NetworkAdapter;
import net.dean.jraw.http.OkHttpNetworkAdapter;
import net.dean.jraw.http.UserAgent;
import net.dean.jraw.oauth.Credentials;
import net.dean.jraw.oauth.OAuthHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RedditConfig {


    @Value("${reddit.client-id}")
    private String clientId;

    @Value("${reddit.client-secret}")
    private String clientSecret;

    @Value("${reddit.username}")
    private String username;

    @Value("${reddit.password}")
    private String password;


    @Bean
    public RedditClient redditClient(){
        try {
            UserAgent userAgent = new UserAgent(
                    "script",
                    "com.omi.ClgProject",
                    "1.0",
                    "MiyabiSimp69"
            );
            Credentials credentials = Credentials.script(
                    username,
                    password,
                    clientId,
                    clientSecret
            );
            NetworkAdapter networkAdapter = new OkHttpNetworkAdapter(userAgent);
            return OAuthHelper.automatic(networkAdapter,credentials);
        }
        catch (Exception e) {
            throw new IllegalStateException("reddit auth failed , check credentials ");
        }
    }

}
