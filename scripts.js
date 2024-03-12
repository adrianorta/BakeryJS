const initializeLocalStorageItem = (key, defaultValue) => {
    if (localStorage.getItem(key) === null) {
        updateLocalStorage(key, defaultValue);
    }
};

function updateLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

const confirmAction = (message) => window.confirm(message);

// Initialize local storage items
initializeLocalStorageItem("Recipes", []);
initializeLocalStorageItem("Ingredients", []);
initializeLocalStorageItem("Packagings", []);
initializeLocalStorageItem("HourlyWage", 10);

// Constants for units of measure
const UnitsOfMeasure = {
    Cup: "Cup",
    Tablespoon: "Tablespoon",
    Teaspoon: "Teaspoon",
    Ounce: "Ounce",
    Pint: "Pint",
    Quart: "Quart",
    Gallon: "Gallon",
    Unit: "Unit",
    Gram: "Gram",
    Pound: "Pound",
    Milliliter: "Milliliter"
};

// Retrieve data from local storage
let recipes = JSON.parse(localStorage.getItem("Recipes"));
let ingredients = JSON.parse(localStorage.getItem("Ingredients"));
let packagings = JSON.parse(localStorage.getItem("Packagings"));
let hourlyWage = parseFloat(localStorage.getItem("HourlyWage"));
let recipeIngredientCount = 0;
let recipePackagingCount = 0;
let ingredientsList = [];

// UI-related code
if (document.getElementById("addRecipeCard")) {
    if(ingredients.length > 0){
        addRecipeIngredientControls();
    }
    if(packagings.length > 0){
        addRecipePackagingControls();
    }
    addUnitOfMeasureToIngredientControls();
    document.getElementById("addRecipe").onclick = addRecipe;
    document.getElementById("addIngredient").onclick = addIngredient;
    document.getElementById("addPackaging").onclick = addPackaging;
    document.getElementById("newIngredientType").onchange = () => { updateUnitOfMeasurementSelect('newIngredientName', 'newIngredientType', 'newIngredientUnitOfMeasure'); };
    updateUnitOfMeasurementSelect('newIngredientName', 'newIngredientType', 'newIngredientUnitOfMeasure');
}

if (document.getElementById("recipeContent")) {
    displayRecipes();
    document.getElementById("filter").onkeyup = displayRecipes;
}

if (document.getElementById("ingredientContent")) {
    displayIngredients();
    addUnitOfMeasureToIngredientControls();
    document.getElementById("newIngredientType").onchange = () => { updateUnitOfMeasurementSelect('newIngredientName', 'newIngredientType', 'newIngredientUnitOfMeasure'); };
    document.getElementById("filter").onkeyup = displayIngredients;
}

if (document.getElementById("packagingContent")) {
    displayPackagings();
    document.getElementById("filter").onkeyup = displayPackagings;
}

// Update hourly wage display
if (document.getElementById('hourlyWageSpan')) {
    document.getElementById('hourlyWageSpan').innerText = `$${hourlyWage}`;
}

// Handle backup file upload
if (document.getElementById('uploadBackup')) {
    document.getElementById('uploadBackup').addEventListener('change', (event) => {
        const myFile = event.target.files[0];
        const lastDot = myFile.name.lastIndexOf('.');
        const ext = myFile.name.substring(lastDot + 1);

        if(ext == "pdf"){
            const pdfFile = event.target.files[0];
            extractTextFromPDF(pdfFile)
            .then((text) => {
                let output = text.split('**');
                localStorage.setItem('Recipes', output[0]);
                localStorage.setItem('Ingredients', output[1]);
                localStorage.setItem('Packagings', output[2]);
                localStorage.setItem('HourlyWage', output[3]);
                window.location.reload();
            })
            .catch((error) => {
                console.error('Error extracting text:', error);
            });
        }
        else{
            uploadTXT(myFile);
        }
    });
}

function extractTextFromPDF(pdfFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const pdfData = new Uint8Array(event.target.result);
            const loadingTask = pdfjsLib.getDocument({ data: pdfData });
            
            loadingTask.promise.then(function(pdf) {
                const numPages = pdf.numPages;
                let fullText = '';
                let promises = [];
                
                // Iterate through each page of the PDF
                for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                    promises.push(
                        pdf.getPage(pageNum).then(function(page) {
                            // Extract text content from each page
                            return page.getTextContent().then(function(textContent) {
                                const textItems = textContent.items;
                                let pageText = '';
                                
                                // Concatenate text items to form text for each page
                                for (let i = 0; i < textItems.length; i++) {
                                    pageText += textItems[i].str;
                                }
                                
                                fullText += pageText; // Append page text to full text
                            });
                        })
                    );
                }
                
                // Resolve with the full extracted text when all pages are processed
                Promise.all(promises).then(() => resolve(fullText));
            }).catch((error) => reject(error));
        };
        
        reader.readAsArrayBuffer(pdfFile);
    });
}

    

function uploadTXT(txtFile){
    const reader = new FileReader();
    reader.addEventListener('load', (e) => {
        const output = e.target.result.split('**');
        localStorage.setItem('Recipes', output[0]);
        localStorage.setItem('Ingredients', output[1]);
        localStorage.setItem('Packagings', output[2]);
        localStorage.setItem('HourlyWage', output[3]);
        window.location.reload();
    });

    reader.readAsBinaryString(txtFile);

}


