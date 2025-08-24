import ollama
from chatbot.student_search import StudentSearch
from chatbot.faculty_search import FacultySearch
from chatbot.vector_db_manager import VectorDBManager
from chatbot.document_processor import DocumentProcessor
import os
import pandas as pd

class ChatbotCore:
    def __init__(self, student_csv_paths, faculty_csv_path, vector_db_path, question_papers_dir, model_path):
        self.student_search = StudentSearch(student_csv_paths)
        self.faculty_search = FacultySearch(faculty_csv_path)
        self.vector_db_manager = VectorDBManager(vector_db_path, model_path=model_path)
        self.document_processor = DocumentProcessor()
        self.question_papers_dir = question_papers_dir

        # Initialize Google's Generative AI
        import google.generativeai as genai
        from dotenv import load_dotenv
        import os

        # Load environment variables from both possible locations
        load_dotenv()  # Load from current directory
        load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))  # Load from parent directory

        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.gemini_model = genai.GenerativeModel('gemini-pro')

    def _get_ollama_response(self, prompt):
        try:
            response = ollama.chat(model=self.ollama_model, messages=[{'role': 'user', 'content': prompt}])
            return response['message']['content']
        except Exception as e:
            return f"Error communicating with Ollama: {e}. Please ensure Ollama is running and '{self.ollama_model}' model is downloaded."

    def is_general_knowledge_query(self, query):
        general_keywords = [
            "who", "what", "where", "when", "why", "how",
            "tell me about", "explain", "describe",
            "prime minister", "president", "country", "capital",
            "history", "science", "technology", "world"
        ]
        return any(keyword in query.lower() for keyword in general_keywords)

    def process_query(self, query):
        print(f"[DEBUG] ChatbotCore: Processing query: '{query}'")

        # Handle student search queries directly
        if query.lower().startswith("who is"):
            student_name = query.lower().replace("who is", "").strip()
            student_results = self.student_search.search_student(student_name)
            if student_results:
                if len(student_results) == 1:
                    student = student_results[0]
                    return f"Here is the student information:\nName: {student.get('Student Name', 'N/A')}\nUSN: {student.get('USN', 'N/A')}\nYear: {student.get('Year', 'N/A')}"
                else:
                    response = f"I found {len(student_results)} matching students:\n"
                    for student in student_results:
                        response += f"Name: {student.get('Student Name', 'N/A')}, USN: {student.get('USN', 'N/A')}, Year: {student.get('Year', 'N/A')}\n"
                    return response
        
        # Handle faculty search queries
        if "faculty" in query.lower() or "who is" in query.lower():
            faculty_name_query = query.lower().replace("who is", "").replace("faculty", "").strip()
            faculty_results = self.faculty_search.search_faculty(faculty_name_query)
            if faculty_results:
                if len(faculty_results) == 1:
                    faculty = faculty_results[0]
                    return f"Here is the faculty information:\nName: {faculty.get('Name', 'N/A')}\nDepartment: {faculty.get('Department', 'N/A')}\nEmail: {faculty.get('Email', 'N/A')}"
                else:
                    response = f"I found {len(faculty_results)} matching faculty members:\n"
                    for faculty in faculty_results:
                        response += f"Name: {faculty.get('Name', 'N/A')}, Department: {faculty.get('Department', 'N/A')}, Email: {faculty.get('Email', 'N/A')}\n"
                    return response
            else:
                return f"I couldn't find any faculty matching '{faculty_name_query}'. Please try a different name or keyword."

        # Check for greetings
        greetings = ["hi", "hello", "hey", "hii", "hola", "greetings"]
        if query.lower().strip() in greetings:
            return "Hello! I am your Campus Assistant. How can I help you today?"

                # Check for PDF download requests first
        download_keywords = ["download pdf", "get pdf", "download the pdf", "send me the pdf", "download"]
        for keyword in download_keywords:
            if keyword in query.lower():
                filename_query = query.lower().split(keyword)[1].strip()
                # Try to find a matching file
                for filename in os.listdir(self.question_papers_dir):
                    if filename_query in filename.lower():
                        # Return a dictionary to indicate a download action
                        return {"action": "download", "filename": filename}
                return "I couldn't find a PDF with that name."

        # For general knowledge questions, use Gemini
        if self.is_general_knowledge_query(query):
            try:
                # Use the already initialized model
                response = self.gemini_model.generate_content(query)
                if response and hasattr(response, 'text'):
                    return response.text.strip()
                else:
                    return "I couldn't process that question properly. Could you try rephrasing it?"
            except Exception as e:
                print(f"Error getting response from Gemini: {str(e)}")
                return "I encountered an error while processing your question. Please try asking it in a different way."
            
                return "I couldn't process that question properly. Could you try rephrasing it?"        # More intelligent student search
        search_query = query
        keywords = ["who is", "find student", "search for", "get details of", "find"]
        for keyword in keywords:
            if keyword in query.lower():
                # Extract the name after the keyword
                search_query = query.lower().split(keyword)[1].strip()
                break
        
        print(f"[DEBUG] ChatbotCore: Extracted student search query: '{search_query}'")
        student_results = self.student_search.search_student(search_query)
        print(f"[DEBUG] ChatbotCore: Student search results for '{search_query}': {student_results}")
        if student_results:
            if len(student_results) == 1:
                student = student_results[0]
                return f"Here is the student information:\nName: {student.get('Student Name', 'N/A')}\nUSN: {student.get('USN', 'N/A')}\nYear: {student.get('Year', 'N/A')}"
            else:
                response = f"I found {len(student_results)} matching students:\n"
                for student in student_results:
                    response += f"Name: {student.get('Student Name', 'N/A')}, USN: {student.get('USN', 'N/A')}, Year: {student.get('Year', 'N/A')}\n"
                return response
        else:
            return f"I couldn't find any student matching '{search_query}'. Please verify the USN or name and try again."

        # Year-based student search
        year_keywords = ["year students", "students in year", "in year", "year"]
        for keyword in year_keywords:
            if keyword in query.lower():
                year_query = query.lower().split(keyword)[0].strip()
                # Handle cases like "4th year" or "final year"
                year_query = year_query.replace("th", "").replace("rd", "").replace("nd", "").replace("st", "")
                year_results = self.student_search.search_students_by_year(year_query)
                if year_results:
                    response = f"I found {len(year_results)} students in {year_query} year:\n"
                    for student in year_results[:10]: # Limit to 10 results for brevity
                        response += f"Name: {student.get('Student Name', 'N/A')}, USN: {student.get('USN', 'N/A')}\n"
                    if len(year_results) > 10:
                        response += f"...and {len(year_results) - 10} more."
                    return response

        # PDF download request
        download_keywords = ["download pdf", "get pdf", "download the pdf", "send me the pdf", "download"]
        for keyword in download_keywords:
            if keyword in query.lower():
                filename_query = query.lower().split(keyword)[1].strip()
                # Try to find a matching file
                for filename in os.listdir(self.question_papers_dir):
                    if filename_query in filename.lower():
                        # Return a dictionary to indicate a download action
                        return {"action": "download", "filename": filename}
                return "I couldn't find a PDF with that name."

    def _update_vector_db_from_docs(self):
        print("[DEBUG] ChatbotCore: Updating vector DB from documents.")
        current_docs_in_db = {doc[0] for doc in self.vector_db_manager.documents}
        print(f"[DEBUG] ChatbotCore: Current documents in DB: {current_docs_in_db}")
        
        for filename in os.listdir(self.question_papers_dir):
            file_extension = os.path.splitext(filename)[1].lower()
            if file_extension in {'.pdf', '.txt'}:
                doc_path = os.path.join(self.question_papers_dir, filename)
                if doc_path not in current_docs_in_db:
                    print(f"[DEBUG] ChatbotCore: Indexing new document: {doc_path}")
                    text_content = self.document_processor.extract_text(doc_path)
                    if text_content:
                        self.vector_db_manager.add_document(doc_path, text_content)
                        print(f"[DEBUG] ChatbotCore: Added {doc_path} to vector DB.")
                    else:
                        print(f"[WARNING] ChatbotCore: No text extracted from {doc_path}. Not adding to DB.")
        
        # Remove documents from DB that no longer exist in the directory
        docs_on_disk = {os.path.join(self.question_papers_dir, f) for f in os.listdir(self.question_papers_dir) if os.path.splitext(f)[1].lower() in {'.pdf', '.txt'}}
        for db_doc_path, _ in list(self.vector_db_manager.documents): # Iterate over a copy
            if db_doc_path not in docs_on_disk:
                print(f"[DEBUG] ChatbotCore: Removing deleted document from DB: {db_doc_path}")
                self.vector_db_manager.delete_document(db_doc_path)

    def add_question_paper(self, file_path):
        print(f"[DEBUG] ChatbotCore: Attempting to add question paper: {file_path}")
        text_content = self.document_processor.extract_text(file_path)
        if text_content:
            self.vector_db_manager.add_document(file_path, text_content)
            print(f"[DEBUG] ChatbotCore: Successfully added {file_path} to vector DB.")
            return True
        print(f"[WARNING] ChatbotCore: Failed to add {file_path} to vector DB (no text extracted).")
        return False

    def delete_question_paper(self, file_path):
        print(f"[DEBUG] ChatbotCore: Attempting to delete question paper: {file_path}")
        self.vector_db_manager.delete_document(file_path)
        print(f"[DEBUG] ChatbotCore: Successfully deleted {file_path} from vector DB.")
        return True

    def update_question_paper(self, old_file_path, new_file_path):
        print(f"[DEBUG] ChatbotCore: Attempting to update question paper from {old_file_path} to {new_file_path}")
        # First, delete the old document from the vector DB
        self.delete_question_paper(old_file_path)
        # Then, add the new document
        return self.add_question_paper(new_file_path)

    def delete_question_paper(self, file_path):
        self.vector_db_manager.delete_document(file_path)
        return True

