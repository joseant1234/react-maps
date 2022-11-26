import { useEffect, useReducer } from "react";
import { getUserLocation } from "../../helpers";
import { PlacesContext } from "./PlacesContext";
import { placesReducer } from "./placesReducer";

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
  }, [])


  return (
    <PlacesContext.Provider value={{
        ...state
    }}>
        { children }
    </PlacesContext.Provider>
  )
}