function createRecipeCard(recipe, rowNumber) {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'card display-card';

    const recipeCardBody = document.createElement('div');
    recipeCardBody.className = 'card-body';
    recipeCardBody.id = `${recipe.name}-card-body`;

    const recipeCardTitle = document.createElement('a');
    recipeCardTitle.className = 'card-title';
    recipeCardTitle.innerText = recipe.name;
    recipeCardTitle.setAttribute('data-toggle', 'collapse');
    recipeCardTitle.setAttribute('href', `#card-collapse${(recipe.name).replace(/\s/g, "")}`);
    recipeCardBody.appendChild(recipeCardTitle);
    
    const recipeServings = document.createElement('p');
    recipeServings.innerText = `${recipe.servings} servings`;
    recipeServings.className = 'text-muted font-italic';
    recipeCardBody.appendChild(recipeServings);

    const recipeCardCollapse = document.createElement('div');
    recipeCardCollapse.className = 'collapse';
    recipeCardCollapse.id = `card-collapse${(recipe.name).replace(/\s/g, "")}`;

    for (const ingredient of recipe.ingredients) {
        const recipeCardIngredient = document.createElement('p');
        recipeCardIngredient.innerText = `${ingredient.amount} ${ingredient.unitOfMeasure}(s) of ${ingredient.name}`;
        recipeCardIngredient.className = 'card-text';
        recipeCardCollapse.appendChild(recipeCardIngredient);
    }

    const recipeNotes = document.createElement('p');
    recipeNotes.innerText = `Notes:\n${recipe.notes}`;
    recipeNotes.className = 'text-muted font-italic card-text';
    recipeCardCollapse.appendChild(recipeNotes);
    recipeCardBody.appendChild(recipeCardCollapse);

    const updateButton = document.createElement('button');
    updateButton.className = 'btn btn-info mr-2';
    updateButton.setAttribute('data-toggle', 'modal');
    updateButton.setAttribute('data-target', '#updateModal');
    updateButton.onclick = () => {
        updateRecipeByName(recipe.name);
    };

    const updateIcon = document.createElement('i');
    updateIcon.className = 'fa-solid fa-pen-to-square';
    updateButton.appendChild(updateIcon);

    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger';
    deleteButton.onclick = () => {
        deleteRecipeByName(recipe.name);
    };

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa-solid fa-trash';
    deleteButton.appendChild(deleteIcon);

    const recipePriceElement = document.createElement('h3');
    recipePriceElement.className = "text-success"
    const recipePrice = getRecipePrice(recipe.name);
    recipePriceElement.innerText =`\$${recipePrice}`;

    const recipePricePerServingElement = document.createElement('h6');
    recipePricePerServingElement.className = "text-success"
    const recipePricePerServing = (recipePrice / recipe.servings).toFixed(2);
    recipePricePerServingElement.innerText =`(\$${recipePricePerServing} per serving)`;
    
    // Create checkboxes for halving, doubling, and tripling ingredients
    const checkboxContainer = document.createElement('div');
    const halfCheckbox = createAdjustmentCheckbox('half', '0.5x', recipe.name);
    const singleCheckbox = createAdjustmentCheckbox('single', '1x', recipe.name);
    const doubleCheckbox = createAdjustmentCheckbox('double', '2x', recipe.name);
    const oneAndHalfCheckbox = createAdjustmentCheckbox('oneAndHalf', '1.5x', recipe.name);
    const tripleCheckbox = createAdjustmentCheckbox('triple', '3x', recipe.name);

    checkboxContainer.appendChild(halfCheckbox);
    checkboxContainer.appendChild(singleCheckbox);
    checkboxContainer.appendChild(oneAndHalfCheckbox);
    checkboxContainer.appendChild(doubleCheckbox);
    checkboxContainer.appendChild(tripleCheckbox);

    recipeCardBody.appendChild(recipePriceElement);
    recipeCardBody.appendChild(recipePricePerServingElement);
    cardFooter.appendChild(checkboxContainer);
    cardFooter.appendChild(updateButton);
    cardFooter.appendChild(deleteButton);
    
    
    recipeCard.appendChild(recipeCardBody);
    recipeCard.appendChild(cardFooter);
    return recipeCard;
}

function createAdjustmentCheckbox(idSuffix, label, recipeName) {
    let container = document.createElement('span');
    container.classList.add("mr-2");
    container.classList.add("mb-2");
    let checkbox = document.createElement('input');
    checkbox.className = "mr-1";
    checkbox.type = 'radio';
    checkbox.id = `adjust-${idSuffix}-${recipeName}`;
    checkbox.name = `adjustment-${recipeName}`;
    checkbox.value = label;
    checkbox.onchange = handleAdjustmentChange; // Function to handle the change event
  
    const checkboxLabel = document.createElement('label');
    checkboxLabel.htmlFor = `adjust-${idSuffix}`;
    checkboxLabel.textContent = label;
  
    container.appendChild(checkbox);
    container.appendChild(checkboxLabel);
  
    return container;
  }

  function handleAdjustmentChange(event) {
    const adjustmentType = event.target.value;
    const recipeName = event.target.closest('.card').querySelector('.card-title').innerText;
    const recipe = getRecipeByName(recipeName); // Function to retrieve the recipe object by name
  
    let adjustmentFactor;
    switch (adjustmentType) {
      case '0.5x':
        adjustmentFactor = 0.5;
        break;
      case '2x':
        adjustmentFactor = 2;
        break;
      case '1.5x':
        adjustmentFactor = 1.5;
        break;
      case '3x':
        adjustmentFactor = 3;
        break;
    case '1x':
        adjustmentFactor = 1;
        break;
      default:
        adjustmentFactor = 1; // No adjustment
    }
  
    // Update the displayed ingredients and prices based on the adjustment factor
    updateRecipeDisplay(recipe, adjustmentFactor);
  }

