if(localStorage.getItem("Recipes") == null){
    localStorage.setItem("Recipes", "[]");
}

if(localStorage.getItem("Ingredients") == null){
    localStorage.setItem("Ingredients", "[]");
}

if(localStorage.getItem("Packagings") == null){
    localStorage.setItem("Packagings", "[]");
}

if(localStorage.getItem("HourlyWage") == null){
    localStorage.setItem("HourlyWage", "10");
}

const UnitsOfMeasure = {
	Cup: "cup",
	Tablespoon: "tbsp",
	Teaspoon: "tsp",
	Ounce: "oz",
    Pint: "pint",
    Quart:"quart",
    Gallon: "gallon",
    Unit: "unit",
    Gram: "gram",
    Pound: "lb",
    Millileter: "ml"
}

let recipes = JSON.parse(localStorage.getItem("Recipes"));
let ingredients = JSON.parse(localStorage.getItem("Ingredients"));
let packagings = JSON.parse(localStorage.getItem("Packagings"));
let hourlyWage = localStorage.getItem("HourlyWage");
let recipeIngredientCount = 0;

if(document.getElementById('addRecipeCard')){
    addRecipeIngredientControls();
    addUnitOfMeasureToIngredientControls();
    document.getElementById('addRecipe').onclick = () => { addRecipe();};
    document.getElementById('addIngredient').onclick = () => { addIngredient();};
    document.getElementById('addPackaging').onclick = () => { addPackaging();};
    populatePackagingSelect();
}
if(document.getElementById('recipeContent')){
    displayRecipes('');
    populatePackagingSelect();
    document.getElementById('filter').onkeyup = () => { updateDisplayedRecipes();};
}

if(document.getElementById('ingredientContent')){
    displayIngredients();
    addUnitOfMeasureToIngredientControls();
    document.getElementById('newIngredientType').onchange = () => {updateAddIngredientUnitOfMeasureDropdown()};
}

if(document.getElementById('packagingContent')){
    displayPackagings();
}

if(document.getElementById('hourlyWageSpan')){
    document.getElementById('hourlyWageSpan').innerText = "$"+hourlyWage;

    document.getElementById('uploadBackup').addEventListener("change", function () {
        if (this.files && this.files[0]) {
          var myFile = this.files[0];
          var reader = new FileReader();
          
          reader.addEventListener('load', function (e) {
            let output = (e.target.result).split("**");
            localStorage.setItem("Recipes", output[0]);
            localStorage.setItem("Ingredients", output[1]);
            localStorage.setItem("Packagings", output[2]);
            localStorage.setItem("HourlyWage", output[3]);
            window.location.reload();
          });
          
          reader.readAsBinaryString(myFile);
        }   
      });
}



function updateDisplayedRecipes(){
    document.getElementById('recipeContent').innerHTML = '';
    displayRecipes(capitalize(document.getElementById('filter').value));
}

function displayRecipes(filter){
    let displayedRecipes = recipes.filter(e => e.startsWith(`{\"name\":\"${filter}`));
    for(let i = 0; i < Object.keys(displayedRecipes).length; i++){
        let recipeCardRowId = 'recipeCardRow' + Math.floor(i/3);
        
        if(i%3==0){
            let newRecipeCardRow = document.createElement('div');
            newRecipeCardRow.className = 'card-deck py-2';
            newRecipeCardRow.id = recipeCardRowId;
            document.getElementById('recipeContent').appendChild(newRecipeCardRow);
        }
    
        let recipeJSONObject = JSON.parse(displayedRecipes[i]);
        let recipeCard = document.createElement('div');
        recipeCard.className = 'card';
        let recipeCardBody = document.createElement('div');
        recipeCardBody.className = 'card-body';
        let recipeCardTitle = document.createElement('h5');
        recipeCardTitle.className = 'card-title';
        recipeCardTitle.innerText = recipeJSONObject.name;
    
        recipeCardBody.appendChild(recipeCardTitle);
    
        for(let j = 0; j < recipeJSONObject.ingredients.length; j++){
            let recipeCardIngredient = document.createElement('p');
            recipeCardIngredient.innerText = `${recipeJSONObject.ingredients[j].name} ${recipeJSONObject.ingredients[j].amount} ${recipeJSONObject.ingredients[j].unitOfMeasure}`;
            recipeCardIngredient.className = "card-text";
            recipeCardBody.appendChild(recipeCardIngredient);
        }

        let recipeNotes = document.createElement('p');
        recipeNotes.innerText = recipeJSONObject.notes;
        recipeNotes.className = "text-muted font-italic"
        recipeCardBody.appendChild(recipeNotes);

        let cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer';

        let updateButton = document.createElement('button');
        updateButton.className="btn btn-info float-right  mr-2";
        updateButton.setAttribute('data-toggle','modal');
        updateButton.setAttribute('data-target','#updateModal');
        updateButton.onclick = () => {updateRecipeByName(recipeJSONObject.name);}

        let updateIcon = document.createElement('i');
        updateIcon.className = "fa-solid fa-pen-to-square";
        updateButton.appendChild(updateIcon);
        
        let deleteButton = document.createElement('button');
        deleteButton.className="btn btn-danger float-right";
        deleteButton.onclick = () => {deleteRecipeByName(recipeJSONObject.name);}

        let deleteIcon = document.createElement('i');
        deleteIcon.className = "fa-solid fa-trash";
        deleteButton.appendChild(deleteIcon);

        let recipePrice = getRecipePrice(recipeJSONObject.name);
        let recipePriceElement = document.createElement('span');
        recipePriceElement.className = "text-success"
        recipePriceElement.innerText =`\$${recipePrice}`;

        cardFooter.appendChild(recipePriceElement);
        cardFooter.appendChild(deleteButton);
        cardFooter.appendChild(updateButton);
        recipeCard.appendChild(recipeCardBody);
        recipeCard.appendChild(cardFooter);
        let existingRecipeCardRow = document.getElementById(recipeCardRowId);
        existingRecipeCardRow.appendChild(recipeCard);
    } 
}

