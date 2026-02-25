import os
import sys

# PATH HACK: Force the script to look into the local .venv site-packages
# This fixes issues where uvicorn --reload might use the system Python.
project_root = os.path.dirname(os.path.abspath(__file__))
venv_site_packages = os.path.join(project_root, ".venv", "Lib", "site-packages")
if os.path.exists(venv_site_packages) and venv_site_packages not in sys.path:
    sys.path.insert(0, venv_site_packages)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
import glob
from pypdf import PdfReader
import numpy as np
from dotenv import load_dotenv
import os
import sys

# Load environment variables
load_dotenv()

# DEBUG: Print environment info
print(f"DEBUG: Using Python Executable: {sys.executable}")
# print(f"DEBUG: Python Path: {sys.path}")

app = FastAPI(title="AgroMart PDF RAG")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

DATA_DIR = "data"

# Backend Client
client = genai.Client(api_key=API_KEY)

# Model configuration
EMBEDDING_MODEL = "text-embedding-004"
GENERATION_MODEL = "gemini-2.0-flash"

class ChatRequest(BaseModel):
    message: str

# In-memory storage for PDF text and embeddings
knowledge_base = []

def load_knowledge_base():
    """Reads all PDFs and stores their content as chunks."""
    global knowledge_base
    knowledge_base = []
    
    pdf_files = glob.glob(os.path.join(DATA_DIR, "*.pdf"))
    if not pdf_files:
        print("No PDF files found in data directory.")
        return

    for pdf_path in pdf_files:
        print(f"Loading {pdf_path}...")
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        # Simple chunking by paragraph
        chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 30]
        
        # Calculate embeddings for each chunk
        for chunk in chunks:
            try:
                response = client.models.embed_content(
                    model="text-embedding-004",
                    contents=chunk
                )
                embedding = response.embeddings[0].values
                knowledge_base.append({
                    "content": chunk,
                    "embedding": embedding,
                    "source": os.path.basename(pdf_path)
                })
            except Exception as e:
                print(f"Error embedding chunk from {pdf_path}: {e}")

    print(f"Knowledge base loaded with {len(knowledge_base)} chunks.")

# Initialize knowledge base on startup
@app.on_event("startup")
async def startup_event():
    load_knowledge_base()

def get_cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def find_relevant_context(query_text, limit=3):
    """Finds the most similar chunks from the knowledge base."""
    if not knowledge_base:
        return "No information available in the PDF knowledge base."
    
    # Embed the user query
    query_response = client.models.embed_content(
        model="text-embedding-004",
        contents=query_text
    )
    query_embedding = query_response.embeddings[0].values
    
    # Calculate similarities
    similarities = []
    for item in knowledge_base:
        sim = get_cosine_similarity(query_embedding, item["embedding"])
        similarities.append((sim, item))
    
    # Sort by similarity
    similarities.sort(key=lambda x: x[0], reverse=True)
    
    # Format top results
    relevant_chunks = [f"[Source: {item['source']}] {item['content']}" for sim, item in similarities[:limit]]
    return "\n\n".join(relevant_chunks)

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        user_query = request.message
        
        # 1. Search for relevant context in the PDF database
        context = find_relevant_context(user_query)

# 2. Strong System Prompt implementation
        system_prompt = f"""
You are **AgroMart AI**, an expert agricultural assistant.

========================
GREETING EXCEPTION
========================
- If the user provides a simple greeting (e.g., "Hello", "Hi", "Good morning", "Namaste", etc.), you are ALLOWED to respond politely and introduce yourself as AgroMart AI.
- After the greeting, briefly list the agricultural guidebooks available for consultation (currently Apple and Cabbage).

========================
ABSOLUTE RULE (NO EXCEPTIONS FOR DATA)
========================
- For any agricultural or technical query, you are ONLY allowed to answer using the **PROVIDED CONTEXT**.
- The PROVIDED CONTEXT is extracted directly from AgroMart’s official knowledge base manuals.
- You MUST NOT use general knowledge or assumptions.
- If information does NOT exist in the context, respond with: 
  "The requested information is not available in our current official guides."

========================
MANDATORY RESPONSE BEHAVIOR
========================
1. Answer strictly from the manual data.
2. Begin your response with: “According to the official guides…”

========================
OFFICIAL CONTEXT:
========================
{context}
"""

        def generate():
            try:
                stream_response = client.models.generate_content_stream(
                    model="gemini-2.0-flash", # Using stable flash for generation
                    contents=f"{system_prompt}\n\nUser Query: {user_query}"
                )
                for chunk in stream_response:
                    if chunk.text:
                        yield chunk.text
            except Exception as inner_e:
                yield f"Error during generation: {str(inner_e)}"

        return StreamingResponse(generate(), media_type="text/plain")

    except Exception as e:
        error_msg = str(e)
        print(f"Error in chat endpoint: {error_msg}")
        def error_gen():
            yield f"Endpoint Error: {error_msg}"
        return StreamingResponse(error_gen(), media_type="text/plain")

@app.get("/")
async def root():
    return {"message": "AgroMart PDF RAG API is running"}

if __name__ == "__main__":
    import uvicorn
    # Using port 8001 to avoid conflict with the MongoDB backend
    uvicorn.run(app, host="0.0.0.0", port=8001)
