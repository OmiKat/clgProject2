'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getBlogById, deleteBlog, GeneratedPost } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, AlertCircle, MoreVertical, Trash2, Loader2, Linkedin, Check } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [blog, setBlog] = useState<GeneratedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  useEffect(() => {
    async function fetchBlog() {
      try {
        setLoading(true);
        setError(null);
        const data = await getBlogById(id);
        setBlog(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load blog post'
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchBlog();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="mb-8">
            <Skeleton className="h-10 w-32" />
          </div>
          <Card className="mx-auto max-w-4xl">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <Link href="/">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  const formattedDate = formatDistanceToNow(new Date(blog.createdAt), {
    addSuffix: true,
  });

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);
      setShowDeleteDialog(false);
      await deleteBlog(id);
      // Navigate back to home after successful deletion
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete blog post'
      );
      setDeleting(false);
    }
  };

  const handleLinkedInShare = async () => {
    if (!blog) return;

    try {
      // Get the current page URL
      const blogUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/blogs/${id}`
        : '';

      // Prepare the blog content for LinkedIn
      // Remove markdown formatting for plain text
      const plainTextContent = blog.content
        .replace(/#{1,6}\s+/g, '') // Remove markdown headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
        .replace(/`([^`]+)`/g, '$1') // Remove inline code
        .trim();

      // Create share text with prominent title heading and content
      // Format: Title as heading, then content, then link
      // LinkedIn posts work well with this format
      const contentPreview = plainTextContent.substring(0, 1800); // Leave room for title and link
      const shareText = `${blog.title}\n\n${contentPreview}${plainTextContent.length > 1800 ? '...' : ''}\n\n${blogUrl}`;

      // Copy content to clipboard
      await navigator.clipboard.writeText(shareText);
      setCopiedToClipboard(true);
      
      // Reset the copied state after 3 seconds
      setTimeout(() => setCopiedToClipboard(false), 3000);

      // Open LinkedIn share dialog
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`;
      window.open(linkedInUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
    } catch (err) {
      console.error('Failed to share on LinkedIn:', err);
      setError('Failed to prepare LinkedIn share. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        {/* Back Button */}
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-8 transition-colors hover:bg-accent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Error Message */}
        {error && (
          <div className="mx-auto mb-8 max-w-4xl">
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message for LinkedIn Share */}
        {copiedToClipboard && (
          <div className="mx-auto mb-8 max-w-4xl">
            <div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-green-500">
              <Check className="h-5 w-5" />
              <p className="text-sm font-medium">
                Blog content copied to clipboard! Paste it into the LinkedIn post dialog.
              </p>
            </div>
          </div>
        )}

        {/* Blog Content */}
        <Card className="mx-auto max-w-4xl border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold leading-tight md:text-4xl">
                  {blog.title}
                </CardTitle>
                <p className="mt-4 text-sm text-muted-foreground">
                  Generated {formattedDate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLinkedInShare}
                  className="h-9 w-9 shrink-0 transition-colors hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5]"
                  title="Share on LinkedIn"
                >
                  {copiedToClipboard ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Linkedin className="h-4 w-4" />
                  )}
                  <span className="sr-only">Share on LinkedIn</span>
                </Button>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    disabled={deleting}
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowDeleteDialog(true);
                    }}
                    disabled={deleting}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-lg max-w-none dark:prose-invert markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="mb-4 mt-6 text-3xl font-bold text-foreground first:mt-0" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="mb-3 mt-5 text-2xl font-semibold text-foreground" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="mb-2 mt-4 text-xl font-semibold text-foreground" {...props} />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4 className="mb-2 mt-3 text-lg font-semibold text-foreground" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-4 leading-7 text-foreground" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="mb-4 ml-6 list-disc space-y-2 text-foreground" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="mb-4 ml-6 list-decimal space-y-2 text-foreground" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="leading-7 text-foreground" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="my-4 border-l-4 border-primary/50 pl-4 italic text-muted-foreground"
                      {...props}
                    />
                  ),
                  code: ({ node, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !className?.includes('language-');
                    return isInline ? (
                      <code
                        className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ node, children, ...props }: any) => (
                    <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4" {...props}>
                      {children}
                    </pre>
                  ),
                  a: ({ node, ...props }) => (
                    <a
                      className="text-primary underline-offset-4 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-foreground" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic text-foreground" {...props} />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr className="my-6 border-border" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="my-4 overflow-x-auto">
                      <table className="w-full border-collapse border border-border" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-muted" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-border px-4 py-2 text-foreground" {...props} />
                  ),
                }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                Delete Blog Post?
              </DialogTitle>
              <DialogDescription className="pt-4">
                Are you sure you want to delete <strong>&quot;{blog.title}&quot;</strong>? This action cannot be undone and the blog post will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

