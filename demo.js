
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var id = [0, 0, 0];
var imena = ["Marko", "Manca", "Eva"];
var gender = ["MALE", "FEMALE", "FEMALE"];
var priimki = ["Zatlacen", "Zagozen", "Povozen"];
var datumRojstev = ["1964-03-10T08:08", "1987-03-04T12:12", "1994-12-01T11:11"];
var verjetnostDaSeZredi = [0.22, 0.61, 0.25];
var tezave = [0, 0, 0, 0];


function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
        "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


function generator() {
	kreirajEHRzaBolnika(0);
	kreirajEHRzaBolnika(1);
	kreirajEHRzaBolnika(2);
}

function kreirajEHRzaBolnika(i) {
	var sessionId = getSessionId();

	var ime = imena[i];
	var priimek = priimki[i];
	var datumRojstva = datumRojstev[i];
	var spol = gender[i];

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
	
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        id[i] = ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            gender: spol,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
		                    var predloga = "<option class=\"predloga\" value=\""+ id[i] +"\">" + ime + " "+ priimek + "</option>"
							console.log(predloga);
							$("#predlogaBolnika").append(predloga);
							dodajMeritveVitalnihZnakov(i);
		                }
		            },
		            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
	}
}

function dodajMeritveVitalnihZnakov(i) {
	console.log("EhrId: " + id[i]);
	console.log("Ni ehrja! i = ", i);
	if ( id[i] !== 0){
		var datum = datumRojstev[i];
		datum = datum.split("-");
		var leto = datum[0];
		var dolzina = 2014 - parseInt(leto);
		console.log(dolzina);
		datum = datum.join("-");
		
		var visina = Math.floor((Math.random() * 50) + 150);
		var teza = Math.floor((Math.random() * 50) + 47);
		
		for(var j = 0; j < dolzina; j++){
			var d = datum.split("-");
			var leto = parseInt(d[0]);
			d[0] = (leto + j).toString();
			d = d.join("-");
			console.log(d);
			var datumInUra = d; 
			
			var telesnaVisina = visina + Math.floor((Math.random() * 3));
			
			teza = teza +  Math.floor(((Math.random() * 5) * (verjetnostDaSeZredi[i])));
			teza = teza -  Math.floor((1 - verjetnostDaSeZredi[i])*(Math.random() * 3)/2);
			var telesnaTeza = teza;
			
			var telesnaTemperatura;
			var plus = Math.random();
			if(plus > 0.8) telesnaTemperatura = (Math.random() * 5) + 36.5;
			else if(plus < 0.05)	telesnaTemperatura = (36.5 - ( Math.random() * 3));
			else	telesnaTemperatura = (Math.random() * 1.2) + 36.0;
			
			plus = Math.random();
			if(plus > 0.5) plus = 1;
			else	plus = 0;
			var sistolicniKrvniTlak =  Math.floor(120 + (verjetnostDaSeZredi[i]) * (Math.pow((-1), plus) * Math.random() * 50));
			var diastolicniKrvniTlak = Math.floor(80 + (verjetnostDaSeZredi[i]) * (Math.pow((-1), plus) * Math.random() * 20));
			var nasicenostKrviSKisikom = Math.floor(100 - verjetnostDaSeZredi[i] *1/2* (Math.random() * 20));
			var merilec = 'Benjamin Novak';
		
			console.log("Do ajaxa");
			var sessionId = getSessionId();
			$.ajaxSetup({
			    headers: {	"Ehr-Session": sessionId	}
			});
			var podatki = {
			    "ctx/language": "en",
			    "ctx/territory": "SI",
			    "ctx/time": datumInUra,
			    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
			    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
			   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
			    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
			    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
			    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
			    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
			};
			console.log(podatki);
			var parametriZahteve = {
			    "ehrId": id[i],
			    templateId: 'Vital Signs',
			    format: 'FLAT',
			    committer: merilec
			};
			$.ajax({
			    url: baseUrl + "/composition?" + $.param(parametriZahteve),
			    type: 'POST',
			    contentType: 'application/json',
			    data: JSON.stringify(podatki),
			    success: function (res) {
			    	console.log(res.meta.href);
			    	console.log("Vse vredu.");
			        $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
			    },
			    error: function(err) {
			    	$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
					console.log(JSON.parse(err.responseText).userMessage);
			    }
			});
			
		}
	}
}

