const PT = require('./src/data.json');

const numbers = PT.reduce(function (obj, element) {
    obj[element.atomicNumber] = element;
    return obj;
}, {});

console.log(numbers[8]);