/* crypto.js - controls main logic flow and functinality for the cryptogram helper
 * 
 * Author: Colin Heffernan
 * Created: Dec 14 2013
 *
 */

/* Global variables to be used by all components */
var dictionary = null; // maps each letter to its substitution
var reverseDict = null; // maps each substitution to the original letter
var freeLetters = null; // letters remaining and available for substitution
var cryptedMessage = null; // original message input by user to the message box
var frequencyTable = null; // table of letter frequencies in the original message
var ALPHABET = null; // array containing the 25 letters in the english alphabet for resetting

var vvv = '';
function crypt() {
    var upr = 'ABCČDEFGHIJKLMNOPRSŠTUVXZŽ';
    var ch = upr.split('');

    function randOrd(){
        return (Math.round(Math.random())-0.5); 
    }

    ch.sort(randOrd);
    ch[26] = ch[0];
    var fin = false;
    while (!fin) {
        for (var i = 0; i < 26; i++) {
            if (ch[i] == upr.charAt(i)) {
                var t = ch[i];
                ch[i] = ch[i+1];
                ch[i+1] = t;
            }   
        }
        if (ch[26] == ch[0]) fin = true; 
        else ch[0] = ch[26];
    }
    upr = ch.join(''); 
    return upr.substring(0,26);
}

function stripBlanks(fld) {
    var result = "";
    var c = 0;
    for (i=0; i < fld.length; i++) {
        if (fld.charAt(i) != " " || c > 0) {
            result += fld.charAt(i);
            if (fld.charAt(i) != " ") c = result.length;
        }
      }
    return result.substr(0,c);
}

function addQ(q) {
    if (q === '' || q === undefined) {
        return false;
    }
    var t = q.toUpperCase();
	t = t.split(", ").join(",");
	t = t.split(". ").join(".");
	//var t = q;
    var ary = crypt();
    var s = '';
    //t = t.replace(/\r/g,'');
    for (var i = t.length - 1; i >= 0; i--) {
        var a = t.charCodeAt(i);
        //console.log(a);
        if (a === code('Č'))  a = code('Q');
        else if (a === code('Š'))   a = code('X');
        else if (a === code('Ž'))  a = code('Y');
        if (a > 64 && a < 91)   s = ary.charAt(a - 65)+s;
        else    s = t.charAt(i)+s;
    }
    vvv = s;
    return vvv;
}

/*
 * initialize - called when the begin button is pressed
 */
var ind = null;

function initialize(st){
    $('#begin').each(function() {
        $(this).remove();
    });
    ind = st;
    dictionary = new Array();
    reverseDict = new Array();
    frequencyTable = new Array();
    ALPHABET = new Array(); // constant alphabet array 
    addResetButton();
	addNextButton();
    var A = "A".charCodeAt(0);
    for (var i = 0; i < 26; i++){ // fill alphabet array
        var newChar = String.fromCharCode(A + i);
        if(newChar === 'Q' || newChar === 'W' || newChar === 'X' || newChar === 'Y')    continue;
        ALPHABET.push(newChar);
        if(newChar === 'C')  ALPHABET.push('Č');
        if(newChar === 'S')  ALPHABET.push('Š');
        if(newChar === 'Z')  ALPHABET.push('Ž');
    }

    freeLetters = ALPHABET.slice(0); // reset the freeLetters array to a copy of the ALPHABET array
    //window.onresize = updateEssentials;
    updateEssentials(); // adds the letter selection, message display, and frequency tables
}



function updateEssentials(){
    frequencyTable = new Array(); // frequencyTable will be handled by the getMessageDisplay method
    cryptedMessage = getCryptedMessage(); // get the latest version of the input crypted message stored in an array of words
    var coreLogic = document.getElementById("coreLogic");
    coreLogic.innerHTML = "";
    coreLogic.appendChild(newFreeLetterDisplay());
    coreLogic.appendChild(newLine());
    coreLogic.appendChild(newMessageDisplay());
    coreLogic.appendChild(newLine());
    coreLogic.appendChild(newFrequencyDisplay());
}

