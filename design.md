# Design Document: Samadhan Civic Issue Reporting System

## Overview

Samadhan is a full-stack civic issue reporting platform built with React/TypeScript frontend and Supabase backend. The system enables citizens to report community problems, track their resolution in real-time, and access AI-powered assistance for civic queries. The architecture emphasizes real-time data synchronization, multilingual support, and accessibility through voice interaction.

**Key Design Principles:**
- Real-time data synchronization using Supabase subscriptions
- Multilingual support (English/Hindi) at all layers
- Voice-first interaction patterns for accessibility
- Responsive mobile-first design
- Secure authentication and authorization
- Modular component architecture for maintainability

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/TypeScript)              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Issue Report │  │  Dashboard   │  │ AI Assistant │      │
│  │  Interface   │  │   & Stats    │  │   Chatbot    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Schemes     │  │ Form Analyzer│  │ Document     │      │
│  │  Section     │  │   Tool       │  │ Locker       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Shared Services Layer                               │  │
│  │  - Auth Service (Supabase Auth)                      │  │
│  │  - Real-time Subscription Manager                    │  │
│  │  - Speech-to-Text Service                            │  │
│  │  - Multilingual Translation Service                  │  │
│  │  - Media Upload Service                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Supabase Backend (PostgreSQL)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Module  │  │ Real-time    │  │ Storage      │      │
│  │              │  │ Subscriptions│  │ (Media)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database Tables                                     │  │
│  │  - users                                             │  │
│  │  - civic_issues                                      │  │
│  │  - issue_categories                                  │  │
│  │  - community_supports                                │  │
│  │  - media_attachments                                 │  │
│  │  - government_schemes                                │  │
│  │  - documents                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           External Services Integration                      │
├─────────────────────────────────────────────────────────────┤
│  - Speech-to-Text API (Google Cloud Speech-to-Text)        │
│  - Text-to-Speech API (Google Cloud Text-to-Speech)        │
│  - AI Assistant API (OpenAI/Claude for civic queries)       │
│  - Translation API (Google Translate for multilingual)      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Tailwind CSS for responsive styling
- Supabase JavaScript client for real-time subscriptions
- Web Speech API for voice input
- Zustand or Context API for state management

**Backend:**
- Supabase (PostgreSQL database + Auth + Real-time)
- Row-Level Security (RLS) for data access control
- PostgreSQL triggers for data validation

**External APIs:**
- Google Cloud Speech-to-Text (multilingual support)
- Google Cloud Text-to-Speech (voice output)
- OpenAI/Claude API (AI Assistant)
- Google Translate API (multilingual support)

**Deployment:**
- Frontend: Vercel or Netlify
- Backend: Supabase Cloud
- Media Storage: Supabase Storage (PostgreSQL-backed)

## Components and Interfaces

### 1. Issue Reporting Component

**Purpose:** Allows citizens to report civic issues with text, voice, and media support.

**Key Interfaces:**

```typescript
interface CivicIssue {
  id: string;
  citizen_id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus; // "Reported" | "In Progress" | "Resolved"
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  voice_recording_url?: string;
  created_at: timestamp;
  updated_at: timestamp;
}

interface IssueCategory {
  id: string;
  name: string; // "Water Supply" | "Sanitation" | "Electricity" | "Roads" | "Parks & Gardens" | "Buildings"
  description: string;
}

interface MediaAttachment {
  id: string;
  issue_id: string;
  file_url: string;
  file_type: string; // "image/jpeg" | "image/png" | "image/webp"
  uploaded_at: timestamp;
}
```

**Responsibilities:**
- Validate issue title and description (non-empty, non-whitespace)
- Handle voice recording and speech-to-text conversion
- Manage media file uploads with format validation
- Create Civic_Issue records in database
- Display validation errors to user

### 2. Community Dashboard Component

**Purpose:** Displays real-time feed of civic issues with filtering and statistics.

**Key Interfaces:**

```typescript
interface DashboardState {
  issues: CivicIssue[];
  statistics: {
    active_issues: number;
    resolved_cases: number;
    total_community_support: number;
  };
  filters: {
    category?: IssueCategory;
    status?: IssueStatus;
    search_query?: string;
  };
}

interface CommunitySupport {
  id: string;
  issue_id: string;
  citizen_id: string;
  created_at: timestamp;
}
```

