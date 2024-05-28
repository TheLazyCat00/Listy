const version = 12;

if(localStorage.getItem("version") !== `${version}`){
	localStorage.clear();
	localStorage.setItem("version", version);
}

let main = document.getElementById("main");

main.innerHTML = localStorage.getItem("page") || main.innerHTML;

main = document.getElementById("main");
const mainTextInput = document.getElementById("mainTextInput");
const beginning = document.getElementById("beginning");
const topBar = document.getElementById("topBar");
const html = document.getElementById("html");
const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const longText = document.getElementById("longText");
const longTextInput = document.getElementById("longTextInput");
const longTextButton = document.getElementById("longTextButton");
let isMaximized = false;

let isOnMain = true;
let activeElement;

let lastOpened;
if(parseInt(localStorage.getItem("lastOpened")) !== undefined){
	lastOpened = parseInt(localStorage.getItem("lastOpened"));
}
else{
	lastOpened = undefined;
}

let isToggled;
if(localStorage.getItem("isToggled")){
	isToggled = localStorage.getItem("isToggled") == "true";
}
else{
	isToggled = false;
}

let MyDate = new Date();

function getDate(){
	MyDate = new Date();
	return MyDate;
}

function getFormatedDate(currentDate) {
    let year = currentDate.getFullYear();
    // JavaScript months are zero-based, so we add 1 to get the correct month
    let month = currentDate.getMonth() + 1;
    let day = currentDate.getDate();

    // Convert month and day to string and pad with leading zeros if necessary
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    // Concatenate the year, month, and day with hyphens to get the desired format
    let formattedDate = year + '-' + month + '-' + day;

    return formattedDate;
}

function getDifferenceInDays(further, closer){
	let differenceMs = further - closer;
	return differenceMs/(1000*60*60*24);
}

function splitStringIntoLists(str) {
    let regex = /\[(.*?)]/g;
	let testRegex = /^\d+\.\d+$|^\d+\.\s\d+$/;
    let matches = str.match(regex);
    let date;
	let url;
	let weekDays;
	let cycle;
	let urlMatch;

    if (matches) {
        matches.forEach((match, index) => {
            let values = match.substring(1, match.length - 1).split(',').map(val => val.trim());
			if(testRegex.test(values[0])){
				date = [values[0].split(".").map(val => parseFloat(val.trim()))][0];
			}
			else if(values[0] == "weekDays"){
				weekDays = values[1];
			}
			else if(values[0] == "cycle"){
				cycle = true;
			}
			else{
				url = [values][0];
				if(!testRegex.test(matches)){
					urlMatch = matches[index];
				}
			}
        });
    	return {date, url, urlMatch, weekDays, cycle};
	}
}

function replaceUrl(element){
    let data = splitStringIntoLists(element);
    let newElement = element;
    if (data) {
        if (data.url && data.urlMatch) {
            let replace = data.urlMatch;
            let replacementString = `<a href="${data.url[0]}">${data.url[1] || data.url[0]}</a>`;
            newElement = newElement.replace(replace, replacementString);
        }
    }
    return newElement;
}

function getLoadingBar(thisFinishDate){
	let finishDate = new Date(thisFinishDate);
	if (getDifferenceInDays(finishDate, getDate()) < 0) {
		finishDate.setFullYear(finishDate.getFullYear() + 1);
	}
	let timeLeft = getDifferenceInDays(finishDate, getDate());
	let proportional = 100;
	let firstColor = "orange";
	let secondColor = "aqua";
	if (timeLeft <= 7) {
		proportional = timeLeft/7*100;
	}
	if (timeLeft <= 1) {
		firstColor = "lightcoral";
	}
    return `
		background-image: 
			linear-gradient(to right, rgba(0, 0, 0, 0.1) calc(0.4*var(--myLength)), transparent calc(0.4*var(--myLength))), 
			linear-gradient(90deg, ${firstColor} 0%, ${100 - proportional}%, ${secondColor} ${100 - proportional}%, ${secondColor} 100%);
		background-size: calc((100% + 0.4*var(--myLength) + 1px)/7) calc(5*var(--myLength)), cover;
		background-repeat: repeat, no-repeat;
		background-position: calc(-0.4*var(--myLength) - 1px) 0, 0 0;
	`;
}

