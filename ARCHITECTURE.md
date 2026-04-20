# PitWall AI - System Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Next.js UI]
        Landing[Landing Page]
        Strategy[Strategy Advisor Page]
        Knowledge[Knowledge Base Page]
    end
    
    subgraph "API Layer"
        API[FastAPI Backend]
        RaceRouter[Race Router]
        StrategyRouter[Strategy Router]
        KnowledgeRouter[Knowledge Router]
    end
    
    subgraph "Service Layer"
        FastF1[FastF1 Service]
        LLM[LLM Service]
        KB[Knowledge Base Service]
    end
    
    subgraph "Data Layer"
        FastF1Cache[(FastF1 Cache)]
        ChromaDB[(ChromaDB Vector DB)]
        PDFs[PDF Documents]
    end
    
    subgraph "External Services"
        Gemini[Google Gemini API]
        Ollama[Ollama Local LLM]
        F1API[FastF1 API]
    end
    
    UI --> API
    Landing --> UI
    Strategy --> UI
    Knowledge --> UI
    
    API --> RaceRouter
    API --> StrategyRouter
    API --> KnowledgeRouter
    
    RaceRouter --> FastF1
    StrategyRouter --> FastF1
    StrategyRouter --> LLM
    KnowledgeRouter --> KB
    KnowledgeRouter --> LLM
    
    FastF1 --> FastF1Cache
    FastF1 --> F1API
    KB --> ChromaDB
    KB --> PDFs
    LLM --> Gemini
    LLM -.fallback.-> Ollama
    
    style UI fill:#00e5ff,stroke:#0088cc,stroke-width:3px,color:#000
    style API fill:#ff2e97,stroke:#cc0040,stroke-width:3px,color:#fff
    style LLM fill:#c44dff,stroke:#8800cc,stroke-width:3px,color:#fff
    style ChromaDB fill:#00ff88,stroke:#00cc33,stroke-width:3px,color:#000
```

---

## Module-wise Architecture

### 1. Frontend Architecture

```mermaid
graph LR
    subgraph "Frontend Modules"
        subgraph "Pages"
            Home[Home Page<br/>page.js]
            StratPage[Strategy Page<br/>strategy/page.js]
            KnowPage[Knowledge Page<br/>knowledge/page.js]
        end
        
        subgraph "Components"
            RaceSelect[Race Selector]
            RaceState[Race State Card]
            StratChart[Strategy Chart]
            WhatIf[What-If Panel]
            ChatPanel[Chat Panel]
        end
        
        subgraph "Libraries"
            API[API Client<br/>lib/api.js]
            Animations[Animations<br/>lib/animations.js]
            Constants[Constants<br/>lib/constants.js]
        end
        
        subgraph "Styling"
            GlobalCSS[Global CSS<br/>globals.css]
            Layout[Layout<br/>layout.js]
        end
    end
    
    Home --> Layout
    StratPage --> Layout
    KnowPage --> Layout
    
    StratPage --> RaceSelect
    StratPage --> RaceState
    StratPage --> StratChart
    StratPage --> WhatIf
    StratPage --> ChatPanel
    
    RaceSelect --> API
    ChatPanel --> API
    WhatIf --> API
    KnowPage --> API
    
    Home --> Animations
    StratPage --> Animations
    KnowPage --> Animations
    
    Layout --> GlobalCSS
    
    style Home fill:#00e5ff,stroke:#0088cc,stroke-width:2px,color:#000
    style StratPage fill:#00e5ff,stroke:#0088cc,stroke-width:2px,color:#000
    style KnowPage fill:#00e5ff,stroke:#0088cc,stroke-width:2px,color:#000
    style API fill:#ff6b35,stroke:#cc0040,stroke-width:2px,color:#fff