**Responsibilities:**
- Subscribe to real-time updates from Supabase
- Display issues with status and category information
- Update statistics in real-time
- Handle filtering by category and status
- Manage upvote/downvote functionality
- Unsubscribe from updates when component unmounts

### 3. AI Assistant Component

**Purpose:** Provides 24/7 multilingual chatbot support for civic queries.

**Key Interfaces:**

```typescript
interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  language: "en" | "hi";
  role: "user" | "assistant";
  created_at: timestamp;
}

interface AIAssistantConfig {
  language: "en" | "hi";
  voice_enabled: boolean;
  context: "civic_issues" | "government_schemes" | "form_assistance";
}
```

**Responsibilities:**
- Process text and voice queries
- Maintain conversation context
- Support Hindi and English languages
- Convert speech-to-text for voice input
- Convert text-to-speech for voice output
- Route queries to appropriate knowledge domains
- Handle language switching mid-conversation

### 4. Authentication Component

**Purpose:** Manages user sign-up, sign-in, and session management.

**Key Interfaces:**

```typescript
interface User {
  id: string;
  email: string;
  created_at: timestamp;
  language_preference: "en" | "hi";
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}
```

**Responsibilities:**
- Handle user registration with email/password
- Validate email uniqueness
- Manage login/logout sessions
- Persist language preference
- Enforce authentication on protected routes

### 5. Multilingual Interface Component

**Purpose:** Provides language switching and translation management.

**Key Interfaces:**

```typescript
interface LanguageContext {
  current_language: "en" | "hi";
  translations: Record<string, string>;
  switch_language: (lang: "en" | "hi") => void;
}
```

**Responsibilities:**
- Manage language state globally
- Persist language preference to localStorage
- Provide translated strings for all UI elements
- Handle language switching without page reload

### 6. Voice Interaction Service

**Purpose:** Manages speech-to-text and text-to-speech operations.

**Key Interfaces:**

```typescript
interface VoiceRecording {
  audio_blob: Blob;
  duration: number;
  language: "en" | "hi";
}

interface SpeechToTextResult {
  text: string;
  confidence: number;
  language: string;
}
```

**Responsibilities:**
- Capture audio from microphone
- Convert speech to text using Google Cloud Speech-to-Text API
- Support Hindi and English language detection
- Handle recording errors gracefully
- Convert text to speech for AI responses
- Manage audio playback

### 7. Real-Time Subscription Manager

**Purpose:** Manages Supabase real-time subscriptions for live updates.

**Key Interfaces:**

```typescript
interface SubscriptionManager {
  subscribe: (table: string, callback: (payload: any) => void) => void;
  unsubscribe: (table: string) => void;
  unsubscribe_all: () => void;
}
```

**Responsibilities:**
- Create subscriptions to Supabase tables
- Handle INSERT, UPDATE, DELETE events
- Broadcast updates to subscribed components
- Clean up subscriptions on unmount
- Manage subscription lifecycle

## Data Models

### Database Schema

```sql
-- Users table (managed by Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  language_preference VARCHAR(2) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Issue categories
CREATE TABLE issue_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Civic issues
CREATE TABLE civic_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES issue_categories(id),
  status VARCHAR(50) DEFAULT 'Reported',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  voice_recording_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Media attachments
CREATE TABLE media_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES civic_issues(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Community support (upvotes)
CREATE TABLE community_supports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES civic_issues(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(issue_id, citizen_id)
);

-- Government schemes
CREATE TABLE government_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  eligibility TEXT,
  benefits TEXT,
  application_process TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents (Document Locker)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages (AI Assistant)
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  language VARCHAR(2),
  role VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Row-Level Security (RLS) Policies

```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can view all civic issues
CREATE POLICY "Users can view all issues" ON civic_issues
  FOR SELECT USING (true);

-- Users can only create issues for themselves
CREATE POLICY "Users can create own issues" ON civic_issues
  FOR INSERT WITH CHECK (auth.uid() = citizen_id);

-- Users can only update their own issues
CREATE POLICY "Users can update own issues" ON civic_issues
  FOR UPDATE USING (auth.uid() = citizen_id);

-- Users can view all media attachments
CREATE POLICY "Users can view all media" ON media_attachments
  FOR SELECT USING (true);

