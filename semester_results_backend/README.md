# Semester Results - MongoDB Integration

## Overview
The semester result upload and search feature now saves PDFs to **MongoDB Compass (local)** instead of browser localStorage.

## What Changed

### Backend Created
- **Location**: `semester_results_backend/app.py`
- **Port**: 8017
- **Database**: MongoDB (`student_results_db`)
- **Collection**: `semester_results`

### Features
1. **Upload Results** - Saves PDF/images to MongoDB (max 16MB)
2. **Search Results** - Find by student name or USN
3. **Download Results** - Download PDFs from MongoDB
4. **Auto-Update** - If same student/semester exists, it updates instead of duplicating

## MongoDB Storage

### Database Structure
```
Database: student_results_db
Collection: semester_results

Document Structure:
{
  _id: ObjectId,
  name: "Student Name",
  usn: "USN123",
  semester: 1,
  fileName: "result.pdf",
  fileData: "base64_encoded_pdf_data",
  fileType: "application/pdf",
  uploadedAt: "2025-12-01T13:56:00.000Z"
}
```

### View in MongoDB Compass
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Look for database: `student_results_db`
4. Collection: `semester_results`
5. You'll see all uploaded results there!

## How to Use

### 1. Start the Backend
The backend will auto-start when you run `start-all.bat` or `python start_all_backends.py`

### 2. Upload Results
1. Go to Student Upload page
2. Select student → semester
3. Choose PDF file (max 16MB)
4. Click "Upload Result"
5. PDF is saved to MongoDB!

### 3. Search & Download
1. Go to Admin Dashboard
2. Click "🔍 Search Student Results"
3. Type student name or USN
4. Click "Download" to get the PDF

## Advantages over localStorage

✅ **Permanent Storage** - Data persists even if you clear browser
✅ **Larger Files** - 16MB limit (vs 5MB in localStorage)
✅ **Accessible Anywhere** - Can access from any browser/computer
✅ **Database Management** - Can view/manage in MongoDB Compass
✅ **Backup Ready** - Easy to backup MongoDB database
✅ **Scalable** - Can handle thousands of results

## API Endpoints

- `POST /api/semester-results/upload` - Upload new result
- `GET /api/semester-results/search?query=name` - Search results
- `GET /api/semester-results/download/:id` - Download specific result
- `GET /api/semester-results/all` - Get all results (without file data)
- `DELETE /api/semester-results/delete/:id` - Delete a result

## File Size Limits

- **localStorage** (old): 5MB per file
- **MongoDB** (new): 16MB per file (MongoDB document limit)

## Notes

- PDFs are stored as base64 encoded strings in MongoDB
- Each student/semester combination can have only one result (auto-updates)
- USN is stored in uppercase for consistent searching
- Make sure MongoDB is running before uploading/searching
