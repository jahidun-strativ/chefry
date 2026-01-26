// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAh8mYq9JnM96Ccx6kd80Ht91V8aCRpNoA",
  authDomain: "startracker-fb6ce.firebaseapp.com",
  projectId: "startracker-fb6ce",
  storageBucket: "startracker-fb6ce.appspot.com",
  messagingSenderId: "531375351727",
  appId: "1:531375351727:web:13b82c9e100fc43205715a",
};

if (getApps().length === 0) initializeApp(firebaseConfig);