function updateEssentialsSecondly(){
    var coreLogic = document.getElementById("coreLogic");
    coreLogic.innerHTML = "";
    coreLogic.appendChild(newFreeLetterDisplay());
    coreLogic.appendChild(newLine());
    coreLogic.appendChild(newMessageDisplay());
    coreLogic.appendChild(newLine());
    coreLogic.appendChild(newFrequencyDisplay());
}

// index of text file 
var num = Math.floor((Math.random() * 10));;
//	number of all files
var N = 9;
// make a synchronous call


// returns the message as an array of words for displaying the message and controlling text wrapping
function getCryptedMessage(){
    var crypt = new Array(); // array of strings each representing a word
    //var input = addQ("KADAR SLEDITE SVOJI SREČI SE VAM BODO ODPRLA VRATA TAM, KODER STE MISLILI, DA JIH SPLOH NI; IN KODER TUDI NI VRAT ZA NIKOGAR DRUGEGA.");
    //var input = addQ("Človeka osrečijo njegovi lastni napori, brž ko spozna potrebne prvine za srečo - preproste užitke, določeno mero poguma, nesebičnost, ljubezen do dela in predvsem čisto vest. Zdaj sem prepričana, da sreča niso le prazne sanje.");
	var input;
	if(ind === 1){	
		input = addQ("KADAR SLEDITE SVOJI SREČI SE VAM BODO ODPRLA VRATA TAM, KODER STE MISLILI, DA JIH SPLOH NI; IN KODER TUDI NI VRAT ZA NIKOGAR DRUGEGA.");
	}    
    else  //input = addQ(textS[0]); 
	input = addQ(textS[num]); 
	
    //console.log(input);
	num++;
	num = num%(N);
	console.log(num);
    var i = 0; // index of the current character being investigated
    var currentWord = "";
    while (i < input.length){ // loop through every letter in the input
        var currentCharacter = input.charAt(i).toUpperCase();//.trim()-only deal with upper case letters (withou white space)
        if(ind === 2){
            currentCharacter = currentCharacter.trim().split(',').join("");
        }   
        appendFrequency(currentCharacter); // add the current Letter to the frequency table

        if (!(currentCharacter == ' ' || currentCharacter == '\n')){
            currentWord += currentCharacter; // add the current character to the current word
        }
        else{ // if we have a reached a space or end of the line
            if (!currentWord == ""){ // don't add empty words
                crypt.push(currentWord); 
            }
            currentWord = ""; // reset the currentWord (will not contain the current space)
        }
        if (i == input.length - 1){ // if we have reached the end of the file
            if (!currentWord == ""){ // don't add empty words
                crypt.push(currentWord);  // add the last word in
            }
            currentWord = ""; // reset the currentWord (will not contain the current space)
        }
        i++;
    }
    return crypt;
}

// returns a div element full of the draggable freeLetters
function newFreeLetterDisplay(){
    var freeLetterDisplay = document.createElement("div");
    freeLetterDisplay.setAttribute("id", "freeLetterDisplay");
    for(var i = 0; i < freeLetters.length; i++){
        freeLetterDisplay.appendChild(newDraggableFreeLetter(freeLetters[i]));
    }
    return freeLetterDisplay;
}

// returns the div element containing the entire display of original message beneath updated message containing substitutions
function newMessageDisplay(){
    var messageDisplay = document.createElement("div");
    messageDisplay.setAttribute("id", "messageDisplay");
    for (var i = 0; i < cryptedMessage.length; i++){
        var currentWord = cryptedMessage[i]; // current letter being examined
        //console.log(currentWord);
        messageDisplay.appendChild(newWordDisplay(currentWord));
        if (i < cryptedMessage.length - 1){ // add a space at the end of each word except for the last
            messageDisplay.appendChild(newSpace());
        }
    }
    return messageDisplay;
}

