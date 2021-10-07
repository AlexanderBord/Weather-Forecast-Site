
(function () { //global namespace

var placeList = []; //hold list of places
var placesId = []; //hold id of places
var index = 0
var currentPlace = "";

//hold place - name, latitude, longitude
class Place {
    constructor(pname, lat, lon)
    {
        this.pname = pname;
        this.lat = lat;
        this.lon = lon;
    }
}

//load weather function - triggers ajax call and fetch data , handling response and reject
function loadWeather(url, animaImg) {
    fetch(url)
        .then(function (response) {
                //handle the error
            if (response.status !== 200) {
                document.querySelector("#data").innerHTML = 'Looks like there was a problem. Status Code: ' +
                    response.status;
                return;
            }
                //handle response
                response.json().then(function (data) {
                    getData(data, animaImg);
                });
            }
        )
        .catch(function (err) { //handle error
            let msg = document.querySelector("#msg");//modal dialog
            msg.innerHTML = err;
            $('#exampleModal').modal('show'); //show error
            console.log("Weather forecast api service is not available right now, please try again later. server: ", err);
        });
}

//get data function, receive json object and build information box from it
function getData(data, animaImg) {

    buildInfoTable(data);
    buildInfoToday(data);
    animaImg.style.display = "none"; //turn off animation
}

//build today information box, exercise request wind speed = 1 => dont show, only available at this box
function buildInfoToday(data) {

    let weatherDiv = document.querySelector("#weather"); //get required data from returned json object
    const weather = data.dataseries[0].weather;
    const windSpeed = data.dataseries[0].wind10m_max;
    const minTemp = data.dataseries[0].temp2m.min;
    const maxTemp = data.dataseries[0].temp2m.max;

    let hr = document.createElement("h3"); //building required headers
    hr.innerHTML = '<u>Today`s Weather</u>';

    let wr = document.createElement("h5");
    wr.innerHTML = 'Weather: ' + weather;

    let ws = document.createElement("h5");
    ws.innerHTML = 'Wind speed: ' + windSpeed;

    let minT = document.createElement("h5");
    minT.innerHTML = 'Minimum temperature: ' + minTemp;

    let maxT = document.createElement("h5");
    maxT.innerHTML = 'Maximum temperature: ' + maxTemp;

    weatherDiv.appendChild(hr);
    weatherDiv.appendChild(wr);
    weatherDiv.appendChild(minT);
    weatherDiv.appendChild(maxT);

    if(ws !== 1)   //ex request, wind speed == 1 => no need to present wind speed
    {
        weatherDiv.appendChild(ws);
    }
    document.querySelector("#weather").style.backgroundColor = "#aed9ec";
}

//build information table function
function buildInfoTable(data) {

    const info = ["Minimum Temperature", "Maximum Temperature", "Weather", "Wind Speed"]; //required fields
    var theTable = document.getElementById("table").getElementsByTagName('tbody')[0];

    for(let i = 0; i < data.dataseries.length; i++) // build date column
    {
        let date = new Date();
        date.setDate(new Date().getDate() + i);
        theTable.rows[i+1].cells[0].innerHTML = date.toLocaleDateString();
    }

    for(let i = 0; i < info.length; i++) // build info row
    {
        theTable.rows[0].cells[i+1].innerHTML = "<b>" + info[i] + "</b>";
    }

    let row = 1, cell = 1;

    for(let i = 0; i < data.dataseries.length; i++) // build table
    {
        const minTemp = data.dataseries[i].temp2m.min;
        const maxTemp = data.dataseries[i].temp2m.max;
        const weather = data.dataseries[i].weather;
        const windSpeed = data.dataseries[i].wind10m_max;

        theTable.rows[row].cells[cell].innerHTML = minTemp;
        theTable.rows[row].cells[cell+1].innerHTML = maxTemp;
        theTable.rows[row].cells[cell+2].innerHTML = weather;
        theTable.rows[row].cells[cell+3].innerHTML = windSpeed;
        row++;
    }
    document.getElementById("inf").style.display = "block";
}

//will build the entered place, first it checks if fields are valid then it push them into Place class list
function buildPlace(){

    var pl = document.getElementById("place").value;
    var la = document.getElementById("lat").value;
    var lo = document.getElementById("lon").value;

    var fieldValRes = [false,false,false,false,false]; // five fields five checks

    let isOk = validationResult(fieldValRes,pl,la,lo);

    if(isOk){                           //if validation passed
        const temp = new Place(pl,la,lo); //create Place
        placeList.push(temp);

        let data = document.getElementById("data");
        let option = document.createElement("a");

        option.innerHTML = "<button class='btn btn-info'> </button>" + "</br>";
        option.firstChild.textContent = temp.pname;

        let id = "a" + index;                             //give names to our children (places)
        option.children[0].setAttribute("id",id);
        placesId.push(id);
        index++;

        data.appendChild(option);
        addCityToDb(temp);
    }
}

function addCityToDb(place){

    const name = place.pname;
    const longitude = place.lon;
    const latitude = place.lat;

    const data = {place: name, lon:longitude, lat:latitude};

    fetch('/api/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(status)
        .then(response => response.text())
        .then(data => {
            console.log('Request succeeded with JSON response', data);
        })
        .catch((error) => {
            console.log(error);
        });
}

//will get the validation result from the validation namespace, handle errors with modals
function validationResult(fieldValRes,pl,la,lo) {

    const errMsg = ["Place field is empty","Latitude not in range (-90, +90)","Longitude not in range (-180, +180)"
                    ,"Latitude field is empty", "Longitude field is empty"];
    let msg = document.querySelector("#msg");//modal dialog

    if(validation.placeVali(pl)) //is empty validation, checks if name field is empty
        fieldValRes[0] = true;
    else
    {
        msg.innerHTML = errMsg[0];  //not passed
        $('#exampleModal').modal('show'); //modal dialog
    }

    if(validation.placeVali(la)) //is empty validation, checks if latitude field is empty
        fieldValRes[3] = true;
    else
    {
        msg.innerHTML = errMsg[3];  //not passed
        $('#exampleModal').modal('show'); //modal dialog
    }

    if(validation.placeVali(lo)) //is empty validation, checks if longitude field is empty
        fieldValRes[4] = true;
    else
    {
        msg.innerHTML = errMsg[4];  //not passed
        $('#exampleModal').modal('show'); //modal dialog
    }

    if(validation.latVali(la)) //range validation
        fieldValRes[1] = true;
    else{
        msg.innerHTML = errMsg[1];
        $('#exampleModal').modal('show');
    }

    if(validation.lonVali(lo)) //range validation
        fieldValRes[2] = true;
    else
    {
        msg.innerHTML = errMsg[2];
        $('#exampleModal').modal('show');
    }

    if(fieldValRes.every(Boolean)) { //if all tests were passed
        return true
    }
    return false;
}

//display weather function, displays image and weather data from 7timer api
function displayWeather(){

    const infoNode = document.getElementById("weather"); //remove old weather info
    while (infoNode.firstChild) {
        infoNode.removeChild(infoNode.lastChild);
    }
    infoNode.style.visibility = "visible";

    document.getElementById("inf").style.visibility = "block";

    var animaImg = new Image(); //apply animation
    animaImg.src = "images/loadingAnima.gif";
    animaImg.width = 100;

    document.querySelector("#animaGif").appendChild(animaImg);

    let imgDiv = document.getElementById("image");
    imgDiv.innerHTML = '';

        for(let i=0; i < placesId.length; i++)  //check which place was selected in list then calls the ajax function,
        {                                      //defines api urls
            if(currentPlace === placesId[i]){
                const urlWeather = `http://www.7timer.info/bin/api.pl?lon=${placeList[i].lon}&lat=${placeList[i].lat}&product=civillight&output=json`;
                const urlImage = `http://www.7timer.info/bin/astro.php? lon=${placeList[i].lon}&lat=${placeList[i].lat}&ac=0&lang=en&unit=metric&output=internal&tzshift=0`;
                const altImg = 'images/defaultImage.png';

                let img = new Image(); //astro image
                img.src = urlImage;
                img.onerror = noImg;

                function noImg () {  // load alternate image and show error description:
                    img.src = altImg;
                    let msg = document.querySelector("#msg");//modal dialog
                    msg.innerHTML = "Cannot connect to astro 7timer, picture unavailable";
                    $('#exampleModal').modal('show');
                    console.log("Weather forecast astro service is not available right now, please try again later.");
                }

                imgDiv.appendChild(img);
                loadWeather(urlWeather, animaImg); //ajax function
                break;
            }
        }
}

//build massage function, builds delete modal massage
function buildMsg(){
    let askBtn = document.getElementById("ask");
    askBtn.style.visibility = "visible";

    let msg = document.querySelector("#msg");//modal dialog
    msg.innerHTML = "Are you sure you want to delete?";

    $('#exampleModal').modal('show');
}


//delete weather function, removes all unnecessary data from screen view
function deleteWeather(){

    let place = document.getElementById(currentPlace);
    const location = place.innerText;

    place.parentElement.remove(); //remove place option from dropdown list

    var temp = document.getElementById("image");
    if(temp.children.length > 0) //avoid exception when pic deleted before displayed
    {
        temp.children[0].remove();
    }

    let infoNode = document.getElementById("weather"); //remove weather info
    while (infoNode.firstChild) {
        infoNode.removeChild(infoNode.lastChild);
    }
    infoNode.style.visibility = "hidden";
    document.getElementById("buttons").style.display = "none";


    let askBtn = document.getElementById("ask");
    askBtn.style.visibility = "hidden";

    document.getElementById("inf").style.display = "none"; //remove table
    deletePlaceDb(location);
}

//delete place from data base
function deletePlaceDb(location){

    fetch(`/api/delete/${location}`, {method: 'DELETE'})
        .then(status)
        .then((response)=> {return response.text()})
        .then(function(response) {
            console.log('Request succeeded with JSON response', response);

        }).catch(function(error) {
        console.log(error);
    });
}

//validation namespace, will check all required fields
var validation = (function(){

    function isEmpty(place){ //checks if place is empty
        return place !== "";
    }

    function latInRange(latitude){  //checks if latitude in range
        return (latitude > -90 && latitude < 90)
    }

    function lonInRange(longitude){ //checks if longitude in range
        return (longitude > -180 && longitude < 180)
    }

    return {
        placeVali: isEmpty,
        latVali: latInRange,
        lonVali: lonInRange
    }
})();

//build buttons function, will build a current Place buttons(display, delete)
function buildBtns(event)
{
    if(event.target.type === "submit") //target the button
    {
        for(let i=0; i < placesId.length; i++) //find current place
        {
            if(event.target.id === placesId[i]){

                let btns = document.getElementById("buttons");
                let btnHeader = document.getElementById("btnHeader");

                btnHeader.innerHTML = '<u> Location:</u>  ' + placeList[i].pname;
                btns.appendChild(btnHeader);
                btns.style.display = "block";
                currentPlace = placesId[i];
            }
        }
    }
}

//function off button, turns to hidden mode the modal dialog ("are you sure") button
function offBtn()
{
    let askBtn = document.getElementById("ask");
    askBtn.style.visibility = "hidden";
}

//reset list function
function resetList() {

    let list = document.getElementById("data"); //remove weather info
    while (list.firstChild) {
        list.removeChild(list.lastChild);
    }

    var temp = document.getElementById("image");
    if(temp.children.length > 0) //avoid exception when pic deleted before displayed
    {
        temp.children[0].remove();
    }

    let infoNode = document.getElementById("weather"); //remove weather info
    while (infoNode.firstChild) {
        infoNode.removeChild(infoNode.lastChild);
    }
    infoNode.style.visibility = "hidden";
    document.getElementById("buttons").style.display = "none";


    let askBtn = document.getElementById("ask");
    askBtn.style.visibility = "hidden";

    document.getElementById("inf").style.display = "none"; //remove table

    fetch('/api/resetlist/', {method: 'DELETE'})
        .then(status)
        .then((response)=> {return response.text()})
        .then(function(response) {
            console.log('Request succeeded with JSON response', response);

        }).catch(function(error) {
        console.log(error);
    });
}

//fetch list function, then it will plant the resource into dropdown list
function fetchList(){

    fetch('/api/getlist/', {method: 'POST'})
        .then(status)
        .then((response)=> {return response.json()})
        .then(function(response) {
            console.log('Request succeeded with JSON response', response);

            for(let i = 0 ;i < response.length; i++)
            {
                const temp = new Place(response[i].place,response[i].latitude,response[i].longitude); //create Place
                placeList.push(temp);

                let data = document.getElementById("data");
                let option = document.createElement("a");

                option.innerHTML = "<button class='btn btn-info'> </button>" + "</br>";
                option.firstChild.textContent = temp.pname;

                let id = "a" + index;                             //give names to our children (places)
                option.children[0].setAttribute("id",id);
                placesId.push(id);
                index++;
                data.appendChild(option);
            }

        }).catch(function(error) {
        console.log('Request failed', error);
    });
}

//status response function
function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        console.log("Looks like there was a problem. Status Code: " + response.status);
        location.href = "/signin";
    }
}

//listeners
document.addEventListener('DOMContentLoaded', function ()
{
    document.body.style.backgroundImage = "url('images/background.jpg')"; //background image
    document.body.style.backgroundSize = "100%"

    document.getElementById("btn").addEventListener('click', buildPlace);
    document.getElementById("display").addEventListener('click', displayWeather);
    document.getElementById("delete").addEventListener('click', buildMsg);
    document.getElementById("data").addEventListener('click',buildBtns);
    document.getElementById("reset").addEventListener('click',resetList);
    document.querySelector("#ask").addEventListener('click', deleteWeather);
    document.querySelector("#close").addEventListener('click', offBtn);

    fetchList();
});
    //lon - 35.213618 lat - 31.771959s
})();
