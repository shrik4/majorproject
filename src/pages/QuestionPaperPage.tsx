import React, { useState, useEffect } from 'react';
import { Search, FolderPlus, Upload, FileText, Calendar, X, ArrowLeft, File, Download, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
// import { mockData } from '../utils/mockData'; // Assuming mockData will be handled internally or removed
import '../styles.css';

export default function QuestionPaperPage() {
  const [folders, setFolders] = useState([]);
  const [papers, setPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadPaper, setShowUploadPaper] = useState(false);
  const [newFolder, setNewFolder] = useState({ name: '', description: '' });
  const [uploadData, setUploadData] = useState({ folderId: '', file: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [viewMode, setViewMode] = useState('folders'); // 'folders' or 'papers'
  const { toast } = useToast();

  const itemsPerPage = 6;

  // Mock data for demonstration purposes
  const mockData = {
    folders: [
      { id: '1', name: '2023 Papers', description: 'All papers from 2023', createdAt: 'Jan 1, 2023', paperCount: 2 },
      { id: '2', name: '2022 Papers', description: 'All papers from 2022', createdAt: 'Jan 1, 2022', paperCount: 1 },
      { id: '3', name: 'Sample Papers', description: 'Various sample papers', createdAt: 'Feb 15, 2023', paperCount: 0 },
    ],
    papers: [
      { id: 'p1', folderId: '1', title: 'Maths Midterm 2023.pdf', uploadedAt: 'Mar 10, 2023', size: '500 KB' },
      { id: 'p2', folderId: '1', title: 'Science Final 2023.pdf', uploadedAt: 'Apr 20, 2023', size: '750 KB' },
      { id: 'p3', folderId: '2', title: 'History Exam 2022.pdf', uploadedAt: 'Dec 1, 2022', size: '600 KB' },
    ],
  };

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    const savedFolders = localStorage.getItem('questionPapersFolders');
    const savedPapers = localStorage.getItem('questionPapersPapers');
    
    if (savedFolders && savedPapers) {
      setFolders(JSON.parse(savedFolders));
      setPapers(JSON.parse(savedPapers));
    } else {
      setFolders(mockData.folders);
      setPapers(mockData.papers);
      localStorage.setItem('questionPapersFolders', JSON.stringify(mockData.folders));
      localStorage.setItem('questionPapersPapers', JSON.stringify(mockData.papers));
    }
  };

  const saveFolders = (updatedFolders) => {
    setFolders(updatedFolders);
    localStorage.setItem('questionPapersFolders', JSON.stringify(updatedFolders));
  };

  const savePapers = (updatedPapers) => {
    setPapers(updatedPapers);
    localStorage.setItem('questionPapersPapers', JSON.stringify(updatedPapers));
  };

  const handleCreateFolder = () => {
    if (!newFolder.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }

    const folder = {
      id: Date.now().toString(),
      name: newFolder.name,
      description: newFolder.description,
      createdAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      paperCount: 0
    };

    const updatedFolders = [...folders, folder];
    saveFolders(updatedFolders);
    
    setNewFolder({ name: '', description: '' });
    setShowCreateFolder(false);
    
    toast({
      title: "Success",
      description: "Folder created successfully",
    });
  };

  const handleUploadPaper = () => {
    if (!uploadData.folderId || !uploadData.file) {
      toast({
        title: "Error",
        description: "Please select a folder and file",
        variant: "destructive",
      });
      return;
    }

    const paper = {
      id: Date.now().toString(),
      folderId: uploadData.folderId,
      title: uploadData.file.name,
      uploadedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      size: Math.round(uploadData.file.size / 1024) + ' KB'
    };

    const updatedPapers = [...papers, paper];
    savePapers(updatedPapers);

    // Update folder paper count
    const updatedFolders = folders.map(folder => 
      folder.id === uploadData.folderId 
        ? { ...folder, paperCount: folder.paperCount + 1 }
        : folder
    );
    saveFolders(updatedFolders);

    setUploadData({ folderId: '', file: null });
    setShowUploadPaper(false);
    
    toast({
      title: "Success",
      description: "Paper uploaded successfully",
    });
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
    setViewMode('papers');
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleBackToFolders = () => {
    setCurrentFolder(null);
    setViewMode('folders');
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleDownloadPDF = (paper) => {
    // Create a mock PDF download - in a real app this would download the actual file
    const link = document.createElement('a');
    link.href = '#'; // In real app, this would be the actual PDF URL
    link.download = paper.title;
    link.click();
    
    toast({
      title: "Download Started",
      description: `Downloading ${paper.title}`,
    });
  };

  const handleDeletePaper = (paperToDelete) => {
    // Remove paper from local storage
    const updatedPapers = papers.filter(paper => paper.id !== paperToDelete.id);
    savePapers(updatedPapers);

    // Update folder paper count
    const updatedFolders = folders.map(folder => 
      folder.id === paperToDelete.folderId 
        ? { ...folder, paperCount: folder.paperCount - 1 } 
        : folder
    );
    saveFolders(updatedFolders);

    // Frontend-only deletion: Remove paper from local state and storage
    // No backend API call for deletion as per user's request.

    toast({
      title: "Success",
      description: "Paper deleted successfully",
    });
  };

  const handleDeleteFolder = async (folderToDelete) => {
    try {
      // Frontend-only deletion: Remove folder from local state and storage
      // No backend API call for deletion as per user's request.

      // Remove folder from local storage
      const updatedFolders = folders.filter(folder => folder.id !== folderToDelete.id);
      saveFolders(updatedFolders);

      // Remove all papers from this folder
      const updatedPapers = papers.filter(paper => paper.folderId !== folderToDelete.id);
      savePapers(updatedPapers);

      toast({
        title: "Success",
        description: "Folder and its contents deleted successfully",
      });

      // If we're currently viewing this folder's papers, go back to folders view
      if (currentFolder?.id === folderToDelete.id) {
        setCurrentFolder(null);
        setViewMode('folders');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadData({ ...uploadData, file });
    } else {
      toast({
        title: "Error",
        description: "Please select a PDF file only",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadData({ ...uploadData, file });
    } else {
      toast({
        title: "Error",
        description: "Please drop a PDF file only",
        variant: "destructive",
      });
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPapers = papers.filter(paper =>
    paper.folderId === currentFolder?.id &&
    paper.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil( (viewMode === 'folders' ? filteredFolders.length : filteredPapers.length) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const displayedItems = viewMode === 'folders' 
    ? filteredFolders.slice(startIndex, endIndex)
    : filteredPapers.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Question Papers</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search folders or papers..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowUploadPaper(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <Upload className="w-5 h-5 mr-2" /> Upload Paper
          </Button>
          <Button onClick={() => setShowCreateFolder(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
            <FolderPlus className="w-5 h-5 mr-2" /> Create Folder
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6">
        {viewMode === 'papers' && (
          <div className="mb-4 flex items-center space-x-2">
            <Button variant="outline" onClick={handleBackToFolders} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Folders
            </Button>
            <h2 className="text-xl font-semibold text-gray-700">Papers in {currentFolder?.name}</h2>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedItems.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-10">
              {viewMode === 'folders' ? 'No folders found.' : 'No papers found in this folder.'}
            </p>
          ) : (
            displayedItems.map((item) => (
              viewMode === 'folders' ? (
                <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center text-lg font-semibold text-gray-800 cursor-pointer" onClick={() => handleFolderClick(item)}>
                        <FolderPlus className="w-5 h-5 mr-2 text-blue-500" /> {item.name}
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(item);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription className="text-sm text-gray-500">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    <p className="flex items-center"><FileText className="w-4 h-4 mr-1 text-gray-400" /> {item.paperCount} Papers</p>
                    <p className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-gray-400" /> Created: {item.createdAt}</p>
                  </CardContent>
                </Card>
              ) : (
                <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
                      <File className="w-5 h-5 mr-2 text-purple-500" /> {item.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">{item.size}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    <p className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-gray-400" /> Uploaded: {item.uploadedAt}</p>
                    <div className="flex justify-between items-center mt-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(item)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePaper(item)}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            ))
          )}
        </div>


      </main>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter the details for your new question paper folder.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folderName" className="text-right">Name</Label>
              <Input
                id="folderName"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folderDescription" className="text-right">Description</Label>
              <Textarea
                id="folderDescription"
                value={newFolder.description}
                onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Paper Dialog */}
      <Dialog open={showUploadPaper} onOpenChange={setShowUploadPaper}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Question Paper</DialogTitle>
            <DialogDescription>Select a folder and upload your PDF file.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folderSelect" className="text-right">Folder</Label>
              <Select onValueChange={(value) => setUploadData({ ...uploadData, folderId: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileUpload" className="text-right">File</Label>
              <div
                className={`col-span-3 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('hiddenFileUpload').click()}
              >
                {uploadData.file ? (
                  <p className="text-gray-700">Selected: {uploadData.file.name}</p>
                ) : (
                  <p className="text-gray-500">Drag 'n' drop PDF here, or click to select file</p>
                )}
                <Input
                  id="hiddenFileUpload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUploadPaper}>Upload Paper</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
