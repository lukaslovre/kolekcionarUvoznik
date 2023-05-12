// Elementi
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

// globalne varijable
const imageUrls = [];
const finalItemSpecifications = [];
const modeDataPresets = [
  {
    presetName: "Kovanice",
    naslov: "kategorija grad",
    cijena: "",
    kategorija: "Početna / NUMIZMATIKA / Kovani novac / ",
    opis: "",
    katBr: "N/A",
  },
  {
    presetName: "Novčanice",
    naslov: "kategorija grad",
    cijena: "",
    kategorija: "Početna / NUMIZMATIKA / Papirni novac / ",
    opis: "Serijski broj novčanice kod UNC kvalitete se može razlikovati od broja koji je na slici.\nKod korištenih novčanica G, VG, F, VF, XF kupac dobije novčanicu koja je na slici.",
    katBr: "",
  },
  {
    presetName: "Razglednice",
    naslov: "kategorija grad",
    cijena: "",
    kategorija: "Početna / RAZGLEDNICE / ",
    opis: "Stanje razglednice vidljivo na slici.",
    katBr: "",
  },
];

// Event listeneri
modeSelectionOptions.forEach((option) => {
  option.addEventListener("click", fillInputsBasedOnMode);
  option.addEventListener("click", changeOptionStyleToSelected);
});
cijenaInput.addEventListener("change", addMoneySimbolToInput);
importImagesButton.addEventListener("change", handleFileUpload);

// funkcije
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

  // Reset imageUrls and add new images to finalItemSpecifications
  imageUrls.length = 0; // ocisti prijasnje slike

  let itemCounter = 0;
  for (const image of importImagesButton.files) {
    finalItemSpecifications.push({
      id: parseInt(idInput.value) + itemCounter,
      sku: parseInt(skuInput.value) + itemCounter,
      naslov: naslovInput.value,
      cijena: cijenaInput.value,
      kategorija: kategorijaInput.value,
      opis: opisInput.value,
      imeSlike: image.name,
      kataloskiBroj: katBrInput.value,
    });
    itemCounter++;

    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrls.push(e.target.result);
      if (imageUrls.length == importImagesButton.files.length) {
        // renderCardsFrom(currentItemIndex);
        console.log(imageUrls);
        console.log(finalItemSpecifications);
        localStorage.setItem("imageUrls", JSON.stringify(imageUrls));
        localStorage.setItem(
          "finalItemSpecifications",
          JSON.stringify(finalItemSpecifications)
        );
        window.location.href = "/itemPage.html";
      }
    };
    reader.readAsDataURL(image);
  }
}

// helper funkcije
function addMoneySimbolToInput(e) {
  let onlyNumbers = parseFloat(e.target.value);
  if (onlyNumbers) {
    e.target.value = onlyNumbers + " €";
  } else {
    e.target.value = "";
  }
}
