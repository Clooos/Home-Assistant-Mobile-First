class RGBLightCard extends HTMLElement {
    set hass(hass) {
        this._hass = hass;
        if (!this.content) {
            this.init();
            this.update();
        }
        this.setVisibility();
    }

    init() {
        let shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(RGBLightCard.getStaticCSS());

        this.content = document.createElement('div');
        this.content.className = 'wrapper';
        this.content.onclick = (ev) => ev.stopPropagation();
        shadow.appendChild(this.content);
    }

    update() {
        this.content.innerHTML = '';
        this.content.appendChild(this.getDynamicCSS());
        for (const color of this.config.colors) {
            const element = document.createElement('div');
            element.className = 'color';

            const circle = document.createElement('div');
            circle.className = 'color-circle';
            circle.style.background = RGBLightCard.getCSSColor(color);
            circle.addEventListener('click', () => this.applyColor(color));
            element.appendChild(circle);

            const label = document.createElement('div');
            label.className = 'color-label';
            label.innerHTML = color.label || '';
            element.appendChild(label);

            this.content.appendChild(element);
        }
    }

    getDynamicCSS() {
        const s = parseFloat(this.config.size) || 32; // Circle size
        const fs = parseFloat(this.config.label_size) || 12; // Label font size
        const style = document.createElement('style');
        style.textContent = `
        .wrapper { justify-content: ${RGBLightCard.getJustify(this.config.justify)}; margin-bottom: -${s / 8}px; }
        .wrapper.hidden { display: none; }
        .color-circle {  width: ${s}px; height: ${s}px; margin: ${s / 8}px ${s / 4}px ${s / 4}px; }
        .color-label { font-size: ${fs}px; margin-bottom: ${s / 8}px; }
        `.replace(/\s\s+/g, ' ');
        return style;
    }

    static getStaticCSS() {
        const style = document.createElement('style');
        style.textContent = `
        .wrapper { cursor: auto; display: flex; flex-wrap: wrap; }
        .color { flex-basis: 0px; }
        .color-circle {
            border-radius: 50%; cursor: pointer; transition: box-shadow 0.15s ease-in-out;
            box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
        }
        .color-circle:hover {
            box-shadow: 0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12)
        }
        .color-label {
            color: var(--primary-text-color);
            text-align: center;
            overflow-wrap: anywhere;
        }
        `.replace(/\s\s+/g, ' ');
        return style;
    }

    setConfig(haConfig) {
        const config = RGBLightCard.ensureBackwardCompatibility(haConfig);

        // Colors must be a defined array
        if (!Array.isArray(config.colors)) {
            throw new Error('You need to define an array of colors');
        }
        // If root entity is defined, it can only be a light
        if (config.entity && config.entity.indexOf('light.') !== 0) {
            throw new Error(`Entity '${config.entity}' must be a light`);
        }
        // Validate each color
        for (const c in config.colors) {
            const color = config.colors[c];
            const type = color.type || 'light';
            // Check if type is valid
            if (['light', 'call-service'].indexOf(type) === -1) {
                throw new Error(`Invalid type '${type}' for colors[${c}]`);
            }
            // If root entity is not defined, ensure light entity_id is defined
            if (type === 'light' && !config.entity && !color.entity_id) {
                throw new Error(`You need to define entity or colors[${c}].entity_id`);
            }
            // If entity_id is defined, check that it's a valid light
            if (type === 'light' && color.entity_id && color.entity_id.indexOf('light.') !== 0) {
                throw new Error(`colors[${c}].entity_id '${color.entity_id}' must be a valid light entity`);
            }
            // If call-service, ensure service is defined
            if (type === 'call-service' && !color.service) {
                throw new Error(`You need to define colors[${c}].service`);
            }
            // Check that service is valid
            if (type === 'call-service' && color.service.split('.').length !== 2) {
                throw new Error(`colors[${c}].service '${color.service}' must be a valid service`);
            }
        }

        this.config = config;

        if (this.content) {
            this.update();
        }
    }

    applyColor(color) {
        if (color.type === 'call-service') {
            const [domain, service] = color.service.split('.');
            this._hass.callService(domain, service, color.service_data || {});
            return;
        }
        const serviceData = {
            entity_id: this.config.entity,
            ...color,
            icon_color: undefined,
            type: undefined,
            label: undefined,
        };
        this._hass.callService('light', 'turn_on', serviceData);
    }

    setVisibility() {
        if (
            this.content &&
            this.config &&
            this.config.entity &&
            this._hass &&
            this._hass.states &&
            this._hass.states.hasOwnProperty(this.config.entity)
        ) {
            const isOff = ['off', 'unavailable'].indexOf(this._hass.states[this.config.entity].state) !== -1;
            const hidden = this.config['hide_when_off'] && isOff;
            this.content.className = hidden ? 'wrapper hidden' : 'wrapper';
        }
    }

    // Transform a deprecated config into a more recent one
    static ensureBackwardCompatibility(originalConfig) {
        // Create a deep copy of the config
        const config = JSON.parse(JSON.stringify(originalConfig));
        if (!config.colors || !Array.isArray(config.colors)) {
            return config;
        }
        config.colors = config.colors.map((color, c) => {
            if (color && ['script', 'scene'].indexOf(color.type) > -1) {
                if (!color.entity_id) {
                    throw new Error(`You need to define colors[${c}].entity_id`);
                }
                if (color.entity_id && color.entity_id.indexOf(color.type + '.') !== 0) {
                    throw new Error(`colors[${c}].entity_id '${color.entity_id}' must be a ${color.type}`);
                }
                color.service = `${color.type}.turn_on`;
                color.service_data = { entity_id: color.entity_id };
                color.type = 'call-service';
                color.entity_id = undefined;
            }
            return color;
        });
        return config;
    }

    static getCSSColor(color) {
        if (color['icon_color']) {
            return color['icon_color'];
        }
        if (color['color_name']) {
            return color['color_name'];
        }
        if (color['color_temp'] || color['kelvin']) {
            let mireds = parseInt(color['color_temp'], 10) || Math.round(1000000 / parseInt(color['kelvin'], 10));
            mireds = Math.max(154, Math.min(500, mireds));
            const center = (500 + 154) / 2;
            const cr = [[166, 209, 255], [255, 255, 255], [255, 160, 0]].slice(mireds < center ? 0 : 1); // prettier-ignore
            const tr = [154, center, 500].slice(mireds < center ? 0 : 1); // Defined here: https://git.io/JvRKR
            return `rgb(${[0, 1, 2]
                .map((i) => ((mireds - tr[0]) * (cr[1][i] - cr[0][i])) / (tr[1] - tr[0]) + cr[0][i])
                .map(Math.round)
                .join(',')})`;
        }
        if (Array.isArray(color['rgb_color']) && color['rgb_color'].length === 3) {
            return `rgb(${color['rgb_color'].join(',')})`;
        }
        if (Array.isArray(color['rgbw_color']) && color['rgbw_color'].length === 4) {
            return `rgb(${color['rgbw_color'].slice(0, 3).join(',')})`;
        }
        if (Array.isArray(color['rgbww_color']) && color['rgbww_color'].length === 5) {
            return `rgb(${color['rgbww_color'].slice(0, 3).join(',')})`;
        }
        if (Array.isArray(color['hs_color']) && color['hs_color'].length === 2) {
            return `hsl(${color['hs_color'][0]},100%,${100 - color['hs_color'][1] / 2}%)`;
        }
        if (Array.isArray(color['xy_color']) && color['xy_color'].length === 2) {
            const rgb = this.xyToRGB(color['xy_color'][0], color['xy_color'][1], 255);
            return `rgb(${rgb.join(',')})`;
        }
        if (color['brightness']) {
            return `rgba(253,216,53,${color['brightness'] / 255})`;
        }
        if (color['brightness_pct']) {
            return `rgba(253,216,53,${color['brightness_pct'] / 100})`;
        }
        return '#7F848E';
    }

    // Original python code from Home Assistant: https://git.io/JV8ln
    static xyToRGB(x, y, brightness) {
        let Y = brightness / 255;
        let X = (Y / y) * x;
        let Z = (Y / y) * (1.0 - x - y);
        let rgb = [
            X * 1.656492 - Y * 0.354851 - Z * 0.255038,
            -X * 0.707196 + Y * 1.655397 + Z * 0.036152,
            X * 0.051713 - Y * 0.121364 + Z * 1.01153,
        ];

        rgb = rgb
            .map((c) => (c <= 0.0031308 ? 12.92 * c : (1.0 + 0.055) * Math.pow(c, 1.0 / 2.4) - 0.055)) // Apply reverse gamma correction
            .map((c) => Math.max(c, 0)); // Bring all negative components to zero

        let max = Math.max(...rgb);

        return rgb
            .map((c) => (max > 1 ? c / max : c)) // If one component is greater than 1, weight components by that value
            .map((c) => Math.floor(c * 255));
    }

    static getJustify(option) {
        return (
            {
                left: 'flex-start',
                right: 'flex-end',
                center: 'center',
                between: 'space-between',
                around: 'space-around',
            }[option] || 'flex-start'
        );
    }

    // Default config when creating the card from the UI
    static getStubConfig(ha) {
        const supportedEntities = Object.values(ha.states).filter(
            (entity) =>
                entity.entity_id.indexOf('light.') === 0 &&
                entity.attributes &&
                entity.attributes.supported_color_modes &&
                entity.attributes.supported_color_modes.find((mode) => ['hs', 'rgb', 'xy'].indexOf(mode) !== -1)
        );
        const entity = supportedEntities.length > 0 ? supportedEntities[0].entity_id : 'light.example_light';

        return {
            type: 'entities',
            show_header_toggle: false,
            entities: [
                { entity: entity },
                {
                    type: 'custom:rgb-light-card',
                    entity: entity,
                    colors: [
                        { rgb_color: [234, 136, 140], brightness: 255, transition: 1 },
                        { rgb_color: [251, 180, 139], brightness: 200, transition: 1 },
                        { rgb_color: [136, 198, 237], brightness: 150, transition: 1 },
                        { rgb_color: [140, 231, 185], brightness: 100, transition: 1 },
                    ],
                },
            ],
        };
    }
}

customElements.define('rgb-light-card', RGBLightCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'rgb-light-card',
    name: 'RGB Light Card',
    description: 'A custom card for RGB lights',
    preview: true,
});

console.info(
    '\n %c RGB Light Card %c v1.11.0 %c \n',
    'background-color: #555;color: #fff;padding: 3px 2px 3px 3px;border-radius: 3px 0 0 3px;font-family: DejaVu Sans,Verdana,Geneva,sans-serif;text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3)',
    'background-color: #bc81e0;background-image: linear-gradient(90deg, #b65cff, #11cbfa);color: #fff;padding: 3px 3px 3px 2px;border-radius: 0 3px 3px 0;font-family: DejaVu Sans,Verdana,Geneva,sans-serif;text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3)',
    'background-color: transparent'
);
