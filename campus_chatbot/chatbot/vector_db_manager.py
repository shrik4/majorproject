import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

class VectorDBManager:
    def __init__(self, db_path, model_path='./models/all-MiniLM-L6-v2'):
        self.db_path = db_path
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"SentenceTransformer model not found at {model_path}. Please download it and place it in the correct directory.")
        self.model = SentenceTransformer(model_path)
        self.index = None
        self.documents = []  # Stores (doc_path, text_content)
        print(f"[DEBUG] VectorDBManager: Initializing. DB Path: {self.db_path}")
        self.load_db()

    def _get_embedding(self, text):
        return self.model.encode(text, convert_to_tensor=False)

    def add_document(self, doc_path, text_content):
        print(f"[DEBUG] VectorDBManager: Adding document: {doc_path}")
        embedding = self._get_embedding(text_content)
        if self.index is None:
            self.index = faiss.IndexFlatL2(embedding.shape[0])
            print(f"[DEBUG] VectorDBManager: Initialized new FAISS index.")
        self.index.add(np.array([embedding], dtype=np.float32))
        self.documents.append((doc_path, text_content))
        self.save_db()
        print(f"[DEBUG] VectorDBManager: Document {doc_path} added and DB saved. Total documents: {len(self.documents)}")

    def search_documents(self, query, k=5):
        print(f"[DEBUG] VectorDBManager: Searching documents for query: '{query}'")
        if self.index is None or self.index.ntotal == 0:
            print("[DEBUG] VectorDBManager: Index is empty. Returning empty results.")
            return []
        query_embedding = self._get_embedding(query)
        D, I = self.index.search(np.array([query_embedding], dtype=np.float32), k)
        results = [self.documents[i] for i in I[0] if i != -1 and i < len(self.documents)]
        print(f"[DEBUG] VectorDBManager: Search found {len(results)} results.")
        return results

    def save_db(self):
        print(f"[DEBUG] VectorDBManager: Saving DB to {self.db_path}")
        os.makedirs(self.db_path, exist_ok=True)
        if self.index:
            faiss.write_index(self.index, os.path.join(self.db_path, 'faiss.index'))
            print("[DEBUG] VectorDBManager: FAISS index saved.")
        with open(os.path.join(self.db_path, 'documents.txt'), 'w', encoding='utf-8') as f:
            for doc_path, text_content in self.documents:
                f.write(f"{doc_path.replace('\n', ' ')}\n{text_content.replace('\n', ' ')}\n---\n")
        print("[DEBUG] VectorDBManager: Document metadata saved.")

    def load_db(self):
        print(f"[DEBUG] VectorDBManager: Loading DB from {self.db_path}")
        index_path = os.path.join(self.db_path, 'faiss.index')
        docs_path = os.path.join(self.db_path, 'documents.txt')

        if os.path.exists(index_path):
            self.index = faiss.read_index(index_path)
            print("[DEBUG] VectorDBManager: FAISS index loaded.")
        
        if os.path.exists(docs_path):
            self.documents = []
            with open(docs_path, 'r', encoding='utf-8') as f:
                content = f.read().split('---\n')
                for entry in filter(None, content):
                    parts = entry.strip().split('\n', 1)
                    if len(parts) == 2:
                        self.documents.append(tuple(parts))
            print(f"[DEBUG] VectorDBManager: Loaded {len(self.documents)} documents.")

    def delete_document(self, doc_path):
        print(f"[DEBUG] VectorDBManager: Deleting document: {doc_path}")
        doc_index = next((i for i, doc in enumerate(self.documents) if doc[0] == doc_path), None)
        
        if doc_index is not None:
            self.documents.pop(doc_index)
            self.index.remove_ids(np.array([doc_index], dtype=np.int64))
            self.save_db()
            print(f"[DEBUG] VectorDBManager: Document {doc_path} deleted and DB updated.")
        else:
            print(f"[WARNING] VectorDBManager: Document {doc_path} not found for deletion.")



if __name__ == '__main__':
    db_manager = VectorDBManager(r'd:/Desktop/major project ui/campus-navigation-navigator/campus_chatbot/vector_db')
    pdf_processor = PDFProcessor()

    # Example: Add a dummy PDF to the DB
    dummy_pdf_path = r'd:/Desktop/major project ui/campus-navigation-navigator/campus_chatbot/question_papers/dummy.pdf'
    dummy_text = pdf_processor.extract_text(dummy_pdf_path)
    if dummy_text:
        db_manager.add_document(dummy_pdf_path, dummy_text)
        print(f"Added {dummy_pdf_path} to vector DB.")

    # Example: Search
    search_query = "testing purposes"
    results = db_manager.search_documents(search_query)
    print(f"\nSearch results for '{search_query}':")
    for path, content in results:
        print(f"  File: {path}\n  Content snippet: {content[:100]}...")

    # Example: Update a document
    updated_text = "This is the updated content for the dummy PDF. It now contains new information."
    db_manager.update_document(dummy_pdf_path, updated_text)
    print(f"\nUpdated {dummy_pdf_path} in vector DB.")
    results_after_update = db_manager.search_documents("new information")
    print(f"\nSearch results for 'new information' after update:")
    for path, content in results_after_update:
        print(f"  File: {path}\n  Content snippet: {content[:100]}...")

    # Example: Delete a document
    db_manager.delete_document(dummy_pdf_path)
    print(f"\nDeleted {dummy_pdf_path} from vector DB.")
    results_after_delete = db_manager.search_documents("testing purposes")
    print(f"\nSearch results for 'testing purposes' after delete:")
    if not results_after_delete:
        print("  No results found (document deleted).")
