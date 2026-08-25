/*****************************************
 GREENERY FUN RUN EMS PRO
 DASHBOARD.JS
*****************************************/


// ========================================
// GOOGLE APPS SCRIPT API
// ========================================

const DASHBOARD_API_URL =
  "https://script.google.com/macros/s/AKfycbzNy-33ISGh7qRuPMJ846s58irXVZiZ5nWuzFv-MB2MzomNhMav58L-d86B2mkhe08l/exec";


// ========================================
// AUTO REFRESH
// ========================================

const REFRESH_INTERVAL =
  10000;


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  function(){

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


  fetch(
    DASHBOARD_API_URL +
    "?action=dashboard&ts=" +
    Date.now()
  )

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
      data.status !==
      "SUCCESS"
    ){

      throw new Error(
        data.message ||
        "Dashboard API error"
      );

    }


    updateSummary(
      data.summary
    );


    updateProgress(
      data.summary
    );


    updateCrewPerformance(
      data.crewPerformance
    );


    updateKaunterPerformance(
      data.kaunterPerformance
    );


    updateActivity(
      data.recentActivities
    );


    setText(
      "lastUpdated",
      data.generatedAt
    );


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


  setText(
    "totalRegistered",
    summary.totalRegistered
  );


  setText(
    "checkedIn",
    summary.checkedIn
  );


  setText(
    "kitCollected",
    summary.kitCollected
  );


  setText(
    "notArrived",
    summary.notArrived
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
        (checkedIn / total) *
        100
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


  if(
    !data ||
    data.length === 0
  ){

    container.innerHTML =

      '<div class="empty">' +
      'Belum ada aktiviti crew.' +
      '</div>';

    return;

  }


  data.forEach(
    function(item){

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "performance-row";


      row.innerHTML =

        '<div>' +

          '<strong>' +

            escapeHTML(
              item.crew
            ) +

          '</strong>' +

          '<small>' +

            item.total +
            ' aktiviti' +

          '</small>' +

        '</div>' +

        '<div class="performance-stats">' +

          '<span class="success-text">' +

            '✓ ' +
            item.success +

          '</span>' +

          '<span class="error-text">' +

            '✕ ' +
            item.error +

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


  if(
    !data ||
    data.length === 0
  ){

    container.innerHTML =

      '<div class="empty">' +
      'Belum ada aktiviti kaunter.' +
      '</div>';

    return;

  }


  data.forEach(
    function(item){

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "performance-row";


      row.innerHTML =

        '<div>' +

          '<strong>' +

            escapeHTML(
              item.kaunter
            ) +

          '</strong>' +

          '<small>' +

            item.total +
            ' aktiviti' +

          '</small>' +

        '</div>' +

        '<div class="performance-stats">' +

          '<span class="success-text">' +

            '✓ ' +
            item.success +

          '</span>' +

          '<span class="error-text">' +

            '✕ ' +
            item.error +

          '</span>' +

        '</div>';


      container.appendChild(
        row
      );

    }
  );

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
    !data ||
    data.length === 0
  ){

    tbody.innerHTML =

      '<tr>' +

        '<td colspan="7">' +

          'Belum ada aktiviti.' +

        '</td>' +

      '</tr>';

    return;

  }


  data.forEach(
    function(item){

      const tr =
        document.createElement(
          "tr"
        );


      const status =
        String(
          item.status || ""
        ).toUpperCase();


      let statusClass =
        "status-neutral";


      if(
        status ===
        "SUCCESS"
      ){

        statusClass =
          "status-success";

      }


      if(
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

        '<td><strong>' +

          escapeHTML(
            item.bib
          ) +

        '</strong></td>' +

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