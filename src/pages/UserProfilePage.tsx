import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuth, updateProfile, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [photoURL, setPhotoURL] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const storage = getStorage();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setPhotoURL(currentUser.photoURL || '');
      setDisplayName(currentUser.displayName || '');
    } else {
      navigate('/login');
    }
  }, [auth, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `profile-pictures/${user.uid}/${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: downloadURL });
      setPhotoURL(downloadURL);
      setUser({ ...user, photoURL: downloadURL });
      alert('Profile picture uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await updateProfile(user, {
          displayName: displayName,
          photoURL: photoURL,
        });
        alert('Profile updated successfully!');
        // Refresh user data
        setUser({ ...currentUser, displayName, photoURL });
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-start space-y-4">
              <img
                src={user.photoURL || 'https://via.placeholder.com/100'}
                onLoad={() => console.log('Image loaded:', user.photoURL)}
                onError={() => console.log('Image failed to load:', user.photoURL)}

                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold">{user.displayName || 'No display name'}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                />
              </div>

              <div className="flex flex-col items-start">
                <Label htmlFor="profilePicture">Upload Profile Picture</Label>
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <Button onClick={handleUpload} disabled={uploading} className="mt-2">
                    {uploading ? 'Uploading...' : 'Upload Picture'}
                  </Button>
                )}
              </div>

              <Button onClick={handleUpdateProfile} className="w-full">
                Update Profile
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;