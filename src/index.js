const puppeteer = require("puppeteer");
const { format } = require("date-fns");
const fs = require("fs");
const prettier = require("prettier");
const retry = require("async-retry");
const { promisify } = require("util");

const timeseries = require("../docs/timeseries.json");
const writeFile = promisify(fs.writeFile);

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://xn--80aesfpebagmfblc0a.xn--p1ai/", {
    timeout: 60000
  });

  const date = format(new Date(), "yyyy-MM-dd");

  await (await page.$('#app div.cv-banner__bottom a')).click()

  const data = await page.$$eval(
    "body div.d-map__main div.d-map__list table tr",
    trNodes =>
      trNodes
        .map(
          tr =>
            tr.children && [
              tr.children[0].textContent,
              tr.children[1].textContent,
              tr.children[2].textContent,
              tr.children[3].textContent
            ]
        )
        .filter(Boolean)
  );

  await browser.close();

  data.forEach(([city, confirmed, recovered, deaths]) => {
    if (!Array.isArray(timeseries[city])) {
      timeseries[city] = [];
    }

    const last = timeseries[city][timeseries[city].length - 1];
    if (last && last.date === date) {
      timeseries[city][timeseries[city].length - 1] = {
        date,
        confirmed,
        deaths,
        recovered
      };
    } else {
      timeseries[city].push({
        date,
        confirmed,
        deaths,
        recovered
      });
    }
  });

  await writeFile(
    require.resolve("../docs/timeseries.json"),
    prettier.format(JSON.stringify(timeseries), {
      printWidth: 90,
      parser: "json"
    })
  );

  console.log("Done ✅");
}

(async () => {
  try {
    await retry(
      async () => {
        await main();
      },
      {
        retries: 3
      }
    );
  } catch (error) {
    console.log("Error 🅾️");
    console.log(error);
    process.exit(1);
  }

  process.exit(0);
})();