function prikaziPrekoEhrId(){
	dodaj();
	zbrisi();
	var ehrId = $("#meritveVitalnihZnakovEHRid").val();
	console.log(ehrId);
	prikaz(ehrId);
}

function prikazi() {
	dodaj();

	var e = document.getElementById("predlogaBolnika");
	var ehrId = e.options[e.selectedIndex].value;
	console.log(typeof ehtId);
	console.log(ehrId);

	zbrisi();

    prikaz(ehrId);
}

function zbrisi(){
	var myNode = document.getElementById("slika");
	myNode.innerHTML = '';
	myNode = document.getElementById("podatki");
	myNode.innerHTML = '';
	myNode = document.getElementById("masa");
	myNode.innerHTML = '';
	myNode = document.getElementById("temperatura");
	myNode.innerHTML = '';
	myNode = document.getElementById("nasicenost");
	myNode.innerHTML = '';
	myNode = document.getElementById("systolic");
	myNode.innerHTML = '';
	myNode = document.getElementById("diastolic");
	myNode.innerHTML = '';
	myNode = document.getElementById("visina");
	myNode.innerHTML = '';
	myNode = document.getElementById("index");
	myNode.innerHTML = '';
	myNode = document.getElementById("analiza");
	myNode.innerHTML = '';
	myNode = document.getElementById("teza");
	myNode.innerHTML = '';
	myNode = document.getElementById("rezultati");
	myNode.innerHTML = '';
}

function dodaj(){
	$("#podatek").fadeIn(1000);
	$("#a").fadeIn(1000);
	$("#predlog").fadeIn(1000);
}

function odstrani(){
	$("#podatek").fadeOut(1000);
	$("#a").fadeOut(1000);
	$("#predlog").fadeOut(1000);
}

