// Replace this with your live Render backend URL
const API_BASE = "https://certificate-generator-ccym.onrender.com".replace(/\/$/, "");

// ----------------------------------------------------
// 1. Certificate Generation
// ----------------------------------------------------
const certForm = document.getElementById("certificate-form");
const statusEl = document.getElementById("status");
const generateBtn = document.getElementById("generate-btn");

certForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    generateBtn.disabled = true;
    statusEl.textContent = "Generating certificates... Please wait.";
    statusEl.className = "status info";

    try {
        const formData = new FormData(certForm);

        const response = await fetch(`${API_BASE}/generate-certificates`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            let message = `Request failed with status ${response.status}`;
            try {
                const data = await response.json();
                if (data.detail) {
                    message = data.detail;
                }
            } catch (_) {
                // Keep default status message if body is not JSON
            }
            throw new Error(message);
        }

        // Receive the ZIP stream and initiate browser download
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "certificates.zip";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        URL.revokeObjectURL(url);

        statusEl.textContent = "Certificates generated successfully. Download started!";
        statusEl.className = "status success";
    } catch (error) {
        statusEl.textContent = error.message || "Failed to generate certificates.";
        statusEl.className = "status error";
    } finally {
        generateBtn.disabled = false;
    }
});

// ----------------------------------------------------
// 2. Certificate Verification
// ----------------------------------------------------
const verifyForm = document.getElementById("verify-form");
const verifyInput = document.getElementById("verify-value");
const verifyResult = document.getElementById("verify-result");
const verifyBtn = verifyForm.querySelector("button[type='submit']");

verifyForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const value = verifyInput.value.trim();
    if (!value) return;

    verifyBtn.disabled = true;
    verifyResult.textContent = "Verifying certificate...";

    try {
        const response = await fetch(`${API_BASE}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ value }),
        });

        const data = await response.json();
        verifyResult.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        verifyResult.textContent = "Unable to connect to verification server.";
    } finally {
        verifyBtn.disabled = false;
    }
});