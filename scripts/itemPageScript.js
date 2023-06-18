// HTML Elementi
const showHistoryButton = document.getElementById("showHistoryButton");
const saveAsButton = document.getElementById("saveAsButton");
const navigation = document.getElementById("navigation");
const navigationItemNumber = document.getElementById("navigationItemNumber");
const navigationLeftButton = document.getElementById("navigationLeftButton");
const navigationRightButton = document.getElementById("navigationRightButton");

const cardsContainer = document.getElementById("cardsContainer");
const cards = document.querySelectorAll(".card");

const joinFromLeftIcons = document.querySelectorAll(".joinFromLeftIcon");
const joinFromRightIcons = document.querySelectorAll(".joinFromRightIcon");
const showPrevImageIcons = document.querySelectorAll(".showPrevImageIcon");
const showNextImageIcons = document.querySelectorAll(".showNextImageIcon");
const imageCounters = document.querySelectorAll(".imageCounter");

const allInputs = cardsContainer.querySelectorAll("input, textarea");
const lastInput = allInputs[allInputs.length - 1];
const skuInputs = document.querySelectorAll(".skuInput");
const idInputs = document.querySelectorAll(".idInput");
const kataloskiBrojInputs = document.querySelectorAll(".kataloskiBrojInput");
const naslovInputs = document.querySelectorAll(".naslovInput");
const cijenaInputs = document.querySelectorAll(".cijenaInput");
const kategorijaInputs = document.querySelectorAll(".kategorijaInput");
const opisInputs = document.querySelectorAll(".opisInput");

// Event listeneri
window.onbeforeunload = () => {
  localStorage.setItem("itemData", JSON.stringify(itemData));
  return true;
};
showHistoryButton.addEventListener("click", goToHistoryPage);
saveAsButton.addEventListener("click", formatAndMakeToFile);
navigationLeftButton.addEventListener("click", loadPreviousPage);
navigationRightButton.addEventListener("click", loadNextPage);

joinFromLeftIcons.forEach((joinFromLeftIcon) => {
  joinFromLeftIcon.addEventListener("click", joinImageFromLeft);
});
joinFromRightIcons.forEach((joinFromRightIcon) => {
  joinFromRightIcon.addEventListener("click", joinImageFromRight);
});
showPrevImageIcons.forEach((showPrevImageIcon) => {
  showPrevImageIcon.addEventListener("click", showPrevImage);
});
showNextImageIcons.forEach((showNextImageIcon) => {
  showNextImageIcon.addEventListener("click", showNextImage);
});

lastInput.addEventListener("keydown", loadNextPageIfTab);
allInputs.forEach((input) => {
  input.addEventListener("focus", markCardAsSelected);
  input.addEventListener("focusout", (e) => {
    updateItemSpecification(e.target);
  });
  input.addEventListener("keydown", copyPreviousValueToInput); //na "enter"
});
lastInput.removeEventListener("focusout", (e) => {
  updateItemSpecification(e.target);
});
cijenaInputs.forEach((cijenaInput) => {
  cijenaInput.addEventListener("focusout", formatPriceAndAdjustWidth);
});
kategorijaInputs.forEach((kategorijaInput) => {
  kategorijaInput.addEventListener("focusout", addCategoryToBeginningOfTitle);
  kategorijaInput.addEventListener("input", isValidCategory);
});
opisInputs.forEach((opisInput) => {
  opisInput.addEventListener("input", adjustHeight);
});

// Globalne varijable
const imagePath = "slikeProizvoda/";
const itemData = JSON.parse(localStorage.getItem("itemData")); // finalni podaci o itemima
let allPosibleCategories;
getCategories();
let currentItemIndex = 0; // apsolutni index, zapravo pokazatelj na kojoj stranici (visekratnik 3)

renderCardsFrom(currentItemIndex);

