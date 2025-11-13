const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export interface GeneratedPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

/**
 * Fetches and generates blog posts from a subreddit
 * @param subreddit - Name of the subreddit
 * @param limit - Number of posts to fetch (1-50)
 * @returns Array of generated post IDs
 */
export async function fetchBlogs(
  subreddit: string,
  limit: number
): Promise<string[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/blogs/fetch?subreddit=${encodeURIComponent(subreddit)}&limit=${limit}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch blogs: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches a single blog post by ID
 * @param id - UUID of the blog post
 * @returns Generated post data
 */
export async function getBlogById(id: string): Promise<GeneratedPost> {
  const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blog: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches multiple blog posts by their IDs
 * @param ids - Array of UUIDs
 * @returns Array of generated posts
 */
export async function getBlogsByIds(ids: string[]): Promise<GeneratedPost[]> {
  const promises = ids.map((id) => getBlogById(id));
  return Promise.all(promises);
}

/**
 * Fetches all blog posts
 * @returns Array of all generated posts
 */
export async function getAllBlogs(): Promise<GeneratedPost[]> {
  const response = await fetch(`${API_BASE_URL}/api/blogs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch all blogs: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Deletes a blog post by ID
 * @param id - UUID of the blog post to delete
 */
export async function deleteBlog(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete blog: ${response.statusText}`);
  }
}

