// !! PWA's require the service-worker.js file to be loacted in root !!

// If required, delay service worker initial registration until
// after the first page has loaded with the following:

//if ('serviceWorker' in navigator) {
//  window.addEventListener('load', function () {
//    navigator.serviceWorker.register('/service-worker.js');
//  });
//}

// Debug version of service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(function () {
    console.log("Service Worker Registered");
  });
}

function calcFlightTimes() {
  // Credit:
  // Starting point for this function was https://jsfiddle.net/d6ykv368/135/
  var start;
  var stop;
  var total;
  var decTotal;
  var decMinutes;
  var minutes;
  var hours;

  var table = document.getElementById("flight-times");

  for (var i = 0, row; row = table.rows[i]; i++) {

    if (row.className === "data-row") {
      for (var j = 0, col; col = row.cells[j]; j++) {
        var input = col.firstElementChild;

        // switch on column number (iso class name in original)
        switch (j) {

          case 0:
            if (input.value) {
              // Inspired by the following MS Excel digits to time equation:
              // =ROUNDDOWN(INPUT,-2)/2400 + MOD(INPUT,100)/1440
              hours = roundDown(input.value, -2) / 2400;
              minutes = (input.value % 100) / 1440;
              // alert(input.value); // debug only
              start = (hours + minutes);
              // if start is null or 0000 or 0, this hack gets the job done due
              // to the case 2 (start > stop) {start = (start - 1); ... } below
              // No doubt there's a better solution, but it works.
              if (start == 0) {
                start = 1;
              }
            }
            break;

          case 1:
            if (input.value) {
              hours = roundDown(input.value, -2) / 2400;
              minutes = (input.value % 100) / 1440;
              // alert(input.value); // debug only
              stop = (hours + minutes);

            }
            break;

          case 2:
            if (start && stop) {

              // eg: late start, early finish
              if (start > stop) {
                start = (start - 1);
              }

              // without rounding to 14dp, start @ 0123, finish @ 1323 results in "11:60 ~ 12.0"
              // This is due to well documented unavoidable issue with floats, which Excel deals with by rounding to 15dp. Lets do the same, except we lost a digit somewhere above, so 14 it is...
              total = round((stop - start) * 24, 14);
              //alert(total); // debug only
              // decimal hours

              // values for hh:mm format
              hours = roundDown(total, 0);
              minutes = round((total % 1) * 60, 0);

              // value for decimal hours
              decMinutes = round(minutes / 60, 1);
              decTotal = (hours + decMinutes).toFixed(1);

              col.firstElementChild.innerHTML = hours.toString() + ":" + ((minutes.toString().length < 2) ? "0" + minutes.toString() : minutes.toString()) + " ~ " + decTotal;

              // reset start and stop values incase only one row is used
              // this prevents the start, stop values being used reused on the other, unfllled row
              start = null;
              stop = null;
            }
            break;
        }
      }
    }
  }
}

function formChanged() {
  var fuelStart = document.getElementsByName("fuelStart")[0].value;
  var fuelEnd = document.getElementsByName("fuelEnd")[0].value;
  var fBurn = fuelStart - fuelEnd;
  document.getElementById("fuelBurn").innerHTML = fBurn.toString() + " lb";
  document.getElementById("litres").innerHTML = (round(fBurn / 1.76)).toString() + "&nbsp&nbsplitres";
  document.getElementById("galUS").innerHTML = (round(fBurn / 6.7)).toString() + " gal US";
}

//  Conversion factors From PPRUNE:
//            US Gal x 3.785 x sg = Kgs
//            Imp Gal x 4.546 x sg = Kgs
//            Litres x sg = Kgs
//            Kgs x 2.2046 = Lbs
//            Kgs ÷ 3.785 ÷ sg = US Gal
//            Kgs ÷ 4.546 ÷ sg = Imp Gal
//            Kgs ÷ sg = Litres
//            Lbs ÷ 2.2046 = Kgs

//Conversion Factors from a BP conversion chart available here:
// http://www.bp.com.au/products/aviation/news/BPJETA1.PDF
//            Jet A1 @ sg = 0.80 Lbs / 6.7 = US Gal
//            Jet A1 @ sg = 0.80 Lbs / 1.76 = litres 

function flightTimesReset() {
  document.getElementById("form1").reset();
  document.getElementById("totalBlockTime").innerHTML = "";
  document.getElementById("totalFlightTime").innerHTML = "";
}

function fuelCalcReset() {
  document.getElementById("form2").reset();
  document.getElementById("fuelBurn").innerHTML = "";
  document.getElementById("litres").innerHTML = "";
  document.getElementById("galUS").innerHTML = "";
}

function roundDown(number, decimals) {
  // Credit:
  // https://stackoverflow.com/questions/43703187/how-do-i-round-a-number-in-js-with-negative-precision-like-in-excel-round-functi ~ Credit: Sreekumar P
  decimals = decimals || 0;
  return (Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals));
}

function round(value, precision) {
  // Credit:
  // https://stackoverflow.com/questions/7342957/how-do-you-round-to-1-decimal-place-in-javascript
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}