function createRecipeCardRow(rowId) {
    const newRecipeCardRow = document.createElement('div');
    newRecipeCardRow.className = 'card-deck py-2';
    newRecipeCardRow.id = rowId;
    return newRecipeCardRow;
}

function updateRecipeDisplay(recipe, adjustmentFactor) {

    const recipeCardBody = document.getElementById(`${recipe.name}-card-body`);
    recipeCardBody.querySelector('h3').innerText = `\$${getRecipePrice(recipe.name, adjustmentFactor)}`;
    recipeCardBody.querySelector('h6').innerText = `(\$${(getRecipePrice(recipe.name, adjustmentFactor)/recipe.servings*adjustmentFactor).toFixed(2)} per serving)`;
    recipeCardBody.querySelector('.text-muted').innerText = `${recipe.servings*adjustmentFactor} servings`;
}

function displayRecipes() {
    const filter = capitalize(document.getElementById('filter').value)
    const displayedRecipes = recipes.filter((recipe) => {
        const recipeObj = JSON.parse(recipe);
        return recipeObj.name.toLowerCase().includes(filter.toLowerCase());
    });
    document.getElementById('recipeContent').innerHTML = '';
    for (let i = 0; i < displayedRecipes.length; i++) {
        const recipeJSONObject = JSON.parse(displayedRecipes[i]);
        const recipeCardRowId = `recipeCardRow${Math.floor(i / 4)}`;

        if (i % 4 === 0) {
            const newRecipeCardRow = createRecipeCardRow(recipeCardRowId);
            document.getElementById('recipeContent').appendChild(newRecipeCardRow);
        }

        const recipeCard = createRecipeCard(recipeJSONObject);
        const existingRecipeCardRow = document.getElementById(recipeCardRowId);
        existingRecipeCardRow.appendChild(recipeCard);
    }
}

function createIngredientCard(ingredient) {
    const ingredientCard = document.createElement('div');
    ingredientCard.className = 'card display-card';

    const ingredientCardBody = document.createElement('div');
    ingredientCardBody.className = 'card-body';

    const ingredientCardTitle = document.createElement('h3');
    ingredientCardTitle.className = 'card-title';
    ingredientCardTitle.innerText = ingredient.name;
    ingredientCardBody.appendChild(ingredientCardTitle);

    const ingredientCardInfo = document.createElement('p');
    ingredientCardInfo.innerText = `${ingredient.amount} ${ingredient.unitOfMeasure} for $${ingredient.cost}`;
    ingredientCardInfo.className = 'card-text';
    ingredientCardBody.appendChild(ingredientCardInfo);

    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';

    const updateButton = document.createElement('button');
    updateButton.className = 'btn btn-info mr-2';
    updateButton.setAttribute('data-toggle', 'modal');
    updateButton.setAttribute('data-target', '#updateModal');
    updateButton.onclick = () => {
        updateIngredientByName(ingredient.name);
    };

    const updateIcon = document.createElement('i');
    updateIcon.className = 'fa-solid fa-pen-to-square';
    updateButton.appendChild(updateIcon);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger';
    deleteButton.onclick = () => {
        deleteIngredientByName(ingredient.name);
    };

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa-solid fa-trash';
    deleteButton.appendChild(deleteIcon);
    
    cardFooter.appendChild(updateButton);
    cardFooter.appendChild(deleteButton);
    ingredientCard.appendChild(ingredientCardBody);
    ingredientCard.appendChild(cardFooter);

    return ingredientCard;
}

function createIngredientCardRow(rowId) {
    const newIngredientCardRow = document.createElement('div');
    newIngredientCardRow.className = 'card-deck py-2';
    newIngredientCardRow.id = rowId;
    return newIngredientCardRow;
}

function displayIngredients() {
    const filter = capitalize(document.getElementById('filter').value)
    const displayedIngredients = ingredients.filter((ingredient) => {
        const ingredientObj = JSON.parse(ingredient);
        return ingredientObj.name.toLowerCase().includes(filter.toLowerCase());
    });
    document.getElementById('ingredientContent').innerHTML = '';
    for (let i = 0; i < displayedIngredients.length; i++) {
        const ingredientJSONObject = JSON.parse(displayedIngredients[i]);
        const ingredientCardRowId = `ingredientCardRow${Math.floor(i / 4)}`;

        if (i % 4 === 0) {
            const newIngredientCardRow = createIngredientCardRow(ingredientCardRowId);
            document.getElementById('ingredientContent').appendChild(newIngredientCardRow);
        }

        const ingredientCard = createIngredientCard(ingredientJSONObject);
        const existingIngredientCardRow = document.getElementById(ingredientCardRowId);
        existingIngredientCardRow.appendChild(ingredientCard);
    }
}