```

---

### 2. Backend Architecture

```mermaid
graph TB
    subgraph "Backend Modules"
        subgraph "Entry Point"
            Main[main.py<br/>FastAPI App]
            Config[config.py<br/>Settings]
        end
        
        subgraph "Routers"
            RRouter[races.py<br/>Race Endpoints]
            SRouter[strategy.py<br/>Strategy Endpoints]
            KRouter[knowledge.py<br/>Knowledge Endpoints]
        end
        
        subgraph "Services"
            F1Svc[fastf1_svc.py<br/>Race Data Service]
            LLMSvc[llm.py<br/>LLM Service]
            KBSvc[knowledge_base.py<br/>RAG Service]
        end
        
        subgraph "Engines"
            StratEngine[strategy.py<br/>Strategy Engine]
        end
        
        subgraph "Models"
            Schemas[schemas.py<br/>Pydantic Models]
        end
    end
    
    Main --> Config
    Main --> RRouter
    Main --> SRouter
    Main --> KRouter
    
    RRouter --> F1Svc
    RRouter --> Schemas
    
    SRouter --> StratEngine
    SRouter --> Schemas
    
    KRouter --> KBSvc
    KRouter --> LLMSvc
    KRouter --> Schemas
    
    StratEngine --> F1Svc
    StratEngine --> LLMSvc
    
    style Main fill:#ff2e97,stroke:#cc0040,stroke-width:3px,color:#fff
    style F1Svc fill:#c44dff,stroke:#8800cc,stroke-width:2px,color:#fff
    style LLMSvc fill:#c44dff,stroke:#8800cc,stroke-width:2px,color:#fff
    style KBSvc fill:#c44dff,stroke:#8800cc,stroke-width:2px,color:#fff
    style StratEngine fill:#00ff88,stroke:#00cc33,stroke-width:2px,color:#000
```

---

### 3. Strategy Advisor Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Strategy Page
    participant API as Strategy Router
    participant Engine as Strategy Engine
    participant F1 as FastF1 Service
    participant LLM as LLM Service
    participant Gemini as Gemini API
    
    User->>UI: Select Race
    UI->>API: GET /api/races/{session_key}/state
    API->>F1: get_race_state()
    F1->>F1: Load session data
    F1->>F1: Calculate positions, gaps, tire life
    F1-->>API: Race state data
    API-->>UI: Display positions & chart
    
    User->>UI: Ask strategy question
    UI->>API: POST /api/strategy/ask
    API->>Engine: ask(session_key, question)
    Engine->>F1: get_race_state()
    F1-->>Engine: Race data
    Engine->>Engine: Build context (positions, pace, tires)
    Engine->>LLM: generate(prompt, context)
    LLM->>Gemini: API call
    Gemini-->>LLM: Generated answer
    LLM-->>Engine: Formatted response
    Engine-->>API: Strategy analysis
    API-->>UI: Display answer
    UI-->>User: Show formatted response
    
    User->>UI: Run What-If Simulation
    UI->>API: POST /api/strategy/whatif
    API->>Engine: whatif(driver, pit_lap, compound)
    Engine->>F1: get_laps_data()
    F1-->>Engine: Lap times
    Engine->>Engine: Calculate degradation
    Engine->>Engine: Simulate alternative strategy
    Engine-->>API: Comparison results
    API-->>UI: Display time delta
    UI-->>User: Show simulation results
```

---

### 4. Knowledge Base Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Knowledge Page
    participant API as Knowledge Router
    participant KB as Knowledge Base Service
    participant ChromaDB as Vector Database
    participant LLM as LLM Service
    participant Gemini as Gemini API
    
    User->>UI: Open Knowledge Base
    UI->>API: GET /api/knowledge/stats
    API->>KB: get_stats()
    KB->>ChromaDB: collection.count()
    ChromaDB-->>KB: Document counts
    KB-->>API: Statistics
    API-->>UI: Display stats
    
    UI->>API: GET /api/knowledge/years
    API->>KB: get_stats()
    KB-->>API: Available years
    API-->>UI: Populate year filter
    
    UI->>API: GET /api/knowledge/types
    API->>KB: get_stats()
    KB-->>API: Regulation types
    API-->>UI: Populate type filter
    
    User->>UI: Ask question
    UI->>API: POST /api/knowledge/ask
    API->>KB: search(question, filters)
    KB->>ChromaDB: query(embeddings, filters)
    ChromaDB->>ChromaDB: Semantic search
    ChromaDB-->>KB: Top 5 relevant chunks
    KB->>KB: Build context from chunks
    KB->>LLM: generate(question + context)
    LLM->>Gemini: API call
    Gemini-->>LLM: Generated answer
    LLM-->>KB: Formatted response
    KB-->>API: Answer + sources
    API-->>UI: Display answer with citations
    UI-->>User: Show formatted answer
    
    User->>UI: Switch to Search mode
    UI->>API: POST /api/knowledge/search
    API->>KB: search(query, filters)
    KB->>ChromaDB: query(embeddings, filters)
    ChromaDB-->>KB: Ranked results
    KB-->>API: Search results
    API-->>UI: Display results
    UI-->>User: Show ranked chunks