function prikaz(ehrId){
	sessionId = getSessionId();	

	for(var i = 0; i < tezave.length; i++){
		tezave[i] = 0;
	}

	if(ehrId.length < 1){
		odstrani();
		return;
	}	

	var teza;
	var index;

	$.ajax({
	    url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    type: 'GET',
	    headers: {
	        "Ehr-Session": sessionId
	    },
	    success: function (data) {
	        var party = data.party;
	        var predloga = "<img src=\"PATIENT_GUIDE_0.jpg\" width=\"100%\"class=\"img-circle\">"
			$("#slika").append(predloga);
			var predloga = "<p class=\"p5\">" + party.firstNames + ' ' + party.lastNames + "</p>"
			$("#podatki").append(predloga);
			var dat = party.dateOfBirth.split("T");
			var d = dat[0];
			var t = dat[1];
			t = t.substring(0, 5);
			var predloga = "<p class=\"p3\"><b>Datum in ura rojstva: </b><span class=\"p8\">" + d + ", " + t + "</span></p>"
			$("#podatki").append(predloga);
			var spol = party.gender;
			if(spol === ("MALE")){
				spol = "Moški";
			}
			else	spol = "Ženski";
			var predloga = "<p class=\"p3\"><b>Spol: </b> <span class=\"p8\">" + spol + "</span> </p>"
			$("#podatki").append(predloga);
			var predloga = "<p class=\"p3\"><b>Naslov: </b><span class=\"p8\"> - </span></p>"
			$("#podatki").append(predloga);
		},
		error: function(err) {
			return;
		}
	});
	$.ajax({
	    url: baseUrl + "/view/" + ehrId + "/weight",
	    type: 'GET',
	    headers: {
	        "Ehr-Session": sessionId
	    },
	    success: function (res) {
	        for (var i = 0; i < 1; i++) {
	        	if(i === 0){
	        		var predloga = "<center><p class=\"p2\">Telesna teža: "+ "</p>" +"<br>" + "<p class=\"p4\">" + res[i].weight +" "+ res[i].unit + "<br>"  + "</p></center>";
					$("#masa").append(predloga);
					teza = res[i].weight;
		            console.log(res[i].time + ': ' + res[i].weight + res[i].unit + "<br>");
		            visinaIndex(teza, ehrId);
	        	}
	        }
	    }
	});
	$.ajax({
	    url: baseUrl + "/view/" + ehrId + "/body_temperature",
	    type: 'GET',
	    headers: {
	        "Ehr-Session": sessionId
	    },
	    success: function (res) {
	        for (var i = 0; i < 1; i++) {
	        	var temp = res[i].temperature.toString();
	        	temp = temp.substring(0, 4);
				var predloga = "<center><p class=\"p2\">Temperatura: "+ "</p>" +"<br>" + "<p class=\"p4\">" + temp +" "+ res[i].unit + "<br>"  + "</p></center>";
				$("#temperatura").append(predloga);
	            console.log(res[i].time + ': ' + res[i].body_temperature + res[i].unit + "<br>");
	            preglejTemp(temp);
	        }
	    }
	});
	$.ajax({
	    url: baseUrl + "/view/" + ehrId + "/spO2",
	    type: 'GET',
	    headers: {
	        "Ehr-Session": sessionId
	    },
	    success: function (res) {
	        for (var i = 0; i < 1; i++) {
				var predloga = "<center><p class=\"p2\">Nasičenost krvi: "+ "</p>" +"<br>" + "<p class=\"p4\">" + res[i].spO2 +" %<br>"  + "</p></center>";
				$("#nasicenost").append(predloga);
				preglejNasicenje(res[i].spO2);
	        }
	    }
	});
	$.ajax({
	    url: baseUrl + "/view/" + ehrId + "/blood_pressure",
	    type: 'GET',
	    headers: {
	        "Ehr-Session": sessionId
	    },
	    success: function (res) {
	        for (var i = 0; i < 1; i++) {
				var predloga = "<center><p class=\"p2\">Sistolični tlak: "+ "</p>" +"<br>" + "<p class=\"p4\">" + res[i].systolic +"<br>"  + "</p></center>";
				$("#systolic").append(predloga);
				var predloga = "<center><p class=\"p2\">Diastolični tlak: "+ "</p>" +"<br>" + "<p class=\"p4\">" + res[i].diastolic +"<br>"  + "</p></center>";
				$("#diastolic").append(predloga);
				preglejTlak(res[i].systolic, res[i].diastolic);
	        }
	    }
	});
}

function visinaIndex(teza, ehrId){
	$.ajax({
	    url: baseUrl + "/view/" + ehrId + "/height",
	    type: 'GET',
	    headers: {
	        "Ehr-Session": sessionId
	    },
	    success: function (res) {
	    	//console.log(res);
	        for (var i = 0; i < 1; i++) {
	            var predloga = "<img src=\"sintaisokutei.GIF\" class=\"slikaVelikost\">"
				$("#visina").append(predloga);
				var predloga = "<div class=\"besedilo\"> <p class=\"p2\">Velikost: "+ "</p>" +"<br>" + "<p class=\"p4\">" + res[i].height +" "+ res[i].unit + "<br>"  + "</p>" + "</div>";
				$("#visina").append(predloga);
				index = teza /(res[i].height / 100 * res[i].height / 100);
				var temp = index.toString();
	        	temp = temp.substring(0, 4);
				var predloga = "<center><p class=\"p2\">Index telesne teže: "+ "</p>" +"<br>" + "<p class=\"p4\">" + temp+"<br>"  + "</p></center>";
				$("#index").append(predloga);
				analizaInPredlogi(index, ehrId);
	            console.log(res[i].time + ': ' + res[i].height + res[i].unit + "<br>" + index);
	        }
	    }
	});
}

