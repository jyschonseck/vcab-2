// JavaScript Document
//**********************//
//**variable globales***//
var tblExo = {}; // le tableau contenant TOUTES les données de l'exo (ouverture directe du fichier .json)

var tblReponses = []; //le tableau contenant les réponses (a charger depuis scorm et/ou LS ?) pour le moment je n'utilise pas tblQuestions.reponses (c'est trop chiant)
var dejaRepondu = false;
var tblQuestions = []; //le tableau d'objet question... appelé à remplacer tblExo
var posRedim = 50; // ratio en pourcentage entre colonne gauche et droite
var qCourante = 0; //
var pCourante = 0; // page de question à afficher
var champSaisie = {}; // le champ de saisie utilisé par fonction clavier
var lancement = true;
var modeAuteur = false;
var scorm = false; //valeur à true si on a du scorm : utilisé dans enregistrementReponses
var affichClavier = false; // variable pour affichage du clavier
var scoreMax = 0; // le score max qu'on peut atteindre !
var monScore = 0; //  score global car calculé/utilisé par majScore et utilisé par enregistreRep
var nbRep = 0; // nb de reponse pour AE calculée/utilise par majAE et utilisé par enregistreRep
var monAE = 0; // note d'AE calculée/utilise par majAE et utilisé par enregistreRep

//**constante***********//
// si je déclare const si je lance plusieur fois lglg j'ai une erreur 'déja déclaré'
var IF_VALID = "Valider";
var AEValeurMax = 2; // Valeur max  pour l'AE (le 0 =pas repondu)

//***** pour debug ******//
var tempsDebut = new Date();

//**********************//
//** fonctions**********//

