// HTML Elementi
const importImagesButton = document.getElementById("import-images-button");
const importCsvButton = document.getElementById("import-csv-button");
const modeSelectionOptions = document.querySelectorAll(".mode-selection-options");

const csvImportPreview = document.getElementById("csv-import-preview");
const csvImportSummary = document.getElementById("csv-import-summary");
const csvImportIgnored = document.getElementById("csv-import-ignored");
const csvImportWarnings = document.getElementById("csv-import-warnings");
const csvImportSample = document.getElementById("csv-import-sample");
const confirmCsvImportButton = document.getElementById("confirm-csv-import");
const cancelCsvImportButton = document.getElementById("cancel-csv-import");

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
let pendingCsvItems = null;
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
importCsvButton.addEventListener("change", handleCsvUpload);
confirmCsvImportButton.addEventListener("click", confirmCsvImport);
cancelCsvImportButton.addEventListener("click", clearCsvImportPreview);

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

async function handleCsvUpload() {
  const csvFile = importCsvButton.files[0];
  if (!csvFile) return;

  try {
    const csvText = await csvFile.text();
    const importResult = convertCsvToItems(csvText);
    pendingCsvItems = importResult.items;
    renderCsvImportPreview(importResult);
  } catch (error) {
    pendingCsvItems = null;
    csvImportPreview.hidden = false;
    csvImportSummary.textContent = `CSV se ne može učitati: ${error.message}`;
    csvImportIgnored.textContent = "";
    csvImportWarnings.replaceChildren();
    csvImportSample.textContent = "";
    confirmCsvImportButton.hidden = true;
  }
}

function confirmCsvImport() {
  if (!pendingCsvItems) return;

  // CSV postaje trenutni uvoz. History se namjerno ne mijenja.
  localStorage.setItem("itemData", JSON.stringify(pendingCsvItems));
  window.location.href = "itemPage.html";
}

function clearCsvImportPreview() {
  pendingCsvItems = null;
  importCsvButton.value = "";
  csvImportPreview.hidden = true;
  confirmCsvImportButton.hidden = false;
}

function renderCsvImportPreview(importResult) {
  csvImportPreview.hidden = false;
  confirmCsvImportButton.hidden = false;
  csvImportSummary.textContent = `Pronađeno proizvoda: ${importResult.items.length}. Odabirom uvoza zamijenit će se trenutni uvoz.`;
  csvImportIgnored.textContent = importResult.ignoredHeaders.length
    ? `Ignorirani stupci neće biti sačuvani pri ponovnom izvozu (${importResult.ignoredHeaders.length}): ${importResult.ignoredHeaders.join(
        ", "
      )}`
    : "Nema ignoriranih stupaca.";

  csvImportWarnings.replaceChildren();
  if (importResult.warnings.length == 0) {
    const warningItem = document.createElement("li");
    warningItem.textContent = "Nema upozorenja.";
    csvImportWarnings.appendChild(warningItem);
  } else {
    for (const warning of importResult.warnings) {
      const warningItem = document.createElement("li");
      warningItem.textContent = warning;
      csvImportWarnings.appendChild(warningItem);
    }
  }

  csvImportSample.textContent = JSON.stringify(importResult.items.slice(0, 2), null, 2);
}

