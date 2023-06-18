// HTML Elementi
const importImagesButton = document.getElementById("import-images-button");
const modeSelectionOptions = document.querySelectorAll(".mode-selection-options");

const skuInput = document.getElementById("sku-input");
const idInput = document.getElementById("id-input");
const katBrInput = document.getElementById("kat-br-input");
const pocetneVrijednostiInputs = [skuInput, idInput, katBrInput];

const naslovInput = document.getElementById("naslov-input");
const cijenaInput = document.getElementById("cijena-input");
const kategorijaInput = document.getElementById("kategorija-input");
const opisInput = document.getElementById("opis-input");
const defaultVrijednostiInputs = [naslovInput, cijenaInput, kategorijaInput, opisInput];

// Globalne varijable
const itemData = [];
const modeDataPresets = [
  {
    presetName: "Kovanice",
    naslov: "",
    cijena: "",
    kategorija: "NUMIZMATIKA / Kovani novac / ",
    opis: "",
    katBr: "N/A",
  },
  {
    presetName: "Novčanice",
    naslov: "",
    cijena: "",
    kategorija: "NUMIZMATIKA / Papirni novac / ",
    opis: "Serijski broj novčanice kod UNC kvalitete se može razlikovati od broja koji je na slici.\nKod korištenih novčanica G, VG, F, VF, XF kupac dobije novčanicu koja je na slici.",
    katBr: "",
  },
  {
    presetName: "Razglednice",
    naslov: "",
    cijena: "",
    kategorija: "RAZGLEDNICE / ",
    opis: "Stanje razglednice vidljivo na slici.",
    katBr: "",
  },
];

// Event listeneri
modeSelectionOptions.forEach((option) => {
  option.addEventListener("click", fillInputsBasedOnMode);
  option.addEventListener("click", changeOptionStyleToSelected);
});
importImagesButton.addEventListener("change", handleFileUpload);

// Funkcije
function fillInputsBasedOnMode(e) {
  const selectedOptionName = e.target
    .closest(".mode-selection-options")
    .querySelector("p").textContent;

  const dataPreset = modeDataPresets.find(
    (preset) => preset.presetName == selectedOptionName
  );
  console.log(dataPreset);
  naslovInput.value = dataPreset.naslov;
  cijenaInput.value = dataPreset.cijena;
  kategorijaInput.value = dataPreset.kategorija;
  opisInput.value = dataPreset.opis;
  katBrInput.value = dataPreset.katBr;
}
function changeOptionStyleToSelected(e) {
  const selectedOptionElement = e.target.closest(".mode-selection-options");
  for (const optionElement of modeSelectionOptions) {
    optionElement.classList.remove("selected-option");
  }
  selectedOptionElement.classList.add("selected-option");
}
function handleFileUpload() {
  // Check if files are selected
  if (!importImagesButton.files) return;

  // Add preset data and images to itemData
  let itemCounter = 0;
  for (const image of importImagesButton.files) {
    itemData.push({
      id: parseInt(idInput.value) + itemCounter,
      sku: parseInt(skuInput.value) + itemCounter,
      naslov: naslovInput.value,
      cijena: cijenaInput.value,
      kategorija: kategorijaInput.value,
      opis: opisInput.value,
      imeSlike: [image.name],
      kataloskiBroj: katBrInput.value,
    });

    itemCounter += 2;
  }

  // Save data and redirect to itemPage.html
  localStorage.setItem("itemData", JSON.stringify(itemData));
  window.location.href = "itemPage.html";
}
