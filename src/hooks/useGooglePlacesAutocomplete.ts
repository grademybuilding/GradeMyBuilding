import { useEffect, useRef, useCallback } from 'react';

interface AddressComponents {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface UseGooglePlacesAutocompleteOptions {
  onPlaceSelect: (components: AddressComponents) => void;
}

export function useGooglePlacesAutocomplete({ onPlaceSelect }: UseGooglePlacesAutocompleteOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || autocompleteRef.current) return;
    
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps?.places) {
      // Retry after a short delay if API isn't loaded yet
      setTimeout(initAutocomplete, 100);
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address'],
      types: ['address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (!place.address_components) return;

      let streetNumber = '';
      let route = '';
      let city = '';
      let state = '';
      let zipCode = '';

      for (const component of place.address_components) {
        const type = component.types[0];

        switch (type) {
          case 'street_number':
            streetNumber = component.long_name;
            break;
          case 'route':
            route = component.long_name;
            break;
          case 'locality':
            city = component.long_name;
            break;
          case 'sublocality_level_1':
            // Fallback for cities like New York
            if (!city) city = component.long_name;
            break;
          case 'administrative_area_level_1':
            state = component.short_name;
            break;
          case 'postal_code':
            zipCode = component.long_name;
            break;
        }
      }

      const address = streetNumber && route 
        ? `${streetNumber} ${route}` 
        : route || place.formatted_address || '';

      onPlaceSelect({
        address,
        city,
        state,
        zipCode,
      });
    });

    autocompleteRef.current = autocomplete;
  }, [onPlaceSelect]);

  useEffect(() => {
    initAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [initAutocomplete]);

  return { inputRef };
}
