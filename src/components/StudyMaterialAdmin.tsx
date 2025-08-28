import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface Folder {
  id: number;
  name: string;
  description: string;
}

interface FileItem {
  id: number;
  folder_id: number;
  filename: string;
  orig_name: string;
  size: number;
  uploaded_at: string;
}

const StudyMaterialAdmin: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5005/api'; // Study Material Backend API URL

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      fetchFiles(selectedFolder.id);
    } else {
      setFiles([]);
    }
  }, [selectedFolder]);

  const handleDeleteFolder = async (folderId: number) => {
    if (!window.confirm('Are you sure you want to delete this folder? All files inside will be deleted.')) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/folders/${folderId}`);
      toast.success('Folder deleted successfully!');
      setSelectedFolder(null);
      fetchFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (folderName: string, filename: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/files/${folderName}/${filename}`);
      toast.success('File deleted successfully!');
      if (selectedFolder) {
        fetchFiles(selectedFolder.id);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Folder[]>(`${API_BASE_URL}/folders`);
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to fetch folders.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty.');
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/folders`, {
        name: newFolderName,
        description: newFolderDescription,
      });
      setNewFolderName('');
      setNewFolderDescription('');
      fetchFolders();
      toast.success('Folder created successfully!');
    } catch (error: any) {
      console.error('Error creating folder:', error);
      toast.error(error.response?.data?.detail || 'Error creating folder. It might already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiles = async (folderId: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get<FileItem[]>(`${API_BASE_URL}/folders/${folderId}/files`);
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedFolder) {
      toast.error('Please select a file and a folder.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('folder_name', selectedFolder.name);

    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('File uploaded successfully!');
      setSelectedFile(null);
      fetchFiles(selectedFolder.id); // Refresh files for the current folder
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.detail || 'Error uploading file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDownload = (folderName: string, filename: string, origName: string) => {
    const downloadUrl = `${API_BASE_URL}/files/${folderName}/${filename}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', origName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Downloading file...');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-green-700">Study Material Management</h2>
      <p className="text-gray-600 mb-4">Upload, organize, and update study materials. Categorize content, manage versions and access permissions.</p>

      {/* Create New Folder */}
      <div className="mb-6 p-4 border rounded-md bg-gray-50">
        <h3 className="text-lg font-medium mb-2">Create New Folder</h3>
        <input
          type="text"
          placeholder="Folder Name"
          className="border p-2 rounded-md w-full mb-2"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          disabled={isLoading}
        />
        <textarea
          placeholder="Folder Description (optional)"
          className="border p-2 rounded-md w-full mb-2"
          rows={2}
          value={newFolderDescription}
          onChange={(e) => setNewFolderDescription(e.target.value)}
          disabled={isLoading}
        ></textarea>
        <button
          onClick={handleCreateFolder}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Folder'}
        </button>
      </div>

      {/* Folder List */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Existing Folders</h3>
        <select
          className="border p-2 rounded-md w-full mb-2"
          onChange={(e) => {
            const folderId = parseInt(e.target.value);
            const folder = folders.find(f => f.id === folderId);
            setSelectedFolder(folder || null);
          }}
          value={selectedFolder?.id || ''}
          disabled={isLoading}
        >
          <option value="">Select a Folder</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name} {folder.description ? `(${folder.description})` : ''}
            </option>
          ))}
        </select>
        <div className="mt-2">
          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center justify-between p-2 border-b">
              <div>
                <h4 className="font-medium">{folder.name}</h4>
                {folder.description && <p className="text-sm text-gray-500">{folder.description}</p>}
              </div>
              <button
                onClick={() => handleDeleteFolder(folder.id)}
                className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* File Upload */}
      {selectedFolder && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-2">Upload File to {selectedFolder.name}</h3>
          <input
            type="file"
            className="border p-2 rounded-md w-full mb-2"
            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
            disabled={isLoading}
          />
          <button
            onClick={handleFileUpload}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      )}

      {/* Files in Selected Folder */}
      {selectedFolder && files.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Files in {selectedFolder.name}</h3>
          <ul className="border rounded-md p-4">
            {files.map((file) => (
              <li key={file.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <span>{file.orig_name} ({Math.round(file.size / 1024)} KB)</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFileDownload(selectedFolder.name, file.filename, file.orig_name)}
                    className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-600 transition-colors"
                    disabled={isLoading}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDeleteFile(selectedFolder.name, file.filename)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedFolder && files.length === 0 && (
        <p className="text-gray-500">No files in this folder.</p>
      )}
    </div>
  );
};

export default StudyMaterialAdmin;