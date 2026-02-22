
export function setOccupied(pinEl, occupied) {
    pinEl.setAttribute('occupied', String(occupied));
  }
  
  export function setCapacity(pinEl, capacity) {
    pinEl.setAttribute('capacity', String(capacity));
  }
  
  export function setFill(pinEl, occupied, capacity) {
    pinEl.setAttribute('occupied', String(occupied));
    pinEl.setAttribute('capacity', String(capacity));
  }