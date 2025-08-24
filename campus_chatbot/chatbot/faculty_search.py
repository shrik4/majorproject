import pandas as pd

class FacultySearch:
    def __init__(self, csv_path):
        try:
            self.df = pd.read_csv(csv_path)
            # Normalize data for searching
            self.df['Name_lower'] = self.df['Name'].str.lower()
        except FileNotFoundError:
            self.df = pd.DataFrame()

    def search_faculty(self, query):
        query = query.strip().lower()
        if not self.df.empty:
            matches = self.df[self.df['Name_lower'].str.contains(query, na=False)]
            return matches.drop(columns=['Name_lower']).to_dict(orient='records')
        return []
