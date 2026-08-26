/*****************************************
 GREENERY FUN RUN EMS PRO
 DASHBOARD.JS
 VERSION 2.0
*****************************************/


// ========================================
// GOOGLE APPS SCRIPT API
// ========================================

const DASHBOARD_API_URL =
  "https://script.google.com/macros/s/AKfycbzNy-33ISGh7qRuPMJ846s58irXVZiZ5nWuzFv-MB2MzomNhMav58L-d86B2mkhe08l/exec";


// ========================================
// AUTO REFRESH
// ========================================

const REFRESH_INTERVAL = 10000;


// ========================================
// SYSTEM CONFIGURATION
// ========================================

const IGNORE_CREW = [
  "",
  "Tidak Ditetapkan",
  "Tidak ditetapkan"
];

const IGNORE_KAUNTER = [
  "",
  "Tidak Ditetapkan",
  "Tidak ditetapkan"
];

const TEST_BIBS = [
  "TEST001"
];


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  function(){

    console.log(
      "GREENERY FUN RUN EMS PRO Dashboard loading..."
    );

    loadDashboard();

    setInterval(
      loadDashboard,
      REFRESH_INTERVAL
    );

  }
);


// ========================================
// LOAD DASHBOARD
// ========================================

function loadDashboard(){

  setConnectionStatus(
    "🔄 Updating...",
    "loading"
  );


  const url =
    DASHBOARD_API_URL +
    "?action=dashboard" +
    "&ts=" +
    Date.now();


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
        "Dashboard data:",
        data
      );


      if(
        !data ||
        data.status !== "SUCCESS"
      ){

        throw new Error(
          data &&
          data.message
            ? data.message
            : "Dashboard API error"
        );

      }


      // ==================================
      // SUMMARY
      // ==================================

      updateSummary(
        data.summary
      );


      // ==================================
      // PROGRESS
      // ==================================

      updateProgress(
        data.summary
      );


      // ==================================
      // CREW
      // ==================================

      updateCrewPerformance(
        data.crewPerformance
      );


      // ==================================
      // KAUNTER
      // ==================================

      updateKaunterPerformance(
        data.kaunterPerformance
      );


      // ==================================
      // ACTIVITY
      // ==================================

      updateActivity(
        data.recentActivities
      );


      // ==================================
      // LAST UPDATED
      // ==================================

      setText(
        "lastUpdated",
        data.generatedAt
      );


      // ==================================
      // CONNECTION
      // ==================================

      setConnectionStatus(
        "🟢 LIVE",
        "success"
      );

    })

    .catch(function(error){

      console.error(
        "Dashboard error:",
        error
      );


      setConnectionStatus(
        "🔴 OFFLINE",
        "error"
      );

    });

}


// ========================================
// UPDATE SUMMARY
// ========================================

function updateSummary(
  summary
){

  if(!summary){

    return;

  }


  const total =
    Number(
      summary.totalRegistered
    ) || 0;


  const checkedIn =
    Number(
      summary.checkedIn
    ) || 0;


  const kitCollected =
    Number(
      summary.kitCollected
    ) || 0;


  const notArrived =
    Number(
      summary.notArrived
    ) || 0;


  setText(
    "totalRegistered",
    total
  );


  setText(
    "checkedIn",
    checkedIn
  );


  setText(
    "kitCollected",
    kitCollected
  );


  setText(
    "notArrived",
    notArrived
  );

}


// ========================================
// UPDATE PROGRESS
// ========================================

function updateProgress(
  summary
){

  if(!summary){

    return;

  }


  const total =
    Number(
      summary.totalRegistered
    ) || 0;


  const checkedIn =
    Number(
      summary.checkedIn
    ) || 0;


  let percentage = 0;


  if(total > 0){

    percentage =
      Math.round(
        (
          checkedIn /
          total
        ) * 100
      );

  }


  setText(
    "progressText",
    percentage + "%"
  );


  const bar =
    document.getElementById(
      "progressBar"
    );


  if(bar){

    bar.style.width =
      percentage + "%";

  }

}


// ========================================
// CLEAN CREW DATA
// ========================================

function cleanCrewData(
  data
){

  if(
    !Array.isArray(data)
  ){

    return [];

  }


  return data.filter(
    function(item){

      if(!item){

        return false;

      }


      const crew =
        String(
          item.crew || ""
        ).trim();


      if(
        IGNORE_CREW
          .map(
            function(x){
              return x.toLowerCase();
            }
          )
          .includes(
            crew.toLowerCase()
          )
      ){

        return false;

      }


      return true;

    }
  );

}


// ========================================
// CLEAN KAUNTER DATA
// ========================================

function cleanKaunterData(
  data
){

  if(
    !Array.isArray(data)
  ){

    return [];

  }


  return data.filter(
    function(item){

      if(!item){

        return false;

      }


      const kaunter =
        String(
          item.kaunter || ""
        ).trim();


      if(
        IGNORE_KAUNTER
          .map(
            function(x){
              return x.toLowerCase();
            }
          )
          .includes(
            kaunter.toLowerCase()
          )
      ){

        return false;

      }


      return true;

    }
  );

}


// ========================================
// CREW PERFORMANCE
// ========================================

