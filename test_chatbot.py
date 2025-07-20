#!/usr/bin/env python3
"""
Test script for the Izocrete AI Chatbot.
Run this to test the chatbot functionality locally.
"""

import os
import sys
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_ingestion():
    """Test the ingestion process."""
    print("Testing ingestion...")
    
    try:
        from ingest import QAIngester
        
        # Initialize ingester
        ingester = QAIngester()
        
        # Check for JSON files
        json_files = [
            "izocrete_qa_pairs.json",
            "izocrete_qa_pairs_2.json"
        ]
        
        existing_files = [f for f in json_files if os.path.exists(f)]
        
        if not existing_files:
            print("❌ No JSON files found. Please ensure Q&A pair files exist.")
            return False
        
        print(f"✅ Found {len(existing_files)} JSON files: {existing_files}")
        
        # Test ingestion
        vector_store = ingester.ingest_qa_pairs(existing_files)
        
        print(f"✅ Successfully ingested {len(ingester.qa_pairs)} Q&A pairs")
        return True
        
    except Exception as e:
        print(f"❌ Ingestion failed: {e}")
        return False

def test_chatbot():
    """Test the chatbot functionality."""
    print("\nTesting chatbot...")
    
    try:
        from chatbot import create_chatbot
        
        # Get LLM configuration
        llm_provider = os.getenv("LLM_PROVIDER", "anthropic").lower()
        llm_model = os.getenv("LLM_MODEL", "claude-3-sonnet-20240229")
        
        print(f"Using {llm_provider} LLM: {llm_model}")
        
        # Create chatbot
        chatbot = create_chatbot(
            llm_provider=llm_provider,
            llm_model_name=llm_model
        )
        
        # Test questions
        test_questions = [
            "What is Izocrete?",
            "What is the thermal conductivity of Izocrete?",
            "How much does Izocrete cost per square meter?",
            "What are the benefits of Izocrete blocks?"
        ]
        
        for question in test_questions:
            print(f"\nQuestion: {question}")
            
            try:
                response = chatbot.chat(question)
                print(f"Answer: {response['answer'][:200]}...")
                
                if response.get('sources'):
                    print(f"Sources: {len(response['sources'])} found")
                
            except Exception as e:
                print(f"❌ Error answering question: {e}")
        
        print("✅ Chatbot test completed")
        return True
        
    except Exception as e:
        print(f"❌ Chatbot test failed: {e}")
        return False

def test_api():
    """Test the API endpoints."""
    print("\nTesting API...")
    
    try:
        import requests
        import time
        
        # Wait for API to start
        print("Waiting for API to start...")
        time.sleep(2)
        
        base_url = "http://localhost:8000"
        
        # Test health endpoint
        try:
            response = requests.get(f"{base_url}/health")
            if response.status_code == 200:
                data = response.json()
                print("✅ Health endpoint working")
                print(f"LLM Provider: {data.get('llm_provider', 'unknown')}")
                print(f"LLM Model: {data.get('llm_model', 'unknown')}")
            else:
                print(f"❌ Health endpoint failed: {response.status_code}")
        except requests.exceptions.ConnectionError:
            print("❌ API not running. Please start the API first.")
            return False
        
        # Test chat endpoint
        try:
            response = requests.post(
                f"{base_url}/chat",
                json={"question": "What is Izocrete?", "stream": False}
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Chat endpoint working")
                print(f"Answer: {data['answer'][:100]}...")
            else:
                print(f"❌ Chat endpoint failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Chat endpoint error: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def check_environment():
    """Check if the environment is properly configured."""
    print("Checking environment configuration...")
    
    # Check LLM provider
    llm_provider = os.getenv("LLM_PROVIDER", "anthropic").lower()
    print(f"LLM Provider: {llm_provider}")
    
    # Check API keys
    if llm_provider == "anthropic":
        if not os.getenv("ANTHROPIC_API_KEY"):
            print("❌ ANTHROPIC_API_KEY not set")
            return False
        else:
            print("✅ ANTHROPIC_API_KEY found")
    elif llm_provider == "openai":
        if not os.getenv("OPENAI_API_KEY"):
            print("❌ OPENAI_API_KEY not set")
            return False
        else:
            print("✅ OPENAI_API_KEY found")
    
    # Check LLM model
    llm_model = os.getenv("LLM_MODEL", "claude-3-sonnet-20240229")
    print(f"LLM Model: {llm_model}")
    
    return True

def main():
    """Run all tests."""
    print("🧪 Izocrete AI Chatbot Test Suite")
    print("=" * 50)
    
    # Check environment
    if not check_environment():
        print("\n❌ Environment not properly configured.")
        print("Please set your API key in a .env file or as an environment variable.")
        print("Example .env file:")
        print("ANTHROPIC_API_KEY=your_anthropic_api_key_here")
        print("LLM_PROVIDER=anthropic")
        print("LLM_MODEL=claude-3-sonnet-20240229")
        return
    
    print("✅ Environment configured correctly")
    
    # Run tests
    tests = [
        ("Ingestion", test_ingestion),
        ("Chatbot", test_chatbot),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} Test {'='*20}")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} test failed")
    
    # Summary
    print(f"\n{'='*50}")
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your chatbot is ready to use.")
        print("\nTo start the API server, run:")
        print("python chat_api.py")
        print("\nOr test the API with:")
        print("python test_chatbot.py --api")
    else:
        print("❌ Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    if "--api" in sys.argv:
        test_api()
    else:
        main() 