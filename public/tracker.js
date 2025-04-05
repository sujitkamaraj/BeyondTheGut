const symptoms = [
    "Abdominal Pain",
    "Bloating or Gas",
    "Hard Passage of Stool",
    "Loose Passage of Stool",
    "Infrequent Bowel Movements",
    "Frequent Bowel Movements",
    //"Bowel Urgency",
    "Anxiety",
    "Mood Swings",
    //"Anger",
    "Cramps",
    "Body Weakness",
    "Headaches",
    //"Fever"
];

const timesOfDay = ["Morning", "Afternoon", "Evening", "Night"];
const severities = ["Not at all", "Slight", "Mild", "Moderate", "Severe", "Very Severe", "Extreme"];
const causes = ["IBS", "Menstrual", "Both", "Not Sure", "Symptom Not Felt"];

// Get the API URL based on the current environment
function getApiUrl() {
    // Check if we're in production (Heroku) or local development
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000' 
        : '';  // Empty string means use relative URLs in production
}

// Ensure user is logged in
if (!localStorage.getItem("token")) {
    window.location.href = "index.html";
}

// Populate Symptoms Section
const symptomsContainer = document.getElementById("symptoms-container");

const symptomDefinitions = {
    "Abdominal Pain": "Pain or discomfort in the stomach or abdominal area.",
    "Bloating or Gas": "A sensation of fullness or swelling in the stomach, often accompanied by excessive gas.",
    "Hard Passage of Stool": "Difficulty passing stool due to its hard or dry consistency.",
    "Loose Passage of Stool": "Frequent, watery, or unformed bowel movements.",
    "Infrequent Bowel Movements": "Going longer than usual between bowel movements.",
    "Frequent Bowel Movements": "Experiencing bowel movements more often than usual.",
    "Bowel Urgency": "A sudden and strong need to have a bowel movement, often difficult to control.",
    "Anxiety": "Feelings of nervousness, worry, or unease, often accompanied by physical symptoms like a racing heart.",
    "Mood Swings": "Rapid and unpredictable changes in emotional state, ranging from happiness to sadness or irritability.",
    "Anger": "Intense feelings of frustration, irritation, or hostility that may be difficult to control.",
    "Cramps": "Sudden, involuntary muscle contractions that cause pain, often occurring in the abdomen or legs.",
    "Body Weakness": "A lack of strength or energy in the muscles.",
    "Headaches": "A persistent pain or discomfort in the head.",
    "Fever": "An increase in body temperature above the normal range."
};


symptoms.forEach(symptom => {
    let symptomDiv = document.createElement("div");
    symptomDiv.classList.add("symptom-entry");

    // Create info icon
    let infoIcon = document.createElement("span");
    infoIcon.classList.add("info-icon");
    infoIcon.innerHTML = "ℹ"; // Unicode for "i" icon

    // Create tooltip span
    let tooltip = document.createElement("span");
    tooltip.classList.add("tooltip-text");
    tooltip.innerHTML = symptomDefinitions[symptom]; // Multi-line symptom definition
    infoIcon.appendChild(tooltip);

    // Wrap symptom title and info icon together
    let symptomTitle = document.createElement("div");
    symptomTitle.classList.add("symptom-title");

    let symptomName = document.createElement("h3");
    symptomName.innerText = symptom;

    symptomTitle.appendChild(symptomName);
    symptomTitle.appendChild(infoIcon);

    symptomDiv.appendChild(symptomTitle);

    let symptomDetails = document.createElement("div");
    symptomDetails.classList.add("symptom-details");

    timesOfDay.forEach(time => {
        let select = `<label>${time}: <select name="${symptom}-${time}">`;
        severities.forEach(severity => {
            select += `<option value="${severity}">${severity}</option>`;
        });
        select += `</select></label>`;
        symptomDetails.innerHTML += select;
    });

    symptomDiv.appendChild(symptomDetails);
    
    // Add cause dropdown - fixing the method of creation
    let causeDiv = document.createElement("div");
    causeDiv.classList.add("cause-selection");
    
    let causeLabel = document.createElement("label");
    causeLabel.textContent = "Cause: ";
    
    let causeSelect = document.createElement("select");
    causeSelect.name = `${symptom}-cause`;
    
    // Add options to the select element
    causes.forEach(cause => {
        let option = document.createElement("option");
        option.value = cause;
        option.textContent = cause;
        causeSelect.appendChild(option);
    });
    
    causeLabel.appendChild(causeSelect);
    causeDiv.appendChild(causeLabel);
    symptomDiv.appendChild(causeDiv);
    
    symptomsContainer.appendChild(symptomDiv);
});

// Populate Food Consumption Section
const foodContainer = document.getElementById("food-container");

timesOfDay.forEach(time => {
    let foodDiv = document.createElement("div");
    foodDiv.classList.add("food-entry");

    foodDiv.innerHTML = `<h3>${time}</h3>`;

    let foodDetails = document.createElement("div");
    foodDetails.classList.add("food-details");

    foodDetails.innerHTML = `
        <div class="food-item">
            <label>Trigger Foods:</label>
            <input type="text" name="${time}-trigger">
        </div>
        <div class="food-item">
            <label>Non-Trigger Foods:</label>
            <input type="text" name="${time}-nonTrigger">
        </div>
        <div class="food-item">
            <label>Not Sure:</label>
            <input type="text" name="${time}-unsure">
        </div>
    `;

    foodDiv.appendChild(foodDetails);
    foodContainer.appendChild(foodDiv);
});

// Submit Form
document.getElementById("tracker-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    let formData = new FormData(event.target);
    let symptomsData = [];

    symptoms.forEach(symptom => {
        let data = {
            name: symptom,
            morning: formData.get(`${symptom}-Morning`),
            afternoon: formData.get(`${symptom}-Afternoon`),
            evening: formData.get(`${symptom}-Evening`),
            night: formData.get(`${symptom}-Night`),
            cause: formData.get(`${symptom}-cause`)
        };
        symptomsData.push(data);
    });

    let periodStatus = formData.get("period") === "yes";

    let foodLog = {};
    timesOfDay.forEach(time => {
        foodLog[time.toLowerCase()] = {
            trigger: formData.get(`${time}-trigger`),
            nonTrigger: formData.get(`${time}-nonTrigger`),
            unsure: formData.get(`${time}-unsure`)
        };
    });

    let notes = document.getElementById("notes").value;

    let token = localStorage.getItem("token");
    const apiUrl = getApiUrl();
    
    let response = await fetch(`${apiUrl}/symptoms`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify({ symptoms: symptomsData, notes, period: periodStatus, foodLog })
    });

    let result = await response.json();
    if (result.message === "Data saved successfully") {
        alert("Data successfully submitted!");
        window.location.reload();
    } else {
        alert("Error submitting data.");
    }
});

// Logout Function
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}