if __name__ == '__main__':
    # Ensure Ollama is running and Mistral model is pulled: ollama run mistral
    
    student_csv = r'd:/Desktop/major project ui/campus-navigation-navigator/campus_chatbot/student_data/Combined_Student_List.csv'
    faculty_csv = r'd:/Desktop/major project ui/campus-navigation-navigator/campus_chatbot/student_data/uploads/faculty_data_updated.csv'
    vector_db_path = r'd:/Desktop/major project ui/campus-navigation-navigator/campus_chatbot/vector_db'
    question_papers_dir = r'd:/Desktop/major project ui/campus-navigation-navigator/campus_chatbot/question_papers'
    model_path = r'd:/Desktop/major project ui/campus-navigation-navigator/campus_chatbot/models/all-MiniLM-L6-v2'


    # Create a dummy PDF for testing if it doesn't exist
    dummy_pdf_path = os.path.join(question_papers_dir, 'dummy.pdf')
    if not os.path.exists(dummy_pdf_path):
        try:
            import fitz
            doc = fitz.open()
            page = doc.new_page()
            page.insert_text((72, 72), "This is a dummy PDF for testing purposes. It talks about computer science fundamentals.")
            doc.save(dummy_pdf_path)
            doc.close()
            print(f"Created dummy PDF at {dummy_pdf_path}")
        except Exception as e:
            print(f"Error creating dummy PDF: {e}")

    chatbot = ChatbotCore([student_csv], faculty_csv, vector_db_path, question_papers_dir, model_path)

    print("\n--- Chatbot Test ---")
    print("Query: Who is John Doe?")
    print(chatbot.process_query("Who is John Doe?"))

    print("\nQuery: who is dr. amit joshi?")
    print(chatbot.process_query("who is dr. amit joshi?"))

    print("\nQuery: Tell me about computer science fundamentals from question papers.")
    print(chatbot.process_query("Tell me about computer science fundamentals from question papers."))

    print("\nQuery: What is the capital of France?")
    print(chatbot.process_query("What is the capital of France?"))

    # Test adding a new paper
    new_dummy_pdf_path = os.path.join(question_papers_dir, 'new_dummy.pdf')
    if not os.path.exists(new_dummy_pdf_path):
        try:
            import fitz
            doc = fitz.open()
            page = doc.new_page()
            page.insert_text((72, 72), "This is a new dummy PDF about advanced mathematics.")
            doc.save(new_dummy_pdf_path)
            doc.close()
            print(f"Created new dummy PDF at {new_dummy_pdf_path}")
        except Exception as e:
            print(f"Error creating new dummy PDF: {e}")

    print(f"\nAdding new question paper: {new_dummy_pdf_path}")
    chatbot.add_question_paper(new_dummy_pdf_path)
    print("Query: Tell me about advanced mathematics.")
    print(chatbot.process_query("Tell me about advanced mathematics."))

    # Test deleting a paper
    print(f"\nDeleting question paper: {new_dummy_pdf_path}")
    chatbot.delete_question_paper(new_dummy_pdf_path)
    print("Query: Tell me about advanced mathematics.")
    print(chatbot.process_query("Tell me about advanced mathematics."))
