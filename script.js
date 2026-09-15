// -------------------------
// DEBOUNCE HELPER
// -------------------------
function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// -------------------------
// START APP
// -------------------------
function startApp() {
    setTimeout(() => {
        document.getElementById("splash").style.display = "none";
        document.getElementById("mainApp").style.display = "block";

        loadSavedValues();
        autoLoad();   // ← ΜΕΤΑΦΕΡΘΗΚΕ ΕΔΩ
        updateStartAmount();
        updateWithdrawal();

        document.getElementById("inDeposit").addEventListener("input", debounce(updateStartAmount, 250));
        document.getElementById("bonus").addEventListener("input", debounce(updateStartAmount, 250));
        document.getElementById("exDeposit").addEventListener("input", debounce(updateStartAmount, 250));

        document.getElementById("wAmount").addEventListener("input", debounce(updateWithdrawal, 250));
        document.getElementById("feeRate").addEventListener("input", debounce(updateWithdrawal, 250));
        document.getElementById("rateUSDT").addEventListener("input", debounce(updateWithdrawal, 250));

        document.querySelectorAll("input").forEach(el => el.addEventListener("input", saveValues));
        for (let i = 1; i <= 7; i++) {
            document.getElementById("day" + i).addEventListener("change", saveValues);
        }
    }, 2500);
}

// -------------------------
// HELPERS (Load, Save)
// -------------------------
function loadSavedValues() {
    const fields = ["profitRate", "startDate", "inDeposit", "exDeposit", "bonus", "rateUSDT", "wAmount", "feeRate"];
    fields.forEach(id => {
        const saved = localStorage.getItem(id);
        if (saved !== null && document.getElementById(id)) document.getElementById(id).value = saved;
    });
  for (let i = 1; i <= 7; i++) {
    const saved = localStorage.getItem("day" + i);
    if (saved !== null) document.getElementById("day" + i).value = saved;
}
}

function saveValues() {
    const fields = ["profitRate", "startDate", "inDeposit", "exDeposit", "bonus", "rateUSDT", "wAmount", "feeRate"];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) localStorage.setItem(id, el.value);
    });
    for (let i = 1; i <= 7; i++) {
    localStorage.setItem("day" + i, document.getElementById("day" + i).value);
}
}

// -------------------------
// CORE CALCULATIONS
// -------------------------
function updateStartAmount() {
    const total = (parseFloat(document.getElementById("inDeposit").value) || 0) + 
                  (parseFloat(document.getElementById("exDeposit").value) || 0) + 
                  (parseFloat(document.getElementById("bonus").value) || 0);
    document.getElementById("startAmount").value = total.toFixed(2);
    saveValues();
}

function updateWithdrawal() {
    const wAmount = parseFloat(document.getElementById("wAmount").value) || 0;
    const kratiseisPct = parseFloat(document.getElementById("feeRate").value) || 0;
    const rate = parseFloat(document.getElementById("rateUSDT").value) || 0;

    const wAfterFee = wAmount - (wAmount * kratiseisPct / 100);
    document.getElementById("wAfterFee").value = wAfterFee.toFixed(2);

    document.getElementById("wAmountEUR").value = (wAfterFee * rate).toFixed(2);

    saveValues();
}