-- Users can only create media for their own issues
CREATE POLICY "Users can create media for own issues" ON media_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM civic_issues 
      WHERE id = issue_id AND citizen_id = auth.uid()
    )
  );

-- Users can only view their own documents
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only create their own documents
CREATE POLICY "Users can create own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own documents
CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Users can view all community supports
CREATE POLICY "Users can view all supports" ON community_supports
  FOR SELECT USING (true);

-- Users can only create their own supports
CREATE POLICY "Users can create own supports" ON community_supports
  FOR INSERT WITH CHECK (auth.uid() = citizen_id);

-- Users can only delete their own supports
CREATE POLICY "Users can delete own supports" ON community_supports
  FOR DELETE USING (auth.uid() = citizen_id);

-- Users can view all government schemes
CREATE POLICY "Users can view all schemes" ON government_schemes
  FOR SELECT USING (true);

-- Users can view all chat messages (for their own conversations)
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own messages
CREATE POLICY "Users can create own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Issue Creation Invariant

*For any* valid civic issue submission with non-empty title and description, the system SHALL create a new issue record with status "Reported" and store it in the database.

**Validates: Requirements 1.3, 1.5**

### Property 2: Voice Recording Round Trip

*For any* voice recording in Hindi or English, converting speech-to-text and then storing the result SHALL produce text that can be retrieved and matches the original spoken content semantically.

**Validates: Requirements 2.2, 2.5**

### Property 3: Media Upload Validation

*For any* file upload attempt, if the file is a supported image format (JPEG, PNG, WebP), the system SHALL store it; if unsupported, the system SHALL reject it and leave the issue unchanged.

**Validates: Requirements 3.2, 3.3, 3.5**

### Property 4: Real-Time Dashboard Update

*For any* new civic issue created, all connected clients viewing the Community_Dashboard SHALL receive the update within 1 second through Supabase real-time subscriptions.

**Validates: Requirements 5.2, 17.1**

### Property 5: Community Support Idempotence

*For any* citizen and civic issue, upvoting the same issue multiple times by the same citizen SHALL result in only one Community_Support record; subsequent upvotes SHALL be prevented.

**Validates: Requirements 6.3**

### Property 6: Upvote Count Consistency

*For any* civic issue, the displayed Community_Support count SHALL equal the number of unique citizens who have upvoted that issue.

**Validates: Requirements 6.4, 7.1**

### Property 7: Language Persistence

*For any* citizen who selects a language preference, returning to the platform SHALL display the interface in the previously selected language without requiring re-selection.

**Validates: Requirements 11.4, 11.5**

### Property 8: Authentication Session Integrity

*For any* authenticated user, signing out SHALL terminate the session and redirect to the login page; subsequent requests SHALL require re-authentication.

**Validates: Requirements 12.5, 12.6**

### Property 9: AI Assistant Multilingual Response

*For any* query submitted to the AI_Assistant in Hindi, the system SHALL respond in Hindi; for queries in English, the system SHALL respond in English.

**Validates: Requirements 8.4, 8.5**

### Property 10: Document Locker Access Control

*For any* document stored in the Document_Locker, only the citizen who uploaded it SHALL be able to view or delete it; other citizens SHALL not have access.

**Validates: Requirements 15.3, 15.5**

### Property 11: Issue Status Filter Accuracy

*For any* filter applied to the Community_Dashboard by Issue_Status, only issues matching that status SHALL be displayed; all other issues SHALL be hidden.

**Validates: Requirements 5.5**

### Property 12: Category Filter Consistency

*For any* filter applied by Issue_Category, statistics displayed SHALL reflect only issues in that category; total counts SHALL update accordingly.

**Validates: Requirements 7.3**

## Error Handling

### Voice Recording Errors

**Scenario:** Microphone access denied or speech-to-text API fails

**Response:**
- Display user-friendly error message: "Unable to process voice. Please try again or type your description."
- Log error details for debugging
- Allow user to retry or switch to text input
- Gracefully degrade to text-only input

### Media Upload Errors

**Scenario:** Unsupported file format or upload fails

**Response:**
- Display validation error: "Please upload a JPEG, PNG, or WebP image."
- Prevent form submission
- Allow user to select a different file
- Log upload errors for monitoring

