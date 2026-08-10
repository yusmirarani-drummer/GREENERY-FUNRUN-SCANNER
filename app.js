/*****************************************
 GREENERY FUN RUN
 NETLIFY QR SCANNER
 APP.JS
*****************************************/


// ========================================
// NETLIFY API
// ========================================

const API_URL =
  "/.netlify/functions/api";


// ========================================
// GLOBAL VARIABLES
// ========================================

let currentBib = "";

let currentCrew =
  "Crew A";

let currentKaunter =
  "Kaunter 1";

let scanner = null;

let scannerRunning =
  false;

let processingQR =
  false;


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  function(){

    console.log(
      "GREENERY FUN RUN Scanner loading..."
    );


    // Dapatkan Crew dan Kaunter
    // daripada dropdown

    const crewSelect =
      document.getElementById(
        "crew"
      );


    const kaunterSelect =
      document.getElementById(
        "kaunter"
      );


    if(crewSelect){

      currentCrew =
        crewSelect.value ||
        "Crew A";


      crewSelect.addEventListener(
        "change",
        function(){

          currentCrew =
            this.value;

          console.log(
            "Crew:",
            currentCrew
          );

        }
      );

    }


    if(kaunterSelect){

      currentKaunter =
        kaunterSelect.value ||
        "Kaunter 1";


      kaunterSelect.addEventListener(
        "change",
        function(){

          currentKaunter =
            this.value;

          console.log(
            "Kaunter:",
            currentKaunter
          );

        }
      );

    }


    startScanner();

  }
);


// ========================================
// START SCANNER
// ========================================

function startScanner(){

  const reader =
    document.getElementById(
      "reader"
    );


  if(!reader){

    console.error(
      "Element #reader tidak dijumpai"
    );

    return;

  }


  // Jangan mulakan scanner
  // jika sedang berjalan

  if(scannerRunning){

    console.log(
      "Scanner sudah berjalan"
    );

    return;

  }


  reader.innerHTML = "";


  scanner =
    new Html5Qrcode(
      "reader"
    );


  scanner.start(

    {
      facingMode:
        "environment"
    },

    {
      fps: 10,

      qrbox: {
        width: 250,
        height: 250
      }

    },

    function(decodedText){

      handleQR(
        decodedText
      );

    },

    function(errorMessage){

      // Abaikan error scanning
      // callback ini dipanggil berkali-kali

    }

  )

  .then(function(){

    scannerRunning =
      true;

    processingQR =
      false;


    console.log(
      "Camera scanner started"
    );

  })

  .catch(function(error){

    scannerRunning =
      false;


    console.error(
      "Camera error:",
      error
    );


    showResult(

      "❌ Kamera tidak dapat digunakan." +
      "<br><br>" +
      "Sila benarkan permission kamera.",

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


  // Jangan proses QR berkali-kali

  if(
    processingQR ||
    currentBib
  ){

    return;

  }


  processingQR =
    true;


  currentBib =
    String(text)
      .trim();


  console.log(
    "QR detected:",
    currentBib
  );


  // Hentikan kamera dahulu

  stopScanner();


  // Cari peserta

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

function findParticipant(
  bib
){

  showResult(
    "🔎 Mencari peserta...",
    "success"
  );


  const url =
    API_URL +
    "?action=find" +
    "&bib=" +
    encodeURIComponent(
      bib
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


      setTimeout(
        resetScanner,
        2500
      );

    });

}


// ========================================
// SHOW PARTICIPANT
// ========================================

function showParticipant(
  data
){

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


  clearResult();

}


// ========================================
// CHECK-IN + AMBIL KIT
// ========================================

function checkIn(){

  if(!currentBib){

    showResult(
      "❌ Bib Number tidak tersedia",
      "error"
    );

    return;

  }


  // Ambil nilai terkini
  // daripada dropdown

  const crewSelect =
    document.getElementById(
      "crew"
    );


  const kaunterSelect =
    document.getElementById(
      "kaunter"
    );


  if(crewSelect){

    currentCrew =
      crewSelect.value ||
      "Crew A";

  }


  if(kaunterSelect){

    currentKaunter =
      kaunterSelect.value ||
      "Kaunter 1";

  }


  showResult(

    "⏳ Memproses " +
    "Check-In + Kit...",

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


  console.log(
    "Check-In URL:",
    url
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

  // ==============================
  // BERJAYA
  // ==============================

  if(
    data.status ===
    "SUCCESS"
  ){

    updateStatus(
      "HADIR / SUDAH AMBIL"
    );


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


    return;

  }


  // ==============================
  // SUDAH AMBIL KIT
  // ==============================

  if(
    data.status ===
    "KIT_DONE"
  ){

    updateStatus(
      "HADIR / SUDAH AMBIL"
    );


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


    return;

  }


  // ==============================
  // ERROR
  // ==============================

  showResult(

    "❌ " +

    (
      data.message ||
      "Proses tidak berjaya"
    ),

    "error"

  );

}


// ========================================
// RESET SCANNER
// ========================================

function resetScanner(){

  console.log(
    "Reset scanner..."
  );


  // ==============================
  // STOP CAMERA JIKA MASIH HIDUP
  // ==============================

  if(
    scanner &&
    scannerRunning
  ){

    scanner
      .stop()

      .then(function(){

        scannerRunning =
          false;

        performReset();

      })

      .catch(function(){

        scannerRunning =
          false;

        performReset();

      });

  }

  else{

    performReset();

  }

}


// ========================================
// PERFORM RESET
// ========================================

function performReset(){

  // ==============================
  // RESET VARIABLES
  // ==============================

  currentBib =
    "";

  processingQR =
    false;


  // ==============================
  // HIDE PARTICIPANT CARD
  // ==============================

  const info =
    document.getElementById(
      "info"
    );


  if(info){

    info.style.display =
      "none";

  }


  // ==============================
  // CLEAR PARTICIPANT DATA
  // ==============================

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


  // ==============================
  // CLEAR MESSAGE
  // ==============================

  clearResult();


  // ==============================
  // START CAMERA AGAIN
  // ==============================

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

    checkin === "HADIR" &&

    kit === "SUDAH AMBIL"

  ){

    return "HADIR / SUDAH AMBIL";

  }


  if(
    checkin === "HADIR"
  ){

    return "HADIR";

  }


  if(
    kit === "SUDAH AMBIL"
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
