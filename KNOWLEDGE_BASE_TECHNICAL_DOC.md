# Knowledge Base Feature - Technical Documentation

## Overview

The Knowledge Base is a RAG (Retrieval-Augmented Generation) system that provides instant, accurate answers to questions about FIA Formula 1 regulations. It combines semantic search with AI-powered natural language generation to make dense regulatory documents accessible to users of all knowledge levels.

---

## Architecture

### High-Level Flow

```
User Query → Embedding → Vector Search → Context Retrieval → LLM Generation → Formatted Answer
```

### Components

1. **Frontend** (`frontend/app/knowledge/page.js`)
   - User interface for asking questions and searching regulations
   - Two modes: "Ask AI" (RAG-based Q&A) and "Search" (semantic search only)
   - Filters by year (2022-2026) and regulation type

2. **Backend API** (`backend/app/routers/knowledge.py`)
   - RESTful endpoints for search, ask, stats, and ingestion
   - Handles request validation and response formatting

3. **RAG Service** (`backend/app/services/knowledge_base.py`)
   - Core logic for PDF processing, embedding, and retrieval
   - Manages ChromaDB vector database

4. **LLM Service** (`backend/app/services/llm.py`)
   - Generates natural language answers using Gemini or Ollama
   - Combines retrieved context with user questions

5. **Vector Database** (ChromaDB)
   - Stores document embeddings for semantic search
   - Persistent storage in `backend/data/chroma/`

---

## Data Pipeline

### 1. PDF Ingestion

**Location**: `backend/app/services/knowledge_base.py` → `ingest_pdfs()`

**Process**:
```python
PDF Files (58 documents)
    ↓
Text Extraction (pypdf)
    ↓
Metadata Parsing (filename analysis)
    ↓
Text Chunking (1000 chars, 200 overlap)
    ↓
Batch Processing (100 chunks at a time)
    ↓
ChromaDB Storage (27,346 chunks)
```

**Metadata Extracted**:
- **Year**: 2022, 2023, 2024, 2025, 2026
- **Type**: Sporting, Technical, Financial, Operational, General Provisions, Power Unit
- **Issue**: Version number (e.g., "Issue 4")
- **Filename**: Original PDF name
- **Chunk Index**: Position within document
- **Total Chunks**: Number of chunks in document

**Chunking Strategy**:
- **Chunk Size**: 1000 characters
- **Overlap**: 200 characters (maintains context across boundaries)
- **Boundary Detection**: Attempts to break at sentence endings (periods)
- **Rationale**: Balances context preservation with retrieval precision

### 2. Embedding Generation

**Model**: `sentence-transformers/all-MiniLM-L6-v2`

**Characteristics**:
- **Dimensions**: 384
- **Speed**: Fast inference (~50ms per chunk)
- **Quality**: Good for semantic similarity in technical documents
- **Size**: 80MB model

**Process**:
- Embeddings generated automatically by ChromaDB during ingestion
- Stored alongside document chunks in vector database
- Used for cosine similarity search during retrieval

---

## Query Processing

### Mode 1: Ask AI (RAG-based Q&A)

**Endpoint**: `POST /api/knowledge/ask`

**Flow**:
```
1. User submits question
2. Apply filters (year, type)
3. Semantic search → Top 5 relevant chunks
4. Build context from chunks
5. Generate prompt with context + question
6. LLM generates answer
7. Return answer + source citations
```

**Example Request**:
```json
{
  "question": "What are the DRS rules for 2026?",
  "year": "2026",
  "type": "Sporting"
}
```

**Prompt Structure**:
```python
SYSTEM: You are an expert F1 regulations advisor...
        Rules:
        1. Only use information from provided sources
        2. Cite sources (year, type, issue)
        3. If answer not in sources, say so
        4. Quote specific article numbers
        5. Explain technical terms

USER:   Based on these regulation excerpts:
        
        [Source 1: 2026 Sporting Regulations, Issue 5]
        <chunk text>
        
        [Source 2: 2026 Technical Regulations, Issue 2]
        <chunk text>
        
        Question: What are the DRS rules for 2026?
```

**Response Format**:
```json
{
  "answer": "Markdown-formatted answer with headers, bold, bullets",
  "sources": [
    {
      "text": "Regulation excerpt...",
      "metadata": {
        "year": "2026",
        "type": "Sporting",
        "issue": "5",
        "filename": "fia_2026_sporting_regulations.pdf"
      },
      "distance": 0.23
    }
  ]
}
```

