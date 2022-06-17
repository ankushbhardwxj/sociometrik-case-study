import { buttonTemplate } from "./button.js";

export function initializeMap() {
  let map = L.map('map').setView([51.505, -0.09], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Sociometrik'
  }).addTo(map);
  return map;
}

export function addCurrentUserLocationBtn(map) {
  let customControl = L.Control.extend({
    options: {
      position: "topleft",
      className: "locate-button leaflet-bar",
      html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>',
      style:
        "margin-top: 55px; left: 0; display: flex; cursor: pointer; justify-content: center; font-size: 2rem;",
    },

    // method
    onAdd: function (map) {
      this._map = map;
      const button = L.DomUtil.create("div");
      L.DomEvent.disableClickPropagation(button);

      button.title = "locate";
      button.innerHTML = this.options.html;
      button.className = this.options.className;
      button.setAttribute("style", this.options.style);

      L.DomEvent.on(button, "click", this._clicked, this);

      return button;
    },
    _clicked: function (e) {
      L.DomEvent.stopPropagation(e);

      // this.removeLocate();

      this._checkLocate();

      return;
    },
    _checkLocate: function () {
      return this._locateMap();
    },

    _locateMap: function () {
      const locateActive = document.querySelector(".locate-button");
      const locate = locateActive.classList.contains("locate-active");
      // add/remove class from locate button
      locateActive.classList[locate ? "remove" : "add"]("locate-active");

      // remove class from button
      // and stop watching location
      if (locate) {
        this.removeLocate();
        this._map.stopLocate();
        return;
      }

      // location on found
      this._map.on("locationfound", this.onLocationFound, this);
      // locataion on error
      this._map.on("locationerror", this.onLocationError, this);

      // start locate
      this._map.locate({ setView: true, enableHighAccuracy: true });
    },
    onLocationFound: function (e) {
      // add circle
      this.addCircle(e).addTo(this.featureGroup()).addTo(map);

      // add marker
      this.addMarker(e).addTo(this.featureGroup()).addTo(map);

      // add legend
    },
    // on location error
    onLocationError: function (e) {
      this.addLegend("Location access denied.");
    },
    // feature group
    featureGroup: function () {
      return new L.FeatureGroup();
    },
    // add legend
    addLegend: function (text) {
      const checkIfDescriotnExist = document.querySelector(".description");

      if (checkIfDescriotnExist) {
        checkIfDescriotnExist.textContent = text;
        return;
      }

      const legend = L.control({ position: "bottomleft" });

      legend.onAdd = function () {
        let div = L.DomUtil.create("div", "description");
        L.DomEvent.disableClickPropagation(div);
        const textInfo = text;
        div.insertAdjacentHTML("beforeend", textInfo);
        return div;
      };
      legend.addTo(this._map);
    },
    addCircle: function ({ accuracy, latitude, longitude }) {
      return L.circle([latitude, longitude], accuracy / 2, {
        className: "circle-test",
        weight: 2,
        stroke: false,
        fillColor: "#136aec",
        fillOpacity: 0.15,
      });
    },
    addMarker: function ({ latitude, longitude }) {
      return L.marker([latitude, longitude], {
        icon: L.divIcon({
          className: "located-animation",
          iconSize: L.point(17, 17),
          popupAnchor: [0, -15],
        }),
      }).bindPopup("Your are here :)");
    },
    removeLocate: function () {
      this._map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
          const { icon } = layer.options;
          if (icon?.options.className === "located-animation") {
            map.removeLayer(layer);
          }
        }
        if (layer instanceof L.Circle) {
          if (layer.options.className === "circle-test") {
            map.removeLayer(layer);
          }
        }
      });
    },
  });

  // adding new button to map controll
  map.addControl(new customControl());
}

export function addSocioMetrikLogo(map) {
  const logo = L.control({ position: "topleft" });

  logo.onAdd = function () {
    let div = L.DomUtil.create("div", "");
    L.DomEvent.disableClickPropagation(div);
    const text = `<img class="company-logo" src="https://www.sociometrik.org/wp-content/uploads/2020/05/logo-dark-e1592226885493.png">`;
    div.insertAdjacentHTML("beforeend", text);
    return div;
  };

  logo.addTo(map);
}

