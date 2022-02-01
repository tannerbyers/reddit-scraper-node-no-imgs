# reddit-scraper-node-no-imgs

This is a node script that uses puppetter and loads the url (listed at top of script), scrolls to the bottom, waits a few seconds, then tries to scroll again until it cant since reddit has the infinite scroll and doesnt paginate pages.

It then takes the title and decription of each post and at the end, saves it in a spreadsheet. 

`
yarn

node index.js
`
