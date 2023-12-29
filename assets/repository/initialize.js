import {
     initializeApp 
     } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";

import 
{
    ref, 
    uploadBytes,
    uploadBytesResumable, 
    getDownloadURL,
    getStorage,
    deleteObject
    } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";

import 
{
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    addDoc,
    deleteDoc,
    or,
    and,
    limit,
    startAfter,
    endAt,
    orderBy,
    getCountFromServer,
    deleteField,
    arrayUnion
    } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

import {
    getAuth,
    signOut,
    onAuthStateChanged,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

// const firebaseConfig = {
//     apiKey: "AIzaSyCK3AF6d6OwYAshLu2ZV68v8vjwBHVs0lE",
//     authDomain: "paintplus-app.firebaseapp.com",
//     projectId: "paintplus-app",
//     storageBucket: "paintplus-app.appspot.com",
//     messagingSenderId: "296059905348",
//     appId: "1:296059905348:web:07ea2d69f5f6610e1d2311"
//   };

// const firebaseConfig = {
//     apiKey: "AIzaSyDtX4OWk4DBn5f_APfGcwiwI6qMXBCKfhk",
//     authDomain: "myfireapp-8d543.firebaseapp.com",
//     databaseURL: "https://myfireapp-8d543-default-rtdb.firebaseio.com",
//     projectId: "myfireapp-8d543",
//     storageBucket: "myfireapp-8d543.appspot.com",
//     messagingSenderId: "484285304427",
//     appId: "1:484285304427:web:54c53464c02f04a4646b2e"
// };


const firebaseConfig = {
    apiKey: "AIzaSyB6Mz_R3imLZ9Q885qutDaYQiBtJ0F0ss0",
    authDomain: "clientapp-8e68f.firebaseapp.com",
    projectId: "clientapp-8e68f",
    storageBucket: "clientapp-8e68f.appspot.com",
    messagingSenderId: "279156331",
    appId: "1:279156331:web:599962ac7a0b1b81f8032e",
    measurementId: "G-NL8FHV5R2R"
  };

//global
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

//auth
export {
    signOut,
    onAuthStateChanged,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword
}

//firstore
export {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    addDoc,
    deleteDoc,
    or,
    and,
    limit,
    startAfter,
    endAt,
    orderBy,
    getCountFromServer,
    deleteField,
    arrayUnion
}

//storage
export {
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
}

/**
 * 
 * Add an event listener to the confirmation logout button
 * @param {string} userId 
 * @returns {userDoc} in the jsonData format  
 * @author mydev 
 */

export function getUserSnapshot(userId){
    const userCollectionDoc = doc(firestore,'users',userId);
    return getDoc(userCollectionDoc);
 }