function displayIngredients(){
    for(let i = 0; i < Object.keys(ingredients).length; i++){
        let ingredientCardRowId = 'ingredientCardRow' + Math.floor(i/3);
        
        if(i%3==0){
            let newIngredientCardRow = document.createElement('div');
            newIngredientCardRow.className = 'card-deck py-2';
            newIngredientCardRow.id = ingredientCardRowId;
            document.getElementById('ingredientContent').appendChild(newIngredientCardRow);
        }

        let ingredientJSONObject = JSON.parse(ingredients[i]);
        let ingredientCard = document.createElement('div');
        ingredientCard.className = 'card';
        let ingredientCardBody = document.createElement('div');
        ingredientCardBody.className = 'card-body';
        let ingredientCardTitle = document.createElement('h5');
        ingredientCardTitle.className = 'card-title';
        ingredientCardTitle.innerText = ingredientJSONObject.name;
    
        ingredientCardBody.appendChild(ingredientCardTitle);

        let ingredientCardInfo = document.createElement('p');
        ingredientCardInfo.innerText = `${ingredientJSONObject.amount} ${ingredientJSONObject.unitOfMeasure} is \$${ingredientJSONObject.cost}`;
        ingredientCardInfo.className = "card-text";
        ingredientCardBody.appendChild(ingredientCardInfo);

        let cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer';
        
        let updateButton = document.createElement('button');
        updateButton.className="btn btn-info float-right  mr-2";
        updateButton.setAttribute('data-toggle','modal');
        updateButton.setAttribute('data-target','#updateModal');
        updateButton.onclick = () => {updateIngredientByName(ingredientJSONObject.name);}

        let updateIcon = document.createElement('i');
        updateIcon.className = "fa-solid fa-pen-to-square";
        updateButton.appendChild(updateIcon);

        let deleteButton = document.createElement('button');
        deleteButton.className="btn btn-danger float-right";
        deleteButton.onclick = () => {deleteIngredientByName(ingredientJSONObject.name);}

        let deleteIcon = document.createElement('i');
        deleteIcon.className = "fa-solid fa-trash";
        deleteButton.appendChild(deleteIcon);

        cardFooter.appendChild(deleteButton);
        cardFooter.appendChild(updateButton);
        ingredientCard.appendChild(ingredientCardBody);
        ingredientCard.appendChild(cardFooter);
        let existingingredientCardRow = document.getElementById(ingredientCardRowId);
        existingingredientCardRow.appendChild(ingredientCard);
    }
}

function displayPackagings(){
    for(let i = 0; i < Object.keys(packagings).length; i++){
        let packagingCardRowId = 'packagingCardRow' + Math.floor(i/3);
        
        if(i%3==0){
            let newPackagingCardRow = document.createElement('div');
            newPackagingCardRow.className = 'card-deck py-2';
            newPackagingCardRow.id = packagingCardRowId;
            document.getElementById('packagingContent').appendChild(newPackagingCardRow);
        }

        let packagingJSONObject = JSON.parse(packagings[i]);
        let packagingCard = document.createElement('div');
        packagingCard.className = 'card';
        let packagingCardBody = document.createElement('div');
        packagingCardBody.className = 'card-body';
        let packagingCardTitle = document.createElement('h5');
        packagingCardTitle.className = 'card-title';
        packagingCardTitle.innerText = packagingJSONObject.name;
    
        packagingCardBody.appendChild(packagingCardTitle);

        let packagingCardInfo = document.createElement('p');
        packagingCardInfo.innerText = `${packagingJSONObject.amount} is \$${packagingJSONObject.cost}`;
        packagingCardInfo.className = "card-text";
        packagingCardBody.appendChild(packagingCardInfo);

        let cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer';
        
        let updateButton = document.createElement('button');
        updateButton.className="btn btn-info float-right  mr-2";
        updateButton.setAttribute('data-toggle','modal');
        updateButton.setAttribute('data-target','#updateModal');
        updateButton.onclick = () => {updatePackagingByName(packagingJSONObject.name);}

        let updateIcon = document.createElement('i');
        updateIcon.className = "fa-solid fa-pen-to-square";
        updateButton.appendChild(updateIcon);

        let deleteButton = document.createElement('button');
        deleteButton.className="btn btn-danger float-right";
        deleteButton.onclick = () => {deletePackagingByName(packagingJSONObject.name);}

        let deleteIcon = document.createElement('i');
        deleteIcon.className = "fa-solid fa-trash";
        deleteButton.appendChild(deleteIcon);

        cardFooter.appendChild(deleteButton);
        cardFooter.appendChild(updateButton);
        packagingCard.appendChild(packagingCardBody);
        packagingCard.appendChild(cardFooter);
        let existingpackagingCardRow = document.getElementById(packagingCardRowId);
        existingpackagingCardRow.appendChild(packagingCard);
    }
}
   
