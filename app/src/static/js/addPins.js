export function addPin(parentEl, { id, number, occupied, capacity, lat, lng }) {
    const pin = document.createElement('shelter-pin');
    if (id) pin.dataset.id = id;
  
    pin.setAttribute('number', String(number));
    pin.setAttribute('occupied', String(occupied));
    pin.setAttribute('capacity', String(capacity));
    pin.setAttribute('lat', String(lat));
    pin.setAttribute('lng', String(lng));
  
    parentEl.appendChild(pin);
    return pin;
  }