### Mode 2: Search (Semantic Search Only)

**Endpoint**: `POST /api/knowledge/search`

**Flow**:
```
1. User submits search query
2. Apply filters (year, type)
3. Semantic search → Top N results
4. Return ranked chunks with metadata
```

**Example R
equest**:
```json
{
  "query": "tire regulations",
  "year": "2025",
  "type": "Technical",
  "n_results": 10
}
```

**Response Format**:
```json
[
  {
    "text": "Full chunk text...",
    "metadata": {
      "year": "2025",
      "type": "Technical",
      "issue": "2",
      "filename": "fia_2025_technical_regulations.pdf",
      "chunk_index": 45,
      "total_chunks": 523
    },
    "distance": 0.18
  }
]
```

**Distance Score**:
- Lower = more similar (0.0 = identical)
- Typical range: 0.1 - 0.5 for relevant results
- Based on cosine distance in embedding space

---

## Filtering System

### ChromaDB Filter Syntax

**Single Filter**:
```python
where_filter = {"year": "2026"}
```

**Multiple Filters** (requires `$and` operator):
```python
where_filter = {
    "$and": [
        {"year": "2026"},
        {"type": "Sporting"}
    ]
}
```

**Implementation** (`backend/app/services/knowledge_base.py`):
```python
def search(self, query: str, year_filter: Optional[str], type_filter: Optional[str]):
    conditions = []
    if year_filter:
        conditions.append({"year": year_filter})
    if type_filter:
        conditions.append({"type": type_filter})
    
    # Use $and for multiple conditions
    if len(conditions) > 1:
        where_filter = {"$and": conditions}
    elif len(conditions) == 1:
        where_filter = conditions[0]
    else:
        where_filter = None
    
    results = self.collection.query(
        query_texts=[query],
        n_results=n_results,
        where=where_filter
    )
```

---

## Frontend Implementation

### Component Structure

**File**: `frontend/app/knowledge/page.js`

**State Management**:
```javascript
const [question, setQuestion] = useState("");
const [answer, setAnswer] = useState(null);
const [sources, setSources] = useState([]);
const [loading, setLoading] = useState(false);
const [stats, setStats] = useState(null);
const [years, setYears] = useState([]);
const [types, setTypes] = useState([]);
const [selectedYear, setSelectedYear] = useState("");
const [selectedType, setSelectedType] = useState("");
const [mode, setMode] = useState("ask"); // "ask" or "search"
const [searchResults, setSearchResults] = useState([]);
```

### Markdown Formatting

**Function**: `formatMarkdown(text)`

**Supported Syntax**:
- `### Header` → Large purple header with underline
- `## Subheader` → Medium cyan header
- `**bold text**` → Purple bold text
- `* bullet` or `- bullet` → List items with disc markers
- `---` → Horizontal rule (purple divider)

**Implementation**:
```javascript
const formatMarkdown = (text) => {
    return text.split('\n').map((line, idx) => {
        // Headers
        if (line.trim().startsWith('###')) {
            return <h3 key={idx} style={{...}}>{line.replace(/^###\s*/, '')}</h3>;
        }
        
        // Bold text
        if (line.trim()) {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={idx}>
                    {parts.map((part, i) => 
                        part.match(/^\*\*.*\*\*$/) 
                            ? <strong key={i}>{part.slice(2, -2)}</strong>
                            : part
                    )}
                </p>
            );
        }
    });
};
```

### UI Features

1. **Mode Toggle**: Switch between "Ask AI" and "Search"
2. **Filters**: Year and type dropdowns with race-select styling
3. **Suggested Questions**: Quick-start prompts
4. **Stats Display**: Shows document count, years, and types
5. **Source Citations**: Expandable source cards with metadata badges
6. **Loading States**: Spinner and disabled inputs during processing

---

## Performance Optimizations

### 1. Batch Processing

**Problem**: Initial ingestion took 2.5 hours for 27,346 chunks

