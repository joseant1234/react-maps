import { ChangeEvent, useContext, useRef } from "react"
import { PlacesContext } from "../context";
import { SearchResults } from "./SearchResults";


export const SearchBar = () => {

    const { searchPlacesByTerm } = useContext(PlacesContext);
    const debounceRef = useRef<NodeJS.Timeout>();

    const onQueryChanged = (event: ChangeEvent<HTMLInputElement>) => {
        //  cada vez que cambie el valor del input se borra lo que tiene guardado en el timeout
        // si tiene valor se limpia
        if (debounceRef.current)
            clearTimeout(debounceRef.current);
        // despues de la limpieza se vuelve a definir
        debounceRef.current = setTimeout(() => {
            // buscar o ejecutar una consulta
            searchPlacesByTerm(event.target.value);
        }, 350);
    }

    return (
        <div className="search-container">
            <input
                type="text"
                className="form-control"
                placeholder="Buscar lugar..."
                onChange={ onQueryChanged }
            />
           <SearchResults />
        </div>
    )
}
