// Import the functions you need from the SDKs you need 
 import { initializeApp } from "firebase/app"; 
 import { getAnalytics } from "firebase/analytics"; 
 // TODO: Add SDKs for Firebase products that you want to use 
 // https://firebase.google.com/docs/web/setup#available-libraries  
  
 // Your web app's Firebase configuration 
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional 
 const firebaseConfig = { 
   apiKey: "AIzaSyDYpfjHsI3Np5ULpqxB9BUqCa7Nlw6E354", 
   authDomain: "database-bafa7.firebaseapp.com", 
   projectId: "database-bafa7", 
   storageBucket: "database-bafa7.firebasestorage.app", 
   messagingSenderId: "12387356618", 
   appId: "1:12387356618:web:03f42c1901f8fecad1c933", 
   measurementId: "G-G17Q2MKGB9" 
 }; 
  
 // Initialize Firebase 
 const app = initializeApp(firebaseConfig); 
 const analytics = getAnalytics(app); 
 export default firebaseConfig;