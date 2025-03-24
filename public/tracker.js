const symptoms = [
    "Abdominal Pain",
    "Bloating",
    "Diarrhea",
    "Constipation",
    "Nausea"
];

const timesOfDay = ["Morning", "Afternoon", "Evening", "Night"];
const severities = ["Not at all", "Slight", "Mild", "Moderate", "Severe", "Very Severe", "Extreme"];
const causes = ["IBS", "Menstrual", "Both", "Not Sure", "Symptom Not Felt"];

// Ensure user is logged in
if (!localStorage.getItem("token")) {
    window.location.href = "index.html";
}

// Populate Symptoms Section
const symptomsContainer = document.getElementById("symptoms-container");

symptoms.forEach(symptom => {
    let symptomDiv = document.createElement("div");
    symptomDiv.innerHTML = `<h3>${symptom}</h3>`;

    timesOfDay.forEach(time => {
        let select = `<label>${time}: <select name="${symptom}-${time}">`;
        severities.forEach(severity => {
            select += `<option value="${severity}">${severity}</option>`;
        });
        select += `</select></label><br>`;
        symptomDiv.innerHTML += select;
    });

    let causeSelection = `<p>Cause: `;
    causes.forEach(cause => {
        causeSelection += `<label><input type="radio" name="${symptom}-cause" value="${cause}"> ${cause}</label> `;
    });
    causeSelection += `</p>`;

    symptomDiv.innerHTML += causeSelection;
    symptomsContainer.appendChild(symptomDiv);
});

// Populate Food Consumption Section
const foodContainer = document.getElementById("food-container");

timesOfDay.forEach(time => {
    let foodDiv = document.createElement("div");
    foodDiv.innerHTML = `<h3>${time}</h3>
        <label>Trigger Foods: <input type="text" name="${time}-trigger"></label><br>
        <label>Non-Trigger Foods: <input type="text" name="${time}-nonTrigger"></label><br>
        <label>Not Sure: <input type="text" name="${time}-unsure"></label><br>`;
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
    let response = await fetch("http://localhost:5000/symptoms", {
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