function createPackagingCard(packaging) {
    const packagingCard = document.createElement('div');
    packagingCard.className = 'card display-card';

    const packagingCardBody = document.createElement('div');
    packagingCardBody.className = 'card-body';

    const packagingCardTitle = document.createElement('h3');
    packagingCardTitle.className = 'card-title';
    packagingCardTitle.innerText = packaging.name;
    packagingCardBody.appendChild(packagingCardTitle);

    const packagingCardInfo = document.createElement('p');
    packagingCardInfo.innerText = `${packaging.amount} for $${packaging.cost}`;
    packagingCardInfo.className = 'card-text';
    packagingCardBody.appendChild(packagingCardInfo);

    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';

    const updateButton = document.createElement('button');
    updateButton.className = 'btn btn-info mr-2';
    updateButton.setAttribute('data-toggle', 'modal');
    updateButton.setAttribute('data-target', '#updateModal');
    updateButton.onclick = () => {
        updatePackagingByName(packaging.name);
    };

    const updateIcon = document.createElement('i');
    updateIcon.className = 'fa-solid fa-pen-to-square';
    updateButton.appendChild(updateIcon);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger';
    deleteButton.onclick = () => {
        deletePackagingByName(packaging.name);
    };

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa-solid fa-trash';
    deleteButton.appendChild(deleteIcon);

    cardFooter.appendChild(updateButton);
    cardFooter.appendChild(deleteButton);
    packagingCard.appendChild(packagingCardBody);
    packagingCard.appendChild(cardFooter);

    return packagingCard;
}

function createPackagingCardRow(rowId) {
    const newPackagingCardRow = document.createElement('div');
    newPackagingCardRow.className = 'card-deck py-2';
    newPackagingCardRow.id = rowId;
    return newPackagingCardRow;
}

function displayPackagings() {
    const filter = capitalize(document.getElementById('filter').value)
    const displayedPackagings = packagings.filter((packaging) => {
        const packagingObj = JSON.parse(packaging);
        return packagingObj.name.toLowerCase().includes(filter.toLowerCase());
    });
    document.getElementById('packagingContent').innerHTML = '';
    for (let i = 0; i < displayedPackagings.length; i++) {
        const packagingJSONObject = JSON.parse(displayedPackagings[i]);
        const packagingCardRowId = `packagingCardRow${Math.floor(i / 4)}`;

        if (i % 4 === 0) {
            const newPackagingCardRow = createPackagingCardRow(packagingCardRowId);
            document.getElementById('packagingContent').appendChild(newPackagingCardRow);
        }

        const packagingCard = createPackagingCard(packagingJSONObject);
        const existingPackagingCardRow = document.getElementById(packagingCardRowId);
        existingPackagingCardRow.appendChild(packagingCard);
    }
}

function addIngredientToRecipe(ingredientIndex) {
    const ingredientName = capitalize(document.getElementById(`ingredientName${ingredientIndex}`).value);
    const ingredientAmount = document.getElementById(`ingredientAmount${ingredientIndex}`).value;
    const ingredientUnitOfMeasure = document.getElementById(`ingredientUnitOfMeasureSelect${ingredientIndex}`).value;
    return `{"name":"${ingredientName}","amount":"${ingredientAmount}","unitOfMeasure":"${ingredientUnitOfMeasure}"},`;
}

function addPackagingToRecipe(packagingIndex) {
    const packagingName = capitalize(document.getElementById(`packagingName${packagingIndex}`).value);
    const packagingAmount = document.getElementById(`packagingAmount${packagingIndex}`).value;
    return `{"name":"${packagingName}","amount":"${packagingAmount}"},`;
}

function checkRequiredFields(id) {
    for (const el of document.getElementById(id).querySelectorAll('[required]')) {
        if (el.value.trim() === '') {
            document.getElementById('errorBannerRecipe').classList.remove('d-none');
            document.getElementById('errorTextRecipe').innerText = 'You must fill out all required fields!';
            return false;
        }
    }
    return true;
}

function addRecipe(e) {
    const recipeName = capitalize(document.getElementById('newRecipeName').value);
    const recipeNotes = document.getElementById('newRecipeNotes').value;
    const recipeTime = document.getElementById('newRecipeTime').value;
    const recipeServings = document.getElementById('newRecipeServings').value;

    const recipeIngredients = [];
    const recipePackaging = [];
    //get each ingredient row
    let recipeIngredientRowElements = document.querySelectorAll("[id^='ingredientRow']");

    for (let i = 0; i < recipeIngredientRowElements.length; i++) {
        const ingredientId = recipeIngredientRowElements[i].id;
        const ingredientIndex = ingredientId.split("ingredientRow")[1];
        recipeIngredients.push(addIngredientToRecipe(ingredientIndex));
    }
    const recipeIngredientsString = recipeIngredients.join('').slice(0, -1);

    let recipePackagingRowElements = document.querySelectorAll("[id^='packagingRow']");

    for (let i = 0; i < recipePackagingRowElements.length; i++) {
        const packagingId = recipePackagingRowElements[i].id;
        let packagingIndex = packagingId.charAt(packagingId.length - 1);
        recipePackaging.push(addPackagingToRecipe(packagingIndex));
    }
    const recipePackagingString = recipePackaging.join('').slice(0, -1);

    const recipe = `{"name":"${recipeName}","ingredients":[${recipeIngredientsString}],"notes":"${recipeNotes}","time":"${recipeTime}","packagings":[${recipePackagingString}],"servings":"${recipeServings}"}`;

    const recipeExists = recipes.some((recipeItem) => JSON.parse(recipeItem).name === recipeName);

    if (!checkRequiredFields('addRecipeControls')) {
        return;
    }

    if (!recipeExists) {
        recipes.push(recipe);
        updateLocalStorage('Recipes', recipes);
        window.location.reload();
    } else if (recipeExists && e.currentTarget.id === 'modalUpdateBtn') {
        const indexToUpdate = recipes.findIndex((recipeItem) => JSON.parse(recipeItem).name === recipeName);
        recipes[indexToUpdate] = recipe;
        updateLocalStorage('Recipes', recipes);
        window.location.reload();
    } else {
        document.getElementById('errorBannerRecipe').classList.remove('d-none');
        document.getElementById('errorTextRecipe').innerText = 'There is already a recipe with that name!';
    }
}