**Solution**: Process chunks in batches of 100
```python
batch_size = 100
batch_documents = []
batch_metadatas = []
batch_ids = []

for chunk in chunks:
    batch_documents.append(chunk)
    batch_metadatas.append(metadata)
    batch_ids.append(doc_id)
    
    if len(batch_documents) >= batch_size:
        self.collection.add(
            documents=batch_documents,
            metadatas=batch_metadatas,
            ids=batch_ids
        )
        batch_documents = []
        batch_metadatas = []
        batch_ids = []
```

**Result**: Reduced ingestion time to ~15 minutes

### 2. Caching

- **ChromaDB**: Persistent storage, no re-ingestion needed
- **Embeddings**: Generated once during ingestion
- **Stats**: Calculated on-demand but could be cached

### 3. Query Optimization

- **Limit Results**: Default n_results=5 for Ask, 10 for Search
- **Filter Early**: Apply year/type filters before semantic search
- **Async Operations**: All API calls are async

---

## API Reference

### Endpoints

#### 1. Search Regulations
```
POST /api/knowledge/search
```

**Request Body**:
```json
{
  "query": "string (required)",
  "year": "string (optional)",
  "type": "string (optional)",
  "n_results": "integer (optional, default: 5)"
}
```

**Response**: Array of SearchResult objects

---

#### 2. Ask Question (RAG)
```
POST /api/knowledge/ask
```

**Request Body**:
```json
{
  "question": "string (required)",
  "year": "string (optional)",
  "type": "string (optional)"
}
```

**Response**:
```json
{
  "answer": "string (markdown formatted)",
  "sources": [SearchResult]
}
```

---

#### 3. Get Statistics
```
GET /api/knowledge/stats
```

**Response**:
```json
{
  "total_documents": 58,
  "total_chunks": 27346,
  "by_year": {
    "2022": 3245,
    "2023": 5432,
    "2024": 6789,
    "2025": 5890,
    "2026": 5990
  },
  "by_type": {
    "Sporting": 8234,
    "Technical": 9876,
    "Financial": 4567,
    "Operational": 2345,
    "General Provisions": 1234,
    "Power Unit": 1090
  }
}
```

---

#### 4. Ingest PDFs
```
POST /api/knowledge/ingest?force=true
```

**Query Parameters**:
- `force`: boolean (default: false) - Force re-ingestion even if data exists

**Response**:
```json
{
  "status": "success",
  "message": "PDF ingestion complete",
  "stats": {...}
}
```

---

#### 5. Get Available Years
```
GET /api/knowledge/years
```

**Response**:
```json
{
  "years": ["2022", "2023", "2024", "2025", "2026"]
}
```

---

#### 6. Get Regulation Types
```
GET /api/knowledge/types
```

**Response**:
```json
{
  "types": [
    "Sporting",
    "Technical",
    "Financial",
    "Operational",
    "General Provisions",
    "Power Unit"
  ]
}
```

---

## Configuration

### Environment Variables

**File**: `backend/.env`

```bash
# LLM Configuration
GEMINI_API_KEY=your_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b-instruct

# Data Paths
FASTF1_CACHE_DIR=./cache/fastf1
```

### Dependencies

**Backend** (`backend/requirements.txt`):
```
chromadb>=0.4.22          # Vector database
pypdf>=4.0.0              # PDF text extraction
langchain>=0.1.0          # LLM framework
langchain-community>=0.0.20
sentence-transformers>=2.3.0  # Embedding model
google-generativeai>=0.8.0    # Gemini API
```

**Frontend**:
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "framer-motion": "^10.0.0"
}
```

---

## Deployment Considerations

### 1. PDF Storage

**Current**: PDFs stored in `PDF/` directory at project root

**Production Options**:
- Cloud storage (S3, GCS, Azure Blob)
- CDN for faster access
- Version control for regulation updates

### 2. Vector Database

**Current**: Local ChromaDB in `backend/data/chroma/`

**Production Options**:
- Hosted ChromaDB
- Pinecone, Weaviate, or Qdrant
- PostgreSQL with pgvector extension

### 3. LLM Service

**Current**: Gemini API (primary), Ollama (fallback)

**Production Considerations**:
- Rate limiting (Gemini: 15 req/min free tier)
- Cost optimization (cache common queries)
- Fallback strategy for API failures
- Consider dedicated LLM hosting for high volume

### 4. Scaling

**Bottlenecks**:
- LLM API rate limits
- Embedding generation for new documents
- ChromaDB query performance at scale

**Solutions**:
- Implement request queuing
- Cache frequent queries
- Use batch processing for bulk operations
- Consider sharding for large document sets

---

## Troubleshooting

### Common Issues

#### 1. "Unknown" Year/Type in Filters

**Cause**: PDF filename doesn't match parsing patterns

**Solution**: Update `parse_filename()` in `knowledge_base.py`:
```python
# Add more year patterns
for y in ['2022', '2023', '2024', '2025', '2026', '2027']:
    if y in filename:
        year = y
        break

