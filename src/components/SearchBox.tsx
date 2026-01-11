import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-control-geocoder";

export default function SearchBox() {
  const map = useMap();

  useEffect(() => {
    const geocoder = (L.Control as any).geocoder({
      defaultMarkGeocode: true,
      placeholder: "Search country, state or city",
    })
      .on("markgeocode", function (e: any) {
        const bbox = e.geocode.bbox;
        const bounds = L.latLngBounds(
          bbox.getSouthEast(),
          bbox.getNorthWest()
        );
        map.fitBounds(bounds);
      })
      .addTo(map);

    return () => {
      map.removeControl(geocoder);
    };
  }, [map]);

  return null;
}
