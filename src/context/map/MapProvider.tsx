import { AnySourceData, LngLatBounds, Map, Marker, Popup } from "mapbox-gl";
import { useContext, useEffect, useReducer } from "react";
import { directionsApi } from "../../apis";
import { DirectionsResponse } from "../../interfaces/directions";
import { PlacesContext } from "../places/PlacesContext";
import { MapContext } from "./MapContext";
import { mapReducer } from "./mapReducer";

export interface MapState {
    isMapReady: boolean;
    map?: Map;
    markers: Marker[]
}

const INITIAL_STATE: MapState = {
    isMapReady: false,
    map: undefined,
    markers: [],
}

interface Props {
    children: JSX.Element | JSX.Element[];
}

export const MapProvider = ({ children }: Props) => {

  const [state, dispatch] = useReducer(mapReducer, INITIAL_STATE);
  const { places } = useContext(PlacesContext);

  useEffect(() => {
    state.markers.forEach(marker => marker.remove());

    const newMarkers: Marker[] = [];
    for (const place of places) {
      console.log(place)
      const [lng, lat] = place.center;
      const popup = new Popup()
        .setHTML(`
          <h6>${ place.text_es }</h6>
          <p>${ place.place_name_es }</p>
        `);
      const newMarker = new Marker()
        .setPopup(popup)
        .setLngLat([lng, lat])
        .addTo(state.map!);
      newMarkers.push(newMarker);
    }
    dispatch({ type: 'setMarkers', payload: newMarkers });
  }, [places])


  const setMap = (map: Map) => {
    const myLocationPopup = new Popup()
      .setHTML(`
        <h4>Aquí estoy</h4>
        <p>En algun lugar del mundo</p>
      `)

    new Marker({
      color: '#61DAFB'
    })
    .setLngLat(map.getCenter())
    .setPopup(myLocationPopup)
    .addTo(map);

    dispatch({ type: 'setMap', payload: map });
  }

  const getRouteBetweenPoints = async(start: [number, number], end: [number, number]) => {
    const resp = await directionsApi.get<DirectionsResponse>(`/${start.join(',')};${end.join(',')}`);
    const { distance, duration, geometry } = resp.data.routes[0];
    const { coordinates: coords } = geometry;

    let kms = distance / 1000;
    kms = Math.round(kms * 100);
    kms = kms / 100;

    const minutes = Math.floor(duration / 60);

    const bounds = new LngLatBounds(
      start,
      start
    );

    for (const coord of coords) {
      const newCoord: [number, number] = [coord[0], coord[1]];
      bounds.extend(newCoord);
    }
    // con esto el mapa se acomoda para que muestre ambos puntos en el mapa
    state.map?.fitBounds(bounds, {
      padding: 200
    });

    // polyline
    const sourceData: AnySourceData = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords,
            }
          }
        ]
      }
    };
    // remover polyline si existe, solo se puede tener un elemento con el id
    if (state.map?.getLayer('RouteString')) {
      state.map.removeLayer('RouteString');
      state.map.removeSource('RouteString');
    }
    // RouteString es el id de la polyline
    state.map?.addSource('RouteString', sourceData);
    // addLayer para que se pinte en el mapa
    state.map?.addLayer({
      id: 'RouteString',
      type: 'line',
      source: 'RouteString',
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': 'black',
        'line-width': 3
      }
    });
  }

  return (
    <MapContext.Provider value={{
        ...state,
        // METHODS
        setMap,
        getRouteBetweenPoints,
    }}>
        { children }
    </MapContext.Provider>
  )
}
