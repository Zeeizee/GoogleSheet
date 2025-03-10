import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Function to Fetch Data from Google Sheets
async function getSheetData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/${process.env.RANGE}?key=${process.env.API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    return null;
  }
}

// API Route to Fetch Entire Sheet Data
app.get("/sheet-data/:cnic", async (req, res) => {
  const { cnic } = req.params;
  const data = await getSheetData();
  if (data) {
    const filteredData = data.filter((dd) => dd[0] === cnic);

    res.json({ success: true, data: filteredData });
  } else {
    res.status(500).json({ success: false, message: "Failed to fetch data" });
  }
});

// API Route to Fetch Data by CNIC
app.get("/sheet-data/:cnic", async (req, res) => {
  const data = await getSheetData();
  if (!data) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch data" });
  }

  const [headers, ...rows] = data; // Extract headers and rows
  const cnicIndex = headers.indexOf("CNIC"); // Find CNIC column index

  if (cnicIndex === -1) {
    return res
      .status(400)
      .json({ success: false, message: "CNIC column not found" });
  }

  const record = rows.find((row) => row[cnicIndex] === req.params.cnic);

  if (record) {
    res.json({ success: true, data: record });
  } else {
    res.status(404).json({ success: false, message: "CNIC not found" });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
