import pandas as pd
import os

class StudentSearch:
    def __init__(self, csv_paths):
        self.df = pd.DataFrame()
        for csv_path in csv_paths:
            try:
                temp_df = pd.read_csv(csv_path, sep=',', engine='python', on_bad_lines='skip')
                self.df = pd.concat([self.df, temp_df], ignore_index=True)
                print(f"[DEBUG] Loaded {csv_path}. Total rows: {len(self.df)}")
            except Exception as e:
                print(f"Error loading {csv_path}: {e}")
            print(f"[DEBUG] DataFrame loaded. Is empty: {self.df.empty}")
            # Normalize data for searching
            if not self.df.empty:
                self.df['USN_lower'] = self.df['USN'].astype(str).str.strip().str.lower()
                self.df['Name_lower'] = self.df['Student Name'].astype(str).str.strip().str.lower()
                print(f"[DEBUG] Normalized USN_lower head:\n{self.df['USN_lower'].head()}")
                print(f"[DEBUG] Normalized Name_lower head:\n{self.df['Name_lower'].head()}")


    def search_student(self, query):
        original_query = query
        query = query.strip().lower()
        print(f"[DEBUG] Searching for normalized query: '{query}' (original: '{original_query}')")
        
        if not self.df.empty:
            # First try exact USN match
            exact_usn_match = self.df[self.df['USN_lower'] == query]
            if not exact_usn_match.empty:
                return exact_usn_match.drop(columns=['USN_lower', 'Name_lower']).to_dict(orient='records')
            
            # Then try contains for both USN and name
            matches = self.df[
                (self.df['USN_lower'].str.contains(query, na=False, case=False, regex=False)) |
                (self.df['Name_lower'].str.contains(query, na=False, case=False, regex=False))
            ]
            
            if not matches.empty:
                return matches.drop(columns=['USN_lower', 'Name_lower']).to_dict(orient='records')
            else:
                print(f"[DEBUG] No matches found for query: {query}")
                return []
        else:
            print("[DEBUG] DataFrame is empty")
            return []

    def search_students_by_year(self, year_query):
        year_query = year_query.strip().lower()
        print(f"[DEBUG] Searching for students in year: '{year_query}'")
        results = []
        if not self.df.empty:
            # Normalize year query to match CSV values
            year_map = {
                "1st": "first year", "first": "first year",
                "2nd": "second year", "second": "second year",
                "3rd": "third year", "third": "third year",
                "4th": "final year", "final": "final year"
            }
            normalized_year = year_map.get(year_query, year_query)

            matches = self.df[self.df['Year'].str.lower().str.contains(normalized_year, na=False)]
            print(f"[DEBUG] Year matches found:\n{matches}")
            if not matches.empty:
                results = matches.drop(columns=['USN_lower', 'Name_lower']).to_dict(orient='records')
        print(f"[DEBUG] Year search results: {results}")
        return results


if __name__ == '__main__':
    # Example usage
    # Assuming you have multiple CSVs in the student_data directory
    base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    student_data_dir = os.path.join(base_dir, 'student_data')
    student_csv_files = [os.path.join(student_data_dir, f) for f in os.listdir(student_data_dir) if f.endswith('.csv')]
    student_db = StudentSearch(student_csv_files)
    
    print("Searching for 'John':")
    print(student_db.search_student('John'))

    print("\nSearching for 'CS':")
    print(student_db.search_student('CS'))

    print("\nSearching for '1PI18IS002':")
    print(student_db.search_student('1PI18IS002'))
