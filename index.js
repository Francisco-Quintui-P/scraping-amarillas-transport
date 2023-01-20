const puppeteer = require('puppeteer');
const fs = require('fs');

(async ()=> {
    const browser = await puppeteer.launch({headless: false});

    const page = await browser.newPage();

    await page.goto('https://amarillas.emol.com/transporte-de-carga');
    
    await page.waitForSelector('article.item');

    const enlaces = await page.evaluate(() => {
        const elements = document.querySelectorAll('article.item h2 a');

        const links = [];
        for (let element of elements) {
            links.push(element.href);
        }

        return links;
    });

    let avisos = "";

    for (let enlace of enlaces) {
        await page.goto(enlace);
        await page.waitForSelector("div.f-nombre_empresa [itemprop='name'], span.bold [itemprop='telephone'], button.puntero p.ng-binding, li.ng-scope p.ng-binding");
        console.log(enlace);
        const aviso = await page.evaluate(() => {
            const data = {};

            try {
                data.title = document.querySelector("div.f-nombre_empresa [itemprop='name']").innerText;
            }catch(err){ console.error(err)}
            try {
                data.number = document.querySelector("span.bold [itemprop='telephone']").innerText;
            }catch(err) {console.error(err)}
            try {
                data.website = document.querySelector('button.puntero p.ng-binding').innerText;
            }catch(err) {console.error(err)}
            try {
                data.direction = document.querySelector("[itemprop='addressLocality'] p.ng-binding").innerText;
            }catch(err) {console.error(err)}
            
            return data;
        })

        let line = `${aviso.title};${aviso.number};${aviso.website};${aviso.direction}\n`;
        
        avisos += line;
        console.log(line);

    }
    avisos = avisos.toString('utf8');
    fs.writeFile("avisos.csv", avisos, 'utf8', function (err) {
        if (err) {
            console.log("An error occurred creating the CSV file");
            console.log(err);
        }
    });

    await browser.close();

})();