import { buttonTemplate } from "./scripts/button.js";
import { addCurrentUserLocationBtn, addLegend, addSearchLeaflet, addSocioMetrikLogo, addTimeSeriesGraph, handleSearchDropdown, initializeMap } from "./scripts/mapControls.js";

let map = initializeMap();
addSearchLeaflet(map);
addCurrentUserLocationBtn(map);
handleSearchDropdown(map);
addSocioMetrikLogo(map);
addLegend(map);
addTimeSeriesGraph(map, "timeseries1", "TimeSeries Graph 1", 0, 50);
addTimeSeriesGraph(map, "timeseries2", "TimeSeries Graph 2", 100, 150, "red", "blue");