### Real-Time Subscription Errors

**Scenario:** Supabase connection drops or subscription fails

**Response:**
- Attempt automatic reconnection with exponential backoff
- Display offline indicator to user
- Queue local changes for sync when connection restored
- Fall back to polling if subscriptions unavailable
- Log connection errors for monitoring

### Authentication Errors

**Scenario:** Invalid credentials or session expired

**Response:**
- Display clear error message: "Invalid email or password" or "Session expired. Please sign in again."
- Redirect to login page
- Clear stored session data
- Allow password reset if needed

### AI Assistant Errors

**Scenario:** API timeout or service unavailable

**Response:**
- Display message: "AI Assistant is temporarily unavailable. Please try again later."
- Provide fallback suggestions or FAQ
- Log error for monitoring
- Retry with exponential backoff

### Database Errors

**Scenario:** Database constraint violations or connection issues

**Response:**
- Display generic error: "An error occurred. Please try again."
- Log detailed error for debugging
- Implement retry logic for transient failures
- Alert administrators for persistent issues

## Testing Strategy

### Unit Testing

Unit tests verify specific examples, edge cases, and error conditions:

- **Issue Validation:** Test title/description validation with empty strings, whitespace-only strings, and valid inputs
- **Media Upload:** Test file type validation with various formats (JPEG, PNG, WebP, PDF, etc.)
- **Language Switching:** Test language persistence across page reloads
- **Authentication:** Test sign-up with duplicate emails, invalid passwords, and valid credentials
- **Community Support:** Test upvote/downvote toggle functionality
- **Error Handling:** Test error messages for various failure scenarios

### Property-Based Testing

Property-based tests verify universal properties across all inputs using randomized test data:

**Property 1: Issue Creation Invariant**
- Generate random valid issue data (non-empty title, description, category)
- Create issue and verify it exists in database with "Reported" status
- Run 100+ iterations with different inputs

**Property 2: Voice Recording Round Trip**
- Generate random voice recordings in Hindi and English
- Convert to text and verify semantic equivalence
- Run 100+ iterations with different audio samples

**Property 3: Media Upload Validation**
- Generate random file types (supported and unsupported)
- Verify supported formats are stored, unsupported are rejected
- Run 100+ iterations with different file types

**Property 4: Real-Time Dashboard Update**
- Create new issues and measure update latency
- Verify all connected clients receive updates within 1 second
- Run 100+ iterations with concurrent updates

**Property 5: Community Support Idempotence**
- Generate random citizens and issues
- Attempt multiple upvotes from same citizen
- Verify only one support record exists
- Run 100+ iterations with different combinations

**Property 6: Upvote Count Consistency**
- Generate random upvote sequences
- Verify displayed count matches actual support records
- Run 100+ iterations with different sequences

**Property 7: Language Persistence**
- Generate random language selections
- Verify persistence across sessions
- Run 100+ iterations with different language switches

**Property 8: Authentication Session Integrity**
- Generate random user sessions
- Verify sign-out terminates session
- Run 100+ iterations with different session states

**Property 9: AI Assistant Multilingual Response**
- Generate random queries in Hindi and English
- Verify responses are in correct language
- Run 100+ iterations with different queries

**Property 10: Document Locker Access Control**
- Generate random documents and users
- Verify only owner can access
- Run 100+ iterations with different user combinations

**Property 11: Issue Status Filter Accuracy**
- Generate random issues with different statuses
- Apply filters and verify only matching issues displayed
- Run 100+ iterations with different filter combinations

**Property 12: Category Filter Consistency**
- Generate random issues with different categories
- Apply filters and verify statistics update correctly
- Run 100+ iterations with different category combinations

### Integration Testing

Integration tests verify component interactions:

- **Issue Reporting Flow:** Create issue with voice, media, and text
- **Dashboard Real-Time Updates:** Create issue and verify dashboard updates
- **AI Assistant Conversation:** Send multiple messages and verify context maintained
- **Authentication Flow:** Sign up, sign in, sign out, and verify state changes
- **Language Switching:** Switch languages and verify all components update

### Test Configuration

- **Minimum iterations:** 100 per property test
- **Test framework:** Jest with fast-check for property-based testing
- **Coverage target:** 80%+ code coverage
- **CI/CD integration:** Run tests on every commit