function newFrequencyDisplay(){
    var frequencyDisplay = document.createElement("div");
    frequencyDisplay.setAttribute("id", "frequencyDisplay");
    var index = 0;
    for (var letter in frequencyTable){
        index ++;
        frequencyDisplay.appendChild(newFrequency(letter, frequencyTable[letter]));
    }
    return frequencyDisplay;
}   

// helper methods for the three essential methods above

// returns a div element for the current word
function newWordDisplay(word){    
    var wordDisplay = document.createElement("div");
    wordDisplay.setAttribute("class", "wordDisplay");
    for (var i = 0; i < word.length; i++){ // index through the current word
        var currentLetter = word.charAt(i);
        if (isLetter(currentLetter)){ // if the current character is A-Z
            wordDisplay.appendChild(newEditableLetterDisplay(currentLetter)); // letterTable which can be modified for substitutions
        }
        else{ // if the current character is not A-Z
            wordDisplay.appendChild(newUneditableCharacterDisplay(currentLetter)); // letterTable which can not be modified
        }
    }
    return wordDisplay;
}

// returns a div element displaying the crypted letter from the original message and its editable substitute
function newEditableLetterDisplay(letter){
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("class", "letter");
    var top = document.createElement("div");
    top.setAttribute("ondragover", "allowDrop(event);"); // permit dragging and dropping from this element
    top.setAttribute("ondrop", "letterDraggedIntoMessage(event);"); // permit dragging and dropping with this letter
    top.setAttribute("ondragleave", "letterDraggedOutOfMessage(event);");
    top.setAttribute("class", "letterHolder");
    top.setAttribute("value", letter);
    top.appendChild(newEditableMessageLetter(letter));
    letterDisplay.appendChild(top);
    letterDisplay.appendChild(newLine());
    var bottom = document.createElement("div");
    bottom.setAttribute("class", "letterHolder");
    bottom.appendChild(cryptedCharacter(letter));
    letterDisplay.appendChild(bottom);
    return letterDisplay;
}

// returns a div element displaying the crypted letter from the original message and its editable substitute
function newUneditableCharacterDisplay(letter){
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("class", "letter");
    var top = document.createElement("div");
    top.setAttribute("class", "letterHolder");
    top.appendChild(newUneditableMessageCharacter(letter));
    letterDisplay.appendChild(top);
    letterDisplay.appendChild(newLine());
    /*var bottom = document.createElement("div");
    bottom.setAttribute("class", "letterHolder");
    bottom.appendChild(cryptedCharacter(letter));
    letterDisplay.appendChild(bottom);*/
    return letterDisplay;
}

// returns a div element for the uneditable non A-Z characters in a messageDisplay character table's top cell
function newUneditableMessageCharacter(character){ // div element to be in the top cell of each letter display
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("class", "uneditableCharacter");
    letterDisplay.setAttribute("value", character);
    letterDisplay.textContent = character;
    return letterDisplay;
}

// returns a draggable and editable letter to be added for A-Z characters in the messageDisplay letter table's top cell
function newEditableMessageLetter(letter){
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("original", letter); // original attribute holds the letter in the original crypted message
    letterDisplay.setAttribute("class", "decryptedCharacter");
    letterDisplay.setAttribute("draggable", true);
    letterDisplay.setAttribute("ondragstart", "letterDragged(event);");
    letterDisplay.setAttribute("onmouseenter", "highlightLetter(this);");
    if (letter in dictionary){
        letterDisplay.setAttribute("value", dictionary[letter]);
        letterDisplay.textContent = dictionary[letter];
    }
    else{
        letterDisplay.setAttribute("value", "");
        letterDisplay.textContent = "";
    }
    return letterDisplay;
}

