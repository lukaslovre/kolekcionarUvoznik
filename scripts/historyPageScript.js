// HTML elementi
const showHistoryButton = document.getElementById("showHistoryButton");

const currentImportsContainer = document.getElementById("currentImportContainer");
const currentImportsDataContainer = currentImportsContainer.querySelector(".itemData");
const saveCurrentImportButton = document.getElementById("saveCurrentImportButton");
const editCurrentImportButton = document.getElementById("editCurrentImportButton");

const savedImportsContainer = document.getElementById("savedImportsContainer");
let deleteButtons; // Mora se ucitati nakon sto se rendera u JS
let editButtons; // Mora se ucitati nakon sto se rendera u JS

const importItemTemplate = document.getElementById("importItemTemplate");

// Event listeneri
showHistoryButton.addEventListener("click", goToItemPage);
saveCurrentImportButton.addEventListener("click", saveCurrentImport);
editCurrentImportButton.addEventListener("click", goToItemPage);

// Globalne varijable
const itemData = JSON.parse(localStorage.getItem("itemData")); // finalni podaci o itemima
const savedImports = JSON.parse(localStorage.getItem("savedImports")) || [];

renderCurrentImport();
renderSavedImports();

// Funkcije
function saveCurrentImport() {
  savedImports.push(itemData);
  console.log(savedImports);

  clearSavedImports();
  renderSavedImports();
  localStorage.setItem("savedImports", JSON.stringify(savedImports));
}
function deleteSavedImport(e) {
  const clickedIcon = e.target;
  const clickedItem = clickedIcon.closest(".importItem");
  const itemIndex = clickedItem.querySelector(".itemData").dataset.index;
  console.log(itemIndex);

  clickedItem.style.animation = "fade-out 250ms linear";
  clickedItem.addEventListener("animationend", () => {
    // Obriši item iz liste savedImporta i spremi novu listu u localStorage
    savedImports.splice(itemIndex, 1);
    localStorage.setItem("savedImports", JSON.stringify(savedImports));

    clearSavedImports();
    renderSavedImports();
  });
}
function editSavedImport(e) {
  const clickedIcon = e.target;
  const itemIndex = clickedIcon.closest(".importItem").querySelector(".itemData")
    .dataset.index;
  console.log(itemIndex);

  localStorage.setItem("itemData", JSON.stringify(savedImports[itemIndex]));
  window.location.href = "itemPage.html";
}
function goToItemPage() {
  window.location.href = "itemPage.html";
}

function renderCurrentImport() {
  for (const importData of itemData) {
    const naslovElem = document.createElement("p");
    naslovElem.classList.add("naslov");
    naslovElem.textContent = importData.naslov || "null";
    currentImportsDataContainer.appendChild(naslovElem);

    const cijenaElem = document.createElement("p");
    cijenaElem.classList.add("cijena");
    cijenaElem.textContent = importData.cijena + " €";
    currentImportsDataContainer.appendChild(cijenaElem);

    const opisElem = document.createElement("p");
    opisElem.classList.add("opis");
    opisElem.textContent = importData.opis || "null";
    currentImportsDataContainer.appendChild(opisElem);
  }
}
function renderSavedImports() {
  let index = 0;
  for (const savedImport of savedImports) {
    const clone = importItemTemplate.content.cloneNode(true);
    const itemDataContainer = clone.querySelector(".itemData");
    itemDataContainer.dataset.index = index;

    for (const importData of savedImport) {
      const naslovElem = document.createElement("p");
      naslovElem.classList.add("naslov");
      naslovElem.textContent = importData.naslov || "null";
      itemDataContainer.appendChild(naslovElem);

      const cijenaElem = document.createElement("p");
      cijenaElem.classList.add("cijena");
      cijenaElem.textContent = importData.cijena + " €";
      itemDataContainer.appendChild(cijenaElem);

      const opisElem = document.createElement("p");
      opisElem.classList.add("opis");
      opisElem.textContent = importData.opis || "null";
      itemDataContainer.appendChild(opisElem);
    }
    savedImportsContainer.appendChild(clone);
    index++;
  }

  // ovo se moze stavit u funkciju odvojenu
  deleteButtons = savedImportsContainer.querySelectorAll(".deleteButton");
  deleteButtons.forEach((deleteButton) => {
    deleteButton.addEventListener("click", deleteSavedImport);
  });

  editButtons = savedImportsContainer.querySelectorAll(".editButton");
  editButtons.forEach((editBUtton) => {
    editBUtton.addEventListener("click", editSavedImport);
  });
}
function clearSavedImports() {
  savedImportsContainer.replaceChildren();
  const importContainerTitle = document.createElement("p");
  importContainerTitle.classList.add("importContainerTitle");
  importContainerTitle.textContent = "Spremljeni uvozi";
  savedImportsContainer.appendChild(importContainerTitle);
}
