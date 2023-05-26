# Home Assistant - Mobile First Dashboard
About three years ago, a friend introduced me to Home Assistant. I was drawn to the idea and its open-source nature, so I purchased a Raspberry Pi 4 and quickly became enamored with the platform. 

I'm sharing my personal setup to inspire the community.

## Screenshots and features

![Main dashboard](https://github.com/clooos/Home-Assistant-Mobile-First/blob/master/www/images/Home%20Assistant%20-%20UI%20V4%20-%20Main%20dashboard.jpg?raw=true)

![Header and footer](https://github.com/clooos/Home-Assistant-Mobile-First/blob/master/www/images/Home%20Assistant%20-%20UI%20V4%20-%20Header%20and%20footer.jpg?raw=true)

![More dashboards](https://github.com/clooos/Home-Assistant-Mobile-First/blob/master/www/images/Home%20Assistant%20-%20UI%20V4%20-%20More%20dashboards.jpg?raw=true)

![Security](https://github.com/clooos/Home-Assistant-Mobile-First/blob/master/www/images/Home%20Assistant%20-%20UI%20V4%20-%20Security.jpg?raw=true)

![Animated widgets](https://github.com/clooos/Home-Assistant-Mobile-First/blob/master/www/images/Home%20Assistant%20-%20UI%20V3%20-%20Animated%20widgets.gif?raw=true)

# Installation

There is **no easy installation process**, as this is my personal setup uploaded as is.

But here is a guide that will show you where to start.

You need to install the following dependencies using HACS (more details below). Note that you may not need all of them depending on what you want, but these are the ones that I use in my setup:

- [lovelace-card-mod](https://github.com/thomasloven/lovelace-card-mod)  
  This is a custom component that allows modifying the appearance of any Lovelace card using CSS styles.  
  **This one is mandatory.**
  
- [button-card](https://github.com/custom-cards/button-card)  
  This is a button card that allows creating buttons with icons, text, actions, and styles.  
  **This one is mandatory.**
  
- [vertical-stack-in-card](https://github.com/ofekashery/vertical-stack-in-card)  
  This is a custom card that allows stacking multiple cards vertically.  
  **This one is mandatory.**
  
- [decluttering-card](https://github.com/custom-cards/decluttering-card)  
  This is a card that allows you to reuse multiple times the same configuration in your lovelace configuration to avoid repetition.  
  **This one is mandatory.**
  
- [slider-button-card](https://github.com/mattieha/slider-button-card)  
  This is a button card that shows and controls numeric values of entities with a slider and an action button.  
  This one is used for my room light sliders.

- [light-entity-card](https://github.com/ljmerza/light-entity-card)  
  This is a light card that shows and controls the brightness, color, and color temperature of light entities.  
  This one is used on any of my room cards.

- [rgb-light-card](https://github.com/bokub/rgb-light-card)  
  This is the buttons that controls the color of RGB light entities with a color wheel.  
  This one is used on any of my room cards.

- [mini-graph-card](https://github.com/kalkih/mini-graph-card)  
  This is a customizable graph card that can display multiple entities on the same graph.  
  This one is for the header and my energy card.
  
- [atomic-calendar-revive](https://github.com/marksie1988/atomic-calendar-revive)  
  This is a calendar card that shows events from various calendar platforms with advanced customization options.
  
- [frigate-hass-card](https://github.com/dermotduffy/frigate-hass-card)  
  This is a card that displays live video and records from Frigate.

- [lovelace-multiple-entity-row](https://github.com/benct/lovelace-multiple-entity-row)  
  This is a custom row that shows multiple attributes or entities on the same row.

- [lovelace-paper-buttons-row](https://github.com/jcwillox/lovelace-paper-buttons-row)  
  This is a custom row that shows multiple buttons with icons and actions on the same row.

- [lovelace-slider-entity-row](https://github.com/thomasloven/lovelace-slider-entity-row)  
  This is a slider to adjust numeric values of entities.

- [lovelace-xiaomi-vacuum-map-card](https://github.com/PiotrMachowski/Home-Assistant-Lovelace-Xiaomi-Vacuum-Map-card)  
  This is a map card that shows and controls Xiaomi vacuum cleaners with live map and zones support.

- [mini-media-player](https://github.com/kalkih/mini-media-player)  
  This is a media player card that supports various media sources and controls.

- [weather-card](https://github.com/bramkragten/weather-card)  
  This is a card that shows the weather and forecast from various weather providers.

## 1. Installing HACS and the dependencies

1. Download HACS following the instructions on [https://hacs.xyz/docs/setup/download](https://hacs.xyz/docs/setup/download/)
2. Proceed to the initial configuration following the instructions on [https://hacs.xyz/docs/configuration/basic](https://hacs.xyz/docs/configuration/basic)
3. On your sidebar go to `HACS` > `Frontend` and click on the `+` button at the bottom right corner. Search for each dependency you want to install and click on it. Then click on `Install this repository in HACS` and confirm.
4. After installing all the dependencies, go to `Configuration` > `System` to restart Home Assistant.

## 2. Installing the theme

1. Download the files from this repository by clicking on `Code` > `Download ZIP`.
2. Copy the `themes` folder in your Home Assistant configuration directory (you can do that with the Samba share add-on or the File editor add-on for exemple).
3. Add the following lines to your `configuration.yaml` file:

```
frontend:
  themes: !include_dir_merge_named themes
  extra_module_url:
    - /hacsfiles/lovelace-card-mod/card-mod.js
```
  
4. Go to `Configuration` > `System` to restart Home Assistant.
5. After restarting, go to your profile and select the Noctis theme from the drop-down menu.

*Please note that my version of Noctis from @aFFekopp is heavily modified and you will need to replace the original one if you have it already installed. 
You can use the service `frontend.reload_themes` to refresh it.*

## 3. Installing and configuring a new view

*Here is the tricky part, because you will need to edit a lot of my code to fit your configuration and entities.*

*Also note that I'm using the UI mode and this is the way that I will cover in the next part of this guide.*

1. Go to your dashboard and click on the 3 dots icon in the top right corner of the page then click on `Edit Dashboard`.
2. Click on the `+` button to add a new view.
3. Fill in the first fields (the icon is optional, I don't use it) and select Noctis in the theme drop-down menu.
4. **Important**: For the view type select `Sidebar` and turn on the `Subview` toggle button, click on Save.
5. Click on the 3 dots icon in the top right corner then click on `Raw configuration editor`.
6. In the folder you downloaded earlier, open the `lovelace.yaml` file with a text editor.
7. Copy all the lines of code from `decluttering_templates:` to the last line right before `title:`.
8. Paste this code in the top of your editor in Home Assistant.
9. In progress...

# Troubleshooting 

If you have specific questions, feel free to ask [here](https://community.home-assistant.io/t/a-minimalist-and-user-friendly-dashboard-with-an-mobile-first-approach-now-on-github/535580) and I will try to answer as soon as possible.

Thank you all for your support and motivation!
