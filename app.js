/*****************************************
 GREENERY FUN RUN
 SCANNER APP JS
*****************************************/


const API_URL =
"https://script.google.com/macros/s/AKfycbzNy-33ISGh7qRuPMJ846s58irXVZiZ5nWuzFv-MB2MzomNhMav58L-d86B2mkhe08l/exec";



let currentBib = "";



/*
 START CAMERA
*/

const codeReader =
new ZXing.BrowserQRCodeReader();



codeReader
.getVideoInputDevices()
.then(videoInputDevices => {


    const firstDevice =
    videoInputDevices[0].deviceId;


    codeReader.decodeFromVideoDevice(
        firstDevice,
        "video",
        (result, err)=>{


            if(result){

                let qrText =
                result.text;


                console.log(
                    "QR:",
                    qrText
                );


                processQR(qrText);


            }


        }
    );


})
.catch(err=>{


    document.getElementById("result").innerHTML =
    "Kamera tidak dapat dibuka";


});





/*
 PROSES QR
*/

function processQR(text){


    currentBib=text;


    document.getElementById("result").innerHTML =
    "Mencari peserta...";


    fetch(
        API_URL+
        "?action=find&bib="+
        encodeURIComponent(text)
    )

    .then(response=>response.json())

    .then(data=>{


        if(data.found){


            document.getElementById("card")
            .style.display="block";


            document.getElementById("nama")
            .innerHTML=data.nama;


            document.getElementById("bib")
            .innerHTML=data.bib;


            document.getElementById("saiz")
            .innerHTML=data.saiz;


            document.getElementById("bayaran")
            .innerHTML=data.bayaran;


            document.getElementById("status")
            .innerHTML=
            data.checkin+
            " / "+
            data.kit;


            document.getElementById("result")
            .innerHTML=
            "Peserta ditemui";


        }

        else{


            document.getElementById("result")
            .innerHTML=
            "Peserta tidak dijumpai";


        }



    })


    .catch(error=>{


        console.log(error);


        document.getElementById("result")
        .innerHTML=
        "Ralat sambungan API";


    });


}






/*
 CHECK-IN + AMBIL KIT
*/

function checkIn(){

  document.getElementById("result").innerHTML =
  "⏳ Sedang proses check-in...";

  fetch(
    API_URL +
    "?action=checkin&bib=" +
    encodeURIComponent(currentBib) +
    "&crew=" +
    encodeURIComponent("Crew A")
  )

  .then(response => response.json())

  .then(data => {

    console.log(data);

    if(data.status == "SUCCESS"){

      document.getElementById("result").innerHTML =
      "✅ CHECK-IN & AMBIL KIT BERJAYA<br>" +
      data.nama;

    }

    else if(data.status == "KIT_DONE"){

      document.getElementById("result").innerHTML =
      "ℹ️ " + data.message + "<br>" +
      data.nama;

    }

    else{

      document.getElementById("result").innerHTML =
      "❌ " + data.message;

    }

  })

  .catch(error => {

    console.log(error);

    document.getElementById("result").innerHTML =
    "❌ Ralat sambungan API";

  });

}