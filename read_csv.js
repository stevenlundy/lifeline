
var get = function(url) {
  return new Promise (function (resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        resolve(request.responseText);
      } else {
        // We reached our target server, but it returned an error
        reject(request.statusText);
      }
    };

    request.onerror = function(msg) {
      // There was a connection error of some sort
      reject(msg);
    };

    request.send();
  })
};

var parseCSVToObject = function (csv) {
  var rows = csv.split('\n').map(function(str) { return str.trim(); });
  var columnHeaders = rows.shift().split(','); // TODO: check for uniqueness
  return rows.map(function(row) {
    if (row.trim().length) {
      return row.split(',').reduce(function(rowObject, value, i) {
        rowObject[columnHeaders[i]] = value.trim();
        return rowObject;
      }, {});
    }
  })
};