/* Funkcije */
function goToHistoryPage() {
  window.location.href = "historyPage.html";
}
function joinImageFromLeft(e) {
  const card = e.target.closest(".card");
  const relativeCardIndex = Number(card.id.slice(-1)) - 1; // 0, 1 ili 2
  const absoluteCardIndex = currentItemIndex + relativeCardIndex;

  if (absoluteCardIndex == 0) return;

  // Add image to item images
  const previousImage = itemData[absoluteCardIndex - 1].imeSlike;
  itemData[absoluteCardIndex].imeSlike.push(...previousImage);

  // Delete the joined item
  itemData.splice(absoluteCardIndex - 1, 1);

  // Re-render html
  renderCardsFrom(currentItemIndex);
}
function joinImageFromRight(e) {
  const card = e.target.closest(".card");
  const relativeCardIndex = Number(card.id.slice(-1)) - 1; // 0, 1 ili 2
  const absoluteCardIndex = currentItemIndex + relativeCardIndex;

  if (absoluteCardIndex == itemData.length - 1) return;

  // Add image to item images
  const nextImage = itemData[absoluteCardIndex + 1].imeSlike;
  itemData[absoluteCardIndex].imeSlike.push(...nextImage);

  // Delete the joined item
  itemData.splice(absoluteCardIndex + 1, 1);

  // Re-render html
  renderCardsFrom(currentItemIndex);
}
function showPrevImage(e) {
  const card = e.target.closest(".card");
  const relativeCardIndex = Number(card.id.slice(-1)) - 1; // 0, 1 ili 2
  const absoluteCardIndex = currentItemIndex + relativeCardIndex;
  const imageCounter = e.target.parentNode.querySelector(".imageCounter");

  const currentImageIndex = parseInt(imageCounter.textContent.split("/")[0]) - 1;
  const maxImageIndex = parseInt(imageCounter.textContent.split("/")[1]);

  if (currentImageIndex < 1) return;

  card.querySelector(".slikaProizvoda").src =
    imagePath + itemData[absoluteCardIndex].imeSlike[currentImageIndex - 1];
  imageCounter.textContent = currentImageIndex + "/" + maxImageIndex;
}
function showNextImage(e) {
  const card = e.target.closest(".card");
  const relativeCardIndex = Number(card.id.slice(-1)) - 1; // 0, 1 ili 2
  const absoluteCardIndex = currentItemIndex + relativeCardIndex;
  const imageCounter = e.target.parentNode.querySelector(".imageCounter");

  const currentImageIndex = parseInt(imageCounter.textContent.split("/")[0]) + 1;
  const maxImageIndex = parseInt(imageCounter.textContent.split("/")[1]);

  if (currentImageIndex > maxImageIndex) return;

  card.querySelector(".slikaProizvoda").src =
    imagePath + itemData[absoluteCardIndex].imeSlike[currentImageIndex - 1];
  imageCounter.textContent = currentImageIndex + "/" + maxImageIndex;
}

