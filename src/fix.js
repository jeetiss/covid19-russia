const timeseries = require("../docs/timeseries.json");
const prettier = require("prettier");
const fs = require("fs/promises");

const main = async () => {
  Object.keys(timeseries)
    .forEach((key) => {
      const last3 = timeseries[key].slice(-3);

      last3[1].confirmed = String(
        Number(last3[0].confirmed) + Number(last3[1].confirmed)
      );
      last3[1].deaths = String(
        Number(last3[0].deaths) + Number(last3[1].deaths)
      );
      last3[1].recovered = String(
        Number(last3[0].recovered) + Number(last3[1].recovered)
      );

      last3[2].confirmed = String(
        Number(last3[1].confirmed) + Number(last3[2].confirmed)
      );
      last3[2].deaths = String(
        Number(last3[1].deaths) + Number(last3[2].deaths)
      );
      last3[2].recovered = String(
        Number(last3[1].recovered) + Number(last3[2].recovered)
      );
    });

  await fs.writeFile(
    require.resolve("../docs/timeseries.json"),
    prettier.format(JSON.stringify(timeseries), {
      printWidth: 90,
      parser: "json",
    })
  );
};

main();