function createUnitOfMeasurementDropdown() {
    const select = document.createElement('select');
    select.className = 'form-control';
    select.id = 'newIngredientUnitOfMeasure';
    select.placeholder = "Measure";

    const addOption = (value, text) => {
        const option = document.createElement('option');
        option.value = value;
        option.innerText = text;
        select.appendChild(option);
    };

    addOption(UnitsOfMeasure.Cup, 'Cup');
    addOption(UnitsOfMeasure.Gallon, 'Gallon');
    addOption(UnitsOfMeasure.Gram, 'Gram');
    addOption(UnitsOfMeasure.Pound, 'Pound');
    addOption(UnitsOfMeasure.Milliliter, 'Milliliter');
    addOption(UnitsOfMeasure.Ounce, 'Ounce');
    addOption(UnitsOfMeasure.Pint, 'Pint');
    addOption(UnitsOfMeasure.Quart, 'Quart');
    addOption(UnitsOfMeasure.Tablespoon, 'Tablespoon');
    addOption(UnitsOfMeasure.Teaspoon, 'Teaspoon');
    addOption(UnitsOfMeasure.Unit, 'Unit');

    return select;
}


function addUnitOfMeasureToIngredientControls() {
    const col = document.createElement('div');
    const ingredientControls = document.getElementById('ingredientControls');
    const newIngredientCostColumn = document.getElementById('newIngredientCostColumn');
    col.className = 'col form-floating';
    

    const select = createUnitOfMeasurementDropdown();
    col.appendChild(select);

    const label = document.createElement('label');
    label.for = select.id;
    label.innerText = "Measure";
    col.appendChild(label);
    
    ingredientControls.insertBefore(col, newIngredientCostColumn);
}

function addIngredient(e) {
    const ingredientName = capitalize(document.getElementById('newIngredientName').value);
    const ingredientAmount = document.getElementById('newIngredientAmount').value;
    const ingredientUnitOfMeasure = document.getElementById('newIngredientUnitOfMeasure').value;
    const ingredientCost = document.getElementById('newIngredientCost').value;
    const ingredientType = document.getElementById('newIngredientType').value;

    const ingredientExists = ingredients.some((ingredientItem) => JSON.parse(ingredientItem).name === ingredientName);

    if (!checkRequiredFields('addIngredientControls')) {
        return;
    }

    const ingredient = `{"name":"${ingredientName}","amount":"${ingredientAmount}","unitOfMeasure":"${ingredientUnitOfMeasure}","cost":"${ingredientCost}","type":"${ingredientType}"}`;

    if (!ingredientExists) {
        ingredients.push(ingredient);
        updateLocalStorage('Ingredients', ingredients);
        window.location.reload();
    } else if (ingredientExists && e.currentTarget.id === 'modalUpdateBtn') {
        const indexToUpdate = ingredients.findIndex((ingredientItem) => JSON.parse(ingredientItem).name === ingredientName);
        ingredients[indexToUpdate] = ingredient;
        updateLocalStorage('Ingredients', ingredients);
        window.location.reload();
    } else {
        document.getElementById('errorBannerIngredient').classList.remove('d-none');
        document.getElementById('errorTextIngredient').innerText = 'There is already an ingredient with that name!';
    }
}

function addPackaging(e) {
    const packagingName = capitalize(document.getElementById('newPackagingName').value);
    const packagingAmount = document.getElementById('newPackagingAmount').value;
    const packagingCost = document.getElementById('newPackagingCost').value;

    const packagingExists = packagings.some((packagingItem) => JSON.parse(packagingItem).name === packagingName);

    const packaging = `{"name":"${packagingName}","amount":"${packagingAmount}","cost":"${packagingCost}"}`;

    if (!checkRequiredFields('addPackagingControls')) {
        return;
    }

    if (!packagingExists) {
        packagings.push(packaging);
        updateLocalStorage('Packagings', packagings);
        window.location.reload();
    } else if (packagingExists && e.currentTarget.id === 'modalUpdateBtn') {
        const indexToUpdate = packagings.findIndex((packagingItem) => JSON.parse(packagingItem).name === packagingName);
        packagings[indexToUpdate] = packaging;
        updateLocalStorage('Packagings', packagings);
        window.location.reload();
    } else {
        document.getElementById('errorBannerPackaging').classList.remove('d-none');
        document.getElementById('errorTextPackaging').innerText = 'There is already a packaging with that name!';
    }
}

