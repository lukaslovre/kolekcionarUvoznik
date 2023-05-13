// HTML Elementi
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

// Event listeneri
window.onbeforeunload = () => {
  localStorage.setItem("imageUrls", JSON.stringify(imageUrls));
  localStorage.setItem("itemData", JSON.stringify(finalItemSpecifications));
  return true;
};
saveAsButton.addEventListener("click", formatAndMakeToFile);
navigationLeftButton.addEventListener("click", loadPreviousPage);
navigationRightButton.addEventListener("click", loadNextPage);

lastInput.addEventListener("keydown", loadNextPageIfTab);
allInputs.forEach((input) => {
  input.addEventListener("focus", markCardAsSelected);
  input.addEventListener("focusout", (e) => {
    updateItemSpecification(e.target);
  });
  input.addEventListener("keydown", copyPreviousValueToInput); //na "enter"
});
lastInput.removeEventListener("change", (e) => {
  updateItemSpecification(e.target);
});
cijenaInputs.forEach((cijenaInput) => {
  cijenaInput.addEventListener("focusout", formatPriceAndAdjustWidth);
});
kategorijaInputs.forEach((kategorijaInput) => {
  kategorijaInput.addEventListener("focusout", addCategoryToBeginningOfTitle);
});
opisInputs.forEach((opisInput) => {
  opisInput.addEventListener("input", adjustHeight);
});

// Globalne varijable
const finalItemSpecifications = JSON.parse(localStorage.getItem("itemData")); // finalni podaci o itemima
const imageUrls = JSON.parse(localStorage.getItem("imageUrls")); //lista slika (podatci o slikama, ne samo url)
let currentItemIndex = 0; // apsolutni index, zapravo pokazatelj na kojoj stranici (visekratnik 3)
renderCardsFrom(currentItemIndex);

/* Funkcije */
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

  if (finalItemSpecifications[absoluteCardIndex]) {
    const item = finalItemSpecifications[absoluteCardIndex];
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
  const lastCategoryText = e.target.value.split("/").slice(-1).toString().trim();

  if (lastCategoryText.length == 0) return;
  naslovInput.value = lastCategoryText + " " + naslovInput.value;
}
function copyPreviousValueToInput(e) {
  // keyCode 13 = 'enter'
  if (e.keyCode == 13 && e.shiftKey == false) {
    const card = e.target.closest(".card");
    const relativeCardIndex = Number(card.id.slice(-1)) - 1; // 0, 1 ili 2
    const absoluteCardIndex = currentItemIndex + relativeCardIndex;

    if (absoluteCardIndex == 0) return;

    const fieldType = e.target.className.slice(0, -5);
    e.target.value = finalItemSpecifications[absoluteCardIndex - 1][fieldType];
  }
}
