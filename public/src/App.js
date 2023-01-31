import React, { useEffect, useState } from 'react';
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import useDataSource from './hooks/useDataSource';
import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const { filter, data: _data, strike, task_1 } = useDataSource();
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState({});
  const [ticker, setTicker] = useState("");

  useEffect(() => {
    async function me() {
      const res = await fetch('/task1');
      const data = await res.json();
      setData1(data);
      console.log(data)

      const res2 = await fetch('/task2');
      const data2 = await res2.json();
      setData2(data2);
      console.log(data2)
      setTicker(Object.keys(data2)[0])
    }
    me();
  }, [true]);

  return (
    <div className="App">
      <div className='section'>
        <div className='question'>
          Find the strike closest to the ATM (at the money) for December end expiration, calculate
          the price of the option as a % of strike price, and chart them.
        </div>
        {/* <div className='tickers-details'>
          {Object.entries(data1).map(([ticker, { stock_price, percentage, closest_strike, at_the_money }]) => {
            return (
              <div className='ticker-details'>
                <div> {ticker} </div>
                <div>
                  <span>stock price: </span>
                  <span>{stock_price}</span>
                </div>
                <div>
                  <span>AT THE MONEY (ATM)</span>
                  <span>{at_the_money}</span>
                </div>
                <div>
                  <span>closest strike to ATM</span>
                  <span>{closest_strike}</span>
                </div>
                <div>
                  <span>percentage of stock price to strike.</span>
                  <span>{percentage}%</span>
                </div>
              </div>
            )
          })}
        </div> */}
        <Bar
          options={{
            responsive: true,
            layout: {
              padding: 50
            },
            scales: {
              x: {
                ticks: {
                  color: "#6e6b80",
                }
              },
              y: {
                ticks: {
                  color: "#6e6b80",
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                title: {
                  color: "white"
                },
                subtitle: {
                  color: "white"
                },
                labels: {
                  color: "white"
                }
              },
              title: {
                display: true,
                text: 'lexie.ai Task 1',
                color: 'white'
              },
              customCanvasBackgroundColor: {
                color: '#363348',
              }      
            },
          }}
          plugins={[{
            id: 'customCanvasBackgroundColor',
            beforeDraw: (chart, args, options) => {
              const {ctx} = chart;
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = options.color || '#99ffff';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();
            }
          }]}
          data={{
            labels: Object.entries(data1).map(([label]) => label),
            datasets: [
              {
                label: 'Ticker price as a percentage of closest strike to ATM',
                data: Object.entries(data1).map(([,{ percentage }]) => percentage),
                borderColor: '#d0d9f7',
                backgroundColor: '#788eea',
              }
            ]
          }}
        />
      </div>

      <div className='section'>
        <div className='question'>
          Plot the premium as a % of strike price for December across expiration dates.
        </div>
        <div className='tickers'>
          <div className='ticker-header'>choose a ticker</div>
          {Object
            .keys(data2)
            .map(key => (
              <button className='ticker' onClick={() => setTicker(key)}>
                {key}
              </button>
            ))}
        </div>
        <Line
          backgroundColor={"blue"}
          options={{
            responsive: true,
            layout: {
              padding: 50
            },
            scales: {
              x: {
                ticks: {
                  color: "#6e6b80",
                }
              },
              y: {
                ticks: {
                  color: "#6e6b80",
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                title: {
                  color: "white"
                },
                subtitle: {
                  color: "white"
                },
                labels: {
                  color: "white"
                }
              },
              title: {
                display: true,
                text: 'lexie.ai Task 1',
                color: 'white'
              },
              customCanvasBackgroundColor: {
                color: 'black',
              }      
            },
          }}
          plugins={[{
            id: 'customCanvasBackgroundColor',
            beforeDraw: (chart, args, options) => {
              const {ctx} = chart;
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = options.color || '#99ffff';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();
            }
          }]}
          data={{
            labels: data2?.[ticker]?.map(({date}) => date),
            datasets: [
              {
                label: 'Premium as a percentage of strike',
                data: data2?.[ticker]?.map(({percentage}) => percentage),
                borderColor: '#d0d9f7',
                backgroundColor: '#788eea',
              }
            ]
          }}
        />
      </div>
    </div>
  );
}

export default App;
