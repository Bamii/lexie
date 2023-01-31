var express = require('express');
var router = express.Router();
const { open } = require('node:fs/promises');

let data = [];
let headers = null;

(async () => {
  const file = await open('./data/OSMV-20151117.csv');

  for await (const line of file.readLines()) {
    data.push(line.split(","))
  }

  const [_header, ..._data] = data;
  data = _data;
  headers = _header.reduce((acc, curr, index) => ({ ...acc, [curr]: index }), {});
})();

function getHeaderPosition(key) {
  return headers[key]
}

async function stock_price (data) {    
  const position = getHeaderPosition("stkPx");
  return data[0][position];
}

// filter singualr 
const filter = async function(data, { filters: { key, value, test }, group }) {
  const LIMIT = 10;
  const groups = [];
  const position = getHeaderPosition(key);
  const groupPosition = getHeaderPosition(group);

  let filtered = [];
  for(let row of data) {
    if(groups.length < LIMIT) {
      const compare = test ? test(row[position]) : row[position] === value;
      if(compare) {
        filtered.push(row);

        if(!groups.includes(row[groupPosition]))
          groups.push(row[groupPosition]);
      }
    } else {
      if(row[groupPosition] === groups[LIMIT-1]) {
        const compare = test ? test(row[position], row) : row[position] === value;
        if(compare) {
          filtered.push(row);
        }
      } else {
        break;
      }
    }
  }

  if(group) {
    return filtered.reduce((acc, curr) => {
      const position = getHeaderPosition(group);
      const ticker = curr[position];
      return { ...acc, [ticker]: [...(acc[ticker] ?? []), curr] }
    }, {});
  }
  
  return filtered;
}

function binary_search(array, value, position) {
  let start = 0;
  let mid = Math.floor((array.length - 1) / 2);
  let end = array.length - 1;
  let found = false;
  let found_position = null;
  let res_obj = null;

  while(!found) {
    let mid_row = array[mid];

    const mid_pos = Number.parseFloat(mid_row[position]);
    const comparer = Number.parseFloat(value);
    if(mid_pos > comparer) {
      end = mid;
      mid = Math.floor(mid / 2);
    } else if(mid_pos < comparer) {
      start = mid;
      mid = Math.floor((mid + end) / 2);
    } else if(mid_pos === comparer) {
      found = true;
      found_position = mid;
    }

    const start_row = array[start];
    const end_row = array[end];
    mid_row = array[mid];
    if(end - mid <= 1) {
      found = true;
      let left, right;
      if(mid_row[position] > value) {
        left = start_row[position];
        right = mid_row[position]

        found_position = value - left < right - value ? start : mid;
        res_obj = value - left < right - value ? start_row : mid_row;
      } else if(mid_row[position] < value) {
        left = mid_row[position];
        right = end_row[position];

        found_position = value - left < right - value ? mid : end;
        res_obj = value - left < right - value ? mid_row : end_row;
      } else {
        found_position = mid;
        res_obj = mid_row;
      }
    }
  }

  return {
    index: found_position,
    value: res_obj
  }
}

/* GET home page. */
router.get('/task1', async function(req, res) {
  const tickers = {};
  const strike_position = getHeaderPosition("strike");

  if(data.length > 0) {
    // filter the data by date (december ending).
    const filtered = await filter(data, {
      filters: { key: "expirDate", value: "12/31/2015" },
      group: "ticker"
    });
    
    for (let header of Object.keys(filtered)) {
      const tickerData = filtered[header];
      // get the stock price.
      const premium = await stock_price(tickerData);
  
      // get the AT THE MONEY
      // since the data is sorted,do binary search to find closest sibling.
      let search = binary_search(
        tickerData,
        premium,
        strike_position
      );

      // find the closest strike to the ATM
      const left = tickerData[search.index-1]
      const right = tickerData[search.index+1]
      const ATM = search.value?.[strike_position];
      const closest = Math.abs(left - ATM) > Math.abs(right - ATM) ? right[strike_position] : left[strike_position];

      // append into object.
      tickers[header] = {
        stock_price: premium,
        at_the_money: ATM,
        closest_strike: closest,
        percentage: (premium / closest)*100
      }
    }
  }

  res.send(tickers);
});

router.get('/task2', async function(req, res) {
  let processed = {};

  if(data.length > 0) {
    // filter the data by date (december ending).
    const filtered = await filter(data, {
      filters: {
        key: "expirDate",
        test: (value) => {
          const date = new Date(value);
          return date.getMonth() == 11;
        }
      },
      group: "ticker"
    });

    processed = Object.entries(filtered).reduce((acc, [ticker, options]) => {
      return {
        ...acc,
        [ticker]: options.map(option => {
          return {
            date: option[getHeaderPosition("expirDate")],
            price: option[getHeaderPosition("stkPx")],
            strike: option[getHeaderPosition("strike")],
            percentage: (option[getHeaderPosition("stkPx")] / option[getHeaderPosition("strike")]) * 100
          }
        })
      }
    }, {})
  }

  res.send(processed);
});

module.exports = router;
