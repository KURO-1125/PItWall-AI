"""
PitWall AI — Knowledge Base Service
RAG system for F1 regulations and rules (2023-2026)
"""
import os
import logging
from typing import List, Dict, Optional
import chromadb
from chromadb.config import Settings
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class KnowledgeBaseService:
    """RAG-based knowledge base for F1 regulations."""
    
    def __init__(self, pdf_dir: str = "../PDF", db_dir: str = "./data/chroma"):
        self.pdf_dir = pdf_dir
        self.db_dir = db_dir
        
        # Initialize ChromaDB
        os.makedirs(db_dir, exist_ok=True)
        self.client = chromadb.PersistentClient(path=db_dir)
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="f1_regulations",
            metadata={"description": "F1 Regulations 2023-2026"}
        )
        
        logger.info(f"Knowledge Base initialized with {self.collection.count()} documents")
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF file."""
        try:
            reader = PdfReader(pdf_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting text from {pdf_path}: {e}")
            return ""
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks."""
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < text_len:
                last_period = chunk.rfind('.')
                if last_period > chunk_size // 2:
                    end = start + last_period + 1
                    chunk = text[start:end]
            
            chunks.append(chunk.strip())
            start = end - overlap
        
        return chunks
    
    def parse_filename(self, filename: str) -> Dict[str, str]:
        """Extract metadata from filename."""
        filename_lower = filename.lower()
        
        # Extract year - check for any 4-digit year from 2020-2029
        year = None
        for y in ['2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029']:
            if y in filename:
                year = y
                break
        
        # Extract regulation type
        reg_type = "Unknown"
        if "sporting" in filename_lower:
            reg_type = "Sporting"
        elif "technical" in filename_lower:
            reg_type = "Technical"
        elif "financial" in filename_lower:
            reg_type = "Financial"
        elif "operational" in filename_lower:
            reg_type = "Operational"
        elif "general" in filename_lower or "section_a" in filename_lower or "section a" in filename_lower:
            reg_type = "General Provisions"
        elif "power unit" in filename_lower or "pu_" in filename_lower or "_pu_" in filename_lower:
            reg_type = "Power Unit"
        
        # Extract issue number
        issue = "Unknown"
        if "issue" in filename_lower or "iss" in filename_lower:
            parts = filename.replace("_", " ").replace("-", " ").split()
            for i, part in enumerate(parts):
                if "issue" in part.lower() or "iss" in part.lower():
                    if i + 1 < len(parts):
                        issue = parts[i + 1].replace(".pdf", "")
                        break
        
        return {
            "year": year or "Unknown",
            "type": reg_type,
            "issue": issue,
            "filename": filename
        }
    
    def ingest_pdfs(self, force_reingest: bool = False):
        """Ingest all PDFs from the PDF directory."""
        if not force_reingest and self.collection.count() > 0:
            logger.info(f"Knowledge base already contains {self.collection.count()} documents. Skipping ingestion.")
            return
        
        if not os.path.exists(self.pdf_dir):
            logger.error(f"PDF directory not found: {self.pdf_dir}")
            return
        
        pdf_files = [f for f in os.listdir(self.pdf_dir) if f.endswith('.pdf')]
        logger.info(f"Found {len(pdf_files)} PDF files to ingest")
        
        total_chunks = 0
        batch_documents = []
        batch_metadatas = []
        batch_ids = []
        batch_size = 100  # Process in batches of 100 chunks
        
        for pdf_file in pdf_files:
            pdf_path = os.path.join(self.pdf_dir, pdf_file)
            logger.info(f"Processing: {pdf_file}")
            
            # Extract text
            text = self.extract_text_from_pdf(pdf_path)
            if not text:
                logger.warning(f"No text extracted from {pdf_file}")
                continue
            
            # Parse metadata
            metadata = self.parse_filename(pdf_file)
            
            # Chunk text
            chunks = self.chunk_text(text)
            logger.info(f"  Created {len(chunks)} chunks")
            
            # Add to batch
            for i, chunk in enumerate(chunks):
                doc_id = f"{pdf_file}_{i}"
                chunk_metadata = {
                    **metadata,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                }
                
                batch_documents.append(chunk)
                batch_metadatas.append(chunk_metadata)
                batch_ids.append(doc_id)
                
                # Process batch when it reaches batch_size
                if len(batch_documents) >= batch_size:
                    self.collection.add(
                        documents=batch_documents,
                        metadatas=batch_metadatas,
                        ids=batch_ids
                    )
                    total_chunks += len(batch_documents)
                    logger.info(f"  Processed batch: {total_chunks} total chunks so far")
                    batch_documents = []
                    batch_metadatas = []
                    batch_ids = []
        
        # Process remaining chunks
        if batch_documents:
            self.collection.add(
                documents=batch_documents,
                metadatas=batch_metadatas,
                ids=batch_ids
            )
            total_chunks += len(batch_documents)
        
        logger.info(f"Ingestion complete! Total chunks: {total_chunks}")
    
    def search(self, query: str, n_results: int = 5, year_filter: Optional[str] = None, 
               type_filter: Optional[str] = None) -> List[Dict]:
        """Search the knowledge base."""
        where_filter = None
        
        # Build filter conditions
        conditions = []
        if year_filter:
            conditions.append({"year": year_filter})
        if type_filter:
            conditions.append({"type": type_filter})
        
        # Use $and operator if multiple conditions
        if len(conditions) > 1:
            where_filter = {"$and": conditions}
        elif len(conditions) == 1:
            where_filter = conditions[0]
        
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where_filter
        )
        
        # Format results
        formatted_results = []
        if results['documents'] and len(results['documents']) > 0:
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    "text": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i],
                    "distance": results['distances'][0][i] if 'distances' in results else None
                })
        
        return formatted_results
    
    def get_stats(self) -> Dict:
        """Get knowledge base statistics."""
        total_chunks = self.collection.count()
        
        # Get all metadata to calculate stats
        all_data = self.collection.get()
        metadatas = all_data['metadatas']
        
        years = {}
        types = {}
        unique_files = set()
        
        for meta in metadatas:
            year = meta.get('year', 'Unknown')
            reg_type = meta.get('type', 'Unknown')
            filename = meta.get('filename', '')
            
            years[year] = years.get(year, 0) + 1
            types[reg_type] = types.get(reg_type, 0) + 1
            
            # Track unique documents
            if filename:
                unique_files.add(filename)
        
        return {
            "total_documents": len(unique_files),
            "total_chunks": total_chunks,
            "by_year": years,
            "by_type": types
        }


# Singleton
knowledge_base_service = KnowledgeBaseService()
