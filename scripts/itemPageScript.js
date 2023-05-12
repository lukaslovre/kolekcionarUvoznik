// home page
const buttonsContainer = document.getElementById("buttonsContainer");
const noviUvozInput = document.getElementById("noviUvozInput");
// pop up
const popUpWindow = document.querySelector(".popUpWindow");
const popUpInputs = popUpWindow.querySelectorAll("input");
const popUpButton = document.getElementById("popUpButton");
// items page
const saveAsButton = document.getElementById("saveAsButton");
const navigation = document.getElementById("navigation");
const navigationItemNumber = document.getElementById("navigationItemNumber");
const navigationLeftButton = document.getElementById("navigationLeftButton");
const navigationRightButton = document.getElementById("navigationRightButton");
const cardsContainer = document.getElementById("cardsContainer");
const cards = document.querySelectorAll(".card");
const allInputs = cardsContainer.querySelectorAll("input, textarea");
const lastInput = allInputs[allInputs.length - 1];
const skuInputs = document.querySelectorAll(".skuInput");
const idInputs = document.querySelectorAll(".idInput");
const kataloskiBrojInputs = document.querySelectorAll(".kataloskiBrojInput");
const naslovInputs = document.querySelectorAll(".naslovInput");
const cijenaInputs = document.querySelectorAll(".cijenaInput");
const kategorijaInputs = document.querySelectorAll(".kategorijaInput");
const opisInputs = document.querySelectorAll(".opisInput");

homePageRender();
function homePageRender() {
  buttonsContainer.style.display = "inline-block";
  cardsContainer.style.display = "none";
  navigation.style.display = "none";
  popUpWindow.style.display = "none";
  saveAsButton.style.display = "none";
}
function popUpBoxRender() {
  buttonsContainer.style.display = "none";
  cardsContainer.style.display = "none";
  navigation.style.display = "none";
  popUpWindow.style.display = "flex";
  saveAsButton.style.display = "none";
}
function itemsRender() {
  buttonsContainer.style.display = "none";
  cardsContainer.style.display = "flex";
  navigation.style.display = "flex";
  popUpWindow.style.display = "none";
  saveAsButton.style.display = "block";

  renderCardsFrom(currentItemIndex);
}

// Event listeneri
noviUvozInput.addEventListener("change", handleFileUpload);
popUpButton.addEventListener("click", initializeItemIDsAndSKUs);
navigationLeftButton.addEventListener("click", loadPreviousPage);
navigationRightButton.addEventListener("click", loadNextPage);
saveAsButton.addEventListener("click", formatAndMakeToFile);
lastInput.addEventListener("keydown", loadNextPageIfTab);
allInputs.forEach((input) => {
  input.addEventListener("focus", (e) => {
    markCardAsSelected(e.target);
  });
  input.addEventListener("change", (e) => {
    updateItemSpecification(e.target);
  });
});
lastInput.removeEventListener("change", (e) => {
  updateItemSpecification(e.target);
});
cijenaInputs.forEach((cijenaInput) => {
  cijenaInput.addEventListener("change", formatPriceAndAdjustWidth);
});
opisInputs.forEach((opisInput) => {
  opisInput.addEventListener("input", adjustHeight);
});
removeEventListener;
// Globalne varijable
const imageUrls = []; //lista slika (podatci o slikama, ne samo url)
let currentItemIndex = 0; // apsolutni index (0 - brojItema)
const finalItemSpecifications = []; // finalni podaci o itemima

// aktivni card se malo rasiri, a ova dva se smanje i postanu tamnija i mozda mutna
// ctrl + gornja strelica da odes polje u nazad

/* funkcije */

