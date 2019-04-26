var proto_qdd = {
  donnees: {},
  // reponses:"",
  // ae:null,
  // score:0,
  affich: function(i) {
    "use strict";
    console.log("\n---- On affiche question : " + i +" -------");
    var questionEnCours = document.getElementById("ctnQuestion_" + i);
    questionEnCours.onclick = effacerClavier; // TODO: ça devrait pas ête là ça ...?

    var question = document.createElement("p"); //question
    //****extrait vidéo -question
    if (this.donnees.extraitQuestion.fin > 0) {
      var btnExtrait = document.createElement("button");
      btnExtrait.id = "btnVidExtrait_q_" + i + "_vo";;
      btnExtrait.className = " btnExtraitVidVo";
      btnExtrait.onclick = lireExtraitVid;
      question.appendChild(btnExtrait);
    }

    // la ques
    var txtQuestion = document.createElement("span");
    txtQuestion.className = "txtQuestion";
    txtQuestion.innerHTML = this.donnees.txtQuestion;
    question.appendChild(txtQuestion);
    questionEnCours.appendChild(question);

    //boite à propositions ie cible null
    var boitaProps = document.createElement("div");
    boitaProps.className = "qddCtnProps droppabe"
    boitaProps.id = "cib_" + i + "_0";
    questionEnCours.appendChild(boitaProps);

    // cibles
    var boitaCibles = document.createElement("div");
    boitaCibles.className = "qddCtnCibles"
    //***** largeur des cibles :
    var nbCibL = 2;
    if (this.donnees.nbCibL > 0) {
      nbCibL = parseInt(this.donnees.nbCibL);
    }
    var styleFlex = " 0 0 " + Math.floor(90 / nbCibL) + "%";
    console.log("styleFlex = " + styleFlex);
    for (var k = 0; k < this.donnees.cibles.length; k++) {
      var cibRoot = document.createElement("div");
      cibRoot.style.flex = styleFlex;
      var cibTitre = document.createElement("h4");
      cibTitre.innerHTML = this.donnees.cibles[k].titre;
      cibRoot.appendChild(cibTitre);
      var cib = document.createElement("div");
      cib.id = "cib_" + i + "_" + this.donnees.cibles[k].id;
      cib.className = "droppabe";
      cibRoot.appendChild(cib);
      boitaCibles.appendChild(cibRoot);
    }
    questionEnCours.appendChild(boitaCibles);
    $(".droppabe").droppable({
      accept: function(e) {
        // pour vérifier qu'on est bien dans le même exo
        var drag = e[0].id.split("_")[1];
        var cib = this.id.split("_")[1];
        return drag === cib;
      },
      drop: function(e, ui) {
        var uiDroppet = ui.draggable[0].id.split("_");
        var cibAct = e.target.id.split("_");
        console.log("uiDroppet = " + JSON.stringify(uiDroppet));
        console.log("cibAct = " + JSON.stringify(cibAct));
        console.log("i = " + i);
        tblReponses[pCourante].reps[cibAct[1]][uiDroppet[2]] = cibAct[2];

        console.log("O°O" + JSON.stringify(tblReponses[pCourante].reps));
      }
    });


    //**** propositions
    //** mélange
    // var propOrd = this.donnees.propositions;
    // console.log("au depart : \n" + JSON.stringify(this.donnees.propositions));
    // var propMel = [];
    // while (propOrd.length > 0) {
    //   // for (test = 0 ;  test < 3 ; test ++){
    //   var al = Math.floor(Math.random() * propOrd.length);
    //   // console.log ( "----\n" + "on a al = " + al + "  // " + propOrd.length)
    //   propMel.push(propOrd.splice(al, 1)[0]);
    //   // console.log("\n" + JSON.stringify(propMel));
    //   // console.log("\n" + JSON.stringify(propOrd));
    // }
    propsShuffle(this.donnees.propositions);
    // console.log("a la fin : \n" + JSON.stringify(this.donnees.propositions));

    for (var j = 0; j < this.donnees.propositions.length; j++) {
      var prop = document.createElement("div");
      prop.id = "prop_" + i + "_" + this.donnees.propositions[j].id;
      prop.className = "draggabe actif q" + i;
      if (this.donnees.propositions[j].type === "t") {
        prop.innerHTML = this.donnees.propositions[j].texte; // faire plus propre
      } else if (this.donnees.propositions[j].type === "s") {
        prop.className += " dragSon";
        var leSon = document.createElement("audio");
        leSon.src = this.donnees.propositions[j].son;
        // leSon.controls = true;
        prop.appendChild(leSon);
        var btnSon = document.createElement("button");
        btnSon.className = "btnSon far fa-play-circle";
        // btnSon.innerHTML = "play_circle_outline";
        btnSon.onclick = sonLecture;
        prop.appendChild(btnSon);
      }
      //  var cibInd = tblReponses[pCourante].reps[i][j];
      console.log("on est dans i (question) = " + i + ", avec j(proposition) = " + j);
      console.log("tblReponses[pCourante].reps[i] = " + JSON.stringify(tblReponses[pCourante].reps[i]));
      var cibId = 0;
      console.log(" */|" + tblReponses[pCourante].reps[i][this.donnees.propositions[j].id] + "|");
      var repId = tblReponses[pCourante].reps[i][this.donnees.propositions[j].id];
      if (repId > 0) {
        cibId = repId;
      }
      // console.log("on va mettre la prop cibId);
      document.getElementById('cib_' + i + "_" + cibId).appendChild(prop);

    }
    $(".draggabe").draggable({
      revert: "invalid"
    });

    // retroAction générale
    var txtCorrection = document.createElement("div");
    txtCorrection.className = "feedback txtCorrection";
    txtCorrection.innerHTML = this.donnees.txtCorrection;
    questionEnCours.appendChild(txtCorrection);

    var ctnFBl2 = document.createElement("div");
    ctnFBl2.className = "ctnFlexH";
    /**** extrait vidéo ****/
    if (this.donnees.extraitCorrection.fin > 0) {
      var btnExtrait_c1 = document.createElement("button");
      btnExtrait_c1.id = "btnVidExtrait_c_" + i + "_vo";
      btnExtrait_c1.className = "feedback btnExtraitVidVo";
      btnExtrait_c1.onclick = lireExtraitVid;
      ctnFBl2.appendChild(btnExtrait_c1);

      if (tblExo.scenario.usageGst === "1" && !this.donnees.extraitCorrection.masqueST) { //test pour masquer deuxieme bouton si pas de ST
        var btnExtrait_c2 = document.createElement("button");
        btnExtrait_c2.id = "btnVidExtrait_c_" + i + "_st";
        btnExtrait_c2.className = "feedback btnExtraitVidSt";
        btnExtrait_c2.onclick = lireExtraitVid;
        ctnFBl2.appendChild(btnExtrait_c2);
      }
    }

    /******* note pour question *****/
    var ctnScoreQ = document.createElement("span");
    ctnScoreQ.className = "feedback qScore";
    ctnScoreQ.id = "qScore_" + i;
    // ctnScoreQ.innerHTML = "note"

    ctnFBl2.appendChild(ctnScoreQ);
    questionEnCours.appendChild(ctnFBl2);

    /****** autoEval*****/
    var autoEvaluation = document.createElement("div");
    autoEvaluation.className = "feedback autoEval";
    autoEvaluation.id = "ctnAutoEvaluation_" + i;
    questionEnCours.appendChild(autoEvaluation);
    //$("#ctnAutoEvaluation_" + i).load("outils/autoeval.html");
    if (tblExo.scenario.evalType === "AE") {
      creationAE(i);
    }
    $("#ctnQuestion_" + i + " .feedback").hide(0);
  },

  //********** correction
  corr: function(i) {
    $("#ctnQuestion_" + i + " .feedback").show("fast");

    // var qCorr = true;
    var qScore = 0;
    for (var j = 0; j < this.donnees.propositions.length; j++) {
      var jId = this.donnees.propositions[j].id;
      console.log("a j = " + j + " -- id de la proposition" + jId);
      var repDonnee = tblReponses[pCourante].reps[i][jId];
      console.log("donc reponse donnée = " + repDonnee + " pour attendu :" + this.donnees.propositions[j].reponseCorrecte);
      if (repDonnee > -1) {
        //if (this.donnees.cibles[repDonnee].id === this.donnees.propositions[j].reponseCorrecte) {
        if (repDonnee === this.donnees.propositions[j].reponseCorrecte) {
          $("#prop_" + i + "_" + jId).addClass("correct").removeClass("faux");
          if (this.donnees.scoreActif && tblExo.scenario.evalType === "S") {
            qScore += parseInt(this.donnees.propositions[j].score);
          }
        } else {
          $("#prop_" + i + "_" + jId).addClass("faux").removeClass("correct");
        }
      } else {
        $("#prop_" + i + "_" + jId).addClass("faux").removeClass("correct");
      }

    }
    //****score total
    if (this.donnees.scoreActif && tblExo.scenario.evalType === "S") {
      document.getElementById("qScore_" + i).innerHTML = qScore;
      tblReponses[pCourante].score[i] = qScore;
      majScore();
    }

    $(".draggabe").draggable("option", "disabled", true);
    $(".draggabe").removeClass("actif");
  }
}

/**********************
 *****fonctions...*****/
function sonLecture(e) {
  console.log("lecture son " + e.currentTarget.parentNode.getElementsByTagName('audio').length);
  e.currentTarget.parentNode.getElementsByTagName('audio')[0].play();
}
