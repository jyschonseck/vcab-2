//*****************
//** variables globales
var lstSujets = {};

var unit = "";
var ministere = "";

//******************
//**** assigne var globales
    $.ajax({
      type: 'GET',
      url: "js/exos.json",
      dataType: 'json',
      success: function(data) {
        if (data) {
          lstSujets = data;
        }
      },
      error: function() {
        alert('Pas de lecture du fichier ');
      }
    });



//*******************************
//*** functions******************

function loadPage(page) {
  console.log("loadPage : " + page);
  if (page === "") {
    page = "accueil";
  }
  var pageT = page.split("_");
  if (pageT.length > 1) {
    page = pageT[0];
  }

  $('main').load("html/" + page + ".html", function(){
        //** pour info
        console.log("load infos");
        $("#zoneInfo").load("html/infos.html");
  });

}

function btnSujetClckHdlr(e) {
  console.log("clic sujet : " + e.currentTarget.id);
  window.location.hash = "bureau_" + e.currentTarget.id.split("_")[1] + "_" + e.currentTarget.id.split("_")[2];
}
