'use strict';

window.addEventListener('load', init);

// Inisialisasi aplikasi
function init() {
  
  // --- TARUH KODE PERBAIKAN MARKER DI SINI ---
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl       : 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl : 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl     : 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize      : [25, 41],     // Ukuran asli gambar
    iconAnchor    : [12.5, 41],   // 12.5 menarik sumbu X persis ke tengah
    popupAnchor   : [0, -41],
    shadowSize    : [41, 41],
    shadowAnchor  : [13, 41]
  });
  // -------------------------------------------

  initMap();
  loadPrimaryData(); // Dipanggil dari JS 3
}

// Inisialisasi Peta Leaflet (Tanpa Cluster)
function initMap() {
  Map = new L.map('map', { 
    minZoom: 2 
  }).setView([-0.789, 113.921], 5);

  let cartoLayer = new L.tileLayer(CARTO_LAYER_URL, {
    attribution : CARTO_LAYER_ATTRIBUTION,
    maxZoom     : TILE_LAYER_MAX_ZOOM,
  }).addTo(Map);

  let osmLayer = new L.tileLayer(OSM_LAYER_URL, {
    attribution : OSM_LAYER_ATTRIBUTION,
    maxZoom     : TILE_LAYER_MAX_ZOOM,
  });

  let baseMaps = {
    'CARTO Voyager'       : cartoLayer,
    'OpenStreetMap Carto' : osmLayer,
  };
  
  L.control.layers(baseMaps, null, {position: 'topleft'}).addTo(Map);
}

// Fungsi inti untuk menembak API Wikidata
function queryWdqsThenProcess(query, processEachResult, postprocessCallback) {
  let promise = new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== xhr.DONE) return;
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(xhr.status);
      }
    };
    xhr.open('POST', WDQS_API_URL, true);
    xhr.overrideMimeType('text/plain');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send('format=json&query=' + encodeURIComponent(query));
  });

  promise = promise.then(data => {
    if (data.results && data.results.bindings) {
      data.results.bindings.forEach(processEachResult);
    }
  });

  if (postprocessCallback) promise = promise.then(postprocessCallback);
  return promise;
}
