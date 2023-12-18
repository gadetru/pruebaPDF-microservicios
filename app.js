const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const ejs = require('ejs');
const archiver = require('archiver');
const { calcularPorcentajemujeres, calcularPorcentajeHombres } = require('./views/teamScript');

const app = express();
const port = 3000;
const pdfDir = path.join(__dirname, 'PDF');

const manImg = path.join(__dirname, 'public', 'img', 'hombre.base64');
const girlImg = path.join(__dirname, 'public', 'img', 'mujer.base64');
const ceeisLogo = path.join(__dirname, 'public', 'img', 'ceeis.base64');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/create-pdf', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      throw new Error('Cuerpo de la solicitud POST no válido');
    }

    const postData = req.body;
    const resultadoHombres = calcularPorcentajeHombres(postData);
    const resultadoMujeres = calcularPorcentajemujeres(postData);

    const theMan = await fs.readFile(manImg, 'utf8');
    const theGirl = await fs.readFile(girlImg, 'utf8');
    const ceeis = await fs.readFile(ceeisLogo, 'utf8');

    const chartScript = await fs.readFile(path.join(__dirname, 'views', 'chartScript.js'), 'utf8');

    const postDataString = JSON.stringify(postData);

    // Lee y aplica los estilos desde un archivo CSS
    const css = await fs.readFile(path.join(__dirname, 'views', 'style.css'), 'utf8');

    // Renderiza la primera vista (index.ejs)
    const html1 = await ejs.renderFile(path.join(__dirname, 'views', 'index.ejs'), {
      postData,
      resultadoHombres,
      resultadoMujeres,
      theMan,
      theGirl,
      ceeis,
    });

    // Renderiza la segunda vista (secondPDF.ejs)
    const html2 = await ejs.renderFile(path.join(__dirname, 'views', 'secondPDF.ejs'), {
      postData,
      resultadoHombres,
      resultadoMujeres,
      theMan,
      theGirl,
      ceeis,
    });

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Agrega el script al contexto de la página
    await page.addScriptTag({ content: chartScript });

    // Genera el PDF para la primera página
    const pdfPathPage1 = path.join(pdfDir, 'document_page1.pdf');
    await page.setContent(html1, { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({ content: css });
    await page.waitForTimeout(2000);
    await page.evaluate(async (postDataString) => {
      try {
        const postData = JSON.parse(postDataString);
        window.createChart(postData);
      } catch (error) {
        console.error('Error al parsear el JSON en createChart:', error);
      }
    }, postDataString);
    await page.waitForTimeout(2000);
    await fs.mkdir(pdfDir, { recursive: true });
    await page.pdf({ path: pdfPathPage1, format: 'A4', printBackground: true });

    // Crea una nueva instancia de page para la segunda página
    const page2 = await browser.newPage();

    // Genera PDF para la segunda página
    const pdfPathPage2 = path.join(pdfDir, 'document_page2.pdf');
    await page2.setContent(html2, { waitUntil: 'domcontentloaded' });
    await page2.addStyleTag({ content: css });
    await page2.waitForTimeout(2000);
    await page2.pdf({ path: pdfPathPage2, format: 'A4', printBackground: true });

    await browser.close();

    // Crea el archivo ZIP y añade los PDFs
    const zipPath = path.join(pdfDir, 'documents.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(res); // Pasa la respuesta del servidor al archivo ZIP

    // Añade los PDFs al archivo ZIP
    archive.file(pdfPathPage1, { name: 'document_page1.pdf' });
    archive.file(pdfPathPage2, { name: 'document_page2.pdf' });

    // Finaliza el archivo ZIP y lo envía al cliente
    archive.finalize();

  } catch (error) {
    console.error('Error al crear el PDF:', error);
    res.status(500).send('Error interno al generar el PDF');
  }
});

const server = app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});

server.timeout = 50000;