function deleteRecipeByName(name) {
    if (confirmAction(`Are you sure you want to delete ${name}?`)) {
        updateLocalStorage('Recipes', recipes.filter(e => !e.startsWith(`{"name":"${name}`)));
        window.location.reload();
    }
}

function deleteIngredientByName(name) {
    if (confirmAction(`Are you sure you want to delete ${name}?`)) {
        updateLocalStorage('Ingredients', ingredients.filter(e => !e.startsWith(`{"name":"${name}`)));
        window.location.reload();
    }
}

function deletePackagingByName(name) {
    if (confirmAction(`Are you sure you want to delete ${name}?`)) {
        updateLocalStorage('Packagings', packagings.filter(e => !e.startsWith(`{"name":"${name}`)));
        window.location.reload();
    }
}

function updateRecipeByName(recipeName) {
    const recipe = getRecipeByName(recipeName);
    const addRecipeIngredientsBtn = document.getElementById('addRecipeIngredientsBtn');
    const addRecipePackagingsBtn = document.getElementById('addRecipePackagingsBtn');

    const ingredientDeleteBtns = document.querySelectorAll('[id^="ingredientDelete"]');
    for (const btn of ingredientDeleteBtns) {
        btn.click();
    }

    const packagingDeleteBtns = document.querySelectorAll('[id^="packagingDelete"]');
    for (const btn of packagingDeleteBtns) {
        btn.click();
    }

    document.getElementById('updateModalLabel').innerText = `Update ${recipeName}`;
    document.getElementById('newRecipeName').value = recipe.name;
    document.getElementById('newRecipeTime').value = recipe.time;
    document.getElementById('newRecipeServings').value = recipe.servings;
    document.getElementById('newRecipeNotes').value = recipe.notes;

    for (let i = 0; i < recipe.ingredients.length; i++) {
        addRecipeIngredientsBtn.click();
        const currentRecipeIngredient = recipe.ingredients[i];
        document.getElementById(`ingredientName${recipeIngredientCount}`).value = currentRecipeIngredient.name;
        const event = new Event('change');
        document.getElementById(`ingredientName${recipeIngredientCount}`).dispatchEvent(event);
        document.getElementById(`ingredientAmount${recipeIngredientCount}`).value = currentRecipeIngredient.amount;
        document.getElementById(`ingredientUnitOfMeasureSelect${recipeIngredientCount}`).value = currentRecipeIngredient.unitOfMeasure;
    }

    for (let i = 0; i < recipe.packagings.length; i++) {
        addRecipePackagingsBtn.click();
        const currentRecipePackaging = recipe.packagings[i];
        document.getElementById(`packagingName${recipePackagingCount}`).value = currentRecipePackaging.name;
        document.getElementById(`packagingAmount${recipePackagingCount}`).value = currentRecipePackaging.amount;
    }

    const modalUpdateBtn = document.getElementById('modalUpdateBtn');
    modalUpdateBtn.onclick = (e) => addRecipe(e);
}

function updateIngredientByName(ingredientName) {
    const ingredient = getIngredientByName(ingredientName);

    document.getElementById('updateModalLabel').innerText = `Update ${ingredientName}`;
    document.getElementById('newIngredientName').value = ingredient.name;
    document.getElementById('newIngredientAmount').value = ingredient.amount;
    document.getElementById('newIngredientCost').value = ingredient.cost;
    document.getElementById('newIngredientType').value = ingredient.type;
    updateUnitOfMeasurementSelect('newIngredientName', 'newIngredientType', 'newIngredientUnitOfMeasure');
    document.getElementById('newIngredientUnitOfMeasure').value = ingredient.unitOfMeasure;

    const modalUpdateBtn = document.getElementById('modalUpdateBtn');
    modalUpdateBtn.onclick = (e) => addIngredient(e);
}

function updatePackagingByName(packagingName) {
    const packaging = getPackagingByName(packagingName);

    document.getElementById('updateModalLabel').innerText = `Update ${packagingName}`;
    document.getElementById('newPackagingName').value = packaging.name;
    document.getElementById('newPackagingAmount').value = packaging.amount;
    document.getElementById('newPackagingCost').value = packaging.cost;

    const modalUpdateBtn = document.getElementById('modalUpdateBtn');
    modalUpdateBtn.onclick = (e) => addPackaging(e);
}

function save(){
    const saveLink = document.createElement('a');
    saveLink.href = "data:text/plain;charset=utf-8," + encodeURIComponent(localStorage.getItem("Recipes") + "**" + localStorage.getItem("Ingredients") + "**" + localStorage.getItem("Packagings") + "**" + localStorage.getItem("HourlyWage"));
    saveLink.download = "db.txt";
    document.body.appendChild(saveLink);
    saveLink.click();
}

function clearLocalStorage(){
    if (confirmAction(`This will erase EVERYTHING. Are you sure you want to delete EVERYTHING?`)) {
        save();
        if(confirmAction("I'm going to save first just in case OK?")){
            localStorage.clear();
            window.location.reload();
        }
    }
}

