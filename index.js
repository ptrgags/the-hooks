import { Hooks } from './hooks.js';

const hooks = new Hooks();
window.hooks = hooks;

function log(message) {
    const p = document.getElementById('messages');
    p.innerHTML += message + '<br/>';
}

function clear() {
    const p = document.getElementById('messages');
    p.innerHTML = '';
}

hooks.add_code_sequence(['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY'], () => {
    log('Open the secret door');
});

hooks.add_code_sequence(['KeyQ', 'KeyW', 'KeyE'], () => {
    log('You\'ve reached a fork in the road');
});

hooks.add_code_sequence(['KeyQ', 'KeyW', 'KeyE', 'KeyF'], () => {
    log('You went the wrong way!');
});

hooks.add_code_sequence(['KeyY', 'KeyT', 'KeyR', 'KeyE', 'KeyW', 'KeyQ'], () => {
    log('Open the super secret door');
});

hooks.add_code_chord_pressed(['KeyC', 'KeyL'], () => {
    clear();
});

hooks.add_key_chord_pressed(['q', 'w', 'e'], () => {
    log('Q + W + E chord pressed.');
});

hooks.add_key_chord_held(['q', 'w', 'e'], () => {
    log('Q + W + E chord held.');
});

hooks.add_key_chord_released(['q', 'w', 'e'], () => {
    log('Q + W + E chord released');
});

hooks.add_reset_code_sequence(['Escape']);

hooks.listen();
