class Hooks {
    constructor() {
        this.recognizer = new SequenceRecognizer();
    }

    add_reset_sequence(path) {
        this.recognizer.add_reset_sequence(path);
    }

    add_sequence(path, callback) {
        this.recognizer.add_sequence(path, callback);
    }
}

class Node {
    constructor() {
        this.callback = undefined;
        this.children = new Map();
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
}

export const hooks = new Hooks();
