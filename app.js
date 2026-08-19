/*****************************************
 GREENERY FUN RUN
 NETLIFY QR SCANNER PRO
 APP.JS
*****************************************/

const API_URL = "/.netlify/functions/api";

// ========================================
// CONFIGURATION
// ========================================

let currentBib = "";
let currentCrew = "Crew A";
let currentKaunter = "Kaunter 1";

let scanner = null;
let scannerRunning = false;
let processingQR = false;

// Elakkan QR yang sama diproses semula
let lastScannedBib = "";
let lastScanTime = 0;

// Tempoh anti-double scan
const SCAN_COOLDOWN = 3000;


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  function(){

    console.log(
      "GREENERY FUN RUN Scanner PRO loading..."
    );

    startScanner();

  }
);


// ========================================
// START SCANNER
// ========================================

function startScanner(){

  const reader =
    document.getElementById("reader");

  if(!reader){

    console.error(
      "Element #reader tidak dijumpai"
    );

    return;

  }

  // Jika scanner masih hidup
  if(scannerRunning){

    console.log(
      "Scanner sudah berjalan"
    );

    return;

  }

  // Bersihkan reader
  reader.innerHTML = "";

  scanner =
    new Html5Qrcode("reader");


  scanner.start(

    {
      facingMode: {
        ideal: "environment"
      }
    },

    {
      fps: 10,

      qrbox: {
        width: 250,
        height: 250
      },

      aspectRatio: 1.0

    },

    function(decodedText){

      handleQR(decodedText);

    },

    function(errorMessage){

      // Jangan paparkan scanning error
      // kerana callback dipanggil berkali-kali.

    }

  )

  .then(function(){

    scannerRunning = true;

    console.log(
      "Camera scanner started"
    );

    showResult(
      "📷 Scanner bersedia — sila scan QR peserta.",
      "success"
    );

  })

  .catch(function(error){

    scannerRunning = false;

    console.error(
      "Camera error:",
      error
    );

    showResult(

      "❌ Kamera tidak dapat digunakan.<br><br>" +

      "Sila pastikan permission kamera dibenarkan.",

      "error"

    );

  });

}


// ========================================
// HANDLE QR
// ========================================

function handleQR(text){

  if(!text){

    return;

  }

  const bib =
    String(text)
      .trim();


  if(!bib){

    return;

  }


  // ======================================
  // BLOCK JIKA SEDANG PROCESS
  // ======================================

  if(processingQR){

    console.log(
      "QR sedang diproses:",
      bib
    );

    return;

  }


  // ======================================
  // ANTI DOUBLE SCAN
  // ======================================

  const now =
    Date.now();


  if(
    bib === lastScannedBib &&
    (now - lastScanTime) <
    SCAN_COOLDOWN
  ){

    console.log(
      "Duplicate QR ignored:",
      bib
    );

    return;

  }


  // Simpan QR terakhir

  lastScannedBib =
    bib;

  lastScanTime =
    now;


  // ======================================
  // LOCK PROCESSING
  // ======================================

  processingQR = true;

  currentBib =
    bib;


  console.log(
    "QR detected:",
    currentBib
  );


  // ======================================
  // STOP CAMERA
  // ======================================

  stopScanner();


  // ======================================
  // CARI PESERTA
  // ======================================

  findParticipant(
    currentBib
  );

}


// ========================================
// STOP SCANNER
// ========================================

function stopScanner(){

  if(
    scanner &&
    scannerRunning
  ){

    scanner
      .stop()

      .then(function(){

        scannerRunning =
          false;

        console.log(
          "Scanner stopped"
        );

      })

      .catch(function(error){

        console.log(
          "Scanner stop:",
          error
        );

        scannerRunning =
          false;

      });

  }

}


// ========================================
// FIND PARTICIPANT
// ========================================

function findParticipant(bib){

  showResult(
    "🔎 Mencari peserta...",
    "success"
  );


  const url =
    API_URL +
    "?action=find" +
    "&bib=" +
    encodeURIComponent(bib);


  fetch(url)

    .then(function(response){

      if(!response.ok){

        throw new Error(
          "HTTP " +
          response.status
        );

      }

      return response.json();

    })

    .then(function(data){

      console.log(
        "Participant:",
        data
      );


      if(data.found){

        showParticipant(
          data
        );

      }

      else{

        currentBib =
          "";

        processingQR =
          false;

        showResult(

          "❌ " +
          (
            data.message ||
            "Peserta tidak dijumpai"
          ),

          "error"

        );


        // Auto reset selepas 2.5 saat

        setTimeout(
          resetScanner,
          2500
        );

      }

    })

    .catch(function(error){

      console.error(
        "API Error:",
        error
      );


      currentBib =
        "";

      processingQR =
        false;


      showResult(

        "❌ Ralat sambungan API",

        "error"

      );

    });

}


// ========================================
// SHOW PARTICIPANT
// ========================================

function showParticipant(data){

  const info =
    document.getElementById(
      "info"
    );


  if(info){

    info.style.display =
      "block";

  }


  setText(
    "nama",
    data.nama
  );


  setText(
    "bib",
    data.bib
  );


  setText(
    "ic",
    data.ic
  );


  setText(
    "saiz",
    data.saiz
  );


  setText(
    "bayaran",
    data.bayaran
  );


  setText(

    "status",

    formatStatus(
      data.checkin,
      data.kit
    )

  );


  // ======================================
  // CHECK STATUS KIT
  // ======================================

  if(
    data.kit ===
    "SUDAH AMBIL"
  ){

    showResult(

      "ℹ️ Peserta sudah ambil kit" +

      "<br><br>" +

      "<b>" +

      escapeHTML(
        data.nama
      ) +

      "</b>" +

      "<br><br>" +

      "<button onclick=\"resetScanner()\">" +

      "📷 SCAN PESERTA SETERUSNYA" +

      "</button>",

      "success"

    );

  }

  else{

    clearResult();

  }

}


