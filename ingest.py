import json
import os
from typing import List, Dict, Any
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QAIngester:
    def __init__(self, embedding_model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the Q&A ingester with embedding model and vector store.
        
        Args:
            embedding_model_name: Name of the sentence transformer model to use
        """
        self.embedding_model = HuggingFaceEmbeddings(model_name=embedding_model_name)
        self.vector_store = None
        self.qa_pairs = []
        
    def load_qa_pairs_from_json(self, file_paths: List[str]) -> List[Dict[str, Any]]:
        """
        Load Q&A pairs from multiple JSON files.
        
        Args:
            file_paths: List of JSON file paths containing Q&A pairs
            
        Returns:
            List of Q&A pair dictionaries
        """
        all_qa_pairs = []
        
        for file_path in file_paths:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    qa_pairs = json.load(f)
                    logger.info(f"Loaded {len(qa_pairs)} Q&A pairs from {file_path}")
                    all_qa_pairs.extend(qa_pairs)
            except Exception as e:
                logger.error(f"Error loading {file_path}: {e}")
                
        return all_qa_pairs
    
    def create_documents_from_qa_pairs(self, qa_pairs: List[Dict[str, Any]]) -> List[Document]:
        """
        Convert Q&A pairs to LangChain Document objects.
        
        Args:
            qa_pairs: List of Q&A pair dictionaries
            
        Returns:
            List of Document objects
        """
        documents = []
        
        for i, qa_pair in enumerate(qa_pairs):
            # Create content that combines question and answer
            content = f"Question: {qa_pair.get('question', '')}\n\nAnswer: {qa_pair.get('answer', '')}"
            
            # Convert list-type metadata to comma-separated strings
            tags = qa_pair.get('tags', [])
            if isinstance(tags, list):
                tags = ', '.join(str(tag) for tag in tags)
            
            # Create metadata
            metadata = {
                'question': qa_pair.get('question', ''),
                'answer': qa_pair.get('answer', ''),
                'tags': tags,
                'source_section_title': qa_pair.get('source_section_title', ''),
                'qa_id': i,
                'type': 'qa_pair'
            }
            
            # Create Document object
            doc = Document(
                page_content=content,
                metadata=metadata
            )
            documents.append(doc)
            
        return documents
    
    def create_vector_store(self, documents: List[Document], persist_directory: str = "./chroma_db") -> Chroma:
        """
        Create and persist a Chroma vector store from documents.
        
        Args:
            documents: List of Document objects
            persist_directory: Directory to persist the vector store
            
        Returns:
            Chroma vector store instance
        """
        logger.info(f"Creating vector store with {len(documents)} documents...")
        
        # Create vector store
        vector_store = Chroma.from_documents(
            documents=documents,
            embedding=self.embedding_model,
            persist_directory=persist_directory
        )
        
        # Persist the vector store
        vector_store.persist()
        logger.info(f"Vector store created and persisted to {persist_directory}")
        
        return vector_store
    
    def ingest_qa_pairs(self, json_file_paths: List[str], persist_directory: str = "./chroma_db") -> Chroma:
        """
        Complete ingestion pipeline: load Q&A pairs and create vector store.
        
        Args:
            json_file_paths: List of JSON file paths containing Q&A pairs
            persist_directory: Directory to persist the vector store
            
        Returns:
            Chroma vector store instance
        """
        # Load Q&A pairs
        qa_pairs = self.load_qa_pairs_from_json(json_file_paths)
        logger.info(f"Total Q&A pairs loaded: {len(qa_pairs)}")
        
        # Convert to documents
        documents = self.create_documents_from_qa_pairs(qa_pairs)
        logger.info(f"Created {len(documents)} documents")
        
        # Create vector store
        vector_store = self.create_vector_store(documents, persist_directory)
        
        self.vector_store = vector_store
        self.qa_pairs = qa_pairs
        
        return vector_store

def main():
    """Main function to run the ingestion process."""
    # Initialize ingester
    ingester = QAIngester()
    
    # Define JSON file paths
    json_files = [
        "izocrete_qa_pairs.json",
        "izocrete_qa_pairs_2.json"
    ]
    
    # Check which files exist
    existing_files = [f for f in json_files if os.path.exists(f)]
    
    if not existing_files:
        logger.error("No JSON files found. Please ensure the Q&A pair files exist.")
        return
    
    logger.info(f"Found {len(existing_files)} JSON files: {existing_files}")
    
    # Ingest Q&A pairs
    vector_store = ingester.ingest_qa_pairs(existing_files)
    
    logger.info("Ingestion completed successfully!")
    logger.info(f"Vector store created with {len(ingester.qa_pairs)} Q&A pairs")

if __name__ == "__main__":
    main() 