function loadNextPage() {
  updateItemSpecification(lastInput);
  if (currentItemIndex + 3 >= itemData.length) return;
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
  const endIndex = Math.min(startIndex + 3, itemData.length);
  navigationItemNumber.textContent = `${startIndex + 1}-${endIndex} of ${
    itemData.length
  }`;

  // Update images
  cards.forEach((card, index) => {
    const itemIndex = startIndex + index;

    if (itemData[itemIndex]) {
      card.style.visibility = "visible";
      const item = itemData[itemIndex];
      card.querySelector(".slikaProizvoda").src = imagePath + item.imeSlike[0];
      imageCounters[index].textContent = "1/" + item.imeSlike.length;
      skuInputs[index].value = item.sku;
      idInputs[index].value = item.id;
      kataloskiBrojInputs[index].value = item.kataloskiBroj;
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

  if (itemData[absoluteCardIndex]) {
    const item = itemData[absoluteCardIndex];
    item.sku = skuInputs[relativeCardIndex].value;
    item.id = idInputs[relativeCardIndex].value;
    item.kataloskiBroj = kataloskiBrojInputs[relativeCardIndex].value;
    item.naslov = naslovInputs[relativeCardIndex].value;
    item.cijena = parseFloat(cijenaInputs[relativeCardIndex].value);
    item.kategorija = kategorijaInputs[relativeCardIndex].value;
    item.opis = opisInputs[relativeCardIndex].value;
  }
}
function markCardAsSelected(e) {
  const card = e.target.closest(".card");

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
  ];

  let csvFile = '"';
  csvFile += csvAttributes.join('", "');

  const now = new Date();
  const dan = now.getDate().toString().padStart(2, "0");
  const mjesec = (now.getMonth() + 1).toString().padStart(2, "0");
  const godina = now.getFullYear().toString();
  const photoNamePrefix = `https://kolekcionar.hr/wp-content/uploads/${godina}/${mjesec}/`;

  for (const item of itemData) {
    csvValues[0] = item.id; //item.id
    csvValues[2] = item.sku;
    csvValues[3] = item.naslov;
    csvValues[8] = item.opis.replaceAll("\n", "\\n"); // možda ne treba ovo, pogledati kako ivanov interpretira
    csvValues[25] = item.cijena;
    csvValues[26] = item.kategorija.replaceAll("/", ">");
    csvValues[29] = item.imeSlike
      .map((imeslike) => photoNamePrefix + imeslike)
      .join(", ");
    if (item.kataloskiBroj == "N/A" || item.kataloskiBroj == "") {
      csvValues[39] = "";
      csvValues[40] = "";
      csvValues[41] = "";
      csvValues[42] = "";
    } else {
      csvValues[39] = "Kataloški broj";
      csvValues[40] = item.kataloskiBroj;
      csvValues[41] = "1";
      csvValues[42] = "1";
    }
    csvFile += '"\n"';
    csvFile += csvValues.join('", "');
  }
  csvFile += '"';

  console.log(itemData);
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
  if (onlyNumbers) {
    e.target.value = onlyNumbers + " €";
  } else {
    e.target.value = "";
  }

  // promjeni sirinu
  e.target.style.width = "";
  e.target.style.width = e.target.scrollWidth + "px";
}
function adjustHeight(e) {
  e.target.style.height = "";
  e.target.style.height = e.target.scrollHeight + "px";
}
function addCategoryToBeginningOfTitle(e) {
  const naslovInput = e.target.closest(".cardTextFields").querySelector(".naslovInput");
  const categoryInput = e.target;
  const lastCategoryText = categoryInput.value.split("/").slice(-1).toString().trim();

  if (lastCategoryText.length == 0) return;
  if (naslovInput.value.length != 0) return;

  naslovInput.value = lastCategoryText + " ";
}
function isValidCategory(e) {
  if (!allPosibleCategories) return;

  const categoryInput = e.target.value.replaceAll("/", ">");
  const categoryIcon = e.target.nextElementSibling;
  console.log(categoryIcon);

  if (allPosibleCategories.includes(categoryInput)) {
    categoryIcon.src = "images/checkmark.svg";
  } else {
    categoryIcon.src = "images/x.svg";
  }
}
function copyPreviousValueToInput(e) {
  // keyCode 13 = 'enter'
  if (e.keyCode == 13 && e.shiftKey == false) {
    e.preventDefault();
    const card = e.target.closest(".card");
    const relativeCardIndex = Number(card.id.slice(-1)) - 1; // 0, 1 ili 2
    const absoluteCardIndex = currentItemIndex + relativeCardIndex;

    if (absoluteCardIndex == 0) return;

    const fieldType = e.target.className.slice(0, -5);
    e.target.value = itemData[absoluteCardIndex - 1][fieldType];
  }
}
async function getCategories() {
  const res = await fetch("kategorije.json");
  allPosibleCategories = await res.json();
}