function updateCrewPerformance(
  data
){

  const container =
    document.getElementById(
      "crewPerformance"
    );


  if(!container){

    return;

  }


  container.innerHTML = "";


  const cleanData =
    cleanCrewData(
      data
    );


  if(
    cleanData.length === 0
  ){

    container.innerHTML =

      '<div class="empty">' +

      'Belum ada aktiviti crew.' +

      '</div>';

    return;

  }


  cleanData.forEach(
    function(item){

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "performance-row";


      const crew =
        String(
          item.crew || ""
        );


      const total =
        Number(
          item.total
        ) || 0;


      const success =
        Number(
          item.success
        ) || 0;


      const error =
        Number(
          item.error
        ) || 0;


      row.innerHTML =

        '<div>' +

          '<strong>' +

            escapeHTML(
              crew
            ) +

          '</strong>' +

          '<small>' +

            total +

            ' aktiviti' +

          '</small>' +

        '</div>' +

        '<div class="performance-stats">' +

          '<span class="success-text">' +

            '✓ ' +

            success +

          '</span>' +

          '<span class="error-text">' +

            '✕ ' +

            error +

          '</span>' +

        '</div>';


      container.appendChild(
        row
      );

    }
  );

}


// ========================================
// KAUNTER PERFORMANCE
// ========================================

function updateKaunterPerformance(
  data
){

  const container =
    document.getElementById(
      "kaunterPerformance"
    );


  if(!container){

    return;

  }


  container.innerHTML = "";


  const cleanData =
    cleanKaunterData(
      data
    );


  if(
    cleanData.length === 0
  ){

    container.innerHTML =

      '<div class="empty">' +

      'Belum ada aktiviti kaunter.' +

      '</div>';

    return;

  }


  cleanData.forEach(
    function(item){

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "performance-row";


      const kaunter =
        String(
          item.kaunter || ""
        );


      const total =
        Number(
          item.total
        ) || 0;


      const success =
        Number(
          item.success
        ) || 0;


      const error =
        Number(
          item.error
        ) || 0;


      row.innerHTML =

        '<div>' +

          '<strong>' +

            escapeHTML(
              kaunter
            ) +

          '</strong>' +

          '<small>' +

            total +

            ' aktiviti' +

          '</small>' +

        '</div>' +

        '<div class="performance-stats">' +

          '<span class="success-text">' +

            '✓ ' +

            success +

          '</span>' +

          '<span class="error-text">' +

            '✕ ' +

            error +

          '</span>' +

        '</div>';


      container.appendChild(
        row
      );

    }
  );

}


// ========================================
// CHECK TEST / INVALID ACTIVITY
// ========================================

function isValidActivity(
  item
){

  if(!item){

    return false;

  }


  const bib =
    String(
      item.bib || ""
    )
    .trim()
    .toUpperCase();


  // Abaikan TEST001
  if(
    TEST_BIBS
      .map(
        function(x){
          return x.toUpperCase();
        }
      )
      .includes(bib)
  ){

    return false;

  }


  // Abaikan rekod kosong
  if(
    bib === "" &&
    String(
      item.nama || ""
    ).trim() === ""
  ){

    return false;

  }


  return true;

}


// ========================================
// ACTIVITY TABLE
// ========================================

function updateActivity(
  data
){

  const tbody =
    document.getElementById(
      "activityTable"
    );


  if(!tbody){

    return;

  }


  tbody.innerHTML = "";


  if(
    !Array.isArray(data)
  ){

    data = [];

  }


  // ==================================
  // FILTER DATA
  // ==================================

  const cleanData =
    data.filter(
      isValidActivity
    );


  // ==================================
  // EMPTY
  // ==================================

  if(
    cleanData.length === 0
  ){

    tbody.innerHTML =

      '<tr>' +

        '<td colspan="7">' +

          'Belum ada aktiviti.' +

        '</td>' +

      '</tr>';

    return;

  }


  // ==================================
  // RENDER
  // ==================================

  cleanData.forEach(
    function(item){

      const tr =
        document.createElement(
          "tr"
        );


      const status =
        String(
          item.status || ""
        )
        .trim()
        .toUpperCase();


      let statusClass =
        "status-neutral";


      if(
        status ===
        "SUCCESS"
      ){

        statusClass =
          "status-success";

      }


      else if(
        status ===
        "ERROR"
      ){

        statusClass =
          "status-error";

      }


      tr.innerHTML =

        '<td>' +

          escapeHTML(
            item.timestamp
          ) +

        '</td>' +

        '<td>' +

          '<strong>' +

            escapeHTML(
              item.bib
            ) +

          '</strong>' +

        '</td>' +

        '<td>' +

          escapeHTML(
            item.nama
          ) +

        '</td>' +

        '<td>' +

          escapeHTML(
            item.action
          ) +

        '</td>' +

        '<td>' +

          escapeHTML(
            item.crew
          ) +

        '</td>' +

        '<td>' +

          escapeHTML(
            item.kaunter
          ) +

        '</td>' +

        '<td>' +

          '<span class="' +

          statusClass +

          '">' +

            escapeHTML(
              item.status
            ) +

          '</span>' +

        '</td>';


      tbody.appendChild(
        tr
      );

    }
  );

}


// ========================================
// CONNECTION STATUS
// ========================================

function setConnectionStatus(
  text,
  type
){

  const element =
    document.getElementById(
      "connectionStatus"
    );


  if(!element){

    return;

  }


  element.textContent =
    text;


  element.className =
    "connection-status " +
    type;

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

      value === undefined ||
      value === null

        ? ""

        : value;

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