# Add more type patterns
if "power unit" in filename_lower or "pu_" in filename_lower:
    reg_type = "Power Unit"
```

#### 2. ChromaDB Filter Errors

**Error**: `ValueError: Expected where to have exactly one operator`

**Cause**: Multiple filters without `$and` operator

**Solution**: Use the filter builder pattern shown in Filtering System section

#### 3. Slow Ingestion

**Cause**: Processing chunks one at a time

**Solution**: Use batch processing (already implemented)

#### 4. Gemini API Errors

**Error**: `404 models/gemini-1.5-flash is not found`

**Solution**: Use `gemini-flash-latest` model name:
```python
model = genai.GenerativeModel("gemini-flash-latest")
```

#### 5. Missing Source Citations

**Cause**: LLM not including source references

**Solution**: Strengthen system prompt:
```python
system_prompt = """...
CRITICAL: Always cite sources using format:
(Source: [Year] [Type] Regulations, Issue [Number])
"""
```

---

## Future Enhancements

### Short-term

1. **Query History**: Store and display recent questions
2. **Bookmarks**: Save favorite regulation excerpts
3. **Export**: Download answers as PDF/Markdown
4. **Multi-language**: Support for non-English regulations

### Medium-term

1. **Semantic Caching**: Cache embeddings for common queries
2. **Advanced Filters**: Date ranges, article numbers, keywords
3. **Comparison Mode**: Compare regulations across years
4. **Visual Highlights**: Show relevant sections in PDF viewer

### Long-term

1. **Real-time Updates**: Auto-ingest new regulations when published
2. **Cross-referencing**: Link related articles across documents
3. **Regulatory Timeline**: Track changes over time
4. **Expert Mode**: Advanced query syntax for power users
5. **API for Third Parties**: Public API for regulation queries

---

## Testing

### Manual Testing Checklist

- [ ] Ask AI mode with no filters
- [ ] Ask AI mode with year filter only
- [ ] Ask AI mode with type filter only
- [ ] Ask AI mode with both filters
- [ ] Search mode with various queries
- [ ] Suggested questions work correctly
- [ ] Source citations display properly
- [ ] Markdown formatting renders correctly
- [ ] Stats display accurate counts
- [ ] Year/type dropdowns populate correctly
- [ ] Loading states show during processing
- [ ] Error handling for failed requests

### Sample Test Queries

**Good Results Expected**:
- "What are the DRS rules?"
- "Explain the cost cap"
- "What changed in 2024 regulations?"
- "Power unit regulations for 2026"
- "Tire compound rules"

**Edge Cases**:
- Empty query
- Very long query (>500 words)
- Query with no relevant results
- Query about non-existent year
- Special characters in query

---

## Maintenance

### Regular Tasks

1. **Update Regulations**: Ingest new PDFs when FIA publishes updates
2. **Monitor Performance**: Track query response times
3. **Review Logs**: Check for errors or unusual patterns
4. **Update Embeddings**: Re-embed if switching models
5. **Backup Database**: Regular backups of ChromaDB data

### Monitoring Metrics

- Query response time (target: <2s for Ask, <500ms for Search)
- LLM API success rate (target: >99%)
- User satisfaction (track thumbs up/down if implemented)
- Most common queries (optimize for these)
- Error rates by endpoint

---

## Conclusion

The Knowledge Base feature successfully democratizes access to complex F1 regulations through:

1. **Semantic Search**: Find relevant information without exact keyword matching
2. **RAG-based Q&A**: Get natural language answers with source citations
3. **Intelligent Filtering**: Narrow results by year and regulation type
4. **User-friendly UI**: Clean interface with markdown formatting
5. **Fast Performance**: Optimized ingestion and query processing

The system is production-ready with room for enhancements based on user feedback and usage patterns.

---

**Last Updated**: April 1, 2026  
**Version**: 1.0  
**Author**: PitWall AI Team