export function addLegend(map) {
  const legend = L.control({
    position: "topright",
  });
  const div = L.DomUtil.create("div", "legend");
  const color = ["#fe4789", "green", "orange", "blue", "aqua"];
  const label = ["Agriculture", "Forest", "Grassland", "Wetland", "Water"];

  const rows = [];
  legend.onAdd = function () {
    color.map((item, index) => {
      rows.push(`
          <div class="row">
            <i style="background: ${item}"></i>${label[index]}
          </div>  
      `);
    });
    div.innerHTML = rows.join("");
    return div;
  };

  legend.addTo(map);
}

export function addTimeSeriesGraph(map, name, graphTitle, startLimit, endLimit, color1="#17BECF", color2="#7F7F7F") {
  const timeSeries1 = L.control({ position: "topright" });
  timeSeries1.onAdd = function() {
    return L.DomUtil.get(name);
  }
  timeSeries1.addTo(map);
  let arr = [];
  d3.csv("https://raw.githubusercontent.com/plotly/datasets/master/finance-charts-apple.csv", (rows, err) => {
    arr.push(rows);
  }).then(() => {
    arr = arr.slice(startLimit, endLimit);
    const unpack = (rows, key) => {
      return rows.map(row => row[key]);
    }
    let trace1 = {
      type: "scatter",
      mode: "lines",
      name: "Type 1",
      x: unpack(arr, 'Date'),
      y: unpack(arr, 'AAPL.High'),
      line: {color: color1}
    }
    let trace2 = {
      type: "scatter",
      mode: "lines",
      name: 'Type 2',
      x: unpack(arr, 'Date'),
      y: unpack(arr, 'AAPL.Low'),
      line: {color: color2}
    }
    let data = [trace1, trace2];
    Plotly.newPlot(name, data, { title: graphTitle}, { scrollZoom: true });
  });
}

export function addSearchLeaflet(map) {
  let customControl = L.Control.extend({
    options: {
      position: "topleft",
      className: "leaflet-autocomplete",
    },

    onAdd: function () {
      return this._initialLayout();
    },

    _initialLayout: function () {
      const container = L.DomUtil.create(
        "div",
        "leaflet-bar " + this.options.className
      );
      L.DomEvent.disableClickPropagation(container);
      container.innerHTML = buttonTemplate;
      return container;
    },
  });

  map.addControl(new customControl());
}

export function handleSearchDropdown(map) {
  const root = document.getElementById("marker");

  function addClassToParent() {
    const searchBtn = document.querySelector(".leaflet-search");
    searchBtn.addEventListener("click", (e) => {
      e.target
        .closest(".leaflet-autocomplete")
        .classList.toggle("active-autocomplete");

      root.placeholder = "Search ...";

      root.focus();

      clickOnClearButton();
    });
  }

  // function click on clear button
  function clickOnClearButton() {
    document.querySelector(".auto-clear").click();
  }

  addClassToParent();

  map.on("click", () => {
    document
      .querySelector(".leaflet-autocomplete")
      .classList.remove("active-autocomplete");

    clickOnClearButton();
  });

  new Autocomplete("marker", {
    delay: 1000,
    selectFirst: true,
    howManyCharacters: 2,

    onSearch: function ({ currentValue }) {
      const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=${encodeURI(
        currentValue
      )}`;

      /**
       * Promise
       */
      return new Promise((resolve) => {
        fetch(api)
          .then((response) => response.json())
          .then((data) => {
            resolve(data.features);
          })
          .catch((error) => {
            console.error(error);
          });
      });
    },

    onResults: ({ currentValue, matches, template }) => {
      const regex = new RegExp(currentValue, "i");
      // checking if we have results if we don't
      // take data from the noResults method
      return matches === 0
        ? template
        : matches
            .map((element) => {
              return `
                <li role="option">
                  <p>${element.properties.display_name.replace(
                    regex,
                    (str) => `<b>${str}</b>`
                  )}</p>
                </li> `;
            })
            .join("");
    },

    onSubmit: ({ object }) => {
      const { display_name } = object.properties;
      const cord = object.geometry.coordinates;
      map.eachLayer(function (layer) {
        if (layer.options && layer.options.pane === "markerPane") {
          if (layer._icon.classList.contains("leaflet-marker-locate")) {
            map.removeLayer(layer);
          }
        }
      });

      const marker = L.marker([cord[1], cord[0]], {
        title: display_name,
      });

      marker.addTo(map).bindPopup(display_name);

      map.setView([cord[1], cord[0]], 8);

      L.DomUtil.addClass(marker._icon, "leaflet-marker-locate");
    },

    // the method presents no results
    noResults: ({ currentValue, template }) =>
      template(`<li>No results found: "${currentValue}"</li>`),
  });
}