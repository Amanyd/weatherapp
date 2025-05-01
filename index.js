const userTab = document.querySelector(".userweather");
const searchTab = document.querySelector(".searchweather");
const userContainer = document.querySelector(".weathercontainer");
const grantAccessContainer = document.querySelector(".grantlocation");
const searchForm = document.querySelector(".formcontainer");
const loadingScreen = document.querySelector(".loadingcontainer");
const userInfoContainer = document.querySelector(".infocontainer");

let currentTab = userTab;
const apiKey = "c6dceb5cdb42899a81b6a7955cb33edf";
currentTab.classList.add("current");

getfromSessionStorage();
userTab.addEventListener("click", () => {
    switchTab(userTab);
});
searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});
function switchTab(clickedTab) {
    if (clickedTab !== currentTab) {
        currentTab.classList.remove("current");
        currentTab = clickedTab;
        currentTab.classList.add("current");

        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } 
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.add("active");
            getfromSessionStorage();
        }
    }
        
};
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
};
async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");
    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        if (response.ok) {
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } else {
            alert(`City not found: "${city}". Please check the name and try again.`);
        }
        
    }
    catch (error) {
        console.log(error);
        loadingScreen.classList.remove("active");
        alert("Error fetching weather data. Please try again later.");
    }
}
function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector(".cityname");
    const countryIcon = document.querySelector(".countryicon");
    const weatherDescription = document.querySelector(".weatherdesc");
    const weatherIcon = document.querySelector(".weathericon");
    const temp = document.querySelector(".temperature");
    const humidity = document.querySelector(".humidity");
    const windSpeed = document.querySelector(".windspeed");
    const cloudiness = document.querySelector(".clouds");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherDescription.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${Math.round(weatherInfo?.main?.temp)}°C`;
    windSpeed.innerText = `${Math.round(weatherInfo?.wind?.speed)} m/s`;
    humidity.innerText = `${Math.round(weatherInfo?.main?.humidity)}%`;
    cloudiness.innerText = `${Math.round(weatherInfo?.clouds?.all)}%`;
}
const grantAccessButton = document.querySelector(".grantaccess");
grantAccessButton.addEventListener("click", getlocation);
function getlocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
    else {
        alert("Geolocation is not supported by this browser.");
        fetchIPGeolocation();
    }
}
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("Location access denied. Please enable it in browser settings.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}
function fetchIPGeolocation() {
    fetch('https://ipinfo.io/json?token=yourToken')  // IP-based service (replace with your token)
        .then(response => response.json())
        .then(data => {
            const [lat, lon] = data.loc.split(',');
            console.log(`IP-based location: Lat: ${lat}, Lon: ${lon}`);
            // Call your weather fetch method using the lat/lon
            fetchUserWeatherInfo({ lat, lon });
        })
        .catch(error => console.log("IP Geolocation failed:", error));
}
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
const searchInput = document.querySelector(".searchinput");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (searchInput.value === "") return;
    fetchSearchWeatherInfo(searchInput.value);
});
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        if (response.ok) {
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } else {
            alert(`City not found: "${city}". Please check the name and try again.`);
        }
    } catch (error) {
        console.log(error);
        loadingScreen.classList.remove("active");
        alert("Error fetching weather data. Please try again later.");
    }
}    
    