function shadeColor(color, percent) {
  'use strict';
  var f = parseInt(color.slice(1), 16),
    t = percent < 0 ? 0 : 255,
    p = percent < 0 ? percent * -1 : percent,
    //R = f >> 16,
    R = f >> 16,
    G = f >> 8 & 0x00FF,
    B = f & 0x0000FF;
  return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

// fonction qui crée une CSS customisée avec la couleur du back office
function useCustomColor(pColor) {
  'use strict';
  var newStyle = "#txtTitre { color: " + pColor + " !important;} \n"; //.txtCorrection
  newStyle += "#ctnTitres, #ctnOnglets, #ctnInfosResult,  textarea:focus, .ctnQuestion { border-color: " + pColor + " !important;} \n";
  newStyle += "#ctnOnglets > button.actif { background:" + shadeColor(pColor, 0.5) + " !important; border-color: " + shadeColor(pColor, 0.5) + " !important;}\n";
  newStyle += "#ctnOnglets > button.choisi { background: " + pColor + " !important; border-color: " + pColor + " !important;}\n";
  newStyle += ".navigActif:hover .st0 { fill: " + pColor + " !important;}";
  $('<style type="text/css"></style>')
    .html(newStyle)
    .appendTo("head");
}

function affichPage() {
  'use strict';

  /****vidage ctnQuestions****/
  while (ctnPageQ.firstChild) {
    ctnPageQ.removeChild(ctnPageQ.firstChild);
  }
  champSaisie = {}; //réinitialiser le dernier champ de qo cliqué

  //**ajput Titre page**/
  var titre = document.createElement("div");
  titre.className = "txtTitrePage";
  titre.innerHTML = tblExo.pages[pCourante].titre;
  ctnPageQ.appendChild(titre);
  //$("#txtTitrePage").html(tblExo.pages[ pCourante].titre);

  var ctnQ = document.createElement("div");
  ctnQ.id = "ctnQuestions";

  ctnPageQ.appendChild(ctnQ);

  // affich le n° de page
  $("#txtPCourante").html(pCourante + 1);

  for (var i = 0; i < tblExo.pages[pCourante].questions.length; i++) {
    var nouvQuestion = document.createElement("div");
    nouvQuestion.className = "ctnQuestion";
    nouvQuestion.id = "ctnQuestion_" + i;
    ctnQ.appendChild(nouvQuestion);
    tblQuestions[pCourante][i].affich(i); //
  }

  ///***** gestion des onglets
  if (tblReponses[pCourante].valid && tblExo.scenario.verrCorr === "1") { //Déja validé ET verrouille -> on passe à 3 sans ouvrir 2
    $("#nav_3").addClass("actif");
    $("#nav_3").addClass("choisi");
    $("#nav_2").removeClass("actif");
    $("#nav_2").removeClass("choisi");
    // validation(); //pour afficher les fb correctement
  } else if (tblReponses[pCourante].valid) { //Déja validé et donc sans verrouille
    $("#nav_3").addClass("actif");
    $("#nav_2").addClass("actif");
  } else { //sinon on revient à 2
    $("#nav_2").addClass("actif"); // donc
    if (!$("#nav_1").hasClass("choisi")) {
      ongletsAffich(2); //on revient sur onglet2 (cas ou  on a pas encore validé
      edition(); // on déverouille le champ et on masque corre
      verifAccesCorr(); // voir si on active l'onglet 3 à correction
    }
  }
  if ($("#nav_3").hasClass("choisi")) {
    validation();
  }

  verifAccesCorr();

  //***** remis cette fonction ici pour avoir le redim au chargement  de la page si on est dans une iframe ..
  //** // TODO: si on a pas d'effet secondaire ...
  redimCtnQuestions();
}

function verifAccesCorr() {
  "use strict";
  var accesCor = true;
  var debug_tblReponses = tblReponses;
  for (var i = 0; i < tblExo.pages[pCourante].questions.length; i++) {
    if (tblExo.pages[pCourante].questions[i].type == "qo") {
      if (tblReponses[pCourante]["reps"][i].length < tblExo.scenario.qoAccesC) {
        accesCor = false;
      }
    } else if (tblExo.pages[pCourante].questions[i].type == "qtrous") {
      for (var j in tblReponses[pCourante].reps[i]) {
        if (tblReponses[pCourante].reps[i][j].length < 1) {
          accesCor = false;
        }
      }
    } else if (tblExo.pages[pCourante].questions[i].type == "qcm") {
      if (tblReponses[pCourante].reps[i].length === 0) {
        accesCor = false;
      }
    }
  }
  if (accesCor) {
    $("#nav_3").addClass("actif");
  } else {
    $("#nav_3").removeClass("actif");
  }
  //enregistreRep(); // pas forcement ici (lent avec calcul de car ...)
}

function enregistreRep() {
  "use strict";
  //on enregistre sur
  //- sur qo change
  //-des tourner de pages
  // c'etait trop gourmand de le faire suite au verifAccessCorr qui declenche sur le onchange

  /******* calcul score.raw******/
  var pourScoreRaw = 0;
  var nbQ = 0;

  if (tblExo.scenario.evalType === "AE") {
    //*** moyenne des AE
    pourScoreRaw = parseInt((monAE / nbRep) * 50);
  } else if (tblExo.scenario.evalType === "N") {
    /*******  calcul du % de reponses saisies ****/
    var nbRepSaisies = 0;
    for (var indP2 = 0; indP2 < tblReponses.length; indP2++) {
      for (var indQ2 = 0; indQ2 < tblReponses[indP2].reps.length; indQ2++) {
        if (tblExo.pages[indP2].questions[indQ2].type === "qo") {
          if (tblReponses[indP2].reps[indQ2].length > tblExo.scenario.qoAccesC) {
            nbRepSaisies++;
          }
          nbQ += 1;
        }
      }
    }
    pourScoreRaw = parseInt((nbRepSaisies / nbQ) * 100);
  } else if (tblExo.scenario.evalType === "S") {
    pourScoreRaw = parseInt((monScore / scoreMax) * 100);
  }

  //enregistrer reponses dans suspend_data (si scorm) ou localStorage
  if (scorm) {
    SCOSetValue("cmi.suspend_data", JSON.stringify(tblReponses));
    SCOCommit();
    SCOSetValue("cmi.core.score.raw", pourScoreRaw);
    SCOCommit();
    //**** enregistre dans les cmi.interaction pour avoir tableau des reponses
    var compteur = 0;
    for (var i = 0; i < tblReponses.length; i++) {
      for (var j = 0; j < tblReponses[i].reps.length; j++) {
        var pourId = "Page-" + (i + 1) + "_q-" + (j + 1);
        SCOSetValue("cmi.interactions." + compteur + ".id", pourId);
        SCOSetValue("cmi.interactions." + compteur + ".student_response", tblReponses[i].reps[j]);
        compteur++;
      }
    }

    //**************
  } else {
    if (tblExo.moduleId != null) {
      localStorage.setItem(tblExo.moduleId, JSON.stringify(tblReponses));
    }
  }
}

function validation() { // valide la page
  "use strict";
  tblReponses[pCourante].valid = true;
  for (var i = 0; i < tblQuestions[pCourante].length; i++) {
    tblQuestions[pCourante][i].corr(i);
  }
}

function edition() { //remettre en mode edition (?)
  "use strict";
  $(".feedback").hide("slow");
  // QO :
  $(".QOReponse").attr('disabled', false);
  // QCM :
  $("input[type='checkbox']").attr('disabled', false);
  $("input[type='checkbox']").removeClass("QCMCocheInactif");
  $("input[type='checkbox']").removeClass("QCMCocheBon");
  $("input[type='checkbox']").removeClass("QCMCocheFaux");
  // QTrous :
  qTrousEdition();
  //****
  $("#nav_2").addClass("actif");
}

function lireExtraitVid(e) {
  'use strict';
  //sur le createElement/onclick on ne sait pas mettre de paramètre so j'utilise l'id pour passer si correction/question, ST ,
  var params = e.currentTarget.id.split("_");
  var extrait;
  if (params[1] === "c") {
    extrait = "extraitCorrection";
  } else {
    extrait = "extraitQuestion";
  }
  var deb = tblExo.pages[pCourante].questions[params[2]][extrait].debut;
  var fin = tblExo.pages[pCourante].questions[params[2]][extrait].fin;

  if ((params[3] === "vo") != (maVideoSousTitreActif())) {
    sousTitrage(true);
    // mettre écouteur en once sur clic pour virer ST
    var temp = setTimeout(function() {
      window.addEventListener("click", function() {
        sousTitrage(false);
        maVideoPause();
      }, {
        capture: true,
        once: true
      });
    }, 2);
  }

  maVideoSeek(deb);
  maVideoPlay();

  var timer = setInterval(function() {
    if (maVideoCurrentTime() > fin) {
      maVideoPause();
      clearInterval(timer);
      sousTitrage(false);
    }
  }, 100);
}


///******changer le svg de couleur*******/
//(source : http://xn--dahlstrm-t4a.net/svg/html/get-embedded-svg-document-script.html )
function getSubDocument(embedding_element) {
  "use strict";
  if (embedding_element.contentDocument) {
    return embedding_element.contentDocument;
  } else {
    var subdoc = null;
  }
}

function svgChangeColor() {
  'use strict';
  //changement de couleur :
  if (tblExo.interface) {
    var elms = document.querySelectorAll(".svgInterface");
    var boutonApeindre = elms.length;
    var subdocTrouve = 0;
    for (var i = 0; i < elms.length; i++) {
      var subdoc = getSubDocument(elms[i]);
      if (subdoc) {
        var subElt = subdoc.getElementsByClassName("eltColor1");
        if (subElt.length > 0) {
          subdocTrouve += 1;
        }
        for (var j = 0; j < subElt.length; j++) {
          subElt[j].setAttribute("fill", tblExo.interface.couleur1);
        }
      }
    }
  }
}
///*****************************/

function redimCtnQuestions() {
  'use strict';
  ///*******le redimensionnement en hauteur : objet : faire le scroll sur la partie question seulement ...
  if (document.getElementById("ctnQuestions")) { // éviter erreur quand on redim sur onglets!="previsualisation" dans l'
    var temp0 = parseInt($('html').css("height"));
    var temp1 = parseInt($("#ctnOnglets").css("height")) +  parseInt($("#ctnOnglets").css("margin-bottom"));
    var temp2 = 48; //parseInt($("#ctnNavigation").css("height"));
    var temp = temp0 - temp1 - temp2;
    $("#ctnPageQ").css("max-height", temp);
  }

  //test si le lglg est dans une iFrame avec le script de redimensionnement...
  //   try {
  //     window.top.window.lglgHauteur();
  //   } catch (err) {
  // console.log("au redim n'a pas trouve lglgHauteur ");
  //   }

}

//*****************************
function tblReponsesInit() {
  'use strict';
  for (var pageId = 0; pageId < tblExo.pages.length; pageId++) {
    tblReponses[pageId] = {};
    tblReponses[pageId].valid = false;
    tblReponses[pageId].reps = [];
    tblReponses[pageId].AE = [];
    tblReponses[pageId].score = [];
    for (var questionId = 0; questionId < tblExo.pages[pageId].questions.length; questionId++) {
      tblReponses[pageId].AE[questionId] = -1;
      tblReponses[pageId].score[questionId] = 0;
      if (tblExo.pages[pageId].questions[questionId].type === "qo") {
        tblReponses[pageId].reps[questionId] = "";
      } else if (tblExo.pages[pageId].questions[questionId].type === "qtrous") {
        tblReponses[pageId].reps[questionId] = [];
        //for (var i = 0; i < tblExo.pages[pageId].questions[questionId].txtQuestion.split(":SHORTANSWER:").length - 1; i++) {
        var toto = new Object();
        for (var i in tblExo.pages[pageId].questions[questionId].trous) {
          var monI = parseInt(i.substring(0, 4));
          toto[i] = "";
        }
        tblReponses[pageId].reps[questionId] = toto;
      } else if (tblExo.pages[pageId].questions[questionId].type === "qcm") {
        tblReponses[pageId].reps[questionId] = "";
      } else if (tblExo.pages[pageId].questions[questionId].type === "qdd") {
        tblReponses[pageId].reps[questionId] = [];
        tblReponses[pageId].reps[questionId] = {};
        for (var i = 0; i < tblExo.pages[pageId].questions[questionId].propositions.length; i++) {
          var temp64 = tblExo.pages[pageId].questions[questionId].propositions[i].id;
          tblReponses[pageId].reps[questionId][temp64] = "";
        }
      }
    }
  }

  /* si on a lglgScorm dans sessionStorage on le charge et on l'efface...
  Sinon on regarde si on a du moduleId dans localStorage*/
  if (sessionStorage.scorm) {
    scorm = true; // pour enregistrement
    sessionStorage.removeItem("scorm");
    //on charge suspend_data dans tblReponse:
    if (SCOGetValue("cmi.suspend_data")) {
      tblReponses = jQuery.parseJSON(SCOGetValue("cmi.suspend_data"));
    }
  } else if (tblExo.moduleId && localStorage.getItem(tblExo.moduleId)) {
    tblReponses = jQuery.parseJSON(localStorage.getItem(tblExo.moduleId));
  }

  for (var i = 0; i < tblReponses.length; i++) {
    for (var j = 0; j < tblReponses[i].reps.length; j++) {
      if (tblReponses[i].reps[j].length > 0) {
        dejaRepondu = true;
      }
    }
  }
}

function tblQuestionsInit() {
  // ****mettre les questions de tblExo dans tblQuestions en format objet :
  for (var p = 0; p < tblExo.pages.length; p++) {
    tblQuestions[p] = [];
    for (var q = 0; q < tblExo.pages[p].questions.length; q++) {
      if (tblExo.pages[p].questions[q].type === "qo") {
        tblQuestions[p].push(Object.create(proto_qo));
      } else if (tblExo.pages[p].questions[q].type === "qcm") {
        tblQuestions[p][q] = Object.create(proto_qcm);
      } else if (tblExo.pages[p].questions[q].type === "qtrous") {
        tblQuestions[p][q] = Object.create(proto_qtrous);
      } else if (tblExo.pages[p].questions[q].type === "qdd") {
        tblQuestions[p][q] = Object.create(proto_qdd);
      }

      tblQuestions[p][q].donnees = tblExo.pages[p].questions[q];
      //******* pour les reponses AE et score je reste pour le moment sur la varible tableau globale
      // tblQuestions[p][q].reponses = tblReponses[p].reps[q];
      // tblQuestions[p][q].ae = tblReponses[p].AE[q];
      // tblQuestions[p][q].score_ = tblReponses[p].score[q];
    }
  }
}


function nettoieChaine(entree) { //pour nettoyer nom des fichier à enregistrer (scorm surtout)
  "use strict";
  var regExp1 = /\W/g;
  var sortie;
  sortie = entree.replace(regExp1, "");
  return sortie.substr(0, 15);
}


function afficheExo() {
  'use strict';
  if (tblExo.interface.couleur1) {
    useCustomColor(tblExo.interface.couleur1);
  }
  if (tblExo.interface.nav1) {
    document.getElementById('nav_1').innerHTML = tblExo.interface.nav1;
  }
  if (tblExo.interface.nav2) {
    document.getElementById('nav_2').innerHTML = tblExo.interface.nav2;
  }
  if (tblExo.interface.nav3) {
    document.getElementById('nav_3').innerHTML = tblExo.interface.nav3;
    if (tblExo.interface.nav3 === "_") {
      document.getElementById('nav_3').classList.add("offScreen");
    }
  }

  if (tblExo.interface.logoaffich) {
    $("#logo").css("display", "block");
    if (tblExo.interface.logourl.length < 1) {
      document.getElementById("logo").src = "lglg/lglg_interface/logo/UL-NOIR-WEB-h120.png";
      document.getElementById("logo").title = "DIp - Université de Lille";
      document.getElementById("lienLogo").href = "http://klip.univ-lille.fr/";
    } else {
      document.getElementById("logo").src = tblExo.interface.logourl;
      document.getElementById("logo").title = tblExo.interface.logotitle;
      document.getElementById("lienLogo").href = tblExo.interface.logolien;
    }
  }

  //****element de base
  $("#txtTitre").html(tblExo.titre);
  $("#txtSousTitre").html(tblExo.sousTitre);

  //*** media
  if (tblExo.videoType === "0" || !tblExo.videoType) { // si on
    $("#ctnMedia").load("lglg/lglg_medias/html5.html");
  } else if (tblExo.videoType === "1") { //
    $("#ctnMedia").load("lglg/lglg_medias/html5.html");
  } else if (tblExo.videoType === "2") {
    $("#ctnMedia").load("lglg/lglg_medias/youtube.html");
  }

  //*** outils
  var ctnOutils = document.querySelector("#ctnOutils");
  for (var i = 0; i < 4; i++) {
    // si on a une fonction pour l'outil
    if (tblExo.btnOutil.liste[i].fonction !== "--") {
      // code HTML du bouton
      var btCode = '<a href="#" id="outil-' + tblExo.btnOutil.liste[i].fonction + '" title="' + tblExo.btnOutil.liste[i].etiquette + '"><img src="lglg/lglg_interface/images/outils/' + tblExo.btnOutil.liste[i].fonction + '.svg" alt="' + tblExo.btnOutil.liste[i].etiquette + '">'; //" width="100" height="100"
      if (tblExo.btnOutil.format != 1) { //on ajoute le titre sous le bouton
        btCode += '<span>' + tblExo.btnOutil.liste[i].etiquette + '</span>';
      }
      btCode += '</a>';
      // ajoute le bouton au conteneur d'outils
      $(btCode).appendTo(ctnOutils);
      // fonction du bouton au clic
      $('#outil-' + tblExo.btnOutil.liste[i].fonction).click(function(e) {
        e.preventDefault();
        window[this.id.substring(6)]();
      });
    }
  }

  /******************
   **ffichage evaluation***/

  if (tblExo.scenario.evalType === "S") {
    //*****score total
    scoreMax = 0;
    for (var iPage = 0; iPage < tblExo.pages.length; iPage++) {
      for (var iQ = 0; iQ < tblExo.pages[iPage].questions.length; iQ++) {
        if (tblExo.pages[iPage].questions[iQ].scoreActif) {
          var tScore = 0;
          if (tblExo.pages[iPage].questions[iQ].type === "qcm" || tblExo.pages[iPage].questions[iQ].type === "qdd") {
            for (var iProp = 0; iProp < tblExo.pages[iPage].questions[iQ].propositions.length; iProp++) {
              var tScore = parseInt(tblExo.pages[iPage].questions[iQ].propositions[iProp].score);
              if (tScore > 0) {
                scoreMax += tScore;
              }
            }
          } else if (tblExo.pages[iPage].questions[iQ].type === "qtrous") {
            for (var t in tblExo.pages[iPage].questions[iQ].trous) { //boucle sur les trous
              for (var p = 0; p < tblExo.pages[iPage].questions[iQ].trous[t].length; p++) {
                var scoreTrPr = parseInt(tblExo.pages[iPage].questions[iQ].trous[t][p].score)
                if (scoreTrPr > tScore) {
                  tScore = scoreTrPr;
                }

              }
              scoreMax += tScore;
            }
          }
        }
      }
    }
    $("#ctnInfosResult").load("lglg/lglg_outils/scoreAffich.html");
  } else if (tblExo.scenario.evalType === "AE") {
    $("#ctnInfosResult").load("lglg/lglg_outils/AEAffich.html");
  }

  //*** col droite
  if (tblExo.pages.length > 1) {
    $("#ctnNavigation").load("lglg/lglg_interface/navigQ.html");
  }

  //*** onglets

  //*** popupConsigne
  if (tblExo.consigne) {
    $("#ctnConsigne").html(tblExo.consigne);
  }

  $("#ctnOutils").addClass("outilsInactif"); //class pour etre invisible quand on change les couleur du svg (sinon ça clignote ...
  $("#ctnOutils").hide(); // on hide en plus de la transparence pour l'organisation de la page...

  //test si le lglg est dans une iFrame avec le script de redimensionnement... bonne taille au démarrage
  // try {
  //   window.top.window.lglgHauteur();
  // } catch (err) {
  //   console.log(" au demarrage na pas trouve le script lglgHauteur");
  // }


  //***** pour rendre clic possible dans les champ tinymce
  ///$(".tinyAction").click(tinyActionHdlr);
  var temp = document.getElementsByClassName("tinyAction");
  for (var i = 0; i < temp.length; i++) {
    temp[i].addEventListener("click", tinyActionHdlr);
  }

  //*** redim de video
  var ratio = parseInt(tblExo.interface.ratio)*10;
  var ratioG = ratio + "%";
  var ratioD = (100 - ratio) + "%";
  $("#docu").css("flex-basis" , ratioG);
  $("#questionnaire").css("flex-basis" , ratioD);

}

///*********************************

function html_entity_decode(str) {
  var tarea = document.createElement('textarea');
  tarea.innerHTML = str;
  return tarea.value;
  tarea.parentNode.removeChild(tarea);
}
//**********************************

//***** test pour mélanger les prop de qddCtnProps
function propsShuffle(a) {
  var j = 0;
  var valI = '';
  var valJ = valI;
  var l = a.length - 1;
  while (l > -1) {
    j = Math.floor(Math.random() * l);
    valI = a[l];
    valJ = a[j];
    a[l] = valJ;
    a[j] = valI;
    l = l - 1;
  }
  // return a;
}
