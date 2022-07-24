// Some constants
const CounterType = {
  Total: 'Total',
  Unique: 'Unique',
};
Object.freeze(CounterType);

const StorageValue = {
  Yes: 'Yes',
  No: 'No',
};
Object.freeze(StorageValue);

const VisitedStorageKeyword = "visited";

const toHash = val => {
  // http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
    var hash = 0;
    for (var i = 0; i < val.length; i++) {
        var char = val.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString();
}

// counter API
function makeCounterAPIRequest({ method, namespace, key }) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();

    xhr.open("GET", `https://api.countapi.xyz/${method}/${namespace}/${key}`);
    xhr.responseType = "json";

    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(this.response.value);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };

    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };

    xhr.send();
  });
}

const increaseCounter = ({ namespace, key }) => {
  // console.log("increase counter for: " + namespace, ", " + key);
  return makeCounterAPIRequest({ method: 'hit', namespace, key });
}

const getCounter = ({ namespace, key }) => {
  // console.log("get counter for: " + namespace, ", " + key);
  return makeCounterAPIRequest({ method: 'get', namespace, key });
}

// storage helpers
const isSessionActive = path => {
  return window.sessionStorage.getItem(`${VisitedStorageKeyword}_${path}`) === StorageValue.Yes ? true : false;
}

const setSessionActive = path => {
  window.sessionStorage.setItem(`${VisitedStorageKeyword}_${path}`, StorageValue.Yes);
}

const isPageVisited = path => {
  return window.localStorage.getItem(`${VisitedStorageKeyword}_${path}`) === StorageValue.Yes ? true : false;
}

const setPageVisited = path => {
  window.localStorage.setItem(`${VisitedStorageKeyword}_${path}`, StorageValue.Yes);
}

// main
const runCounter = ({ namespace, path }) => {
  const path_hashed = toHash(path);
  const totalCounterVars = { namespace, key: `${path_hashed}_${CounterType.Total}` };
  const UniqueCounterVars = { namespace, path, key: `${path_hashed}_${CounterType.Unique}` };

  const totalCounterPromise = isSessionActive(path_hashed) ? getCounter(totalCounterVars) : increaseCounter(totalCounterVars);
  const uniqueCounterPromise = isPageVisited(path_hashed) ? getCounter(UniqueCounterVars) : increaseCounter(UniqueCounterVars);

  totalCounterPromise
    .then(value => $('#total-counter').append(value))
    .catch(_ => $('#total-counter').append('-'));

  uniqueCounterPromise
    .then(value => $('#unique-counter').append(value))
    .catch(_ => $('#total-counter').append('-'));

  setSessionActive(path_hashed);
  setPageVisited(path_hashed);
}
