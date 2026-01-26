from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="AgroMart RAG Chatbot")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MONGO_URI = os.getenv("MONGO_URI")
API_KEY = os.getenv("GEMINI_API_KEY")
DB_NAME = "agromart_2"

if not MONGO_URI or not API_KEY:
    raise ValueError("Required environment variables (MONGO_URI or GEMINI_API_KEY) not found")

# Backend Client
client = genai.Client(api_key=API_KEY)

# Model configuration
EMBEDDING_MODEL = "text-embedding-004"
GENERATION_MODEL = "gemini-2.0-flash"

mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DB_NAME]

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str

def get_query_embedding(text):
    """Generates embedding for the user's query using Gemini."""
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text
    )
    return response.embeddings[0].values

def vector_search(collection_name, query_embedding, limit=3):
    """Performs vector search in the specified collection."""
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": 100,
                "limit": limit
            }
        },
        {
            "$project": {
                "_id": 0,
                "question": 1,
                "answer": 1,
                "crop_id": 1,
                "topic": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
    return list(db[collection_name].aggregate(pipeline))

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        user_query = request.message
        
        # 1. Generate embedding for user query
        query_embedding = get_query_embedding(user_query)
        
        # 2. Search both collections
        veg_results = vector_search("vegetables", query_embedding)
        fruit_results = vector_search("fruits", query_embedding)
        
        # Merge and sort by score
        all_results = sorted(veg_results + fruit_results, key=lambda x: x['score'], reverse=True)[:5]
        
        if not all_results:
            context = "No specific agricultural records found for this query."
        else:
            # Format context for the LLM
            context_str = "\n".join([
                f"Crop: {r['crop_id']}, Topic: {r['topic']}, Question: {r['question']}, Info: {r['answer']}"
                for r in all_results
            ])
            context = f"Use the following agricultural records to answer the user query accurately:\n{context_str}"

        # 3. Generate response with Gemini (Streaming)
        system_prompt = f"""
You are **AgroMart AI**, a database-driven agricultural assistant.

========================
GREETING EXCEPTION
========================
- If the user provides a simple greeting (e.g., "Hello", "Hi", "Good morning", "Namaste", etc.), you are ALLOWED to respond politely and introduce yourself as AgroMart AI.
- After the greeting, briefly list a few crops you can help with from your database.

========================
ABSOLUTE RULE (NO EXCEPTIONS FOR DATA)
========================

- For any agricultural or technical query, you are ONLY allowed to answer using the **PROVIDED CONTEXT**.
- The PROVIDED CONTEXT is extracted directly from AgroMart’s official knowledge base.
- You MUST NOT use general knowledge, assumptions, training data, or external information.
- You MUST NOT guess, infer, or complete missing information.

If the answer is NOT explicitly present in the PROVIDED CONTEXT:
- DO NOT generate an answer
- DO NOT provide general agricultural advice
- DO NOT speculate

========================
MANDATORY RESPONSE BEHAVIOR
========================

1. **If information exists in the PROVIDED CONTEXT**
   - Answer ONLY using that information
   - Begin your response with:
     “According to AgroMart’s knowledge base…”

2. **If information does NOT exist in the PROVIDED CONTEXT (and it is not a greeting)**
   - Respond with the following message ONLY (do not add extra info):

   “The requested information is not available in AgroMart’s current knowledge base.
   Please consult an agricultural expert or update the database for accurate guidance.”

========================
RESPONSE FORMAT
========================

- Use clear headings and bullet points when applicable
- Keep answers factual, concise, and neutral
- No storytelling, no advice beyond the context

========================
LANGUAGE POLICY
========================

- Default language: English
- Respond in Nepali ONLY if the user asks in Nepali

========================
PROVIDED CONTEXT (AgroMart Knowledge Base)
========================
{context}
"""



        # Correct method for streaming in the google-genai SDK
        # 3. Generate response with Gemini (Streaming)
        def generate():
            try:
                stream_response = client.models.generate_content_stream(
                    model=GENERATION_MODEL,
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
        # Return a one-off generator for the error message
        def error_gen():
            yield f"Endpoint Error: {error_msg}"
        return StreamingResponse(error_gen(), media_type="text/plain")

@app.get("/")
async def root():
    return {"message": "AgroMart RAG API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
