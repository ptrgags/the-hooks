export class Hooks {
    constructor() {
        this.recognizer = new SequenceRecognizer();
        this.pressed_keys = new Set();
    }

    add_reset_sequence(path) {
        this.recognizer.add_reset_sequence(path);
    }

    add_sequence(path, callback) {
        this.recognizer.add_sequence(path, callback);
    }

    listen(element) {
        let elem = document.body;
        if (element !== undefined) {
            elem = element;
        }

        elem.addEventListener('keydown', (e) => {
            if (this.pressed_keys.has(e.code)) {
                this.on_key_held(e);
            } else {
                this.pressed_keys.add(e.code);
                this.on_key_pressed(e);
            }
        });

        elem.addEventListener('keyup', (e) => {
            this.on_key_released(e);
            this.pressed_keys.delete(e.code);
        });
    }

    on_key_pressed(e) {
        this.recognizer.on_key_pressed(e.code);
    }

    on_key_held(e) {
        // TODO: Chords coming soon :)
    }

    on_key_released(e) {
        // TODO: Chords coming soon :)
    }
}

class Node {
    constructor() {
        this.callback = undefined;
        this.children = new Map();
    }

    get has_children() {
        return this.children.size > 0;
    }

    add_child(symbol, child) {
        this.children.set(symbol, child);
    }

    get_child(symbol) {
        return this.children.get(symbol);
    }

    has_transition(symbol) {
        return this.children.has(symbol);
    }
}

class SequenceRecognizer {
    constructor() {
        this.root = new Node();
        this.reset();
    }

    reset() {
        this.current = this.root;
    }

    add_reset_sequence(path) {
        this.add_sequence(path, () => {
            this.reset();
        });
    }

    add_sequence(path, callback) {
        this._add_sequence(this.root, path, callback); 
    }

    _add_sequence(node, path, callback) {
        const [symbol, ...rest] = path;

        let child;
        if (node.has_transition(symbol)) {
            child = node.get_child(symbol);
        } else {
            child = new Node();
            node.add_child(symbol, child);
        }

        if (rest.length === 0) {
            child.callback = callback;
        } else {
            this._add_sequence(child, rest, callback);
        }
    }

    on_key_pressed(code) {
        if (this.current.has_transition(code)) {
            this.transition(code);
        } else {
            this.reset();
        }
    }

    transition(code) {
        this.current = this.current.get_child(code);
        if (this.current.callback !== undefined) {
            this.current.callback();

            // Wait for further keys unless we know that this is a
            // leaf node
            if (!this.current.has_children) {
                this.reset();
            }

            return true;
        }

        return false;
    }
}