function preglejTlak(systolic, diastolic){
	var predloga = "";
	if(systolic >= 110 && systolic <= 140){		//vir: http://sl.wikipedia.org/wiki/Krvni_tlak
		$("#systolic").css("background-color", "none");
		predloga = "<p class=\"p7\">Sistolični krvni tlak je: " + "<b>" + "normalen" + "</b>" + "</p>" ;
		tezave[1] = 0;
	}
	else{
		var mera = "";
		if(systolic < 110)	mera = "znižan";
		else	mara = "povišan";
		$("#systolic").css("background-color", "#B75959");
		tezave[1] = 1;
		predloga = "<p class=\"p7\">Sistolični krvni tlak je: " + "<b>" + mera + "</b>" + "</p>" ;
	}
	if(diastolic >= 60 && diastolic <= 90){
		$("#diastolic").css("background-color", "none");
		predloga += "<p class=\"p7\">Diastolični krvni tlak je: " + "<b>" + "normalen" + "</b>" + "</p>" ;
	}
	else{
		var mera = "";
		if(systolic < 60)	mera = "znižan";
		else	mara = "povišan";
		$("#diastolic").css("background-color", "#B75959");
		predloga += "<p class=\"p7\">Diastolični krvni tlak: " + "<b>" + mera + "</b>" + "</p>" ;
	}
	$("#analiza").append(predloga);
}

function preglejNasicenje(n){
	var predloga = "";
	if(n >= 97){
		$("#nasicenost").css("background-color", "none");
		predloga = "<p class=\"p7\">Nasičenost krvi s kisikom: " + "<b>" + "normalna" + "</b>" + "</p>" ;
		tezave[0] = 0;
	}
	else{
		$("#nasicenost").css("background-color", "#B75959");
		tezave[0] = 1;
		predloga = "<p class=\"p7\">Nasičenost krvi s kisikom: " + "<b>" + "znižana (svetujemo pregled pri specialistu)" + "</b>" + "</p>" ;
	}
	$("#analiza").append(predloga);
}

function preglejTemp(temp){
	temperatura([
		{
			"spodnaMeja" : 35.8,
			"zgornjaMeja" : 37.2,
			"znotraj" : "znotraj intervala",
			"zunaj" : "bolezensko stanje",
		}
	]);
	function temperatura(arr) {
		if(temp >= parseFloat(arr[0].spodnaMeja) && temp <= parseFloat(arr[0].zgornjaMeja)){
			$("#temperatura").css("background-color", "none");
			predloga = "<p class=\"p7\">Tvoja telesna temperatura je: " + "<b>" + arr[0].znotraj + "</b>" + "</p>" ;
		}
		else{
			$("#temperatura").css("background-color","#B75959");
			predloga = "<p class=\"p7\">Tvoja telesna temperatura kaže na: " + "<b>" + arr[0].zunaj + "</b>" + "</p>" ;
		}
		$("#analiza").append(predloga);
	}
}

