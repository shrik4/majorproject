import React, { useState, useEffect } from 'react';

interface QuestionPaper {
  filename: string;
}

const QuestionPaperAdmin: React.FC = () => {
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [updateFilename, setUpdateFilename] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:5002/api/question_papers';

  const fetchPapers = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPapers(data.map((filename: string) => ({ filename })));
    } catch (error) {
      console.error('Error fetching papers:', error);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleNewFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setNewFile(event.target.files[0]);
    }
  };

  const handleUpdateFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUpdateFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (newFile) {
      const formData = new FormData();
      formData.append('file', newFile);

      try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (response.ok) {
          console.log(result.message);
          fetchPapers();
          setNewFile(null);
        } else {
          console.error(result.error);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${filename}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
        fetchPapers();
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleUpdate = async (oldFilename: string) => {
    if (updateFile && updateFilename === oldFilename) {
      const formData = new FormData();
      formData.append('file', updateFile);

      try {
        const response = await fetch(`${API_BASE_URL}/update/${oldFilename}`, {
          method: 'PUT',
          body: formData,
        });
        const result = await response.json();
        if (response.ok) {
          console.log(result.message);
          fetchPapers();
          setUpdateFile(null);
          setUpdateFilename(null);
        } else {
          console.error(result.error);
        }
      } catch (error) {
        console.error('Error updating file:', error);
      }
    }
  };

  return (

      <div className="mb-4 flex items-center">
        <input type="file" onChange={handleNewFileChange} className="mr-2" />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!newFile}
        >
          Upload New Paper
        </button>
  
      <div>
        <h3 className="text-xl font-semibold mb-2">Existing Papers</h3>
        <ul>
          {papers.map((paper) => (
            <li key={paper.filename} className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2">
              <span>{paper.filename}</span>
              <div className="flex items-center">
                <input
                  type="file"
                  onChange={handleUpdateFileChange}
                  className="mr-2"
                  style={{ width: '150px' }} // Adjust width as needed
                />
                <button
                  onClick={() => {
                    setUpdateFilename(paper.filename);
                    // Trigger update logic when button is clicked and file is selected
                    if (updateFile && updateFilename === paper.filename) {
                      handleUpdate(paper.filename);
                    }
                  }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                  disabled={!updateFile || updateFilename !== paper.filename}
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(paper.filename)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QuestionPaperAdmin;