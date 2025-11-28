import os
import uuid
import json
import shutil
import re
from typing import List, Optional

# FastAPI for creating the API
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Data handling and vector processing
import pandas as pd
import numpy as np
import faiss

# For loading environment variables, embedding models, and API requests
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import requests
from requests.utils import get_environ_proxies
import google.generativeai as genai

# --- 1. CONFIGURATION & INITIALIZATION ---

load_dotenv()

# --- Use the Gemini API Key ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY is not set in the .env file.")

# --- Use the Serper API Key ---
SERPER_API_KEY = os.getenv("SERPER_API_KEY")
if not SERPER_API_KEY:
    raise RuntimeError("❌ SERPER_API_KEY is not set in the .env file.")

STORE_DIR = "data_store"
os.makedirs(STORE_DIR, exist_ok=True)
INDEX_PATH = os.path.join(STORE_DIR, "vector_index.faiss")
METADATA_PATH = os.path.join(STORE_DIR, "metadata.json")

app = FastAPI(title="📄 Yenepoya Campus Chat API")

origins = [
    "http://localhost:8081",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. GLOBAL VARIABLES & MODELS ---

embed_model = None
index = None
metadata = []
EMBEDDING_DIM = 384
USN_PATTERN = re.compile(r'\b4DM\d{2}[A-Z]{2}\d{3}\b', re.IGNORECASE)
FILTER_PATTERN = re.compile(r'\b(list|show|get)\s+(all|every)\b.*\b(final|third|second|first)\s+year\b', re.IGNORECASE)


# --- 3. PYDANTIC MODELS ---

class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    top_k: int = 5

class ChatResponse(BaseModel):
    session_id: str
    answer: str
    source_documents: List[dict]

# --- 4. CORE FUNCTIONS ---

def load_models_and_index():
    global embed_model, EMBEDDING_DIM, index, metadata
    print("Loading embedding model...")
    embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    EMBEDDING_DIM = embed_model.get_sentence_embedding_dimension()
    print(f"✅ Embedding model loaded (Dimension: {EMBEDDING_DIM}).")

    if os.path.exists(INDEX_PATH) and os.path.exists(METADATA_PATH):
        print("Loading existing FAISS index and metadata...")
        index = faiss.read_index(INDEX_PATH)
        with open(METADATA_PATH, "r") as f:
            metadata = json.load(f)
        print(f"✅ Index loaded with {len(metadata)} documents.")
    else:
        print("No index found. Creating a new one.")
        index = faiss.IndexFlatIP(EMBEDDING_DIM)
        metadata = []
        print("✅ New empty index created.")

def save_index():
    faiss.write_index(index, INDEX_PATH)
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f)
    print(f"💾 Index and metadata saved with {len(metadata)} documents.")

def normalize_vectors(vectors: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    return np.divide(vectors, norms, where=norms != 0)

def filter_students_by_year(year: str) -> List[dict]:
    print(f"🔍 Performing direct filter for year: {year}")
    year_query = f"year: {year}".lower()
    results = [doc for doc in metadata if year_query in doc.get("text", "").lower()]
    return results

def find_student_by_usn(usn: str) -> List[dict]:
    print(f"🔍 Performing direct lookup for USN: {usn}")
    usn_query = usn.lower()
    results = [doc for doc in metadata if f"usn: {usn_query}" in doc.get("text", "").lower()]
    return results

def search_for_question_papers(subject: str) -> str:
    """Searches for question papers using the simple and reliable Serper API."""
    url = "https://google.serper.dev/search"
    payload = json.dumps({"q": f"VTU {subject} question paper filetype:pdf"})
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }

    try:
        proxies = get_environ_proxies(url)
        if proxies:
            print(f"🌐 Detected system proxies: {proxies}")
            
        response = requests.post(url, headers=headers, data=payload, proxies=proxies, timeout=20)
        response.raise_for_status()
        data = response.json()

        if "organic" in data and data["organic"]:
            links = []
            for item in data["organic"][:5]: # Get top 5 results
                title = item.get("title", "No Title")
                link = item.get("link", "#")
                links.append(f"* **{title}**: [Link]({link})")
            return "Here are some links I found:\n" + "\n".join(links)
        else:
            return "I couldn't find any direct links for that subject, but you can try searching on the official VTU website."

    except requests.exceptions.RequestException as e:
        print(f"Error calling Serper API: {e}")
        return f"API_ERROR: The search request failed. Details: {e}"

def get_llm_response(prompt: str) -> str:
    """Gets a response from the Google Gemini API for RAG questions."""
    try:
        # Using a stable, version-aliased model name to avoid errors
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return f"API_ERROR: The request to Gemini API failed. Details: {e}"

# --- 5. FASTAPI LIFECYCLE & ENDPOINTS ---

@app.on_event("startup")
async def startup_event():
    # Configure Gemini API on startup
    genai.configure(api_key=GEMINI_API_KEY)
    load_models_and_index()