// returns a div element for the characters in the original crypted message
function cryptedCharacter(character){
    var characterDisplay = document.createElement("div");
    characterDisplay.setAttribute("class", "cryptedCharacter");
    characterDisplay.setAttribute("value", character);
    characterDisplay.textContent = character;
    return characterDisplay;
}

//handle all the dragging events

function allowDrop(event){
    event.preventDefault();
}

// return a letter to the free letters table when it is dragged out of the message
function letterDraggedOutOfMessage(ev){
    event.preventDefault();
    var substitution = event.dataTransfer.getData("Text"); // value of the letter being dragged
    var original = reverseDict[substitution];
    if (freeLetters.indexOf(substitution) < 0 && isLetter(substitution)){ // only add the letter to the table if it is not already there
        freeLetters.push(substitution);
        freeLetters.sort();
    }
    delete dictionary[original];
    delete reverseDict[substitution];
    updateEssentialsSecondly(); // rebuild the free letters tables
}

// substitute accordinly when a freeLetter is dragged into a letter slot in the message display
function letterDraggedIntoMessage(event){
    event.preventDefault();
    var substitution = event.dataTransfer.getData("Text"); // value of the letter being dragged
    var original = event.currentTarget.getAttribute("value"); // cell that the letter is being dragged towards
    substitute(original, substitution);
}

function letterDragged(event){ // tell the recipient of this letter what letter is coming
    event.dataTransfer.setData("Text", event.currentTarget.getAttribute("value")); // send the substitution value
}

// returns a draggable div element to be inserted into the freeLettersDisplay
function newDraggableFreeLetter(letter){
    var letterDisplay = document.createElement("div");
    letterDisplay.textContent = letter;
    letterDisplay.setAttribute("value", letter);
    letterDisplay.setAttribute("class", "decryptedCharacter");
    letterDisplay.setAttribute("draggable", true);
    letterDisplay.setAttribute("ondragstart", "letterDragged(event);");
    return letterDisplay;
}

// returns a div element to display a letter and its frequency in the original crypted message
function newFrequency(letter, frequency){
    var display = document.createElement("div");
    display.setAttribute("class", "letterFrequency");
    display.textContent = letter + " = " + frequency;
    return display;
}

function highlightLetter(element){
    var toHighlight = getElementByAttributeValue("original", element.getAttribute("original"));
    for (var i = 0; i < toHighlight.length; i++){
        currElement = toHighlight[i];
        currElement.setAttribute("class", "highlightedLetter");
        currElement.setAttribute("id", "highlighted"); // tell the program which letter is highlighted
        currElement.setAttribute("onmouseleave", "unhighlightLetter(this);");
    }
    document.onkeypress = keyPressedWhileHighlighted;
}

// unhighlight the letter when the mouse exits
function unhighlightLetter(element){
    document.onkeypress = null;
    var toUnHighlight = getElementByAttributeValue("original", element.getAttribute("original"));
    for (var i = 0; i < toUnHighlight.length; i++){
        currElement = toUnHighlight[i];
        currElement.setAttribute("class", "decryptedCharacter");
        currElement.removeAttribute("id"); // tell the program which letter is highlighted
    }
}

// function to be called when a key is pressed while a letter is highlighted
function keyPressedWhileHighlighted(evt) { 
  evt = evt || window.event; 
  var charCode = evt.charCode || evt.keyCode;
  var substitution = String.fromCharCode(charCode).toUpperCase(); 
  var lettersToChange = document.getElementsByClassName("highlightedLetter");
  var original = lettersToChange[0].getAttribute("original").toUpperCase(); // only need the original from one of the elements 
  substitute(original, substitution);
};

