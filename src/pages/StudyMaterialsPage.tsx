import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import AuthCheck from '@/components/AuthCheck';
import { toast } from 'sonner';
import { Folder, Download } from 'lucide-react';

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

const StudyMaterialsPage: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5005/api';

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

  const handleFileDownload = async (folderName: string, filename: string, origName: string) => {
    try {
      const downloadUrl = `${API_BASE_URL}/files/${folderName}/${filename}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', origName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.info('Downloading file...');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file.');
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Study Materials</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Folders Column */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Folders</h2>
              {folders.length === 0 ? (
                <p className="text-gray-500">No folders available.</p>
              ) : (
                <ul className="space-y-2">
                  {folders.map((folder) => (
                    <li
                      key={folder.id}
                      className={`p-3 rounded-md cursor-pointer flex items-center ${
                        selectedFolder?.id === folder.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedFolder(folder)}
                    >
                      <Folder className="mr-2 h-5 w-5" />
                      <div>
                        <p className="font-medium">{folder.name}</p>
                        {folder.description && (
                          <p className="text-sm text-gray-500">{folder.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Files Column */}
            <div className="md:col-span-2">
              {selectedFolder ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Files in {selectedFolder.name}
                  </h2>
                  {files.length === 0 ? (
                    <p className="text-gray-500">No files in this folder.</p>
                  ) : (
                    <div className="grid gap-4">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{file.orig_name}</p>
                            <p className="text-sm text-gray-500">
                              Size: {Math.round(file.size / 1024)} KB
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleFileDownload(
                                selectedFolder.name,
                                file.filename,
                                file.orig_name
                              )
                            }
                            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center min-h-[200px]">
                  <p className="text-gray-500">Select a folder to view its contents</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
};

export default StudyMaterialsPage;
