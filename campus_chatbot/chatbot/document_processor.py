import fitz  # PyMuPDF
import os

class DocumentProcessor:
    def extract_text(self, file_path):
        text = ""
        file_extension = os.path.splitext(file_path)[1].lower()
        print(f"[DEBUG] DocumentProcessor: Attempting to extract text from {file_path} (extension: {file_extension})")

        if file_extension == '.pdf':
            try:
                doc = fitz.open(file_path)
                for page_num in range(doc.page_count):
                    page = doc.load_page(page_num)
                    text += page.get_text()
                doc.close()
                print(f"[DEBUG] DocumentProcessor: Successfully extracted text from PDF. Length: {len(text)}")
            except Exception as e:
                print(f"[ERROR] DocumentProcessor: Error extracting text from PDF {file_path}: {e}")
        elif file_extension == '.txt':
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
                print(f"[DEBUG] DocumentProcessor: Successfully extracted text from TXT. Length: {len(text)}")
            except Exception as e:
                print(f"[ERROR] DocumentProcessor: Error extracting text from TXT {file_path}: {e}")
        else:
            print(f"[WARNING] DocumentProcessor: Unsupported file type: {file_extension} for {file_path}")
        return text

if __name__ == '__main__':
    # Example usage (you'll need a dummy PDF and TXT for this to work)
    doc_processor = DocumentProcessor()
    
    # Create a dummy PDF for testing
    dummy_pdf_path = 'd:/Desktop/major project ui/campus-navigation-navigator/campus_chatbot/question_papers/dummy.pdf'
    try:
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((72, 72), "This is a dummy PDF for testing purposes.")
        doc.save(dummy_pdf_path)
        doc.close()
        print(f"Created dummy PDF at {dummy_pdf_path}")
    except Exception as e:
        print(f"Error creating dummy PDF: {e}")

    extracted_pdf_text = doc_processor.extract_text(dummy_pdf_path)
    print(f"\nExtracted text from dummy.pdf:\n{extracted_pdf_text}")

    # Create a dummy TXT for testing
    dummy_txt_path = 'd:/Desktop/major project ui/campus-navigation-navigator/campus_chatbot/question_papers/dummy.txt'
    try:
        with open(dummy_txt_path, 'w', encoding='utf-8') as f:
            f.write("This is a dummy TXT file for testing purposes. It contains some plain text.")
        print(f"Created dummy TXT at {dummy_txt_path}")
    except Exception as e:
            print(f"Error creating dummy TXT: {e}")

    extracted_txt_text = doc_processor.extract_text(dummy_txt_path)
    print(f"\nExtracted text from dummy.txt:\n{extracted_txt_text}")