function convertCsvToItems(csvText) {
  if (csvText.trim().length == 0) {
    throw new Error("datoteka je prazna.");
  }

  const delimiter = detectCsvDelimiter(csvText);
  const rows = parseCsv(csvText, delimiter);
  if (rows.length < 2) {
    throw new Error("CSV nema redove s proizvodima.");
  }

  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());
  const normalizedHeaders = headers.map(normalizeHeader);
  const supportedHeaders = {
    id: "id",
    sku: "sku",
    naziv: "naslov",
    opis: "opis",
    "normalna cijena": "cijena",
    kategorije: "kategorija",
    slike: "imeSlike",
    "atribut 1 vrijednosti": "kataloskiBroj",
  };

  const recognizedHeaderCount = normalizedHeaders.filter(
    (header) => supportedHeaders[header]
  ).length;
  if (recognizedHeaderCount == 0) {
    throw new Error("nije pronađen nijedan podržani WooCommerce stupac.");
  }

  const ignoredHeaders = headers.filter(
    (_, index) => !supportedHeaders[normalizedHeaders[index]]
  );
  const rowLengthMismatchCount = rows.slice(1).filter(
    (row) => row.length != headers.length && row.some((value) => value.trim() != "")
  ).length;

  let skippedRows = 0;
  const items = [];
  for (const row of rows.slice(1)) {
    if (row.every((value) => value.trim() == "")) continue;

    const rowData = {};
    normalizedHeaders.forEach((header, index) => {
      const itemProperty = supportedHeaders[header];
      if (itemProperty) rowData[itemProperty] = (row[index] || "").trim();
    });

    if (Object.values(rowData).every((value) => value == "")) {
      skippedRows += 1;
      continue;
    }

    items.push({
      id: rowData.id || "",
      sku: rowData.sku || "",
      naslov: rowData.naslov || "",
      cijena: normalizePrice(rowData.cijena || ""),
      kategorija: normalizeCategory(rowData.kategorija || ""),
      opis: (rowData.opis || "").replaceAll("\\n", "\n"),
      imeSlike: normalizeImages(rowData.imeSlike || ""),
      kataloskiBroj: rowData.kataloskiBroj || "",
    });
  }

  if (items.length == 0) {
    throw new Error("nije pronađen nijedan proizvod za učitavanje.");
  }

  const warnings = [];
  addMissingValueWarning(warnings, items, "id", "ID");
  addMissingValueWarning(warnings, items, "sku", "SKU");
  addMissingValueWarning(warnings, items, "naslov", "naziv");
  addMissingValueWarning(warnings, items, "cijena", "cijenu");
  addMissingValueWarning(warnings, items, "imeSlike", "sliku", true);
  addDuplicateValueWarning(warnings, items, "id", "ID");
  addDuplicateValueWarning(warnings, items, "sku", "SKU");

  if (rowLengthMismatchCount > 0) {
    warnings.push(
      `${rowLengthMismatchCount} redaka ima drugačiji broj stupaca od zaglavlja.`
    );
  }
  if (skippedRows > 0) {
    warnings.push(`${skippedRows} redaka je preskočeno jer nema prepoznatih podataka.`);
  }

  return { items, ignoredHeaders, warnings };
}

function normalizeHeader(header) {
  return header.trim().toLocaleLowerCase("hr");
}

function normalizePrice(price) {
  const normalizedPrice = price.replaceAll("€", "").trim();
  if (/^-?\d+,\d+$/.test(normalizedPrice)) {
    return normalizedPrice.replace(",", ".");
  }
  return normalizedPrice;
}

function normalizeCategory(category) {
  if (!category.trim()) return "";

  const categoryParts = category
    .split(category.includes(">") ? ">" : "/")
    .map((part) => part.trim())
    .filter(Boolean);

  return categoryParts.length ? `${categoryParts.join(" / ")} / ` : "";
}

function normalizeImages(images) {
  return images
    .split(",")
    .map((image) => image.trim())
    .filter(Boolean);
}

function addMissingValueWarning(warnings, items, property, label, isArray = false) {
  const missingCount = items.filter((item) =>
    isArray ? item[property].length == 0 : item[property] == ""
  ).length;
  if (missingCount > 0) {
    warnings.push(`${missingCount} proizvoda nema ${label}.`);
  }
}

function addDuplicateValueWarning(warnings, items, property, label) {
  const values = items.map((item) => item[property]).filter(Boolean);
  const duplicateCount = values.length - new Set(values).size;
  if (duplicateCount > 0) {
    warnings.push(`Pronađeno je ${duplicateCount} dupliciranih ${label} vrijednosti.`);
  }
}

function detectCsvDelimiter(csvText) {
  let inQuotes = false;
  let commaCount = 0;
  let semicolonCount = 0;

  for (const character of csvText) {
    if (character == '"') inQuotes = !inQuotes;
    if (!inQuotes && (character == "\n" || character == "\r")) break;
    if (!inQuotes && character == ",") commaCount += 1;
    if (!inQuotes && character == ";") semicolonCount += 1;
  }

  return semicolonCount > commaCount ? ";" : ",";
}

// Mali parser je dovoljan za WooCommerce CSV i pravilno obrađuje navodnike i nove retke.
function parseCsv(csvText, delimiter) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index++) {
    const character = csvText[index];

    if (character == '"') {
      if (inQuotes && csvText[index + 1] == '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character == delimiter && !inQuotes) {
      row.push(value);
      value = "";
    } else if ((character == "\n" || character == "\r") && !inQuotes) {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      if (character == "\r" && csvText[index + 1] == "\n") index += 1;
    } else {
      value += character;
    }
  }

  if (inQuotes) {
    throw new Error("CSV sadrži nezatvorene navodnike.");
  }

  if (value != "" || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}
