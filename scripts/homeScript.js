const cardsContainer = document.getElementById("cardsContainer");
const navigation = document.getElementById("navigation");
const buttonsContainer = document.getElementById("buttonsContainer");
const popUpWindow = document.querySelector(".popUpWindow");
const saveAsButton = document.getElementById("saveAsButton");

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
}

saveAsButton.addEventListener("click", formatAndMakeToFile);

const noviUvozInput = document.getElementById("noviUvozInput");
const cards = document.querySelectorAll(".card");

const imageUrls = [];
let currentItemIndex = 0;

const finalItemSpecifications = [];

// na odabir slika
noviUvozInput.addEventListener("change", () => {
  if (!noviUvozInput.files) return;

  console.log(noviUvozInput.files);
  popUpBoxRender();

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
    });
    itemCounter++;

    const reader = new FileReader();

    reader.onload = (e) => {
      console.log(e.target.result);
      imageUrls.push(e.target.result);
      if (imageUrls.length == selectedImageFiles.length) {
        renderSlikeOd(currentItemIndex);
      }
    };

    reader.readAsDataURL(image);
  }
  console.log(finalItemSpecifications);
});

const navigationItemNumber = document.getElementById("navigationItemNumber");
function renderSlikeOd(indexPrveSlike) {
  // update nav
  navigationItemNumber.innerHTML = `${indexPrveSlike + 1}-${
    indexPrveSlike + 3
  } od ${imageUrls.length}`;

  //update images
  cards.forEach((card, i) => {
    if (imageUrls[indexPrveSlike + i]) {
      card.style.visibility = "visible";
      card.querySelector(".slikaProizvoda").src = imageUrls[indexPrveSlike + i];
      naslovInputs[i].value =
        finalItemSpecifications[indexPrveSlike + i].naslov;
      cijenaInputs[i].value =
        finalItemSpecifications[indexPrveSlike + i].cijena;
      kategorijaInputs[i].value =
        finalItemSpecifications[indexPrveSlike + i].kategorija;
      opisInputs[i].value = finalItemSpecifications[indexPrveSlike + i].opis;
    } else {
      card.style.visibility = "hidden";
    }
  });

  saveAsButton.focus();
}

const navigationLeftButton = document.getElementById("navigationLeftButton");
const navigationRightButton = document.getElementById("navigationRightButton");
function loadNextPage() {
  if (currentItemIndex + 3 >= imageUrls.length) return;
  currentItemIndex += 3;
  renderSlikeOd(currentItemIndex);
}
function loadPreviousPage() {
  if (currentItemIndex - 3 < 0) return;
  currentItemIndex -= 3;
  renderSlikeOd(currentItemIndex);
}
navigationLeftButton.addEventListener("click", loadPreviousPage);
navigationRightButton.addEventListener("click", loadNextPage);

// FUNKCIJE NAD INPUTIMA
function pohraniPromjene(inputNode, nizProizvoda, atribut) {
  const relativeCardIndex =
    inputNode.parentNode.parentNode.parentNode.id.slice(-1); // 1, 2 ili 3
  const absoluteCardIndex = currentItemIndex + Number(relativeCardIndex);

  if (atribut == "cijena") {
    nizProizvoda[absoluteCardIndex - 1][atribut] = parseFloat(inputNode.value);
  } else {
    nizProizvoda[absoluteCardIndex - 1][atribut] = inputNode.value;
  }
}

function markCardAsSelected(inputNode) {
  const relativeCardIndex =
    inputNode.parentNode.parentNode.parentNode.id.slice(-1); // 1, 2 ili 3;
  cards.forEach((card, i) => {
    card.classList.remove("selectedCard");
    if (i + 1 == relativeCardIndex) {
      card.classList.add("selectedCard");
    }
  });
}

const allInputs = cardsContainer.querySelectorAll("input, textarea");
allInputs[allInputs.length - 1].addEventListener("keydown", (e) => {
  if (e.keyCode != 9) return;
  loadNextPage();
});

