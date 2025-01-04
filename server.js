const express = require('express');
const { VirtualConsole } = require("jsdom");
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require('path');
const serveIndex = require('serve-index');
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const app = express();
const db = new sqlite3.Database('database.db');

app.use(express.static(path.join(__dirname, 'client')));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Express-fileupload with limit
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
}));

// Enable directory listing for subdirectories
app.use(
    '/business', // Pfad relative to `client/`
    express.static(path.join(__dirname, 'client', 'business')), // Serve files
    serveIndex(path.join(__dirname, 'client', 'business'), { icons: true }) // Directory listing
);

// Initialize table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS data (
            id INTEGER PRIMARY KEY,
            value TEXT,
            article_num TEXT,
            business TEXT
        )
    `);

    // Index on business for faster queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_business ON data (business)`);
});

const openAIKey = process.env.OPENAI_API_KEY;

if (!openAIKey) {
    console.error("ERROR: OpenAI API-Key nicht gesetzt. Bitte Environment-Variable OPENAI_API_KEY definieren.");
    process.exit(1); // Exit the program if the key is missing
}

let browser;
// Initialize browser
async function initializeBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--disable-logging', '--log-level=3'],
        });
        console.log('Puppeteer-Browser started');
    }
}
const virtualConsole = new VirtualConsole();

// Unterdrücke alle Ausgaben des VirtualConsole
virtualConsole.on("log", () => {});
//virtualConsole.on("error", () => {});
//virtualConsole.on("warn", () => {});
virtualConsole.on("info", () => {});

// Close browser when the server is shut down
async function closeBrowser() {
    if (browser) {
        console.log('Close Puppeteer-Browser...');
        await browser.close();
        console.log('Puppeteer-Browser closed');
    }
}

// Retrieve all data
app.get('/api/data', (req, res) => {
    db.all('SELECT * FROM data', [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// Retrieve data for a specific business
app.get('/api/data/business/:business', (req, res) => {
    const { business } = req.params;
    db.all('SELECT * FROM data WHERE business = ?', [business], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// Add or update data
app.post('/api/data', (req, res) => {
    const { id, value, article_num, business } = req.body;

    if (id) {
        // Check if a record with the specified ID exists
        db.get('SELECT * FROM data WHERE id = ?', [id], (err, row) => {
            if (err) return res.status(500).send(err.message);

            if (row) {
                // Update record
                db.run(
                    'UPDATE data SET value = ?, article_num = ?, business = ? WHERE id = ?',
                    [value, article_num, business, id],
                    function (updateErr) {
                        if (updateErr) return res.status(500).send(updateErr.message);
                        res.json({ message: 'updated data', id });
                    }
                );
            } else {
                // Record does not exist, create a new entry
                db.run(
                    'INSERT INTO data (id, value, article_num, business) VALUES (?, ?, ?, ?)',
                    [id, value, article_num, business],
                    function (insertErr) {
                        if (insertErr) return res.status(500).send(insertErr.message);
                        res.json({ message: 'added new data', id });
                    }
                );
            }
        });
    } else {
        // No ID provided, create a new entry
        db.run(
            'INSERT INTO data (value, article_num, business) VALUES (?, ?, ?)',
            [value, article_num, business],
            function (err) {
                if (err) return res.status(500).send(err.message);
                res.json({ message: 'added new data', id: this.lastID });
            }
        );
    }
});

// Delete data by ID
app.delete('/api/data/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM data WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).send(err.message);
        if (this.changes === 0) return res.status(404).send('entry not found');
        res.send('entry deleted');
    });
});

// Delete data by article_num
app.delete('/api/data/article/:article_num', (req, res) => {
    const { article_num } = req.params;
    db.run('DELETE FROM data WHERE article_num = ?', [article_num], function (err) {
        if (err) return res.status(500).send(err.message);
        if (this.changes === 0) return res.status(404).send('entry not found');
        res.send('entries deleted with article_num');
    });
});

// Delete data by business
app.delete('/api/data/business/:business', (req, res) => {
    const { business } = req.params;
    db.run('DELETE FROM data WHERE business = ?', [business], function (err) {
        if (err) return res.status(500).send(err.message);
        if (this.changes === 0) return res.status(404).send('entries for business not found');
        res.send('entries with business deleted');
    });
});

/**
 * POST /print
 * Expects { html: string } in the request body.
 * Renders the HTML using Puppeteer, saves a PDF, and prints it.
*/
app.post("/print", async (req, res) => {
    try {
      const { html } = req.body;
      if (!html) {
        return res.status(400).send("no HTML found in request body");
      }
  
      await initializeBrowser();
      const page = await browser.newPage();
  
      // Set HTML and wait for all resources to load
      await page.setContent(html, { waitUntil: "networkidle0" });
  
      // Generate a PDF with the desired format (80 mm x 3276 mm)
      // ‘printBackground: true’ to include background colors/images
      // DPI settings are not directly controlled by Puppeteer, but 203 DPI
      // corresponds to typical POS printers. The mm dimensions are usually sufficient.
      const pdfBuffer = await page.pdf({
        width: "80mm",
        height: "3276mm",
        preferCSSPageSize: false,
      });
  
      await page.close();
  
      // Temporarily save the PDF
      const tmpPath = path.join("/tmp", `receipt_${Date.now()}.pdf`);
      fs.writeFileSync(tmpPath, pdfBuffer);
  
      // Send the PDF to the printer “POS80” via lpr
      const printProcess = spawn("lpr", ["-P", "POS80", tmpPath]);
      printProcess.on("close", (code) => {
        // Delete the file after printing is completed
        fs.unlink(tmpPath, () => {});
  
        if (code === 0) {
          return res.status(200).send("PDF printed successfully");
        } else {
          return res.status(500).send(`error during printing. Code: ${code}`);
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send("error during rendering or printing");
    }
});

process.on('SIGTERM', async () => {
    console.log('Server is shutting down (SIGTERM)...');
    await closeBrowser();
    server.close(() => {
        process.exit(0);
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server runs on http://localhost:${PORT}`));