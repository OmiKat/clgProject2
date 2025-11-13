# AI Blog Generator

An intelligent content generation platform that transforms Reddit discussions into polished, publication-ready blog articles using AI. This application automates the process of content curation and refinement, making it easy to create engaging blog content from trending Reddit discussions.

## 🎯 Business Purpose

The AI Blog Generator solves the problem of content creation by:

- **Automating Content Discovery**: Automatically fetches trending posts from any Reddit subreddit
- **AI-Powered Transformation**: Converts informal Reddit discussions into professional blog articles
- **Content Management**: Provides a centralized platform to view, manage, and share generated content
- **Time Efficiency**: Reduces hours of manual writing and editing to minutes

## 🏗️ Architecture Overview

The application follows a **full-stack architecture** with clear separation of concerns:

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │         │   External      │
│   (Next.js)     │◄───────►│  (Spring Boot)  │◄───────►│   Services      │
│                 │  REST   │                 │  API    │                 │
│  - UI/UX        │         │  - Business     │         │  - Reddit API   │
│  - State Mgmt   │         │    Logic        │         │  - AI Service   │
│  - API Client   │         │  - Data Layer   │         │    (Groq/OpenAI)│
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │   PostgreSQL    │
                            │   Database      │
                            └─────────────────┘
```

## 🔄 Core Business Workflow

### 1. Content Fetching & Generation Pipeline

```
User Input (Subreddit + Count)
        │
        ▼
┌───────────────────────┐
│  RedditService        │
│  - Fetch Reddit Posts │
│  - Sort by Hot        │
│  - Limit Results      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Data Persistence     │
│  - Save RawPost       │
│  - Store Metadata     │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  AIService            │
│  - Transform Content  │
│  - Generate Article   │
│  - Format as Markdown │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Data Persistence     │
│  - Save GeneratedPost │
│  - Return UUIDs       │
└───────────┬───────────┘
            │
            ▼
    Frontend Display
