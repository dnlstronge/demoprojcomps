// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, getFirestore } from "firebase/database"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnMWEB6v6FO8NUMIfwTPKDWttN6VSJvwk",
  authDomain: "testdb-fc7b9.firebaseapp.com",
  databaseURL: "https://testdb-fc7b9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "testdb-fc7b9",
  storageBucket: "testdb-fc7b9.appspot.com",
  messagingSenderId: "424052893668",
  appId: "1:424052893668:web:d8e21bc432d5ba9ab1c9f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const projectStorage = getStorage(app)
const database = getDatabase(app)
export { database };