@app.get("/")
def get_status():
    return {
        "status": "online",
        "message": "Welcome to the Yenepoya Chatbot API!",
        "indexed_documents": len(metadata)
    }

@app.post("/upload-csv/")
async def upload_and_index_csv(file: UploadFile = File(...)):
    global index, metadata
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")
    temp_path = os.path.join(STORE_DIR, f"temp_{file.filename}")
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        df = pd.read_csv(temp_path, dtype=str).fillna("")
        documents_for_embedding, new_metadata_entries = [], []
        for idx, row in df.iterrows():
            embedding_text = " ".join(str(val) for val in row.values if val)
            display_text = " | ".join(f"{col}: {val}" for col, val in row.items())
            documents_for_embedding.append(embedding_text)
            new_metadata_entries.append({"source": file.filename, "row": idx, "text": display_text})
        if not documents_for_embedding:
            return {"message": "CSV file is empty."}
        new_embeddings = embed_model.encode(documents_for_embedding, convert_to_numpy=True, show_progress_bar=True)
        new_embeddings = normalize_vectors(new_embeddings)
        index.add(new_embeddings.astype(np.float32))
        metadata.extend(new_metadata_entries)
        save_index()
        return {"message": f"Successfully indexed {len(documents_for_embedding)} rows."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/chat/", response_model=ChatResponse)
def chat_with_csv(request: ChatRequest):
    question = request.question.strip()
    session_id = request.session_id or str(uuid.uuid4())
    final_answer = ""
    source_docs = []
    retrieved_docs = []

    usn_match = USN_PATTERN.search(question)
    filter_match = FILTER_PATTERN.search(question)
    
    # --- NEW: GREETING MESSAGE LOGIC ---
    # Check if the user's question is a simple greeting
    if question.lower() in ["hi", "hello", "hey", "hello there", "greetings"]:
        final_answer = (
            "Welcome to the Yenepoya Chatbot!👋\n\n"
            "I'm here to help you with information about students, faculty, and more. Here are a few things you can ask me:\n\n"
            "🔹 Find a specific student:'What are the details for USN 4DM21AI001?'\n"
            "🔹 List students by year: 'Show me all the final year students.'\n"
            "🔹 Find VTU question papers: 'I need the question paper for DSA.'\n\n"
            "How can I assist you today?"
        )
    
    elif "question paper" in question.lower() or "exam paper" in question.lower():
        print("🌐 Activating Google Search Tool via Serper...")
        subject = question.lower().replace("question paper of", "").replace("exam paper of", "").replace("question paper", "").replace("exam paper", "").replace("i need", "").strip()
        if not subject:
            final_answer = "Please tell me which subject's question paper you are looking for."
        else:
            final_answer = search_for_question_papers(subject)

    elif usn_match:
        print("🆔 Activating USN Lookup Tool...")
        retrieved_docs = find_student_by_usn(usn_match.group(0))

    elif filter_match:
        print("📋 Activating Data Filter Tool...")
        year = filter_match.group(3) + " year"
        retrieved_docs = filter_students_by_year(year)

    else:
        print("🧠 Defaulting to Vector Search Tool...")
        if index is None or index.ntotal == 0:
             final_answer = "I'm sorry, but no data has been uploaded yet. Please upload a CSV file with student or faculty information first."
        else:
            question_embedding = embed_model.encode([request.question], convert_to_numpy=True)
            question_embedding = normalize_vectors(question_embedding).astype(np.float32)
            top_k = min(request.top_k, index.ntotal)
            _, I = index.search(question_embedding, top_k)
            retrieved_docs = [metadata[i] for i in I[0]]

    source_docs = retrieved_docs

    if not final_answer:
        if not retrieved_docs:
            final_answer = "I could not find any relevant information to answer your question. Please try asking in a different way."
        else:
            context_str = "\n".join([doc['text'] for doc in retrieved_docs])
            prompt_with_context = f"""
            You are a helpful assistant for Yenepoya Institute of Technology.
            Answer the user's question based only on the CONTEXT provided below.
            If the context contains a list of items (like students), list them all clearly without omitting any.

            CONTEXT:
            ---
            {context_str}
            ---
            USER'S QUESTION: {question}
            ---
            Answer:
            """
            final_answer = get_llm_response(prompt_with_context)

    if final_answer.startswith("API_ERROR:"):
        final_answer = f"There was a problem connecting to the AI model. Please check the API key and network connection.\n\nDetails: {final_answer}"

    return ChatResponse(session_id=session_id, answer=final_answer.strip(), source_documents=source_docs)

@app.post("/clear-index/")
def clear_index():
    global index, metadata
    index = faiss.IndexFlatIP(EMBEDDING_DIM)
    metadata = []
    save_index()
    print("🗑️ Index has been cleared.")
    return {"message": "Index cleared successfully."}