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
 * to get the sizes collection ref
 * @author mydev
 */
export function getSizeCollectionRef(){
    const sizeCollectionRef = collection(firestore,'sizes');
    return sizeCollectionRef;
}

/**
 * get sizes Docs 
 * @returns mydev
 */
export async function getSizeDocsSnapshot(){
    const sizeCollectionRef = getSizeCollectionRef();
    return await getDocs(sizeCollectionRef);
} 

/**
 * get the Size collection Docs with mapping sizeId 
 * @param {*} sizeId 
 */
export async function getSizeDocsQuerySnapshot(sizeId){
    const sizeCollectionRef = getSizeCollectionRef();
    const getSizeDocsQuerySnapshot = await getDocs(sizeCollectionRef,where('sizeId','==',sizeId))
    return getSizeDocsQuerySnapshot;
}

export async function getSizeDocSnapshot(sizeId){
    const sizeCollectionDocRef = doc(firestore,'sizes',sizeId);
    const sizeDocSnapshot  = await getDoc(sizeCollectionDocRef);
    return sizeDocSnapshot; 
}