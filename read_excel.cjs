const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('MODEMS JUNIO 26.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log("--- EXCEL HEADERS ---");
  console.log(data[0]);
  console.log("--- FIRST DATA ROW ---");
  console.log(data[1]);
} catch (error) {
  console.error("Error reading Excel file:", error);
}
