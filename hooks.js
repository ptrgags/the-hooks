export class Hooks {
    constructor() {
        this.seq_key_recognizer = new SequenceRecognizer();
        this.seq_code_recognizer = new SequenceRecognizer();
        this.chord_key_recognizer = new ChordRecognizer();
        this.chord_code_recognizer = new ChordRecognizer();
        this.pressed_keys = new Set();
        this.pressed_codes = new Set();
    }

    add_reset_key_sequence(path) {
        this.seq_key_recognizer.add_reset_sequence(path);
    }

    add_reset_code_sequence(path) {
        this.seq_code_recognizer.add_reset_sequence(path);
    }

    add_key_sequence(path, callback) {
        this.seq_key_recognizer.add_sequence(path, callback);
    }

    add_code_sequence(path, callback) {
        this.seq_code_recognizer.add_sequence(path, callback);
    }

    add_key_chord_pressed(chord, callback) {
        this.chord_key_recognizer.add_chord_pressed(chord, callback);
    }

    add_code_chord_pressed(chord, callback) {
        this.chord_code_recognizer.add_chord_pressed(chord, callback);
    }

    add_key_chord_held(chord, callback) {
        this.chord_key_recognizer.add_chord_held(chord, callback);
    }

    add_code_chord_held(chord, callback) {
        this.chord_code_recognizer.add_chord_held(chord, callback);
    }

    add_key_chord_released(chord, callback) {
        this.chord_key_recognizer.add_chord_released(chord, callback);
    }

    add_code_chord_released(chord, callback) {
        this.chord_code_recognizer.add_chord_released(chord, callback);
    }

    listen(element) {
        let elem = document.body;
        if (element !== undefined) {
            elem = element;
        }

        elem.addEventListener('keydown', (e) => {
            if (this.pressed_codes.has(e.code)) {
                this.on_key_held(e);
            } else {
                this.pressed_keys.add(e.key);
                this.pressed_codes.add(e.code);
                this.on_key_pressed(e);
            }
        });

        elem.addEventListener('keyup', (e) => {
            this.pressed_keys.delete(e.key);
            this.pressed_codes.delete(e.code);
            this.on_key_released(e);
        });
    }

    on_key_pressed(e) {
        this.seq_key_recognizer.on_key_pressed(e.key);
        this.seq_code_recognizer.on_key_pressed(e.code);
        this.chord_key_recognizer.on_key_pressed(this.pressed_keys);
        this.chord_code_recognizer.on_key_pressed(this.pressed_codes);
    }

    on_key_held(e) {
        this.chord_key_recognizer.on_key_held(this.pressed_keys);
        this.chord_code_recognizer.on_key_held(this.pressed_codes);
    }

    on_key_released(e) {
        this.chord_key_recognizer.on_key_released(this.pressed_keys);
        this.chord_code_recognizer.on_key_released(this.pressed_codes);
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

class ChordEntry {
    constructor(keys) { 
        this.chord = new Set(keys);
        this.pressed_callback = undefined;
        this.held_callback = undefined;
        this.released_callback = undefined;
        this.active = false;
    }
}

function sets_equal(set_a, set_b) {
    return is_subset(set_a, set_b) && is_subset(set_b, set_a);
}

function is_subset(set_a, set_b) {
    for (const value of set_a) {
        if (!set_b.has(value)) {
            return false;
        }
    }

    return true;
}

class ChordRecognizer {
    constructor() {
        this.entries = [];
    }

    find_entry(chord) {
        const chord_set = new Set(chord);
        for (const entry of this.entries) {
            if (sets_equal(entry.chord, chord_set)) {
                return entry;
            }
        }

        return undefined;
    }

    add_entry(entry) {
        this.entries.push(entry);
    }

    add_chord_pressed(chord, callback) {
        let entry = this.find_entry(chord);
        if (entry !== undefined) {
            entry.pressed_callback = callback;
        } else {
            entry = new ChordEntry(chord);
            entry.pressed_callback = callback;
            this.add_entry(entry);
        }
    }

    add_chord_held(chord, callback) {
        let entry = this.find_entry(chord);
        if (entry !== undefined) {
            entry.held_callback = callback;
        } else {
            entry = new ChordEntry(chord);
            entry.held_callback = callback;
            this.add_entry(entry);
        }
    }

    add_chord_released(chord, callback) {
        let entry = this.find_entry(chord);
        if (entry !== undefined) {
            entry.released_callback = callback;
        } else {
            entry = new ChordEntry(chord);
            entry.released_callback = callback;
            this.add_entry(entry);
        }
    }

    on_key_pressed(pressed_keys) {
        for (const entry of this.entries) {
            if (entry.active) {
                continue;
            }

            if (is_subset(entry.chord, pressed_keys)) {
                if (entry.pressed_callback !== undefined) {
                    entry.pressed_callback();
                }
                entry.active = true;
            }
        }
    }

    on_key_held(pressed_keys) {
        for (const entry of this.entries) {
            if (!entry.active) {
                continue;
            }

            if (is_subset(entry.chord, pressed_keys)) {
                if (entry.held_callback !== undefined) {
                    entry.held_callback();
                }
            }
        }
    }

    on_key_released(pressed_keys) {
        for (const entry of this.entries) {
            if (!entry.active) {
                continue;
            }

            if (!is_subset(entry.chord, pressed_keys)) {
                if (entry.released_callback !== undefined) {
                    entry.released_callback();
                }
                entry.active = false;
            }
        }
    }
}