function addUnitOfMeasureToIngredientControls(){
    let col = document.createElement('div');
    let ingredientControls = document.getElementById('ingredientControls');
    let newIngredientCostColumn =  document.getElementById('newIngredientCostColumn');
    col.className = "col";
    let select = createUnitOfMeasurementDropdown()
    select.id = 'newIngredientUnitOfMeasure';
    col.appendChild(select);
    ingredientControls.insertBefore(col, newIngredientCostColumn);
}

function addRecipe(e){
    let recipeIngredients = '';
    let recipeName = capitalize(document.getElementById('newRecipeName').value);
    let recipeNotes = document.getElementById('newRecipeNotes').value;
    let recipeTime = document.getElementById('newRecipeTime').value;
    let packagingName = capitalize(document.getElementById('newRecipePackagingSelect').value);
    let packagingCount = document.getElementById('newRecipePackagingCount').value;

    let recipeExists = recipes.filter(e => e.startsWith(`{\"name\":\"${recipeName}`)).length > 0;

    for(let i = 1; i < recipeIngredientCount+1; i++){
        let ingredientName = capitalize(document.getElementById('ingredientName'+(i)).value);
        recipeIngredients += `{\"name\":\"${ingredientName}\", \"amount\":\"${document.getElementById('ingredientAmount'+(i)).value}\", \"unitOfMeasure\":\"${document.getElementById('ingredientSelect'+(i)).value}\"},`
    }

    //remove last comma
    recipeIngredients = recipeIngredients.slice(0, -1);

    let recipe = `{\"name\":\"${recipeName}\", \"ingredients\":[` + recipeIngredients + `], \"notes\":\"${recipeNotes}\", \"time\":\"${recipeTime}\", \"packagingName\":\"${packagingName}\", \"packagingCount\":\"${packagingCount}\"}`;
    
    for (const el of document.getElementById('addRecipeControls').querySelectorAll("[required]")) {
        if (el.value == "") {
            document.getElementById('errorBannerRecipe').classList.remove('d-none');
            document.getElementById('errorTextRecipe').innerText = "You must fill out all required fields!";
            return;
        }
    }

    if(!recipeExists){
        recipes.push(recipe);
        localStorage.setItem("Recipes", JSON.stringify(recipes));
        window.location.reload();
    }
    else if(recipeExists && e.currentTarget.id == "modalUpdateBtn"){
        //get index and replace
        let i = 0; 
        while(i < recipes.length){
            
            if(JSON.parse(recipes[i]).name == recipeName){
                break;
            }
            i++;
        }
        recipes[i] = recipe;
        localStorage.setItem("Recipes", JSON.stringify(recipes));
        window.location.reload();        
    }
    else{
        document.getElementById('errorBannerRecipe').classList.remove('d-none');
        document.getElementById('errorTextRecipe').innerText = "There is already a recipe with that name!";
    }
    
}

function addIngredient(e){
    let ingredientName = capitalize(document.getElementById('newIngredientName').value);
    let ingredientAmount = document.getElementById('newIngredientAmount').value;
    let ingredientUnitOfMeasure = document.getElementById('newIngredientUnitOfMeasure').value;
    let ingredientCost = document.getElementById('newIngredientCost').value;
    let ingredientType = document.getElementById('newIngredientType').value;

    let ingredientExists = ingredients.filter(g => g.startsWith(`{\"name\":\"${ingredientName}`)).length > 0;

    let ingredient = `{\"name\":\"${ingredientName}\", \"amount\":\"${ingredientAmount}\", \"unitOfMeasure\":\"${ingredientUnitOfMeasure}\", \"cost\":\"${ingredientCost}\", \"type\":\"${ingredientType}\"}`;
    
    for (const el of document.getElementById('addIngredientControls').querySelectorAll("[required]")) {
        if (el.value == "") {
            document.getElementById('errorBannerIngredient').classList.remove('d-none');
            document.getElementById('errorTextIngredient').innerText = "You must fill out all required fields!";
            return;
        }
    }

    if(!ingredientExists){
        ingredients.push(ingredient);
        localStorage.setItem("Ingredients", JSON.stringify(ingredients));
        window.location.reload();
    }
    else if(ingredientExists && e.currentTarget.id == "modalUpdateBtn"){
        //get index and replace
        let i = 0; 
        while(i < ingredients.length){
            
            if(JSON.parse(ingredients[i]).name == ingredientName){
                break;
            }
            i++;
        }
        ingredients[i] = ingredient;
        localStorage.setItem("Ingredients", JSON.stringify(ingredients));
        window.location.reload();        
    }
    else{
        document.getElementById('errorBannerIngredient').classList.remove('d-none');
        document.getElementById('errorTextIngredient').innerText = "There is already an ingredient with that name!";
    }
}