function createIngredientRow(recipeIngredientCount) {
    const divRow = document.createElement('div');
    divRow.className = 'form-row form-group';
    divRow.id = `ingredientRow${recipeIngredientCount}`;

    const createCol = (className) => {
        const divCol = document.createElement('div');
        divCol.className = className;
        return divCol;
    };

    const ingredientName = createCol('col form-floating');
    ingredientName.appendChild(generateIngredientSelect(`ingredientName${recipeIngredientCount}`, `ingredientType${recipeIngredientCount}s`, `ingredientUnitOfMeasureSelect${recipeIngredientCount}`));
    const ingredientNameLabel = createFloatingLabel(`ingredientName${recipeIngredientCount}`, "Name");
    ingredientName.appendChild(ingredientNameLabel);

    const ingredientAmount = createCol('col form-floating');
    ingredientAmount.innerHTML = `
        <input id="ingredientAmount${recipeIngredientCount}" class="form-control" type="number" required placeholder="Amount">
    `;
    const ingredientAmountLabel = createFloatingLabel(`ingredientAmount${recipeIngredientCount}`, "Amount");
    ingredientAmount.appendChild(ingredientAmountLabel);

    const ingredientUnitOfMeasure = createCol('col form-floating');
    const select = createUnitOfMeasurementDropdown();
    select.id = `ingredientUnitOfMeasureSelect${recipeIngredientCount}`;
    ingredientUnitOfMeasure.appendChild(select);
    const ingredientUnitOfMeasureLabel = createFloatingLabel(`ingredientUnitOfMeasureSelect${recipeIngredientCount}`, "Measure");
    ingredientUnitOfMeasure.appendChild(ingredientUnitOfMeasureLabel);

    const deleteRowButton = createCol('col align-self-center');
    deleteRowButton.innerHTML = `
        <button id="ingredientDelete${recipeIngredientCount}" class="btn btn-danger" onclick="removeIngredientRow(${recipeIngredientCount})">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    divRow.appendChild(ingredientName);
    divRow.appendChild(ingredientAmount);
    divRow.appendChild(ingredientUnitOfMeasure);
    divRow.appendChild(deleteRowButton);

    return divRow;
}

function createPackagingRow(recipePackagingCount) {
    const divRow = document.createElement('div');
    divRow.className = 'form-row form-group';
    divRow.id = `packagingRow${recipePackagingCount}`;

    const createCol = (className) => {
        const divCol = document.createElement('div');
        divCol.className = className;
        return divCol;
    };

    const packagingName = createCol('col form-floating');
    packagingName.appendChild(generatePackagingSelect(`packagingName${recipePackagingCount}`));
    const packagingNameLabel = createFloatingLabel(`packagingName${recipePackagingCount}`, "Name");
    packagingName.appendChild(packagingNameLabel);

    const packagingAmount = createCol('col form-floating');
    packagingAmount.innerHTML = `
        <input id="packagingAmount${recipePackagingCount}" class="form-control" type="number" required placeholder="Amount">
    `;
    const packagingAmountLabel = createFloatingLabel(`packagingAmount${recipePackagingCount}`, "Amount");
    packagingAmount.appendChild(packagingAmountLabel);

    const deleteRowButton = createCol('col align-self-center');
    deleteRowButton.innerHTML = `
        <button id="packagingDelete${recipePackagingCount}" class="btn btn-danger" onclick="removePackagingRow(${recipePackagingCount})">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    divRow.appendChild(packagingName);
    divRow.appendChild(packagingAmount);
    divRow.appendChild(deleteRowButton);

    return divRow;
}

function createFloatingLabel(id, text){
    const label = document.createElement('label');
    label.for = id;
    label.innerText = text;
    return label;
}

function addRecipeIngredientControls() {
    recipeIngredientCount++;
    const ingredientRow = createIngredientRow(recipeIngredientCount);
    document.getElementById('recipeIngredientControls').appendChild(ingredientRow);
    updateUnitOfMeasurementSelect(`ingredientName${recipeIngredientCount}`, `ingredientType${recipeIngredientCount}`, `ingredientUnitOfMeasureSelect${recipeIngredientCount}`);
}

function addRecipePackagingControls() {
    recipePackagingCount++;
    const packagingRow = createPackagingRow(recipePackagingCount);
    document.getElementById('recipePackagingControls').appendChild(packagingRow);
}

function removeIngredientRow(rowNumber) {
    document.getElementById(`ingredientRow${rowNumber}`).remove();
}

function removePackagingRow(rowNumber) {
    document.getElementById(`packagingRow${rowNumber}`).remove();
}

function getRecipeByName(recipeName) {
    const matchingRecipes = recipes.filter((e) => JSON.parse(e).name.toLowerCase() == recipeName.toLowerCase());
    return matchingRecipes.length > 0 ? JSON.parse(matchingRecipes[0]) : null;
}

function getIngredientByName(ingredientName) {
    const matchingIngredients = ingredients.filter((e) => JSON.parse(e).name == ingredientName);
    return matchingIngredients.length > 0 ? JSON.parse(matchingIngredients[0]) : null;
}

function getPackagingByName(packagingName) {
    const matchingPackagings = packagings.filter((e) => JSON.parse(e).name == packagingName);
    return matchingPackagings.length > 0 ? JSON.parse(matchingPackagings[0]) : null;
}

