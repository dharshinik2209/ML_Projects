const imageInput = document.getElementById("imageInput");

const uploadCard = document.getElementById("uploadCard");
const workspace = document.getElementById("workspace");

const previewImage = document.getElementById("previewImage");
const imageWrapper = document.querySelector(".image-wrapper");

const changeImage = document.getElementById("changeImage");

const clickIndicator = document.getElementById("clickIndicator");

const colorPreview = document.getElementById("colorPreview");
const colorName = document.getElementById("colorName");
const colorNamePreview = document.getElementById("colorNamePreview");

const hexValue = document.getElementById("hexValue");
const rgbValue = document.getElementById("rgbValue");

const redValue = document.getElementById("redValue");
const greenValue = document.getElementById("greenValue");
const blueValue = document.getElementById("blueValue");

const redBar = document.getElementById("redBar");
const greenBar = document.getElementById("greenBar");
const blueBar = document.getElementById("blueBar");

const status = document.getElementById("status");


let selectedFile = null;


/* =========================
   IMAGE UPLOAD
========================= */

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    selectedFile = file;

    const reader = new FileReader();

    reader.onload = function (event) {

        previewImage.src = event.target.result;

        uploadCard.classList.add("hidden");

        workspace.classList.remove("hidden");

        resetResult();

    };

    reader.readAsDataURL(file);

});


/* =========================
   CHANGE IMAGE
========================= */

changeImage.addEventListener("click", function () {

    imageInput.click();

});


/* =========================
   IMAGE CLICK
========================= */

imageWrapper.addEventListener("click", async function (event) {

    if (!selectedFile) {
        return;
    }


    const rect = previewImage.getBoundingClientRect();


    /*
        Mouse position relative to displayed image
    */

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;


    /*
        Ignore clicks outside image
    */

    if (
        x < 0 ||
        y < 0 ||
        x > rect.width ||
        y > rect.height
    ) {
        return;
    }


    /*
        Display click indicator
    */

    clickIndicator.style.left = `${x}px`;
    clickIndicator.style.top = `${y}px`;

    clickIndicator.classList.remove("hidden");


    /*
        Convert displayed coordinates
        to original image coordinates
    */

    const scaleX = previewImage.naturalWidth / rect.width;
    const scaleY = previewImage.naturalHeight / rect.height;

    const originalX = Math.round(x * scaleX);
    const originalY = Math.round(y * scaleY);


    detectColor(
        originalX,
        originalY
    );

});


/* =========================
   SEND TO BACKEND
========================= */

    async function detectColor(x, y) {

    status.textContent = "Detecting...";
    status.style.color = "#6c5ce7";
    status.style.background = "#f0edff";


    const formData = new FormData();

    formData.append("image", selectedFile);
    formData.append("x", x);
    formData.append("y", y);


    try {

        const response = await fetch(
            "http://127.0.0.1:5000/detect",
            {
                method: "POST",
                body: formData
            }
        );


        if (!response.ok) {

            throw new Error(
                "Server returned an error"
            );

        }


        const data = await response.json();


        displayResult(data);


    } catch (error) {

        console.error(error);

        status.textContent = "Error";

        status.style.color = "#e74c3c";
        status.style.background = "#fff0f0";

        colorName.textContent =
            "Unable to detect color";

    }

}


/* =========================
   DISPLAY RESULT
========================= */

function displayResult(data) {

    const name =
        data.color_name || data.name || "Unknown";

    const hex =
        data.hex || "#000000";

    const rgb =
        data.rgb || [0, 0, 0];


    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];


    /*
        Color name
    */

    colorName.textContent = name;

    colorNamePreview.textContent = name;


    /*
        HEX
    */

    hexValue.textContent =
        hex.toUpperCase();


    /*
        RGB
    */

    rgbValue.textContent =
        `rgb(${r}, ${g}, ${b})`;


    /*
        Preview
    */

    colorPreview.style.background =
        `rgb(${r}, ${g}, ${b})`;


    /*
        RGB numbers
    */

    redValue.textContent = r;
    greenValue.textContent = g;
    blueValue.textContent = b;


    /*
        RGB progress bars
    */

    redBar.style.width =
        `${(r / 255) * 100}%`;

    greenBar.style.width =
        `${(g / 255) * 100}%`;

    blueBar.style.width =
        `${(b / 255) * 100}%`;


    /*
        Status
    */

    status.textContent = "Detected";

    status.style.color = "#00a982";
    status.style.background = "#edfdf8";

}


/* =========================
   RESET
========================= */

function resetResult() {

    colorName.textContent =
        "Select a color";

    colorNamePreview.textContent =
        "No color selected";

    hexValue.textContent = "—";

    rgbValue.textContent = "—";

    colorPreview.style.background =
        "#e9edf5";


    redValue.textContent = 0;
    greenValue.textContent = 0;
    blueValue.textContent = 0;


    redBar.style.width = "0%";
    greenBar.style.width = "0%";
    blueBar.style.width = "0%";


    status.textContent = "Ready";

    status.style.color = "#00a982";
    status.style.background = "#edfdf8";


    clickIndicator.classList.add("hidden");

}


/* =========================
   COPY BUTTON
========================= */

document.querySelectorAll(".copy-button").forEach(button => {

    button.addEventListener("click", function () {

        const targetId =
            this.getAttribute("data-copy");

        const text =
            document.getElementById(targetId).textContent;


        if (text === "—") {
            return;
        }


        navigator.clipboard.writeText(text);


        const originalText =
            this.textContent;

        this.textContent = "Copied!";


        setTimeout(() => {

            this.textContent =
                originalText;

        }, 1200);

    });

});