```

---

### 5. Data Ingestion Flow

```mermaid
graph TB
    subgraph "PDF Ingestion Pipeline"
        PDFs[PDF Files<br/>58 documents]
        Extract[Text Extraction<br/>pypdf]
        Parse[Metadata Parsing<br/>filename analysis]
        Chunk[Text Chunking<br/>1000 chars, 200 overlap]
        Batch[Batch Processing<br/>100 chunks/batch]
        Embed[Embedding Generation<br/>sentence-transformers]
        Store[Vector Storage<br/>ChromaDB]
    end
    
    PDFs --> Extract
    Extract --> Parse
    Parse --> Chunk
    Chunk --> Batch
    Batch --> Embed
    Embed --> Store
    
    Extract -.metadata.-> Parse
    Parse -.year, type, issue.-> Chunk
    Chunk -.27,346 chunks.-> Batch
    Batch -.100 at a time.-> Embed
    Embed -.384-dim vectors.-> Store
    
    style PDFs fill:#ff6b35,stroke:#cc0040,stroke-width:2px,color:#fff
    style Extract fill:#c44dff,stroke:#8800cc,stroke-width:2px,color:#fff
    style Parse fill:#c44dff,stroke:#8800cc,stroke-width:2px,color:#fff
    style Chunk fill:#c44dff,stroke:#8800cc,stroke-width:2px,color:#fff
    style Batch fill:#00ff88,stroke:#00cc33,stroke-width:2px,color:#000
    style Embed fill:#00e5ff,stroke:#0088cc,stroke-width:2px,color:#000
    style Store fill:#00ff88,stroke:#00cc33,stroke-width:2px,color:#000
```

---

### 6. LLM Service Architecture

```mermaid
graph TB
    subgraph "LLM Service"
        Entry[generate<br/>prompt, system, temp]
        
        subgraph "Primary Path"
            Gemini[Gemini API<br/>gemini-flash-latest]
            GeminiSuccess[Return Response]
        end
        
        subgraph "Fallback Path"
            GeminiFail[Gemini Failed]
            Ollama[Ollama Local<br/>qwen2.5:14b-instruct]
            OllamaSuccess[Return Response]
        end
        
        Error[Return Error Message]
    end
    
    Entry --> Gemini
    Gemini -->|Success| GeminiSuccess
    Gemini -->|Failure| GeminiFail
    GeminiFail --> Ollama
    Ollama -->|Success| OllamaSuccess
    Ollama -->|Failure| Error
    
    style Entry fill:#c44dff,stroke:#8800cc,stroke-width:3px,color:#fff
    style Gemini fill:#00ff88,stroke:#00cc33,stroke-width:2px,color:#000
    style Ollama fill:#ff6b35,stroke:#cc0040,stroke-width:2px,color:#fff
    style GeminiSuccess fill:#00e5ff,stroke:#0088cc,stroke-width:2px,color:#000
    style OllamaSuccess fill:#00e5ff,stroke:#0088cc,stroke-width:2px,color:#000
    style Error fill:#ff2e97,stroke:#cc0040,stroke-width:2px,color:#fff
```

---

### 7. Data Storage Architecture

```mermaid
graph LR
    subgraph "Data Storage"
        subgraph "FastF1 Cache"
            F1Cache[SQLite Cache<br/>fastf1_http_cache.sqlite]
            SessionData[Session Data<br/>.ff1pkl files]
        end
        
        subgraph "ChromaDB"
            Collection[f1_regulations<br/>collection]
            Embeddings[Vector Embeddings<br/>384 dimensions]
            Metadata[Document Metadata<br/>year, type, issue]
        end
        
        subgraph "Source Files"
            PDFDir[PDF Directory<br/>58 regulation files]
        end
    end
    
    F1Cache -.stores.-> SessionData
    Collection -.contains.-> Embeddings
    Collection -.contains.-> Metadata
    PDFDir -.ingested into.-> Collection
    
    style F1Cache fill:#00e5ff,stroke:#0088cc,stroke-width:2px,color:#000
    style Collection fill:#00ff88,stroke:#00cc33,stroke-width:2px,color:#000
    style PDFDir fill:#ff6b35,stroke:#cc0040,stroke-width:2px,color:#fff
