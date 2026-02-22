
const PRIMARY_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";
const FALLBACK_URL = "https://latest.currency-api.pages.dev/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".dropdown .form select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");

for (let select of dropdowns) {
    for (let currCode of Object.keys(countryList)) {
        let newOption = document.createElement("option");
        newOption.innerText = currCode;
        newOption.value = currCode;

        if (select.name === "from" && currCode === "INR") {
            newOption.selected = true;
        } else if (select.name === "to" && currCode === "USD") {
            newOption.selected = true;
        }

        select.append(newOption);
    }

    select.addEventListener("change", (evt) => {
        updateFlag(evt.target);
    });
}

const fetchRate = async (baseURL, from) => {
    let response = await fetch(`${baseURL}/${from}.json`);
    if (!response.ok) return null;
    return await response.json();
};


const updateExchange = async () => {
    let amountInput = document.querySelector(".amount input");
    let amtVal = parseFloat(amountInput.value);

    if (!amtVal || amtVal < 1) {
        amtVal = 1;
        amountInput.value = "1";
    }

    let from = fromCurr.value.toLowerCase();
    let to = toCurr.value.toLowerCase();     

    if (from === to) {
        msg.innerText = `${amtVal} ${from.toUpperCase()} = ${amtVal} ${to.toUpperCase()}`;
        return;
    }

    msg.innerText = "Fetching exchange rate...";

    try {
        let data = await fetchRate(PRIMARY_URL, from);
        if (!data) {
            console.warn("Primary URL failed, trying fallback...");
            data = await fetchRate(FALLBACK_URL, from);
        }

        if (!data) {
            throw new Error("Both primary and fallback URLs failed");
        }
        let rate = data[from][to];

        if (!rate) {
            throw new Error(`Rate not found for ${to.toUpperCase()}`);
        }

        let finalAmt = (amtVal * rate).toFixed(2);
        msg.innerText = `${amtVal} ${from.toUpperCase()} = ${finalAmt} ${to.toUpperCase()}`;

    } catch (error) {
        console.error("Error fetching rate:", error);
        msg.innerText = `Could not get rate for ${from.toUpperCase()} → ${to.toUpperCase()}. Please try again.`;
    }
};

const updateFlag = (element) => {
    let currCode = element.value;
    let countryCode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    img.src = newSrc;
};

btn.addEventListener("click", (evt) => {
    evt.preventDefault();
    updateExchange();
});

window.addEventListener("load", () => {
    updateExchange();
});