function addPackaging(e){
    let packagingName = capitalize(document.getElementById('newPackagingName').value);
    let packagingAmount = document.getElementById('newPackagingAmount').value;
    let packagingCost = document.getElementById('newPackagingCost').value;

    let packagingExists = packagings.filter(e => e.startsWith(`{\"name\":\"${packagingName}`)).length > 0;

    let packaging = `{\"name\":\"${packagingName}\", \"amount\":\"${packagingAmount}\", \"cost\":\"${packagingCost}\"}`;
    
    for (const el of document.getElementById('addPackagingControls').querySelectorAll("[required]")) {
        if (el.value == "") {
            document.getElementById('errorBannerPackaging').classList.remove('d-none');
            document.getElementById('errorTextPackaging').innerText = "You must fill out all required fields!";
            return;
        }
    }

    if(!packagingExists){
        packagings.push(packaging);
        localStorage.setItem("Packagings", JSON.stringify(packagings));
        window.location.reload();
    }
    else if(packagingExists && e.currentTarget.id == "modalUpdateBtn"){
        //get index and replace
        let i = 0; 
        while(i < packagings.length){
            
            if(JSON.parse(packagings[i]).name == packagingName){
                break;
            }
            i++;
        }
        packagings[i] = packaging;
        localStorage.setItem("Packagings", JSON.stringify(packagings));
        window.location.reload();        
    }
    else{
        document.getElementById('errorBannerPackaging').classList.remove('d-none');
        document.getElementById('errorTextPackaging').innerText = "There is already a packaging with that name!";
    }
}

function deleteRecipeByName(name){
    var result = confirm(`Are you sure you want to delete ${name}?`);
    if (result) {
        localStorage.setItem("Recipes", JSON.stringify(recipes.filter(e => !e.startsWith(`{\"name\":\"${name}`))));
        window.location.reload();
    }
}

function deleteIngredientByName(name){
    var result = confirm(`Are you sure you want to delete ${name}?`);
    if (result) {
        localStorage.setItem("Ingredients", JSON.stringify(ingredients.filter(e => !e.startsWith(`{\"name\":\"${name}`))));
        window.location.reload();
    }
}

function deletePackagingByName(name){
    var result = confirm(`Are you sure you want to delete ${name}?`);
    if (result) {
        localStorage.setItem("Packagings", JSON.stringify(packagings.filter(e => !e.startsWith(`{\"name\":\"${name}`))));
        window.location.reload();
    }
}

function updateRecipeByName(recipeName){
    if(!document.getElementById('errorBannerRecipe').classList.contains('d-none')){
        document.getElementById('errorBannerRecipe').classList.add('d-none');
    }

    let recipe = getRecipeByName(recipeName);
    let addRecipeIngredientsBtn = document.getElementById('addRecipeIngredientsBtn');

    let ingredientRowDeleteBtns = document.querySelectorAll('[id^="ingredientRowDelete"]')
    for(let i = 0; i < ingredientRowDeleteBtns.length; i++){
        ingredientRowDeleteBtns[i].click();
    }

    document.getElementById('updateModalLabel').innerText = `Update ${recipeName}`;
    document.getElementById('newRecipeName').value = recipe.name;
    document.getElementById('newRecipeTime').value = recipe.time;
    document.getElementById('newRecipeNotes').value = recipe.notes;
    document.getElementById('newRecipePackagingSelect').value = recipe.packagingName;
    document.getElementById('newRecipePackagingCount').value = recipe.packagingCount;
    
    for(let i = 0; i < recipe.ingredients.length; i++){
        addRecipeIngredientsBtn.click();
        let currentRecipeIngredient = recipe.ingredients[i];
        document.getElementById('ingredientName'+recipeIngredientCount).value = currentRecipeIngredient.name;
        let event = new Event('change');
        document.getElementById('ingredientName'+recipeIngredientCount).dispatchEvent(event)
        document.getElementById('ingredientAmount'+recipeIngredientCount).value = currentRecipeIngredient.amount;
        document.getElementById('ingredientSelect'+recipeIngredientCount).value = currentRecipeIngredient.unitOfMeasure;
    }

    let modalUpdateBtn = document.getElementById('modalUpdateBtn');
    modalUpdateBtn.onclick = (e) => {addRecipe(e);};

}

