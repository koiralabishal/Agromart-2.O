import os
import json
from google import genai
from pymongo import MongoClient

# Configuration
MONGO_URI = "mongodb+srv://koiralabishal:koiralabishal123@cluster0.iph69.mongodb.net/agromart_2"
API_KEY = "AIzaSyAYnBKyUQwvv2E3z1PFXc-FL3ftPHzP-V4"

client = genai.Client(api_key=API_KEY)
collection_names = ["vegetables", "fruits"]

def get_embedding(text):
    """Generates embedding for the given text using the GenAI SDK."""
    response = client.models.embed_content(
        model="text-embedding-004", # Latest embedding model
        contents=text
    )
    return response.embeddings[0].values

def embed_collections():
    try:
        mongo_client = MongoClient(MONGO_URI)
        db = mongo_client.get_default_database()

        for coll_name in collection_names:
            print(f"Processing collection: {coll_name}")
            collection = db[coll_name]
            cursor = collection.find({})
            
            for doc in cursor:
                # Combine question and answer for better semantic representation
                full_text = f"Question: {doc['question']} Answer: {doc['answer']}"
                
                print(f"Generating embedding for doc ID: {doc['_id']}")
                embedding = get_embedding(full_text)
                
                # Update document with embedding field
                collection.update_one(
                    {"_id": doc["_id"]},
                    {"$set": {"embedding": embedding}}
                )
            
            print(f"Finished embedding collection: {coll_name}")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if 'mongo_client' in locals():
            mongo_client.close()

if __name__ == "__main__":
    # Check if API Key is available
    if not os.getenv("GEMINI_API_KEY") and not hasattr(client, 'api_key'):
         print("WARNING: GEMINI_API_KEY environment variable is not set. The script may fail.")
    
    embed_collections()