function calculateIngredientCost(ingredient, amount) {
    const matchingIngredient = getIngredientByName(ingredient.name);
    if(matchingIngredient != null){
        if (matchingIngredient.unitOfMeasure === "Unit") {
            return (amount * matchingIngredient.cost) / matchingIngredient.amount;
        } else if (matchingIngredient.type === "Fluid") {
            const convertedAmount = convertVolume(amount, ingredient.unitOfMeasure, matchingIngredient.unitOfMeasure);
            return (convertedAmount * matchingIngredient.cost) / matchingIngredient.amount;
        } else if (matchingIngredient.type === "Dry") {
            const convertedAmount = convertWeight(amount, ingredient.unitOfMeasure, matchingIngredient.unitOfMeasure);
            return (convertedAmount * matchingIngredient.cost) / matchingIngredient.amount;
        }
    }

    return 0;
}

function calculatePackagingCost(packaging, amount) {
    const matchingPackaging = getPackagingByName(packaging.name);
    if(matchingPackaging != null){
        return (matchingPackaging.cost * amount) / matchingPackaging.amount;
    }
    
    return 0;
}

function getRecipePrice(recipeName, adjustmentFactor = 1) {
    const recipe = getRecipeByName(recipeName);
    let totalCost = 0;

    for (const ingredient of recipe.ingredients) {
        totalCost += calculateIngredientCost(ingredient, ingredient.amount);
    }

    for (const packaging of recipe.packagings) {
        totalCost += calculatePackagingCost(packaging, packaging.amount);
    }

    totalCost *= adjustmentFactor;

    totalCost += hourlyWage * recipe.time;

    return totalCost.toFixed(2);
}

function getExistingIngredientNames() {
    // Extract ingredient names from the 'ingredients' array
    return ingredients.map((ingredient) => JSON.parse(ingredient).name);
}

function capitalize(word) {
    return word.replace(/\b\w/g, (char) => char.toUpperCase());
}


function setHourlyWage() {
    const hourlyWage = document.getElementById('hourlyWageInput').value;
    localStorage.setItem('HourlyWage', hourlyWage);
    window.location.reload();
}

function generateIngredientSelect(ingredientNameSelectId, ingredientTypeId, ingredientUnitOfMeasureSelect) {
    const select = document.createElement('select');
    select.className = 'form-control';
    select.id = ingredientNameSelectId;
    select.placeholder = "Name";
    select.onchange = () => { updateUnitOfMeasurementSelect(ingredientNameSelectId, ingredientTypeId, ingredientUnitOfMeasureSelect) };

    let ingredientNames = ingredients.map((ingredient => JSON.parse(ingredient).name));
    ingredientNames.sort();
    ingredientNames.map((ingredientName) => {
        const option = document.createElement('option');
        option.value = ingredientName;
        option.innerText = ingredientName;
        select.appendChild(option);
    });

    return select;
}

function generatePackagingSelect(packagingNameSelectId) {
    const select = document.createElement('select');
    select.className = 'form-control';
    select.id = packagingNameSelectId;
    select.placeholder = "Name";

    let packagingNames = packagings.map((packaging => JSON.parse(packaging).name));
    packagingNames.sort();
    packagingNames.map((packagingName) => {
        const option = document.createElement('option');
        option.value = packagingName;
        option.innerText = packagingName;
        select.appendChild(option);
    });

    return select;
}

function removeOptions(selectElement) {
    const L = selectElement.querySelectorAll('option').length - 1;
    for(let i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
}

function updateUnitOfMeasurementSelect(ingredientNameId, ingredientTypeId, unitOfMeasureSelectId) {
    const matchingIngredient = getIngredientByName(document.getElementById(ingredientNameId).value);
    const ingredientType = document.getElementById(ingredientTypeId)?.value;
    const unitOfMeasureSelect = document.getElementById(unitOfMeasureSelectId);

    removeOptions(unitOfMeasureSelect);

    const units = {
        Unit: ['Unit'],
        Fluid: ['Cup', 'Gallon', 'Gram', 'Milliliter', 'Ounce', 'Pint', 'Quart', 'Tablespoon', 'Teaspoon'],
        Dry: ['Cup', 'Gram', 'Pound', 'Ounce', 'Tablespoon', 'Teaspoon']
    };

    let unitOptions;
    if (matchingIngredient && matchingIngredient.unitOfMeasure === 'Unit') {
        unitOptions = units['Unit'];
    } 
    else if (matchingIngredient) {
        unitOptions = units[matchingIngredient.type];
    }
    else {
        unitOptions = units[ingredientType] || [];
        if(ingredientTypeId == 'newIngredientType'){
            unitOptions.push('Unit');
        }
    }

    unitOptions.forEach((unit) => {
        const option = document.createElement('option');
        option.value = unit;
        option.innerText = unit;
        unitOfMeasureSelect.appendChild(option);
    });
}

function convertVolume(value, fromUnit, toUnit) {
    const units = {
        "Milliliter": 3,
        "Cup": 1,
        "Tablespoon": 16,
        "Teaspoon": 48,
        "Ounce": 8,
        "Pint": 0.5,
        "Quart": 0.25,
        "Gallon": 0.0625,
        "Gram": 240
    };

    let fromValue = value / units[fromUnit];
    let convertedValue = fromValue * units[toUnit];

    return convertedValue;
}

function convertWeight(value, fromUnit, toUnit) {
    const units = {
        "Pound": 0.0625,
        "Cup": 0.222,
        "Ounce": 1,
        "Tablespoon": 2.52,
        "Teaspoon": 7.56,
        "Gram": 28.35
    };

    let fromValue = value / units[fromUnit];
    let convertedValue = fromValue * units[toUnit];

    return convertedValue;
}