function updateIngredientByName(ingredientName){
    if(!document.getElementById('errorBannerIngredient').classList.contains('d-none')){
        document.getElementById('errorBannerIngredient').classList.add('d-none');
    }

    let ingredient = getIngredientByName(ingredientName);

    document.getElementById('updateModalLabel').innerText = `Update ${ingredientName}`;
    document.getElementById('newIngredientName').value = ingredient.name;
    document.getElementById('newIngredientAmount').value = ingredient.amount;
    document.getElementById('newIngredientCost').value = ingredient.cost;
    document.getElementById('newIngredientType').value = ingredient.type;
    updateAddIngredientUnitOfMeasureDropdown()
    document.getElementById('newIngredientUnitOfMeasure').value = ingredient.unitOfMeasure;
    let modalUpdateBtn = document.getElementById('modalUpdateBtn');
    modalUpdateBtn.onclick = (e) => {addIngredient(e);};

}

function updatePackagingByName(packagingName){
    if(!document.getElementById('errorBannerPackaging').classList.contains('d-none')){
        document.getElementById('errorBannerPackaging').classList.add('d-none');
    }

    let packaging = getPackagingByName(packagingName);

    document.getElementById('updateModalLabel').innerText = `Update ${packagingName}`;
    document.getElementById('newPackagingName').value = packaging.name;
    document.getElementById('newPackagingAmount').value = packaging.amount;
    document.getElementById('newPackagingCost').value = packaging.cost;

    let modalUpdateBtn = document.getElementById('modalUpdateBtn');
    modalUpdateBtn.onclick = (e) => {addPackaging(e);};

}

function save(){
    let saveLink = document.createElement('a');
    saveLink.href = "data:text/plain;charset=utf-8," + encodeURIComponent(localStorage.getItem("Recipes") + "**" + localStorage.getItem("Ingredients") + "**" + localStorage.getItem("Packagings") + "**" + localStorage.getItem("HourlyWage"));
    saveLink.download = "db.txt";
    document.body.appendChild(saveLink);
    saveLink.click();
}

function clearLocalStorage(){
    var firstCheck = confirm("This will erase EVERYTHING. Are you sure you want to delete EVERYTHING?");
    if (firstCheck) {
        save();
        var secondCheck = confirm("I'm going to save first just in case OK?");
        if(secondCheck){
            localStorage.clear();
            window.location.reload();
        }
    }
}

function addRecipeIngredientControls(){
    recipeIngredientCount++;
    
    let divRow = document.createElement('div');
    divRow.className = "form-row form-group";
    divRow.id = 'ingredientRow'+recipeIngredientCount;

    let divCol1 = document.createElement('div');
    divCol1.className = "col";
    let divCol2 = document.createElement('div');
    divCol2.className = "col";
    let divCol3 = document.createElement('div');
    divCol3.className = "col";
    let divCol4 = document.createElement('div');
    divCol4.className = "col align-self-center";
    
    let ingredientAmount = document.createElement('input');
    ingredientAmount.id = 'ingredientAmount'+recipeIngredientCount;
    ingredientAmount.className="form-control";
    ingredientAmount.required = true;
    ingredientAmount.type = "number";
    ingredientAmount.placeholder = 'Ingredient Amount';
    
    let select = createUnitOfMeasurementDropdown();
    select.id = 'ingredientSelect'+recipeIngredientCount;
    
    let deleteRowButton = document.createElement('button');
    deleteRowButton.id = 'ingredientRowDelete'+recipeIngredientCount;
    deleteRowButton.className = "btn btn-danger";
    deleteRowButton.onclick = () => {document.getElementById(divRow.id).remove(); recipeIngredientCount--;}

    let deleteIcon = document.createElement('i');
    deleteIcon.className = "fa-solid fa-trash";
    
    let ingredientNameSelectId = 'ingredientName'+recipeIngredientCount;

    deleteRowButton.appendChild(deleteIcon);
    divCol1.appendChild(generateIngredientSelect(ingredientNameSelectId));
    divCol2.appendChild(ingredientAmount);
    divCol3.appendChild(select);
    divCol4.appendChild(deleteRowButton);
    divRow.appendChild(divCol1);
    divRow.appendChild(divCol2);
    divRow.appendChild(divCol3);
    divRow.appendChild(divCol4);
    document.getElementById('recipeControls').appendChild(divRow);
    document.getElementById(ingredientNameSelectId).onchange = () => {updateUnitOfMeasurementSelect(ingredientNameSelectId, select.id);}
    updateUnitOfMeasurementSelect(ingredientNameSelectId, select.id);
}