function generateTable() {
    const αρχική = parseFloat(document.getElementById("inDeposit").value) || 0;
    const επιπλέον = parseFloat(document.getElementById("exDeposit").value) || 0;
    const μπόνους = parseFloat(document.getElementById("bonus").value) || 0;
    const rate = (parseFloat(document.getElementById("profitRate").value) || 0) / 100;

    let τρέχονΠοσό = αρχική + επιπλέον + μπόνους;

    let ημερομηνία = new Date(document.getElementById("startDate").value);

    let html = `
        <table>
            <tr>
                <th>Ημερομηνία</th>
                <th>Παίξιμο</th>
                <th>Ποντάρισμα</th>
                <th>Κέρδος</th>
                <th>Νέο Ποσό</th>
            </tr>
    `;

    const targetLimit = (αρχική + επιπλέον + μπόνους) * 2;

    let ημέρες = 0;

    while (τρέχονΠοσό < targetLimit && ημέρες < 365) {

        const dayIdx = (ημερομηνία.getDay() + 6) % 7 + 1;

       const παίξιμο = Number(document.getElementById("day" + dayIdx).value);

        for (let j = 1; j <= παίξιμο; j++) {

            const ποντάρισμα = τρέχονΠοσό * 0.01;
            const κέρδος = ποντάρισμα * rate;

            τρέχονΠοσό += κέρδος;

            html += `
                <tr>
                    <td>${ημερομηνία.toLocaleDateString("el-GR")}</td>
                    <td>${j}ο</td>
                    <td>$${ποντάρισμα.toFixed(2)}</td>
                    <td>$${κέρδος.toFixed(2)}</td>
                    <td>$${τρέχονΠοσό.toFixed(2)}</td>
                </tr>
            `;
        }

        ημερομηνία.setDate(ημερομηνία.getDate() + 1);
        ημέρες++;
    }

const ποσόΑνάληψης = parseFloat(document.getElementById("wAmount").value) || 0;
const ποσόΜετάΑνάληψη = τρέχονΠοσό - ποσόΑνάληψης;
const απαραίτητοΥπόλοιπο = targetLimit - ποσόΜετάΑνάληψη;
const τελικόΚέρδος = τρέχονΠοσό - (αρχική + επιπλέον + μπόνους);
const κρατήσεις = τελικόΚέρδος * 0.05;
const καθαρόΚέρδος = τελικόΚέρδος - κρατήσεις;
const καθαρόΜετά = ποσόΜετάΑνάληψη - κρατήσεις;

html += `
    </table><br>

    <strong>Τελικό Ποσό πριν την ανάληψη: $${τρέχονΠοσό.toFixed(2)}</strong><br>
    <strong>Ποσό Ανάληψης: $${ποσόΑνάληψης.toFixed(2)}</strong><br>
    <strong>Ποσό μετά την ανάληψη: $${ποσόΜετάΑνάληψη.toFixed(2)}</strong><br>
    <strong>Υπόλοιπο για να ξαναπιαστεί ο στόχος: $${απαραίτητοΥπόλοιπο.toFixed(2)}</strong><br><br>

    <strong>Κέρδος πριν τις κρατήσεις: $${τελικόΚέρδος.toFixed(2)}</strong><br>
    <strong>Κρατήσεις (5%): $${κρατήσεις.toFixed(2)}</strong><br>
    <strong>Καθαρό Κέρδος: $${καθαρόΚέρδος.toFixed(2)}</strong><br>
    <strong>Καθαρό ποσό μετά τις κρατήσεις: $${καθαρόΜετά.toFixed(2)}</strong><br><br>

    <strong>Ημέρες που χρειάστηκαν για διπλασιασμό του αρχικού ποσού: ${ημέρες}</strong><br><br>

    <button onclick="exportToCSV()">Εξαγωγή σε CSV</button>
`;

document.getElementById("results").innerHTML = html;
}

// -------------------------
// FORM 2
// -------------------------

// Δημιουργία σειρών 2–10
window.addEventListener("DOMContentLoaded", () => {
    let html = "";
    for (let i = 2; i <= 10; i++) {
        html += `
        <tr>
            <td>${i}</td>
            <td><input id="p${i}" type="number" value="2" min="1"></td>
            <td><input id="a${i}" type="date"></td>
            <td><input id="b${i}" type="date"></td>
            <td><input id="c${i}" type="number" step="0.01" readonly></td>
            <td id="d${i}"></td>
            <td><input id="w${i}" type="number" step="0.01"></td>
            <td id="fee${i}"></td>
            <td id="wf${i}"></td>
            <td id="net${i}"></td>
            <td id="r${i}"></td>
            <td id="days${i}"></td>
        </tr>`;
    }
    document.getElementById("rows").innerHTML = html;
});