function getLoadingBarGreen(thisFinishDate){
	let finishDate = new Date(thisFinishDate);
	if (getDifferenceInDays(finishDate, getDate()) < 0) {
		finishDate.setFullYear(finishDate.getFullYear() + 1);
	}
	let timeLeft = getDifferenceInDays(finishDate, getDate());
	let proportional = 100;
	let firstColor = "orange";
	let secondColor = "greenyellow";
	if (timeLeft <= 7) {
		proportional = timeLeft/7*100;
	}
	if (timeLeft <= 1) {
		firstColor = "lightcoral";
	}
    return `
		background-image: 
			linear-gradient(to right, rgba(0, 0, 0, 0.1) calc(0.4*var(--myLength)), transparent calc(0.4*var(--myLength))), 
			linear-gradient(90deg, ${firstColor} 0%, ${100 - proportional}%, ${secondColor} ${100 - proportional}%, ${secondColor} 100%);
		background-size: calc((100% + 0.4*var(--myLength) + 1px)/7) calc(5*var(--myLength)), cover;
		background-repeat: repeat, no-repeat;
		background-position: calc(-0.4*var(--myLength) - 1px) 0, 0 0;
	`;
}

function addTime(element) {
    let data = splitStringIntoLists(element);
	let settings = `class="top"`;
    if (data && data.date) {
        let year = getDate().getFullYear();
        let finishDate = `${year}-${data.date[1]}-${data.date[0]}`;
        let style = getLoadingBar(finishDate);
        settings += `data-time="${year}-${data.date[1]}-${data.date[0]}" style="${style}"`;
    }
	if(data && data.cycle){
		weekDays.forEach(day => {
			settings += ` data-${day}="true"`;
		});
		return settings;
	}
	if(data && data.weekDays){
		for(let i = 0; i < 7; i++){
			if(data.weekDays.includes(`${i}`)){
				settings += ` data-${weekDays[i]}="true"`;
			}
		}
	}
	return settings;
}

function updateStyleTime(element){
	let finishDate = new Date(element.getAttribute("--data-time"));
	let timeLeft = getDifferenceInDays(finishDate, getDate());
	let proportional = 100;
	if(time <= 7){
		proportional = timeLeft/7*100;
	}
	element.style.backgroundSize = `${100-proportional}% 100%, ${proportional}% 100%`;
}

function update(){
	localStorage.setItem("page", main.innerHTML);
	localStorage.setItem("isToggled", isToggled);
	localStorage.setItem("lastOpened", getDate().getDay() - 1);
}

function startAdd(){
	if(mainTextInput.value.trim() !== ""){
		let element = `
		<div class="bar">
			<div data-isblue="true" ${addTime(mainTextInput.value)}>
				<p>${replaceUrl(mainTextInput.value)}</p>
				<button class="delete" onclick="openText(this)" data-text=""><img src="https://cdn.icon-icons.com/icons2/629/PNG/512/text-document-outlined-interface-symbol-with-lines_icon-icons.com_57757.png"></button>
				<button class="done" onclick="done(this)"><img src="https://static-00.iconduck.com/assets.00/checkmark-icon-512x426-8re0u9li.png"></button>
				<button class="delete" onclick="deleteThis(this)"><img height="4vh" src="https://static-00.iconduck.com/assets.00/trash-bin-icon-2048x2048-duca73jv.png"></button>
				<button class="expand" onclick="expand(this)"><p><</p></button>
			</div>
			<div class="field" style="height: 0;">
				<div class="sub">
					<input type="text" oninput="hasFile(this)" spellcheck="false">
					<button onclick="add(this)">+</button>
				</div>
			</div>
		</div>`;
		beginning.innerHTML += element;
		update();
		mainTextInput.value = "";
	}
}

