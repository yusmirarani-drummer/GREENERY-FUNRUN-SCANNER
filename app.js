/*****************************************
 GREENERY FUN RUN
 NETLIFY QR SCANNER
 APP.JS
*****************************************/


// ========================================
// NETLIFY API
// ========================================

const API_URL = "/.netlify/functions/api";


// ========================================
// GLOBAL VARIABLES
// ========================================

let currentBib = "";
let currentCrew = "Crew A";
let currentKaunter = "Kaunter 1";

let scanner = null;
let scannerRunning = false;


// ========================================
// INITIALIZE SCANNER
// ========================================

document.addEventListener("DOMContentLoaded", function(){

  console.log("GREENERY FUN RUN Scanner loading...");

  startScanner();

});


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


  // Bersihkan reader dahulu

  reader.innerHTML = "";


  scanner =
    new Html5Qrcode("reader");


  scanner.start(

    {
      facingMode: "environment"
    },

    {
      fps: 10,

      qrbox: {
        width: 250,
        height: 250
      }
    },

    function(decodedText){

      handleQR(decodedText);

    },

    function(errorMessage){

      // Jangan paparkan error scanner
      // kerana callback ini dipanggil
      // berkali-kali semasa scanning.

    }

  )

  .then(function(){

    scannerRunning = true;

    console.log(
      "Camera scanner started"
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
// QR SCAN SUCCESS
// ========================================

function handleQR(text){

  if(!text){

    return;

  }


  // Elakkan QR yang sama diproses
  // berkali-kali

  if(currentBib){

    return;

  }


  currentBib =
    String(text).trim();


  console.log(
    "QR detected:",
    currentBib
  );


  // Hentikan scanner

  stopScanner();


  // Cari peserta

  findParticipant(currentBib);

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

        scannerRunning = false;

      })

      .catch(function(error){

        console.log(
          "Scanner stop:",
          error
        );

        scannerRunning = false;

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

        showParticipant(data);

      }

      else{

        currentBib = "";

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


      currentBib = "";


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

  document.getElementById("info")
    .style.display = "block";


  document.getElementById("nama")
    .innerHTML =
      escapeHTML(data.nama);


  document.getElementById("bib")
    .innerHTML =
      escapeHTML(data.bib);


  document.getElementById("ic")
    .innerHTML =
      escapeHTML(data.ic);


  document.getElementById("saiz")
    .innerHTML =
      escapeHTML(data.saiz);


  document.getElementById("bayaran")
    .innerHTML =
      escapeHTML(data.bayaran);


  document.getElementById("status")
    .innerHTML =
      formatStatus(
        data.checkin,
        data.kit
      );


  clearResult();

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


  showResult(
    "⏳ Memproses Check-In + Kit...",
    "success"
  );


  const url =
    API_URL +
    "?action=checkin" +
    "&bib=" +
    encodeURIComponent(currentBib) +
    "&crew=" +
    encodeURIComponent(currentCrew);


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


      handleCheckInResult(data);

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

function handleCheckInResult(data){

  if(
    data.status === "SUCCESS"
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


  if(
    data.status === "KIT_DONE"
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

  currentBib = "";


  // Sembunyikan maklumat peserta

  const info =
    document.getElementById("info");


  if(info){

    info.style.display = "none";

  }


  // Kosongkan result

  clearResult();


  // Bersihkan maklumat lama

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


  // Mulakan scanner semula

  startScanner();

}


// ========================================
// UPDATE STATUS
// ========================================

function updateStatus(status){

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

    result.innerHTML = "";

    result.className = "";

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
    document.getElementById(id);


  if(element){

    element.textContent =
      value || "";

  }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value){

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
