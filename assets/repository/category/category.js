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
 * get category collection Ref
 * @returns my dev
 */
export function getCategoryCollectionRef(){
    const categoryCollectionRef = collection(firestore,'categories');
    return categoryCollectionRef;
}

/**
 * category storage ref to upload images
 * @param {*} categoryImageFile 
 * @param {*} folderPath 
 * folderpath -- means custom folder path give by user it will with same folder path in the storage 
 * @returns get downloaded url of the image
 */
export async function getCategoryStorageImageURL(categoryImageFile,folderPath){
    const storageRef = ref(storage,folderPath);
    await uploadBytes(storageRef,categoryImageFile)
    return getDownloadURL(storageRef);
}

/**
 * category Docs Sanpshot
 * @returns mydev
 */
export async function getCategoryDocsSnapshot(){
    const categoryCollectionRef = getCategoryCollectionRef();
    return await getDocs(categoryCollectionRef);
}

/**
 * getting manufacturer Docs through manufacturerId field
 * @param {*} categoryId
 */
export async function getCategoryQuerySnapshot(categoryId){
   const categoryCollectionRef = getCategoryCollectionRef();
   return await getDocs(query(categoryCollectionRef,where('categoryId', '==', categoryId)))
}