function analizaInPredlogi(index, ehrId){
	myFunction([				//zunanji vir: http://www.popolnapostava.com/indeks-telesne-mase/
			{
			"itm": "18.5",
			"masa": "premajhna",
			"ogrozenost": "zvečana",
			},
			{
			"itm": "18.5-25",
			"masa": "normalna",
			"ogrozenost": "povprečna",
			},
			{
			"itm": "25.0-29.9",
			"masa": "čezmerna",
			"ogrozenost": "zvečana",
			},
			{
			"itm": "30.0-35",
			"masa": "debelost, 1. razreda",
			"ogrozenost": "velika",
			},
			{
			"itm": "35.0-39.9",
			"masa": "debelost, 2. razreda",
			"ogrozenost": "zelo velika",
			},
			{
			"itm": "40",
			"masa": "debelost, 3. razreda",
			"ogrozenost": "izjemno velika",
			}
		]);
	function myFunction(arr) {
		var out = "";
	    for(var i = 0; i < arr.length; i++) {
	        var meja = arr[i].itm;
	        var jeZnotraj = 0;
	        if(i == 0){
	        	var tocka = parseFloat(meja);
	        	if(index < tocka)	jeZnotraj = 1;
	        }
	        else if( i == (arr.length - 1)){
	        	var tocka = parseFloat(meja);
	        	if(index > tocka)	jeZnotraj = 1;
	        }
	        else{
	        	var meji = meja.split("-");
	        	var spodnja = parseFloat(meji[0]);
	        	var zgornja = parseFloat(meji[1]);
	        	if(index >= spodnja && index < zgornja)	jeZnotraj = 1;
	        }
	        if(jeZnotraj === 1){
	        	var masa = arr[i].masa;
		        var ogrozenost = arr[i].ogrozenost;
		        out = "<p class=\"p7\">Tvoja telesna masa je v razredu: " + "<b>" + masa + "</b>" + "<br>" + "Zdravstvena ogroženost: " + "<b>" + ogrozenost + "</b>"  + "</p>" ;
		        if(i > 1 || i === 0){
		        	tezave[3] = i + 1;
		        	$("#index").css("background-color","#B75959");
		        }
		        else{
		        	$("#index").css("background-color","none");
		        }
		        break;
	        }
	    }
	   	$("#analiza").append(out);
	}
	
	var AQL = "select " +
			"t/data[at0002]/events[at0003]/time/value as cas, " +
			"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperatura_vrednost, " +
			"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/units as temperatura_enota " +
		"from EHR e[e/ehr_id/value='" + ehrId + "'] " +
		"contains OBSERVATION t[openEHR-EHR-OBSERVATION.body_temperature.v1] " +
		"where t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude<35.8 " +
		"order by t/data[at0002]/events[at0003]/time/value desc ";
	$.ajax({
	    url: baseUrl + "/query?" + $.param({"aql": AQL}),
	    type: 'GET',
	    headers: {"Ehr-Session": sessionId},
	    success: function (res) {
	    	if (res) {
	    		var rows = res.resultSet;
	    		if(rows.length > 0){
	    			var predloga = "<p class=\"p7\">Št. pregledov, kjer je bila izmerjena podhladitev: " + "<b>" + rows.length + "</b>" + "</p>" ;
	    			$("#analiza").append(predloga);
	    		}
	    	}
	    },
	    error: function() {
			console.log(JSON.parse(err.responseText).userMessage);
	    }
	});

	var AQL = "select " +
			"t/data[at0002]/events[at0003]/time/value as cas, " +
			"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperatura_vrednost, " +
			"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/units as temperatura_enota " +
		"from EHR e[e/ehr_id/value='" + ehrId + "'] " +
		"contains OBSERVATION t[openEHR-EHR-OBSERVATION.body_temperature.v1] " +
		"where t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude>37.2" +
		"order by t/data[at0002]/events[at0003]/time/value desc ";
	$.ajax({
	    url: baseUrl + "/query?" + $.param({"aql": AQL}),
	    type: 'GET',
	    headers: {"Ehr-Session": sessionId},
	    success: function (res) {
	    	if (res) {
	    		var rows = res.resultSet;
	    		if(rows.length > 0){
	    			var predloga = "<p class=\"p7\">Št. pregledov, kjer je bila vročina: " + "<b>" + rows.length + "</b>" + "</p>" ;
	    			$("#analiza").append(predloga);
	    		}
	    	}
	    },
	    error: function() {
			console.log(JSON.parse(err.responseText).userMessage);
	    }
	});
	$("#teza").append("<svg id=\"visualisation\" width=\"100%\" height=\"270\"></svg>");
	
	$.ajax({
	    url: baseUrl + "/view/" + ehrId + "/weight",
	    type: 'GET',
	    headers: {
	        "Ehr-Session": sessionId
	    },
	    success: function (lineData) {
	    			console.log(lineData);
	    		 	var vis = d3.select("#visualisation"),
					WIDTH = $("#visualisation").width(),
					HEIGHT = 270,
					MARGINS = {
					  top: 20,
					  right: 20,
					  bottom: 20,
					  left: 30
					},
					xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(lineData, function (d) {
					    var datum = d.time.split("-");
					    return parseInt(datum[0]);
					  }),
					  d3.max(lineData, function (d) {
					  	var datum = d.time.split("-");
					    return parseInt(datum[0]);
					  })
					]),

					yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(lineData, function (d) {
					    return (d.weight - 2);
					  }),
					  d3.max(lineData, function (d) {
					    return (d.weight + 2);
					  })
					]),

					xAxis = d3.svg.axis()
					  .scale(xRange)
					  .tickSize(5)
					  .tickSubdivide(true),

					yAxis = d3.svg.axis()
					  .scale(yRange)
					  .tickSize(5)
					  .orient("left")
					  .tickSubdivide(true);


					vis.append("svg:g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
					.call(xAxis);

					vis.append("svg:g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + (MARGINS.left) + ",0)")
					.call(yAxis);

					var lineFunc = d3.svg.line()
					.x(function (d) {
						var datum = d.time.split("-");
						return xRange(parseInt(datum[0]));
					})
					.y(function (d) {
						return yRange(d.weight);
					})
					.interpolate('basis');

					vis.append("svg:path")
					.attr("d", lineFunc(lineData))
					.attr("stroke", "#337ab7")
					.attr("stroke-width", 3)
					.attr("fill", "none");
		}
	});
	var sporocilo = "<p class=\"p7\">"; 
	nasveti([
			{
				"ok": "Nasičenost vaše krvi s kisikom je v intervalu normalne vrednosti. Nadaljujte z dobrimi navadami in poskušajte odpraviti slabe.",
				"slabo": "Vaša nasičenost je pod nivojem normalne vrednosti. Do tega pride ob različnih dihalnih stiskah, na primer pri astmi, pljučnici ali pa preprosto pri slabotnih bolnikih, ki ne morejo dovolj globoko vdihniti. Preverite, če spadate v katero izmed naštetih skupin. ",
			},
			{
				"ok": "<br>Vaš tlak je normalen. Odgovorite na sledeča vprašanja in če ste nanje odgovorili z ne, nadaljujte s svojim življenjskim slogom. <br>" + " <b> 1. Ali ste pretežki?	2. Ali jeste preslano hrano?	3. Ali popijete preveč alkoholnih pijač?	4. Ali se premalo gibljete?	5. Ali kadite?</b>",
				"slabo": "<br>Če se bolnik kljub nizkemu krvnemu tlaku dobro počuti, ni razloga za zaskrbljenost. Zdravnika je potrebno opozoriti le v primeru, ko nizek krvni tlak povzroča težave, kot so vrtoglavica, splošna oslabelost, zaspanost in utrujenost. <br> Tveganje za nastanek in razvoj arterijske hipertenzije ter posledičnih bolezni srca in žilja lahko uspešno zmanjšamo z zdravim načinom življenja. S tem ne preprečimo le nastanka arterijske hipertenzije, pripomoremo lahko tudi k zmanjšanju povečanega krvnega tlak. <br>"
				+ "<br>Odgovorite si: <b> 1. Ali ste pretežki?	2. Ali jeste preslano hrano?	3. Ali popijete preveč alkoholnih pijač?	4. Ali se premalo gibljete?	5. Ali kadite?</b>",
			},
		]);
	function nasveti(n) {
		for(var i = 0; i < n.length; i++){
			if(tezave[i] === 0){
				sporocilo += n[i].ok; 
			}
			else	sporocilo += n[i].slabo; 
		}
	}
	var itmTezave =	["<br>Zdravje je pomembnejše od videza. Hrana je vir hranil in posamezniku zagotavlja ustrezen vnos energije. Podhranjenost lahko vodi do mnogih drugih zdravstvenih težav, kot so infekcije dihal, poškodba ledvic, srčna kap, krvavenje in nenazadnje smrt. Priporočamo <b>povečano količina dnevnega vnosa hrane</b>.", "<br>Ljudje s prekomerno telesno težo se velikokrat soočajo z boleznimi srca, sladkorno boleznijo tipa 2, obstruktivnimi apnejami med spanjem, nekaterimi vrstami raka in osteoartritisom. Debelost je najpogosteje posledica kombinacije pomanjkanja telesne dejavnosti, prevelike količine zaužite hrane in genetske dovzetnosti (lahko tudi zaradi genetske in endokrine motnje, zdravil ali duševne motnje). <br> Priporočamo <b>izboljšanje</b> kakovosti prehrane, <b>dieto</b> in <b>povečanje športnih aktivnost</b>."];	//http://sl.wikipedia.org/wiki/Debelost
	if(tezave[3] !== 0){
		if(tezave[3] === 1){
			sporocilo += itmTezave[0];
		}
		else{
			sporocilo += itmTezave[1];
		}
	}
	console.log(tezave);
	sporocilo += "</p>";
	$("#rezultati").append(sporocilo);
}

$(document).ready(function() {
	
});