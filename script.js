
// ==============================
// 🔐 Salasana-modal
// ==============================


document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("passwordModal");
  const input = document.getElementById("passwordInput");
  const button = document.getElementById("passwordBtn");
  const error = document.getElementById("passwordError");

  modal.style.display = "block";
  document.body.style.overflow = "hidden";

  function checkPassword() {
    if (input.value === PASSWORD) {

      modal.style.display = "none";
      document.body.style.overflow = "auto";
    } else {
      error.style.display = "block";
      input.value = "";
    }
  }

  button.addEventListener("click", checkPassword);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkPassword();
  });
});


// ==============================
// 🐦 Lintubongaus – Supabase JS
// ==============================

// 🔹 Supabase-asetukset
const SUPABASE_URL = "https://dgohuktfrkhkbzsjqurw.supabase.co"; // vaihda omaasi
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnb2h1a3Rmcmtoa2J6c2pxdXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDI0NzIsImV4cCI6MjA4NDA3ODQ3Mn0.EGafAAoy7c0YyjnEKbDjYnVBL9FUKIzZ-vSkYuj6OIc";              // vaihda omaan anon key
const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};

// 🔹 Muuttujat
let birds = [];
let currentSort = { key: null, asc: true };

// 🔹 DOM-elementit
const nameInput = document.getElementById("name");
const dateInput = document.getElementById("date");
const observerInput = document.getElementById("observer");
const placeInput = document.getElementById("place");
const typeInput = document.getElementById("type");

const saveBtn = document.getElementById("saveBtn");
const showBtn = document.getElementById("showBtn");

const birdModal = document.getElementById("birdModal");
const closeModal = document.getElementById("closeModal");
const modalBirdList = document.getElementById("modalBirdList");

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}

// ==============================
// 🔹 Lataa bongaukset Supabasesta
// ==============================
async function loadBirds() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/birds?select=*`, {
      headers
    });
    birds = await res.json();
  } catch (err) {
    console.error("Virhe latauksessa:", err);
    alert("Bongauksia ei voitu ladata!");
  }
}

function renderModalList() {
  modalBirdList.innerHTML = "";

  const countsByObserver = {};

  birds.forEach((bird) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${bird.name}</td>
      <td>${formatDate(bird.date)}</td>
      <td>${bird.place || ""}</td>
      <td>${bird.type}</td>
      <td>${bird.observer || "Tuntematon"}</td>
      <td><button class="delete-btn" onclick="deleteBird(${bird.id})">Poista</button></td>
    `;

    modalBirdList.appendChild(tr);

    // 🔹 Laske bongaukset per bongaaja
    const observer = bird.observer?.trim() || "Tuntematon";
    countsByObserver[observer] = (countsByObserver[observer] || 0) + 1;
  });
 
  // 🔹 Muodosta teksti
const summary = Object.entries(countsByObserver)
  .map(([observer, count]) => `${observer}: ${count} bongaus${count > 1 ? "ta" : ""}`)
  .join("<br>");

  document.getElementById("birdCount").innerHTML =
  `<strong>Bongaukset:</strong>${summary}`;
}

saveBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const date = dateInput.value;
  const type = typeInput.value;
  const place = placeInput.value.trim();
  const observer = observerInput.value.trim();

  // 🔹 Tarkistukset
  if (!name || !date || !type || !place || !observer) {
    alert("Täytä kaikki kentät!");
    return;
  }

  if (name.charAt(0) !== name.charAt(0).toUpperCase()) {
    alert("Linnun nimen tulee alkaa isolla kirjaimella!");
    return;
  }

  // 🔹 Lataa olemassa olevat bongaukset
  await loadBirds();

  const exists = birds.some(
    (b) => b.name.toLowerCase() === name.toLowerCase() &&
          (b.observer?.trim().toLowerCase() || "") === observer.trim().toLowerCase()
  );

  if (exists) {
    alert("Olet jo lisännyt tämän linnun saman bongaajan kanssa!");
    return;
  }

  // 🔹 Lähetä Supabaseen
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/birds`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name, date, place, type, observer })
    });

    // Tyhjennä kentät
    nameInput.value = "";
    dateInput.value = "";
    placeInput.value = "";
    typeInput.value = "";
    observerInput.value = "";

    alert("Bongaus tallennettu!");
  } catch (err) {
    console.error("Tallennusvirhe:", err);
    alert("Bongauksia ei voitu tallentaa!");
  }
});


// ==============================
// 🔹 Poista bongaus Supabasesta
// ==============================
async function deleteBird(id) {
  if (!confirm("Haluatko varmasti poistaa tämän bongauksen?")) return;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/birds?id=eq.${id}`, {
      method: "DELETE",
      headers
    });

    await loadBirds();
    renderModalList();
  } catch (err) {
    console.error("Poistovirhe:", err);
    alert("Bongauksia ei voitu poistaa!");
  }
}

// ==============================
// 🔹 Näytä modal
// ==============================
showBtn.addEventListener("click", async () => {
  await loadBirds();
  renderModalList();
  birdModal.style.display = "block";
});

// 🔹 Sulje modal
closeModal.addEventListener("click", () => {
  birdModal.style.display = "none";
});
window.addEventListener("click", (event) => {
  if (event.target === birdModal) birdModal.style.display = "none";
});

// ==============================
// 🔹 Lajittelu taulukossa
// ==============================
function attachSorting() {
  document.querySelectorAll("#birdModal th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (currentSort.key === key) currentSort.asc = !currentSort.asc;
      else { currentSort.key = key; currentSort.asc = true; }

      birds.sort((a, b) =>
        currentSort.asc
          ? (a[key] || "").toString().localeCompare((b[key] || "").toString())
          : (b[key] || "").toString().localeCompare((a[key] || "").toString())
      );

      renderModalList();
    });
  });
}


const PASSWORD = "Suagnobutnil";
attachSorting();