// ========================================
// CHECK-IN + KIT
// ========================================

function checkIn(){

  if(!currentBib){

    showResult(

      "❌ Bib Number tidak tersedia",

      "error"

    );

    return;

  }


  if(!processingQR){

    console.log(
      "Check-In dipanggil selepas reset"
    );

    return;

  }


  showResult(

    "⏳ Memproses Check-In + Kit...",

    "success"

  );


  const url =
    API_URL +
    "?action=checkin" +
    "&bib=" +
    encodeURIComponent(
      currentBib
    ) +
    "&crew=" +
    encodeURIComponent(
      currentCrew
    ) +
    "&kaunter=" +
    encodeURIComponent(
      currentKaunter
    );


  fetch(url)

    .then(function(response){

      if(!response.ok){

        throw new Error(
          "HTTP " +
          response.status
        );

      }

      return response.json();

    })

    .then(function(data){

      console.log(
        "Check-In result:",
        data
      );


      handleCheckInResult(
        data
      );

    })

    .catch(function(error){

      console.error(
        "Check-In API Error:",
        error
      );


      processingQR =
        false;


      showResult(

        "❌ Ralat sambungan API",

        "error"

      );

    });

}


// ========================================
// PROCESS CHECK-IN RESULT
// ========================================

function handleCheckInResult(
  data
){

  // ======================================
  // SUCCESS
  // ======================================

  if(
    data.status ===
    "SUCCESS"
  ){

    showResult(

      "✅ " +

      (
        data.message ||
        "CHECK-IN & AMBIL KIT BERJAYA"
      ) +

      "<br><br>" +

      "<button onclick=\"resetScanner()\">" +

      "📷 SCAN PESERTA SETERUSNYA" +

      "</button>",

      "success"

    );


    updateStatus(
      "HADIR / SUDAH AMBIL"
    );


    return;

  }


  // ======================================
  // KIT SUDAH DIAMBIL
  // ======================================

  if(
    data.status ===
    "KIT_DONE"
  ){

    showResult(

      "ℹ️ " +

      (
        data.message ||
        "Peserta sudah ambil kit"
      ) +

      "<br><br>" +

      "<b>" +

      escapeHTML(
        data.nama || ""
      ) +

      "</b>" +

      "<br><br>" +

      "<button onclick=\"resetScanner()\">" +

      "📷 SCAN PESERTA SETERUSNYA" +

      "</button>",

      "success"

    );


    updateStatus(
      "HADIR / SUDAH AMBIL"
    );


    return;

  }


  // ======================================
  // ERROR
  // ======================================

  showResult(

    "❌ " +

    (
      data.message ||
      "Proses tidak berjaya"
    ) +

    "<br><br>" +

    "<button onclick=\"resetScanner()\">" +

    "📷 CUBA SCAN SEMULA" +

    "</button>",

    "error"

  );


  processingQR =
    false;

}


// ========================================
// RESET SCANNER
// ========================================

function resetScanner(){

  console.log(
    "Reset scanner..."
  );


  // ======================================
  // RESET GLOBAL
  // ======================================

  currentBib =
    "";

  processingQR =
    false;


  // ======================================
  // HIDE PARTICIPANT INFO
  // ======================================

  const info =
    document.getElementById(
      "info"
    );


  if(info){

    info.style.display =
      "none";

  }


  // ======================================
  // CLEAR PARTICIPANT DATA
  // ======================================

  setText(
    "nama",
    ""
  );

  setText(
    "bib",
    ""
  );

  setText(
    "ic",
    ""
  );

  setText(
    "saiz",
    ""
  );

  setText(
    "bayaran",
    ""
  );

  setText(
    "status",
    ""
  );


  // ======================================
  // CLEAR RESULT
  // ======================================

  clearResult();


  // ======================================
  // RESTART CAMERA
  // ======================================

  setTimeout(

    function(){

      startScanner();

    },

    300

  );

}


// ========================================
// UPDATE STATUS
// ========================================

function updateStatus(
  status
){

  setText(
    "status",
    status
  );

}


// ========================================
// FORMAT STATUS
// ========================================

function formatStatus(
  checkin,
  kit
){

  if(
    checkin ===
      "HADIR" &&
    kit ===
      "SUDAH AMBIL"
  ){

    return "HADIR / SUDAH AMBIL";

  }


  if(
    checkin ===
    "HADIR"
  ){

    return "HADIR";

  }


  if(
    kit ===
    "SUDAH AMBIL"
  ){

    return "SUDAH AMBIL";

  }


  return "BELUM CHECK-IN";

}


// ========================================
// RESULT MESSAGE
// ========================================

function showResult(
  message,
  type
){

  const result =
    document.getElementById(
      "result"
    );


  if(!result){

    return;

  }


  result.innerHTML =
    message;


  result.className =
    type || "";

}


// ========================================
// CLEAR RESULT
// ========================================

function clearResult(){

  const result =
    document.getElementById(
      "result"
    );


  if(result){

    result.innerHTML =
      "";

    result.className =
      "";

  }

}


// ========================================
// SET TEXT
// ========================================

function setText(
  id,
  value
){

  const element =
    document.getElementById(
      id
    );


  if(element){

    element.textContent =
      value || "";

  }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
  value
){

  if(
    value === null ||
    value === undefined
  ){

    return "";

  }


  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}