function openForm2() {
    document.getElementById("mainApp").style.display = "none";
    document.getElementById("form2").style.display = "block";

    document.getElementById("profitRate_display").innerText =
        document.getElementById("profitRate").value;

    document.getElementById("feeRate_display").innerText =
        document.getElementById("feeRate").value;    

    document.getElementById("rateUSDT_display").innerText =
        document.getElementById("rateUSDT").value;
}

function backToMain() {
    document.getElementById("form2").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
}

function calcRange(startDate, endDate, startAmount, rate, plays) {
    if (!startDate || !endDate) return { amount: startAmount, days: 0 };

    let amount = startAmount;
    let d = new Date(startDate);
    let end = new Date(endDate);
    let days = 0;

    while (d <= end) {
        for (let j = 1; j <= plays; j++) {
            let bet = amount * 0.01;
            let profit = bet * rate;
            amount += profit;
        }
        d.setDate(d.getDate() + 1);
        days++;
    }

    return { amount, days };
}

function run10() {
    const rate = (parseFloat(document.getElementById("profitRate").value) || 0) / 100;
    const usdtRate = parseFloat(document.getElementById("rateUSDT").value) || 1;
    const feerate = (parseFloat(document.getElementById("feeRate").value) || 0) / 100;

    for (let i = 1; i <= 10; i++) {

        let a = document.getElementById("a" + i).value;
        let b = document.getElementById("b" + i).value;
        let c = parseFloat(document.getElementById("c" + i).value) || 0;
        let plays = parseInt(document.getElementById("p" + i).value) || 2;

        let result = calcRange(a, b, c, rate, plays);

        document.getElementById("d" + i).innerText = result.amount.toFixed(2);
        document.getElementById("days" + i).innerText = result.days;

        let w = parseFloat(document.getElementById("w" + i).value) || 0;
        // Κράτηση %
        let fee = w * 0.05;
        document.getElementById("fee" + i).innerText = fee.toFixed(2);

        // Final withdraw after fee
        let wf = w - fee;
        document.getElementById("wf" + i).innerText = wf.toFixed(2);

        // Net σε EUR (μετά το fee)
        let net = wf * usdtRate;
        document.getElementById("net" + i).innerText = net.toFixed(2);

        // R = amount - final withdraw
        let r = result.amount - wf;
        document.getElementById("r" + i).innerText = r.toFixed(2);

        if (i < 10) {
            document.getElementById("c" + (i + 1)).value = r.toFixed(2);

            if (b) {
                let nextDate = new Date(b);
                nextDate.setDate(nextDate.getDate() + 1);
                document.getElementById("a" + (i + 1)).value =
                    nextDate.toISOString().split("T")[0];
            }
        }
    }

    autoSave();
}

function autoSave() {
    let data = {
        rows: []
    };

    for (let i = 1; i <= 10; i++) {
        data.rows.push({
            p: document.getElementById("p" + i).value,
            a: document.getElementById("a" + i).value,
            b: document.getElementById("b" + i).value,
            c: document.getElementById("c" + i).value,
            w: document.getElementById("w" + i).value
        });
    }

    localStorage.setItem("profitPlan10", JSON.stringify(data));
}

function autoLoad() {
    let data = localStorage.getItem("profitPlan10");
    if (!data) return;

    data = JSON.parse(data);

    if (!data.rows || data.rows.length < 10) return;

    for (let i = 1; i <= 10; i++) {
        document.getElementById("p" + i).value = data.rows[i - 1].p;
        document.getElementById("a" + i).value = data.rows[i - 1].a;
        document.getElementById("b" + i).value = data.rows[i - 1].b;
        document.getElementById("c" + i).value = data.rows[i - 1].c;
        document.getElementById("w" + i).value = data.rows[i - 1].w;
    }

    run10();
}

// -------------------------
// UTILS
// -------------------------
function exportToCSV() {
    let csv = "\uFEFFΗμερομηνία;Παίξιμο;Ποντάρισμα;Κέρδος;Νέο Ποσό\n";
    document.querySelectorAll("#results table tr").forEach((row, i) => {
        if (i === 0) return;
        csv += Array.from(row.querySelectorAll("td")).map(td => td.innerText.replace("$", "")).join(";") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "profit_plan.csv";
    link.click();
}