console.log(allInputs);
allInputs.forEach((input) => {
  input.addEventListener("focus", (e) => {
    markCardAsSelected(e.target);
  });
});

// spremanje NASLOV inputa
const naslovInputs = document.querySelectorAll(".naslovInput");
for (const naslovInput of naslovInputs) {
  naslovInput.addEventListener("change", (e) => {
    pohraniPromjene(e.target, finalItemSpecifications, "naslov");
  });
}

// automatsko dodavanje € simbola i spremanje CIJENA input
// STAVITI DA se pomakne decimalno mjesto za 2 mjesta automatski
// možda i ne, staviti toggle postavku
const cijenaInputs = document.querySelectorAll(".cijenaInput");
for (const cijenaInput of cijenaInputs) {
  cijenaInput.addEventListener("change", (e) => {
    // dodaj € na kraj stringa
    let onlyNumbers = parseFloat(e.target.value);
    e.target.value = onlyNumbers + " €";

    // promjeni sirinu
    e.target.style.width = "";
    e.target.style.width = e.target.scrollWidth + "px";

    // pohrani promjene
    pohraniPromjene(e.target, finalItemSpecifications, "cijena");
  });
}

// spremanje KATEGORIJE inputa
const kategorijaInputs = document.querySelectorAll(".kategorijaInput");
for (const kategorijaInput of kategorijaInputs) {
  kategorijaInput.addEventListener("change", (e) => {
    pohraniPromjene(e.target, finalItemSpecifications, "kategorija");
  });
}

// automatski vertikalni resize Opis inputa
const opisInputs = document.querySelectorAll(".opisInput");
for (const opisInput of opisInputs) {
  opisInput.addEventListener("input", (e) => {
    // promjeni visinu
    e.target.style.height = "";
    e.target.style.height = e.target.scrollHeight + "px";

    // pohrani promjene
    pohraniPromjene(e.target, finalItemSpecifications, "opis");
  });
}

function formatAndMakeToFile() {
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
    "Eksterni  URL",
    "Tekst dugmeta",
    "Pozicija",
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
  ];

  let csvFile = '"';
  csvFile += csvAttributes.join('", "');

  // zamjeniti gore bolierplate sa tocnim vrijednostima
  // napraviti funkciju za ubacivanje item objekta u boilerplate

  const now = new Date();
  const mjesec = (now.getMonth() + 1).toString().padStart(2, "0");
  const godina = now.getFullYear().toString();
  let photoNamePrefix = `https://kolekcionar.hr/wp-content/uploads/${godina}/${mjesec}/`;
  for (const item of finalItemSpecifications) {
    csvValues[0] = item.id; //item.id
    csvValues[2] = item.sku;
    csvValues[3] = item.naslov;
    csvValues[8] = item.opis.replaceAll("\n", "\\n"); // možda ne treba ovo, pogledati kako ivanov interpetira
    csvValues[25] = item.cijena;
    csvValues[26] = item.kategorija;
    csvValues[29] = photoNamePrefix + item.imeSlike;
    csvFile += '"\n"';
    csvFile += csvValues.join('", "');
  }
  csvFile += '"';
  console.log(finalItemSpecifications);
  console.log(csvFile);

  // saving to file
  saveCSV("sisata datka", csvFile);
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
// aktivni card se malo rasiri, a ova dva se smanje i postanu tamnija i mozda mutna
// ctrl + gornja strelica da odes polje u nazad

const setIDSButton = document.getElementById("setIDSButton");
const idInputs = popUpWindow.querySelectorAll("input");
setIDSButton.addEventListener("click", () => {
  startingID = parseInt(idInputs[0].value);
  startingSKU = parseInt(idInputs[1].value);

  finalItemSpecifications.forEach((item) => {
    item.id += startingID;
    item.sku += startingSKU;
  });

  itemsRender();
});
