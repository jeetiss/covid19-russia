crawls and collects history coronavirus data from [стопкоронавирус.рф](https://xn--80aesfpebagmfblc0a.xn--p1ai/) for every district.
Available at https://jeetiss.github.io/covid19-russia/timeseries.json.
Updated three times a day using GitHub Actions.

The json contains the number of Coronavirus confirmed cases, deaths, and recovered cases in Russia for every district and every day since 2020-03-22:


```js
{
  "Москва": [
    { "date": "2020-03-22", "confirmed": "191", "deaths": "0", "recovered": "8" },
    { "date": "2020-03-23", "confirmed": "262", "deaths": "0", "recovered": "9" },
    { "date": "2020-03-24", "confirmed": "290", "deaths": "0", "recovered": "9" },
    //...
  ],
  //...
}
```

For example, if you want to use it from a web site:

```js
fetch("https://jeetiss.github.io/covid19-russia/timeseries.json")
  .then(response => response.json())
  .then(data => {
    data["Ростовская область"].forEach(({ date, confirmed, recovered, deaths }) =>
      console.log(`${date} active cases: ${confirmed - recovered - deaths}`)
    );
  });
```

## Projects using this dataset

- [www.cashin.ru](https://www.cashin.ru/virus/russia/): coronavirus stats for Russia


# License

The code from this repo is MIT licensed.