function updateUnitOfMeasurementSelect(ingredientNameId, selectId){
    let matchingIngredient = getIngredientByName(document.getElementById(ingredientNameId).value);
    let select = document.getElementById(selectId);
    if(matchingIngredient != null){


        select.innerHTML = '';

        if(matchingIngredient.unitOfMeasure == "unit"){
            let optionUnit = document.createElement('option');
            optionUnit.value = UnitsOfMeasure.Unit;
            optionUnit.innerText = UnitsOfMeasure.Unit;
            select.appendChild(optionUnit);
        }
        else if(matchingIngredient.type == "fluid"){
            let optionCup = document.createElement('option');
            optionCup.value = UnitsOfMeasure.Cup;
            optionCup.innerText = UnitsOfMeasure.Cup;
            select.appendChild(optionCup);

            let optionGallon = document.createElement('option');
            optionGallon.value = UnitsOfMeasure.Gallon;
            optionGallon.innerText = UnitsOfMeasure.Gallon;
            select.appendChild(optionGallon);

            let optionGram = document.createElement('option');
            optionGram.value = UnitsOfMeasure.Gram;
            optionGram.innerText = UnitsOfMeasure.Gram;
            select.appendChild(optionGram);

            let optionMillileter = document.createElement('option');
            optionMillileter.value = UnitsOfMeasure.Millileter;
            optionMillileter.innerText = UnitsOfMeasure.Millileter;
            select.appendChild(optionMillileter);
            
            let optionOunce = document.createElement('option');
            optionOunce.value = UnitsOfMeasure.Ounce;
            optionOunce.innerText = UnitsOfMeasure.Ounce;
            select.appendChild(optionOunce);

            let optionPint = document.createElement('option');
            optionPint.value = UnitsOfMeasure.Pint;
            optionPint.innerText = UnitsOfMeasure.Pint;
            select.appendChild(optionPint);

            let optionQuart = document.createElement('option');
            optionQuart.value = UnitsOfMeasure.Quart;
            optionQuart.innerText = UnitsOfMeasure.Quart;
            select.appendChild(optionQuart);

            let optionTablespoon = document.createElement('option');
            optionTablespoon.value = UnitsOfMeasure.Tablespoon;
            optionTablespoon.innerText = UnitsOfMeasure.Tablespoon;
            select.appendChild(optionTablespoon);

            let optionTeaspoon = document.createElement('option');
            optionTeaspoon.value = UnitsOfMeasure.Teaspoon;
            optionTeaspoon.innerText = UnitsOfMeasure.Teaspoon;
            select.appendChild(optionTeaspoon);
        }
        else if(matchingIngredient.type == "dry"){
            let optionCup = document.createElement('option');
            optionCup.value = UnitsOfMeasure.Cup;
            optionCup.innerText = UnitsOfMeasure.Cup;
            select.appendChild(optionCup);

            let optionGram = document.createElement('option');
            optionGram.value = UnitsOfMeasure.Gram;
            optionGram.innerText = UnitsOfMeasure.Gram;
            select.appendChild(optionGram);

            let optionPound = document.createElement('option');
            optionPound.value = UnitsOfMeasure.Pound;
            optionPound.innerText = UnitsOfMeasure.Pound;
            select.appendChild(optionPound);

            let optionOunce = document.createElement('option');
            optionOunce.value = UnitsOfMeasure.Ounce;
            optionOunce.innerText = UnitsOfMeasure.Ounce;
            select.appendChild(optionOunce);

            let optionTablespoon = document.createElement('option');
            optionTablespoon.value = UnitsOfMeasure.Tablespoon;
            optionTablespoon.innerText = UnitsOfMeasure.Tablespoon;
            select.appendChild(optionTablespoon);

            let optionTeaspoon = document.createElement('option');
            optionTeaspoon.value = UnitsOfMeasure.Teaspoon;
            optionTeaspoon.innerText = UnitsOfMeasure.Teaspoon;
            select.appendChild(optionTeaspoon);
        }
        select.className='form-control';
        return select;
    }
}

