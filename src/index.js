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
  await page.goto("https://xn--80aesfpebagmfblc0a.xn--p1ai/information/", {
    timeout: 60000
  });

  const date = format(new Date(), "yyyy-MM-dd");

  const data = await page.$$eval(
    '#app div.cv-spread-overview__table table > tbody > tr',
    trNodes =>
      trNodes
        .map(
          tr =>
            tr.children && [
              tr.children[0].textContent.trim(),
              tr.children[1].textContent.trim(),
              tr.children[4].textContent.trim(),
              tr.children[5].textContent.trim()
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
