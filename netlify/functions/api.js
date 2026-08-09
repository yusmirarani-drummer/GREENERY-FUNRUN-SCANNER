const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzNy-33ISGh7qRuPMJ846s58irXVZiZ5nWuzFv-MB2MzomNhMav58L-d86B2mkhe08l/exec";

exports.handler = async function(event) {

  try {

    const params = event.queryStringParameters || {};

    const action = params.action || "";
    const bib = params.bib || "";
    const crew = params.crew || "Crew A";

    const url =
      APPS_SCRIPT_URL +
      "?action=" +
      encodeURIComponent(action) +
      "&bib=" +
      encodeURIComponent(bib) +
      "&crew=" +
      encodeURIComponent(crew);


    const response = await fetch(url);

    const text = await response.text();


    return {

      statusCode: 200,

      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },

      body: text

    };

  }

  catch(error) {

    return {

      statusCode: 500,

      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },

      body: JSON.stringify({

        status: "ERROR",

        message: error.message

      })

    };

  }

};
