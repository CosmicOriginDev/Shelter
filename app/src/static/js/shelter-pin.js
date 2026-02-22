class ShelterPin extends HTMLElement {
    static get observedAttributes() {
      return ['number', 'capacity', 'occupied', 'lat', 'lng'];
    }
  
    connectedCallback() {
      this.render();
    }
  
    attributeChangedCallback() {
      this.render();
    }
  
    render() {
      const number = this.getAttribute('number') ?? '?';
      const capacity = parseInt(this.getAttribute('capacity') ?? '0', 10);
      const occupied = parseInt(this.getAttribute('occupied') ?? '0', 10);
      const lat = this.getAttribute('lat') ?? '';
      const lng = this.getAttribute('lng') ?? '';
      const percent = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
  
      this.innerHTML = `
        <div class="pin">
          <button class="progress-ring" type="button" style="--percent:${percent}" aria-label="Navigate to pin ${number}">
            <span>${number}</span>
          </button>
        </div>
      `;
  
      this.querySelector('.progress-ring').onclick = () => {
        if (!lat || !lng) return;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
      };
    }
  }
  
  customElements.define('shelter-pin', ShelterPin);