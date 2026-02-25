from pymongo import MongoClient
import time

import os
from dotenv import load_dotenv
load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI")
db_name = "agromart_2"

if not MONGO_URI:
    raise ValueError("MONGO_URI not found in environment variables")

# Vector Search Index Definition
index_definition = {
    "name": "vector_index",
    "type": "vectorSearch",
    "definition": {
        "fields": [
            {
                "type": "vector",
                "path": "embedding",
                "numDimensions": 768,
                "similarity": "cosine"
            }
        ]
    }
}

def create_vector_indices():
    try:
        client = MongoClient(MONGO_URI)
        db = client[db_name]
        
        for coll_name in ["vegetables", "fruits"]:
            print(f"Creating vector search index for: {coll_name}")
            collection = db[coll_name]
            
            # Using the search_index creation method (Atlas Search/Vector Search)
            try:
                result = collection.create_search_index(model=index_definition)
                print(f"Index creation started for {coll_name}: {result}")
            except Exception as inner_e:
                print(f"Failed to create index via pymongo for {coll_name}. You may need to create it manually in the Atlas UI.")
                print(f"Error: {inner_e}")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    create_vector_indices()
