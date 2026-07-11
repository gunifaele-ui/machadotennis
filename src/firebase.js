import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCxflD0IniEjX_M6YDLLdBK4w9gCAJ5ocg",
    authDomain: "machados-tennis.firebaseapp.com",
    projectId: "machados-tennis",
    storageBucket: "machados-tennis.firebasestorage.app",
    messagingSenderId: "744932524108",
    appId: "1:744932524108:web:6af634e757c7622dbbb4e9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc };
