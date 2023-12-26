//firstore
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
    deleteObject,
    or,
    and,
    limit,
    startAfter,
    endAt,
    orderBy,
    getCountFromServer,
    deleteField,
    arrayUnion
} from './assets/repository/initialize.js'

//Auth
import {
    auth,
    signOut,
    onAuthStateChanged,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
} from './assets/repository/initialize.js'

//storage
import {
    storage,
    ref,
    uploadBytes,
    getDownloadURL,
} from './assets/repository/initialize.js'

import { getUserSnapshot } from './assets/repository/auth/auth.js';
import { 
    getManufactuerDocsSnapshot,
    getManufacturerCollectionRef, 
    getManufacturerQuerySnapshot,
    getManufacturerStorageImageURL,
    getStorageImageFolderPathFileName 
} from './assets/repository/manufacturer/manufacturer.js';

import { 
    getCategoryCollectionRef,
    getCategoryDocsSnapshot,
    getCategoryQuerySnapshot, 
    getCategoryStorageImageURL 
} from './assets/repository/category/category.js';

import { 
    getColorCollectionRef,
    getColorDocsQuerySnapshot,
    getColorDocsSnapshot 
} from './assets/repository/colors/colors.js';

import { 
    getSizeCollectionRef, 
    getSizeDocsQuerySnapshot,
    getSizeDocsSnapshot
} from './assets/repository/sizes/sizes.js';
import { getProductCollectionRef } from './assets/repository/products/products.js';

var userData = null;
var loggedIn = false;


/**
 * @param {auth}
 * @author mydev
 */
onAuthStateChanged(auth, async (user) => {
    if(user) {
        loggedIn = true
        onLoggedIn();
        const userDocSnapshot =await getUserSnapshot(user.uid);
            if (!userDocSnapshot.empty) {
                userData = userDocSnapshot.data();
                roleAccess(userData.role);
                updateProfileName(userData.role,userData.firstName);
                updateProfilePicture(userData.role,userData.profilePicture)
            }
    } 
    else {
        onLoggedOut();
        window.location.href = "login.html";
    }
    await postPageLoadFunctions();
});

/**
 * to role based dashboard
 * @param {user role} role 
 */
function roleAccess(role) {
    const roleMap = new Map([
        ["ADMIN", "adminAppbar"],
        ["CUSTOMER", "customerAppbar"],
        ["AGENT", "agentAppbar"],
    ]);

    const appbarList = document.querySelectorAll(`#${roleMap.get(role)}`);
    appbarList.forEach((appbar) => {
        appbar.classList.remove("d-none");
    })
}

/**
 * @param {user role} role 
 * @param {user firstName} firstName 
 * @returns DOM Element
 * @author mydev
 */
function updateProfileName(role, firstName) {
    console.log(firstName)
    let profileNameElement;
    switch (role) {
        case 'CUSTOMER':
            profileNameElement = document.getElementById('customerAppbar').querySelector('.profile-name');
            break;
        // case 'AGENT':
        //     profileNameElement = document.getElementById('agentAppbar').querySelector('.profile-name');
        //     break;
        case 'ADMIN':
            profileNameElement = document.getElementById('adminAppbar').querySelector('.profile-name');
            break;
        default:
            console.error('Unknown role:', role);
            return;
    }
    profileNameElement.textContent = firstName;
}

/**
 * @param {user role} role 
 * @param {user imageUrl} profilePicture 
 * @returns DOM Element
 * @author mydev
 */
function updateProfilePicture(role, profilePicture) {
    let profilePictureElement;
    const defaultProfilePicture = 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp';

    switch (role) {
        case 'CUSTOMER':
            profilePictureElement = document.getElementById('customerAppbar').querySelector('#profile-picture');
            break;
        // case 'AGENT':
        //     profilePictureElement = document.getElementById('agentAppbar').querySelector('#profile-picture');
        //     break;
        case 'ADMIN':
            profilePictureElement = document.getElementById('adminAppbar').querySelector('#profile-picture');
            break;
        default:
            console.error('Unknown role:', role)
            return;
    }

    if (profilePicture && profilePicture.trim() !== '') {
        profilePictureElement.src = profilePicture;
    } 
    else {
        profilePictureElement.src = defaultProfilePicture;
    }
}

/**
 * navbar items after login
 * @author mydev
 */
function onLoggedIn() {
    var navItemList = document.querySelectorAll(".loggedIn");
    navItemList.forEach((navItem) => {
        navItem.style.display = "block";
    });

    navItemList = document.querySelectorAll(".loggedOut");
    navItemList.forEach((navItem) => {
        navItem.style.display = "none";
    });
    document.querySelector('#logout-btn').style.display='block';
}

/**
 * navbar itmes before login
 * @author mydev
 */
function onLoggedOut() {
    var navItemList = document.querySelectorAll(".loggedOut");
    navItemList.forEach((navItem) => {
        navItem.style.display = "block";
    });

    navItemList = document.querySelectorAll(".loggedIn");
    navItemList.forEach((navItem) => {
        navItem.style.display = "none";
    });
    document.querySelector('#logout-btn').style.display='none';
}

/**
 * 
 * logout event Listenser
 * @author mydev
 */
document.getElementById("confirmLogoutBtn").addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            window.location.href = "login.html";
        })
        .catch((error) => {
            console.error("Error during logout:", error);
        });
});

/**
 * Necessary fucntions to call after pageload
 */
async function postPageLoadFunctions() {
    await updateCart();
    // await fetchNavCategories();
}


/**
 * update cart function cart(dependency)
 * @returns promise
 * 
 * requires: 
 * getCart()
 */
function updateCart() {
    return new Promise(async (resolve) => {
        console.log("from update cart")
        const shownCart = document.querySelector('#shown-cart')

        let cart = await getCart()
        console.log(cart.length)

        if (cart.length) {
            document.querySelectorAll('.cart').forEach(ele => ele.textContent = cart.length)
        }
        else {
            document.querySelectorAll('.cart').forEach(ele => ele.textContent = 0)
        }
        console.log("resolve")
        resolve()
    })
}

async function getCart() {
    return new Promise(async (resolve) => {
        if (loggedIn) {
            const cartSnapshot = await getDocs(collection(firestore, 'users', auth.currentUser.uid, 'cart'))
            if (cartSnapshot.empty) {
                resolve([])
            }
            let cart = []
            cartSnapshot.forEach(doc => {
                cart.push(doc.data())
            })
            resolve(cart)
        }
        else {
            const cartSnapshot = JSON.parse(sessionStorage.getItem('cart'))
            if (!cartSnapshot) {
                resolve([])
                return
            }
            var cart = []
            cartSnapshot.forEach(doc => {
                cart.push(doc)
            })
            resolve(cart)
        }
    })
}

//------------------------ Manage Manufacturer--------------------------------------

/**
 * loading the manufacturers
 * @author mydev
 */
document.querySelector('#manufacturer-dropdown').addEventListener('click',loadAllManufacturers);

/**
 * Add a click event listener to open the manufacturer modal
 * @return mydev 
 */
const openManufacturerModalButton = document.getElementById('add-manufacturer-button');
openManufacturerModalButton.addEventListener('click', () => {
    document.getElementById('manufacturerName').value = '';
    populateManufacturerList();
});

/**
 * save the manufacturers 
 * @returns sid
 */
document.getElementById('saveManufacturerButton').addEventListener('click', async () => {
    const manufacturerName = document.getElementById('manufacturerName').value;
    const manufacturerImageInput = document.getElementById('manufacturerImage')
    if (manufacturerName && manufacturerImageInput.files.length > 0) {
        const manufacturerImageFile = manufacturerImageInput.files[0];
        try {
            const folderPath = 'manufacturer_images/' + manufacturerImageFile.name;
            const manufacturerImageDownloadURL =await getManufacturerStorageImageURL(manufacturerImageFile,folderPath);

            const manufacturerCollectionRef = getManufacturerCollectionRef();
            const docRef = await addDoc(manufacturerCollectionRef, { name: manufacturerName, imageUrl: manufacturerImageDownloadURL });
            await updateDoc(docRef, { manufacturerId: docRef.id });

            console.log('Manufacturer added successfully');
            displayMessage('Manufacturer added successfully!', 'success');
            populateManufacturerList();
            document.getElementById('manufacturerName').value = '';
            manufacturerImageInput.value = '';
        } catch (error) {
            console.error('Error adding manufacturer:', error);
        }
    } else {
        console.error('Manufacturer name and image are required.');
        displayMessage('Manufacturer name and image are required.', 'danger');
    }
});


/**
 * populate manufacturers when any will happened in the manufacturer table
 * @returns mydev
 */
async function populateManufacturerList() {
    const manufacturerList = document.getElementById('manufacturerList');
    const manufacturerDocsSnapshot =await getManufactuerDocsSnapshot();

    if(!manufacturerDocsSnapshot.empty){
        manufacturerList.innerHTML = '';
        manufacturerDocsSnapshot.forEach((doc) => {
            const manufacturer = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                            <td>${manufacturer.name}</td>
                            <td>
                                <button class="btn btn-sm btn-primary edit">Edit</button>
                                <button class="btn btn-sm btn-danger delete" >Delete</button>
                            </td>
                        `;
            manufacturerList.appendChild(row);
            row.querySelector('.edit').addEventListener('click', () => editManufacturer(manufacturer.manufacturerId, manufacturer.name))
            row.querySelector('.delete').addEventListener('click', () => deleteManufacturer(manufacturer.manufacturerId))
        });
    }
    else{
        displayMessage('Manufactuers not found !','danger');
        manufacturerList.innerHTML = `<tr>Manufactuers not found </tr>`
    }
}


/**
 * @return mydev
 * Edit Manufacturer
 * @param {*} manufacturerId 
 * @param {*} manufacturerName 
 */
async function editManufacturer(manufacturerId, manufacturerName) {
    console.log(manufacturerId)
    console.log('from editmanufacturer')
    const updatedManufacturerName = prompt('Edit Manufacturer Name:', manufacturerName);

    if (updatedManufacturerName !== null) {
        const manufacturerQuerySnapshot =await getManufacturerQuerySnapshot(manufacturerId);

        if (!manufacturerQuerySnapshot.empty) {
            updateDoc(manufacturerQuerySnapshot.docs[0].ref, { name: updatedManufacturerName })
                .then(() => {
                    console.log(`Successfully Updated to ${updatedManufacturerName}`)
                    console.log('Manufacturer updated successfully');
                    displayMessage('Manufacturer updated successfully!', 'success');
                    document.querySelector('#manufacturer-dropdown').addEventListener('click', loadAllManufacturers)
                    populateManufacturerList();
                })
                .catch((error) => {
                    console.error('Error updating manufacturer:', error);
                });
        }
    }
}


/**
 * To deleting the manufacturer using manufacturerId
 * @param {*} manufacturerId 
 */
async function deleteManufacturer(manufacturerId) {
    const confirmation = confirm('Are you sure you want to delete this manufacturer?');
    if (confirmation) {
        try {
            const manufacturerSnapshot = await getManufacturerQuerySnapshot(manufacturerId);

            if (!manufacturerSnapshot.empty) {
                const manufacturerDoc = manufacturerSnapshot.docs[0];
                const manufacturerDocData = manufacturerDoc.data()

                // Extract the file name from the image URL
                const fileName = getStorageImageFolderPathFileName(manufacturerDocData.imageUrl);
                console.log(fileName);

                // Delete the manufacturer image from storage
                if (fileName) {
                    const storageRef = ref(storage, 'manufacturer_images/' + fileName);

                    await deleteObject(storageRef)
                        .then(() => {
                            console.log('Image deleted from storage successfully.');
                        })
                        .catch((error) => {
                            console.error('Error deleting image from storage:', error);
                        });
                }

                // Delete the manufacturer document from Firestore
                await deleteDoc(manufacturerDoc.ref);
                console.log('Manufacturer deleted successfully');
                displayMessage('Manufacturer deleted successfully!', 'success');
                document.querySelector('#manufacturer-dropdown').addEventListener('click', loadAllManufacturers)
                populateManufacturerList();
            }
        } catch (error) {
            console.error('Error deleting manufacturer:', error);
        }
    }
}

/**
 * to fetch manufacturers in modal
 * @returns mydev
 */
async function loadAllManufacturers(event) {
    event.preventDefault();
    console.log("567")
    const select = document.querySelector('#manufacturer-dropdown')
    select.innerHTML = `<option value="">
                                Loading ...
                            </option>`
    const manufacturerSnapshot = await getManufactuerDocsSnapshot();
    if (!manufacturerSnapshot.empty) {
        select.removeEventListener('click', loadAllManufacturers)
        select.innerHTML = ``
        const option = document.createElement('option')
        option.innerHTML = `Please select`
        select.appendChild(option)
        manufacturerSnapshot.forEach(doc => {
            const option = document.createElement('option')
            option.setAttribute('value', doc.data().name)
            option.setAttribute('data-id', doc.data().manufacturerId)
            option.innerHTML = `${doc.data().name}`
            select.appendChild(option)
        })
        // document.querySelector('#colorShadeDropdown').click()
    }
    else {
        select.innerHTML = `<option value="">Please select</option>`
        displayMessage('No manufactures added!', 'danger')
    }
}
//----------------------------------------------------------------------------------------


/**
 * 
 * categories loading 
 */
document.querySelector('#categoryDropdown').addEventListener('click', loadAllCategories)
// -------------------------- categories section------------------------------------------

const openCategoryModalButton = document.getElementById('add-category-button');
openCategoryModalButton.addEventListener('click', () => {
    document.getElementById('categoryName').value = '';
    populateCategoryList();
});

/**
 * save the categories 
 * @returns mydev
 */
document.getElementById('saveCategoryButton').addEventListener('click', async () => {
    const categoryName = document.getElementById('categoryName').value;
    const categoryImageInput = document.getElementById('categoryImage');

    if (categoryName && categoryImageInput.files.length > 0) {
        const categoryImageFile = categoryImageInput.files[0];
        try {
            const folderPath = 'category_images/' + categoryImageFile.name;
            const categoryImageDownloadURL = await getCategoryStorageImageURL(categoryImageFile,folderPath);

            const categoryCollectionRef = getCategoryCollectionRef();
            const docRef = await addDoc(categoryCollectionRef, { name: categoryName, imageUrl: categoryImageDownloadURL});

            // Update the categoryId with the document ID
            await updateDoc(docRef, { categoryId: docRef.id });
            console.log('Category added successfully');
            displayMessage('Category added successfully!', 'success');
            populateCategoryList();
            document.getElementById('categoryName').value = '';
            categoryImageInput.value = '';
        } catch (error) {
            console.error('Error adding category:', error);
        }
    } else {
        console.error('Category name and image are required.');
        displayMessage('Category name and image are required', 'danger');
    }
});

/**
 * populate categories when any will happened in the category table
 * @returns mydev
 */
async function populateCategoryList() {
    const categoryList = document.getElementById('categoryList');
    const categoryDocsSnapshot = await getCategoryDocsSnapshot();

    if(!categoryDocsSnapshot.empty){
        categoryList.innerHTML = '';
        categoryDocsSnapshot.forEach((categoryDoc) => {
            const category = categoryDoc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                            <td>${category.name}</td>
                            <td>
                                <button class="btn btn-sm btn-primary edit">Edit</button>
                                <button class="btn btn-sm btn-danger delete" >Delete</button>
                            </td>
                        `;
            categoryList.appendChild(row);
            row.querySelector('.edit').addEventListener('click', () => editCategory(category.categoryId, category.name))
            row.querySelector('.delete').addEventListener('click', () => deleteCategory(category.categoryId))
        });
    }
    else{
        displayMessage('Categories not found !','danger');
        categoryList.innerHTML = `<tr>Categories not found </tr>`
    }    
}

/**
 * @return mydev
 * Edit Category
 * @param {*} categoryId 
 * @param {*} categoryName 
 */
async function editCategory(categoryId, categoryName) {
    console.log(categoryId)
    console.log('from editcategory')
    const updatedCategoryName = prompt('Edit Category Name:', categoryName);
    if (updatedCategoryName !== null) {
        const categoryQuerySnapshot = await getCategoryQuerySnapshot(categoryId);
        if (!categoryQuerySnapshot.empty) {
            updateDoc(categoryQuerySnapshot.docs[0].ref, { name: updatedCategoryName })
                .then(() => {
                    console.log(`Successfully Updated to ${updatedCategoryName}`)
                    console.log('Category updated successfully');
                    displayMessage('category updated successfully!', 'success');
                    document.querySelector('#categoryDropdown').addEventListener('click', loadAllCategories)
                    populateCategoryList();
                })
                .catch((error) => {
                    console.error('Error updating category:', error);
                });
        }
    }
}

/**
 * To delete the category using categoryId
 * @param {*} categoryId 
 */
async function deleteCategory(categoryId) {
    console.log(categoryId);
    const confirmation = confirm('Are you sure you want to delete this category?');
    if (confirmation) {
        try {
            const categoryQuerySnapshot = await getCategoryQuerySnapshot(categoryId);
            if (!categoryQuerySnapshot.empty) {
                const categoryDoc = categoryQuerySnapshot.docs[0];
                const categoryData = categoryDoc.data();

                const fileName = getStorageImageFolderPathFileName(categoryData.imageUrl);
                if (fileName) {
                    const storageRef = ref(storage, 'category_images/' + fileName);

                    await deleteObject(storageRef)
                        .then(() => {
                            console.log('Image deleted from storage successfully.');
                        })
                        .catch((error) => {
                            console.error('Error deleting image from storage:', error);
                        });
                }

                // Delete the category document from Firestore
                await deleteDoc(categoryDoc.ref);

                console.log('Category deleted successfully');
                displayMessage('Category deleted successfully!', 'success');
                document.querySelector('#categoryDropdown').addEventListener('click', loadAllCategories);
                populateCategoryList();
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    }
}

/**
 * to fetch categories in model
 * @returns mydev
 */
async function loadAllCategories(event) {
    event.preventDefault();
    console.log("890")
    const select = document.querySelector('#categoryDropdown')
    select.innerHTML = `<option value="">
                                Loading ...
                            </option>`
    const categorySnapshot = await getCategoryDocsSnapshot();
    if (!categorySnapshot.empty) {
        select.removeEventListener('click', loadAllCategories)
        select.innerHTML = ``
        const option = document.createElement('option')
        option.innerHTML = `Please select`
        select.appendChild(option)
        categorySnapshot.forEach(doc => {
            const option = document.createElement('option')
            option.setAttribute('value', doc.data().name)
            option.setAttribute('data-id', doc.data().categoryId)
            option.innerHTML = `${doc.data().name}`
            select.appendChild(option)
        })
        // document.querySelector('#colorShadeDropdown').click()
    }
    else {
        select.innerHTML = `<option value="">Please select</option>`
        displayMessage('No categories added!', 'danger')
    }
}
//------------------------------------------------------------------------------------


// ---------------------------- ColorAdd Manage---------------------------------------
/**
 * save the color for product
 */
document.querySelector('#save-color-button').addEventListener('click', saveColorFoProducts)

/**
 * to load the colors when open the colormodel
 * @returns mydev
 */
const openAddColorModel = document.querySelector('#add-color-model')
openAddColorModel.addEventListener('click', () => {
    document.getElementById('color-name').value = ''
    document.getElementById('color-hexcode').value = ''
    document.getElementById('color-price').value = ''
    fetchColorsForProducts();
})

/**
 * save color for product
 * @returns mydev
 */
async function saveColorFoProducts(){  
    const colorName  = document.querySelector('#color-name').value;
    const colorhexcode  = document.querySelector('#color-hexcode').value;
    const colorPrice  = document.querySelector('#color-price').value;
    
    if(!colorName || !colorhexcode || !colorPrice){
        displayMessage('Please Enter All field','danger');

        if (!colorName) {
            document.querySelector('#color-name').focus();
        } else if (!colorhexcode) {
            document.querySelector('#color-hexcode').focus();
        } else if (!colorPrice) {
            document.querySelector('#color-price').focus();
        }
        return;
    }
    
    const colorCollectionRef = getColorCollectionRef();
    const docRef = await addDoc(colorCollectionRef,
        {
            colorName: colorName,
            colorhexcode: colorhexcode,
            colorPrice: colorPrice  
        });
    await updateDoc(docRef, { colorId: docRef.id });
    fetchColorsForProducts();
    displayMessage('colorDetails added successfully', 'success');
    document.querySelector('#color-name').value = ''
    document.querySelector('#color-hexcode').value = ''
    document.querySelector('#color-price').value = ''
}

/**
 * fetch colors for particuler product
 * @returns mydev
 * @author mydev
 */
async function fetchColorsForProducts(){
    const productSnapshot = await getColorDocsSnapshot();
    let productColorContainer = document.querySelector('#color-pro-container');

    if (!productSnapshot.empty) {
        productColorContainer.removeEventListener('click', fetchColorsForProducts);
        productColorContainer.innerHTML = ''
        productSnapshot.forEach((doc) => {

        const docData = doc.data();
        // console.log(docData)
        const productDiv = document.createElement('div');
        productDiv.classList.add('colorboxcontainer','border')
        productDiv.innerHTML = `
                        <div id="colordisplay border-bottom" style="background-color: ${docData.colorhexcode}; padding: 2em 5em;" data-colorId ="product-${docData.colorId}" class=" colorbox">
                        </div>
                            <div class="d-flex align-items-center justify-content-between p-2">
                            <div class="m-r-30">
                                <p id="color-name-display" class="m-0">${docData.colorName}</p>
                                <p id="color-price-display" class="m-0">${docData.colorPrice} /Ltr</p>
                            </div>
                            <button class="edit" id="selected-product-color">
                                <i class="fa-regular fa-pen-to-square" 
                                 data-colorId="${doc.id}" data-colorName="${docData.colorName}"
                                 data-colorPrice="${docData.colorPrice}"></i>
                            </button>

                            <button class="delete" id="selected-product-color">
                                <i class="fa-solid fa-trash" 
                                 data-colorId="${doc.id}" data-colorName="${docData.colorName}"
                                 data-colorPrice="${docData.colorPrice}"></i>
                            </button>
                        </div> 
                        `
            productColorContainer.appendChild(productDiv);
            productDiv.querySelector('.delete').addEventListener('click', async (event) => {
                event.preventDefault();
               if(event.target){
                    const colorId = event.target.getAttribute('data-colorId')
                    deleteColor(colorId)
               }
            })

            productDiv.querySelector('.edit').addEventListener('click', async (event) => {
                event.preventDefault();
                if (event.target) {
                    // console.log(event.target);
                    const colorId = event.target.getAttribute('data-colorId')
                    const colorPrice = event.target.getAttribute('data-colorPrice')
                    editColor(colorId,colorPrice)
                }
            })
        });
    }
    else {
        productColorContainer.innerHTML = `<option value="">Colors not exists for this product</option>`
        displayMessage('Colors not exists for this product!', 'danger')
    }
}

/**
 * edit the color based on the colorId and colorPrice
 * @param {*} colorId 
 * @param {*} colorPrice 
 * @author mydev
 */
async function editColor(colorId, colorPrice) {
    console.log(colorId)
    console.log('from color')
    const updatedColorPrice = prompt('Edit Color Price:', colorPrice);
    if (updatedColorPrice !== null) {
        const colorQuerySnapshot = await getColorDocsQuerySnapshot(colorId);
        if (!colorQuerySnapshot.empty) {
            console.log(colorQuerySnapshot.docs[0].data())
            updateDoc(colorQuerySnapshot.docs[0].ref, { colorPrice : updatedColorPrice })
                .then(() => {
                    console.log(`Successfully Updated to ${updatedColorPrice}`)
                    console.log('Color updated successfully');
                    displayMessage('color updated successfully!', 'success');
                    fetchColorsForProducts();
                })
                .catch((error) => {
                    console.error('Error updating color:', error);
                });
        }
    }
}

/**
 * delete color based on the colorId
 * @param {*} colorId 
 * @author mydev
 */
async function deleteColor(colorId) {
    console.log(colorId);
    const confirmation = confirm('Are you sure you want to delete this color?');

    if (confirmation) {
        try {
            const colorSnapshot = await getColorDocsQuerySnapshot(colorId);
            if (!colorSnapshot.empty) {
                await deleteDoc(colorSnapshot.docs[0].ref)
            }
            console.log('Color deleted successfully');
            displayMessage('Color deleted successfully!', 'success');
            fetchColorsForProducts();
        } catch (error) {
            console.error('Error deleting color:', error);
        }
    }
}
//-----------------------------------------------------------------------------------



//------------------------------------ Select colors for product---------------------
/**
 * model open for Color selection
 * @author mydev
 */
const openSelectColorModel = document.querySelector('#select-color-model')
openSelectColorModel.addEventListener('click',()=>{
    fetchColorsForSelect();
})

/**
 * define empty arrays
 */
var selectedColorIds = []
var selectedColorHexcode = []
const selectedColorsContainer = document.querySelector('.selected-color-container');
const colorCountElement = document.querySelector('.selected-color-counter');

/**
 * fetch colors to select the colors
 * @returns mydev
 */
async function fetchColorsForSelect(){
    selectedColorIds=[]
    selectedColorHexcode = []
    
    const colorDocsSnapshot = await getColorDocsSnapshot();
    let productColorContainer = document.querySelector('#color-select-container');
    if(!colorDocsSnapshot.empty){
        console.log(selectedColorIds)
        console.log(selectedColorHexcode)
        productColorContainer.removeEventListener('click',fetchColorsForSelect);
        productColorContainer.innerHTML = ''
        selectedColorsContainer.innerHTML = ''
        colorDocsSnapshot.forEach((doc)=>{
        const docData = doc.data();
        const productDiv = document.createElement('div');
        productDiv.classList.add('colorboxcontainer','border')
        productDiv.innerHTML = `
                        <div id="colordisplay border-bottom" style="background-color: ${docData.colorhexcode}; padding: 2em 5em;" data-colorId ="product-${docData.colorId}" class=" colorbox">
                        </div>
                            <div class="d-flex align-items-center justify-content-between p-2">
                            <div class="m-r-30">
                                <p id="color-name-display" class="m-0">${docData.colorName}</p>
                                <p id="color-price-display" class="m-0">${docData.colorPrice} /Ltr</p>
                            </div>
                            <a class="select-color" id="selected-product-color" 
                            data-colorId="${doc.id}" 
                            data-colorName="${docData.colorName}"
                            data-colorPrice="${docData.colorPrice}" 
                            data-colorHexcode="${docData.colorhexcode}">
                                select
                            </a>
                        </div> 
                        `           
            productColorContainer.appendChild(productDiv);  
            productDiv.querySelector('.select-color').addEventListener('click',async(event)=>{
                event.preventDefault();
                if(event.target){
                    // console.log(event.target);
                    const colorId = event.target.getAttribute('data-colorId');
                    const colorHexcode = event.target.getAttribute('data-colorHexcode')
                    
                    if(!selectedColorIds.includes(colorId)){
                       selectedColorIds.push(colorId);
                       selectedColorHexcode.push(colorHexcode);
                    }
                    updateSelectedColorsDisplay();
                }
            })
        });   
    }
    else{
        productColorContainer.innerHTML = `<option value="">Colors not exists for this product</option>`
        displayMessage('Colors not exists for this product!', 'danger')  
    }
}

/**
 * selected colors
 * @author mydev
 */

function updateSelectedColorsDisplay(){
    selectedColorsContainer.innerHTML = ' ';
    colorCountElement.textContent = selectedColorIds.length > 0 ? `${selectedColorIds.length} Color Selected` : 'No colors selected';
    console.log("update")
    selectedColorHexcode.forEach((colorHexcode, index) => {

        console.log(colorHexcode,index)
        const colorDiv = document.createElement('div');
        colorDiv.innerHTML= 
        `<div style="background-color: ${colorHexcode}; width: 50px; height: 50px; margin-right: 10px;" 
        title="Color ${index + 1}: ${colorHexcode}">
        </div>
        <button class="delete" data-index="${index}">delete</button>
        `
        colorDiv.querySelector('.delete').addEventListener('click', () => {
            if(index>-1){
                console.log(index)
                selectedColorIds.splice(index, 1);
                selectedColorHexcode.splice(index, 1);
                updateSelectedColorsDisplay();
            }
        });
        console.log(selectedColorIds)
        console.log(selectedColorHexcode)
        selectedColorsContainer.appendChild(colorDiv);
    });
}
// --------------------------------------------------------------------------------

//------------------------------ Add sizes------------------------------------------
/**
 * save the size for product
 */
document.querySelector('#save-size-button').addEventListener('click',saveSizesFoProducts)

/**
 * to load the sizes when open the sizemodel
 * @returns mydev
 */
const openAddSizesModel = document.querySelector('#add-size-model')
openAddSizesModel.addEventListener('click',()=>{
    fetchSizesForProduct();
    document.getElementById('product-size').value = ''
})

/**
 * save sizes for product
 * @returns mydev
 */
async function saveSizesFoProducts(){  
    const productSize  = document.querySelector('#product-size').value;
    if(!productSize){
        displayMessage('Please Enter All fields!','danger');
        if (!productSize) {
            document.querySelector('#product-size').focus();
        }
        return;
    }
    const sizeCollectionRef = getSizeCollectionRef()
    const docRef = await addDoc(sizeCollectionRef,
        {
           size : productSize,
           unit : "ltr"
        });
    await updateDoc(docRef , {sizeId : docRef.id});
    fetchSizesForProduct();
    displayMessage('Product size added successfully','success');
    document.querySelector('#product-size').value = ''
}

/**
 * fetch sizes for particuler product
 * @returns mydev
 */
async function fetchSizesForProduct(){
    console.log("1")

    const productSnapshot = await getSizeDocsSnapshot();
    // console.log(productSnapshot)
    let productSizesContainer = document.querySelector('#product-size-list');
    if(!productSnapshot.empty){
        productSizesContainer.removeEventListener('click',fetchSizesForProduct);
        selectedColorsContainer.innerHTML = ''
        productSizesContainer.innerHTML = ''
        productSnapshot.forEach((doc)=>{
        const docData = doc.data();
        console.log(docData)
        const productRow = document.createElement('tr');
        productRow.innerHTML = `
                        <td data-sizeId=${docData.sizeId}>${docData.size} &nbsp ${docData.unit}</td>
                        <td>
                            <button class="btn btn-sm btn-primary edit"
                             data-sizeId="${docData.sizeId}"
                             data-size="${docData.size}">Edit</button>
                            <button class="btn btn-sm btn-danger delete"
                             data-sizeId='${docData.sizeId}'
                             data-size="${docData.size}">Delete</button>
                        </td>
                        `
            console.log(productRow)
            productSizesContainer.appendChild(productRow);

            productRow.querySelector('.edit').addEventListener('click', async (event) => {
                event.preventDefault();
                if(event.target){
                    const sizeId = event.target.getAttribute('data-sizeId');
                    const size = event.target.getAttribute('data-size')
                    editSize(sizeId,size)
                }
            });

            productRow.querySelector('.delete').addEventListener('click', async (event) => {
                event.preventDefault();
                if(event.target){
                    const sizeId = event.target.getAttribute('data-sizeId');
                    deleteSize(sizeId);
                }
            })

        });
    }
    else {
        productSizesContainer.innerHTML = `<option value="">Colors not exists for this product</option>`
        displayMessage('Sizes not exists for this product!', 'danger')
    }
}

/**
 * edit the size based on the szieId and size
 * @param {*} sizeId 
 * @param {*} size 
 */
async function editSize(sizeId,size) {
    console.log(sizeId)
    console.log('from color')
    const updatedsize = prompt('Edit Color Price:', size);

    if (updatedsize !== null) {
        const sizeQuerySnapshot = await getSizeDocsQuerySnapshot(sizeId)

        if (!sizeQuerySnapshot.empty) {
            console.log(sizeQuerySnapshot.docs[0].data())
            updateDoc(sizeQuerySnapshot.docs[0].ref, { size : updatedsize})
                .then(() => {
                    console.log(`Successfully Updated to ${updatedsize}`)
                    console.log('Color updated successfully');
                    displayMessage('size updated successfully!', 'success');
                    // document.querySelector('#categoryDropdown').addEventListener('click', loadAllCategories)
                    fetchSizesForProduct();
                })
                .catch((error) => {
                    console.error('Error updating size:', error);
                });
        }
    }
}

/**
 * delete color based on the colorId
 * @param {*} colorId 
 */
async function deleteSize(sizeId) {
    console.log(sizeId);
    const confirmation = confirm('Are you sure you want to delete this color?');

    if (confirmation) {
        try {
            const sizeQuerySnapshot = await getSizeDocsQuerySnapshot(sizeId);

            if (!sizeQuerySnapshot.empty) {
                await deleteDoc(sizeQuerySnapshot.docs[0].ref)
            }
            console.log('Color deleted successfully');
            displayMessage('Color deleted successfully!', 'success');
            // document.querySelector('#categoryDropdown').addEventListener('click', loadAllCategories)
            fetchSizesForProduct();
        } catch (error) {
            console.error('Error deleting size:', error);
        }
    }
}
// ---------------------------------------------------------------------------------------

// ------------------------------------ Select the sizes----------------------------------
var selectedSizeIds = [];
var selectedSize = []
const selectedSizesContainer = document.querySelector('.selected-size-container');
const sizeCountElement = document.querySelector('.selected-size-counter')

/**
 * open select size model
 * 
 */
const openSelectSizeModel = document.querySelector('#select-size-model')
openSelectSizeModel.addEventListener('click',()=>{
    fetchSizesForSelect();
})

/**
 * fetch the sizes for Select 
 */
async function fetchSizesForSelect(){
    console.log("1")
    const productSnapshot = await getSizeDocsSnapshot();
    // console.log(productSnapshot)
    let productSizesContainer = document.querySelector('#select-product-size-list');
    if(!productSnapshot.empty){
        selectedSizeIds = [];
        selectedSize = []
        console.log(selectedSizeIds)
        console.log(selectedSize)
        productSizesContainer.removeEventListener('click',fetchSizesForSelect);
        productSizesContainer.innerHTML = ''
        selectedSizesContainer.innerHTML = ''
        productSnapshot.forEach((doc)=>{
        const docData = doc.data();
        console.log(docData)
        const productRow = document.createElement('tr');
        productRow.innerHTML = `
                        <td data-sizeId=${docData.sizeId}>${docData.size} &nbsp ${docData.unit}</td>
                        <td>
                            <button class="btn btn-sm btn-primary select"
                             data-sizeId="${docData.sizeId}"
                             data-size="${docData.size}">Select</button>
                        </td>
                        `       
            console.log(productRow)                
            productSizesContainer.appendChild(productRow); 
            
            productRow.querySelector('.select').addEventListener('click',async(event)=>{
                event.preventDefault();
                if(event.target){
                    const sizeId = event.target.getAttribute('data-sizeId');
                    const size = event.target.getAttribute('data-size')
                    if(!selectedSizeIds.includes(sizeId)){
                        selectedSizeIds.push(sizeId);
                        selectedSize.push(size);
                     }
                    updateSelectedSizesDisplay();
                }
            });
        });
    }
    else{
        productSizesContainer.innerHTML = `<option value="">Colors not exists for this product</option>`
        displayMessage('Sizes not exists for this product!', 'danger')  
    }
}

/**
 * update selected sizes in the select size model
 * @returns mydev
 */

function updateSelectedSizesDisplay(){
    selectedSizesContainer.innerHTML = ' ';
    sizeCountElement.textContent = selectedSizeIds.length > 0 ? `${selectedSizeIds.length} Size Selected` : 'No Sizes selected';
    console.log("update")
    selectedSize.forEach((size, index) => {
        const sizeDiv = document.createElement('div');
        sizeDiv.innerHTML= 
        `<div; width: 50px; height: 50px; margin-right: 10px;" 
        title="Color ${index + 1}: ${size}">${size}
        </div>
        <button class="delete btn btn-danger mb-3" data-index="${index}" >delete</button>
        `
        sizeDiv.querySelector('.delete').addEventListener('click', () => {
            if(index>-1){
                console.log(index)
                selectedSizeIds.splice(index, 1);
                selectedSize.splice(index, 1);
                selectedSizesContainer.removeChild(sizeDiv);
                updateSelectedColorsDisplay();
            }
        });
        selectedSizesContainer.appendChild(sizeDiv);
        console.log(selectedSizeIds)
        console.log(selectedSize)
    });
}
// -------------------------------------------------------------------------

// ------------------------ Upload Product ---------------------------------
// Add a click event listener to the Upload Product
const uploadProductButton = document.getElementById('uploadProductButton');
uploadProductButton.addEventListener('click', uploadProduct);

async function uploadProduct() {
    document.querySelector('#uploadProductButton').disabled = true;
    document.querySelector('#uploadProductButton').textContent = 'Uploading ...';
    const productId = generateUniqueProductId();
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const fileInput = document.getElementById('productImage');
    const manufacturerOption = document.getElementById('manufacturer-dropdown').options[document.getElementById('manufacturer-dropdown').selectedIndex];
    const categoryOption = document.getElementById('categoryDropdown').options[document.getElementById('categoryDropdown').selectedIndex];
    console.log(manufacturerOption);
    console.log(categoryOption)
    // const colorShadeOption = document.getElementById('colorShadeDropdown').options[document.getElementById('colorShadeDropdown').selectedIndex];
    // const productSizeOption = document.getElementById('productSizeDropdown').options[document.getElementById('productSizeDropdown').selectedIndex];
    const productDescriptionTextarea = document.querySelector('#product-description');
    const productDetailsTextarea = document.querySelector('#product-details');
    const productSpecificationsTextarea = document.querySelector('#product-specifications')
    const selectedFile = fileInput.files[0];
    console.log(selectedColorIds);
    console.log(selectedSizeIds)

    if (productName && productPrice && manufacturerOption && categoryOption
         && selectedFile && productDescriptionTextarea && productDetailsTextarea
        && productSpecificationsTextarea && selectedColorIds.length!==0 && selectedSizeIds.length !==0
         ) {
        const fileName = `${productId}/${selectedFile.name}`;
        const folderRef = ref(storage, 'product-images');
        const imageRef = ref(folderRef, fileName);

        uploadBytes(imageRef, selectedFile)
            .then(async (snapshot) => {
                getDownloadURL(imageRef)
                    .then(async (downloadURL) => {
                        let productData = ''
                            productData = {
                                productId: productId,
                                name: productName,
                                price: parseFloat(productPrice),
                                imageUrl: downloadURL,
                                manufacturerName: manufacturerOption.value,
                                manufacturerId: manufacturerOption.getAttribute('data-id'),
                                categoryName: categoryOption.value,
                                categoryId: categoryOption.getAttribute('data-id'),
                                colorIds :selectedColorIds,
                                sizeIds : selectedSizeIds,
                                ProductDescription: productDescriptionTextarea.value,
                                productDetails:productDetailsTextarea.value,
                                productSpecifications:productSpecificationsTextarea.value,
                            };
                        const productCollectionRef = getProductCollectionRef();

                        const productDocRef =await addDoc(productCollectionRef, productData);
                           await updateDoc(productDocRef,{productId:productDocRef.id})
                            .then(() => {
                                displayMessage('Product Uploaded Successfully!', 'success')

                                document.querySelector('#uploadProductButton').disabled = false;
                                document.querySelector('#uploadProductButton').textContent = 'Upload Product';
                                document.getElementById('productInfoForm').reset();
                            })
                            .catch((error) => {
                                document.querySelector('#uploadProductButton').disabled = false;
                                document.querySelector('#uploadProductButton').textContent = 'Upload Product';
                                console.error('Error adding product information to Firestore:', error);
                            });
                    })
                    .catch((error) => {
                        document.querySelector('#uploadProductButton').disabled = false;
                        document.querySelector('#uploadProductButton').textContent = 'Upload Product';
                        console.error('Error getting image download URL:', error);
                    });
            })
            .catch((error) => {
                document.querySelector('#uploadProductButton').disabled = false;
                document.querySelector('#uploadProductButton').textContent = 'Upload Product';
                console.error('Error uploading image: ', error);
            });
    } else {
        displayMessage('Please fill in all product information and select an image.', 'danger')

        document.querySelector('#uploadProductButton').disabled = false;
        document.querySelector('#uploadProductButton').textContent = 'Upload Product';
    }
}

//-------------------------------- Membership id ---------------------------------------

//Generate unique membershipId
function generateUniqueMembershipId() {
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    const formattedTime = formatTime(currentDate);

    // Generate a random alphanumeric string
    const randomString = generateRandomString(6);

    // Combine date, time, and random string to create the unique ID
    const membershipId = `${formattedDate}${formattedTime}${randomString}`;
    return membershipId;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}${minutes}${seconds}`;
}

function generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset.charAt(randomIndex);
    }
    return result;
}

//--------------------------------- GenerateUniqueProdcutId ---------------------------

//Unique productId
function generateUniqueProductId() {
    const timestamp = new Date().getTime();
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `${timestamp}_${randomPart}`;
}

function editProduct() {
    // Redirect to product-edit.html with the product ID as a query parameter
    window.location.href = 'product-edit.html';
}

//--------------------------------- toast message ------------------------------------

//display message function
/**
 * 
 * @param {*} message 
 * @param {*} type 
 * 
 * Toast message
 */
function displayMessage(message, type) {
    // Get the toast container element
    const toastContainer = document.querySelector(".toast-container");

    // Create a clone of the toast template
    const toast = document.querySelector(".toast").cloneNode(true);

    // console.log(toast)
    // Set the success message
    toast.querySelector(".compare-note").innerHTML = message;

    //set text type  success/danger
    if (type === "danger") {
        toast.classList.remove("bg-success");
        toast.classList.add("bg-danger");
    } else {
        toast.classList.add("bg-success");
        toast.classList.remove("bg-danger");
    }

    // Append the toast to the container
    toastContainer.appendChild(toast);

    // Initialize the Bootstrap toast and show it
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove the toast after it's closed
    toast.addEventListener("hidden.bs.toast", function () {
        toast.remove();
    });
}

//---------------------------------------------------------------------------

/**
 * 
 * @returns promise
 */
async function fetchNavCategories() {
    const categoryList = document.querySelector('.nav-category')
    const mobileCategoryList = document.querySelector('.mobile-nav-category')

    categoryList.innerHTML = `
    <div class='w-100 d-flex justify-content-center'>
        <div class="spinner-grow text-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
    `
    mobileCategoryList.innerHTML = `
    <div class='w-100 d-flex justify-content-center'>
        <div class="spinner-grow text-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
    `
    const categorySnapshot = await getDocs(collection(firestore, 'categories'))
    if (categorySnapshot.empty) {
        console.log('from empty')
        resolve()
        return
    }

    categoryList.innerHTML = ``
    mobileCategoryList.innerHTML = ``

    categorySnapshot.forEach(doc => {
        const span = document.createElement('span')
        span.innerHTML = `
        <div class="gi-tab-list nav flex-column nav-pills me-3" id="v-pills-tab"
        role="tablist" aria-orientation="vertical">
            <button class="nav-link" id="v-pills-home-tab" data-bs-toggle="pill"
                data-bs-target="#v-pills-home" type="button" role="tab"
                aria-controls="v-pills-home" aria-selected="true"><a class="text-decoration-none text-black" href="products.html?categoryId=${doc.data().categoryId}">${doc.data().name}</a>
            </button>
        </div>
        `
        categoryList.appendChild(span)

        const list = document.createElement('li')
        list.innerHTML = `
        <a href="javascript:void(0)">${doc.data().name}</a>
        `
        mobileCategoryList.appendChild(list)
    })
}