function expand(element){
	let symbol = element.querySelector("p");
	let parent = element.parentElement;
	let list = parent.nextElementSibling;
	if(symbol.style.transform == "rotate(-90deg)"){
		symbol.style.transform = "rotate(0deg)";
		list.style.height = "0";
	}
	else{
		symbol.style.transform = "rotate(-90deg)";
		list.style.height = "";
	}
}

function add(element){
	let field = element.parentElement.parentElement;
	let input = element.previousElementSibling;
	if(input.value.trim() !== ""){
		let newElement = `
		<div class="bar">
			<div data-isblue="true" ${addTime(input.value)}>
				<p>${replaceUrl(input.value)}</p>
				<button class="delete" onclick="openText(this)" data-text=""><img src="https://cdn.icon-icons.com/icons2/629/PNG/512/text-document-outlined-interface-symbol-with-lines_icon-icons.com_57757.png"></button>
				<button class="done" onclick="done(this)"><img src="https://static-00.iconduck.com/assets.00/checkmark-icon-512x426-8re0u9li.png"></button>
				<button class="delete" onclick="deleteThis(this)"><img height="4vh" src="https://static-00.iconduck.com/assets.00/trash-bin-icon-2048x2048-duca73jv.png"></button>
				<button class="expand" onclick="expand(this)"><p><</p></button>
			</div>
			<div class="field" style="height: 0;">
				<div class="sub">
					<input type="text" oninput="hasFile(this)" spellcheck="false">
					<button onclick="add(this)">+</button>
				</div>
			</div>
		</div>`;
		field.innerHTML += newElement;
	}
	update();
}

function done(element, parent){
	let task = parent||element.parentElement;
	if(task.hasAttribute('data-time')){
		if(task.getAttribute("data-isblue") == "true"){
			task.style = getLoadingBarGreen(task.getAttribute('data-time'));
			task.setAttribute("data-isblue", "false");
		}
		else{
			task.style = getLoadingBar(task.getAttribute('data-time'));
			task.setAttribute("data-isblue", "true");
		}
	}
	else{
		if(task.getAttribute("data-isblue") == "true"){
			task.setAttribute("data-isblue", "false");
			task.style.backgroundColor = "greenyellow";
		}
		else{
			task.setAttribute("data-isblue", "true");
			task.style.backgroundColor = "aqua";
		}
	}
	updateToggle();
	update();
}

function deleteThis(element){
	let task = element.parentElement.parentElement;
	task.remove();
	update();
}

function maximizeMyApp(){
	if(isMaximized){
		document.exitFullscreen();
	}
	else{
		document.documentElement.requestFullscreen();
	}
	isMaximized = !isMaximized;
}

function pixelsInOneCentimeter(multiplier) {
    // Create a dummy element with 1cm width
    var dummyElement = document.createElement('div');
    dummyElement.style.width = '1cm';
    dummyElement.style.height = '1cm';
    dummyElement.style.position = 'absolute';
    dummyElement.style.left = '-1000cm'; // Position it far off-screen
    document.body.appendChild(dummyElement);

    // Measure the offsetWidth (which should be in pixels)
    var pixels = dummyElement.offsetWidth;

    // Remove the dummy element from the DOM
    document.body.removeChild(dummyElement);

    return pixels*multiplier;
}

function pixelsInOneViewportHeight(multiplier) {
    // Create a dummy element with 100vh height
    var dummyElement = document.createElement('div');
    dummyElement.style.height = '100vh';
    dummyElement.style.width = '1px'; // Set width to ensure it takes full viewport width
    dummyElement.style.position = 'absolute';
    dummyElement.style.top = '-1000vh'; // Position it far off-screen
    document.body.appendChild(dummyElement);

    // Measure the offsetHeight (which should be in pixels)
    var pixels = dummyElement.offsetHeight/100;

    // Remove the dummy element from the DOM
    document.body.removeChild(dummyElement);

    return pixels*multiplier;
}