```

---

### 8. API Endpoints Overview

```mermaid
graph TB
    subgraph "API Endpoints"
        subgraph "Race Endpoints"
            GetRaces[GET /api/races<br/>List races by year]
            GetState[GET /api/races/{id}/state<br/>Get race state]
            GetLaps[GET /api/races/{id}/laps<br/>Get lap data]
        end
        
        subgraph "Strategy Endpoints"
            AskStrategy[POST /api/strategy/ask<br/>Ask strategy question]
            WhatIf[POST /api/strategy/whatif<br/>Run simulation]
        end
        
        subgraph "Knowledge Endpoints"
            Search[POST /api/knowledge/search<br/>Semantic search]
            Ask[POST /api/knowledge/ask<br/>RAG Q&A]
            Stats[GET /api/knowledge/stats<br/>Get statistics]
            Years[GET /api/knowledge/years<br/>Get available years]
            Types[GET /api/knowledge/types<br/>Get regulation types]
            Ingest[POST /api/knowledge/ingest<br/>Ingest PDFs]
        end
        
        subgraph "Health"
            Health[GET /health<br/>Health check]
        end
    end
    
    style GetRaces fill:#00e5ff,stroke:#0088cc,stroke-width:2px,color:#000
    style GetState fill:#00e5ff,stroke:#0088cc,stroke-width:2px,color:#000
    style AskStrategy fill:#c44dff,stroke:#8800cc,stroke-width:2px,color:#fff
    style WhatIf fill:#c44dff,stroke:#8800cc,stroke-width:2px,color:#fff
    style Search fill:#00ff88,stroke:#00cc33,stroke-width:2px,color:#000
    style Ask fill:#00ff88,stroke:#00cc33,stroke-width:2px,color:#000
    style Health fill:#ff6b35,stroke:#cc0040,stroke-width:2px,color:#fff
```

---

### 9. Technology Stack

```mermaid
graph TB
    subgraph "Technology Stack"
        subgraph "Frontend"
            NextJS[Next.js 14<br/>React Framework]
            React[React 18<br/>UI Library]
            Framer[Framer Motion<br/>Animations]
        end
        
        subgraph "Backend"
            FastAPI[FastAPI<br/>Python Web Framework]
            Pydantic[Pydantic<br/>Data Validation]
            Uvicorn[Uvicorn<br/>ASGI Server]
        end
        
        subgraph "Data & ML"
            FastF1Lib[FastF1<br/>F1 Data Library]
            ChromaDBLib[ChromaDB<br/>Vector Database]
            SentenceT[Sentence Transformers<br/>Embeddings]
            PyPDF[PyPDF<br/>PDF Processing]
        end
        
        subgraph "AI Services"
            GeminiAPI[Google Gemini<br/>Cloud LLM]
            OllamaLocal[Ollama<br/>Local LLM]
        end
    end
    
    NextJS --> React
    NextJS --> Framer
    
    FastAPI --> Pydantic
    FastAPI --> Uvicorn
    
    FastAPI --> FastF1Lib
    FastAPI --> ChromaDBLib
    FastAPI --> SentenceT
    FastAPI --> PyPDF
    
    FastAPI --> GeminiAPI
    FastAPI -.fallback.-> OllamaLocal
    
    style NextJS fill:#00e5ff,stroke:#0088cc,stroke-width:2px,color:#000
    style FastAPI fill:#ff2e97,stroke:#cc0040,stroke-width:2px,color:#fff
    style ChromaDBLib fill:#00ff88,stroke:#00cc33,stroke-width:2px,color:#000
    style GeminiAPI fill:#c44dff,stroke:#8800cc,stroke-width:2px,color:#fff
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Deployment"
        subgraph "Frontend"
            Vercel[Vercel<br/>Next.js Hosting]
            CDN[CDN<br/>Static Assets]
        end
        
        subgraph "Backend"
            Server[Cloud Server<br/>AWS/GCP/Azure]
            API[FastAPI App<br/>Uvicorn]
        end
        
        subgraph "Data Storage"
            VectorDB[Hosted ChromaDB<br/>or Pinecone]
            FileStorage[Cloud Storage<br/>S3/GCS for PDFs]
            Cache[Redis Cache<br/>Query Results]
        end
        
        subgraph "External Services"
            GeminiCloud[Google Gemini API]
            F1Data[FastF1 API]
        end
    end
    
    User[Users] --> Vercel
    Vercel --> CDN
    Vercel --> API
    API --> VectorDB
    API --> FileStorage
    API --> Cache
    API --> GeminiCloud
    API --> F1Data
    
    style Vercel fill:#00e5ff,stroke:#0088cc,stroke-width:2px,color:#000
    style API fill:#ff2e97,stroke:#cc0040,stroke-width:2px,color:#fff
    style VectorDB fill:#00ff88,stroke:#00cc33,stroke-width:2px,color:#000
    style GeminiCloud fill:#c44dff,stroke:#8800cc,stroke-width:2px,color:#fff
```

---

## Color Legend

- 🔵 **Cyan** - Frontend components and user-facing elements
- 🔴 **Red/Pink** - Backend API and core services
- 🟣 **Purple** - AI/ML services and LLM components
- 🟢 **Green** - Data storage and databases
- 🟠 **Orange** - External services and fallback systems

---

**Generated**: April 1, 2026  
**Version**: 1.0  
**Format**: Mermaid Diagrams
