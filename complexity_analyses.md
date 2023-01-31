# complexity analyses

### N.B
*1 represents constant time/space.*
*n represents a dataset of length n.*

## Task one: (routes/index.js)
### Computational complexity:
| Lines | complexity |
|------|----------|
| 127 | 1 |
| 131-134 | n |
| 136 | m |
| 137 | 1 |
| 139 | 1 |
| 143 | log n |
| 150 | 1 |
| 151 | 1 |
| 152 | 1 |
| 153 | 1 |
| 156-161 | 1 |
Total computational Complexity = 1 + n + m(1 + 1 + logn + 1 + 1 + 1 + 1 + 1)  =  n + m(logn) = mlogn.

### Space Complexity
| Line | Variable Name | complexity |
|------|----------|------------|
| 127 | strike_position | 1 |
| 126 | tickers | n |
| 131 | filtered | n |
| 136 | header | 1 |
| 137 | tickerData | 1 |
| 139 | premium | 1 |
| 143 | search | 1 |
| 150 | left | 1 |
| 151 | right | 1 |
| 152 | ATM | 1 |
| 153 | closest | 1 |
Total space complexity =  1 + n + n + 1 (8) = n

## Task two: (routes/index.js)
### Computational complexity:
| Lines | complexity |
|------|----------|
| 173 | n |
| 184 | n |
Total computational Complexity = n + n  =  n.

### Space Complexity
Line | Variable Name | complexity |
|------|----------|----------|
169 | processed | n |
173 | filtered | n |
Total space complexity =  n + n = n

# ...
The solution took me about 8 hours;
~ 4 hours to understand and come up with an algorithm to solve the question.
~ 2 hours writing logic; at first, I decided to do everything on the client browser, but I realized quickly how cpu intensive that could get, so I decided to go for a server-client model instead. I spun up a server to process the csv file, and created endpoints for the browser to query to get the data necessary for charting. (this was magnitudes faster than my previous implantation, and way less cpu intensive).
~ 2 hours building the charts and making it look visually close to samples on the instructions doc.
