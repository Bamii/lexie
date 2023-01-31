import React, { useEffect, useState } from "react";
import papa from "papaparse";
// import datacsv from "bundle-text:../data/OSMV-20151117.csv";

export default function() {
  const worker = new Worker(new URL("./worker.js", import.meta.url))
  const [headers, setHeaders] = useState({});
  const [data, setData] = useState([]);
  
  // useEffect(() => {
  //   console.log(data)
  // })
  
  useEffect(() => {
    if(!data.length)
      fetchit();
  }, [data]);
  
  
  async function getData() {
    try {
      // const datacsv = await import("bundle-text:../data/OSMV-20151117.csv");
      const datacsv = "";
      const results = [];
      
      return new Promise(resolve => {
        papa.parse(datacsv, {
          worker: true,
          step: function({ data }) {
            results.push(data);
          },
          complete: () => {
            console.log(results);
            resolve(results);
          }
        });
      })
    } catch (error) {
      console.log(error)
      throw new Error("Could not parse file.")
    }
  }

  function getHeaderPosition(key) {
    return headers[key]
  }

  async function fetchit() {
    try {
      const _data = await getData();
      console.log(_data);
      const [headers, ...data] = _data;
      
      // normalize headers.
      setHeaders(headers.reduce((acc, curr, index) => ({ ...acc, [curr]: index }), {}))
      setData(data);
    } catch (error) {
      console.log("something went wrong");
    }
  }

  // filter singualr 
  const filter = async function(data, { filters: { key, value }, group }) {
    const LIMIT = 10;
    const groups = [];
    // console.log(key, headers[key], value, data)
    
    const position = getHeaderPosition(key);
    const groupPosition = getHeaderPosition(group);

    let filtered = [];
    for(let row of data) {
      if(groups.length < LIMIT) {
        if(row[position] === value) {
          filtered.push(row);

          if(!groups.includes(row[groupPosition]))
            groups.push(row[groupPosition]);
        }
      } else {
        if(row[groupPosition] === groups[LIMIT-1]) {
          filtered.push(row);
        } else {
          break;
        }
      }
    }

    // console.log(groups);
    // console.log(filtered);
    if(group) {
      return filtered.reduce((acc, curr) => {
        const position = getHeaderPosition(group);
        const ticker = curr[position];
        return { ...acc, [ticker]: [...(acc[ticker] ?? []), curr] }
      }, {});
    }
    
    return filtered;
  }

  async function stock_price (data) {    
    const position = getHeaderPosition("stkPx")
    const price = data[0][position];
    console.log(data[0]);
    console.log(price);
    return data[0][position];
  }

  const task_1 = async function () {
    if(data.length > 0) {
      // filter the data by date (december ending).
      const ftd = await filter(data, {
        filters: { key: "expirDate", value: "12/31/2015" },
        group: "ticker"
      });
      
      // process for one ticker.
      console.log("filter:")
      console.log(ftd)
      const [header] = Object.keys(ftd);
      const tickerData = ftd[header];
  
      // get the stock price.
      const premium = await stock_price(tickerData);

      // find the AT THE MONEY
      // since the data is sorted,
      // do binary search to find closest sibling.
      let strike_position = getHeaderPosition("strike");
      let mid = Math.floor((tickerData.length - 1) / 2);
      let start = 0;
      let end = tickerData.length - 1;
      let found = false;
      let AT_THE_MONEY = null;
      let res_obj = null;
      let founded = null;

      while(!found) {
        console.log(mid,end)
        let mid_row = tickerData[mid];

        if(mid_row[strike_position] > premium) {
          end = mid;
          mid = Math.floor(mid / 2);
        } else if(mid_row[strike_position] < premium) {
          start = mid;
          mid = Math.floor((mid + end) / 2);
        } else if(mid_row[strike_position] === premium) {
          found = true;
          founded = mid;
          console.log(mid, mid_row);
        }

        const start_row = tickerData[start];
        const end_row = tickerData[end];
        mid_row = tickerData[mid];
        if(end - mid <= 1) {
          found = true;
          let left, right;
          let left_obj, right_obj;
          if(mid_row[strike_position] > premium) {
            left = start_row[strike_position]; 
            left_obj = start_row;
            right = mid_row[strike_position]
            right_obj = mid_row;
            AT_THE_MONEY = premium - left < right - premium ? left : right;
            res_obj = premium - left < right - premium ? left_obj : right_obj;
          } else if(mid_row[strike_position] < premium) {
            left = mid_row[strike_position];
            left_obj = mid_row;
            right = end_row[strike_position];
            right_obj = end_row;
            AT_THE_MONEY = premium - left < right - premium ? left : right;
            res_obj = premium - left < right - premium ? left_obj : right_obj;
          } else {
            founded = mid;
            CLOSEST = mid_row[strike_position];
            res_obj = mid_row;
          }
          
          console.log(AT_THE_MONEY, founded, res_obj);
          // console.log(tickerData[start], tickerData[end], tickerData[mid]);
        }
      }

      // find the strike closest to the AT_THE_MONEY
      strike_position = getHeaderPosition("strike");
      mid = Math.floor((tickerData.length - 1) / 2);
      start = 0;
      end = tickerData.length - 1;
      found = false;
      CLOSEST = null;
      res_obj = null;
      founded = null;
      AT_THE_MONEY = 12;

      while(!found) {
        console.log(mid,end)
        let mid_row = tickerData[mid];

        console.log('11111')
        if(mid_row[strike_position] > AT_THE_MONEY) {
          end = mid;
          mid = Math.floor(mid / 2);
        } else if(mid_row[strike_position] < AT_THE_MONEY) {
          start = mid;
          mid = Math.floor((mid + end) / 2);
        } else if(mid_row[strike_position] === AT_THE_MONEY) {
          console.log('dfsdf')
          found = true;
          founded = mid;
          CLOSEST = mid_row[strike_position];
          console.log(mid, mid_row);
          break;
        }
        
        console.log('22222')

        const start_row = tickerData[start];
        const end_row = tickerData[end];
        mid_row = tickerData[mid];
        if(end - mid <= 1) {
          found = true;
          let left, right;
          let left_obj, right_obj;
          if(mid_row[strike_position] > AT_THE_MONEY) {
            left = start_row[strike_position]; 
            left_obj = start_row;
            right = mid_row[strike_position]
            right_obj = mid_row;
            CLOSEST = AT_THE_MONEY - left < right - AT_THE_MONEY ? left : right;
            res_obj = AT_THE_MONEY - left < right - AT_THE_MONEY ? left_obj : right_obj;
          } else if(mid_row[strike_position] < AT_THE_MONEY) {
            left = mid_row[strike_position];
            left_obj = mid_row;
            right = end_row[strike_position];
            right_obj = end_row;
            CLOSEST = AT_THE_MONEY - left < right - AT_THE_MONEY ? left : right;
            res_obj = AT_THE_MONEY - left < right - AT_THE_MONEY ? left_obj : right_obj;
          } else {
            founded = mid;
            CLOSEST = mid_row[strike_position];
            res_obj = mid_row;
          }
          
          console.log(CLOSEST, founded, res_obj);
          // console.log(tickerData[start], tickerData[end], tickerData[mid]);
        }
      }
    }
  }

  function binary_search(array, value, position) {
    let mid = Math.floor((array.length - 1) / 2);
    let start = 0;
    let end = array.length - 1;
    let found = false;
    let founded = null;
    let AT_THE_MONEY = null;
    let res_obj = null;

    while(!found) {
      let mid_row = array[mid];

      if(mid_row[position] > value) {
        end = mid;
        mid = Math.floor(mid / 2);
      } else if(mid_row[position] < value) {
        start = mid;
        mid = Math.floor((mid + end) / 2);
      } else if(mid_row[position] === value) {
        found = true;
        founded = mid;
        console.log(mid_row);
      }

      const start_row = array[start];
      const end_row = array[end];
      mid_row = array[mid];
      if(end - mid <= 1) {
        found = true;
        let left, right;
        let left_obj, right_obj;
        if(mid_row[position] > value) {
          left = start_row[position]; 
          left_obj = start_row;
          right = mid_row[position]
          right_obj = mid_row;
          AT_THE_MONEY = value - left < right - value ? left : right;
          res_obj = value - left < right - value ? left_obj : right_obj;
        } else if(mid_row[position] < value) {
          left = mid_row[position];
          left_obj = mid_row;
          right = end_row[position];
          right_obj = end_row;
          AT_THE_MONEY = value - left < right - value ? left : right;
          res_obj = value - left < right - value ? left_obj : right_obj;
        } else {
          founded = mid;
          CLOSEST = mid_row[position];
          res_obj = mid_row;
        }

        AT_THE_MONEY = value - left < right - value ? left : right;
        res_obj = value - left < right - value ? left_obj : right_obj;
        
        console.log(AT_THE_MONEY, founded, res_obj);
      }
    }

    return founded && {
      index: founded,
      value: res_obj
    }
  }

  // const data = papa.parse()
  return {
    fetchit,
    filter,
    strike: stock_price,
    task_1,
    headers,
    data
  }
}