function handleFileUpload() {
  // Check if files are selected
  if (!noviUvozInput.files) return;

  popUpBoxRender();

  // Reset imageUrls and add new images to finalItemSpecifications
  let selectedImageFiles = noviUvozInput.files;
  imageUrls.length = 0; // ocisti prijasnje slike

  let itemCounter = 0;
  for (const image of selectedImageFiles) {
    finalItemSpecifications.push({
      id: itemCounter,
      sku: itemCounter,
      naslov: "",
      cijena: null,
      kategorija: "",
      opis: "",
      imeSlike: image.name,
      kataloskiBroj: "N/A",
    });
    itemCounter++;

    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrls.push(e.target.result);
      if (imageUrls.length == selectedImageFiles.length) {
        renderCardsFrom(currentItemIndex);
        console.log(imageUrls);
        console.log(finalItemSpecifications);
      }
    };
    reader.readAsDataURL(image);
  }
}
function initializeItemIDsAndSKUs() {
  const startingID = parseInt(popUpInputs[0].value);
  const startingSKU = parseInt(popUpInputs[1].value);

  // Validate input values
  if (!startingID || !startingSKU) return;

  finalItemSpecifications.forEach((item) => {
    item.id += startingID;
    item.sku += startingSKU;
  });

  itemsRender();
}
function loadNextPage() {
  updateItemSpecification(lastInput);
  if (currentItemIndex + 3 >= imageUrls.length) return;
  currentItemIndex += 3;
  renderCardsFrom(currentItemIndex);
}
function loadPreviousPage() {
  updateItemSpecification(lastInput);
  if (currentItemIndex - 3 < 0) return;
  currentItemIndex -= 3;
  renderCardsFrom(currentItemIndex);
}
function renderCardsFrom(startIndex) {
  // Update navigation item number
  const endIndex = Math.min(startIndex + 3, imageUrls.length);
  navigationItemNumber.textContent = `${startIndex + 1}-${endIndex} of ${
    imageUrls.length
  }`;

  // Update images
  cards.forEach((card, index) => {
    const imageIndex = startIndex + index;
    if (imageUrls[imageIndex]) {
      card.style.visibility = "visible";
      const item = finalItemSpecifications[imageIndex];
      card.querySelector(".slikaProizvoda").src = imageUrls[imageIndex];
      skuInputs[index].value = item.sku;
      idInputs[index].value = item.id;
      kataloskiBrojInputs[index].value = item.kataloskiBroj;
      // ADD: kataloski broj
      naslovInputs[index].value = item.naslov;
      cijenaInputs[index].value = item.cijena;
      kategorijaInputs[index].value = item.kategorija;
      opisInputs[index].value = item.opis;
    } else {
      card.style.visibility = "hidden";
    }
  });

  saveAsButton.focus();
}
function updateItemSpecification(inputNode) {
  const card = inputNode.closest(".card");
  const relativeCardIndex = card.id.slice(-1) - 1; // 0, 1 ili 2
  const absoluteCardIndex = currentItemIndex + Number(relativeCardIndex);

  /*
  if (atribute == "cijena") {
    finalItemSpecifications[absoluteCardIndex][atribute] = parseFloat(inputNode.value);
  } else {
    finalItemSpecifications[absoluteCardIndex][atribute] = inputNode.value;
  }
  */
  if (finalItemSpecifications[absoluteCardIndex]) {
    const item = finalItemSpecifications[absoluteCardIndex];
    item.sku = skuInputs[relativeCardIndex].value;
    item.id = idInputs[relativeCardIndex].value;
    item.kataloskiBroj = kataloskiBrojInputs[relativeCardIndex].value;
    // ADD: kataloski broj
    item.naslov = naslovInputs[relativeCardIndex].value;
    item.cijena = parseFloat(cijenaInputs[relativeCardIndex].value);
    item.kategorija = kategorijaInputs[relativeCardIndex].value;
    item.opis = opisInputs[relativeCardIndex].value;
  }

  /*
  card.querySelector(".slikaProizvoda").src = imageUrls[imageIndex];
  skuInputs[index].value = item.sku;
  naslovInputs[index].value = item.naslov;
  cijenaInputs[index].value = item.cijena;
  kategorijaInputs[index].value = item.kategorija;
  opisInputs[index].value = item.opis;
  */
}
function markCardAsSelected(inputNode) {
  const card = inputNode.closest(".card");

  cards.forEach((otherCard) => {
    otherCard.classList.remove("selectedCard");
  });

  card.classList.add("selectedCard");
}
function formatAndMakeToFile() {
  updateItemSpecification(lastInput);
  // formating
  const csvAttributes = [
    "ID",
    "Vrsta",
    "SKU",
    "Naziv",
    "Objavljeno",
    "Istaknuto?",
    "Vidljivost u katalogu",
    "Kratak opis",
    "Opis",
    "Datum početka sniženja",
    "Datum kraja sniženja",
    "Status poreza",
    "Klasa poreza",
    "Na zalihi?",
    "Zalihe",
    "Nisko stanje zalihe",
    "Narudžbe na upit dozvoljene?",
    "Rasprodaja pojedinačno?",
    "Težina (g)",
    "Dužina (cm)",
    "Širina (cm)",
    "Visina (cm)",
    "Dopusti recenzije kupaca?",
    "Napomena uz kupovinu",
    "Rasprodajna cijena",
    "Normalna cijena",
    "Kategorije",
    "Oznake",
    "Klasa dostave",
    "Slike",
    "Limit preuzimanja",
    "Rok isteka preuzimanja",
    "Glavni",
    "Grupirani proizvodi",
    "Uvećana prodaja",
    "Dodatna prodaja",
    "Eksterni URL",
    "Tekst dugmeta",
    "Pozicija",
    "Atribut 1 ime",
    "Atribut 1 vrijednosti",
    "Atribut 1 vidljiv",
    "Atribut 1 globalni",
  ];

  let csvValues = [
    "ID",
    "simple",
    "SKU",
    "NAZIV",
    "1",
    "0",
    "visible",
    "",
    "OPIS",
    "",
    "",
    "taxable",
    "",
    "1",
    "1",
    "",
    "0",
    "1",
    "",
    "",
    "",
    "",
    "0",
    "",
    "",
    "3",
    "KATEGORIJE",
    "",
    "",
    "SLIKE",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "0",
    "Kataloški broj",
    "KATALOSKI_BROJ",
    "1",
    "1",
    "",
  ];

  let csvFile = '"';
  csvFile += csvAttributes.join('", "');

  // zamjeniti gore bolierplate sa tocnim vrijednostima
  // napraviti funkciju za ubacivanje item objekta u boilerplate

  const now = new Date();
  const dan = now.getDate().toString().padStart(2, "0");
  const mjesec = (now.getMonth() + 1).toString().padStart(2, "0");
  const godina = now.getFullYear().toString();

  let photoNamePrefix = `https://kolekcionar.hr/wp-content/uploads/${godina}/${mjesec}/`;

  for (const item of finalItemSpecifications) {
    csvValues[0] = item.id; //item.id
    csvValues[2] = item.sku;
    csvValues[3] = item.naslov;
    csvValues[8] = item.opis.replaceAll("\n", "\\n"); // možda ne treba ovo, pogledati kako ivanov interpretira
    csvValues[25] = item.cijena;
    csvValues[26] = item.kategorija;
    csvValues[29] = photoNamePrefix + item.imeSlike;
    csvValues[40] = item.kataloskiBroj;
    csvFile += '"\n"';
    csvFile += csvValues.join('", "');
  }
  csvFile += '"';

  console.log(finalItemSpecifications);
  console.log(csvFile);

  // saving to file
  saveCSV(`NoviUvoz-${godina}${mjesec}${dan}`, csvFile);
}
function saveCSV(fileName, csvFile) {
  const blob = new Blob([csvFile], {
    type: "text/csv;charset=utf-8;",
  });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, fileName);
  } else {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      let url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

// helper functions
function loadNextPageIfTab(e) {
  // keyCode 9 = 'tab'
  if (e.keyCode == 9) {
    updateItemSpecification(lastInput);
    loadNextPage();
  }
}
function formatPriceAndAdjustWidth(e) {
  // dodaj € na kraj stringa
  let onlyNumbers = parseFloat(e.target.value);
  e.target.value = onlyNumbers + " €";

  // promjeni sirinu
  e.target.style.width = "";
  e.target.style.width = e.target.scrollWidth + "px";
}
function adjustHeight(e) {
  e.target.style.height = "";
  e.target.style.height = e.target.scrollHeight + "px";
}
