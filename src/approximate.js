const timeseries = require("../docs/timeseries.json");
const prettier = require("prettier");
const fs = require("fs/promises");
const {
  format,
  parseISO,
  closestIndexTo,
  differenceInDays,
  addDays,
  compareAsc,
} = require("date-fns");

const KEYS = ["confirmed", "deaths", "recovered"];
const findDataForDate = (data, date) => {
  return Object.fromEntries(
    Object.entries(
      data[
        closestIndexTo(
          date,
          data.map((info) => parseISO(info.date))
        )
      ]
    ).map(([key, value]) =>
      KEYS.includes(key) ? [key, Number(value)] : [key, value]
    )
  );
};

const approximate = (data, from, to) => {
  let fromDate = parseISO(from);
  let toDate = parseISO(to);
  const dataFrom = findDataForDate(data, fromDate);
  const dataTo = findDataForDate(data, toDate);

  let index = fromDate;
  const end = addDays(toDate, -1);
  const prev = Object.assign({}, dataFrom);

  const result = [];

  while (compareAsc(index, end) !== 0) {
    index = addDays(index, 1);
    const days = differenceInDays(toDate, index) + 1;

    const calcProp = (prop) => {
      const total = dataTo[prop] - dataFrom[prop];
      const delta = Math.round(total / days);

      dataFrom[prop] = dataFrom[prop] + delta;

      prev[prop] += delta;

      return { [prop]: prev[prop].toString() };
    };

    const info = KEYS.map((key) => calcProp(key)).reduce(
      (a, b) => Object.assign(a, b),
      {
        date: format(index, "yyyy-MM-dd"),
      }
    );

    result.push(info);
  }

  return result;
};

const main = async () => {
  Object.keys(timeseries).forEach((key) => {
    const data = approximate(timeseries[key], "2021-07-09", "2021-07-19");

    timeseries[key] = timeseries[key]
      .concat(data)
      .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
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