function updateAddIngredientUnitOfMeasureDropdown(){
    let select = document.getElementById('newIngredientUnitOfMeasure');
    let newIngredientType = document.getElementById('newIngredientType');

    select.innerHTML = '';
    if(newIngredientType.value == "fluid"){
        let optionCup = document.createElement('option');
        optionCup.value = UnitsOfMeasure.Cup;
        optionCup.innerText = UnitsOfMeasure.Cup;
        select.appendChild(optionCup);

        let optionGallon = document.createElement('option');
        optionGallon.value = UnitsOfMeasure.Gallon;
        optionGallon.innerText = UnitsOfMeasure.Gallon;
        select.appendChild(optionGallon);

        let optionGram = document.createElement('option');
        optionGram.value = UnitsOfMeasure.Gram;
        optionGram.innerText = UnitsOfMeasure.Gram;
        select.appendChild(optionGram);

        let optionMillileter = document.createElement('option');
        optionMillileter.value = UnitsOfMeasure.Millileter;
        optionMillileter.innerText = UnitsOfMeasure.Millileter;
        select.appendChild(optionMillileter);
        
        let optionOunce = document.createElement('option');
        optionOunce.value = UnitsOfMeasure.Ounce;
        optionOunce.innerText = UnitsOfMeasure.Ounce;
        select.appendChild(optionOunce);

        let optionPint = document.createElement('option');
        optionPint.value = UnitsOfMeasure.Pint;
        optionPint.innerText = UnitsOfMeasure.Pint;
        select.appendChild(optionPint);

        let optionQuart = document.createElement('option');
        optionQuart.value = UnitsOfMeasure.Quart;
        optionQuart.innerText = UnitsOfMeasure.Quart;
        select.appendChild(optionQuart);

        let optionTablespoon = document.createElement('option');
        optionTablespoon.value = UnitsOfMeasure.Tablespoon;
        optionTablespoon.innerText = UnitsOfMeasure.Tablespoon;
        select.appendChild(optionTablespoon);

        let optionTeaspoon = document.createElement('option');
        optionTeaspoon.value = UnitsOfMeasure.Teaspoon;
        optionTeaspoon.innerText = UnitsOfMeasure.Teaspoon;
        select.appendChild(optionTeaspoon);

        let optionUnit = document.createElement('option');
            optionUnit.value = UnitsOfMeasure.Unit;
            optionUnit.innerText = UnitsOfMeasure.Unit;
            select.appendChild(optionUnit);
    }
    else if(newIngredientType.value == "dry"){
        let optionCup = document.createElement('option');
        optionCup.value = UnitsOfMeasure.Cup;
        optionCup.innerText = UnitsOfMeasure.Cup;
        select.appendChild(optionCup);

        let optionGram = document.createElement('option');
        optionGram.value = UnitsOfMeasure.Gram;
        optionGram.innerText = UnitsOfMeasure.Gram;
        select.appendChild(optionGram);

        let optionPound = document.createElement('option');
        optionPound.value = UnitsOfMeasure.Pound;
        optionPound.innerText = UnitsOfMeasure.Pound;
        select.appendChild(optionPound);

        let optionOunce = document.createElement('option');
        optionOunce.value = UnitsOfMeasure.Ounce;
        optionOunce.innerText = UnitsOfMeasure.Ounce;
        select.appendChild(optionOunce);

        let optionTablespoon = document.createElement('option');
        optionTablespoon.value = UnitsOfMeasure.Tablespoon;
        optionTablespoon.innerText = UnitsOfMeasure.Tablespoon;
        select.appendChild(optionTablespoon);

        let optionTeaspoon = document.createElement('option');
        optionTeaspoon.value = UnitsOfMeasure.Teaspoon;
        optionTeaspoon.innerText = UnitsOfMeasure.Teaspoon;
        select.appendChild(optionTeaspoon);

        let optionUnit = document.createElement('option');
            optionUnit.value = UnitsOfMeasure.Unit;
            optionUnit.innerText = UnitsOfMeasure.Unit;
            select.appendChild(optionUnit);
    }


}

function createUnitOfMeasurementDropdown(){
    let select = document.createElement('select');

    let optionCup = document.createElement('option');
    optionCup.value = UnitsOfMeasure.Cup;
    optionCup.innerText = UnitsOfMeasure.Cup;
    select.appendChild(optionCup);

    let optionGallon = document.createElement('option');
    optionGallon.value = UnitsOfMeasure.Gallon;
    optionGallon.innerText = UnitsOfMeasure.Gallon;
    select.appendChild(optionGallon);

    let optionGram = document.createElement('option');
    optionGram.value = UnitsOfMeasure.Gram;
    optionGram.innerText = UnitsOfMeasure.Gram;
    select.appendChild(optionGram);

    let optionPound = document.createElement('option');
    optionPound.value = UnitsOfMeasure.Pound;
    optionPound.innerText = UnitsOfMeasure.Pound;
    select.appendChild(optionPound);

    let optionMillileter = document.createElement('option');
    optionMillileter.value = UnitsOfMeasure.Millileter;
    optionMillileter.innerText = UnitsOfMeasure.Millileter;
    select.appendChild(optionMillileter);
    
    let optionOunce = document.createElement('option');
    optionOunce.value = UnitsOfMeasure.Ounce;
    optionOunce.innerText = UnitsOfMeasure.Ounce;
    select.appendChild(optionOunce);

    let optionPint = document.createElement('option');
    optionPint.value = UnitsOfMeasure.Pint;
    optionPint.innerText = UnitsOfMeasure.Pint;
    select.appendChild(optionPint);

    let optionQuart = document.createElement('option');
    optionQuart.value = UnitsOfMeasure.Quart;
    optionQuart.innerText = UnitsOfMeasure.Quart;
    select.appendChild(optionQuart);

    let optionTablespoon = document.createElement('option');
    optionTablespoon.value = UnitsOfMeasure.Tablespoon;
    optionTablespoon.innerText = UnitsOfMeasure.Tablespoon;
    select.appendChild(optionTablespoon);

    let optionTeaspoon = document.createElement('option');
    optionTeaspoon.value = UnitsOfMeasure.Teaspoon;
    optionTeaspoon.innerText = UnitsOfMeasure.Teaspoon;
    select.appendChild(optionTeaspoon);

    let optionUnit = document.createElement('option');
    optionUnit.value = UnitsOfMeasure.Unit;
    optionUnit.innerText = UnitsOfMeasure.Unit;
    select.appendChild(optionUnit);

    select.className='form-control';
    return select;
};

