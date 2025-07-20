import os
from typing import List, Dict, Any, Optional
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.llms import OpenAI
from langchain.chat_models import ChatAnthropic
from langchain.schema import Document
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IzocreteChatbot:
    def __init__(
        self,
        vector_store_path: str = "./chroma_db",
        embedding_model_name: str = "all-MiniLM-L6-v2",
        llm_provider: str = "anthropic",
        llm_model_name: str = "claude-3-sonnet-20240229",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ):
        """
        Initialize the Izocrete chatbot.
        
        Args:
            vector_store_path: Path to the Chroma vector store
            embedding_model_name: Name of the sentence transformer model
            llm_provider: LLM provider ("openai" or "anthropic")
            llm_model_name: Name of the LLM model to use
            temperature: Temperature for LLM responses
            max_tokens: Maximum tokens for LLM responses
        """
        self.vector_store_path = vector_store_path
        self.embedding_model = HuggingFaceEmbeddings(model_name=embedding_model_name)
        self.llm_provider = llm_provider
        self.llm_model_name = llm_model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        
        # Initialize components
        self.vector_store = None
        self.llm = None
        self.retrieval_chain = None
        self.memory = None
        
        # Load components
        self._load_components()
        
    def _load_components(self):
        """Load vector store, LLM, and create the retrieval chain."""
        try:
            # Load vector store
            self.vector_store = Chroma(
                persist_directory=self.vector_store_path,
                embedding_function=self.embedding_model
            )
            logger.info(f"Loaded vector store from {self.vector_store_path}")
            
            # Initialize LLM based on provider
            self.llm = self._initialize_llm()
            logger.info(f"Initialized {self.llm_provider} LLM: {self.llm_model_name}")
            
            # Initialize memory
            self.memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
            
            # Create retrieval chain
            self._create_retrieval_chain()
            
        except Exception as e:
            logger.error(f"Error loading components: {e}")
            raise
    
    def _initialize_llm(self):
        """Initialize the LLM based on the provider."""
        if self.llm_provider.lower() == "anthropic":
            return ChatAnthropic(
                model_name=self.llm_model_name,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
        elif self.llm_provider.lower() == "openai":
            return OpenAI(
                model_name=self.llm_model_name,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {self.llm_provider}")
    
    def _create_retrieval_chain(self):
        """Create the conversational retrieval chain with custom prompt."""
        
        # Custom prompt template for Izocrete-specific responses
        prompt_template = """You are an AI assistant for Izocrete, a company that manufactures construction blocks with special insulation properties. You help answer questions about their products, technical specifications, installation, and benefits.

Use the following context to answer the user's question. If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context:
{context}

Question: {question}

Answer the question based on the context provided. Be helpful, accurate, and concise. If the context contains relevant information, use it to provide a comprehensive answer. If you need to cite specific information from the context, mention the source section or tags when relevant.

Answer:"""

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        # Create retrieval chain
        self.retrieval_chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=self.vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 3}
            ),
            memory=self.memory,
            combine_docs_chain_kwargs={"prompt": prompt},
            return_source_documents=True,
            verbose=False
        )
        
        logger.info("Created conversational retrieval chain")
    
    def get_relevant_documents(self, question: str, k: int = 3) -> List[Document]:
        """
        Retrieve relevant documents for a given question.
        
        Args:
            question: User's question
            k: Number of documents to retrieve
            
        Returns:
            List of relevant documents
        """
        try:
            retriever = self.vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": k}
            )
            documents = retriever.get_relevant_documents(question)
            return documents
        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            return []
    
    def chat(self, question: str, stream: bool = False) -> Dict[str, Any]:
        """
        Chat with the Izocrete chatbot.
        
        Args:
            question: User's question
            stream: Whether to stream the response
            
        Returns:
            Dictionary containing response and metadata
        """
        try:
            if stream:
                # For streaming, we'll use a simpler approach
                return self._chat_stream(question)
            else:
                # Use the retrieval chain
                result = self.retrieval_chain({"question": question})
                
                # Extract source documents
                source_docs = result.get("source_documents", [])
                sources = []
                
                for doc in source_docs:
                    metadata = doc.metadata
                    sources.append({
                        "question": metadata.get("question", ""),
                        "answer": metadata.get("answer", ""),
                        "tags": metadata.get("tags", []),
                        "source_section_title": metadata.get("source_section_title", "")
                    })
                
                return {
                    "answer": result["answer"],
                    "sources": sources,
                    "question": question
                }
                
        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return {
                "answer": "I apologize, but I encountered an error while processing your question. Please try again.",
                "sources": [],
                "question": question,
                "error": str(e)
            }
    
    def _chat_stream(self, question: str) -> Dict[str, Any]:
        """
        Stream chat response (simplified version).
        
        Args:
            question: User's question
            
        Returns:
            Dictionary with streaming response
        """
        # Get relevant documents
        documents = self.get_relevant_documents(question)
        
        # Create context from documents
        context = "\n\n".join([doc.page_content for doc in documents])
        
        # Create streaming response
        response = self.llm.stream(
            f"Based on the following context about Izocrete products, answer this question: {question}\n\nContext:\n{context}"
        )
        
        return {
            "stream": response,
            "sources": [doc.metadata for doc in documents],
            "question": question
        }
    
    def get_chat_history(self) -> List[Dict[str, str]]:
        """
        Get the current chat history.
        
        Returns:
            List of chat history entries
        """
        if self.memory:
            return self.memory.chat_memory.messages
        return []
    
    def clear_memory(self):
        """Clear the conversation memory."""
        if self.memory:
            self.memory.clear()
            logger.info("Chat memory cleared")

def create_chatbot(
    vector_store_path: str = "./chroma_db",
    llm_provider: str = "anthropic",
    llm_model_name: str = "claude-3-sonnet",
    temperature: float = 0.7
) -> IzocreteChatbot:
    """
    Factory function to create a chatbot instance.
    
    Args:
        vector_store_path: Path to the vector store
        llm_provider: LLM provider ("openai" or "anthropic")
        llm_model_name: Name of the LLM model
        temperature: Temperature for responses
        
    Returns:
        IzocreteChatbot instance
    """
    return IzocreteChatbot(
        vector_store_path=vector_store_path,
        llm_provider=llm_provider,
        llm_model_name=llm_model_name,
        temperature=temperature
    ) 