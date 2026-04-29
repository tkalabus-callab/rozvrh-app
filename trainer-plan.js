const trainerPlanHeader = document.getElementById("trainerPlanHeader");
const trainerPlanContent = document.getElementById("trainerPlanContent");
const exportTrainerPlanPdfButton = document.getElementById("exportTrainerPlanPdfButton");
const exportTrainerPlanExcelButton = document.getElementById("exportTrainerPlanExcelButton");
const emailTrainerPlanButton = document.getElementById("emailTrainerPlanButton");
const backToScheduleButton = document.getElementById("backToScheduleButton");

function formatDate(date){
  return new Date(date).toISOString().split("T")[0];
}

function normalizeDateKey(date){
  return formatDate(date);
}

function getMonday(date){
  const value = new Date(date);
  const day = value.getDay();
  const diff = value.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(value.setDate(diff));
}

function getWeekRange(anchorDate){
  const start = getMonday(anchorDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

function getMonthRange(anchorDate){
  const value = new Date(anchorDate);
  const start = new Date(value.getFullYear(), value.getMonth(), 1);
  const end = new Date(value.getFullYear(), value.getMonth() + 1, 0);
  return { start, end };
}

function isDateInRange(dateStr, start, end){
  const value = normalizeDateKey(dateStr);
  return value >= normalizeDateKey(start) && value <= normalizeDateKey(end);
}

function load(key, fallback){
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function parseKey(key){
  const parts = key.split("_");

  if(parts.length === 4){
    const [date, year, cls, hour] = parts;
    return { date, year, cls, hour: Number(hour) };
  }

  const [date, cls, hour] = parts;
  return { date, year: null, cls, hour: Number(hour) };
}

function getTrainerById(trainerId){
  return load("trainers", []).find(trainer => String(trainer.id) === String(trainerId)) || null;
}

function getSchoolById(schoolId){
  return load("schools", []).find(school => String(school.id) === String(schoolId)) || null;
}

function getSchoolPlace(school){
  if(!school) return "-";
  return school.mesto || school.city || "-";
}

function getLessonTimeLabel(school, hour, lessonTime = ""){
  if(lessonTime) return lessonTime;
  const value = Array.isArray(school?.lessonTimes) ? school.lessonTimes[Number(hour) - 1] : "";
  return value || `${hour} hod`;
}

function getYearLabel(value){
  return String(value) === "skolka" ? "Školka" : (value || "-");
}

function getStoredTrainerId(value){
  return value && typeof value === "object" ? value.trainerId : value;
}

function normalizePlanEntry(key, value){
  const parsed = parseKey(key);
  const isObjectValue = !!value && typeof value === "object";

  return {
    trainerId: getStoredTrainerId(value),
    schoolId: isObjectValue ? String(value.schoolId ?? "") : "",
    date: isObjectValue ? value.date || parsed.date : parsed.date,
    year: isObjectValue ? value.year || parsed.year || "" : parsed.year || "",
    className: isObjectValue ? value.className || parsed.cls : parsed.cls,
    hour: isObjectValue ? Number(value.hour ?? parsed.hour) : parsed.hour,
    lessonTime: isObjectValue ? value.lessonTime || "" : ""
  };
}

function getTrainerPlanEntriesForPeriod(trainerId, periodType, anchorDate){
  const plans = load("plans", {});
  const range = periodType === "month"
    ? getMonthRange(anchorDate)
    : getWeekRange(anchorDate);

  return Object.entries(plans)
    .map(([key, value]) => {
      const entry = normalizePlanEntry(key, value);

      if(String(entry.trainerId) !== String(trainerId)) return null;
      if(!entry.date || !isDateInRange(entry.date, range.start, range.end)) return null;

      return {
        date: entry.date,
        schoolId: entry.schoolId,
        year: entry.year,
        className: entry.className,
        hour: entry.hour,
        lessonTime: entry.lessonTime
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if(a.date !== b.date) return a.date.localeCompare(b.date);
      if(Number(a.hour) !== Number(b.hour)) return Number(a.hour) - Number(b.hour);
      if(String(a.year) !== String(b.year)) return String(a.year).localeCompare(String(b.year), "cs");
      return String(a.className).localeCompare(String(b.className));
    });
}

function sanitizeFileNamePart(value, fallback){
  return String(value || fallback || "value")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .trim() || fallback || "value";
}

function getCurrentTrainerPlanContext(){
  const params = new URLSearchParams(window.location.search);
  const trainerId = params.get("trainerId") || "";
  const periodType = params.get("periodType") || "week";
  const periodDate = params.get("periodDate") || "";
  const trainer = getTrainerById(trainerId);
  const periodDateValue = periodDate ? new Date(periodDate) : new Date();
  const weekRange = getWeekRange(periodDateValue);
  const periodLabel = periodType === "month"
    ? `${String(periodDateValue.getMonth() + 1).padStart(2, "0")}/${periodDateValue.getFullYear()}`
    : `týden ${weekRange.start.toLocaleDateString("cs-CZ")} - ${weekRange.end.toLocaleDateString("cs-CZ")}`;
  const entries = getTrainerPlanEntriesForPeriod(trainerId, periodType, periodDate);

  return { trainerId, trainer, periodType, periodDate, periodLabel, entries };
}

function getTrainerPlanExportRows(context = getCurrentTrainerPlanContext()){
  return [
    ["Trenér", `${context.trainer?.jmeno || ""} ${context.trainer?.prijmeni || ""}`.trim() || context.trainer?.name || "-"],
    ["Období", context.periodLabel || "-"],
    [],
    ["Datum", "Hodina", "Škola", "Místo", "Ročník", "Třída"],
    ...context.entries.map(entry => {
      const school = getSchoolById(entry.schoolId);
      return [
        new Date(entry.date).toLocaleDateString("cs-CZ"),
        getLessonTimeLabel(school, entry.hour, entry.lessonTime),
        school?.nazev || "-",
        getSchoolPlace(school),
        getYearLabel(entry.year),
        entry.className || "-"
      ];
    })
  ];
}

function escapeXml(value){
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getExcelColumnName(index){
  let value = "";
  let number = index + 1;
  while(number > 0){
    const modulo = (number - 1) % 26;
    value = String.fromCharCode(65 + modulo) + value;
    number = Math.floor((number - modulo) / 26);
  }
  return value;
}

function buildSheetXml(rows){
  const rowXml = rows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const ref = `${getExcelColumnName(columnIndex)}${rowIndex + 1}`;
      return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
    }).join("");
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
}

function makeCrcTable(){
  const table = [];
  for(let n = 0; n < 256; n++){
    let c = n;
    for(let k = 0; k < 8; k++){
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(bytes){
  let crc = 0 ^ -1;
  for(let index = 0; index < bytes.length; index++){
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[index]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function writeUint16(bytes, value){
  bytes.push(value & 0xff, (value >>> 8) & 0xff);
}

function writeUint32(bytes, value){
  bytes.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function createZip(files){
  const encoder = new TextEncoder();
  const bytes = [];
  const centralDirectory = [];
  let offset = 0;

  files.forEach(file => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);

    writeUint32(bytes, 0x04034b50);
    writeUint16(bytes, 20);
    writeUint16(bytes, 0);
    writeUint16(bytes, 0);
    writeUint16(bytes, 0);
    writeUint16(bytes, 0);
    writeUint32(bytes, crc);
    writeUint32(bytes, dataBytes.length);
    writeUint32(bytes, dataBytes.length);
    writeUint16(bytes, nameBytes.length);
    writeUint16(bytes, 0);
    bytes.push(...nameBytes, ...dataBytes);

    centralDirectory.push({ file, nameBytes, dataBytes, crc, offset });
    offset = bytes.length;
  });

  const centralOffset = bytes.length;
  centralDirectory.forEach(item => {
    writeUint32(bytes, 0x02014b50);
    writeUint16(bytes, 20);
    writeUint16(bytes, 20);
    writeUint16(bytes, 0);
    writeUint16(bytes, 0);
    writeUint16(bytes, 0);
    writeUint16(bytes, 0);
    writeUint32(bytes, item.crc);
    writeUint32(bytes, item.dataBytes.length);
    writeUint32(bytes, item.dataBytes.length);
    writeUint16(bytes, item.nameBytes.length);
    writeUint16(bytes, 0);
    writeUint16(bytes, 0);
    writeUint16(bytes, 0);
    writeUint16(bytes, 0);
    writeUint32(bytes, 0);
    writeUint32(bytes, item.offset);
    bytes.push(...item.nameBytes);
  });

  const centralSize = bytes.length - centralOffset;
  writeUint32(bytes, 0x06054b50);
  writeUint16(bytes, 0);
  writeUint16(bytes, 0);
  writeUint16(bytes, centralDirectory.length);
  writeUint16(bytes, centralDirectory.length);
  writeUint32(bytes, centralSize);
  writeUint32(bytes, centralOffset);
  writeUint16(bytes, 0);

  return new Uint8Array(bytes);
}

function buildTrainerPlanXlsxBlob(context = getCurrentTrainerPlanContext()){
  const rows = getTrainerPlanExportRows(context);
  const files = [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Plan trenera" sheetId="1" r:id="rId1"/></sheets>
</workbook>`
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`
    },
    {
      name: "xl/worksheets/sheet1.xml",
      content: buildSheetXml(rows)
    }
  ];

  return new Blob([createZip(files)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}

function downloadBlob(blob, fileName){
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportTrainerPlanXlsx(){
  const context = getCurrentTrainerPlanContext();
  const trainerName = `${context.trainer?.prijmeni || ""}-${context.trainer?.jmeno || ""}`.trim() || context.trainerId || "trener";
  const fileName = `plan-trenera-${sanitizeFileNamePart(trainerName, "trener")}-${sanitizeFileNamePart(context.periodType, "obdobi")}-${sanitizeFileNamePart(context.periodDate, "datum")}.xlsx`;
  downloadBlob(buildTrainerPlanXlsxBlob(context), fileName);
}

function buildTrainerPlanHtmlTable(context = getCurrentTrainerPlanContext()){
  const rows = getTrainerPlanExportRows(context).slice(3);
  return `
    <table>
      <thead>
        <tr>${rows[0].map(cell => `<th>${escapeXml(cell)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows.slice(1).map(row => `<tr>${row.map(cell => `<td>${escapeXml(cell)}</td>`).join("")}</tr>`).join("") || '<tr><td colspan="6">Bez záznamů</td></tr>'}
      </tbody>
    </table>
  `;
}

function exportTrainerPlanPdf(){
  const context = getCurrentTrainerPlanContext();
  const trainerName = `${context.trainer?.jmeno || ""} ${context.trainer?.prijmeni || ""}`.trim() || context.trainer?.name || "-";
  const printWindow = window.open("", "_blank");
  if(!printWindow) return;

  printWindow.document.write(`<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <title>Plán trenéra</title>
  <style>
    body{font-family:Arial,sans-serif;color:#111;margin:24px;}
    h1{font-size:22px;margin:0 0 8px;}
    p{margin:0 0 16px;}
    table{width:100%;border-collapse:collapse;font-size:12px;}
    th,td{border:1px solid #ccc;padding:6px;text-align:left;}
    th{background:#2c3e55;color:#fff;}
  </style>
</head>
<body>
  <h1>Plán trenéra: ${escapeXml(trainerName)}</h1>
  <p>Období: ${escapeXml(context.periodLabel)}</p>
  ${buildTrainerPlanHtmlTable(context)}
</body>
</html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

function formatTrainerPlanEmailBody(context = getCurrentTrainerPlanContext()){
  const trainerName = `${context.trainer?.jmeno || ""} ${context.trainer?.prijmeni || ""}`.trim() || context.trainer?.name || "";
  const lines = [
    `Dobrý den${trainerName ? `, ${trainerName}` : ""},`,
    "",
    `posíláme plán výuky pro období ${context.periodLabel}.`,
    ""
  ];

  if(!context.entries.length){
    lines.push("Pro toto období zatím není uložen žádný plán.");
  } else {
    context.entries.forEach(entry => {
      const school = getSchoolById(entry.schoolId);
      lines.push(`${new Date(entry.date).toLocaleDateString("cs-CZ")} | ${getLessonTimeLabel(school, entry.hour, entry.lessonTime)} | ${school?.nazev || "-"} | ${getSchoolPlace(school)} | ${getYearLabel(entry.year)} ${entry.className || "-"}`);
    });
  }

  lines.push("", "Děkujeme.");
  return lines.join("\n");
}

function emailTrainerPlan(){
  const context = getCurrentTrainerPlanContext();
  const recipient = context.trainer?.email || "";
  const subject = `Plán výuky ${context.periodLabel}`;
  const body = formatTrainerPlanEmailBody(context);
  window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function renderTrainerPlanPage(){
  const params = new URLSearchParams(window.location.search);
  const trainerId = params.get("trainerId") || "";
  const periodType = params.get("periodType") || "week";
  const periodDate = params.get("periodDate") || "";
  const trainer = getTrainerById(trainerId);

  if(!trainer){
    trainerPlanHeader.textContent = "";
    trainerPlanContent.className = "";
    trainerPlanContent.textContent = "Trenér nebyl nalezen.";
    return;
  }

  if(!periodDate){
    trainerPlanHeader.textContent = "";
    trainerPlanContent.className = "";
    trainerPlanContent.textContent = "Chybí datum období.";
    return;
  }

  const trainerName = `${trainer.jmeno || ""} ${trainer.prijmeni || ""}`.trim() || trainer.name || "-";
  const periodDateValue = new Date(periodDate);
  const weekRange = getWeekRange(periodDate);
  const periodLabel = periodType === "month"
    ? `${String(periodDateValue.getMonth() + 1).padStart(2, "0")}/${periodDateValue.getFullYear()}`
    : `týden ${weekRange.start.toLocaleDateString("cs-CZ")} - ${weekRange.end.toLocaleDateString("cs-CZ")}`;

  trainerPlanHeader.innerHTML = `<strong>${trainerName}</strong><br>Období: ${periodLabel}`;

  const entries = getTrainerPlanEntriesForPeriod(trainerId, periodType, periodDate);

  if(!entries.length){
    trainerPlanContent.className = "";
    trainerPlanContent.textContent = "Pro zvolené období nebyl nalezen žádný plán.";
    return;
  }

  if(periodType === "month"){
    const days = [];
    let currentDay = null;

    entries.forEach(entry => {
      if(!currentDay || currentDay.date !== entry.date){
        currentDay = { date: entry.date, rows: [] };
        days.push(currentDay);
      }

      const school = getSchoolById(entry.schoolId);
      const lessonTime = getLessonTimeLabel(school, entry.hour, entry.lessonTime);
      currentDay.rows.push(`
        <tr>
          <td class="col-date">${new Date(entry.date).toLocaleDateString("cs-CZ", { day: "numeric", month: "2-digit", year: "2-digit" })}</td>
          <td class="col-hour">${lessonTime}</td>
          <td class="col-school">${school?.nazev || "-"}</td>
          <td class="col-place">${getSchoolPlace(school)}</td>
          <td class="col-year">${getYearLabel(entry.year)}</td>
          <td class="col-class">${entry.className || "-"}</td>
        </tr>
      `);
    });

    const leftDays = [];
    const rightDays = [];
    days.forEach(day => {
      const dayNumber = new Date(day.date).getDate();
      (dayNumber <= 15 ? leftDays : rightDays).push(day);
    });

    function buildMonthColumnTable(dayGroups){
      return `
        <table class="month-column-table">
          <thead>
            <tr>
              <th class="col-date">Datum</th>
              <th class="col-hour">Hodina</th>
              <th class="col-school">Škola</th>
              <th class="col-place">Místo</th>
              <th class="col-year">Ročník</th>
              <th class="col-class">Třída</th>
            </tr>
          </thead>
          <tbody>
            ${dayGroups.map((day, index) => `${index ? '<tr class="day-separator"><td colspan="6"></td></tr>' : ""}${day.rows.join("")}`).join("")}
          </tbody>
        </table>
      `;
    }

    trainerPlanContent.className = "month-layout";
    trainerPlanContent.innerHTML = `
      ${buildMonthColumnTable(leftDays)}
      ${buildMonthColumnTable(rightDays)}
    `;
    return;
  }

  const weekRows = [];
  let lastDate = "";

  entries.forEach(entry => {
    const school = getSchoolById(entry.schoolId);
    const lessonTime = getLessonTimeLabel(school, entry.hour, entry.lessonTime);
    const isNewDay = lastDate && entry.date !== lastDate;

    if(isNewDay){
      weekRows.push(`<tr class="day-separator"><td colspan="6"></td></tr>`);
    }

    weekRows.push(`
      <tr>
        <td class="col-date">${new Date(entry.date).toLocaleDateString("cs-CZ", { day: "numeric", month: "2-digit", year: "2-digit" })}</td>
        <td class="col-hour">${lessonTime}</td>
        <td class="col-school">${school?.nazev || "-"}</td>
        <td class="col-place">${getSchoolPlace(school)}</td>
        <td class="col-year">${getYearLabel(entry.year)}</td>
        <td class="col-class">${entry.className || "-"}</td>
      </tr>
    `);

    lastDate = entry.date;
  });

  trainerPlanContent.className = "";
  trainerPlanContent.innerHTML = `
    <table class="month-column-table">
      <thead>
        <tr>
          <th class="col-date">Datum</th>
          <th class="col-hour">Hodina</th>
          <th class="col-school">Škola</th>
          <th class="col-place">Místo</th>
          <th class="col-year">Ročník</th>
          <th class="col-class">Třída</th>
        </tr>
      </thead>
      <tbody>
        ${weekRows.join("")}
      </tbody>
    </table>
  `;
}

renderTrainerPlanPage();

exportTrainerPlanPdfButton.addEventListener("click", exportTrainerPlanPdf);
exportTrainerPlanExcelButton.addEventListener("click", exportTrainerPlanXlsx);
emailTrainerPlanButton.addEventListener("click", emailTrainerPlan);

backToScheduleButton.addEventListener("click", () => {
  window.location.href = "trainers.html";
});
