import { hooks } from './hooks.js';

window.hooks = hooks;

function log(message) {
    const p = document.getElementById('messages');
    p.innerHTML += message + '<br/>';
}

hooks.add_sequence(['q', 'w', 'e', 'r', 't', 'y'], () => {
    log('Open the secret door');
});

hooks.add_sequence(['q', 'w', 'e'], () => {
    log('You\'ve reached a fork in the road');
});

hooks.add_sequence(['q', 'w', 'e', 'f'], () => {
    log('You went the wrong way!');
});

hooks.add_sequence(['y', 't', 'r', 'e', 'w', 'q'], () => {
    log('Open the secret door');
});

hooks.add_reset_sequence(['Escape']);

