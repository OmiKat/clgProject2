'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GeneratedPost } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface BlogCardProps {
  blog: GeneratedPost;
}

export function BlogCard({ blog }: BlogCardProps) {
  const formattedDate = formatDistanceToNow(new Date(blog.createdAt), {
    addSuffix: true,
  });

  return (
    <Link href={`/blogs/${blog.id}`} className="block">
      <Card className="group cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold leading-tight transition-colors group-hover:text-primary">
            {blog.title}
          </CardTitle>
          <p className="mt-2 text-xs text-muted-foreground">{formattedDate}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
            {blog.content}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function BlogCardSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="mt-2 h-3 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}