function changeValue() {
	if(pixelsInOneCentimeter(0.15) < pixelsInOneViewportHeight(1)){
		document.documentElement.style.setProperty('--myLength', `0.15cm`);
	}
	else{
		document.documentElement.style.setProperty('--myLength', '1vh');
	}
}

function updateToggle(){
	let elementsIsGreen = document.querySelectorAll('[data-isblue="false"]');
	elementsIsGreen = Array.from(elementsIsGreen);
	if(isToggled === false){
		elementsIsGreen.forEach(element => {
			element.parentElement.style.display = "flex";
		});
	}
	else{
		elementsIsGreen.forEach(element => {
			element.parentElement.style.display = "none";
		});
	}
}

function toggleView(){
	if(isToggled){
		document.getElementById("toggleView").style.backgroundColor = "white";
	}
	else{
		document.getElementById("toggleView").style.backgroundColor = "greenyellow";
	}
	isToggled = !isToggled;
	updateToggle();
}

function resetDone(){
	if((lastOpened + 2)%6 === getDate().getDay()){
		let activeElements = document.querySelectorAll(`[data-${weekDays[getDate().getDay() - 1]}]`);
		activeElements = Array.from(activeElements);
		activeElements.forEach(element => {
			if(element.getAttribute("data-isblue") === "false"){
				done(undefined, element);
			}
		});
	}
}

function hasFile(element){
	if(element.value.endsWith("[file")){
		window.electronAPI.openFileDialog();
		window.electronAPI.selectedFile().then(path => {
			element.value += ":///" + path;
		});
	}
}

function openText(element){
	longTextInput.value = element.getAttribute("data-text");
	main.style.display = "none";
	longText.style.display = "flex";
	activeElement = element;
	isOnMain = false;
}

function closeText(){
	updateText();
	longTextInput.value = "";
	longText.style.display = "none";
	main.style.display = "flex";
	isOnMain = true;
}

function updateText(){
	activeElement.setAttribute("data-text", longTextInput.value);
	if(longTextInput.value.trim() !== ""){
		activeElement.classList.add("yellowButton");
	}
	else{
		activeElement.classList.remove("yellowButton");
	}
	update();
}

function leaveTopBar(){
	if(isMaximized){
		topBar.style.display = "none";
		longTextButton.style.display = "none";
	}
}

function enterTopBar(){
	if(isMaximized){
		topBar.style.display = "flex";
		longTextButton.style.display = "";
	}
}

document.addEventListener("keydown", (event) => {
	let activeElement = document.activeElement;
	if(activeElement.tagName == "INPUT" && event.key == "Enter"){
		if(activeElement.id == "mainTextInput"){
			startAdd();
		}
		else{
			let button = activeElement.nextElementSibling;
			add(button);
		}
	}
});

changeValue();

let elementsWithDataTime = document.querySelectorAll('[data-time]');
elementsWithDataTime = Array.from(elementsWithDataTime);
elementsWithDataTime.forEach((element) => {
	if(element.getAttribute("data-isblue") != "false"){
		element.style = getLoadingBar(element.getAttribute("data-time"));
	}
	else{
		element.style = getLoadingBarGreen(element.getAttribute("data-time"));
	}
});

resetDone();

setInterval(() => {
	elementsWithDataTime = document.querySelectorAll('[data-time]');
	elementsWithDataTime = Array.from(elementsWithDataTime);
	elementsWithDataTime.forEach((element) => {
		if(element.getAttribute("data-isblue") != "false"){
			element.style.background = getLoadingBar(element.getAttribute("data-time"));
		}
		else{
			element.style.background = getLoadingBarGreen(element.getAttribute("data-time"));
		}
	});
}, 60000);