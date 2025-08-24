import fitz  # PyMuPDF

class PDFProcessor:
    def extract_text(self, pdf_path):
        text = ""
        try:
            doc = fitz.open(pdf_path)
            for page_num in range(doc.page_count):
                page = doc.load_page(page_num)
                text += page.get_text()
            doc.close()
        except Exception as e:
            print(f"Error extracting text from {pdf_path}: {e}")
        return text

if __name__ == '__main__':
    # Example usage (you'll need a dummy PDF for this to work)
    pdf_processor = PDFProcessor()
    dummy_pdf_path = 'd:\Desktop\major project ui\campus-navigation-navigator\campus_chatbot\question_papers\dummy.pdf'
    
    # Create a dummy PDF for testing
    try:
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((72, 72), "This is a dummy PDF for testing purposes.")
        doc.save(dummy_pdf_path)
        doc.close()
        print(f"Created dummy PDF at {dummy_pdf_path}")
    except Exception as e:
        print(f"Error creating dummy PDF: {e}")

    extracted_text = pdf_processor.extract_text(dummy_pdf_path)
    print(f"\nExtracted text from dummy.pdf:\n{extracted_text}")
