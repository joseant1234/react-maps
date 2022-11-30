import { useEffect, useReducer } from "react";
import { getUserLocation } from "../../helpers";
import { PlacesContext } from "./PlacesContext";
import { placesReducer } from "./placesReducer";
import { searchApi } from "../../apis";

export interface PlacesState {
    isLoading: boolean;
    userLocation?: [number, number];
}

export const INITIAL_STATE: PlacesState = {
    isLoading: true,
    userLocation: undefined,
}

interface Props {
    children: JSX.Element | JSX.Element[];
}

export const PlacesProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(placesReducer, INITIAL_STATE);

  // solo se ejecuta una vez, cuando el PlacesProvider es montado
  // no se puede poner dentro de un useEffect un async
  useEffect(() => {
    getUserLocation()
    .then(lngLat => dispatch({ type: 'setUserLocation', payload: lngLat }))
  }, []);

  const searchPlacesByTerm = async(query: string) => {
    if (query.length === 0) return [];
    if (!state.userLocation) throw new Error('No hay ubicación del usuario');

    const resp = await searchApi.get(`/${query}.json`, {
      params: {
        proximity: state.userLocation.join(',')
      }
    });

    console.log(resp.data);
    return resp.data;
  }


  return (
    <PlacesContext.Provider value={{
        ...state,
        // Methods
        searchPlacesByTerm
    }}>
        { children }
    </PlacesContext.Provider>
  )
}
