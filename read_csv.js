// Has dependency on moment.js
(function() {
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
    var columnHeaders = rows.shift().split(',');
    for (var i = 1; i < columnHeaders.length; i++) {
      if (columnHeaders.indexOf(columnHeaders[i - 1], i) >= 0) {
        return Promise.reject('Column headings must be unique.')
      }
    }
    return rows.map(function(row) {
      if (row.trim().length) {
        return row.split(',').reduce(function(rowObject, value, i) {
          rowObject[columnHeaders[i]] = value.trim();
          return rowObject;
        }, {});
      }
    })
  };

  var applyTransformationsToObjects = function (objects, transformations) {
    objects.forEach(function(object) {
      for (key in transformations) {
        if (object && key in object) {
          object[key] = transformations[key](object[key]);
        }
      }
    });
    return objects
  };

  var getDateFromDateString = function(dateString, dateFormat) {
    return moment(dateString, dateFormat.slice(0, dateString.length));
  };

  var prepareData = function (objects) {
    var dateFormat = 'YYYYMMDDHHMMSS';
    var transformations = {
      category: function(str) { return str.toLowerCase(); },
      end: function(str) { return str == 'present' ? moment() : getDateFromDateString(str, dateFormat); },
      id: Number,
      start: function(str) { return getDateFromDateString(str, dateFormat) }
    }
    return applyTransformationsToObjects(objects, transformations);
  }

  window.getCSVData = function (url) {
    return get(url)
      .then(parseCSVToObject)
      .then(prepareData)
  };
})();
