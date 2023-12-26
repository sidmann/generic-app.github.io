/**
 * firestore 
 */
import {
    firestore,
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
    } from "../initialize.js";

/**
 *
 *  storage
 */ 
import {
   storage,
   ref, 
   uploadBytes,
   uploadBytesResumable, 
   getDownloadURL,
   deleteObject
   } from "../initialize.js";

/**
 * auth 
 */ 
import {
   auth,
   signOut,
   onAuthStateChanged,
   updatePassword,
   EmailAuthProvider,
   reauthenticateWithCredential,
   signInWithEmailAndPassword,
   sendPasswordResetEmail,
   createUserWithEmailAndPassword
} from "../initialize.js";


/**
 * to get the colors collection ref
 * @author mydev
 */
export function getColorCollectionRef(){
    const colorCollectionRef = collection(firestore,'colors');
    return colorCollectionRef;
}

/**
 * get colors Docs 
 * @returns mydev
 */
export async function getColorDocsSnapshot(){
    const colorCollectionRef = getColorCollectionRef();
    return await getDocs(colorCollectionRef);
} 

/**
 * get the Color collection Docs with mapping colorId 
 * @param {*} colorId 
 */
export async function getColorDocsQuerySnapshot(colorId){
    const colorCollectionRef = getColorCollectionRef();
    const getColorDocsQuerySnapshot = await getDocs(colorCollectionRef,where('colorId','==',colorId))
    return getColorDocsQuerySnapshot;
}

/**
 * get color doc directly by sending input as colorId
 * @param {*} colorId
 * @returns 
 */
export async function getColorDocSnapshot(colorId){
    const colorCollectionDocRef = doc(firestore,'colors',colorId);
    const colorDocSnapshot  = await getDoc(colorCollectionDocRef);
    return colorDocSnapshot; 
}