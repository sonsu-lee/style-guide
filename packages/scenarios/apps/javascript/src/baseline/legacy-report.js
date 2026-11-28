// expect: error unicorn(no-new-array) -- The report starts with holes instead of rows.
export const reportRows = new Array(3);
// Without type information this ignored promise is not reported.
fetch('/reports/orders');