function convertVolume(value, fromUnit, toUnit) {
    const units = {
        "ml": 3,
        "cup": 1,
        "tbsp": 16,
        "tsp": 48,
        "oz": 8,
        "pint": 0.5,
        "quart": 0.25,
        "gallon": 0.0625,
        "gram": 240
    };

    let fromValue = value / units[fromUnit];
    let convertedValue = fromValue * units[toUnit];

    return convertedValue;
}

function convertWeight(value, fromUnit, toUnit) {
    const units = {
        "lb": 16,
        "cup": 4.5,
        "oz": 1,
        "tbsp": 2.52,
        "tsp": 7.56,
        "gram": 28.35
    };

    let fromValue = value / units[fromUnit];
    let convertedValue = fromValue * units[toUnit];

    return convertedValue;
}

function getRecipeByName(recipeName){
    return JSON.parse(recipes.filter(e => e.startsWith(`{\"name\":\"${recipeName}`)));
}

function getIngredientByName(ingredientName){
    let ingredient = null
    if(ingredients.filter(e => e.startsWith(`{\"name\":\"${ingredientName}`)).length > 0){
        ingredient = ingredients.filter(e => e.startsWith(`{\"name\":\"${ingredientName}`));
    }
    return JSON.parse(ingredient);
}

function getPackagingByName(packagingName){
    return JSON.parse(packagings.filter(e => e.startsWith(`{\"name\":\"${packagingName}`)));
}

function getRecipePrice(recipeName){
    let recipeCost = 0;
    let recipe = getRecipeByName(recipeName);
    let recipeIngredients = recipe.ingredients;
    let packaging = getPackagingByName(recipe.packagingName);
   
    for(let i = 0; i < recipeIngredients.length; i++){
        let matchingIngredient = getIngredientByName(recipeIngredients[i].name);

        if(matchingIngredient.unitOfMeasure == "unit"){
            recipeCost += recipeIngredients[i].amount * matchingIngredient.cost / matchingIngredient.amount;
        }
        else if(matchingIngredient.type == "fluid"){
            let convertedAmount = convertVolume(recipeIngredients[i].amount, recipeIngredients[i].unitOfMeasure, matchingIngredient.unitOfMeasure);
            recipeCost += convertedAmount * matchingIngredient.cost / matchingIngredient.amount;
        }
        else if(matchingIngredient.type == "dry"){
            let convertedAmount = convertWeight(recipeIngredients[i].amount, recipeIngredients[i].unitOfMeasure, matchingIngredient.unitOfMeasure);
            recipeCost += convertedAmount * matchingIngredient.cost / matchingIngredient.amount;
        }
    }
    recipeCost += packaging.cost * recipe.packagingCount / packaging.amount;
    recipeCost += hourlyWage * recipe.time;
    return recipeCost.toFixed(2);
}

function getExistingIngredientNames(){
    let existingIngredientNames = [];
    for(let i = 0; i < ingredients.length; i++){
        existingIngredientNames.push(JSON.parse(ingredients[i]).name);
    }
    return existingIngredientNames;
}

function capitalize(word){
    if(word == ''){
        return '';
    }
    let words = word.split(" ");
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1).toLowerCase();
    }
    return words.join(" ");
}

function setHourlyWage(){
    let hourlyWage = document.getElementById('hourlyWageInput').value;
    localStorage.setItem("HourlyWage", hourlyWage);
    window.location.reload();
}

function populatePackagingSelect(){
    let packagingSelectContainer = document.getElementById('newRecipePackagingSelectContainer');
    let select = document.createElement('select');
    select.className = 'form-control';
    select.id = 'newRecipePackagingSelect';
    for(let i = 0; i < packagings.length; i++){
        let option = document.createElement('option');
        option.value = JSON.parse(packagings[i]).name;
        option.innerText = JSON.parse(packagings[i]).name;
        select.appendChild(option);
    }
    packagingSelectContainer.appendChild(select);

}

function generateIngredientSelect(ingredientNameSelectId){
    let select = document.createElement('select');
    select.className = 'form-control';
    select.id = ingredientNameSelectId;
    for(let i = 0; i < ingredients.length; i++){
        let option = document.createElement('option');
        option.value = JSON.parse(ingredients[i]).name;
        option.innerText = JSON.parse(ingredients[i]).name;
        select.appendChild(option);
    }
    return select;
}