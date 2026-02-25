import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getForecast = async (req, res) => {
  try {
    // Path to the CSV file relative to this controller
    // Controller is in backend/controllers/
    // CSV is in price_prediction/data/forecasts/
    const csvPath = path.join(__dirname, '..', '..', 'price_prediction', 'data', 'forecasts', 'next_7_days_forecast.csv');

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ message: "Forecast data not found" });
    }

    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    // Simple CSV parsing
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });

    // Group by vegetable for easier consumption on frontend
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.vegetable]) {
        acc[item.vegetable] = [];
      }
      acc[item.vegetable].push({
        date: item.date,
        price: parseFloat(item.predicted_price)
      });
      return acc;
    }, {});

    // Convert back to array of objects for easier mapping
    const result = Object.keys(groupedData).map(veg => ({
      vegetable: veg,
      forecast: groupedData[veg]
    }));

    res.json(result);
  } catch (error) {
    console.error("Error reading forecast CSV:", error);
    res.status(500).json({ message: "Error reading forecast data" });
  }
};
