// JavaScript Document

/******* clavier ******/
function clavier() { // handler du bouton outils
  affichClavier = !affichClavier;
  if (affichClavier) {
    $("#outil-clavier").addClass("choisi");
    if (champSaisie.parentElement) { // comme champ saisie est chargé dans qo il existe si on a une qo dans la page (il faut qu'il soit initialisé dans l'affichage page
      afficherClavier(champSaisie.parentElement.id.split("_")[1]);
    }
  } else {
    //$(".ctnClavierClass").css("display" ,"none");
    effacerClavier();
    $("#outil-clavier").removeClass("choisi");
  }
}

function afficherClavier(i) {
  effacerClavier();

  if (tblExo.clavier) {
    for (var car in tblExo.clavier) {
      var newButton = document.createElement("button");
      newButton.innerHTML = tblExo.clavier[car];
      var test = document.querySelector("#ctnClavier_" + i);
      test.appendChild(newButton);
    }

    $("#ctnClavier_" + i + " button").click(function(evt) {
      if (champSaisie.type = "textarea") {
        var selectionFin = champSaisie.selectionStart + 1;
        champSaisie.value = champSaisie.value.substring(0, champSaisie.selectionStart) + evt.target.innerHTML + champSaisie.value.substring(champSaisie.selectionEnd, champSaisie.length);
        // champSaisie.focus();
        champSaisie.setSelectionRange(selectionFin, selectionFin);
        //**pour sauver saisie :
        var q = champSaisie.parentElement.id.split("_")[1]
        tblReponses[pCourante].reps[q] = champSaisie.value;
        //verifAccesCorr();
      }
    });
  }
}

function effacerClavier() {
  // retire tous les enfants d'un élément
  var lesClaviers = document.getElementsByClassName("ctnClavierClass");
  for (var cli = 0; cli < lesClaviers.length; cli++) {
    //var element = document.getElementById("ctnClavier_" + cli);
    var element = lesClaviers[cli];
    if (element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  }
}

function impression() {
  var date = new Date();
  var reg = new RegExp("<.[^>]*>", "gi");
  var reg2 = new RegExp("&nbsp;", "gi");
  var txtEntete = tblExo.titre + " -- " + date.toLocaleString();
  if (scorm) {
    txtEntete = tblExo.titre + " -- " + SCOGetValue("cmi.core.student_name") + " -- " + date.toLocaleString();
  }

  var docDefinition = {
    header: {
      text: txtEntete,
      style: "titre",
      margin: [15, 15, 15, 0]
    },
    content: [{
      //text: tblExo.titre + " -- " + date.toLocaleString(),
      //style: "titre"
    }, ],
    styles: {
      titre: {
        bold: true
      },
      titrePage: {
        bold: true,
        fontSize:12,
          margin: [20, 20, 5, 0]
      },
      maQuestion: {
        italics: true,
        fontSize: 9
      },
      maReponse: {
        margin: [10, 0, 10, 0]
      },
      mesProps: {
        fontSize: 10
      }
    }
  }

  //****
  for (var page = 0; page < tblReponses.length; page++) { // boucle sur page
    var tempT = {text: tblExo.pages[page].titre , style:"titrePage" };
    docDefinition.content.push(tempT);
    for (var question = 0; question < tblReponses[page]["reps"].length; question++) {


      var tempQ = tblExo.pages[page].questions[question].txtQuestion;
      tempQ = tempQ.replace(reg, "");
      tempQ = tempQ.replace(reg2, " ");
      //remettre le code html généré par tinyMCE en caractère :
      tempQ = html_entity_decode(tempQ);
      if (tblExo.pages[page].questions[question].type === "qtrous") {
        var reg3 = /\$(\w*)\$/g;
        tempQ = tempQ.replace(reg3, " ");
        var tblQ = tempQ.split("*");
        for (var i = 0; i < tblQ.length; i++) {
          if ((i % 2) === 0) {
            docDefinition.content.push({
              text: tblQ[i],
              style: "maQuestion"
            });
          } else {
            docDefinition.content.push({
              text: tblReponses[page].reps[question][tblQ[i]],
              style: "maReponse"
            });
          }
        }
      } else { // pour les qo et qcm
        var tempR = tblReponses[page].reps[question];
        docDefinition.content.push({
          text: tempQ,
          style: "maQuestion"
        });
        if (tblExo.pages[page].questions[question].type === "qo") {
          docDefinition.content.push({
            text: tempR,
            style: "maReponse"
          });
        } else { // qcm
          for (var prop = 0; prop < tblExo.pages[page].questions[question].propositions.length; prop++) {
            var propText = "";
            if (tempR.substring(prop, prop + 1) === "1") {
              propText = "X ";
            } else {
              propText = "_ ";
            }
            propText += tblExo.pages[page].questions[question].propositions[prop].texte;
            docDefinition.content.push({
              text: propText,
              style: "mesProps"
            });
          }

        }
      }
      docDefinition.content.push({
        text: "------------------------------------------------",
      fontSize:6
      });
    }
  }
  pdfMake.createPdf(docDefinition).open();
}

function doc() {
  var fiche = 'module/fiche.pdf';
  if (tblExo.stUrl && !scorm) { // si on a un url spécifique dans data ET qu'on 'est pas en scorm
    fiche = tblExo.stUrl.replace(".vtt", ".pdf");
  }
  window.open(fiche);
}