// carries out a suggested substitution
function substitute(original, substitution){
    var currentSub = dictionary[original];
    var currentOriginal = reverseDict[substitution];
    delete dictionary[currentOriginal]; // the substituted value now stands for something different if at all
    delete reverseDict[currentSub]; // always removing the current substitution no matter what
    if (currentSub != null && freeLetters.indexOf(currentSub) < 0){ // only return the letter to the free letters table if it is not  already there
        freeLetters.push(currentSub);
        freeLetters.sort();
    }
    if (isLetter(substitution)){
        deleteFreeLetter(substitution);
        dictionary[original] = substitution;
        reverseDict[substitution] = original;
    }
    else{ // if any other character is typed, delete the dictionary entry
        delete dictionary[original]; 
    }
    updateEssentialsSecondly();
}

// resets all relevent data in the webpage
function reset(){
    freeLetters = ALPHABET.slice(0);
    dictionary = new Array();
    reverseDict = new Array();
    updateEssentialsSecondly();
}

// go to next cryptogram
function next(){
	initialize(ind);
}

// handles a letter's frequency value in the frequency table
function appendFrequency(letter){
    if (isLetter(letter)){ // only worry about characters that are letters
        if (frequencyTable[letter] != null){
            frequencyTable[letter] ++;
        }
        else{
            frequencyTable[letter] = 1;
        }
    }
}

// deletes a letter from the freeLetters array when it is substituted
function deleteFreeLetter(letter){
    var subInd = freeLetters.indexOf(letter);
    if (subInd >= 0){ // only delete an element that exists
        freeLetters.splice(subInd, 1); // remove the element from the free letters array
    }
}

// adds the reset button to the buttons panel
function addResetButton(){
    var buttons = document.getElementById("buttons");
    if (buttons.getElementsByTagName("button").length <= 1){
        buttons.appendChild(resetButton());
    }
}

// adds the next button to the buttons panel for new cryptogram
function addNextButton(){
    var buttons = document.getElementById("buttons");
    if (buttons.getElementsByTagName("button").length <= 1){
        buttons.appendChild(nextButton());
    }
}

// returns a reset button to be appended to the buttons panel
function resetButton(){
    var button = document.createElement("button");
    button.setAttribute("value", "Reset");
    button.setAttribute("id", "begin");
    button.setAttribute("class","btn btn-default btn-bg");
    button.setAttribute("onclick", "reset();");
    button.textContent = "Začni znova";
    return button;
}

// returns a next button to be appended to the buttons panel
function nextButton(){
    var button = document.createElement("button");
    button.setAttribute("value", "Next");
    button.setAttribute("id", "next");
    button.setAttribute("class","btn btn-default btn-bg");
    button.setAttribute("onclick", "next();");
    button.textContent = "Naslednji";
    return button;
}

// returns an element with a br tag
function newLine(){
    return document.createElement("br");
}

// returns an empty div element to represent a space in the messageDisplay
function newSpace(){
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("class", "letter");
    return letterDisplay;
}

