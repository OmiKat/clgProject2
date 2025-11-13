'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BlogCard, BlogCardSkeleton } from '@/components/BlogCard';
import { fetchBlogs, getBlogsByIds, getAllBlogs, GeneratedPost } from '@/lib/api';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [subreddit, setSubreddit] = useState('');
  const [postCount, setPostCount] = useState('5');
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [allBlogs, setAllBlogs] = useState<GeneratedPost[]>([]);
  const [newBlogIds, setNewBlogIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Load all blogs on mount
  useEffect(() => {
    async function loadAllBlogs() {
      try {
        setLoadingAll(true);
        const blogs = await getAllBlogs();
        // Sort by creation date, newest first
        blogs.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAllBlogs(blogs);
      } catch (err) {
        console.error('Failed to load blogs:', err);
      } finally {
        setLoadingAll(false);
      }
    }
    loadAllBlogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const limit = parseInt(postCount, 10);
      if (isNaN(limit) || limit < 1 || limit > 50) {
        throw new Error('Post count must be between 1 and 50');
      }

      if (!subreddit.trim()) {
        throw new Error('Please enter a subreddit name');
      }

      // Step 1: Fetch and generate blog posts
      const ids = await fetchBlogs(subreddit.trim(), limit);

      if (ids.length === 0) {
        throw new Error('No posts were generated');
      }

      // Step 2: Fetch all blog posts by their IDs
      const fetchedBlogs = await getBlogsByIds(ids);
      
      // Mark these as new blogs
      const newIds = new Set(ids);
      setNewBlogIds(newIds);
      
      // Prepend new blogs to the existing list
      // Filter out any duplicates (in case a blog was already in the list)
      const existingIds = new Set(allBlogs.map(b => b.id));
      const uniqueNewBlogs = fetchedBlogs.filter(b => !existingIds.has(b.id));
      
      setAllBlogs([...uniqueNewBlogs, ...allBlogs]);
      
      // Clear form
      setSubreddit('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              AI Blog Generator
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            Transform Reddit discussions into AI-powered blog articles
          </p>
        </div>

        {/* Form */}
        <div className="mx-auto mb-16 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="subreddit"
                  className="text-sm font-medium text-foreground"
                >
                  Subreddit Name
                </label>
                <Input
                  id="subreddit"
                  type="text"
                  placeholder="e.g., technology, programming"
                  value={subreddit}
                  onChange={(e) => setSubreddit(e.target.value)}
                  disabled={loading}
                  className="h-11 bg-input/50 border-border/50 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="postCount"
                  className="text-sm font-medium text-foreground"
                >
                  Number of Posts
                </label>
                <Input
                  id="postCount"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="1-50"
                  value={postCount}
                  onChange={(e) => setPostCount(e.target.value)}
                  disabled={loading}
                  className="h-11 bg-input/50 border-border/50 focus:border-primary/50"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-medium shadow-lg transition-all hover:shadow-xl"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Blogs
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-auto mb-8 max-w-2xl">
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State for New Blogs */}
        {loading && (
          <div className="mx-auto mb-12 max-w-6xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Generating New Blogs...</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: parseInt(postCount) || 3 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Newly Generated Blogs Section */}
        {!loading && newBlogIds.size > 0 && (
          <div className="mx-auto mb-12 max-w-6xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Newly Generated Blogs</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {newBlogIds.size} {newBlogIds.size === 1 ? 'blog' : 'blogs'} just generated
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allBlogs
                .filter((blog) => newBlogIds.has(blog.id))
                .map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
            </div>
          </div>
        )}

        {/* All Blogs Section */}
        {!loadingAll && allBlogs.length > 0 && (
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                All Blogs ({allBlogs.length})
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {newBlogIds.size > 0 
                  ? 'All AI-powered articles, sorted by date'
                  : 'AI-powered articles ready to read'}
              </p>
            </div>
            {loadingAll ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading State for Initial Load */}
        {loadingAll && !loading && (
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Loading Blogs...</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !loadingAll && allBlogs.length === 0 && !error && (
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-muted-foreground">
              Enter a subreddit name and number of posts to generate AI-powered
              blog articles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