```

### 2. AI Transformation Process

The AI service (`AIService`) performs intelligent content transformation:

**Input**: Raw Reddit post (title + body text)
**Output**: Polished blog article in Markdown format

**Transformation Rules**:
- Converts informal Reddit language to professional blog tone
- Restructures content with clear introduction, body, and conclusion
- Removes Reddit-specific formatting and noise
- Adds context for general readers
- Maintains factual accuracy
- Targets 400-600 words
- Outputs in Markdown format for rich rendering

### 3. Data Model

The application maintains two primary data entities:

#### RawPost
Stores the original Reddit content for reference and audit purposes:
- `redditId`: Original Reddit post ID
- `subreddit`: Source subreddit name
- `title`: Original Reddit post title
- `body`: Original Reddit post content
- `fetchedAt`: Timestamp of when content was fetched

#### GeneratedPost
Stores the AI-generated blog article:
- `id`: Unique UUID identifier
- `title`: Blog article title (derived from Reddit post)
- `content`: AI-generated blog content (Markdown format)
- `createdAt`: Timestamp of generation

## 🔌 API Endpoints

### Content Generation
```
POST /api/blogs/fetch?subreddit={name}&limit={n}
```
**Purpose**: Fetches Reddit posts and generates blog articles
**Parameters**:
- `subreddit` (required): Reddit subreddit name (e.g., "technology", "programming")
- `limit` (optional, default: 5): Number of posts to process (1-50)

**Response**: Array of UUIDs representing generated blog post IDs

**Business Logic**:
1. Validates subreddit exists and is accessible
2. Fetches "hot" posts from specified subreddit
3. For each post:
   - Saves raw content to `RawPost` table
   - Sends to AI service for transformation
   - Saves generated article to `GeneratedPost` table
4. Returns list of generated post IDs

### Content Retrieval
```
GET /api/blogs
```
**Purpose**: Retrieves all generated blog posts
**Response**: Array of `GeneratedPost` objects sorted by creation date

```
GET /api/blogs/{id}
```
**Purpose**: Retrieves a specific blog post by ID
**Response**: Single `GeneratedPost` object or 404 if not found

### Content Management
```
DELETE /api/blogs/{id}
```
**Purpose**: Permanently deletes a blog post
**Response**: 204 No Content on success, 404 if not found

## 🎨 Frontend Features

### Home Page (`/`)
- **Blog Discovery**: Input form to specify subreddit and post count
- **Real-time Generation**: Shows loading states during AI processing
- **Content Display**: 
  - "Newly Generated Blogs" section for recently created content
  - "All Blogs" section showing all articles sorted by date
- **Responsive Grid**: Card-based layout for easy browsing

### Blog Detail Page (`/blogs/{id}`)
- **Full Article View**: Renders Markdown content with syntax highlighting
- **Content Actions**:
  - LinkedIn sharing with automatic content formatting
  - Delete functionality with confirmation dialog
- **Navigation**: Back button to return to home page

## 🔧 Key Components

### Backend Services

#### RedditService
**Responsibility**: Reddit API integration and orchestration
- Connects to Reddit API using JRAW library
- Fetches posts sorted by "hot" algorithm
- Enforces limits (1-50 posts per request)
- Coordinates data persistence and AI processing
- Returns generated post IDs for frontend consumption

#### AIService
**Responsibility**: Content transformation using AI
- Uses Spring AI ChatClient for LLM interaction
- Applies sophisticated prompt engineering for quality output
- Ensures consistent Markdown formatting
- Handles edge cases (empty content, formatting issues)

### Frontend Components

#### API Client (`lib/api.ts`)
- Centralized API communication layer
- Type-safe interfaces for all endpoints
- Error handling and response parsing
- Environment-based configuration

#### Blog Management
- **BlogCard**: Reusable card component for blog previews
- **Blog Detail Page**: Full article rendering with Markdown support
- **State Management**: React hooks for loading, error, and data states

## 🔐 Configuration

### Required Environment Variables

**Backend** (`application.properties`):
- `spring.ai.openai.api-key`: AI service API key (Groq/OpenAI)
- `spring.ai.openai.base-url`: AI service endpoint
- `spring.ai.openai.chat.options.model`: AI model identifier
- `reddit.client-id`: Reddit API client ID
- `reddit.client-secret`: Reddit API client secret
- `reddit.username`: Reddit account username
- `reddit.password`: Reddit account password
- `spring.datasource.url`: PostgreSQL connection string

**Frontend** (`.env.local`):
- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: `http://localhost:8081`)

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL database
- Reddit API credentials
- AI service API key (Groq or OpenAI)

### Backend Setup
```bash
cd backend
# Configure application.properties with your credentials
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📊 Data Flow Example

1. **User Action**: User enters "technology" subreddit, requests 5 posts
2. **API Call**: Frontend calls `POST /api/blogs/fetch?subreddit=technology&limit=5`
3. **Reddit Fetch**: Backend fetches 5 hot posts from r/technology
4. **Raw Storage**: Each post saved as `RawPost` with metadata
5. **AI Processing**: Each post sent to AI service for transformation
6. **Article Generation**: AI returns polished Markdown blog articles
7. **Generated Storage**: Articles saved as `GeneratedPost` records
8. **Response**: Backend returns array of 5 UUIDs
9. **Frontend Display**: Frontend fetches each blog by ID and displays in grid
10. **User Interaction**: User can view full article, share, or delete

## 🎯 Business Value

- **Content Velocity**: Generate multiple blog articles in minutes
- **Quality Consistency**: AI ensures professional tone and structure
- **Scalability**: Process up to 50 posts per request
- **Content Archive**: Maintains both raw and generated content for reference
- **User Experience**: Intuitive interface for content discovery and management

## 🔮 Future Enhancements

- Batch processing for large subreddit analysis
- Content scheduling and auto-publishing
- Multi-platform sharing (Twitter, Medium, etc.)
- Content analytics and performance tracking
- Custom AI prompts per subreddit category
- Content versioning and editing capabilities

## 📝 License

MIT

