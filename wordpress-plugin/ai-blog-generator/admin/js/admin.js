(function($) {
    'use strict';
    
    $(document).ready(function() {
        
        // Fetch Posts Handler
        $('#fetch-posts').on('click', function() {
            const $button = $(this);
            const $status = $('#fetch-status');
            const subreddit = $('#subreddit').val().trim();
            const limit = parseInt($('#limit').val()) || 5;
            const publish = $('#publish').is(':checked');
            
            if (!subreddit) {
                $status.removeClass('success error').addClass('error').html('Please enter a subreddit name.').show();
                return;
            }
            
            // Disable button and show loading
            $button.prop('disabled', true).text('Fetching and generating posts...');
            $status.removeClass('success error').addClass('loading').html('<span class="spinner is-active"></span> Fetching posts from Reddit and generating articles. This may take a few minutes...').show();
            
            $.ajax({
                url: aibgData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'aibg_fetch_posts',
                    nonce: aibgData.nonce,
                    subreddit: subreddit,
                    limit: limit,
                    publish: publish ? '1' : '0'
                },
                timeout: 300000, // 5 minutes
                success: function(response) {
                    if (response.success) {
                        $status.removeClass('loading error').addClass('success').html(
                            '<strong>Success!</strong> ' + response.data.message + 
                            '<br><a href="#" id="refresh-posts-now">Refresh posts list</a>'
                        ).show();
                        
                        // Auto-refresh posts list
                        loadPosts();
                        
                        // Clear form
                        $('#subreddit').val('');
                    } else {
                        $status.removeClass('loading success').addClass('error').html(
                            '<strong>Error:</strong> ' + (response.data.message || 'Unknown error occurred')
                        ).show();
                    }
                },
                error: function(xhr, status, error) {
                    let errorMsg = 'An error occurred while fetching posts.';
                    if (status === 'timeout') {
                        errorMsg = 'Request timed out. The backend may still be processing. Please check the posts list.';
                    } else if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
                        errorMsg = xhr.responseJSON.data.message;
                    }
                    $status.removeClass('loading success').addClass('error').html('<strong>Error:</strong> ' + errorMsg).show();
                },
                complete: function() {
                    $button.prop('disabled', false).text('Fetch & Generate Posts');
                }
            });
        });
        
        // Refresh Posts List
        function loadPosts() {
            const $list = $('#posts-list');
            $list.html('<p class="aibg-loading">Loading posts...</p>');
            
            $.ajax({
                url: aibgData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'aibg_get_posts',
                    nonce: aibgData.nonce
                },
                success: function(response) {
                    if (response.success && response.data.posts) {
                        renderPostsList(response.data.posts);
                    } else {
                        $list.html('<p class="aibg-error">Failed to load posts: ' + (response.data.message || 'Unknown error') + '</p>');
                    }
                },
                error: function() {
                    $list.html('<p class="aibg-error">An error occurred while loading posts.</p>');
                }
            });
        }
        
        // Render Posts List
        function renderPostsList(posts) {
            const $list = $('#posts-list');
            
            if (!posts || posts.length === 0) {
                $list.html('<p>No generated posts found. Fetch some posts to get started!</p>');
                return;
            }
            
            let html = '<table class="wp-list-table widefat fixed striped">';
            html += '<thead><tr>';
            html += '<th>Title</th>';
            html += '<th>Created</th>';
            html += '<th>Status</th>';
            html += '<th>Actions</th>';
            html += '</tr></thead>';
            html += '<tbody>';
            
            posts.forEach(function(post) {
                const createdDate = post.createdAt ? new Date(post.createdAt).toLocaleString() : 'N/A';
                const isPublished = post.is_published || false;
                
                html += '<tr>';
                html += '<td><strong>' + escapeHtml(post.title || 'Untitled') + '</strong></td>';
                html += '<td>' + escapeHtml(createdDate) + '</td>';
                html += '<td>' + (isPublished ? '<span class="aibg-badge published">Published</span>' : '<span class="aibg-badge draft">Not Published</span>') + '</td>';
                html += '<td>';
                html += '<button class="button button-small view-post" data-post-id="' + escapeHtml(post.id) + '">View</button> ';
                if (!isPublished) {
                    html += '<button class="button button-small button-primary publish-post" data-post-id="' + escapeHtml(post.id) + '">Publish</button>';
                } else {
                    html += '<span class="aibg-published-link">Already Published</span>';
                }
                html += '</td>';
                html += '</tr>';
            });
            
            html += '</tbody></table>';
            $list.html(html);
            
            // Attach event handlers
            $('.view-post').on('click', function() {
                const postId = $(this).data('post-id');
                viewPost(postId);
            });
            
            $('.publish-post').on('click', function() {
                const $button = $(this);
                const postId = $button.data('post-id');
                publishPost(postId, $button);
            });
        }
        
        // View Post
        function viewPost(postId) {
            $.ajax({
                url: aibgData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'aibg_get_post',
                    nonce: aibgData.nonce,
                    post_id: postId
                },
                success: function(response) {
                    if (response.success && response.data.post) {
                        const post = response.data.post;
                        showPostModal(post);
                    } else {
                        alert('Failed to load post: ' + (response.data.message || 'Unknown error'));
                    }
                },
                error: function() {
                    alert('An error occurred while loading the post.');
                }
            });
        }
        
        // Show Post Modal
        function showPostModal(post) {
            const modal = $('<div class="aibg-modal-overlay">' +
                '<div class="aibg-modal">' +
                '<div class="aibg-modal-header">' +
                '<h2>' + escapeHtml(post.title || 'Untitled') + '</h2>' +
                '<button class="aibg-modal-close">&times;</button>' +
                '</div>' +
                '<div class="aibg-modal-content">' +
                '<div class="aibg-post-content">' + nl2br(escapeHtml(post.content || '')) + '</div>' +
                '</div>' +
                '<div class="aibg-modal-footer">' +
                '<button class="button aibg-modal-close">Close</button>' +
                '</div>' +
                '</div>' +
                '</div>');
            
            $('body').append(modal);
            
            modal.find('.aibg-modal-close').on('click', function() {
                modal.remove();
            });
            
            modal.on('click', function(e) {
                if ($(e.target).hasClass('aibg-modal-overlay')) {
                    modal.remove();
                }
            });
        }
        
        // Publish Post
        function publishPost(postId, $button) {
            if (!confirm('Are you sure you want to publish this post to WordPress?')) {
                return;
            }
            
            const originalText = $button.text();
            $button.prop('disabled', true).text('Publishing...');
            
            $.ajax({
                url: aibgData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'aibg_publish_post',
                    nonce: aibgData.nonce,
                    post_id: postId
                },
                success: function(response) {
                    if (response.success) {
                        $button.closest('tr').find('.aibg-badge').removeClass('draft').addClass('published').text('Published');
                        $button.replaceWith('<span class="aibg-published-link">Already Published</span>');
                        alert('Post published successfully!');
                    } else {
                        alert('Failed to publish post: ' + (response.data.message || 'Unknown error'));
                        $button.prop('disabled', false).text(originalText);
                    }
                },
                error: function() {
                    alert('An error occurred while publishing the post.');
                    $button.prop('disabled', false).text(originalText);
                }
            });
        }
        
        // Test Connection
        $('#test-connection').on('click', function() {
            const $button = $(this);
            const $status = $('#connection-status');
            
            $button.prop('disabled', true).text('Testing...');
            $status.removeClass('success error').addClass('loading').html('<span class="spinner is-active"></span> Testing connection...').show();
            
            $.ajax({
                url: aibgData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'aibg_test_connection',
                    nonce: aibgData.nonce
                },
                success: function(response) {
                    if (response.success) {
                        $status.removeClass('loading error').addClass('success').html('<strong>Success!</strong> ' + response.data.message).show();
                    } else {
                        $status.removeClass('loading success').addClass('error').html('<strong>Error:</strong> ' + (response.data.message || 'Unknown error')).show();
                    }
                },
                error: function() {
                    $status.removeClass('loading success').addClass('error').html('<strong>Error:</strong> Failed to connect to backend. Please check the URL and ensure the backend is running.').show();
                },
                complete: function() {
                    $button.prop('disabled', false).text('Test Backend Connection');
                }
            });
        });
        
        // Refresh posts on page load
        if ($('#posts-list').length) {
            loadPosts();
        }
        
        // Manual refresh button
        $('#refresh-posts, #refresh-posts-now').on('click', function(e) {
            e.preventDefault();
            loadPosts();
        });
        
        // Utility functions
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
        }
        
        function nl2br(str) {
            return String(str).replace(/\n/g, '<br>');
        }
    });
    
})(jQuery);