// returns a list of all
function getElementByAttributeValue(attribute, value)
{
  var allElements = document.getElementsByTagName('*');
  var matches = new Array();
  for (var i = 0; i < allElements.length; i++){
    if (allElements[i].getAttribute(attribute) == value)
    {
      matches.push(allElements[i]);
    }
  }
    return matches;
}
var textS = ["William Herschel se je zapisal v zgodovino astronomije kot konstruktor\ndaljnogledov,kot neumoren opazovalec neba,prvi raziskovalec Rimske ceste in drugih galaksij.Kot mladenič je iz rodne Nemčije pobegnil v Anglijo.V začetku je bil godbenik,komponist in učitelj glasbe, kasneje pa je spremenil poklic in postal eden največjih astronomov.Bil je samouk v glasbi in v astronomiji. Gradil je vse večje daljnoglede,ki jih je pošiljal na vse strani.", "Kopernik je s svojim delom močno vplival na vso znanost in spremenil človekov pogled na svet. Živel in ustvarjal je na prehodu iz srednjega veka v novi vek, ko so fevdalno družbo pretresali pomembni dogodki. Znanje astronomije je bilo nujno potrebno pri trgovanju na dolgih morskih poteh. Misel o okrogli Zemlji je postajala splošno znana. Vsemu temu je sledila še  nova predstava o zgradbi vesolja. Do Kopernika so mislili, da je Zemlja nepremična, da leži v središču vesoljstva in da se vse zvezde, planeti, Sonce in Luna gibljejo okoli nje." ,"Rodil se je v revni kmečki družini v zasavskem hribovju. Kot matematika ga najbolj poznamo kot avtorja njegovih logaritmov, s katerimi so računali po svetu v znanosti, šolstvu in vsakdanjem življenju vse do množične uporabe elektronskih računalnikov. Kot profesor matematike na šoli je napisal matematična in fizikalna učbenika. Čeprav je Vega s svojimi logaritmi zaslovel predvsem kot matematik, je bil večji del njegovih razprav in učbenikov posvečenih fiziki. Njegova dela v fiziki zajemajo vsa področja mehanike, predvsem teorijo gravitacije in z njo povezano astronomijo.", "Ideje o dveh gibanjih Zemlje, o vrtenju okoli njene osi in kroženju okoli Sonca, so izrekli že nekateri filozofi starega veka. Te misli so utonile v pozabo. Povzel jih je Kopernik, ki je postavil Sonce v središče našega planetnega sistema, Zemljo pa premaknil v vrsto planetov, ki se gibljejo okoli Sonca. Kopernikov nauk je pomenil prelom s številnimi tradicijami in dotedanjim svetovnim nazorom. Ves srednjeveški svet se je naslanjal na nespremenljivost obstoječega reda. Le drzni ljudje so si upali izreči misel o gibanju Zemlje.", "William Herschel se je zapisal v zgodovino astronomije kot konstruktor daljnogledov, kot neumoren opazovalec neba, prvi raziskovalec Rimske ceste in drugih galaksij. Kot mladenič je iz rodne Nemčije pobegnil v Anglijo. V začetku je bil godbenik, komponist in učitelj glasbe, kasneje pa je spremenil poklic in postal eden največjih astronomov. Bil je samouk v glasbi in v astronomiji. Gradil je vse večje daljnoglede, ki jih je pošiljal na vse strani.", "Kolmogorov se je ukvarjal s širokim poljem matematike. Opredelil je matematične osnove verjetnostne teorije in algoritmične teorije naključnosti ter prispeval ključne prispevke k osnovam statistčne mehanike, stohastičnih procesov, teorije informacije, mehanike tekočin in nelinearne dinamike. Vsa ta področja in njihovi odnosi so osnova za kompleksne sisteme, kot jih danes preučujejo.", "S svojimi daljnogledi je štirikrat skrbno pregledal vse nebo, ki ga je lahko videl iz Anglije. Pri tem je našel nov planet ­ Uran. Glavne raziskave je posvetil zvezdam. S svojimi daljnogledi je lahko prodrl globoko v vesolje. Pri tem je ugotovil, da Osončje ne miruje.", "V vsakdanjem življenju imenujemo paradoks nekaj, kar je sicer resnično, pa vendar v nasprotju z našimi predstavami in izkušnjami. Sklepanje iz navidezno pravilnih dejstev, ki nas privedejo do nesmiselnega rezultata, ravno tako imenujemo paradoks.", "Kako znan je bil ta priimek v svetu, pripoveduje naslednji dogodek. Ko je moral nekoč Herschel na meji pokazati potni list, je carinik začuden vzkliknil: \"Herschel, to vendar ni priimek, to je zvezda!\"" ];
/*
 * isLetter - determines whether a letter is between A and Z 
 * Note that every letter passed as an argument will be changed to uppercase
 */
function isLetter(letter){
    return (letter.charCodeAt(0) < 91 && letter.charCodeAt(0) >= 65 || letter === 'Č' || letter === 'Š' || letter === 'Ž');
}

function code(letter){
    return letter.charCodeAt(0);
}

