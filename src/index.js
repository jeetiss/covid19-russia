const puppeteer = require("puppeteer");
const { parse, format } = require("date-fns");
// const { ru } = require("date-fns/locale");
const fs = require("fs");
const prettier = require("prettier");
const retry = require("async-retry");
const { promisify } = require("util");

const timeseries = require("../docs/timeseries.json");
const writeFile = promisify(fs.writeFile);

async function main() {
  // const TEXT_FOR_DATE = "По состоянию на";

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://xn--80aesfpebagmfblc0a.xn--p1ai/", {
    timeout: 60000
  });

  // const dateText = await page.$eval(
  //   "#operational-data > div > div > h2 > span > small",
  //   node => node.textContent
  // );

  // const date = format(
  //   parse(
  //     dateText.replace(TEXT_FOR_DATE, "").trim(),
  //     "d MMMM H:mm",
  //     new Date(),
  //     {
  //       locale: ru
  //     }
  //   ),
  //   "yyyy-MM-dd"
  // );

  const date = format(new Date(), "yyyy-MM-dd");

  const data = await page.$$eval(
    "#operational-data div.d-map__main > div.d-map__list > table tr",
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
