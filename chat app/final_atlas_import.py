import json
import pymongo
import os
from dotenv import load_dotenv
load_dotenv()

# MongoDB Atlas Connection String
CONNECTION_STRING = os.getenv("MONGO_URI")

if not CONNECTION_STRING:
    raise ValueError("MONGO_URI not found in environment variables")

# --- Analysis of Files to Import ---
# 1. vegetables.json: Contains 10 selected vegetables with 4 unique topics each.
# 2. fruits.json: Contains 10 selected fruits with 4 unique topics each.
FILES_TO_IMPORT = {
    "vegetables": "vegetables.json",
    "fruits": "fruits.json"
}

# --- Analysis of Files to Delete (Cleanup) ---
# These are temporary parts, old data collections, and redundant scripts.
FILES_TO_DELETE = [
    "d:/chat app/crops_data.json",
    "d:/chat app/veggies_part1.json",
    "d:/chat app/veggies_part2.json",
    "d:/chat app/fruits_part1.json",
    "d:/chat app/fruits_part2.json",
    "d:/chat app/final_import.py",
    "d:/chat app/final_import_script.py",
    "d:/chat app/db_import.py",
    "d:/chat app/generate_crops.py"
]

def perform_import():
    try:
        print("Connecting to MongoDB Atlas...")
        client = pymongo.MongoClient(CONNECTION_STRING)
        db = client.get_default_database() # Uses 'agromart_2' from the URI

        for collection_name, file_path in FILES_TO_IMPORT.items():
            if os.path.exists(file_path):
                print(f"Analyzing and importing: {file_path}")
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    
                    # Import into separate collection
                    collection = db[collection_name]
                    collection.delete_many({}) # Clear existing data
                    if data:
                        collection.insert_many(data)
                        print(f"Successfully imported {len(data)} records into collection: {collection_name}")
            else:
                print(f"Warning: File not found for import: {file_path}")

    except Exception as e:
        print(f"An error occurred during import: {e}")
    finally:
        if 'client' in locals():
            client.close()

def perform_cleanup():
    print("\nStarting Cleanup Analysis and Deletion...")
    for file_path in FILES_TO_DELETE:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"Deleted temporary file: {file_path}")
            except Exception as e:
                print(f"Failed to delete {file_path}: {e}")
        else:
            print(f"File already cleaned or not present: {file_path}")

if __name__ == "__main__":
    perform_import()
    perform_cleanup()
    print("\nProcess Complete.")
