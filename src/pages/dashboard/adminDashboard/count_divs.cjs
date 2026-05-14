const fs = require('fs');
const content = fs.readFileSync('d:/Hotel_Janro/front-end/src/pages/dashboard/adminDashboard/AdminPos.jsx', 'utf8');

let openDivs = 0;
let closeDivs = 0;
let pos = 0;

while ((pos = content.indexOf('<div', pos)) !== -1) {
    openDivs++;
    pos += 4;
}

pos = 0;
while ((pos = content.indexOf('</div>', pos)) !== -1) {
    closeDivs++;
    pos += 6;
}

console.log(`Open Divs: ${openDivs}`);
console.log(`Close Divs: ${closeDivs}`);
console.log(`Difference: ${openDivs - closeDivs}`);
