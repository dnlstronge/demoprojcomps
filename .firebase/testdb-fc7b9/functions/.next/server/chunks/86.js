exports.id = 86;
exports.ids = [86];
exports.modules = {

/***/ 7140:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

(function (global, factory) {
     true ? factory(exports, __webpack_require__(7030), __webpack_require__(8304), __webpack_require__(8156)) :
    0;
})(this, (function (exports, setArray, sourcemapCodec, traceMapping) { 'use strict';

    const COLUMN = 0;
    const SOURCES_INDEX = 1;
    const SOURCE_LINE = 2;
    const SOURCE_COLUMN = 3;
    const NAMES_INDEX = 4;

    const NO_NAME = -1;
    /**
     * A low-level API to associate a generated position with an original source position. Line and
     * column here are 0-based, unlike `addMapping`.
     */
    exports.addSegment = void 0;
    /**
     * A high-level API to associate a generated position with an original source position. Line is
     * 1-based, but column is 0-based, due to legacy behavior in `source-map` library.
     */
    exports.addMapping = void 0;
    /**
     * Same as `addSegment`, but will only add the segment if it generates useful information in the
     * resulting map. This only works correctly if segments are added **in order**, meaning you should
     * not add a segment with a lower generated line/column than one that came before.
     */
    exports.maybeAddSegment = void 0;
    /**
     * Same as `addMapping`, but will only add the mapping if it generates useful information in the
     * resulting map. This only works correctly if mappings are added **in order**, meaning you should
     * not add a mapping with a lower generated line/column than one that came before.
     */
    exports.maybeAddMapping = void 0;
    /**
     * Adds/removes the content of the source file to the source map.
     */
    exports.setSourceContent = void 0;
    /**
     * Returns a sourcemap object (with decoded mappings) suitable for passing to a library that expects
     * a sourcemap, or to JSON.stringify.
     */
    exports.toDecodedMap = void 0;
    /**
     * Returns a sourcemap object (with encoded mappings) suitable for passing to a library that expects
     * a sourcemap, or to JSON.stringify.
     */
    exports.toEncodedMap = void 0;
    /**
     * Constructs a new GenMapping, using the already present mappings of the input.
     */
    exports.fromMap = void 0;
    /**
     * Returns an array of high-level mapping objects for every recorded segment, which could then be
     * passed to the `source-map` library.
     */
    exports.allMappings = void 0;
    // This split declaration is only so that terser can elminiate the static initialization block.
    let addSegmentInternal;
    /**
     * Provides the state to generate a sourcemap.
     */
    class GenMapping {
        constructor({ file, sourceRoot } = {}) {
            this._names = new setArray.SetArray();
            this._sources = new setArray.SetArray();
            this._sourcesContent = [];
            this._mappings = [];
            this.file = file;
            this.sourceRoot = sourceRoot;
        }
    }
    (() => {
        exports.addSegment = (map, genLine, genColumn, source, sourceLine, sourceColumn, name, content) => {
            return addSegmentInternal(false, map, genLine, genColumn, source, sourceLine, sourceColumn, name, content);
        };
        exports.maybeAddSegment = (map, genLine, genColumn, source, sourceLine, sourceColumn, name, content) => {
            return addSegmentInternal(true, map, genLine, genColumn, source, sourceLine, sourceColumn, name, content);
        };
        exports.addMapping = (map, mapping) => {
            return addMappingInternal(false, map, mapping);
        };
        exports.maybeAddMapping = (map, mapping) => {
            return addMappingInternal(true, map, mapping);
        };
        exports.setSourceContent = (map, source, content) => {
            const { _sources: sources, _sourcesContent: sourcesContent } = map;
            sourcesContent[setArray.put(sources, source)] = content;
        };
        exports.toDecodedMap = (map) => {
            const { file, sourceRoot, _mappings: mappings, _sources: sources, _sourcesContent: sourcesContent, _names: names, } = map;
            removeEmptyFinalLines(mappings);
            return {
                version: 3,
                file: file || undefined,
                names: names.array,
                sourceRoot: sourceRoot || undefined,
                sources: sources.array,
                sourcesContent,
                mappings,
            };
        };
        exports.toEncodedMap = (map) => {
            const decoded = exports.toDecodedMap(map);
            return Object.assign(Object.assign({}, decoded), { mappings: sourcemapCodec.encode(decoded.mappings) });
        };
        exports.allMappings = (map) => {
            const out = [];
            const { _mappings: mappings, _sources: sources, _names: names } = map;
            for (let i = 0; i < mappings.length; i++) {
                const line = mappings[i];
                for (let j = 0; j < line.length; j++) {
                    const seg = line[j];
                    const generated = { line: i + 1, column: seg[COLUMN] };
                    let source = undefined;
                    let original = undefined;
                    let name = undefined;
                    if (seg.length !== 1) {
                        source = sources.array[seg[SOURCES_INDEX]];
                        original = { line: seg[SOURCE_LINE] + 1, column: seg[SOURCE_COLUMN] };
                        if (seg.length === 5)
                            name = names.array[seg[NAMES_INDEX]];
                    }
                    out.push({ generated, source, original, name });
                }
            }
            return out;
        };
        exports.fromMap = (input) => {
            const map = new traceMapping.TraceMap(input);
            const gen = new GenMapping({ file: map.file, sourceRoot: map.sourceRoot });
            putAll(gen._names, map.names);
            putAll(gen._sources, map.sources);
            gen._sourcesContent = map.sourcesContent || map.sources.map(() => null);
            gen._mappings = traceMapping.decodedMappings(map);
            return gen;
        };
        // Internal helpers
        addSegmentInternal = (skipable, map, genLine, genColumn, source, sourceLine, sourceColumn, name, content) => {
            const { _mappings: mappings, _sources: sources, _sourcesContent: sourcesContent, _names: names, } = map;
            const line = getLine(mappings, genLine);
            const index = getColumnIndex(line, genColumn);
            if (!source) {
                if (skipable && skipSourceless(line, index))
                    return;
                return insert(line, index, [genColumn]);
            }
            const sourcesIndex = setArray.put(sources, source);
            const namesIndex = name ? setArray.put(names, name) : NO_NAME;
            if (sourcesIndex === sourcesContent.length)
                sourcesContent[sourcesIndex] = content !== null && content !== void 0 ? content : null;
            if (skipable && skipSource(line, index, sourcesIndex, sourceLine, sourceColumn, namesIndex)) {
                return;
            }
            return insert(line, index, name
                ? [genColumn, sourcesIndex, sourceLine, sourceColumn, namesIndex]
                : [genColumn, sourcesIndex, sourceLine, sourceColumn]);
        };
    })();
    function getLine(mappings, index) {
        for (let i = mappings.length; i <= index; i++) {
            mappings[i] = [];
        }
        return mappings[index];
    }
    function getColumnIndex(line, genColumn) {
        let index = line.length;
        for (let i = index - 1; i >= 0; index = i--) {
            const current = line[i];
            if (genColumn >= current[COLUMN])
                break;
        }
        return index;
    }
    function insert(array, index, value) {
        for (let i = array.length; i > index; i--) {
            array[i] = array[i - 1];
        }
        array[index] = value;
    }
    function removeEmptyFinalLines(mappings) {
        const { length } = mappings;
        let len = length;
        for (let i = len - 1; i >= 0; len = i, i--) {
            if (mappings[i].length > 0)
                break;
        }
        if (len < length)
            mappings.length = len;
    }
    function putAll(strarr, array) {
        for (let i = 0; i < array.length; i++)
            setArray.put(strarr, array[i]);
    }
    function skipSourceless(line, index) {
        // The start of a line is already sourceless, so adding a sourceless segment to the beginning
        // doesn't generate any useful information.
        if (index === 0)
            return true;
        const prev = line[index - 1];
        // If the previous segment is also sourceless, then adding another sourceless segment doesn't
        // genrate any new information. Else, this segment will end the source/named segment and point to
        // a sourceless position, which is useful.
        return prev.length === 1;
    }
    function skipSource(line, index, sourcesIndex, sourceLine, sourceColumn, namesIndex) {
        // A source/named segment at the start of a line gives position at that genColumn
        if (index === 0)
            return false;
        const prev = line[index - 1];
        // If the previous segment is sourceless, then we're transitioning to a source.
        if (prev.length === 1)
            return false;
        // If the previous segment maps to the exact same source position, then this segment doesn't
        // provide any new position information.
        return (sourcesIndex === prev[SOURCES_INDEX] &&
            sourceLine === prev[SOURCE_LINE] &&
            sourceColumn === prev[SOURCE_COLUMN] &&
            namesIndex === (prev.length === 5 ? prev[NAMES_INDEX] : NO_NAME));
    }
    function addMappingInternal(skipable, map, mapping) {
        const { generated, source, original, name, content } = mapping;
        if (!source) {
            return addSegmentInternal(skipable, map, generated.line - 1, generated.column, null, null, null, null, null);
        }
        const s = source;
        return addSegmentInternal(skipable, map, generated.line - 1, generated.column, s, original.line - 1, original.column, name, content);
    }

    exports.GenMapping = GenMapping;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=gen-mapping.umd.js.map


/***/ }),

/***/ 3298:
/***/ (function(module) {

(function (global, factory) {
     true ? module.exports = factory() :
    0;
})(this, (function () { 'use strict';

    // Matches the scheme of a URL, eg "http://"
    const schemeRegex = /^[\w+.-]+:\/\//;
    /**
     * Matches the parts of a URL:
     * 1. Scheme, including ":", guaranteed.
     * 2. User/password, including "@", optional.
     * 3. Host, guaranteed.
     * 4. Port, including ":", optional.
     * 5. Path, including "/", optional.
     * 6. Query, including "?", optional.
     * 7. Hash, including "#", optional.
     */
    const urlRegex = /^([\w+.-]+:)\/\/([^@/#?]*@)?([^:/#?]*)(:\d+)?(\/[^#?]*)?(\?[^#]*)?(#.*)?/;
    /**
     * File URLs are weird. They dont' need the regular `//` in the scheme, they may or may not start
     * with a leading `/`, they can have a domain (but only if they don't start with a Windows drive).
     *
     * 1. Host, optional.
     * 2. Path, which may include "/", guaranteed.
     * 3. Query, including "?", optional.
     * 4. Hash, including "#", optional.
     */
    const fileRegex = /^file:(?:\/\/((?![a-z]:)[^/#?]*)?)?(\/?[^#?]*)(\?[^#]*)?(#.*)?/i;
    var UrlType;
    (function (UrlType) {
        UrlType[UrlType["Empty"] = 1] = "Empty";
        UrlType[UrlType["Hash"] = 2] = "Hash";
        UrlType[UrlType["Query"] = 3] = "Query";
        UrlType[UrlType["RelativePath"] = 4] = "RelativePath";
        UrlType[UrlType["AbsolutePath"] = 5] = "AbsolutePath";
        UrlType[UrlType["SchemeRelative"] = 6] = "SchemeRelative";
        UrlType[UrlType["Absolute"] = 7] = "Absolute";
    })(UrlType || (UrlType = {}));
    function isAbsoluteUrl(input) {
        return schemeRegex.test(input);
    }
    function isSchemeRelativeUrl(input) {
        return input.startsWith('//');
    }
    function isAbsolutePath(input) {
        return input.startsWith('/');
    }
    function isFileUrl(input) {
        return input.startsWith('file:');
    }
    function isRelative(input) {
        return /^[.?#]/.test(input);
    }
    function parseAbsoluteUrl(input) {
        const match = urlRegex.exec(input);
        return makeUrl(match[1], match[2] || '', match[3], match[4] || '', match[5] || '/', match[6] || '', match[7] || '');
    }
    function parseFileUrl(input) {
        const match = fileRegex.exec(input);
        const path = match[2];
        return makeUrl('file:', '', match[1] || '', '', isAbsolutePath(path) ? path : '/' + path, match[3] || '', match[4] || '');
    }
    function makeUrl(scheme, user, host, port, path, query, hash) {
        return {
            scheme,
            user,
            host,
            port,
            path,
            query,
            hash,
            type: UrlType.Absolute,
        };
    }
    function parseUrl(input) {
        if (isSchemeRelativeUrl(input)) {
            const url = parseAbsoluteUrl('http:' + input);
            url.scheme = '';
            url.type = UrlType.SchemeRelative;
            return url;
        }
        if (isAbsolutePath(input)) {
            const url = parseAbsoluteUrl('http://foo.com' + input);
            url.scheme = '';
            url.host = '';
            url.type = UrlType.AbsolutePath;
            return url;
        }
        if (isFileUrl(input))
            return parseFileUrl(input);
        if (isAbsoluteUrl(input))
            return parseAbsoluteUrl(input);
        const url = parseAbsoluteUrl('http://foo.com/' + input);
        url.scheme = '';
        url.host = '';
        url.type = input
            ? input.startsWith('?')
                ? UrlType.Query
                : input.startsWith('#')
                    ? UrlType.Hash
                    : UrlType.RelativePath
            : UrlType.Empty;
        return url;
    }
    function stripPathFilename(path) {
        // If a path ends with a parent directory "..", then it's a relative path with excess parent
        // paths. It's not a file, so we can't strip it.
        if (path.endsWith('/..'))
            return path;
        const index = path.lastIndexOf('/');
        return path.slice(0, index + 1);
    }
    function mergePaths(url, base) {
        normalizePath(base, base.type);
        // If the path is just a "/", then it was an empty path to begin with (remember, we're a relative
        // path).
        if (url.path === '/') {
            url.path = base.path;
        }
        else {
            // Resolution happens relative to the base path's directory, not the file.
            url.path = stripPathFilename(base.path) + url.path;
        }
    }
    /**
     * The path can have empty directories "//", unneeded parents "foo/..", or current directory
     * "foo/.". We need to normalize to a standard representation.
     */
    function normalizePath(url, type) {
        const rel = type <= UrlType.RelativePath;
        const pieces = url.path.split('/');
        // We need to preserve the first piece always, so that we output a leading slash. The item at
        // pieces[0] is an empty string.
        let pointer = 1;
        // Positive is the number of real directories we've output, used for popping a parent directory.
        // Eg, "foo/bar/.." will have a positive 2, and we can decrement to be left with just "foo".
        let positive = 0;
        // We need to keep a trailing slash if we encounter an empty directory (eg, splitting "foo/" will
        // generate `["foo", ""]` pieces). And, if we pop a parent directory. But once we encounter a
        // real directory, we won't need to append, unless the other conditions happen again.
        let addTrailingSlash = false;
        for (let i = 1; i < pieces.length; i++) {
            const piece = pieces[i];
            // An empty directory, could be a trailing slash, or just a double "//" in the path.
            if (!piece) {
                addTrailingSlash = true;
                continue;
            }
            // If we encounter a real directory, then we don't need to append anymore.
            addTrailingSlash = false;
            // A current directory, which we can always drop.
            if (piece === '.')
                continue;
            // A parent directory, we need to see if there are any real directories we can pop. Else, we
            // have an excess of parents, and we'll need to keep the "..".
            if (piece === '..') {
                if (positive) {
                    addTrailingSlash = true;
                    positive--;
                    pointer--;
                }
                else if (rel) {
                    // If we're in a relativePath, then we need to keep the excess parents. Else, in an absolute
                    // URL, protocol relative URL, or an absolute path, we don't need to keep excess.
                    pieces[pointer++] = piece;
                }
                continue;
            }
            // We've encountered a real directory. Move it to the next insertion pointer, which accounts for
            // any popped or dropped directories.
            pieces[pointer++] = piece;
            positive++;
        }
        let path = '';
        for (let i = 1; i < pointer; i++) {
            path += '/' + pieces[i];
        }
        if (!path || (addTrailingSlash && !path.endsWith('/..'))) {
            path += '/';
        }
        url.path = path;
    }
    /**
     * Attempts to resolve `input` URL/path relative to `base`.
     */
    function resolve(input, base) {
        if (!input && !base)
            return '';
        const url = parseUrl(input);
        let inputType = url.type;
        if (base && inputType !== UrlType.Absolute) {
            const baseUrl = parseUrl(base);
            const baseType = baseUrl.type;
            switch (inputType) {
                case UrlType.Empty:
                    url.hash = baseUrl.hash;
                // fall through
                case UrlType.Hash:
                    url.query = baseUrl.query;
                // fall through
                case UrlType.Query:
                case UrlType.RelativePath:
                    mergePaths(url, baseUrl);
                // fall through
                case UrlType.AbsolutePath:
                    // The host, user, and port are joined, you can't copy one without the others.
                    url.user = baseUrl.user;
                    url.host = baseUrl.host;
                    url.port = baseUrl.port;
                // fall through
                case UrlType.SchemeRelative:
                    // The input doesn't have a schema at least, so we need to copy at least that over.
                    url.scheme = baseUrl.scheme;
            }
            if (baseType > inputType)
                inputType = baseType;
        }
        normalizePath(url, inputType);
        const queryHash = url.query + url.hash;
        switch (inputType) {
            // This is impossible, because of the empty checks at the start of the function.
            // case UrlType.Empty:
            case UrlType.Hash:
            case UrlType.Query:
                return queryHash;
            case UrlType.RelativePath: {
                // The first char is always a "/", and we need it to be relative.
                const path = url.path.slice(1);
                if (!path)
                    return queryHash || '.';
                if (isRelative(base || input) && !isRelative(path)) {
                    // If base started with a leading ".", or there is no base and input started with a ".",
                    // then we need to ensure that the relative path starts with a ".". We don't know if
                    // relative starts with a "..", though, so check before prepending.
                    return './' + path + queryHash;
                }
                return path + queryHash;
            }
            case UrlType.AbsolutePath:
                return url.path + queryHash;
            default:
                return url.scheme + '//' + url.user + url.host + url.port + url.path + queryHash;
        }
    }

    return resolve;

}));
//# sourceMappingURL=resolve-uri.umd.js.map


/***/ }),

/***/ 7030:
/***/ (function(__unused_webpack_module, exports) {

(function (global, factory) {
     true ? factory(exports) :
    0;
})(this, (function (exports) { 'use strict';

    /**
     * Gets the index associated with `key` in the backing array, if it is already present.
     */
    exports.get = void 0;
    /**
     * Puts `key` into the backing array, if it is not already present. Returns
     * the index of the `key` in the backing array.
     */
    exports.put = void 0;
    /**
     * Pops the last added item out of the SetArray.
     */
    exports.pop = void 0;
    /**
     * SetArray acts like a `Set` (allowing only one occurrence of a string `key`), but provides the
     * index of the `key` in the backing array.
     *
     * This is designed to allow synchronizing a second array with the contents of the backing array,
     * like how in a sourcemap `sourcesContent[i]` is the source content associated with `source[i]`,
     * and there are never duplicates.
     */
    class SetArray {
        constructor() {
            this._indexes = { __proto__: null };
            this.array = [];
        }
    }
    (() => {
        exports.get = (strarr, key) => strarr._indexes[key];
        exports.put = (strarr, key) => {
            // The key may or may not be present. If it is present, it's a number.
            const index = exports.get(strarr, key);
            if (index !== undefined)
                return index;
            const { array, _indexes: indexes } = strarr;
            return (indexes[key] = array.push(key) - 1);
        };
        exports.pop = (strarr) => {
            const { array, _indexes: indexes } = strarr;
            if (array.length === 0)
                return;
            const last = array.pop();
            indexes[last] = undefined;
        };
    })();

    exports.SetArray = SetArray;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=set-array.umd.js.map


/***/ }),

/***/ 8304:
/***/ (function(__unused_webpack_module, exports) {

(function (global, factory) {
     true ? factory(exports) :
    0;
})(this, (function (exports) { 'use strict';

    const comma = ','.charCodeAt(0);
    const semicolon = ';'.charCodeAt(0);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const intToChar = new Uint8Array(64); // 64 possible chars.
    const charToInt = new Uint8Array(128); // z is 122 in ASCII
    for (let i = 0; i < chars.length; i++) {
        const c = chars.charCodeAt(i);
        intToChar[i] = c;
        charToInt[c] = i;
    }
    // Provide a fallback for older environments.
    const td = typeof TextDecoder !== 'undefined'
        ? /* #__PURE__ */ new TextDecoder()
        : typeof Buffer !== 'undefined'
            ? {
                decode(buf) {
                    const out = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
                    return out.toString();
                },
            }
            : {
                decode(buf) {
                    let out = '';
                    for (let i = 0; i < buf.length; i++) {
                        out += String.fromCharCode(buf[i]);
                    }
                    return out;
                },
            };
    function decode(mappings) {
        const state = new Int32Array(5);
        const decoded = [];
        let index = 0;
        do {
            const semi = indexOf(mappings, index);
            const line = [];
            let sorted = true;
            let lastCol = 0;
            state[0] = 0;
            for (let i = index; i < semi; i++) {
                let seg;
                i = decodeInteger(mappings, i, state, 0); // genColumn
                const col = state[0];
                if (col < lastCol)
                    sorted = false;
                lastCol = col;
                if (hasMoreVlq(mappings, i, semi)) {
                    i = decodeInteger(mappings, i, state, 1); // sourcesIndex
                    i = decodeInteger(mappings, i, state, 2); // sourceLine
                    i = decodeInteger(mappings, i, state, 3); // sourceColumn
                    if (hasMoreVlq(mappings, i, semi)) {
                        i = decodeInteger(mappings, i, state, 4); // namesIndex
                        seg = [col, state[1], state[2], state[3], state[4]];
                    }
                    else {
                        seg = [col, state[1], state[2], state[3]];
                    }
                }
                else {
                    seg = [col];
                }
                line.push(seg);
            }
            if (!sorted)
                sort(line);
            decoded.push(line);
            index = semi + 1;
        } while (index <= mappings.length);
        return decoded;
    }
    function indexOf(mappings, index) {
        const idx = mappings.indexOf(';', index);
        return idx === -1 ? mappings.length : idx;
    }
    function decodeInteger(mappings, pos, state, j) {
        let value = 0;
        let shift = 0;
        let integer = 0;
        do {
            const c = mappings.charCodeAt(pos++);
            integer = charToInt[c];
            value |= (integer & 31) << shift;
            shift += 5;
        } while (integer & 32);
        const shouldNegate = value & 1;
        value >>>= 1;
        if (shouldNegate) {
            value = -0x80000000 | -value;
        }
        state[j] += value;
        return pos;
    }
    function hasMoreVlq(mappings, i, length) {
        if (i >= length)
            return false;
        return mappings.charCodeAt(i) !== comma;
    }
    function sort(line) {
        line.sort(sortComparator);
    }
    function sortComparator(a, b) {
        return a[0] - b[0];
    }
    function encode(decoded) {
        const state = new Int32Array(5);
        const bufLength = 1024 * 16;
        const subLength = bufLength - 36;
        const buf = new Uint8Array(bufLength);
        const sub = buf.subarray(0, subLength);
        let pos = 0;
        let out = '';
        for (let i = 0; i < decoded.length; i++) {
            const line = decoded[i];
            if (i > 0) {
                if (pos === bufLength) {
                    out += td.decode(buf);
                    pos = 0;
                }
                buf[pos++] = semicolon;
            }
            if (line.length === 0)
                continue;
            state[0] = 0;
            for (let j = 0; j < line.length; j++) {
                const segment = line[j];
                // We can push up to 5 ints, each int can take at most 7 chars, and we
                // may push a comma.
                if (pos > subLength) {
                    out += td.decode(sub);
                    buf.copyWithin(0, subLength, pos);
                    pos -= subLength;
                }
                if (j > 0)
                    buf[pos++] = comma;
                pos = encodeInteger(buf, pos, state, segment, 0); // genColumn
                if (segment.length === 1)
                    continue;
                pos = encodeInteger(buf, pos, state, segment, 1); // sourcesIndex
                pos = encodeInteger(buf, pos, state, segment, 2); // sourceLine
                pos = encodeInteger(buf, pos, state, segment, 3); // sourceColumn
                if (segment.length === 4)
                    continue;
                pos = encodeInteger(buf, pos, state, segment, 4); // namesIndex
            }
        }
        return out + td.decode(buf.subarray(0, pos));
    }
    function encodeInteger(buf, pos, state, segment, j) {
        const next = segment[j];
        let num = next - state[j];
        state[j] = next;
        num = num < 0 ? (-num << 1) | 1 : num << 1;
        do {
            let clamped = num & 0b011111;
            num >>>= 5;
            if (num > 0)
                clamped |= 0b100000;
            buf[pos++] = intToChar[clamped];
        } while (num > 0);
        return pos;
    }

    exports.decode = decode;
    exports.encode = encode;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=sourcemap-codec.umd.js.map


/***/ }),

/***/ 8156:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

(function (global, factory) {
     true ? factory(exports, __webpack_require__(1898), __webpack_require__(3298)) :
    0;
})(this, (function (exports, sourcemapCodec, resolveUri) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var resolveUri__default = /*#__PURE__*/_interopDefaultLegacy(resolveUri);

    function resolve(input, base) {
        // The base is always treated as a directory, if it's not empty.
        // https://github.com/mozilla/source-map/blob/8cb3ee57/lib/util.js#L327
        // https://github.com/chromium/chromium/blob/da4adbb3/third_party/blink/renderer/devtools/front_end/sdk/SourceMap.js#L400-L401
        if (base && !base.endsWith('/'))
            base += '/';
        return resolveUri__default["default"](input, base);
    }

    /**
     * Removes everything after the last "/", but leaves the slash.
     */
    function stripFilename(path) {
        if (!path)
            return '';
        const index = path.lastIndexOf('/');
        return path.slice(0, index + 1);
    }

    const COLUMN = 0;
    const SOURCES_INDEX = 1;
    const SOURCE_LINE = 2;
    const SOURCE_COLUMN = 3;
    const NAMES_INDEX = 4;
    const REV_GENERATED_LINE = 1;
    const REV_GENERATED_COLUMN = 2;

    function maybeSort(mappings, owned) {
        const unsortedIndex = nextUnsortedSegmentLine(mappings, 0);
        if (unsortedIndex === mappings.length)
            return mappings;
        // If we own the array (meaning we parsed it from JSON), then we're free to directly mutate it. If
        // not, we do not want to modify the consumer's input array.
        if (!owned)
            mappings = mappings.slice();
        for (let i = unsortedIndex; i < mappings.length; i = nextUnsortedSegmentLine(mappings, i + 1)) {
            mappings[i] = sortSegments(mappings[i], owned);
        }
        return mappings;
    }
    function nextUnsortedSegmentLine(mappings, start) {
        for (let i = start; i < mappings.length; i++) {
            if (!isSorted(mappings[i]))
                return i;
        }
        return mappings.length;
    }
    function isSorted(line) {
        for (let j = 1; j < line.length; j++) {
            if (line[j][COLUMN] < line[j - 1][COLUMN]) {
                return false;
            }
        }
        return true;
    }
    function sortSegments(line, owned) {
        if (!owned)
            line = line.slice();
        return line.sort(sortComparator);
    }
    function sortComparator(a, b) {
        return a[COLUMN] - b[COLUMN];
    }

    let found = false;
    /**
     * A binary search implementation that returns the index if a match is found.
     * If no match is found, then the left-index (the index associated with the item that comes just
     * before the desired index) is returned. To maintain proper sort order, a splice would happen at
     * the next index:
     *
     * ```js
     * const array = [1, 3];
     * const needle = 2;
     * const index = binarySearch(array, needle, (item, needle) => item - needle);
     *
     * assert.equal(index, 0);
     * array.splice(index + 1, 0, needle);
     * assert.deepEqual(array, [1, 2, 3]);
     * ```
     */
    function binarySearch(haystack, needle, low, high) {
        while (low <= high) {
            const mid = low + ((high - low) >> 1);
            const cmp = haystack[mid][COLUMN] - needle;
            if (cmp === 0) {
                found = true;
                return mid;
            }
            if (cmp < 0) {
                low = mid + 1;
            }
            else {
                high = mid - 1;
            }
        }
        found = false;
        return low - 1;
    }
    function upperBound(haystack, needle, index) {
        for (let i = index + 1; i < haystack.length; index = i++) {
            if (haystack[i][COLUMN] !== needle)
                break;
        }
        return index;
    }
    function lowerBound(haystack, needle, index) {
        for (let i = index - 1; i >= 0; index = i--) {
            if (haystack[i][COLUMN] !== needle)
                break;
        }
        return index;
    }
    function memoizedState() {
        return {
            lastKey: -1,
            lastNeedle: -1,
            lastIndex: -1,
        };
    }
    /**
     * This overly complicated beast is just to record the last tested line/column and the resulting
     * index, allowing us to skip a few tests if mappings are monotonically increasing.
     */
    function memoizedBinarySearch(haystack, needle, state, key) {
        const { lastKey, lastNeedle, lastIndex } = state;
        let low = 0;
        let high = haystack.length - 1;
        if (key === lastKey) {
            if (needle === lastNeedle) {
                found = lastIndex !== -1 && haystack[lastIndex][COLUMN] === needle;
                return lastIndex;
            }
            if (needle >= lastNeedle) {
                // lastIndex may be -1 if the previous needle was not found.
                low = lastIndex === -1 ? 0 : lastIndex;
            }
            else {
                high = lastIndex;
            }
        }
        state.lastKey = key;
        state.lastNeedle = needle;
        return (state.lastIndex = binarySearch(haystack, needle, low, high));
    }

    // Rebuilds the original source files, with mappings that are ordered by source line/column instead
    // of generated line/column.
    function buildBySources(decoded, memos) {
        const sources = memos.map(buildNullArray);
        for (let i = 0; i < decoded.length; i++) {
            const line = decoded[i];
            for (let j = 0; j < line.length; j++) {
                const seg = line[j];
                if (seg.length === 1)
                    continue;
                const sourceIndex = seg[SOURCES_INDEX];
                const sourceLine = seg[SOURCE_LINE];
                const sourceColumn = seg[SOURCE_COLUMN];
                const originalSource = sources[sourceIndex];
                const originalLine = (originalSource[sourceLine] || (originalSource[sourceLine] = []));
                const memo = memos[sourceIndex];
                // The binary search either found a match, or it found the left-index just before where the
                // segment should go. Either way, we want to insert after that. And there may be multiple
                // generated segments associated with an original location, so there may need to move several
                // indexes before we find where we need to insert.
                const index = upperBound(originalLine, sourceColumn, memoizedBinarySearch(originalLine, sourceColumn, memo, sourceLine));
                insert(originalLine, (memo.lastIndex = index + 1), [sourceColumn, i, seg[COLUMN]]);
            }
        }
        return sources;
    }
    function insert(array, index, value) {
        for (let i = array.length; i > index; i--) {
            array[i] = array[i - 1];
        }
        array[index] = value;
    }
    // Null arrays allow us to use ordered index keys without actually allocating contiguous memory like
    // a real array. We use a null-prototype object to avoid prototype pollution and deoptimizations.
    // Numeric properties on objects are magically sorted in ascending order by the engine regardless of
    // the insertion order. So, by setting any numeric keys, even out of order, we'll get ascending
    // order when iterating with for-in.
    function buildNullArray() {
        return { __proto__: null };
    }

    const AnyMap = function (map, mapUrl) {
        const parsed = typeof map === 'string' ? JSON.parse(map) : map;
        if (!('sections' in parsed))
            return new TraceMap(parsed, mapUrl);
        const mappings = [];
        const sources = [];
        const sourcesContent = [];
        const names = [];
        recurse(parsed, mapUrl, mappings, sources, sourcesContent, names, 0, 0, Infinity, Infinity);
        const joined = {
            version: 3,
            file: parsed.file,
            names,
            sources,
            sourcesContent,
            mappings,
        };
        return exports.presortedDecodedMap(joined);
    };
    function recurse(input, mapUrl, mappings, sources, sourcesContent, names, lineOffset, columnOffset, stopLine, stopColumn) {
        const { sections } = input;
        for (let i = 0; i < sections.length; i++) {
            const { map, offset } = sections[i];
            let sl = stopLine;
            let sc = stopColumn;
            if (i + 1 < sections.length) {
                const nextOffset = sections[i + 1].offset;
                sl = Math.min(stopLine, lineOffset + nextOffset.line);
                if (sl === stopLine) {
                    sc = Math.min(stopColumn, columnOffset + nextOffset.column);
                }
                else if (sl < stopLine) {
                    sc = columnOffset + nextOffset.column;
                }
            }
            addSection(map, mapUrl, mappings, sources, sourcesContent, names, lineOffset + offset.line, columnOffset + offset.column, sl, sc);
        }
    }
    function addSection(input, mapUrl, mappings, sources, sourcesContent, names, lineOffset, columnOffset, stopLine, stopColumn) {
        if ('sections' in input)
            return recurse(...arguments);
        const map = new TraceMap(input, mapUrl);
        const sourcesOffset = sources.length;
        const namesOffset = names.length;
        const decoded = exports.decodedMappings(map);
        const { resolvedSources, sourcesContent: contents } = map;
        append(sources, resolvedSources);
        append(names, map.names);
        if (contents)
            append(sourcesContent, contents);
        else
            for (let i = 0; i < resolvedSources.length; i++)
                sourcesContent.push(null);
        for (let i = 0; i < decoded.length; i++) {
            const lineI = lineOffset + i;
            // We can only add so many lines before we step into the range that the next section's map
            // controls. When we get to the last line, then we'll start checking the segments to see if
            // they've crossed into the column range. But it may not have any columns that overstep, so we
            // still need to check that we don't overstep lines, too.
            if (lineI > stopLine)
                return;
            // The out line may already exist in mappings (if we're continuing the line started by a
            // previous section). Or, we may have jumped ahead several lines to start this section.
            const out = getLine(mappings, lineI);
            // On the 0th loop, the section's column offset shifts us forward. On all other lines (since the
            // map can be multiple lines), it doesn't.
            const cOffset = i === 0 ? columnOffset : 0;
            const line = decoded[i];
            for (let j = 0; j < line.length; j++) {
                const seg = line[j];
                const column = cOffset + seg[COLUMN];
                // If this segment steps into the column range that the next section's map controls, we need
                // to stop early.
                if (lineI === stopLine && column >= stopColumn)
                    return;
                if (seg.length === 1) {
                    out.push([column]);
                    continue;
                }
                const sourcesIndex = sourcesOffset + seg[SOURCES_INDEX];
                const sourceLine = seg[SOURCE_LINE];
                const sourceColumn = seg[SOURCE_COLUMN];
                out.push(seg.length === 4
                    ? [column, sourcesIndex, sourceLine, sourceColumn]
                    : [column, sourcesIndex, sourceLine, sourceColumn, namesOffset + seg[NAMES_INDEX]]);
            }
        }
    }
    function append(arr, other) {
        for (let i = 0; i < other.length; i++)
            arr.push(other[i]);
    }
    function getLine(arr, index) {
        for (let i = arr.length; i <= index; i++)
            arr[i] = [];
        return arr[index];
    }

    const LINE_GTR_ZERO = '`line` must be greater than 0 (lines start at line 1)';
    const COL_GTR_EQ_ZERO = '`column` must be greater than or equal to 0 (columns start at column 0)';
    const LEAST_UPPER_BOUND = -1;
    const GREATEST_LOWER_BOUND = 1;
    /**
     * Returns the encoded (VLQ string) form of the SourceMap's mappings field.
     */
    exports.encodedMappings = void 0;
    /**
     * Returns the decoded (array of lines of segments) form of the SourceMap's mappings field.
     */
    exports.decodedMappings = void 0;
    /**
     * A low-level API to find the segment associated with a generated line/column (think, from a
     * stack trace). Line and column here are 0-based, unlike `originalPositionFor`.
     */
    exports.traceSegment = void 0;
    /**
     * A higher-level API to find the source/line/column associated with a generated line/column
     * (think, from a stack trace). Line is 1-based, but column is 0-based, due to legacy behavior in
     * `source-map` library.
     */
    exports.originalPositionFor = void 0;
    /**
     * Finds the generated line/column position of the provided source/line/column source position.
     */
    exports.generatedPositionFor = void 0;
    /**
     * Finds all generated line/column positions of the provided source/line/column source position.
     */
    exports.allGeneratedPositionsFor = void 0;
    /**
     * Iterates each mapping in generated position order.
     */
    exports.eachMapping = void 0;
    /**
     * Retrieves the source content for a particular source, if its found. Returns null if not.
     */
    exports.sourceContentFor = void 0;
    /**
     * A helper that skips sorting of the input map's mappings array, which can be expensive for larger
     * maps.
     */
    exports.presortedDecodedMap = void 0;
    /**
     * Returns a sourcemap object (with decoded mappings) suitable for passing to a library that expects
     * a sourcemap, or to JSON.stringify.
     */
    exports.decodedMap = void 0;
    /**
     * Returns a sourcemap object (with encoded mappings) suitable for passing to a library that expects
     * a sourcemap, or to JSON.stringify.
     */
    exports.encodedMap = void 0;
    class TraceMap {
        constructor(map, mapUrl) {
            const isString = typeof map === 'string';
            if (!isString && map._decodedMemo)
                return map;
            const parsed = (isString ? JSON.parse(map) : map);
            const { version, file, names, sourceRoot, sources, sourcesContent } = parsed;
            this.version = version;
            this.file = file;
            this.names = names;
            this.sourceRoot = sourceRoot;
            this.sources = sources;
            this.sourcesContent = sourcesContent;
            const from = resolve(sourceRoot || '', stripFilename(mapUrl));
            this.resolvedSources = sources.map((s) => resolve(s || '', from));
            const { mappings } = parsed;
            if (typeof mappings === 'string') {
                this._encoded = mappings;
                this._decoded = undefined;
            }
            else {
                this._encoded = undefined;
                this._decoded = maybeSort(mappings, isString);
            }
            this._decodedMemo = memoizedState();
            this._bySources = undefined;
            this._bySourceMemos = undefined;
        }
    }
    (() => {
        exports.encodedMappings = (map) => {
            var _a;
            return ((_a = map._encoded) !== null && _a !== void 0 ? _a : (map._encoded = sourcemapCodec.encode(map._decoded)));
        };
        exports.decodedMappings = (map) => {
            return (map._decoded || (map._decoded = sourcemapCodec.decode(map._encoded)));
        };
        exports.traceSegment = (map, line, column) => {
            const decoded = exports.decodedMappings(map);
            // It's common for parent source maps to have pointers to lines that have no
            // mapping (like a "//# sourceMappingURL=") at the end of the child file.
            if (line >= decoded.length)
                return null;
            const segments = decoded[line];
            const index = traceSegmentInternal(segments, map._decodedMemo, line, column, GREATEST_LOWER_BOUND);
            return index === -1 ? null : segments[index];
        };
        exports.originalPositionFor = (map, { line, column, bias }) => {
            line--;
            if (line < 0)
                throw new Error(LINE_GTR_ZERO);
            if (column < 0)
                throw new Error(COL_GTR_EQ_ZERO);
            const decoded = exports.decodedMappings(map);
            // It's common for parent source maps to have pointers to lines that have no
            // mapping (like a "//# sourceMappingURL=") at the end of the child file.
            if (line >= decoded.length)
                return OMapping(null, null, null, null);
            const segments = decoded[line];
            const index = traceSegmentInternal(segments, map._decodedMemo, line, column, bias || GREATEST_LOWER_BOUND);
            if (index === -1)
                return OMapping(null, null, null, null);
            const segment = segments[index];
            if (segment.length === 1)
                return OMapping(null, null, null, null);
            const { names, resolvedSources } = map;
            return OMapping(resolvedSources[segment[SOURCES_INDEX]], segment[SOURCE_LINE] + 1, segment[SOURCE_COLUMN], segment.length === 5 ? names[segment[NAMES_INDEX]] : null);
        };
        exports.allGeneratedPositionsFor = (map, { source, line, column, bias }) => {
            // SourceMapConsumer uses LEAST_UPPER_BOUND for some reason, so we follow suit.
            return generatedPosition(map, source, line, column, bias || LEAST_UPPER_BOUND, true);
        };
        exports.generatedPositionFor = (map, { source, line, column, bias }) => {
            return generatedPosition(map, source, line, column, bias || GREATEST_LOWER_BOUND, false);
        };
        exports.eachMapping = (map, cb) => {
            const decoded = exports.decodedMappings(map);
            const { names, resolvedSources } = map;
            for (let i = 0; i < decoded.length; i++) {
                const line = decoded[i];
                for (let j = 0; j < line.length; j++) {
                    const seg = line[j];
                    const generatedLine = i + 1;
                    const generatedColumn = seg[0];
                    let source = null;
                    let originalLine = null;
                    let originalColumn = null;
                    let name = null;
                    if (seg.length !== 1) {
                        source = resolvedSources[seg[1]];
                        originalLine = seg[2] + 1;
                        originalColumn = seg[3];
                    }
                    if (seg.length === 5)
                        name = names[seg[4]];
                    cb({
                        generatedLine,
                        generatedColumn,
                        source,
                        originalLine,
                        originalColumn,
                        name,
                    });
                }
            }
        };
        exports.sourceContentFor = (map, source) => {
            const { sources, resolvedSources, sourcesContent } = map;
            if (sourcesContent == null)
                return null;
            let index = sources.indexOf(source);
            if (index === -1)
                index = resolvedSources.indexOf(source);
            return index === -1 ? null : sourcesContent[index];
        };
        exports.presortedDecodedMap = (map, mapUrl) => {
            const tracer = new TraceMap(clone(map, []), mapUrl);
            tracer._decoded = map.mappings;
            return tracer;
        };
        exports.decodedMap = (map) => {
            return clone(map, exports.decodedMappings(map));
        };
        exports.encodedMap = (map) => {
            return clone(map, exports.encodedMappings(map));
        };
        function generatedPosition(map, source, line, column, bias, all) {
            line--;
            if (line < 0)
                throw new Error(LINE_GTR_ZERO);
            if (column < 0)
                throw new Error(COL_GTR_EQ_ZERO);
            const { sources, resolvedSources } = map;
            let sourceIndex = sources.indexOf(source);
            if (sourceIndex === -1)
                sourceIndex = resolvedSources.indexOf(source);
            if (sourceIndex === -1)
                return all ? [] : GMapping(null, null);
            const generated = (map._bySources || (map._bySources = buildBySources(exports.decodedMappings(map), (map._bySourceMemos = sources.map(memoizedState)))));
            const segments = generated[sourceIndex][line];
            if (segments == null)
                return all ? [] : GMapping(null, null);
            const memo = map._bySourceMemos[sourceIndex];
            if (all)
                return sliceGeneratedPositions(segments, memo, line, column, bias);
            const index = traceSegmentInternal(segments, memo, line, column, bias);
            if (index === -1)
                return GMapping(null, null);
            const segment = segments[index];
            return GMapping(segment[REV_GENERATED_LINE] + 1, segment[REV_GENERATED_COLUMN]);
        }
    })();
    function clone(map, mappings) {
        return {
            version: map.version,
            file: map.file,
            names: map.names,
            sourceRoot: map.sourceRoot,
            sources: map.sources,
            sourcesContent: map.sourcesContent,
            mappings,
        };
    }
    function OMapping(source, line, column, name) {
        return { source, line, column, name };
    }
    function GMapping(line, column) {
        return { line, column };
    }
    function traceSegmentInternal(segments, memo, line, column, bias) {
        let index = memoizedBinarySearch(segments, column, memo, line);
        if (found) {
            index = (bias === LEAST_UPPER_BOUND ? upperBound : lowerBound)(segments, column, index);
        }
        else if (bias === LEAST_UPPER_BOUND)
            index++;
        if (index === -1 || index === segments.length)
            return -1;
        return index;
    }
    function sliceGeneratedPositions(segments, memo, line, column, bias) {
        let min = traceSegmentInternal(segments, memo, line, column, GREATEST_LOWER_BOUND);
        // We ignored the bias when tracing the segment so that we're guarnateed to find the first (in
        // insertion order) segment that matched. Even if we did respect the bias when tracing, we would
        // still need to call `lowerBound()` to find the first segment, which is slower than just looking
        // for the GREATEST_LOWER_BOUND to begin with. The only difference that matters for us is when the
        // binary search didn't match, in which case GREATEST_LOWER_BOUND just needs to increment to
        // match LEAST_UPPER_BOUND.
        if (!found && bias === LEAST_UPPER_BOUND)
            min++;
        if (min === -1 || min === segments.length)
            return [];
        // We may have found the segment that started at an earlier column. If this is the case, then we
        // need to slice all generated segments that match _that_ column, because all such segments span
        // to our desired column.
        const matchedColumn = found ? column : segments[min][COLUMN];
        // The binary search is not guaranteed to find the lower bound when a match wasn't found.
        if (!found)
            min = lowerBound(segments, matchedColumn, min);
        const max = upperBound(segments, matchedColumn, min);
        const result = [];
        for (; min <= max; min++) {
            const segment = segments[min];
            result.push(GMapping(segment[REV_GENERATED_LINE] + 1, segment[REV_GENERATED_COLUMN]));
        }
        return result;
    }

    exports.AnyMap = AnyMap;
    exports.GREATEST_LOWER_BOUND = GREATEST_LOWER_BOUND;
    exports.LEAST_UPPER_BOUND = LEAST_UPPER_BOUND;
    exports.TraceMap = TraceMap;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=trace-mapping.umd.js.map


/***/ }),

/***/ 1898:
/***/ (function(__unused_webpack_module, exports) {

(function (global, factory) {
     true ? factory(exports) :
    0;
})(this, (function (exports) { 'use strict';

    const comma = ','.charCodeAt(0);
    const semicolon = ';'.charCodeAt(0);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const intToChar = new Uint8Array(64); // 64 possible chars.
    const charToInt = new Uint8Array(128); // z is 122 in ASCII
    for (let i = 0; i < chars.length; i++) {
        const c = chars.charCodeAt(i);
        intToChar[i] = c;
        charToInt[c] = i;
    }
    // Provide a fallback for older environments.
    const td = typeof TextDecoder !== 'undefined'
        ? /* #__PURE__ */ new TextDecoder()
        : typeof Buffer !== 'undefined'
            ? {
                decode(buf) {
                    const out = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
                    return out.toString();
                },
            }
            : {
                decode(buf) {
                    let out = '';
                    for (let i = 0; i < buf.length; i++) {
                        out += String.fromCharCode(buf[i]);
                    }
                    return out;
                },
            };
    function decode(mappings) {
        const state = new Int32Array(5);
        const decoded = [];
        let index = 0;
        do {
            const semi = indexOf(mappings, index);
            const line = [];
            let sorted = true;
            let lastCol = 0;
            state[0] = 0;
            for (let i = index; i < semi; i++) {
                let seg;
                i = decodeInteger(mappings, i, state, 0); // genColumn
                const col = state[0];
                if (col < lastCol)
                    sorted = false;
                lastCol = col;
                if (hasMoreVlq(mappings, i, semi)) {
                    i = decodeInteger(mappings, i, state, 1); // sourcesIndex
                    i = decodeInteger(mappings, i, state, 2); // sourceLine
                    i = decodeInteger(mappings, i, state, 3); // sourceColumn
                    if (hasMoreVlq(mappings, i, semi)) {
                        i = decodeInteger(mappings, i, state, 4); // namesIndex
                        seg = [col, state[1], state[2], state[3], state[4]];
                    }
                    else {
                        seg = [col, state[1], state[2], state[3]];
                    }
                }
                else {
                    seg = [col];
                }
                line.push(seg);
            }
            if (!sorted)
                sort(line);
            decoded.push(line);
            index = semi + 1;
        } while (index <= mappings.length);
        return decoded;
    }
    function indexOf(mappings, index) {
        const idx = mappings.indexOf(';', index);
        return idx === -1 ? mappings.length : idx;
    }
    function decodeInteger(mappings, pos, state, j) {
        let value = 0;
        let shift = 0;
        let integer = 0;
        do {
            const c = mappings.charCodeAt(pos++);
            integer = charToInt[c];
            value |= (integer & 31) << shift;
            shift += 5;
        } while (integer & 32);
        const shouldNegate = value & 1;
        value >>>= 1;
        if (shouldNegate) {
            value = -0x80000000 | -value;
        }
        state[j] += value;
        return pos;
    }
    function hasMoreVlq(mappings, i, length) {
        if (i >= length)
            return false;
        return mappings.charCodeAt(i) !== comma;
    }
    function sort(line) {
        line.sort(sortComparator);
    }
    function sortComparator(a, b) {
        return a[0] - b[0];
    }
    function encode(decoded) {
        const state = new Int32Array(5);
        const bufLength = 1024 * 16;
        const subLength = bufLength - 36;
        const buf = new Uint8Array(bufLength);
        const sub = buf.subarray(0, subLength);
        let pos = 0;
        let out = '';
        for (let i = 0; i < decoded.length; i++) {
            const line = decoded[i];
            if (i > 0) {
                if (pos === bufLength) {
                    out += td.decode(buf);
                    pos = 0;
                }
                buf[pos++] = semicolon;
            }
            if (line.length === 0)
                continue;
            state[0] = 0;
            for (let j = 0; j < line.length; j++) {
                const segment = line[j];
                // We can push up to 5 ints, each int can take at most 7 chars, and we
                // may push a comma.
                if (pos > subLength) {
                    out += td.decode(sub);
                    buf.copyWithin(0, subLength, pos);
                    pos -= subLength;
                }
                if (j > 0)
                    buf[pos++] = comma;
                pos = encodeInteger(buf, pos, state, segment, 0); // genColumn
                if (segment.length === 1)
                    continue;
                pos = encodeInteger(buf, pos, state, segment, 1); // sourcesIndex
                pos = encodeInteger(buf, pos, state, segment, 2); // sourceLine
                pos = encodeInteger(buf, pos, state, segment, 3); // sourceColumn
                if (segment.length === 4)
                    continue;
                pos = encodeInteger(buf, pos, state, segment, 4); // namesIndex
            }
        }
        return out + td.decode(buf.subarray(0, pos));
    }
    function encodeInteger(buf, pos, state, segment, j) {
        const next = segment[j];
        let num = next - state[j];
        state[j] = next;
        num = num < 0 ? (-num << 1) | 1 : num << 1;
        do {
            let clamped = num & 0b011111;
            num >>>= 5;
            if (num > 0)
                clamped |= 0b100000;
            buf[pos++] = intToChar[clamped];
        } while (num > 0);
        return pos;
    }

    exports.decode = decode;
    exports.encode = encode;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=sourcemap-codec.umd.js.map


/***/ }),

/***/ 4889:
/***/ ((module) => {

function e(r){var o,t,f="";if("string"==typeof r||"number"==typeof r)f+=r;else if("object"==typeof r)if(Array.isArray(r))for(o=0;o<r.length;o++)r[o]&&(t=e(r[o]))&&(f&&(f+=" "),f+=t);else for(o in r)r[o]&&(f&&(f+=" "),f+=o);return f}function r(){for(var r,o,t=0,f="";t<arguments.length;)(r=arguments[t++])&&(o=e(r))&&(f&&(f+=" "),f+=o);return f}module.exports=r,module.exports.clsx=r;

/***/ }),

/***/ 2101:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

exports.__esModule = true;
exports.LinesAndColumns = void 0;
var LF = '\n';
var CR = '\r';
var LinesAndColumns = /** @class */ (function () {
    function LinesAndColumns(string) {
        this.string = string;
        var offsets = [0];
        for (var offset = 0; offset < string.length;) {
            switch (string[offset]) {
                case LF:
                    offset += LF.length;
                    offsets.push(offset);
                    break;
                case CR:
                    offset += CR.length;
                    if (string[offset] === LF) {
                        offset += LF.length;
                    }
                    offsets.push(offset);
                    break;
                default:
                    offset++;
                    break;
            }
        }
        this.offsets = offsets;
    }
    LinesAndColumns.prototype.locationForIndex = function (index) {
        if (index < 0 || index > this.string.length) {
            return null;
        }
        var line = 0;
        var offsets = this.offsets;
        while (offsets[line + 1] <= index) {
            line++;
        }
        var column = index - offsets[line];
        return { line: line, column: column };
    };
    LinesAndColumns.prototype.indexForLocation = function (location) {
        var line = location.line, column = location.column;
        if (line < 0 || line >= this.offsets.length) {
            return null;
        }
        if (column < 0 || column > this.lengthOfLine(line)) {
            return null;
        }
        return this.offsets[line] + column;
    };
    LinesAndColumns.prototype.lengthOfLine = function (line) {
        var offset = this.offsets[line];
        var nextOffset = line === this.offsets.length - 1
            ? this.string.length
            : this.offsets[line + 1];
        return nextOffset - offset;
    };
    return LinesAndColumns;
}());
exports.LinesAndColumns = LinesAndColumns;
exports["default"] = LinesAndColumns;


/***/ }),

/***/ 1102:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../node_modules/.pnpm/prismjs@1.29.0_patch_hash=vrxx3pzkik6jpmgpayxfjunetu/node_modules/prismjs/prism.js
var require_prism = __commonJS({
  "../../node_modules/.pnpm/prismjs@1.29.0_patch_hash=vrxx3pzkik6jpmgpayxfjunetu/node_modules/prismjs/prism.js"(exports, module2) {
    var Prism2 = function() {
      var lang = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i;
      var uniqueId = 0;
      var plainTextGrammar = {};
      var _ = {
        /**
         * A namespace for utility methods.
         *
         * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
         * change or disappear at any time.
         *
         * @namespace
         * @memberof Prism
         */
        util: {
          encode: function encode(tokens) {
            if (tokens instanceof Token) {
              return new Token(tokens.type, encode(tokens.content), tokens.alias);
            } else if (Array.isArray(tokens)) {
              return tokens.map(encode);
            } else {
              return tokens.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ");
            }
          },
          /**
           * Returns the name of the type of the given value.
           *
           * @param {any} o
           * @returns {string}
           * @example
           * type(null)      === 'Null'
           * type(undefined) === 'Undefined'
           * type(123)       === 'Number'
           * type('foo')     === 'String'
           * type(true)      === 'Boolean'
           * type([1, 2])    === 'Array'
           * type({})        === 'Object'
           * type(String)    === 'Function'
           * type(/abc+/)    === 'RegExp'
           */
          type: function(o) {
            return Object.prototype.toString.call(o).slice(8, -1);
          },
          /**
           * Returns a unique number for the given object. Later calls will still return the same number.
           *
           * @param {Object} obj
           * @returns {number}
           */
          objId: function(obj) {
            if (!obj["__id"]) {
              Object.defineProperty(obj, "__id", { value: ++uniqueId });
            }
            return obj["__id"];
          },
          /**
           * Creates a deep clone of the given object.
           *
           * The main intended use of this function is to clone language definitions.
           *
           * @param {T} o
           * @param {Record<number, any>} [visited]
           * @returns {T}
           * @template T
           */
          clone: function deepClone(o, visited) {
            visited = visited || {};
            var clone;
            var id;
            switch (_.util.type(o)) {
              case "Object":
                id = _.util.objId(o);
                if (visited[id]) {
                  return visited[id];
                }
                clone = /** @type {Record<string, any>} */
                {};
                visited[id] = clone;
                for (var key in o) {
                  if (o.hasOwnProperty(key)) {
                    clone[key] = deepClone(o[key], visited);
                  }
                }
                return (
                  /** @type {any} */
                  clone
                );
              case "Array":
                id = _.util.objId(o);
                if (visited[id]) {
                  return visited[id];
                }
                clone = [];
                visited[id] = clone;
                /** @type {Array} */
                /** @type {any} */
                o.forEach(function(v, i) {
                  clone[i] = deepClone(v, visited);
                });
                return (
                  /** @type {any} */
                  clone
                );
              default:
                return o;
            }
          },
          /**
           * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
           *
           * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
           *
           * @param {Element} element
           * @returns {string}
           */
          getLanguage: function(element) {
            while (element) {
              var m = lang.exec(element.className);
              if (m) {
                return m[1].toLowerCase();
              }
              element = element.parentElement;
            }
            return "none";
          },
          /**
           * Sets the Prism `language-xxxx` class of the given element.
           *
           * @param {Element} element
           * @param {string} language
           * @returns {void}
           */
          setLanguage: function(element, language) {
            element.className = element.className.replace(RegExp(lang, "gi"), "");
            element.classList.add("language-" + language);
          },
          /**
           * Returns whether a given class is active for `element`.
           *
           * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
           * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
           * given class is just the given class with a `no-` prefix.
           *
           * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
           * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
           * ancestors have the given class or the negated version of it, then the default activation will be returned.
           *
           * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
           * version of it, the class is considered active.
           *
           * @param {Element} element
           * @param {string} className
           * @param {boolean} [defaultActivation=false]
           * @returns {boolean}
           */
          isActive: function(element, className, defaultActivation) {
            var no = "no-" + className;
            while (element) {
              var classList = element.classList;
              if (classList.contains(className)) {
                return true;
              }
              if (classList.contains(no)) {
                return false;
              }
              element = element.parentElement;
            }
            return !!defaultActivation;
          }
        },
        /**
         * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
         *
         * @namespace
         * @memberof Prism
         * @public
         */
        languages: {
          /**
           * The grammar for plain, unformatted text.
           */
          plain: plainTextGrammar,
          plaintext: plainTextGrammar,
          text: plainTextGrammar,
          txt: plainTextGrammar,
          /**
           * Creates a deep copy of the language with the given id and appends the given tokens.
           *
           * If a token in `redef` also appears in the copied language, then the existing token in the copied language
           * will be overwritten at its original position.
           *
           * ## Best practices
           *
           * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
           * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
           * understand the language definition because, normally, the order of tokens matters in Prism grammars.
           *
           * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
           * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
           *
           * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
           * @param {Grammar} redef The new tokens to append.
           * @returns {Grammar} The new language created.
           * @public
           * @example
           * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
           *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
           *     // at its original position
           *     'comment': { ... },
           *     // CSS doesn't have a 'color' token, so this token will be appended
           *     'color': /\b(?:red|green|blue)\b/
           * });
           */
          extend: function(id, redef) {
            var lang2 = _.util.clone(_.languages[id]);
            for (var key in redef) {
              lang2[key] = redef[key];
            }
            return lang2;
          },
          /**
           * Inserts tokens _before_ another token in a language definition or any other grammar.
           *
           * ## Usage
           *
           * This helper method makes it easy to modify existing languages. For example, the CSS language definition
           * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
           * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
           * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
           * this:
           *
           * ```js
           * Prism.languages.markup.style = {
           *     // token
           * };
           * ```
           *
           * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
           * before existing tokens. For the CSS example above, you would use it like this:
           *
           * ```js
           * Prism.languages.insertBefore('markup', 'cdata', {
           *     'style': {
           *         // token
           *     }
           * });
           * ```
           *
           * ## Special cases
           *
           * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
           * will be ignored.
           *
           * This behavior can be used to insert tokens after `before`:
           *
           * ```js
           * Prism.languages.insertBefore('markup', 'comment', {
           *     'comment': Prism.languages.markup.comment,
           *     // tokens after 'comment'
           * });
           * ```
           *
           * ## Limitations
           *
           * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
           * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
           * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
           * deleting properties which is necessary to insert at arbitrary positions.
           *
           * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
           * Instead, it will create a new object and replace all references to the target object with the new one. This
           * can be done without temporarily deleting properties, so the iteration order is well-defined.
           *
           * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
           * you hold the target object in a variable, then the value of the variable will not change.
           *
           * ```js
           * var oldMarkup = Prism.languages.markup;
           * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
           *
           * assert(oldMarkup !== Prism.languages.markup);
           * assert(newMarkup === Prism.languages.markup);
           * ```
           *
           * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
           * object to be modified.
           * @param {string} before The key to insert before.
           * @param {Grammar} insert An object containing the key-value pairs to be inserted.
           * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
           * object to be modified.
           *
           * Defaults to `Prism.languages`.
           * @returns {Grammar} The new grammar object.
           * @public
           */
          insertBefore: function(inside, before, insert, root) {
            root = root || /** @type {any} */
            _.languages;
            var grammar = root[inside];
            var ret = {};
            for (var token in grammar) {
              if (grammar.hasOwnProperty(token)) {
                if (token == before) {
                  for (var newToken in insert) {
                    if (insert.hasOwnProperty(newToken)) {
                      ret[newToken] = insert[newToken];
                    }
                  }
                }
                if (!insert.hasOwnProperty(token)) {
                  ret[token] = grammar[token];
                }
              }
            }
            var old = root[inside];
            root[inside] = ret;
            _.languages.DFS(_.languages, function(key, value) {
              if (value === old && key != inside) {
                this[key] = ret;
              }
            });
            return ret;
          },
          // Traverse a language definition with Depth First Search
          DFS: function DFS(o, callback, type, visited) {
            visited = visited || {};
            var objId = _.util.objId;
            for (var i in o) {
              if (o.hasOwnProperty(i)) {
                callback.call(o, i, o[i], type || i);
                var property = o[i];
                var propertyType = _.util.type(property);
                if (propertyType === "Object" && !visited[objId(property)]) {
                  visited[objId(property)] = true;
                  DFS(property, callback, null, visited);
                } else if (propertyType === "Array" && !visited[objId(property)]) {
                  visited[objId(property)] = true;
                  DFS(property, callback, i, visited);
                }
              }
            }
          }
        },
        plugins: {},
        /**
         * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
         * and the language definitions to use, and returns a string with the HTML produced.
         *
         * The following hooks will be run:
         * 1. `before-tokenize`
         * 2. `after-tokenize`
         * 3. `wrap`: On each {@link Token}.
         *
         * @param {string} text A string with the code to be highlighted.
         * @param {Grammar} grammar An object containing the tokens to use.
         *
         * Usually a language definition like `Prism.languages.markup`.
         * @param {string} language The name of the language definition passed to `grammar`.
         * @returns {string} The highlighted HTML.
         * @memberof Prism
         * @public
         * @example
         * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
         */
        highlight: function(text, grammar, language) {
          var env = {
            code: text,
            grammar,
            language
          };
          _.hooks.run("before-tokenize", env);
          if (!env.grammar) {
            throw new Error('The language "' + env.language + '" has no grammar.');
          }
          env.tokens = _.tokenize(env.code, env.grammar);
          _.hooks.run("after-tokenize", env);
          return Token.stringify(_.util.encode(env.tokens), env.language);
        },
        /**
         * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
         * and the language definitions to use, and returns an array with the tokenized code.
         *
         * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
         *
         * This method could be useful in other contexts as well, as a very crude parser.
         *
         * @param {string} text A string with the code to be highlighted.
         * @param {Grammar} grammar An object containing the tokens to use.
         *
         * Usually a language definition like `Prism.languages.markup`.
         * @returns {TokenStream} An array of strings and tokens, a token stream.
         * @memberof Prism
         * @public
         * @example
         * let code = `var foo = 0;`;
         * let tokens = Prism.tokenize(code, Prism.languages.javascript);
         * tokens.forEach(token => {
         *     if (token instanceof Prism.Token && token.type === 'number') {
         *         console.log(`Found numeric literal: ${token.content}`);
         *     }
         * });
         */
        tokenize: function(text, grammar) {
          var rest = grammar.rest;
          if (rest) {
            for (var token in rest) {
              grammar[token] = rest[token];
            }
            delete grammar.rest;
          }
          var tokenList = new LinkedList();
          addAfter(tokenList, tokenList.head, text);
          matchGrammar(text, tokenList, grammar, tokenList.head, 0);
          return toArray(tokenList);
        },
        /**
         * @namespace
         * @memberof Prism
         * @public
         */
        hooks: {
          all: {},
          /**
           * Adds the given callback to the list of callbacks for the given hook.
           *
           * The callback will be invoked when the hook it is registered for is run.
           * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
           *
           * One callback function can be registered to multiple hooks and the same hook multiple times.
           *
           * @param {string} name The name of the hook.
           * @param {HookCallback} callback The callback function which is given environment variables.
           * @public
           */
          add: function(name, callback) {
            var hooks2 = _.hooks.all;
            hooks2[name] = hooks2[name] || [];
            hooks2[name].push(callback);
          },
          /**
           * Runs a hook invoking all registered callbacks with the given environment variables.
           *
           * Callbacks will be invoked synchronously and in the order in which they were registered.
           *
           * @param {string} name The name of the hook.
           * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
           * @public
           */
          run: function(name, env) {
            var callbacks = _.hooks.all[name];
            if (!callbacks || !callbacks.length) {
              return;
            }
            for (var i = 0, callback; callback = callbacks[i++]; ) {
              callback(env);
            }
          }
        },
        Token
      };
      function Token(type, content, alias, matchedStr) {
        this.type = type;
        this.content = content;
        this.alias = alias;
        this.length = (matchedStr || "").length | 0;
      }
      Token.stringify = function stringify(o, language) {
        if (typeof o == "string") {
          return o;
        }
        if (Array.isArray(o)) {
          var s = "";
          o.forEach(function(e) {
            s += stringify(e, language);
          });
          return s;
        }
        var env = {
          type: o.type,
          content: stringify(o.content, language),
          tag: "span",
          classes: ["token", o.type],
          attributes: {},
          language
        };
        var aliases = o.alias;
        if (aliases) {
          if (Array.isArray(aliases)) {
            Array.prototype.push.apply(env.classes, aliases);
          } else {
            env.classes.push(aliases);
          }
        }
        _.hooks.run("wrap", env);
        var attributes = "";
        for (var name in env.attributes) {
          attributes += " " + name + '="' + (env.attributes[name] || "").replace(/"/g, "&quot;") + '"';
        }
        return "<" + env.tag + ' class="' + env.classes.join(" ") + '"' + attributes + ">" + env.content + "</" + env.tag + ">";
      };
      function matchPattern(pattern, pos, text, lookbehind) {
        pattern.lastIndex = pos;
        var match = pattern.exec(text);
        if (match && lookbehind && match[1]) {
          var lookbehindLength = match[1].length;
          match.index += lookbehindLength;
          match[0] = match[0].slice(lookbehindLength);
        }
        return match;
      }
      function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
        for (var token in grammar) {
          if (!grammar.hasOwnProperty(token) || !grammar[token]) {
            continue;
          }
          var patterns = grammar[token];
          patterns = Array.isArray(patterns) ? patterns : [patterns];
          for (var j = 0; j < patterns.length; ++j) {
            if (rematch && rematch.cause == token + "," + j) {
              return;
            }
            var patternObj = patterns[j];
            var inside = patternObj.inside;
            var lookbehind = !!patternObj.lookbehind;
            var greedy = !!patternObj.greedy;
            var alias = patternObj.alias;
            if (greedy && !patternObj.pattern.global) {
              var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
              patternObj.pattern = RegExp(patternObj.pattern.source, flags + "g");
            }
            var pattern = patternObj.pattern || patternObj;
            for (var currentNode = startNode.next, pos = startPos; currentNode !== tokenList.tail; pos += currentNode.value.length, currentNode = currentNode.next) {
              if (rematch && pos >= rematch.reach) {
                break;
              }
              var str = currentNode.value;
              if (tokenList.length > text.length) {
                return;
              }
              if (str instanceof Token) {
                continue;
              }
              var removeCount = 1;
              var match;
              if (greedy) {
                match = matchPattern(pattern, pos, text, lookbehind);
                if (!match || match.index >= text.length) {
                  break;
                }
                var from = match.index;
                var to = match.index + match[0].length;
                var p = pos;
                p += currentNode.value.length;
                while (from >= p) {
                  currentNode = currentNode.next;
                  p += currentNode.value.length;
                }
                p -= currentNode.value.length;
                pos = p;
                if (currentNode.value instanceof Token) {
                  continue;
                }
                for (var k = currentNode; k !== tokenList.tail && (p < to || typeof k.value === "string"); k = k.next) {
                  removeCount++;
                  p += k.value.length;
                }
                removeCount--;
                str = text.slice(pos, p);
                match.index -= pos;
              } else {
                match = matchPattern(pattern, 0, str, lookbehind);
                if (!match) {
                  continue;
                }
              }
              var from = match.index;
              var matchStr = match[0];
              var before = str.slice(0, from);
              var after = str.slice(from + matchStr.length);
              var reach = pos + str.length;
              if (rematch && reach > rematch.reach) {
                rematch.reach = reach;
              }
              var removeFrom = currentNode.prev;
              if (before) {
                removeFrom = addAfter(tokenList, removeFrom, before);
                pos += before.length;
              }
              removeRange(tokenList, removeFrom, removeCount);
              var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
              currentNode = addAfter(tokenList, removeFrom, wrapped);
              if (after) {
                addAfter(tokenList, currentNode, after);
              }
              if (removeCount > 1) {
                var nestedRematch = {
                  cause: token + "," + j,
                  reach
                };
                matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);
                if (rematch && nestedRematch.reach > rematch.reach) {
                  rematch.reach = nestedRematch.reach;
                }
              }
            }
          }
        }
      }
      function LinkedList() {
        var head = { value: null, prev: null, next: null };
        var tail = { value: null, prev: head, next: null };
        head.next = tail;
        this.head = head;
        this.tail = tail;
        this.length = 0;
      }
      function addAfter(list, node, value) {
        var next = node.next;
        var newNode = { value, prev: node, next };
        node.next = newNode;
        next.prev = newNode;
        list.length++;
        return newNode;
      }
      function removeRange(list, node, count) {
        var next = node.next;
        for (var i = 0; i < count && next !== list.tail; i++) {
          next = next.next;
        }
        node.next = next;
        next.prev = node;
        list.length -= i;
      }
      function toArray(list) {
        var array = [];
        var node = list.head.next;
        while (node !== list.tail) {
          array.push(node.value);
          node = node.next;
        }
        return array;
      }
      return _;
    }();
    module2.exports = Prism2;
    Prism2.default = Prism2;
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Highlight: () => Highlight2,
  Prism: () => Prism,
  themes: () => themes_exports
});
module.exports = __toCommonJS(src_exports);

// src/prism-langs.ts
var Prism = __toESM(require_prism());
!function(e) {
  var n = { pattern: /\\[\\(){}[\]^$+*?|.]/, alias: "escape" }, t = /\\(?:x[\da-fA-F]{2}|u[\da-fA-F]{4}|u\{[\da-fA-F]+\}|0[0-7]{0,2}|[123][0-7]{2}|c[a-zA-Z]|.)/, a = "(?:[^\\\\-]|" + t.source + ")", a = RegExp(a + "-" + a), r = { pattern: /(<|')[^<>']+(?=[>']$)/, lookbehind: true, alias: "variable" };
  e.languages.regex = { "char-class": { pattern: /((?:^|[^\\])(?:\\\\)*)\[(?:[^\\\]]|\\[\s\S])*\]/, lookbehind: true, inside: { "char-class-negation": { pattern: /(^\[)\^/, lookbehind: true, alias: "operator" }, "char-class-punctuation": { pattern: /^\[|\]$/, alias: "punctuation" }, range: { pattern: a, inside: { escape: t, "range-punctuation": { pattern: /-/, alias: "operator" } } }, "special-escape": n, "char-set": { pattern: /\\[wsd]|\\p\{[^{}]+\}/i, alias: "class-name" }, escape: t } }, "special-escape": n, "char-set": { pattern: /\.|\\[wsd]|\\p\{[^{}]+\}/i, alias: "class-name" }, backreference: [{ pattern: /\\(?![123][0-7]{2})[1-9]/, alias: "keyword" }, { pattern: /\\k<[^<>']+>/, alias: "keyword", inside: { "group-name": r } }], anchor: { pattern: /[$^]|\\[ABbGZz]/, alias: "function" }, escape: t, group: [{ pattern: /\((?:\?(?:<[^<>']+>|'[^<>']+'|[>:]|<?[=!]|[idmnsuxU]+(?:-[idmnsuxU]+)?:?))?/, alias: "punctuation", inside: { "group-name": r } }, { pattern: /\)/, alias: "punctuation" }], quantifier: { pattern: /(?:[+*?]|\{\d+(?:,\d*)?\})[?+]?/, alias: "number" }, alternation: { pattern: /\|/, alias: "keyword" } };
}(Prism), Prism.languages.clike = { comment: [{ pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/, lookbehind: true, greedy: true }, { pattern: /(^|[^\\:])\/\/.*/, lookbehind: true, greedy: true }], string: { pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: true }, "class-name": { pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i, lookbehind: true, inside: { punctuation: /[.\\]/ } }, keyword: /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/, boolean: /\b(?:false|true)\b/, function: /\b\w+(?=\()/, number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i, operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/, punctuation: /[{}[\];(),.:]/ }, Prism.languages.javascript = Prism.languages.extend("clike", { "class-name": [Prism.languages.clike["class-name"], { pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/, lookbehind: true }], keyword: [{ pattern: /((?:^|\})\s*)catch\b/, lookbehind: true }, { pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/, lookbehind: true }], function: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/, number: { pattern: RegExp(/(^|[^\w$])/.source + "(?:" + /NaN|Infinity/.source + "|" + /0[bB][01]+(?:_[01]+)*n?/.source + "|" + /0[oO][0-7]+(?:_[0-7]+)*n?/.source + "|" + /0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source + "|" + /\d+(?:_\d+)*n/.source + "|" + /(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source + ")" + /(?![\w$])/.source), lookbehind: true }, operator: /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/ }), Prism.languages.javascript["class-name"][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/, Prism.languages.insertBefore("javascript", "keyword", { regex: { pattern: RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source + /\//.source + "(?:" + /(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source + "|" + /(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source + ")" + /(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source), lookbehind: true, greedy: true, inside: { "regex-source": { pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/, lookbehind: true, alias: "language-regex", inside: Prism.languages.regex }, "regex-delimiter": /^\/|\/$/, "regex-flags": /^[a-z]+$/ } }, "function-variable": { pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/, alias: "function" }, parameter: [{ pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/, lookbehind: true, inside: Prism.languages.javascript }, { pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i, lookbehind: true, inside: Prism.languages.javascript }, { pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/, lookbehind: true, inside: Prism.languages.javascript }, { pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/, lookbehind: true, inside: Prism.languages.javascript }], constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/ }), Prism.languages.insertBefore("javascript", "string", { hashbang: { pattern: /^#!.*/, greedy: true, alias: "comment" }, "template-string": { pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/, greedy: true, inside: { "template-punctuation": { pattern: /^`|`$/, alias: "string" }, interpolation: { pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/, lookbehind: true, inside: { "interpolation-punctuation": { pattern: /^\$\{|\}$/, alias: "punctuation" }, rest: Prism.languages.javascript } }, string: /[\s\S]+/ } }, "string-property": { pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m, lookbehind: true, greedy: true, alias: "property" } }), Prism.languages.insertBefore("javascript", "operator", { "literal-property": { pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m, lookbehind: true, alias: "property" } }), Prism.languages.markup && (Prism.languages.markup.tag.addInlined("script", "javascript"), Prism.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source, "javascript")), Prism.languages.js = Prism.languages.javascript, Prism.languages.actionscript = Prism.languages.extend("javascript", { keyword: /\b(?:as|break|case|catch|class|const|default|delete|do|dynamic|each|else|extends|final|finally|for|function|get|if|implements|import|in|include|instanceof|interface|internal|is|namespace|native|new|null|override|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|use|var|void|while|with)\b/, operator: /\+\+|--|(?:[+\-*\/%^]|&&?|\|\|?|<<?|>>?>?|[!=]=?)=?|[~?@]/ }), Prism.languages.actionscript["class-name"].alias = "function", delete Prism.languages.actionscript.parameter, delete Prism.languages.actionscript["literal-property"], Prism.languages.markup && Prism.languages.insertBefore("actionscript", "string", { xml: { pattern: /(^|[^.])<\/?\w+(?:\s+[^\s>\/=]+=("|')(?:\\[\s\S]|(?!\2)[^\\])*\2)*\s*\/?>/, lookbehind: true, inside: Prism.languages.markup } }), function(e) {
  var n = /#(?!\{).+/, t = { pattern: /#\{[^}]+\}/, alias: "variable" };
  e.languages.coffeescript = e.languages.extend("javascript", { comment: n, string: [{ pattern: /'(?:\\[\s\S]|[^\\'])*'/, greedy: true }, { pattern: /"(?:\\[\s\S]|[^\\"])*"/, greedy: true, inside: { interpolation: t } }], keyword: /\b(?:and|break|by|catch|class|continue|debugger|delete|do|each|else|extend|extends|false|finally|for|if|in|instanceof|is|isnt|let|loop|namespace|new|no|not|null|of|off|on|or|own|return|super|switch|then|this|throw|true|try|typeof|undefined|unless|until|when|while|window|with|yes|yield)\b/, "class-member": { pattern: /@(?!\d)\w+/, alias: "variable" } }), e.languages.insertBefore("coffeescript", "comment", { "multiline-comment": { pattern: /###[\s\S]+?###/, alias: "comment" }, "block-regex": { pattern: /\/{3}[\s\S]*?\/{3}/, alias: "regex", inside: { comment: n, interpolation: t } } }), e.languages.insertBefore("coffeescript", "string", { "inline-javascript": { pattern: /`(?:\\[\s\S]|[^\\`])*`/, inside: { delimiter: { pattern: /^`|`$/, alias: "punctuation" }, script: { pattern: /[\s\S]+/, alias: "language-javascript", inside: e.languages.javascript } } }, "multiline-string": [{ pattern: /'''[\s\S]*?'''/, greedy: true, alias: "string" }, { pattern: /"""[\s\S]*?"""/, greedy: true, alias: "string", inside: { interpolation: t } }] }), e.languages.insertBefore("coffeescript", "keyword", { property: /(?!\d)\w+(?=\s*:(?!:))/ }), delete e.languages.coffeescript["template-string"], e.languages.coffee = e.languages.coffeescript;
}(Prism), function(l) {
  var e = l.languages.javadoclike = { parameter: { pattern: /(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*@(?:arg|arguments|param)\s+)\w+/m, lookbehind: true }, keyword: { pattern: /(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*|\{)@[a-z][a-zA-Z-]+\b/m, lookbehind: true }, punctuation: /[{}]/ };
  Object.defineProperty(e, "addSupport", { value: function(e2, o) {
    (e2 = "string" == typeof e2 ? [e2] : e2).forEach(function(e3) {
      var n = function(e4) {
        e4.inside || (e4.inside = {}), e4.inside.rest = o;
      }, t = "doc-comment";
      if (a = l.languages[e3]) {
        var a, r = a[t];
        if ((r = r ? r : (a = l.languages.insertBefore(e3, "comment", { "doc-comment": { pattern: /(^|[^\\])\/\*\*[^/][\s\S]*?(?:\*\/|$)/, lookbehind: true, alias: "comment" } }))[t]) instanceof RegExp && (r = a[t] = { pattern: r }), Array.isArray(r))
          for (var s = 0, i = r.length; s < i; s++)
            r[s] instanceof RegExp && (r[s] = { pattern: r[s] }), n(r[s]);
        else
          n(r);
      }
    });
  } }), e.addSupport(["java", "javascript", "php"], e);
}(Prism), function(e) {
  var n = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/, n = (e.languages.css = { comment: /\/\*[\s\S]*?\*\//, atrule: { pattern: RegExp("@[\\w-](?:" + /[^;{\s"']|\s+(?!\s)/.source + "|" + n.source + ")*?" + /(?:;|(?=\s*\{))/.source), inside: { rule: /^@[\w-]+/, "selector-function-argument": { pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/, lookbehind: true, alias: "selector" }, keyword: { pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/, lookbehind: true } } }, url: { pattern: RegExp("\\burl\\((?:" + n.source + "|" + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ")\\)", "i"), greedy: true, inside: { function: /^url/i, punctuation: /^\(|\)$/, string: { pattern: RegExp("^" + n.source + "$"), alias: "url" } } }, selector: { pattern: RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|` + n.source + ")*(?=\\s*\\{)"), lookbehind: true }, string: { pattern: n, greedy: true }, property: { pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i, lookbehind: true }, important: /!important\b/i, function: { pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i, lookbehind: true }, punctuation: /[(){};:,]/ }, e.languages.css.atrule.inside.rest = e.languages.css, e.languages.markup);
  n && (n.tag.addInlined("style", "css"), n.tag.addAttribute("style", "css"));
}(Prism), function(e) {
  var n = /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, n = (e.languages.css.selector = { pattern: e.languages.css.selector.pattern, lookbehind: true, inside: n = { "pseudo-element": /:(?:after|before|first-letter|first-line|selection)|::[-\w]+/, "pseudo-class": /:[-\w]+/, class: /\.[-\w]+/, id: /#[-\w]+/, attribute: { pattern: RegExp(`\\[(?:[^[\\]"']|` + n.source + ")*\\]"), greedy: true, inside: { punctuation: /^\[|\]$/, "case-sensitivity": { pattern: /(\s)[si]$/i, lookbehind: true, alias: "keyword" }, namespace: { pattern: /^(\s*)(?:(?!\s)[-*\w\xA0-\uFFFF])*\|(?!=)/, lookbehind: true, inside: { punctuation: /\|$/ } }, "attr-name": { pattern: /^(\s*)(?:(?!\s)[-\w\xA0-\uFFFF])+/, lookbehind: true }, "attr-value": [n, { pattern: /(=\s*)(?:(?!\s)[-\w\xA0-\uFFFF])+(?=\s*$)/, lookbehind: true }], operator: /[|~*^$]?=/ } }, "n-th": [{ pattern: /(\(\s*)[+-]?\d*[\dn](?:\s*[+-]\s*\d+)?(?=\s*\))/, lookbehind: true, inside: { number: /[\dn]+/, operator: /[+-]/ } }, { pattern: /(\(\s*)(?:even|odd)(?=\s*\))/i, lookbehind: true }], combinator: />|\+|~|\|\|/, punctuation: /[(),]/ } }, e.languages.css.atrule.inside["selector-function-argument"].inside = n, e.languages.insertBefore("css", "property", { variable: { pattern: /(^|[^-\w\xA0-\uFFFF])--(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*/i, lookbehind: true } }), { pattern: /(\b\d+)(?:%|[a-z]+(?![\w-]))/, lookbehind: true }), t = { pattern: /(^|[^\w.-])-?(?:\d+(?:\.\d+)?|\.\d+)/, lookbehind: true };
  e.languages.insertBefore("css", "function", { operator: { pattern: /(\s)[+\-*\/](?=\s)/, lookbehind: true }, hexcode: { pattern: /\B#[\da-f]{3,8}\b/i, alias: "color" }, color: [{ pattern: /(^|[^\w-])(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGr[ae]y|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGr[ae]y|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGr[ae]y|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|GoldenRod|Gr[ae]y|Green|GreenYellow|HoneyDew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCoral|LightCyan|LightGoldenRodYellow|LightGr[ae]y|LightGreen|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGr[ae]y|LightSteelBlue|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquaMarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenRod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|RebeccaPurple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|SeaShell|Sienna|Silver|SkyBlue|SlateBlue|SlateGr[ae]y|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Transparent|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen)(?![\w-])/i, lookbehind: true }, { pattern: /\b(?:hsl|rgb)\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)\B|\b(?:hsl|rgb)a\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*(?:0|0?\.\d+|1)\s*\)\B/i, inside: { unit: n, number: t, function: /[\w-]+(?=\()/, punctuation: /[(),]/ } }], entity: /\\[\da-f]{1,8}/i, unit: n, number: t });
}(Prism), function(e) {
  var n = /[*&][^\s[\]{},]+/, t = /!(?:<[\w\-%#;/?:@&=+$,.!~*'()[\]]+>|(?:[a-zA-Z\d-]*!)?[\w\-%#;/?:@&=+$.~*'()]+)?/, a = "(?:" + t.source + "(?:[ 	]+" + n.source + ")?|" + n.source + "(?:[ 	]+" + t.source + ")?)", r = /(?:[^\s\x00-\x08\x0e-\x1f!"#%&'*,\-:>?@[\]`{|}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]|[?:-]<PLAIN>)(?:[ \t]*(?:(?![#:])<PLAIN>|:<PLAIN>))*/.source.replace(/<PLAIN>/g, function() {
    return /[^\s\x00-\x08\x0e-\x1f,[\]{}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]/.source;
  }), s = /"(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*'/.source;
  function i(e2, n2) {
    n2 = (n2 || "").replace(/m/g, "") + "m";
    var t2 = /([:\-,[{]\s*(?:\s<<prop>>[ \t]+)?)(?:<<value>>)(?=[ \t]*(?:$|,|\]|\}|(?:[\r\n]\s*)?#))/.source.replace(/<<prop>>/g, function() {
      return a;
    }).replace(/<<value>>/g, function() {
      return e2;
    });
    return RegExp(t2, n2);
  }
  e.languages.yaml = { scalar: { pattern: RegExp(/([\-:]\s*(?:\s<<prop>>[ \t]+)?[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)\S[^\r\n]*(?:\2[^\r\n]+)*)/.source.replace(/<<prop>>/g, function() {
    return a;
  })), lookbehind: true, alias: "string" }, comment: /#.*/, key: { pattern: RegExp(/((?:^|[:\-,[{\r\n?])[ \t]*(?:<<prop>>[ \t]+)?)<<key>>(?=\s*:\s)/.source.replace(/<<prop>>/g, function() {
    return a;
  }).replace(/<<key>>/g, function() {
    return "(?:" + r + "|" + s + ")";
  })), lookbehind: true, greedy: true, alias: "atrule" }, directive: { pattern: /(^[ \t]*)%.+/m, lookbehind: true, alias: "important" }, datetime: { pattern: i(/\d{4}-\d\d?-\d\d?(?:[tT]|[ \t]+)\d\d?:\d{2}:\d{2}(?:\.\d*)?(?:[ \t]*(?:Z|[-+]\d\d?(?::\d{2})?))?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(?::\d{2}(?:\.\d*)?)?/.source), lookbehind: true, alias: "number" }, boolean: { pattern: i(/false|true/.source, "i"), lookbehind: true, alias: "important" }, null: { pattern: i(/null|~/.source, "i"), lookbehind: true, alias: "important" }, string: { pattern: i(s), lookbehind: true, greedy: true }, number: { pattern: i(/[+-]?(?:0x[\da-f]+|0o[0-7]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|\.inf|\.nan)/.source, "i"), lookbehind: true }, tag: t, important: n, punctuation: /---|[:[\]{}\-,|>?]|\.\.\./ }, e.languages.yml = e.languages.yaml;
}(Prism), Prism.languages.markup = { comment: { pattern: /<!--(?:(?!<!--)[\s\S])*?-->/, greedy: true }, prolog: { pattern: /<\?[\s\S]+?\?>/, greedy: true }, doctype: { pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i, greedy: true, inside: { "internal-subset": { pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/, lookbehind: true, greedy: true, inside: null }, string: { pattern: /"[^"]*"|'[^']*'/, greedy: true }, punctuation: /^<!|>$|[[\]]/, "doctype-tag": /^DOCTYPE/i, name: /[^\s<>'"]+/ } }, cdata: { pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i, greedy: true }, tag: { pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/, greedy: true, inside: { tag: { pattern: /^<\/?[^\s>\/]+/, inside: { punctuation: /^<\/?/, namespace: /^[^\s>\/:]+:/ } }, "special-attr": [], "attr-value": { pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/, inside: { punctuation: [{ pattern: /^=/, alias: "attr-equals" }, { pattern: /^(\s*)["']|["']$/, lookbehind: true }] } }, punctuation: /\/?>/, "attr-name": { pattern: /[^\s>\/]+/, inside: { namespace: /^[^\s>\/:]+:/ } } } }, entity: [{ pattern: /&[\da-z]{1,8};/i, alias: "named-entity" }, /&#x?[\da-f]{1,8};/i] }, Prism.languages.markup.tag.inside["attr-value"].inside.entity = Prism.languages.markup.entity, Prism.languages.markup.doctype.inside["internal-subset"].inside = Prism.languages.markup, Prism.hooks.add("wrap", function(e) {
  "entity" === e.type && (e.attributes.title = e.content.replace(/&amp;/, "&"));
}), Object.defineProperty(Prism.languages.markup.tag, "addInlined", { value: function(e, n) {
  var t = {}, t = (t["language-" + n] = { pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i, lookbehind: true, inside: Prism.languages[n] }, t.cdata = /^<!\[CDATA\[|\]\]>$/i, { "included-cdata": { pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i, inside: t } }), n = (t["language-" + n] = { pattern: /[\s\S]+/, inside: Prism.languages[n] }, {});
  n[e] = { pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function() {
    return e;
  }), "i"), lookbehind: true, greedy: true, inside: t }, Prism.languages.insertBefore("markup", "cdata", n);
} }), Object.defineProperty(Prism.languages.markup.tag, "addAttribute", { value: function(e, n) {
  Prism.languages.markup.tag.inside["special-attr"].push({ pattern: RegExp(/(^|["'\s])/.source + "(?:" + e + ")" + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source, "i"), lookbehind: true, inside: { "attr-name": /^[^\s=]+/, "attr-value": { pattern: /=[\s\S]+/, inside: { value: { pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/, lookbehind: true, alias: [n, "language-" + n], inside: Prism.languages[n] }, punctuation: [{ pattern: /^=/, alias: "attr-equals" }, /"|'/] } } } });
} }), Prism.languages.html = Prism.languages.markup, Prism.languages.mathml = Prism.languages.markup, Prism.languages.svg = Prism.languages.markup, Prism.languages.xml = Prism.languages.extend("markup", {}), Prism.languages.ssml = Prism.languages.xml, Prism.languages.atom = Prism.languages.xml, Prism.languages.rss = Prism.languages.xml, function(o) {
  var n = /(?:\\.|[^\\\n\r]|(?:\n|\r\n?)(?![\r\n]))/.source;
  function e(e2) {
    return e2 = e2.replace(/<inner>/g, function() {
      return n;
    }), RegExp(/((?:^|[^\\])(?:\\{2})*)/.source + "(?:" + e2 + ")");
  }
  var t = /(?:\\.|``(?:[^`\r\n]|`(?!`))+``|`[^`\r\n]+`|[^\\|\r\n`])+/.source, a = /\|?__(?:\|__)+\|?(?:(?:\n|\r\n?)|(?![\s\S]))/.source.replace(/__/g, function() {
    return t;
  }), r = /\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?(?:\n|\r\n?)/.source, l = (o.languages.markdown = o.languages.extend("markup", {}), o.languages.insertBefore("markdown", "prolog", { "front-matter-block": { pattern: /(^(?:\s*[\r\n])?)---(?!.)[\s\S]*?[\r\n]---(?!.)/, lookbehind: true, greedy: true, inside: { punctuation: /^---|---$/, "front-matter": { pattern: /\S+(?:\s+\S+)*/, alias: ["yaml", "language-yaml"], inside: o.languages.yaml } } }, blockquote: { pattern: /^>(?:[\t ]*>)*/m, alias: "punctuation" }, table: { pattern: RegExp("^" + a + r + "(?:" + a + ")*", "m"), inside: { "table-data-rows": { pattern: RegExp("^(" + a + r + ")(?:" + a + ")*$"), lookbehind: true, inside: { "table-data": { pattern: RegExp(t), inside: o.languages.markdown }, punctuation: /\|/ } }, "table-line": { pattern: RegExp("^(" + a + ")" + r + "$"), lookbehind: true, inside: { punctuation: /\||:?-{3,}:?/ } }, "table-header-row": { pattern: RegExp("^" + a + "$"), inside: { "table-header": { pattern: RegExp(t), alias: "important", inside: o.languages.markdown }, punctuation: /\|/ } } } }, code: [{ pattern: /((?:^|\n)[ \t]*\n|(?:^|\r\n?)[ \t]*\r\n?)(?: {4}|\t).+(?:(?:\n|\r\n?)(?: {4}|\t).+)*/, lookbehind: true, alias: "keyword" }, { pattern: /^```[\s\S]*?^```$/m, greedy: true, inside: { "code-block": { pattern: /^(```.*(?:\n|\r\n?))[\s\S]+?(?=(?:\n|\r\n?)^```$)/m, lookbehind: true }, "code-language": { pattern: /^(```).+/, lookbehind: true }, punctuation: /```/ } }], title: [{ pattern: /\S.*(?:\n|\r\n?)(?:==+|--+)(?=[ \t]*$)/m, alias: "important", inside: { punctuation: /==+$|--+$/ } }, { pattern: /(^\s*)#.+/m, lookbehind: true, alias: "important", inside: { punctuation: /^#+|#+$/ } }], hr: { pattern: /(^\s*)([*-])(?:[\t ]*\2){2,}(?=\s*$)/m, lookbehind: true, alias: "punctuation" }, list: { pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m, lookbehind: true, alias: "punctuation" }, "url-reference": { pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/, inside: { variable: { pattern: /^(!?\[)[^\]]+/, lookbehind: true }, string: /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/, punctuation: /^[\[\]!:]|[<>]/ }, alias: "url" }, bold: { pattern: e(/\b__(?:(?!_)<inner>|_(?:(?!_)<inner>)+_)+__\b|\*\*(?:(?!\*)<inner>|\*(?:(?!\*)<inner>)+\*)+\*\*/.source), lookbehind: true, greedy: true, inside: { content: { pattern: /(^..)[\s\S]+(?=..$)/, lookbehind: true, inside: {} }, punctuation: /\*\*|__/ } }, italic: { pattern: e(/\b_(?:(?!_)<inner>|__(?:(?!_)<inner>)+__)+_\b|\*(?:(?!\*)<inner>|\*\*(?:(?!\*)<inner>)+\*\*)+\*/.source), lookbehind: true, greedy: true, inside: { content: { pattern: /(^.)[\s\S]+(?=.$)/, lookbehind: true, inside: {} }, punctuation: /[*_]/ } }, strike: { pattern: e(/(~~?)(?:(?!~)<inner>)+\2/.source), lookbehind: true, greedy: true, inside: { content: { pattern: /(^~~?)[\s\S]+(?=\1$)/, lookbehind: true, inside: {} }, punctuation: /~~?/ } }, "code-snippet": { pattern: /(^|[^\\`])(?:``[^`\r\n]+(?:`[^`\r\n]+)*``(?!`)|`[^`\r\n]+`(?!`))/, lookbehind: true, greedy: true, alias: ["code", "keyword"] }, url: { pattern: e(/!?\[(?:(?!\])<inner>)+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)|[ \t]?\[(?:(?!\])<inner>)+\])/.source), lookbehind: true, greedy: true, inside: { operator: /^!/, content: { pattern: /(^\[)[^\]]+(?=\])/, lookbehind: true, inside: {} }, variable: { pattern: /(^\][ \t]?\[)[^\]]+(?=\]$)/, lookbehind: true }, url: { pattern: /(^\]\()[^\s)]+/, lookbehind: true }, string: { pattern: /(^[ \t]+)"(?:\\.|[^"\\])*"(?=\)$)/, lookbehind: true } } } }), ["url", "bold", "italic", "strike"].forEach(function(n2) {
    ["url", "bold", "italic", "strike", "code-snippet"].forEach(function(e2) {
      n2 !== e2 && (o.languages.markdown[n2].inside.content.inside[e2] = o.languages.markdown[e2]);
    });
  }), o.hooks.add("after-tokenize", function(e2) {
    "markdown" !== e2.language && "md" !== e2.language || !function e3(n2) {
      if (n2 && "string" != typeof n2)
        for (var t2 = 0, a2 = n2.length; t2 < a2; t2++) {
          var r2, s = n2[t2];
          "code" !== s.type ? e3(s.content) : (r2 = s.content[1], s = s.content[3], r2 && s && "code-language" === r2.type && "code-block" === s.type && "string" == typeof r2.content && (r2 = r2.content.replace(/\b#/g, "sharp").replace(/\b\+\+/g, "pp"), r2 = "language-" + (r2 = (/[a-z][\w-]*/i.exec(r2) || [""])[0].toLowerCase()), s.alias ? "string" == typeof s.alias ? s.alias = [s.alias, r2] : s.alias.push(r2) : s.alias = [r2]));
        }
    }(e2.tokens);
  }), o.hooks.add("wrap", function(e2) {
    if ("code-block" === e2.type) {
      for (var n2 = "", t2 = 0, a2 = e2.classes.length; t2 < a2; t2++) {
        var r2 = e2.classes[t2], r2 = /language-(.+)/.exec(r2);
        if (r2) {
          n2 = r2[1];
          break;
        }
      }
      var s, i = o.languages[n2];
      i ? e2.content = o.highlight(function(e3) {
        e3 = e3.replace(l, "");
        return e3 = e3.replace(/&(\w{1,8}|#x?[\da-f]{1,8});/gi, function(e4, n3) {
          var t3;
          return "#" === (n3 = n3.toLowerCase())[0] ? (t3 = "x" === n3[1] ? parseInt(n3.slice(2), 16) : Number(n3.slice(1)), c(t3)) : u[n3] || e4;
        });
      }(e2.content), i, n2) : n2 && "none" !== n2 && o.plugins.autoloader && (s = "md-" + (/* @__PURE__ */ new Date()).valueOf() + "-" + Math.floor(1e16 * Math.random()), e2.attributes.id = s, o.plugins.autoloader.loadLanguages(n2, function() {
        var e3 = document.getElementById(s);
        e3 && (e3.innerHTML = o.highlight(e3.textContent, o.languages[n2], n2));
      }));
    }
  }), RegExp(o.languages.markup.tag.pattern.source, "gi")), u = { amp: "&", lt: "<", gt: ">", quot: '"' }, c = String.fromCodePoint || String.fromCharCode;
  o.languages.md = o.languages.markdown;
}(Prism), Prism.languages.graphql = { comment: /#.*/, description: { pattern: /(?:"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*")(?=\s*[a-z_])/i, greedy: true, alias: "string", inside: { "language-markdown": { pattern: /(^"(?:"")?)(?!\1)[\s\S]+(?=\1$)/, lookbehind: true, inside: Prism.languages.markdown } } }, string: { pattern: /"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*"/, greedy: true }, number: /(?:\B-|\b)\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i, boolean: /\b(?:false|true)\b/, variable: /\$[a-z_]\w*/i, directive: { pattern: /@[a-z_]\w*/i, alias: "function" }, "attr-name": { pattern: /\b[a-z_]\w*(?=\s*(?:\((?:[^()"]|"(?:\\.|[^\\"\r\n])*")*\))?:)/i, greedy: true }, "atom-input": { pattern: /\b[A-Z]\w*Input\b/, alias: "class-name" }, scalar: /\b(?:Boolean|Float|ID|Int|String)\b/, constant: /\b[A-Z][A-Z_\d]*\b/, "class-name": { pattern: /(\b(?:enum|implements|interface|on|scalar|type|union)\s+|&\s*|:\s*|\[)[A-Z_]\w*/, lookbehind: true }, fragment: { pattern: /(\bfragment\s+|\.{3}\s*(?!on\b))[a-zA-Z_]\w*/, lookbehind: true, alias: "function" }, "definition-mutation": { pattern: /(\bmutation\s+)[a-zA-Z_]\w*/, lookbehind: true, alias: "function" }, "definition-query": { pattern: /(\bquery\s+)[a-zA-Z_]\w*/, lookbehind: true, alias: "function" }, keyword: /\b(?:directive|enum|extend|fragment|implements|input|interface|mutation|on|query|repeatable|scalar|schema|subscription|type|union)\b/, operator: /[!=|&]|\.{3}/, "property-query": /\w+(?=\s*\()/, object: /\w+(?=\s*\{)/, punctuation: /[!(){}\[\]:=,]/, property: /\w+/ }, Prism.hooks.add("after-tokenize", function(e) {
  if ("graphql" === e.language)
    for (var i = e.tokens.filter(function(e2) {
      return "string" != typeof e2 && "comment" !== e2.type && "scalar" !== e2.type;
    }), o = 0; o < i.length; ) {
      var n = i[o++];
      if ("keyword" === n.type && "mutation" === n.content) {
        var t = [];
        if (p(["definition-mutation", "punctuation"]) && "(" === c(1).content) {
          o += 2;
          var a = d(/^\($/, /^\)$/);
          if (-1 === a)
            continue;
          for (; o < a; o++) {
            var r = c(0);
            "variable" === r.type && (g(r, "variable-input"), t.push(r.content));
          }
          o = a + 1;
        }
        if (p(["punctuation", "property-query"]) && "{" === c(0).content && (o++, g(c(0), "property-mutation"), 0 < t.length)) {
          var s = d(/^\{$/, /^\}$/);
          if (-1 !== s)
            for (var l = o; l < s; l++) {
              var u = i[l];
              "variable" === u.type && 0 <= t.indexOf(u.content) && g(u, "variable-input");
            }
        }
      }
    }
  function c(e2) {
    return i[o + e2];
  }
  function p(e2, n2) {
    n2 = n2 || 0;
    for (var t2 = 0; t2 < e2.length; t2++) {
      var a2 = c(t2 + n2);
      if (!a2 || a2.type !== e2[t2])
        return;
    }
    return 1;
  }
  function d(e2, n2) {
    for (var t2 = 1, a2 = o; a2 < i.length; a2++) {
      var r2 = i[a2], s2 = r2.content;
      if ("punctuation" === r2.type && "string" == typeof s2) {
        if (e2.test(s2))
          t2++;
        else if (n2.test(s2) && 0 === --t2)
          return a2;
      }
    }
    return -1;
  }
  function g(e2, n2) {
    var t2 = e2.alias;
    t2 ? Array.isArray(t2) || (e2.alias = t2 = [t2]) : e2.alias = t2 = [], t2.push(n2);
  }
}), Prism.languages.sql = { comment: { pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|(?:--|\/\/|#).*)/, lookbehind: true }, variable: [{ pattern: /@(["'`])(?:\\[\s\S]|(?!\1)[^\\])+\1/, greedy: true }, /@[\w.$]+/], string: { pattern: /(^|[^@\\])("|')(?:\\[\s\S]|(?!\2)[^\\]|\2\2)*\2/, greedy: true, lookbehind: true }, identifier: { pattern: /(^|[^@\\])`(?:\\[\s\S]|[^`\\]|``)*`/, greedy: true, lookbehind: true, inside: { punctuation: /^`|`$/ } }, function: /\b(?:AVG|COUNT|FIRST|FORMAT|LAST|LCASE|LEN|MAX|MID|MIN|MOD|NOW|ROUND|SUM|UCASE)(?=\s*\()/i, keyword: /\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|AUTO_INCREMENT|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR(?:ACTER|SET)?|CHECK(?:POINT)?|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMNS?|COMMENT|COMMIT(?:TED)?|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS(?:TABLE)?|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|CYCLE|DATA(?:BASES?)?|DATE(?:TIME)?|DAY|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DELIMITERS?|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE|ELSE(?:IF)?|ENABLE|ENCLOSED|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPED?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|HOUR|IDENTITY(?:COL|_INSERT)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTERVAL|INTO|INVOKER|ISOLATION|ITERATE|JOIN|KEYS?|KILL|LANGUAGE|LAST|LEAVE|LEFT|LEVEL|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|LOOP|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MINUTE|MODE|MODIFIES|MODIFY|MONTH|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL|NATURAL|NCHAR|NEXT|NO|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREPARE|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READS?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEAT(?:ABLE)?|REPLACE|REPLICATION|REQUIRE|RESIGNAL|RESTORE|RESTRICT|RETURN(?:ING|S)?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SECOND|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|SQL|START(?:ING)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED|TEXT(?:SIZE)?|THEN|TIME(?:STAMP)?|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNLOCK|UNPIVOT|UNSIGNED|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?|YEAR)\b/i, boolean: /\b(?:FALSE|NULL|TRUE)\b/i, number: /\b0x[\da-f]+\b|\b\d+(?:\.\d*)?|\B\.\d+\b/i, operator: /[-+*\/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|DIV|ILIKE|IN|IS|LIKE|NOT|OR|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i, punctuation: /[;[\]()`,.]/ }, function(b) {
  var e = b.languages.javascript["template-string"], t = e.pattern.source, m = e.inside.interpolation, f = m.inside["interpolation-punctuation"], s = m.pattern.source;
  function n(e2, n2) {
    if (b.languages[e2])
      return { pattern: RegExp("((?:" + n2 + ")\\s*)" + t), lookbehind: true, greedy: true, inside: { "template-punctuation": { pattern: /^`|`$/, alias: "string" }, "embedded-code": { pattern: /[\s\S]+/, alias: e2 } } };
  }
  function h(e2, n2, t2) {
    e2 = { code: e2, grammar: n2, language: t2 };
    return b.hooks.run("before-tokenize", e2), e2.tokens = b.tokenize(e2.code, e2.grammar), b.hooks.run("after-tokenize", e2), e2.tokens;
  }
  function l(a2, e2, r) {
    var n2 = b.tokenize(a2, { interpolation: { pattern: RegExp(s), lookbehind: true } }), p = 0, d = {}, n2 = h(n2.map(function(e3) {
      if ("string" == typeof e3)
        return e3;
      for (var n3, t2, e3 = e3.content; -1 !== a2.indexOf((t2 = p++, n3 = "___" + r.toUpperCase() + "_" + t2 + "___")); )
        ;
      return d[n3] = e3, n3;
    }).join(""), e2, r), g = Object.keys(d);
    return p = 0, function e3(n3) {
      for (var t2 = 0; t2 < n3.length; t2++) {
        if (p >= g.length)
          return;
        var a3, r2, s2, i, o, l2, u2, c = n3[t2];
        "string" == typeof c || "string" == typeof c.content ? (a3 = g[p], -1 !== (u2 = (l2 = "string" == typeof c ? c : c.content).indexOf(a3)) && (++p, r2 = l2.substring(0, u2), o = d[a3], s2 = void 0, (i = {})["interpolation-punctuation"] = f, 3 === (i = b.tokenize(o, i)).length && ((s2 = [1, 1]).push.apply(s2, h(i[1], b.languages.javascript, "javascript")), i.splice.apply(i, s2)), s2 = new b.Token("interpolation", i, m.alias, o), i = l2.substring(u2 + a3.length), o = [], r2 && o.push(r2), o.push(s2), i && (e3(l2 = [i]), o.push.apply(o, l2)), "string" == typeof c ? (n3.splice.apply(n3, [t2, 1].concat(o)), t2 += o.length - 1) : c.content = o)) : (u2 = c.content, Array.isArray(u2) ? e3(u2) : e3([u2]));
      }
    }(n2), new b.Token(r, n2, "language-" + r, a2);
  }
  b.languages.javascript["template-string"] = [n("css", /\b(?:styled(?:\([^)]*\))?(?:\s*\.\s*\w+(?:\([^)]*\))*)*|css(?:\s*\.\s*(?:global|resolve))?|createGlobalStyle|keyframes)/.source), n("html", /\bhtml|\.\s*(?:inner|outer)HTML\s*\+?=/.source), n("svg", /\bsvg/.source), n("markdown", /\b(?:markdown|md)/.source), n("graphql", /\b(?:gql|graphql(?:\s*\.\s*experimental)?)/.source), n("sql", /\bsql/.source), e].filter(Boolean);
  var a = { javascript: true, js: true, typescript: true, ts: true, jsx: true, tsx: true };
  function u(e2) {
    return "string" == typeof e2 ? e2 : Array.isArray(e2) ? e2.map(u).join("") : u(e2.content);
  }
  b.hooks.add("after-tokenize", function(e2) {
    e2.language in a && !function e3(n2) {
      for (var t2 = 0, a2 = n2.length; t2 < a2; t2++) {
        var r, s2, i, o = n2[t2];
        "string" != typeof o && (r = o.content, Array.isArray(r) ? "template-string" === o.type ? (o = r[1], 3 === r.length && "string" != typeof o && "embedded-code" === o.type && (s2 = u(o), o = o.alias, o = Array.isArray(o) ? o[0] : o, i = b.languages[o]) && (r[1] = l(s2, i, o))) : e3(r) : "string" != typeof r && e3([r]));
      }
    }(e2.tokens);
  });
}(Prism), function(e) {
  e.languages.typescript = e.languages.extend("javascript", { "class-name": { pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/, lookbehind: true, greedy: true, inside: null }, builtin: /\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/ }), e.languages.typescript.keyword.push(/\b(?:abstract|declare|is|keyof|readonly|require)\b/, /\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/, /\btype\b(?=\s*(?:[\{*]|$))/), delete e.languages.typescript.parameter, delete e.languages.typescript["literal-property"];
  var n = e.languages.extend("typescript", {});
  delete n["class-name"], e.languages.typescript["class-name"].inside = n, e.languages.insertBefore("typescript", "function", { decorator: { pattern: /@[$\w\xA0-\uFFFF]+/, inside: { at: { pattern: /^@/, alias: "operator" }, function: /^[\s\S]+/ } }, "generic-function": { pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/, greedy: true, inside: { function: /^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/, generic: { pattern: /<[\s\S]+/, alias: "class-name", inside: n } } } }), e.languages.ts = e.languages.typescript;
}(Prism), function(e) {
  var n = e.languages.javascript, t = /\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})+\}/.source, a = "(@(?:arg|argument|param|property)\\s+(?:" + t + "\\s+)?)";
  e.languages.jsdoc = e.languages.extend("javadoclike", { parameter: { pattern: RegExp(a + /(?:(?!\s)[$\w\xA0-\uFFFF.])+(?=\s|$)/.source), lookbehind: true, inside: { punctuation: /\./ } } }), e.languages.insertBefore("jsdoc", "keyword", { "optional-parameter": { pattern: RegExp(a + /\[(?:(?!\s)[$\w\xA0-\uFFFF.])+(?:=[^[\]]+)?\](?=\s|$)/.source), lookbehind: true, inside: { parameter: { pattern: /(^\[)[$\w\xA0-\uFFFF\.]+/, lookbehind: true, inside: { punctuation: /\./ } }, code: { pattern: /(=)[\s\S]*(?=\]$)/, lookbehind: true, inside: n, alias: "language-javascript" }, punctuation: /[=[\]]/ } }, "class-name": [{ pattern: RegExp(/(@(?:augments|class|extends|interface|memberof!?|template|this|typedef)\s+(?:<TYPE>\s+)?)[A-Z]\w*(?:\.[A-Z]\w*)*/.source.replace(/<TYPE>/g, function() {
    return t;
  })), lookbehind: true, inside: { punctuation: /\./ } }, { pattern: RegExp("(@[a-z]+\\s+)" + t), lookbehind: true, inside: { string: n.string, number: n.number, boolean: n.boolean, keyword: e.languages.typescript.keyword, operator: /=>|\.\.\.|[&|?:*]/, punctuation: /[.,;=<>{}()[\]]/ } }], example: { pattern: /(@example\s+(?!\s))(?:[^@\s]|\s+(?!\s))+?(?=\s*(?:\*\s*)?(?:@\w|\*\/))/, lookbehind: true, inside: { code: { pattern: /^([\t ]*(?:\*\s*)?)\S.*$/m, lookbehind: true, inside: n, alias: "language-javascript" } } } }), e.languages.javadoclike.addSupport("javascript", e.languages.jsdoc);
}(Prism), function(e) {
  e.languages.flow = e.languages.extend("javascript", {}), e.languages.insertBefore("flow", "keyword", { type: [{ pattern: /\b(?:[Bb]oolean|Function|[Nn]umber|[Ss]tring|[Ss]ymbol|any|mixed|null|void)\b/, alias: "class-name" }] }), e.languages.flow["function-variable"].pattern = /(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=\s*(?:function\b|(?:\([^()]*\)(?:\s*:\s*\w+)?|(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/i, delete e.languages.flow.parameter, e.languages.insertBefore("flow", "operator", { "flow-punctuation": { pattern: /\{\||\|\}/, alias: "punctuation" } }), Array.isArray(e.languages.flow.keyword) || (e.languages.flow.keyword = [e.languages.flow.keyword]), e.languages.flow.keyword.unshift({ pattern: /(^|[^$]\b)(?:Class|declare|opaque|type)\b(?!\$)/, lookbehind: true }, { pattern: /(^|[^$]\B)\$(?:Diff|Enum|Exact|Keys|ObjMap|PropertyType|Record|Shape|Subtype|Supertype|await)\b(?!\$)/, lookbehind: true });
}(Prism), Prism.languages.n4js = Prism.languages.extend("javascript", { keyword: /\b(?:Array|any|boolean|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|module|new|null|number|package|private|protected|public|return|set|static|string|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/ }), Prism.languages.insertBefore("n4js", "constant", { annotation: { pattern: /@+\w+/, alias: "operator" } }), Prism.languages.n4jsd = Prism.languages.n4js, function(e) {
  function n(e2, n2) {
    return RegExp(e2.replace(/<ID>/g, function() {
      return /(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/.source;
    }), n2);
  }
  e.languages.insertBefore("javascript", "function-variable", { "method-variable": { pattern: RegExp("(\\.\\s*)" + e.languages.javascript["function-variable"].pattern.source), lookbehind: true, alias: ["function-variable", "method", "function", "property-access"] } }), e.languages.insertBefore("javascript", "function", { method: { pattern: RegExp("(\\.\\s*)" + e.languages.javascript.function.source), lookbehind: true, alias: ["function", "property-access"] } }), e.languages.insertBefore("javascript", "constant", { "known-class-name": [{ pattern: /\b(?:(?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)?Array|ArrayBuffer|BigInt|Boolean|DataView|Date|Error|Function|Intl|JSON|(?:Weak)?(?:Map|Set)|Math|Number|Object|Promise|Proxy|Reflect|RegExp|String|Symbol|WebAssembly)\b/, alias: "class-name" }, { pattern: /\b(?:[A-Z]\w*)Error\b/, alias: "class-name" }] }), e.languages.insertBefore("javascript", "keyword", { imports: { pattern: n(/(\bimport\b\s*)(?:<ID>(?:\s*,\s*(?:\*\s*as\s+<ID>|\{[^{}]*\}))?|\*\s*as\s+<ID>|\{[^{}]*\})(?=\s*\bfrom\b)/.source), lookbehind: true, inside: e.languages.javascript }, exports: { pattern: n(/(\bexport\b\s*)(?:\*(?:\s*as\s+<ID>)?(?=\s*\bfrom\b)|\{[^{}]*\})/.source), lookbehind: true, inside: e.languages.javascript } }), e.languages.javascript.keyword.unshift({ pattern: /\b(?:as|default|export|from|import)\b/, alias: "module" }, { pattern: /\b(?:await|break|catch|continue|do|else|finally|for|if|return|switch|throw|try|while|yield)\b/, alias: "control-flow" }, { pattern: /\bnull\b/, alias: ["null", "nil"] }, { pattern: /\bundefined\b/, alias: "nil" }), e.languages.insertBefore("javascript", "operator", { spread: { pattern: /\.{3}/, alias: "operator" }, arrow: { pattern: /=>/, alias: "operator" } }), e.languages.insertBefore("javascript", "punctuation", { "property-access": { pattern: n(/(\.\s*)#?<ID>/.source), lookbehind: true }, "maybe-class-name": { pattern: /(^|[^$\w\xA0-\uFFFF])[A-Z][$\w\xA0-\uFFFF]+/, lookbehind: true }, dom: { pattern: /\b(?:document|(?:local|session)Storage|location|navigator|performance|window)\b/, alias: "variable" }, console: { pattern: /\bconsole(?=\s*\.)/, alias: "class-name" } });
  for (var t = ["function", "function-variable", "method", "method-variable", "property-access"], a = 0; a < t.length; a++) {
    var r = t[a], s = e.languages.javascript[r], r = (s = "RegExp" === e.util.type(s) ? e.languages.javascript[r] = { pattern: s } : s).inside || {};
    (s.inside = r)["maybe-class-name"] = /^[A-Z][\s\S]*/;
  }
}(Prism), function(s) {
  var e = s.util.clone(s.languages.javascript), t = /(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))\*\/)/.source, a = /(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})/.source, r = /(?:\{<S>*\.{3}(?:[^{}]|<BRACES>)*\})/.source;
  function n(e2, n2) {
    return e2 = e2.replace(/<S>/g, function() {
      return t;
    }).replace(/<BRACES>/g, function() {
      return a;
    }).replace(/<SPREAD>/g, function() {
      return r;
    }), RegExp(e2, n2);
  }
  r = n(r).source, s.languages.jsx = s.languages.extend("markup", e), s.languages.jsx.tag.pattern = n(/<\/?(?:[\w.:-]+(?:<S>+(?:[\w.:$-]+(?:=(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s{'"/>=]+|<BRACES>))?|<SPREAD>))*<S>*\/?)?>/.source), s.languages.jsx.tag.inside.tag.pattern = /^<\/?[^\s>\/]*/, s.languages.jsx.tag.inside["attr-value"].pattern = /=(?!\{)(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s'">]+)/, s.languages.jsx.tag.inside.tag.inside["class-name"] = /^[A-Z]\w*(?:\.[A-Z]\w*)*$/, s.languages.jsx.tag.inside.comment = e.comment, s.languages.insertBefore("inside", "attr-name", { spread: { pattern: n(/<SPREAD>/.source), inside: s.languages.jsx } }, s.languages.jsx.tag), s.languages.insertBefore("inside", "special-attr", { script: { pattern: n(/=<BRACES>/.source), alias: "language-javascript", inside: { "script-punctuation": { pattern: /^=(?=\{)/, alias: "punctuation" }, rest: s.languages.jsx } } }, s.languages.jsx.tag);
  function i(e2) {
    for (var n2 = [], t2 = 0; t2 < e2.length; t2++) {
      var a2 = e2[t2], r2 = false;
      "string" != typeof a2 && ("tag" === a2.type && a2.content[0] && "tag" === a2.content[0].type ? "</" === a2.content[0].content[0].content ? 0 < n2.length && n2[n2.length - 1].tagName === o(a2.content[0].content[1]) && n2.pop() : "/>" !== a2.content[a2.content.length - 1].content && n2.push({ tagName: o(a2.content[0].content[1]), openedBraces: 0 }) : 0 < n2.length && "punctuation" === a2.type && "{" === a2.content ? n2[n2.length - 1].openedBraces++ : 0 < n2.length && 0 < n2[n2.length - 1].openedBraces && "punctuation" === a2.type && "}" === a2.content ? n2[n2.length - 1].openedBraces-- : r2 = true), (r2 || "string" == typeof a2) && 0 < n2.length && 0 === n2[n2.length - 1].openedBraces && (r2 = o(a2), t2 < e2.length - 1 && ("string" == typeof e2[t2 + 1] || "plain-text" === e2[t2 + 1].type) && (r2 += o(e2[t2 + 1]), e2.splice(t2 + 1, 1)), 0 < t2 && ("string" == typeof e2[t2 - 1] || "plain-text" === e2[t2 - 1].type) && (r2 = o(e2[t2 - 1]) + r2, e2.splice(t2 - 1, 1), t2--), e2[t2] = new s.Token("plain-text", r2, null, r2)), a2.content && "string" != typeof a2.content && i(a2.content);
    }
  }
  var o = function(e2) {
    return e2 ? "string" == typeof e2 ? e2 : "string" == typeof e2.content ? e2.content : e2.content.map(o).join("") : "";
  };
  s.hooks.add("after-tokenize", function(e2) {
    "jsx" !== e2.language && "tsx" !== e2.language || i(e2.tokens);
  });
}(Prism), function(e) {
  var n = e.util.clone(e.languages.typescript), n = (e.languages.tsx = e.languages.extend("jsx", n), delete e.languages.tsx.parameter, delete e.languages.tsx["literal-property"], e.languages.tsx.tag);
  n.pattern = RegExp(/(^|[^\w$]|(?=<\/))/.source + "(?:" + n.pattern.source + ")", n.pattern.flags), n.lookbehind = true;
}(Prism), Prism.languages.swift = { comment: { pattern: /(^|[^\\:])(?:\/\/.*|\/\*(?:[^/*]|\/(?!\*)|\*(?!\/)|\/\*(?:[^*]|\*(?!\/))*\*\/)*\*\/)/, lookbehind: true, greedy: true }, "string-literal": [{ pattern: RegExp(/(^|[^"#])/.source + "(?:" + /"(?:\\(?:\((?:[^()]|\([^()]*\))*\)|\r\n|[^(])|[^\\\r\n"])*"/.source + "|" + /"""(?:\\(?:\((?:[^()]|\([^()]*\))*\)|[^(])|[^\\"]|"(?!""))*"""/.source + ")" + /(?!["#])/.source), lookbehind: true, greedy: true, inside: { interpolation: { pattern: /(\\\()(?:[^()]|\([^()]*\))*(?=\))/, lookbehind: true, inside: null }, "interpolation-punctuation": { pattern: /^\)|\\\($/, alias: "punctuation" }, punctuation: /\\(?=[\r\n])/, string: /[\s\S]+/ } }, { pattern: RegExp(/(^|[^"#])(#+)/.source + "(?:" + /"(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|\r\n|[^#])|[^\\\r\n])*?"/.source + "|" + /"""(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|[^#])|[^\\])*?"""/.source + ")\\2"), lookbehind: true, greedy: true, inside: { interpolation: { pattern: /(\\#+\()(?:[^()]|\([^()]*\))*(?=\))/, lookbehind: true, inside: null }, "interpolation-punctuation": { pattern: /^\)|\\#+\($/, alias: "punctuation" }, string: /[\s\S]+/ } }], directive: { pattern: RegExp(/#/.source + "(?:" + /(?:elseif|if)\b/.source + "(?:[ 	]*" + /(?:![ \t]*)?(?:\b\w+\b(?:[ \t]*\((?:[^()]|\([^()]*\))*\))?|\((?:[^()]|\([^()]*\))*\))(?:[ \t]*(?:&&|\|\|))?/.source + ")+|" + /(?:else|endif)\b/.source + ")"), alias: "property", inside: { "directive-name": /^#\w+/, boolean: /\b(?:false|true)\b/, number: /\b\d+(?:\.\d+)*\b/, operator: /!|&&|\|\||[<>]=?/, punctuation: /[(),]/ } }, literal: { pattern: /#(?:colorLiteral|column|dsohandle|file(?:ID|Literal|Path)?|function|imageLiteral|line)\b/, alias: "constant" }, "other-directive": { pattern: /#\w+\b/, alias: "property" }, attribute: { pattern: /@\w+/, alias: "atrule" }, "function-definition": { pattern: /(\bfunc\s+)\w+/, lookbehind: true, alias: "function" }, label: { pattern: /\b(break|continue)\s+\w+|\b[a-zA-Z_]\w*(?=\s*:\s*(?:for|repeat|while)\b)/, lookbehind: true, alias: "important" }, keyword: /\b(?:Any|Protocol|Self|Type|actor|as|assignment|associatedtype|associativity|async|await|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|higherThan|if|import|in|indirect|infix|init|inout|internal|is|isolated|lazy|left|let|lowerThan|mutating|none|nonisolated|nonmutating|open|operator|optional|override|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|right|safe|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|unsafe|var|weak|where|while|willSet)\b/, boolean: /\b(?:false|true)\b/, nil: { pattern: /\bnil\b/, alias: "constant" }, "short-argument": /\$\d+\b/, omit: { pattern: /\b_\b/, alias: "keyword" }, number: /\b(?:[\d_]+(?:\.[\de_]+)?|0x[a-f0-9_]+(?:\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i, "class-name": /\b[A-Z](?:[A-Z_\d]*[a-z]\w*)?\b/, function: /\b[a-z_]\w*(?=\s*\()/i, constant: /\b(?:[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/, operator: /[-+*/%=!<>&|^~?]+|\.[.\-+*/%=!<>&|^~?]+/, punctuation: /[{}[\]();,.:\\]/ }, Prism.languages.swift["string-literal"].forEach(function(e) {
  e.inside.interpolation.inside = Prism.languages.swift;
}), function(e) {
  e.languages.kotlin = e.languages.extend("clike", { keyword: { pattern: /(^|[^.])\b(?:abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|dynamic|else|enum|expect|external|final|finally|for|fun|get|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|null|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|set|super|suspend|tailrec|this|throw|to|try|typealias|val|var|vararg|when|where|while)\b/, lookbehind: true }, function: [{ pattern: /(?:`[^\r\n`]+`|\b\w+)(?=\s*\()/, greedy: true }, { pattern: /(\.)(?:`[^\r\n`]+`|\w+)(?=\s*\{)/, lookbehind: true, greedy: true }], number: /\b(?:0[xX][\da-fA-F]+(?:_[\da-fA-F]+)*|0[bB][01]+(?:_[01]+)*|\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?[fFL]?)\b/, operator: /\+[+=]?|-[-=>]?|==?=?|!(?:!|==?)?|[\/*%<>]=?|[?:]:?|\.\.|&&|\|\||\b(?:and|inv|or|shl|shr|ushr|xor)\b/ }), delete e.languages.kotlin["class-name"];
  var n = { "interpolation-punctuation": { pattern: /^\$\{?|\}$/, alias: "punctuation" }, expression: { pattern: /[\s\S]+/, inside: e.languages.kotlin } };
  e.languages.insertBefore("kotlin", "string", { "string-literal": [{ pattern: /"""(?:[^$]|\$(?:(?!\{)|\{[^{}]*\}))*?"""/, alias: "multiline", inside: { interpolation: { pattern: /\$(?:[a-z_]\w*|\{[^{}]*\})/i, inside: n }, string: /[\s\S]+/ } }, { pattern: /"(?:[^"\\\r\n$]|\\.|\$(?:(?!\{)|\{[^{}]*\}))*"/, alias: "singleline", inside: { interpolation: { pattern: /((?:^|[^\\])(?:\\{2})*)\$(?:[a-z_]\w*|\{[^{}]*\})/i, lookbehind: true, inside: n }, string: /[\s\S]+/ } }], char: { pattern: /'(?:[^'\\\r\n]|\\(?:.|u[a-fA-F0-9]{0,4}))'/, greedy: true } }), delete e.languages.kotlin.string, e.languages.insertBefore("kotlin", "keyword", { annotation: { pattern: /\B@(?:\w+:)?(?:[A-Z]\w*|\[[^\]]+\])/, alias: "builtin" } }), e.languages.insertBefore("kotlin", "function", { label: { pattern: /\b\w+@|@\w+\b/, alias: "symbol" } }), e.languages.kt = e.languages.kotlin, e.languages.kts = e.languages.kotlin;
}(Prism), Prism.languages.c = Prism.languages.extend("clike", { comment: { pattern: /\/\/(?:[^\r\n\\]|\\(?:\r\n?|\n|(?![\r\n])))*|\/\*[\s\S]*?(?:\*\/|$)/, greedy: true }, string: { pattern: /"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/, greedy: true }, "class-name": { pattern: /(\b(?:enum|struct)\s+(?:__attribute__\s*\(\([\s\S]*?\)\)\s*)?)\w+|\b[a-z]\w*_t\b/, lookbehind: true }, keyword: /\b(?:_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|__attribute__|asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|typeof|union|unsigned|void|volatile|while)\b/, function: /\b[a-z_]\w*(?=\s*\()/i, number: /(?:\b0x(?:[\da-f]+(?:\.[\da-f]*)?|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i, operator: />>=?|<<=?|->|([-+&|:])\1|[?:~]|[-+*/%&|^!=<>]=?/ }), Prism.languages.insertBefore("c", "string", { char: { pattern: /'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n]){0,32}'/, greedy: true } }), Prism.languages.insertBefore("c", "string", { macro: { pattern: /(^[\t ]*)#\s*[a-z](?:[^\r\n\\/]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|\\(?:\r\n|[\s\S]))*/im, lookbehind: true, greedy: true, alias: "property", inside: { string: [{ pattern: /^(#\s*include\s*)<[^>]+>/, lookbehind: true }, Prism.languages.c.string], char: Prism.languages.c.char, comment: Prism.languages.c.comment, "macro-name": [{ pattern: /(^#\s*define\s+)\w+\b(?!\()/i, lookbehind: true }, { pattern: /(^#\s*define\s+)\w+\b(?=\()/i, lookbehind: true, alias: "function" }], directive: { pattern: /^(#\s*)[a-z]+/, lookbehind: true, alias: "keyword" }, "directive-hash": /^#/, punctuation: /##|\\(?=[\r\n])/, expression: { pattern: /\S[\s\S]*/, inside: Prism.languages.c } } } }), Prism.languages.insertBefore("c", "function", { constant: /\b(?:EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|__DATE__|__FILE__|__LINE__|__TIMESTAMP__|__TIME__|__func__|stderr|stdin|stdout)\b/ }), delete Prism.languages.c.boolean, Prism.languages.objectivec = Prism.languages.extend("c", { string: { pattern: /@?"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/, greedy: true }, keyword: /\b(?:asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|in|inline|int|long|register|return|self|short|signed|sizeof|static|struct|super|switch|typedef|typeof|union|unsigned|void|volatile|while)\b|(?:@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b/, operator: /-[->]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|\|?|[~^%?*\/@]/ }), delete Prism.languages.objectivec["class-name"], Prism.languages.objc = Prism.languages.objectivec, Prism.languages.reason = Prism.languages.extend("clike", { string: { pattern: /"(?:\\(?:\r\n|[\s\S])|[^\\\r\n"])*"/, greedy: true }, "class-name": /\b[A-Z]\w*/, keyword: /\b(?:and|as|assert|begin|class|constraint|do|done|downto|else|end|exception|external|for|fun|function|functor|if|in|include|inherit|initializer|lazy|let|method|module|mutable|new|nonrec|object|of|open|or|private|rec|sig|struct|switch|then|to|try|type|val|virtual|when|while|with)\b/, operator: /\.{3}|:[:=]|\|>|->|=(?:==?|>)?|<=?|>=?|[|^?'#!~`]|[+\-*\/]\.?|\b(?:asr|land|lor|lsl|lsr|lxor|mod)\b/ }), Prism.languages.insertBefore("reason", "class-name", { char: { pattern: /'(?:\\x[\da-f]{2}|\\o[0-3][0-7][0-7]|\\\d{3}|\\.|[^'\\\r\n])'/, greedy: true }, constructor: /\b[A-Z]\w*\b(?!\s*\.)/, label: { pattern: /\b[a-z]\w*(?=::)/, alias: "symbol" } }), delete Prism.languages.reason.function, function(e) {
  for (var n = /\/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|<self>)*\*\//.source, t = 0; t < 2; t++)
    n = n.replace(/<self>/g, function() {
      return n;
    });
  n = n.replace(/<self>/g, function() {
    return /[^\s\S]/.source;
  }), e.languages.rust = { comment: [{ pattern: RegExp(/(^|[^\\])/.source + n), lookbehind: true, greedy: true }, { pattern: /(^|[^\\:])\/\/.*/, lookbehind: true, greedy: true }], string: { pattern: /b?"(?:\\[\s\S]|[^\\"])*"|b?r(#*)"(?:[^"]|"(?!\1))*"\1/, greedy: true }, char: { pattern: /b?'(?:\\(?:x[0-7][\da-fA-F]|u\{(?:[\da-fA-F]_*){1,6}\}|.)|[^\\\r\n\t'])'/, greedy: true }, attribute: { pattern: /#!?\[(?:[^\[\]"]|"(?:\\[\s\S]|[^\\"])*")*\]/, greedy: true, alias: "attr-name", inside: { string: null } }, "closure-params": { pattern: /([=(,:]\s*|\bmove\s*)\|[^|]*\||\|[^|]*\|(?=\s*(?:\{|->))/, lookbehind: true, greedy: true, inside: { "closure-punctuation": { pattern: /^\||\|$/, alias: "punctuation" }, rest: null } }, "lifetime-annotation": { pattern: /'\w+/, alias: "symbol" }, "fragment-specifier": { pattern: /(\$\w+:)[a-z]+/, lookbehind: true, alias: "punctuation" }, variable: /\$\w+/, "function-definition": { pattern: /(\bfn\s+)\w+/, lookbehind: true, alias: "function" }, "type-definition": { pattern: /(\b(?:enum|struct|trait|type|union)\s+)\w+/, lookbehind: true, alias: "class-name" }, "module-declaration": [{ pattern: /(\b(?:crate|mod)\s+)[a-z][a-z_\d]*/, lookbehind: true, alias: "namespace" }, { pattern: /(\b(?:crate|self|super)\s*)::\s*[a-z][a-z_\d]*\b(?:\s*::(?:\s*[a-z][a-z_\d]*\s*::)*)?/, lookbehind: true, alias: "namespace", inside: { punctuation: /::/ } }], keyword: [/\b(?:Self|abstract|as|async|await|become|box|break|const|continue|crate|do|dyn|else|enum|extern|final|fn|for|if|impl|in|let|loop|macro|match|mod|move|mut|override|priv|pub|ref|return|self|static|struct|super|trait|try|type|typeof|union|unsafe|unsized|use|virtual|where|while|yield)\b/, /\b(?:bool|char|f(?:32|64)|[ui](?:8|16|32|64|128|size)|str)\b/], function: /\b[a-z_]\w*(?=\s*(?:::\s*<|\())/, macro: { pattern: /\b\w+!/, alias: "property" }, constant: /\b[A-Z_][A-Z_\d]+\b/, "class-name": /\b[A-Z]\w*\b/, namespace: { pattern: /(?:\b[a-z][a-z_\d]*\s*::\s*)*\b[a-z][a-z_\d]*\s*::(?!\s*<)/, inside: { punctuation: /::/ } }, number: /\b(?:0x[\dA-Fa-f](?:_?[\dA-Fa-f])*|0o[0-7](?:_?[0-7])*|0b[01](?:_?[01])*|(?:(?:\d(?:_?\d)*)?\.)?\d(?:_?\d)*(?:[Ee][+-]?\d+)?)(?:_?(?:f32|f64|[iu](?:8|16|32|64|size)?))?\b/, boolean: /\b(?:false|true)\b/, punctuation: /->|\.\.=|\.{1,3}|::|[{}[\];(),:]/, operator: /[-+*\/%!^]=?|=[=>]?|&[&=]?|\|[|=]?|<<?=?|>>?=?|[@?]/ }, e.languages.rust["closure-params"].inside.rest = e.languages.rust, e.languages.rust.attribute.inside.string = e.languages.rust.string;
}(Prism), Prism.languages.go = Prism.languages.extend("clike", { string: { pattern: /(^|[^\\])"(?:\\.|[^"\\\r\n])*"|`[^`]*`/, lookbehind: true, greedy: true }, keyword: /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(?:to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/, boolean: /\b(?:_|false|iota|nil|true)\b/, number: [/\b0(?:b[01_]+|o[0-7_]+)i?\b/i, /\b0x(?:[a-f\d_]+(?:\.[a-f\d_]*)?|\.[a-f\d_]+)(?:p[+-]?\d+(?:_\d+)*)?i?(?!\w)/i, /(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?[\d_]+)?i?(?!\w)/i], operator: /[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./, builtin: /\b(?:append|bool|byte|cap|close|complex|complex(?:64|128)|copy|delete|error|float(?:32|64)|u?int(?:8|16|32|64)?|imag|len|make|new|panic|print(?:ln)?|real|recover|rune|string|uintptr)\b/ }), Prism.languages.insertBefore("go", "string", { char: { pattern: /'(?:\\.|[^'\\\r\n]){0,10}'/, greedy: true } }), delete Prism.languages.go["class-name"], function(e) {
  var n = /\b(?:alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|char8_t|class|co_await|co_return|co_yield|compl|concept|const|const_cast|consteval|constexpr|constinit|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|final|float|for|friend|goto|if|import|inline|int|int16_t|int32_t|int64_t|int8_t|long|module|mutable|namespace|new|noexcept|nullptr|operator|override|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|uint16_t|uint32_t|uint64_t|uint8_t|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/, t = /\b(?!<keyword>)\w+(?:\s*\.\s*\w+)*\b/.source.replace(/<keyword>/g, function() {
    return n.source;
  });
  e.languages.cpp = e.languages.extend("c", { "class-name": [{ pattern: RegExp(/(\b(?:class|concept|enum|struct|typename)\s+)(?!<keyword>)\w+/.source.replace(/<keyword>/g, function() {
    return n.source;
  })), lookbehind: true }, /\b[A-Z]\w*(?=\s*::\s*\w+\s*\()/, /\b[A-Z_]\w*(?=\s*::\s*~\w+\s*\()/i, /\b\w+(?=\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>\s*::\s*\w+\s*\()/], keyword: n, number: { pattern: /(?:\b0b[01']+|\b0x(?:[\da-f']+(?:\.[\da-f']*)?|\.[\da-f']+)(?:p[+-]?[\d']+)?|(?:\b[\d']+(?:\.[\d']*)?|\B\.[\d']+)(?:e[+-]?[\d']+)?)[ful]{0,4}/i, greedy: true }, operator: />>=?|<<=?|->|--|\+\+|&&|\|\||[?:~]|<=>|[-+*/%&|^!=<>]=?|\b(?:and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/, boolean: /\b(?:false|true)\b/ }), e.languages.insertBefore("cpp", "string", { module: { pattern: RegExp(/(\b(?:import|module)\s+)/.source + "(?:" + /"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|<[^<>\r\n]*>/.source + "|" + /<mod-name>(?:\s*:\s*<mod-name>)?|:\s*<mod-name>/.source.replace(/<mod-name>/g, function() {
    return t;
  }) + ")"), lookbehind: true, greedy: true, inside: { string: /^[<"][\s\S]+/, operator: /:/, punctuation: /\./ } }, "raw-string": { pattern: /R"([^()\\ ]{0,16})\([\s\S]*?\)\1"/, alias: "string", greedy: true } }), e.languages.insertBefore("cpp", "keyword", { "generic-function": { pattern: /\b(?!operator\b)[a-z_]\w*\s*<(?:[^<>]|<[^<>]*>)*>(?=\s*\()/i, inside: { function: /^\w+/, generic: { pattern: /<[\s\S]+/, alias: "class-name", inside: e.languages.cpp } } } }), e.languages.insertBefore("cpp", "operator", { "double-colon": { pattern: /::/, alias: "punctuation" } }), e.languages.insertBefore("cpp", "class-name", { "base-clause": { pattern: /(\b(?:class|struct)\s+\w+\s*:\s*)[^;{}"'\s]+(?:\s+[^;{}"'\s]+)*(?=\s*[;{])/, lookbehind: true, greedy: true, inside: e.languages.extend("cpp", {}) } }), e.languages.insertBefore("inside", "double-colon", { "class-name": /\b[a-z_]\w*\b(?!\s*::)/i }, e.languages.cpp["base-clause"]);
}(Prism);

// src/themes/index.ts
var themes_exports = {};
__export(themes_exports, {
  dracula: () => dracula_default,
  duotoneDark: () => duotoneDark_default,
  duotoneLight: () => duotoneLight_default,
  github: () => github_default,
  jettwaveDark: () => jettwaveDark_default,
  jettwaveLight: () => jettwaveLight_default,
  nightOwl: () => nightOwl_default,
  nightOwlLight: () => nightOwlLight_default,
  oceanicNext: () => oceanicNext_default,
  okaidia: () => okaidia_default,
  palenight: () => palenight_default,
  shadesOfPurple: () => shadesOfPurple_default,
  synthwave84: () => synthwave84_default,
  ultramin: () => ultramin_default,
  vsDark: () => vsDark_default,
  vsLight: () => vsLight_default
});

// src/themes/dracula.ts
var theme = {
  plain: {
    color: "#F8F8F2",
    backgroundColor: "#282A36"
  },
  styles: [
    {
      types: ["prolog", "constant", "builtin"],
      style: {
        color: "rgb(189, 147, 249)"
      }
    },
    {
      types: ["inserted", "function"],
      style: {
        color: "rgb(80, 250, 123)"
      }
    },
    {
      types: ["deleted"],
      style: {
        color: "rgb(255, 85, 85)"
      }
    },
    {
      types: ["changed"],
      style: {
        color: "rgb(255, 184, 108)"
      }
    },
    {
      types: ["punctuation", "symbol"],
      style: {
        color: "rgb(248, 248, 242)"
      }
    },
    {
      types: ["string", "char", "tag", "selector"],
      style: {
        color: "rgb(255, 121, 198)"
      }
    },
    {
      types: ["keyword", "variable"],
      style: {
        color: "rgb(189, 147, 249)",
        fontStyle: "italic"
      }
    },
    {
      types: ["comment"],
      style: {
        color: "rgb(98, 114, 164)"
      }
    },
    {
      types: ["attr-name"],
      style: {
        color: "rgb(241, 250, 140)"
      }
    }
  ]
};
var dracula_default = theme;

// src/themes/duotoneDark.ts
var theme2 = {
  plain: {
    backgroundColor: "#2a2734",
    color: "#9a86fd"
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata", "punctuation"],
      style: {
        color: "#6c6783"
      }
    },
    {
      types: ["namespace"],
      style: {
        opacity: 0.7
      }
    },
    {
      types: ["tag", "operator", "number"],
      style: {
        color: "#e09142"
      }
    },
    {
      types: ["property", "function"],
      style: {
        color: "#9a86fd"
      }
    },
    {
      types: ["tag-id", "selector", "atrule-id"],
      style: {
        color: "#eeebff"
      }
    },
    {
      types: ["attr-name"],
      style: {
        color: "#c4b9fe"
      }
    },
    {
      types: [
        "boolean",
        "string",
        "entity",
        "url",
        "attr-value",
        "keyword",
        "control",
        "directive",
        "unit",
        "statement",
        "regex",
        "atrule",
        "placeholder",
        "variable"
      ],
      style: {
        color: "#ffcc99"
      }
    },
    {
      types: ["deleted"],
      style: {
        textDecorationLine: "line-through"
      }
    },
    {
      types: ["inserted"],
      style: {
        textDecorationLine: "underline"
      }
    },
    {
      types: ["italic"],
      style: {
        fontStyle: "italic"
      }
    },
    {
      types: ["important", "bold"],
      style: {
        fontWeight: "bold"
      }
    },
    {
      types: ["important"],
      style: {
        color: "#c4b9fe"
      }
    }
  ]
};
var duotoneDark_default = theme2;

// src/themes/duotoneLight.ts
var theme3 = {
  plain: {
    backgroundColor: "#faf8f5",
    color: "#728fcb"
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata", "punctuation"],
      style: {
        color: "#b6ad9a"
      }
    },
    {
      types: ["namespace"],
      style: {
        opacity: 0.7
      }
    },
    {
      types: ["tag", "operator", "number"],
      style: {
        color: "#063289"
      }
    },
    {
      types: ["property", "function"],
      style: {
        color: "#b29762"
      }
    },
    {
      types: ["tag-id", "selector", "atrule-id"],
      style: {
        color: "#2d2006"
      }
    },
    {
      types: ["attr-name"],
      style: {
        color: "#896724"
      }
    },
    {
      types: [
        "boolean",
        "string",
        "entity",
        "url",
        "attr-value",
        "keyword",
        "control",
        "directive",
        "unit",
        "statement",
        "regex",
        "atrule"
      ],
      style: {
        color: "#728fcb"
      }
    },
    {
      types: ["placeholder", "variable"],
      style: {
        color: "#93abdc"
      }
    },
    {
      types: ["deleted"],
      style: {
        textDecorationLine: "line-through"
      }
    },
    {
      types: ["inserted"],
      style: {
        textDecorationLine: "underline"
      }
    },
    {
      types: ["italic"],
      style: {
        fontStyle: "italic"
      }
    },
    {
      types: ["important", "bold"],
      style: {
        fontWeight: "bold"
      }
    },
    {
      types: ["important"],
      style: {
        color: "#896724"
      }
    }
  ]
};
var duotoneLight_default = theme3;

// src/themes/github.ts
var theme4 = {
  plain: {
    color: "#393A34",
    backgroundColor: "#f6f8fa"
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "#999988",
        fontStyle: "italic"
      }
    },
    {
      types: ["namespace"],
      style: {
        opacity: 0.7
      }
    },
    {
      types: ["string", "attr-value"],
      style: {
        color: "#e3116c"
      }
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "#393A34"
      }
    },
    {
      types: [
        "entity",
        "url",
        "symbol",
        "number",
        "boolean",
        "variable",
        "constant",
        "property",
        "regex",
        "inserted"
      ],
      style: {
        color: "#36acaa"
      }
    },
    {
      types: ["atrule", "keyword", "attr-name", "selector"],
      style: {
        color: "#00a4db"
      }
    },
    {
      types: ["function", "deleted", "tag"],
      style: {
        color: "#d73a49"
      }
    },
    {
      types: ["function-variable"],
      style: {
        color: "#6f42c1"
      }
    },
    {
      types: ["tag", "selector", "keyword"],
      style: {
        color: "#00009f"
      }
    }
  ]
};
var github_default = theme4;

// src/themes/nightOwl.ts
var theme5 = {
  plain: {
    color: "#d6deeb",
    backgroundColor: "#011627"
  },
  styles: [
    {
      types: ["changed"],
      style: {
        color: "rgb(162, 191, 252)",
        fontStyle: "italic"
      }
    },
    {
      types: ["deleted"],
      style: {
        color: "rgba(239, 83, 80, 0.56)",
        fontStyle: "italic"
      }
    },
    {
      types: ["inserted", "attr-name"],
      style: {
        color: "rgb(173, 219, 103)",
        fontStyle: "italic"
      }
    },
    {
      types: ["comment"],
      style: {
        color: "rgb(99, 119, 119)",
        fontStyle: "italic"
      }
    },
    {
      types: ["string", "url"],
      style: {
        color: "rgb(173, 219, 103)"
      }
    },
    {
      types: ["variable"],
      style: {
        color: "rgb(214, 222, 235)"
      }
    },
    {
      types: ["number"],
      style: {
        color: "rgb(247, 140, 108)"
      }
    },
    {
      types: ["builtin", "char", "constant", "function"],
      style: {
        color: "rgb(130, 170, 255)"
      }
    },
    {
      // This was manually added after the auto-generation
      // so that punctuations are not italicised
      types: ["punctuation"],
      style: {
        color: "rgb(199, 146, 234)"
      }
    },
    {
      types: ["selector", "doctype"],
      style: {
        color: "rgb(199, 146, 234)",
        fontStyle: "italic"
      }
    },
    {
      types: ["class-name"],
      style: {
        color: "rgb(255, 203, 139)"
      }
    },
    {
      types: ["tag", "operator", "keyword"],
      style: {
        color: "rgb(127, 219, 202)"
      }
    },
    {
      types: ["boolean"],
      style: {
        color: "rgb(255, 88, 116)"
      }
    },
    {
      types: ["property"],
      style: {
        color: "rgb(128, 203, 196)"
      }
    },
    {
      types: ["namespace"],
      style: {
        color: "rgb(178, 204, 214)"
      }
    }
  ]
};
var nightOwl_default = theme5;

// src/themes/nightOwlLight.ts
var theme6 = {
  plain: {
    color: "#403f53",
    backgroundColor: "#FBFBFB"
  },
  styles: [
    {
      types: ["changed"],
      style: {
        color: "rgb(162, 191, 252)",
        fontStyle: "italic"
      }
    },
    {
      types: ["deleted"],
      style: {
        color: "rgba(239, 83, 80, 0.56)",
        fontStyle: "italic"
      }
    },
    {
      types: ["inserted", "attr-name"],
      style: {
        color: "rgb(72, 118, 214)",
        fontStyle: "italic"
      }
    },
    {
      types: ["comment"],
      style: {
        color: "rgb(152, 159, 177)",
        fontStyle: "italic"
      }
    },
    {
      types: ["string", "builtin", "char", "constant", "url"],
      style: {
        color: "rgb(72, 118, 214)"
      }
    },
    {
      types: ["variable"],
      style: {
        color: "rgb(201, 103, 101)"
      }
    },
    {
      types: ["number"],
      style: {
        color: "rgb(170, 9, 130)"
      }
    },
    {
      // This was manually added after the auto-generation
      // so that punctuations are not italicised
      types: ["punctuation"],
      style: {
        color: "rgb(153, 76, 195)"
      }
    },
    {
      types: ["function", "selector", "doctype"],
      style: {
        color: "rgb(153, 76, 195)",
        fontStyle: "italic"
      }
    },
    {
      types: ["class-name"],
      style: {
        color: "rgb(17, 17, 17)"
      }
    },
    {
      types: ["tag"],
      style: {
        color: "rgb(153, 76, 195)"
      }
    },
    {
      types: ["operator", "property", "keyword", "namespace"],
      style: {
        color: "rgb(12, 150, 155)"
      }
    },
    {
      types: ["boolean"],
      style: {
        color: "rgb(188, 84, 84)"
      }
    }
  ]
};
var nightOwlLight_default = theme6;

// src/themes/oceanicNext.ts
var colors = {
  char: "#D8DEE9",
  comment: "#999999",
  keyword: "#c5a5c5",
  primitive: "#5a9bcf",
  string: "#8dc891",
  variable: "#d7deea",
  boolean: "#ff8b50",
  punctuation: "#5FB3B3",
  tag: "#fc929e",
  function: "#79b6f2",
  className: "#FAC863",
  method: "#6699CC",
  operator: "#fc929e"
};
var theme7 = {
  plain: {
    backgroundColor: "#282c34",
    color: "#ffffff"
  },
  styles: [
    {
      types: ["attr-name"],
      style: {
        color: colors.keyword
      }
    },
    {
      types: ["attr-value"],
      style: {
        color: colors.string
      }
    },
    {
      types: [
        "comment",
        "block-comment",
        "prolog",
        "doctype",
        "cdata",
        "shebang"
      ],
      style: {
        color: colors.comment
      }
    },
    {
      types: [
        "property",
        "number",
        "function-name",
        "constant",
        "symbol",
        "deleted"
      ],
      style: {
        color: colors.primitive
      }
    },
    {
      types: ["boolean"],
      style: {
        color: colors.boolean
      }
    },
    {
      types: ["tag"],
      style: {
        color: colors.tag
      }
    },
    {
      types: ["string"],
      style: {
        color: colors.string
      }
    },
    {
      types: ["punctuation"],
      style: {
        color: colors.string
      }
    },
    {
      types: ["selector", "char", "builtin", "inserted"],
      style: {
        color: colors.char
      }
    },
    {
      types: ["function"],
      style: {
        color: colors.function
      }
    },
    {
      types: ["operator", "entity", "url", "variable"],
      style: {
        color: colors.variable
      }
    },
    {
      types: ["keyword"],
      style: {
        color: colors.keyword
      }
    },
    {
      types: ["atrule", "class-name"],
      style: {
        color: colors.className
      }
    },
    {
      types: ["important"],
      style: {
        fontWeight: "400"
      }
    },
    {
      types: ["bold"],
      style: {
        fontWeight: "bold"
      }
    },
    {
      types: ["italic"],
      style: {
        fontStyle: "italic"
      }
    },
    {
      types: ["namespace"],
      style: {
        opacity: 0.7
      }
    }
  ]
};
var oceanicNext_default = theme7;

// src/themes/okaidia.ts
var theme8 = {
  plain: {
    color: "#f8f8f2",
    backgroundColor: "#272822"
  },
  styles: [
    {
      types: ["changed"],
      style: {
        color: "rgb(162, 191, 252)",
        fontStyle: "italic"
      }
    },
    {
      types: ["deleted"],
      style: {
        color: "#f92672",
        fontStyle: "italic"
      }
    },
    {
      types: ["inserted"],
      style: {
        color: "rgb(173, 219, 103)",
        fontStyle: "italic"
      }
    },
    {
      types: ["comment"],
      style: {
        color: "#8292a2",
        fontStyle: "italic"
      }
    },
    {
      types: ["string", "url"],
      style: {
        color: "#a6e22e"
      }
    },
    {
      types: ["variable"],
      style: {
        color: "#f8f8f2"
      }
    },
    {
      types: ["number"],
      style: {
        color: "#ae81ff"
      }
    },
    {
      types: ["builtin", "char", "constant", "function", "class-name"],
      style: {
        color: "#e6db74"
      }
    },
    {
      types: ["punctuation"],
      style: {
        color: "#f8f8f2"
      }
    },
    {
      types: ["selector", "doctype"],
      style: {
        color: "#a6e22e",
        fontStyle: "italic"
      }
    },
    {
      types: ["tag", "operator", "keyword"],
      style: {
        color: "#66d9ef"
      }
    },
    {
      types: ["boolean"],
      style: {
        color: "#ae81ff"
      }
    },
    {
      types: ["namespace"],
      style: {
        color: "rgb(178, 204, 214)",
        opacity: 0.7
      }
    },
    {
      types: ["tag", "property"],
      style: {
        color: "#f92672"
      }
    },
    {
      types: ["attr-name"],
      style: {
        color: "#a6e22e !important"
      }
    },
    {
      types: ["doctype"],
      style: {
        color: "#8292a2"
      }
    },
    {
      types: ["rule"],
      style: {
        color: "#e6db74"
      }
    }
  ]
};
var okaidia_default = theme8;

// src/themes/palenight.ts
var theme9 = {
  plain: {
    color: "#bfc7d5",
    backgroundColor: "#292d3e"
  },
  styles: [
    {
      types: ["comment"],
      style: {
        color: "rgb(105, 112, 152)",
        fontStyle: "italic"
      }
    },
    {
      types: ["string", "inserted"],
      style: {
        color: "rgb(195, 232, 141)"
      }
    },
    {
      types: ["number"],
      style: {
        color: "rgb(247, 140, 108)"
      }
    },
    {
      types: ["builtin", "char", "constant", "function"],
      style: {
        color: "rgb(130, 170, 255)"
      }
    },
    {
      types: ["punctuation", "selector"],
      style: {
        color: "rgb(199, 146, 234)"
      }
    },
    {
      types: ["variable"],
      style: {
        color: "rgb(191, 199, 213)"
      }
    },
    {
      types: ["class-name", "attr-name"],
      style: {
        color: "rgb(255, 203, 107)"
      }
    },
    {
      types: ["tag", "deleted"],
      style: {
        color: "rgb(255, 85, 114)"
      }
    },
    {
      types: ["operator"],
      style: {
        color: "rgb(137, 221, 255)"
      }
    },
    {
      types: ["boolean"],
      style: {
        color: "rgb(255, 88, 116)"
      }
    },
    {
      types: ["keyword"],
      style: {
        fontStyle: "italic"
      }
    },
    {
      types: ["doctype"],
      style: {
        color: "rgb(199, 146, 234)",
        fontStyle: "italic"
      }
    },
    {
      types: ["namespace"],
      style: {
        color: "rgb(178, 204, 214)"
      }
    },
    {
      types: ["url"],
      style: {
        color: "rgb(221, 221, 221)"
      }
    }
  ]
};
var palenight_default = theme9;

// src/themes/shadesOfPurple.ts
var theme10 = {
  plain: {
    color: "#9EFEFF",
    backgroundColor: "#2D2A55"
  },
  styles: [
    {
      types: ["changed"],
      style: {
        color: "rgb(255, 238, 128)"
      }
    },
    {
      types: ["deleted"],
      style: {
        color: "rgba(239, 83, 80, 0.56)"
      }
    },
    {
      types: ["inserted"],
      style: {
        color: "rgb(173, 219, 103)"
      }
    },
    {
      types: ["comment"],
      style: {
        color: "rgb(179, 98, 255)",
        fontStyle: "italic"
      }
    },
    {
      types: ["punctuation"],
      style: {
        color: "rgb(255, 255, 255)"
      }
    },
    {
      types: ["constant"],
      style: {
        color: "rgb(255, 98, 140)"
      }
    },
    {
      types: ["string", "url"],
      style: {
        color: "rgb(165, 255, 144)"
      }
    },
    {
      types: ["variable"],
      style: {
        color: "rgb(255, 238, 128)"
      }
    },
    {
      types: ["number", "boolean"],
      style: {
        color: "rgb(255, 98, 140)"
      }
    },
    {
      types: ["attr-name"],
      style: {
        color: "rgb(255, 180, 84)"
      }
    },
    {
      types: [
        "keyword",
        "operator",
        "property",
        "namespace",
        "tag",
        "selector",
        "doctype"
      ],
      style: {
        color: "rgb(255, 157, 0)"
      }
    },
    {
      types: ["builtin", "char", "constant", "function", "class-name"],
      style: {
        color: "rgb(250, 208, 0)"
      }
    }
  ]
};
var shadesOfPurple_default = theme10;

// src/themes/synthwave84.ts
var theme11 = {
  plain: {
    backgroundColor: "linear-gradient(to bottom, #2a2139 75%, #34294f)",
    backgroundImage: "#34294f",
    color: "#f92aad",
    textShadow: "0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3"
  },
  styles: [
    {
      types: ["comment", "block-comment", "prolog", "doctype", "cdata"],
      style: {
        color: "#495495",
        fontStyle: "italic"
      }
    },
    {
      types: ["punctuation"],
      style: {
        color: "#ccc"
      }
    },
    {
      types: [
        "tag",
        "attr-name",
        "namespace",
        "number",
        "unit",
        "hexcode",
        "deleted"
      ],
      style: {
        color: "#e2777a"
      }
    },
    {
      types: ["property", "selector"],
      style: {
        color: "#72f1b8",
        textShadow: "0 0 2px #100c0f, 0 0 10px #257c5575, 0 0 35px #21272475"
      }
    },
    {
      types: ["function-name"],
      style: {
        color: "#6196cc"
      }
    },
    {
      types: ["boolean", "selector-id", "function"],
      style: {
        color: "#fdfdfd",
        textShadow: "0 0 2px #001716, 0 0 3px #03edf975, 0 0 5px #03edf975, 0 0 8px #03edf975"
      }
    },
    {
      types: ["class-name", "maybe-class-name", "builtin"],
      style: {
        color: "#fff5f6",
        textShadow: "0 0 2px #000, 0 0 10px #fc1f2c75, 0 0 5px #fc1f2c75, 0 0 25px #fc1f2c75"
      }
    },
    {
      types: ["constant", "symbol"],
      style: {
        color: "#f92aad",
        textShadow: "0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3"
      }
    },
    {
      types: ["important", "atrule", "keyword", "selector-class"],
      style: {
        color: "#f4eee4",
        textShadow: "0 0 2px #393a33, 0 0 8px #f39f0575, 0 0 2px #f39f0575"
      }
    },
    {
      types: ["string", "char", "attr-value", "regex", "variable"],
      style: {
        color: "#f87c32"
      }
    },
    {
      types: ["parameter"],
      style: {
        fontStyle: "italic"
      }
    },
    {
      types: ["entity", "url"],
      style: {
        color: "#67cdcc"
      }
    },
    {
      types: ["operator"],
      style: {
        color: "ffffffee"
      }
    },
    {
      types: ["important", "bold"],
      style: {
        fontWeight: "bold"
      }
    },
    {
      types: ["italic"],
      style: {
        fontStyle: "italic"
      }
    },
    {
      types: ["entity"],
      style: {
        cursor: "help"
      }
    },
    {
      types: ["inserted"],
      style: {
        color: "green"
      }
    }
  ]
};
var synthwave84_default = theme11;

// src/themes/ultramin.ts
var theme12 = {
  plain: {
    color: "#282a2e",
    backgroundColor: "#ffffff"
  },
  styles: [
    {
      types: ["comment"],
      style: {
        color: "rgb(197, 200, 198)"
      }
    },
    {
      types: ["string", "number", "builtin", "variable"],
      style: {
        color: "rgb(150, 152, 150)"
      }
    },
    {
      types: ["class-name", "function", "tag", "attr-name"],
      style: {
        color: "rgb(40, 42, 46)"
      }
    }
  ]
};
var ultramin_default = theme12;

// src/themes/vsDark.ts
var theme13 = {
  plain: {
    color: "#9CDCFE",
    backgroundColor: "#1E1E1E"
  },
  styles: [
    {
      types: ["prolog"],
      style: {
        color: "rgb(0, 0, 128)"
      }
    },
    {
      types: ["comment"],
      style: {
        color: "rgb(106, 153, 85)"
      }
    },
    {
      types: ["builtin", "changed", "keyword", "interpolation-punctuation"],
      style: {
        color: "rgb(86, 156, 214)"
      }
    },
    {
      types: ["number", "inserted"],
      style: {
        color: "rgb(181, 206, 168)"
      }
    },
    {
      types: ["constant"],
      style: {
        color: "rgb(100, 102, 149)"
      }
    },
    {
      types: ["attr-name", "variable"],
      style: {
        color: "rgb(156, 220, 254)"
      }
    },
    {
      types: ["deleted", "string", "attr-value", "template-punctuation"],
      style: {
        color: "rgb(206, 145, 120)"
      }
    },
    {
      types: ["selector"],
      style: {
        color: "rgb(215, 186, 125)"
      }
    },
    {
      // Fix tag color
      types: ["tag"],
      style: {
        color: "rgb(78, 201, 176)"
      }
    },
    {
      // Fix tag color for HTML
      types: ["tag"],
      languages: ["markup"],
      style: {
        color: "rgb(86, 156, 214)"
      }
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "rgb(212, 212, 212)"
      }
    },
    {
      // Fix punctuation color for HTML
      types: ["punctuation"],
      languages: ["markup"],
      style: {
        color: "#808080"
      }
    },
    {
      types: ["function"],
      style: {
        color: "rgb(220, 220, 170)"
      }
    },
    {
      types: ["class-name"],
      style: {
        color: "rgb(78, 201, 176)"
      }
    },
    {
      types: ["char"],
      style: {
        color: "rgb(209, 105, 105)"
      }
    }
  ]
};
var vsDark_default = theme13;

// src/themes/vsLight.ts
var theme14 = {
  plain: {
    color: "#000000",
    backgroundColor: "#ffffff"
  },
  styles: [
    {
      types: ["comment"],
      style: {
        color: "rgb(0, 128, 0)"
      }
    },
    {
      types: ["builtin"],
      style: {
        color: "rgb(0, 112, 193)"
      }
    },
    {
      types: ["number", "variable", "inserted"],
      style: {
        color: "rgb(9, 134, 88)"
      }
    },
    {
      types: ["operator"],
      style: {
        color: "rgb(0, 0, 0)"
      }
    },
    {
      types: ["constant", "char"],
      style: {
        color: "rgb(129, 31, 63)"
      }
    },
    {
      types: ["tag"],
      style: {
        color: "rgb(128, 0, 0)"
      }
    },
    {
      types: ["attr-name"],
      style: {
        color: "rgb(255, 0, 0)"
      }
    },
    {
      types: ["deleted", "string"],
      style: {
        color: "rgb(163, 21, 21)"
      }
    },
    {
      types: ["changed", "punctuation"],
      style: {
        color: "rgb(4, 81, 165)"
      }
    },
    {
      types: ["function", "keyword"],
      style: {
        color: "rgb(0, 0, 255)"
      }
    },
    {
      types: ["class-name"],
      style: {
        color: "rgb(38, 127, 153)"
      }
    }
  ]
};
var vsLight_default = theme14;

// src/themes/jettwaveDark.ts
var theme15 = {
  plain: {
    color: "#f8fafc",
    backgroundColor: "#011627"
  },
  styles: [
    {
      types: ["prolog"],
      style: {
        color: "#000080"
      }
    },
    {
      types: ["comment"],
      style: {
        color: "#6A9955"
      }
    },
    {
      types: ["builtin", "changed", "keyword", "interpolation-punctuation"],
      style: {
        color: "#569CD6"
      }
    },
    {
      types: ["number", "inserted"],
      style: {
        color: "#B5CEA8"
      }
    },
    {
      types: ["constant"],
      style: {
        color: "#f8fafc"
      }
    },
    {
      types: ["attr-name", "variable"],
      style: {
        color: "#9CDCFE"
      }
    },
    {
      types: ["deleted", "string", "attr-value", "template-punctuation"],
      style: {
        color: "#cbd5e1"
      }
    },
    {
      types: ["selector"],
      style: {
        color: "#D7BA7D"
      }
    },
    {
      types: ["tag"],
      style: {
        color: "#0ea5e9"
      }
    },
    {
      types: ["tag"],
      languages: ["markup"],
      style: {
        color: "#0ea5e9"
      }
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "#D4D4D4"
      }
    },
    {
      types: ["punctuation"],
      languages: ["markup"],
      style: {
        color: "#808080"
      }
    },
    {
      types: ["function"],
      style: {
        color: "#7dd3fc"
      }
    },
    {
      types: ["class-name"],
      style: {
        color: "#0ea5e9"
      }
    },
    {
      types: ["char"],
      style: {
        color: "#D16969"
      }
    }
  ]
};
var jettwaveDark_default = theme15;

// src/themes/jettwaveLight.ts
var theme16 = {
  plain: {
    color: "#0f172a",
    backgroundColor: "#f1f5f9"
  },
  styles: [
    {
      types: ["prolog"],
      style: {
        color: "#000080"
      }
    },
    {
      types: ["comment"],
      style: {
        color: "#6A9955"
      }
    },
    {
      types: ["builtin", "changed", "keyword", "interpolation-punctuation"],
      style: {
        color: "#0c4a6e"
      }
    },
    {
      types: ["number", "inserted"],
      style: {
        color: "#B5CEA8"
      }
    },
    {
      types: ["constant"],
      style: {
        color: "#0f172a"
      }
    },
    {
      types: ["attr-name", "variable"],
      style: {
        color: "#0c4a6e"
      }
    },
    {
      types: ["deleted", "string", "attr-value", "template-punctuation"],
      style: {
        color: "#64748b"
      }
    },
    {
      types: ["selector"],
      style: {
        color: "#D7BA7D"
      }
    },
    {
      types: ["tag"],
      style: {
        color: "#0ea5e9"
      }
    },
    {
      types: ["tag"],
      languages: ["markup"],
      style: {
        color: "#0ea5e9"
      }
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "#475569"
      }
    },
    {
      types: ["punctuation"],
      languages: ["markup"],
      style: {
        color: "#808080"
      }
    },
    {
      types: ["function"],
      style: {
        color: "#0e7490"
      }
    },
    {
      types: ["class-name"],
      style: {
        color: "#0ea5e9"
      }
    },
    {
      types: ["char"],
      style: {
        color: "#D16969"
      }
    }
  ]
};
var jettwaveLight_default = theme16;

// src/index.ts
var import_react5 = __webpack_require__(8038);

// src/components/useThemeDictionary.ts
var import_react = __webpack_require__(8038);

// src/utils/themeToDict.ts
var themeToDict = (theme17, language) => {
  const { plain } = theme17;
  const themeDict = theme17.styles.reduce((acc, themeEntry) => {
    const { languages: languages2, style } = themeEntry;
    if (languages2 && !languages2.includes(language)) {
      return acc;
    }
    themeEntry.types.forEach((type) => {
      const accStyle = __spreadValues(__spreadValues({}, acc[type]), style);
      acc[type] = accStyle;
    });
    return acc;
  }, {});
  themeDict.root = plain;
  themeDict.plain = __spreadProps(__spreadValues({}, plain), { backgroundColor: void 0 });
  return themeDict;
};
var themeToDict_default = themeToDict;

// src/components/useThemeDictionary.ts
var useThemeDictionary = (language, theme17) => {
  const [themeDictionary, setThemeDictionary] = (0, import_react.useState)(
    themeToDict_default(theme17, language)
  );
  const previousTheme = (0, import_react.useRef)();
  const previousLanguage = (0, import_react.useRef)();
  (0, import_react.useEffect)(() => {
    if (theme17 !== previousTheme.current || language !== previousLanguage.current) {
      previousTheme.current = theme17;
      previousLanguage.current = language;
      setThemeDictionary(themeToDict_default(theme17, language));
    }
  }, [language, theme17]);
  return themeDictionary;
};

// src/components/useGetLineProps.ts
var import_react2 = __webpack_require__(8038);
var import_clsx = __toESM(__webpack_require__(4889));
var useGetLineProps = (themeDictionary) => (0, import_react2.useCallback)(
  (_a) => {
    var _b = _a, { className, style, line } = _b, rest = __objRest(_b, ["className", "style", "line"]);
    const output = __spreadProps(__spreadValues({}, rest), {
      className: (0, import_clsx.default)("token-line", className)
    });
    if (typeof themeDictionary === "object" && "plain" in themeDictionary)
      output.style = themeDictionary.plain;
    if (typeof style === "object")
      output.style = __spreadValues(__spreadValues({}, output.style || {}), style);
    return output;
  },
  [themeDictionary]
);

// src/components/useGetTokenProps.ts
var import_react3 = __webpack_require__(8038);
var import_clsx2 = __toESM(__webpack_require__(4889));
var useGetTokenProps = (themeDictionary) => {
  const styleForToken = (0, import_react3.useCallback)(
    ({ types, empty }) => {
      if (themeDictionary == null)
        return void 0;
      else if (types.length === 1 && types[0] === "plain") {
        return empty != null ? { display: "inline-block" } : void 0;
      } else if (types.length === 1 && empty != null) {
        return themeDictionary[types[0]];
      }
      return Object.assign(
        empty != null ? { display: "inline-block" } : {},
        ...types.map((type) => themeDictionary[type])
      );
    },
    [themeDictionary]
  );
  return (0, import_react3.useCallback)(
    (_a) => {
      var _b = _a, { token, className, style } = _b, rest = __objRest(_b, ["token", "className", "style"]);
      const output = __spreadProps(__spreadValues({}, rest), {
        className: (0, import_clsx2.default)("token", ...token.types, className),
        children: token.content,
        style: styleForToken(token)
      });
      if (style != null) {
        output.style = __spreadValues(__spreadValues({}, output.style || {}), style);
      }
      return output;
    },
    [styleForToken]
  );
};

// src/utils/normalizeTokens.ts
var newlineRe = /\r\n|\r|\n/;
var normalizeEmptyLines = (line) => {
  if (line.length === 0) {
    line.push({
      types: ["plain"],
      content: "\n",
      empty: true
    });
  } else if (line.length === 1 && line[0].content === "") {
    line[0].content = "\n";
    line[0].empty = true;
  }
};
var appendTypes = (types, add) => {
  const typesSize = types.length;
  if (typesSize > 0 && types[typesSize - 1] === add) {
    return types;
  }
  return types.concat(add);
};
var normalizeTokens = (tokens) => {
  const typeArrStack = [[]];
  const tokenArrStack = [tokens];
  const tokenArrIndexStack = [0];
  const tokenArrSizeStack = [tokens.length];
  let i = 0;
  let stackIndex = 0;
  let currentLine = [];
  const acc = [currentLine];
  while (stackIndex > -1) {
    while ((i = tokenArrIndexStack[stackIndex]++) < tokenArrSizeStack[stackIndex]) {
      let content;
      let types = typeArrStack[stackIndex];
      const tokenArr = tokenArrStack[stackIndex];
      const token = tokenArr[i];
      if (typeof token === "string") {
        types = stackIndex > 0 ? types : ["plain"];
        content = token;
      } else {
        types = appendTypes(types, token.type);
        if (token.alias) {
          types = appendTypes(types, token.alias);
        }
        content = token.content;
      }
      if (typeof content !== "string") {
        stackIndex++;
        typeArrStack.push(types);
        tokenArrStack.push(content);
        tokenArrIndexStack.push(0);
        tokenArrSizeStack.push(content.length);
        continue;
      }
      const splitByNewlines = content.split(newlineRe);
      const newlineCount = splitByNewlines.length;
      currentLine.push({
        types,
        content: splitByNewlines[0]
      });
      for (let i2 = 1; i2 < newlineCount; i2++) {
        normalizeEmptyLines(currentLine);
        acc.push(currentLine = []);
        currentLine.push({
          types,
          content: splitByNewlines[i2]
        });
      }
    }
    stackIndex--;
    typeArrStack.pop();
    tokenArrStack.pop();
    tokenArrIndexStack.pop();
    tokenArrSizeStack.pop();
  }
  normalizeEmptyLines(currentLine);
  return acc;
};
var normalizeTokens_default = normalizeTokens;

// src/components/useTokenize.ts
var import_react4 = __webpack_require__(8038);
var useTokenize = ({ prism, code, grammar, language }) => {
  const prismRef = (0, import_react4.useRef)(prism);
  return (0, import_react4.useMemo)(() => {
    if (grammar == null)
      return normalizeTokens_default([code]);
    const prismConfig = {
      code,
      grammar,
      language,
      tokens: []
    };
    prismRef.current.hooks.run("before-tokenize", prismConfig);
    prismConfig.tokens = prismRef.current.tokenize(code, grammar);
    prismRef.current.hooks.run("after-tokenize", prismConfig);
    return normalizeTokens_default(prismConfig.tokens);
  }, [code, grammar, language]);
};

// src/components/highlight.ts
var Highlight = ({
  children,
  language: _language,
  code,
  theme: theme17,
  prism
}) => {
  const language = _language.toLowerCase();
  const themeDictionary = useThemeDictionary(language, theme17);
  const getLineProps = useGetLineProps(themeDictionary);
  const getTokenProps = useGetTokenProps(themeDictionary);
  const grammar = prism.languages[language];
  const tokens = useTokenize({ prism, language, code, grammar });
  return children({
    tokens,
    className: `prism-code language-${language}`,
    style: themeDictionary != null ? themeDictionary.root : {},
    getLineProps,
    getTokenProps
  });
};

// src/index.ts
var Highlight2 = (props) => (0, import_react5.createElement)(Highlight, __spreadProps(__spreadValues({}, props), {
  prism: props.prism || Prism,
  theme: props.theme || vsDark_default,
  code: props.code,
  language: props.language
}));
// Annotate the CommonJS export names for ESM import in node:
0 && (0);
/*! Bundled license information:

prismjs/prism.js:
  (**
   * Prism: Lightweight, robust, elegant syntax highlighting
   *
   * @license MIT <https://opensource.org/licenses/MIT>
   * @author Lea Verou <https://lea.verou.me>
   * @namespace
   * @public
   *)
*/
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 4086:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Editor: () => Editor_default,
  LiveContext: () => LiveContext_default,
  LiveEditor: () => LiveEditor,
  LiveError: () => LiveError,
  LivePreview: () => LivePreview_default,
  LiveProvider: () => LiveProvider_default,
  generateElement: () => generateElement,
  renderElementAsync: () => renderElementAsync,
  withLive: () => withLive
});
module.exports = __toCommonJS(src_exports);

// src/components/Editor/index.tsx
var import_prism_react_renderer = __webpack_require__(1102);
var import_react = __webpack_require__(8038);
var import_use_editable = __webpack_require__(3334);
var import_jsx_runtime = __webpack_require__(6786);
var CodeEditor = (props) => {
  const editorRef = (0, import_react.useRef)(null);
  const [code, setCode] = (0, import_react.useState)(props.code || "");
  const { theme } = props;
  (0, import_react.useEffect)(() => {
    setCode(props.code);
  }, [props.code]);
  (0, import_use_editable.useEditable)(editorRef, (text) => setCode(text.slice(0, -1)), {
    disabled: props.disabled,
    indentation: props.tabMode === "indentation" ? 2 : void 0
  });
  (0, import_react.useEffect)(() => {
    if (props.onChange) {
      props.onChange(code);
    }
  }, [code]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: props.className, style: props.style, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_prism_react_renderer.Highlight,
    {
      code,
      theme: props.theme || import_prism_react_renderer.themes.nightOwl,
      language: props.language,
      children: ({
        className: _className,
        tokens,
        getLineProps,
        getTokenProps,
        style: _style
      }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "pre",
        {
          className: _className,
          style: __spreadValues(__spreadValues({
            margin: 0,
            outline: "none",
            padding: 10,
            fontFamily: "inherit"
          }, theme && typeof theme.plain === "object" ? theme.plain : {}), _style),
          ref: editorRef,
          spellCheck: "false",
          children: tokens.map((line, lineIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", __spreadProps(__spreadValues({}, getLineProps({ line })), { children: [
            line.filter((token) => !token.empty).map((token, tokenIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "span",
              __spreadValues({}, getTokenProps({ token })),
              `token-${tokenIndex}`
            )),
            "\n"
          ] }), `line-${lineIndex}`))
        }
      )
    }
  ) });
};
CodeEditor.defaultProps = {
  tabMode: "indentation"
};
var Editor_default = CodeEditor;

// src/components/Live/LiveProvider.tsx
var import_react5 = __webpack_require__(8038);

// src/components/Live/LiveContext.ts
var import_react2 = __webpack_require__(8038);
var LiveContext = (0, import_react2.createContext)({});
var LiveContext_default = LiveContext;

// src/utils/transpile/index.ts
var import_react4 = __toESM(__webpack_require__(8038));

// src/utils/transpile/transform.ts
var import_sucrase = __webpack_require__(8997);
var defaultTransforms = ["jsx", "imports"];
function transform(opts = {}) {
  const transforms = Array.isArray(opts.transforms) ? opts.transforms.filter(Boolean) : defaultTransforms;
  return (code) => (0, import_sucrase.transform)(code, { transforms }).code;
}

// src/utils/transpile/errorBoundary.tsx
var import_react3 = __toESM(__webpack_require__(8038));
var import_jsx_runtime2 = __webpack_require__(6786);
var errorBoundary = (Element, errorCallback) => {
  return class ErrorBoundary extends import_react3.Component {
    componentDidCatch(error) {
      errorCallback(error);
    }
    render() {
      return typeof Element === "function" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Element, {}) : import_react3.default.isValidElement(Element) ? Element : null;
    }
  };
};
var errorBoundary_default = errorBoundary;

// src/utils/transpile/evalCode.ts
var evalCode = (code, scope) => {
  const scopeKeys = Object.keys(scope);
  const scopeValues = scopeKeys.map((key) => scope[key]);
  return new Function(...scopeKeys, code)(...scopeValues);
};
var evalCode_default = evalCode;

// src/utils/transpile/compose.ts
function compose(...functions) {
  return functions.reduce(
    (acc, currentFn) => (...args) => acc(currentFn(...args))
  );
}

// src/utils/transpile/index.ts
var jsxConst = 'const _jsxFileName = "";';
var trimCode = (code) => code.trim().replace(/;$/, "");
var spliceJsxConst = (code) => code.replace(jsxConst, "").trim();
var addJsxConst = (code) => jsxConst + code;
var wrapReturn = (code) => `return (${code})`;
var generateElement = ({ code = "", scope = {}, enableTypeScript = true }, errorCallback) => {
  const firstPassTransforms = ["jsx"];
  enableTypeScript && firstPassTransforms.push("typescript");
  const transformed = compose(
    addJsxConst,
    transform({ transforms: ["imports"] }),
    wrapReturn,
    spliceJsxConst,
    trimCode,
    transform({ transforms: firstPassTransforms }),
    trimCode
  )(code);
  return errorBoundary_default(
    evalCode_default(transformed, __spreadValues({ React: import_react4.default }, scope)),
    errorCallback
  );
};
var renderElementAsync = ({ code = "", scope = {}, enableTypeScript = true }, resultCallback, errorCallback) => {
  const render = (element) => {
    if (typeof element === "undefined") {
      errorCallback(new SyntaxError("`render` must be called with valid JSX."));
    } else {
      resultCallback(errorBoundary_default(element, errorCallback));
    }
  };
  if (!/render\s*\(/.test(code)) {
    return errorCallback(
      new SyntaxError("No-Inline evaluations must call `render`.")
    );
  }
  const transforms = ["jsx", "imports"];
  enableTypeScript && transforms.splice(1, 0, "typescript");
  evalCode_default(transform({ transforms })(code), __spreadProps(__spreadValues({ React: import_react4.default }, scope), { render }));
};

// src/components/Live/LiveProvider.tsx
var import_jsx_runtime3 = __webpack_require__(6786);
function LiveProvider({
  children,
  code = "",
  language = "tsx",
  theme,
  enableTypeScript = true,
  disabled = false,
  scope,
  transformCode,
  noInline = false
}) {
  const [state, setState] = (0, import_react5.useState)({
    error: void 0,
    element: void 0
  });
  function transpileAsync(newCode) {
    return __async(this, null, function* () {
      const errorCallback = (error) => {
        setState({ error: error.toString(), element: void 0 });
      };
      try {
        const transformResult = transformCode ? transformCode(newCode) : newCode;
        try {
          const transformedCode = yield Promise.resolve(transformResult);
          const renderElement = (element) => setState({ error: void 0, element });
          if (typeof transformedCode !== "string") {
            throw new Error("Code failed to transform");
          }
          const input = {
            code: transformedCode,
            scope,
            enableTypeScript
          };
          if (noInline) {
            setState({ error: void 0, element: null });
            renderElementAsync(input, renderElement, errorCallback);
          } else {
            renderElement(generateElement(input, errorCallback));
          }
        } catch (error) {
          return errorCallback(error);
        }
      } catch (e) {
        errorCallback(e);
        return Promise.resolve();
      }
    });
  }
  const onError = (error) => setState({ error: error.toString() });
  (0, import_react5.useEffect)(() => {
    transpileAsync(code).catch(onError);
  }, [code, scope, noInline, transformCode]);
  const onChange = (newCode) => {
    transpileAsync(newCode).catch(onError);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    LiveContext_default.Provider,
    {
      value: __spreadProps(__spreadValues({}, state), {
        code,
        language,
        theme,
        disabled,
        onError,
        onChange
      }),
      children
    }
  );
}
var LiveProvider_default = LiveProvider;

// src/components/Live/LiveEditor.tsx
var import_react6 = __webpack_require__(8038);
var import_jsx_runtime4 = __webpack_require__(6786);
function LiveEditor(props) {
  const { code, language, theme, disabled, onChange } = (0, import_react6.useContext)(LiveContext_default);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    Editor_default,
    __spreadValues({
      theme,
      code,
      language,
      disabled,
      onChange
    }, props)
  );
}

// src/components/Live/LiveError.tsx
var import_react7 = __webpack_require__(8038);
var import_jsx_runtime5 = __webpack_require__(6786);
function LiveError(props) {
  const { error } = (0, import_react7.useContext)(LiveContext_default);
  return error ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("pre", __spreadProps(__spreadValues({}, props), { children: error })) : null;
}

// src/components/Live/LivePreview.tsx
var import_react8 = __webpack_require__(8038);
var import_jsx_runtime6 = __webpack_require__(6786);
function LivePreview(_a) {
  var _b = _a, { Component: Component2 = "div" } = _b, rest = __objRest(_b, ["Component"]);
  const { element: Element } = (0, import_react8.useContext)(LiveContext_default);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Component2, __spreadProps(__spreadValues({}, rest), { children: Element ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Element, {}) : null }));
}
var LivePreview_default = LivePreview;

// src/hoc/withLive.tsx
var import_jsx_runtime7 = __webpack_require__(6786);
function withLive(WrappedComponent) {
  const WithLive = (props) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(LiveContext_default.Consumer, { children: (live) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(WrappedComponent, __spreadValues({ live }, props)) });
  WithLive.displayName = "WithLive";
  return WithLive;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (0);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 7494:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var _tokenizer = __webpack_require__(2297);
var _keywords = __webpack_require__(3464);
var _types = __webpack_require__(798);

var _getImportExportSpecifierInfo = __webpack_require__(8052); var _getImportExportSpecifierInfo2 = _interopRequireDefault(_getImportExportSpecifierInfo);
var _getNonTypeIdentifiers = __webpack_require__(1281);
















/**
 * Class responsible for preprocessing and bookkeeping import and export declarations within the
 * file.
 *
 * TypeScript uses a simpler mechanism that does not use functions like interopRequireDefault and
 * interopRequireWildcard, so we also allow that mode for compatibility.
 */
 class CJSImportProcessor {
   __init() {this.nonTypeIdentifiers = new Set()}
   __init2() {this.importInfoByPath = new Map()}
   __init3() {this.importsToReplace = new Map()}
   __init4() {this.identifierReplacements = new Map()}
   __init5() {this.exportBindingsByLocalName = new Map()}

  constructor(
     nameManager,
     tokens,
     enableLegacyTypeScriptModuleInterop,
     options,
     isTypeScriptTransformEnabled,
     helperManager,
  ) {;this.nameManager = nameManager;this.tokens = tokens;this.enableLegacyTypeScriptModuleInterop = enableLegacyTypeScriptModuleInterop;this.options = options;this.isTypeScriptTransformEnabled = isTypeScriptTransformEnabled;this.helperManager = helperManager;CJSImportProcessor.prototype.__init.call(this);CJSImportProcessor.prototype.__init2.call(this);CJSImportProcessor.prototype.__init3.call(this);CJSImportProcessor.prototype.__init4.call(this);CJSImportProcessor.prototype.__init5.call(this);}

  preprocessTokens() {
    for (let i = 0; i < this.tokens.tokens.length; i++) {
      if (
        this.tokens.matches1AtIndex(i, _types.TokenType._import) &&
        !this.tokens.matches3AtIndex(i, _types.TokenType._import, _types.TokenType.name, _types.TokenType.eq)
      ) {
        this.preprocessImportAtIndex(i);
      }
      if (
        this.tokens.matches1AtIndex(i, _types.TokenType._export) &&
        !this.tokens.matches2AtIndex(i, _types.TokenType._export, _types.TokenType.eq)
      ) {
        this.preprocessExportAtIndex(i);
      }
    }
    this.generateImportReplacements();
  }

  /**
   * In TypeScript, import statements that only import types should be removed. This does not count
   * bare imports.
   */
  pruneTypeOnlyImports() {
    this.nonTypeIdentifiers = _getNonTypeIdentifiers.getNonTypeIdentifiers.call(void 0, this.tokens, this.options);
    for (const [path, importInfo] of this.importInfoByPath.entries()) {
      if (
        importInfo.hasBareImport ||
        importInfo.hasStarExport ||
        importInfo.exportStarNames.length > 0 ||
        importInfo.namedExports.length > 0
      ) {
        continue;
      }
      const names = [
        ...importInfo.defaultNames,
        ...importInfo.wildcardNames,
        ...importInfo.namedImports.map(({localName}) => localName),
      ];
      if (names.every((name) => this.isTypeName(name))) {
        this.importsToReplace.set(path, "");
      }
    }
  }

  isTypeName(name) {
    return this.isTypeScriptTransformEnabled && !this.nonTypeIdentifiers.has(name);
  }

   generateImportReplacements() {
    for (const [path, importInfo] of this.importInfoByPath.entries()) {
      const {
        defaultNames,
        wildcardNames,
        namedImports,
        namedExports,
        exportStarNames,
        hasStarExport,
      } = importInfo;

      if (
        defaultNames.length === 0 &&
        wildcardNames.length === 0 &&
        namedImports.length === 0 &&
        namedExports.length === 0 &&
        exportStarNames.length === 0 &&
        !hasStarExport
      ) {
        // Import is never used, so don't even assign a name.
        this.importsToReplace.set(path, `require('${path}');`);
        continue;
      }

      const primaryImportName = this.getFreeIdentifierForPath(path);
      let secondaryImportName;
      if (this.enableLegacyTypeScriptModuleInterop) {
        secondaryImportName = primaryImportName;
      } else {
        secondaryImportName =
          wildcardNames.length > 0 ? wildcardNames[0] : this.getFreeIdentifierForPath(path);
      }
      let requireCode = `var ${primaryImportName} = require('${path}');`;
      if (wildcardNames.length > 0) {
        for (const wildcardName of wildcardNames) {
          const moduleExpr = this.enableLegacyTypeScriptModuleInterop
            ? primaryImportName
            : `${this.helperManager.getHelperName("interopRequireWildcard")}(${primaryImportName})`;
          requireCode += ` var ${wildcardName} = ${moduleExpr};`;
        }
      } else if (exportStarNames.length > 0 && secondaryImportName !== primaryImportName) {
        requireCode += ` var ${secondaryImportName} = ${this.helperManager.getHelperName(
          "interopRequireWildcard",
        )}(${primaryImportName});`;
      } else if (defaultNames.length > 0 && secondaryImportName !== primaryImportName) {
        requireCode += ` var ${secondaryImportName} = ${this.helperManager.getHelperName(
          "interopRequireDefault",
        )}(${primaryImportName});`;
      }

      for (const {importedName, localName} of namedExports) {
        requireCode += ` ${this.helperManager.getHelperName(
          "createNamedExportFrom",
        )}(${primaryImportName}, '${localName}', '${importedName}');`;
      }
      for (const exportStarName of exportStarNames) {
        requireCode += ` exports.${exportStarName} = ${secondaryImportName};`;
      }
      if (hasStarExport) {
        requireCode += ` ${this.helperManager.getHelperName(
          "createStarExport",
        )}(${primaryImportName});`;
      }

      this.importsToReplace.set(path, requireCode);

      for (const defaultName of defaultNames) {
        this.identifierReplacements.set(defaultName, `${secondaryImportName}.default`);
      }
      for (const {importedName, localName} of namedImports) {
        this.identifierReplacements.set(localName, `${primaryImportName}.${importedName}`);
      }
    }
  }

  getFreeIdentifierForPath(path) {
    const components = path.split("/");
    const lastComponent = components[components.length - 1];
    const baseName = lastComponent.replace(/\W/g, "");
    return this.nameManager.claimFreeName(`_${baseName}`);
  }

   preprocessImportAtIndex(index) {
    const defaultNames = [];
    const wildcardNames = [];
    const namedImports = [];

    index++;
    if (
      (this.tokens.matchesContextualAtIndex(index, _keywords.ContextualKeyword._type) ||
        this.tokens.matches1AtIndex(index, _types.TokenType._typeof)) &&
      !this.tokens.matches1AtIndex(index + 1, _types.TokenType.comma) &&
      !this.tokens.matchesContextualAtIndex(index + 1, _keywords.ContextualKeyword._from)
    ) {
      // import type declaration, so no need to process anything.
      return;
    }

    if (this.tokens.matches1AtIndex(index, _types.TokenType.parenL)) {
      // Dynamic import, so nothing to do
      return;
    }

    if (this.tokens.matches1AtIndex(index, _types.TokenType.name)) {
      defaultNames.push(this.tokens.identifierNameAtIndex(index));
      index++;
      if (this.tokens.matches1AtIndex(index, _types.TokenType.comma)) {
        index++;
      }
    }

    if (this.tokens.matches1AtIndex(index, _types.TokenType.star)) {
      // * as
      index += 2;
      wildcardNames.push(this.tokens.identifierNameAtIndex(index));
      index++;
    }

    if (this.tokens.matches1AtIndex(index, _types.TokenType.braceL)) {
      const result = this.getNamedImports(index + 1);
      index = result.newIndex;

      for (const namedImport of result.namedImports) {
        // Treat {default as X} as a default import to ensure usage of require interop helper
        if (namedImport.importedName === "default") {
          defaultNames.push(namedImport.localName);
        } else {
          namedImports.push(namedImport);
        }
      }
    }

    if (this.tokens.matchesContextualAtIndex(index, _keywords.ContextualKeyword._from)) {
      index++;
    }

    if (!this.tokens.matches1AtIndex(index, _types.TokenType.string)) {
      throw new Error("Expected string token at the end of import statement.");
    }
    const path = this.tokens.stringValueAtIndex(index);
    const importInfo = this.getImportInfo(path);
    importInfo.defaultNames.push(...defaultNames);
    importInfo.wildcardNames.push(...wildcardNames);
    importInfo.namedImports.push(...namedImports);
    if (defaultNames.length === 0 && wildcardNames.length === 0 && namedImports.length === 0) {
      importInfo.hasBareImport = true;
    }
  }

   preprocessExportAtIndex(index) {
    if (
      this.tokens.matches2AtIndex(index, _types.TokenType._export, _types.TokenType._var) ||
      this.tokens.matches2AtIndex(index, _types.TokenType._export, _types.TokenType._let) ||
      this.tokens.matches2AtIndex(index, _types.TokenType._export, _types.TokenType._const)
    ) {
      this.preprocessVarExportAtIndex(index);
    } else if (
      this.tokens.matches2AtIndex(index, _types.TokenType._export, _types.TokenType._function) ||
      this.tokens.matches2AtIndex(index, _types.TokenType._export, _types.TokenType._class)
    ) {
      const exportName = this.tokens.identifierNameAtIndex(index + 2);
      this.addExportBinding(exportName, exportName);
    } else if (this.tokens.matches3AtIndex(index, _types.TokenType._export, _types.TokenType.name, _types.TokenType._function)) {
      const exportName = this.tokens.identifierNameAtIndex(index + 3);
      this.addExportBinding(exportName, exportName);
    } else if (this.tokens.matches2AtIndex(index, _types.TokenType._export, _types.TokenType.braceL)) {
      this.preprocessNamedExportAtIndex(index);
    } else if (this.tokens.matches2AtIndex(index, _types.TokenType._export, _types.TokenType.star)) {
      this.preprocessExportStarAtIndex(index);
    }
  }

   preprocessVarExportAtIndex(index) {
    let depth = 0;
    // Handle cases like `export let {x} = y;`, starting at the open-brace in that case.
    for (let i = index + 2; ; i++) {
      if (
        this.tokens.matches1AtIndex(i, _types.TokenType.braceL) ||
        this.tokens.matches1AtIndex(i, _types.TokenType.dollarBraceL) ||
        this.tokens.matches1AtIndex(i, _types.TokenType.bracketL)
      ) {
        depth++;
      } else if (
        this.tokens.matches1AtIndex(i, _types.TokenType.braceR) ||
        this.tokens.matches1AtIndex(i, _types.TokenType.bracketR)
      ) {
        depth--;
      } else if (depth === 0 && !this.tokens.matches1AtIndex(i, _types.TokenType.name)) {
        break;
      } else if (this.tokens.matches1AtIndex(1, _types.TokenType.eq)) {
        const endIndex = this.tokens.currentToken().rhsEndIndex;
        if (endIndex == null) {
          throw new Error("Expected = token with an end index.");
        }
        i = endIndex - 1;
      } else {
        const token = this.tokens.tokens[i];
        if (_tokenizer.isDeclaration.call(void 0, token)) {
          const exportName = this.tokens.identifierNameAtIndex(i);
          this.identifierReplacements.set(exportName, `exports.${exportName}`);
        }
      }
    }
  }

  /**
   * Walk this export statement just in case it's an export...from statement.
   * If it is, combine it into the import info for that path. Otherwise, just
   * bail out; it'll be handled later.
   */
   preprocessNamedExportAtIndex(index) {
    // export {
    index += 2;
    const {newIndex, namedImports} = this.getNamedImports(index);
    index = newIndex;

    if (this.tokens.matchesContextualAtIndex(index, _keywords.ContextualKeyword._from)) {
      index++;
    } else {
      // Reinterpret "a as b" to be local/exported rather than imported/local.
      for (const {importedName: localName, localName: exportedName} of namedImports) {
        this.addExportBinding(localName, exportedName);
      }
      return;
    }

    if (!this.tokens.matches1AtIndex(index, _types.TokenType.string)) {
      throw new Error("Expected string token at the end of import statement.");
    }
    const path = this.tokens.stringValueAtIndex(index);
    const importInfo = this.getImportInfo(path);
    importInfo.namedExports.push(...namedImports);
  }

   preprocessExportStarAtIndex(index) {
    let exportedName = null;
    if (this.tokens.matches3AtIndex(index, _types.TokenType._export, _types.TokenType.star, _types.TokenType._as)) {
      // export * as
      index += 3;
      exportedName = this.tokens.identifierNameAtIndex(index);
      // foo from
      index += 2;
    } else {
      // export * from
      index += 3;
    }
    if (!this.tokens.matches1AtIndex(index, _types.TokenType.string)) {
      throw new Error("Expected string token at the end of star export statement.");
    }
    const path = this.tokens.stringValueAtIndex(index);
    const importInfo = this.getImportInfo(path);
    if (exportedName !== null) {
      importInfo.exportStarNames.push(exportedName);
    } else {
      importInfo.hasStarExport = true;
    }
  }

   getNamedImports(index) {
    const namedImports = [];
    while (true) {
      if (this.tokens.matches1AtIndex(index, _types.TokenType.braceR)) {
        index++;
        break;
      }

      const specifierInfo = _getImportExportSpecifierInfo2.default.call(void 0, this.tokens, index);
      index = specifierInfo.endIndex;
      if (!specifierInfo.isType) {
        namedImports.push({
          importedName: specifierInfo.leftName,
          localName: specifierInfo.rightName,
        });
      }

      if (this.tokens.matches2AtIndex(index, _types.TokenType.comma, _types.TokenType.braceR)) {
        index += 2;
        break;
      } else if (this.tokens.matches1AtIndex(index, _types.TokenType.braceR)) {
        index++;
        break;
      } else if (this.tokens.matches1AtIndex(index, _types.TokenType.comma)) {
        index++;
      } else {
        throw new Error(`Unexpected token: ${JSON.stringify(this.tokens.tokens[index])}`);
      }
    }
    return {newIndex: index, namedImports};
  }

  /**
   * Get a mutable import info object for this path, creating one if it doesn't
   * exist yet.
   */
   getImportInfo(path) {
    const existingInfo = this.importInfoByPath.get(path);
    if (existingInfo) {
      return existingInfo;
    }
    const newInfo = {
      defaultNames: [],
      wildcardNames: [],
      namedImports: [],
      namedExports: [],
      hasBareImport: false,
      exportStarNames: [],
      hasStarExport: false,
    };
    this.importInfoByPath.set(path, newInfo);
    return newInfo;
  }

   addExportBinding(localName, exportedName) {
    if (!this.exportBindingsByLocalName.has(localName)) {
      this.exportBindingsByLocalName.set(localName, []);
    }
    this.exportBindingsByLocalName.get(localName).push(exportedName);
  }

  /**
   * Return the code to use for the import for this path, or the empty string if
   * the code has already been "claimed" by a previous import.
   */
  claimImportCode(importPath) {
    const result = this.importsToReplace.get(importPath);
    this.importsToReplace.set(importPath, "");
    return result || "";
  }

  getIdentifierReplacement(identifierName) {
    return this.identifierReplacements.get(identifierName) || null;
  }

  /**
   * Return a string like `exports.foo = exports.bar`.
   */
  resolveExportBinding(assignedName) {
    const exportedNames = this.exportBindingsByLocalName.get(assignedName);
    if (!exportedNames || exportedNames.length === 0) {
      return null;
    }
    return exportedNames.map((exportedName) => `exports.${exportedName}`).join(" = ");
  }

  /**
   * Return all imported/exported names where we might be interested in whether usages of those
   * names are shadowed.
   */
  getGlobalNames() {
    return new Set([
      ...this.identifierReplacements.keys(),
      ...this.exportBindingsByLocalName.keys(),
    ]);
  }
} exports["default"] = CJSImportProcessor;


/***/ }),

/***/ 3903:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));

const HELPERS = {
  require: `
    import {createRequire as CREATE_REQUIRE_NAME} from "module";
    const require = CREATE_REQUIRE_NAME(import.meta.url);
  `,
  interopRequireWildcard: `
    function interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              newObj[key] = obj[key];
            }
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
  `,
  interopRequireDefault: `
    function interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
  `,
  createNamedExportFrom: `
    function createNamedExportFrom(obj, localName, importedName) {
      Object.defineProperty(exports, localName, {enumerable: true, configurable: true, get: () => obj[importedName]});
    }
  `,
  // Note that TypeScript and Babel do this differently; TypeScript does a simple existence
  // check in the exports object and does a plain assignment, whereas Babel uses
  // defineProperty and builds an object of explicitly-exported names so that star exports can
  // always take lower precedence. For now, we do the easier TypeScript thing.
  createStarExport: `
    function createStarExport(obj) {
      Object.keys(obj)
        .filter((key) => key !== "default" && key !== "__esModule")
        .forEach((key) => {
          if (exports.hasOwnProperty(key)) {
            return;
          }
          Object.defineProperty(exports, key, {enumerable: true, configurable: true, get: () => obj[key]});
        });
    }
  `,
  nullishCoalesce: `
    function nullishCoalesce(lhs, rhsFn) {
      if (lhs != null) {
        return lhs;
      } else {
        return rhsFn();
      }
    }
  `,
  asyncNullishCoalesce: `
    async function asyncNullishCoalesce(lhs, rhsFn) {
      if (lhs != null) {
        return lhs;
      } else {
        return await rhsFn();
      }
    }
  `,
  optionalChain: `
    function optionalChain(ops) {
      let lastAccessLHS = undefined;
      let value = ops[0];
      let i = 1;
      while (i < ops.length) {
        const op = ops[i];
        const fn = ops[i + 1];
        i += 2;
        if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) {
          return undefined;
        }
        if (op === 'access' || op === 'optionalAccess') {
          lastAccessLHS = value;
          value = fn(value);
        } else if (op === 'call' || op === 'optionalCall') {
          value = fn((...args) => value.call(lastAccessLHS, ...args));
          lastAccessLHS = undefined;
        }
      }
      return value;
    }
  `,
  asyncOptionalChain: `
    async function asyncOptionalChain(ops) {
      let lastAccessLHS = undefined;
      let value = ops[0];
      let i = 1;
      while (i < ops.length) {
        const op = ops[i];
        const fn = ops[i + 1];
        i += 2;
        if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) {
          return undefined;
        }
        if (op === 'access' || op === 'optionalAccess') {
          lastAccessLHS = value;
          value = await fn(value);
        } else if (op === 'call' || op === 'optionalCall') {
          value = await fn((...args) => value.call(lastAccessLHS, ...args));
          lastAccessLHS = undefined;
        }
      }
      return value;
    }
  `,
  optionalChainDelete: `
    function optionalChainDelete(ops) {
      const result = OPTIONAL_CHAIN_NAME(ops);
      return result == null ? true : result;
    }
  `,
  asyncOptionalChainDelete: `
    async function asyncOptionalChainDelete(ops) {
      const result = await ASYNC_OPTIONAL_CHAIN_NAME(ops);
      return result == null ? true : result;
    }
  `,
};

 class HelperManager {
  __init() {this.helperNames = {}}
  __init2() {this.createRequireName = null}
  constructor( nameManager) {;this.nameManager = nameManager;HelperManager.prototype.__init.call(this);HelperManager.prototype.__init2.call(this);}

  getHelperName(baseName) {
    let helperName = this.helperNames[baseName];
    if (helperName) {
      return helperName;
    }
    helperName = this.nameManager.claimFreeName(`_${baseName}`);
    this.helperNames[baseName] = helperName;
    return helperName;
  }

  emitHelpers() {
    let resultCode = "";
    if (this.helperNames.optionalChainDelete) {
      this.getHelperName("optionalChain");
    }
    if (this.helperNames.asyncOptionalChainDelete) {
      this.getHelperName("asyncOptionalChain");
    }
    for (const [baseName, helperCodeTemplate] of Object.entries(HELPERS)) {
      const helperName = this.helperNames[baseName];
      let helperCode = helperCodeTemplate;
      if (baseName === "optionalChainDelete") {
        helperCode = helperCode.replace("OPTIONAL_CHAIN_NAME", this.helperNames.optionalChain);
      } else if (baseName === "asyncOptionalChainDelete") {
        helperCode = helperCode.replace(
          "ASYNC_OPTIONAL_CHAIN_NAME",
          this.helperNames.asyncOptionalChain,
        );
      } else if (baseName === "require") {
        if (this.createRequireName === null) {
          this.createRequireName = this.nameManager.claimFreeName("_createRequire");
        }
        helperCode = helperCode.replace(/CREATE_REQUIRE_NAME/g, this.createRequireName);
      }
      if (helperName) {
        resultCode += " ";
        resultCode += helperCode.replace(baseName, helperName).replace(/\s+/g, " ").trim();
      }
    }
    return resultCode;
  }
} exports.HelperManager = HelperManager;


/***/ }),

/***/ 1662:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _getIdentifierNames = __webpack_require__(4307); var _getIdentifierNames2 = _interopRequireDefault(_getIdentifierNames);

 class NameManager {
    __init() {this.usedNames = new Set()}

  constructor(code, tokens) {;NameManager.prototype.__init.call(this);
    this.usedNames = new Set(_getIdentifierNames2.default.call(void 0, code, tokens));
  }

  claimFreeName(name) {
    const newName = this.findFreeName(name);
    this.usedNames.add(newName);
    return newName;
  }

  findFreeName(name) {
    if (!this.usedNames.has(name)) {
      return name;
    }
    let suffixNum = 2;
    while (this.usedNames.has(name + String(suffixNum))) {
      suffixNum++;
    }
    return name + String(suffixNum);
  }
} exports["default"] = NameManager;


/***/ }),

/***/ 1978:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } }/**
 * This module was automatically generated by `ts-interface-builder`
 */
var _tsinterfacechecker = __webpack_require__(3281); var t = _interopRequireWildcard(_tsinterfacechecker);
// tslint:disable:object-literal-key-quotes

 const Transform = t.union(
  t.lit("jsx"),
  t.lit("typescript"),
  t.lit("flow"),
  t.lit("imports"),
  t.lit("react-hot-loader"),
  t.lit("jest"),
); exports.Transform = Transform;

 const SourceMapOptions = t.iface([], {
  compiledFilename: "string",
}); exports.SourceMapOptions = SourceMapOptions;

 const Options = t.iface([], {
  transforms: t.array("Transform"),
  disableESTransforms: t.opt("boolean"),
  jsxRuntime: t.opt(t.union(t.lit("classic"), t.lit("automatic"), t.lit("preserve"))),
  production: t.opt("boolean"),
  jsxImportSource: t.opt("string"),
  jsxPragma: t.opt("string"),
  jsxFragmentPragma: t.opt("string"),
  preserveDynamicImport: t.opt("boolean"),
  injectCreateRequireForImportRequire: t.opt("boolean"),
  enableLegacyTypeScriptModuleInterop: t.opt("boolean"),
  enableLegacyBabel5ModuleInterop: t.opt("boolean"),
  sourceMapOptions: t.opt("SourceMapOptions"),
  filePath: t.opt("string"),
}); exports.Options = Options;

const exportedTypeSuite = {
  Transform: exports.Transform,
  SourceMapOptions: exports.SourceMapOptions,
  Options: exports.Options,
};
exports["default"] = exportedTypeSuite;


/***/ }),

/***/ 7006:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _tsinterfacechecker = __webpack_require__(3281);

var _Optionsgentypes = __webpack_require__(1978); var _Optionsgentypes2 = _interopRequireDefault(_Optionsgentypes);

const {Options: OptionsChecker} = _tsinterfacechecker.createCheckers.call(void 0, _Optionsgentypes2.default);























































































 function validateOptions(options) {
  OptionsChecker.strictCheck(options);
} exports.validateOptions = validateOptions;


/***/ }),

/***/ 3824:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var _types = __webpack_require__(798);
var _isAsyncOperation = __webpack_require__(874); var _isAsyncOperation2 = _interopRequireDefault(_isAsyncOperation);











 class TokenProcessor {
   __init() {this.resultCode = ""}
  // Array mapping input token index to optional string index position in the
  // output code.
   __init2() {this.resultMappings = new Array(this.tokens.length)}
   __init3() {this.tokenIndex = 0}

  constructor(
     code,
     tokens,
     isFlowEnabled,
     disableESTransforms,
     helperManager,
  ) {;this.code = code;this.tokens = tokens;this.isFlowEnabled = isFlowEnabled;this.disableESTransforms = disableESTransforms;this.helperManager = helperManager;TokenProcessor.prototype.__init.call(this);TokenProcessor.prototype.__init2.call(this);TokenProcessor.prototype.__init3.call(this);}

  /**
   * Snapshot the token state in a way that can be restored later, useful for
   * things like lookahead.
   *
   * resultMappings do not need to be copied since in all use cases, they will
   * be overwritten anyway after restore.
   */
  snapshot() {
    return {
      resultCode: this.resultCode,
      tokenIndex: this.tokenIndex,
    };
  }

  restoreToSnapshot(snapshot) {
    this.resultCode = snapshot.resultCode;
    this.tokenIndex = snapshot.tokenIndex;
  }

  /**
   * Remove and return the code generated since the snapshot, leaving the
   * current token position in-place. Unlike most TokenProcessor operations,
   * this operation can result in input/output line number mismatches because
   * the removed code may contain newlines, so this operation should be used
   * sparingly.
   */
  dangerouslyGetAndRemoveCodeSinceSnapshot(snapshot) {
    const result = this.resultCode.slice(snapshot.resultCode.length);
    this.resultCode = snapshot.resultCode;
    return result;
  }

  reset() {
    this.resultCode = "";
    this.resultMappings = new Array(this.tokens.length);
    this.tokenIndex = 0;
  }

  matchesContextualAtIndex(index, contextualKeyword) {
    return (
      this.matches1AtIndex(index, _types.TokenType.name) &&
      this.tokens[index].contextualKeyword === contextualKeyword
    );
  }

  identifierNameAtIndex(index) {
    // TODO: We need to process escapes since technically you can have unicode escapes in variable
    // names.
    return this.identifierNameForToken(this.tokens[index]);
  }

  identifierNameAtRelativeIndex(relativeIndex) {
    return this.identifierNameForToken(this.tokenAtRelativeIndex(relativeIndex));
  }

  identifierName() {
    return this.identifierNameForToken(this.currentToken());
  }

  identifierNameForToken(token) {
    return this.code.slice(token.start, token.end);
  }

  rawCodeForToken(token) {
    return this.code.slice(token.start, token.end);
  }

  stringValueAtIndex(index) {
    return this.stringValueForToken(this.tokens[index]);
  }

  stringValue() {
    return this.stringValueForToken(this.currentToken());
  }

  stringValueForToken(token) {
    // This is used to identify when two imports are the same and to resolve TypeScript enum keys.
    // Ideally we'd process escapes within the strings, but for now we pretty much take the raw
    // code.
    return this.code.slice(token.start + 1, token.end - 1);
  }

  matches1AtIndex(index, t1) {
    return this.tokens[index].type === t1;
  }

  matches2AtIndex(index, t1, t2) {
    return this.tokens[index].type === t1 && this.tokens[index + 1].type === t2;
  }

  matches3AtIndex(index, t1, t2, t3) {
    return (
      this.tokens[index].type === t1 &&
      this.tokens[index + 1].type === t2 &&
      this.tokens[index + 2].type === t3
    );
  }

  matches1(t1) {
    return this.tokens[this.tokenIndex].type === t1;
  }

  matches2(t1, t2) {
    return this.tokens[this.tokenIndex].type === t1 && this.tokens[this.tokenIndex + 1].type === t2;
  }

  matches3(t1, t2, t3) {
    return (
      this.tokens[this.tokenIndex].type === t1 &&
      this.tokens[this.tokenIndex + 1].type === t2 &&
      this.tokens[this.tokenIndex + 2].type === t3
    );
  }

  matches4(t1, t2, t3, t4) {
    return (
      this.tokens[this.tokenIndex].type === t1 &&
      this.tokens[this.tokenIndex + 1].type === t2 &&
      this.tokens[this.tokenIndex + 2].type === t3 &&
      this.tokens[this.tokenIndex + 3].type === t4
    );
  }

  matches5(t1, t2, t3, t4, t5) {
    return (
      this.tokens[this.tokenIndex].type === t1 &&
      this.tokens[this.tokenIndex + 1].type === t2 &&
      this.tokens[this.tokenIndex + 2].type === t3 &&
      this.tokens[this.tokenIndex + 3].type === t4 &&
      this.tokens[this.tokenIndex + 4].type === t5
    );
  }

  matchesContextual(contextualKeyword) {
    return this.matchesContextualAtIndex(this.tokenIndex, contextualKeyword);
  }

  matchesContextIdAndLabel(type, contextId) {
    return this.matches1(type) && this.currentToken().contextId === contextId;
  }

  previousWhitespaceAndComments() {
    let whitespaceAndComments = this.code.slice(
      this.tokenIndex > 0 ? this.tokens[this.tokenIndex - 1].end : 0,
      this.tokenIndex < this.tokens.length ? this.tokens[this.tokenIndex].start : this.code.length,
    );
    if (this.isFlowEnabled) {
      whitespaceAndComments = whitespaceAndComments.replace(/@flow/g, "");
    }
    return whitespaceAndComments;
  }

  replaceToken(newCode) {
    this.resultCode += this.previousWhitespaceAndComments();
    this.appendTokenPrefix();
    this.resultMappings[this.tokenIndex] = this.resultCode.length;
    this.resultCode += newCode;
    this.appendTokenSuffix();
    this.tokenIndex++;
  }

  replaceTokenTrimmingLeftWhitespace(newCode) {
    this.resultCode += this.previousWhitespaceAndComments().replace(/[^\r\n]/g, "");
    this.appendTokenPrefix();
    this.resultMappings[this.tokenIndex] = this.resultCode.length;
    this.resultCode += newCode;
    this.appendTokenSuffix();
    this.tokenIndex++;
  }

  removeInitialToken() {
    this.replaceToken("");
  }

  removeToken() {
    this.replaceTokenTrimmingLeftWhitespace("");
  }

  /**
   * Remove all code until the next }, accounting for balanced braces.
   */
  removeBalancedCode() {
    let braceDepth = 0;
    while (!this.isAtEnd()) {
      if (this.matches1(_types.TokenType.braceL)) {
        braceDepth++;
      } else if (this.matches1(_types.TokenType.braceR)) {
        if (braceDepth === 0) {
          return;
        }
        braceDepth--;
      }
      this.removeToken();
    }
  }

  copyExpectedToken(tokenType) {
    if (this.tokens[this.tokenIndex].type !== tokenType) {
      throw new Error(`Expected token ${tokenType}`);
    }
    this.copyToken();
  }

  copyToken() {
    this.resultCode += this.previousWhitespaceAndComments();
    this.appendTokenPrefix();
    this.resultMappings[this.tokenIndex] = this.resultCode.length;
    this.resultCode += this.code.slice(
      this.tokens[this.tokenIndex].start,
      this.tokens[this.tokenIndex].end,
    );
    this.appendTokenSuffix();
    this.tokenIndex++;
  }

  copyTokenWithPrefix(prefix) {
    this.resultCode += this.previousWhitespaceAndComments();
    this.appendTokenPrefix();
    this.resultCode += prefix;
    this.resultMappings[this.tokenIndex] = this.resultCode.length;
    this.resultCode += this.code.slice(
      this.tokens[this.tokenIndex].start,
      this.tokens[this.tokenIndex].end,
    );
    this.appendTokenSuffix();
    this.tokenIndex++;
  }

   appendTokenPrefix() {
    const token = this.currentToken();
    if (token.numNullishCoalesceStarts || token.isOptionalChainStart) {
      token.isAsyncOperation = _isAsyncOperation2.default.call(void 0, this);
    }
    if (this.disableESTransforms) {
      return;
    }
    if (token.numNullishCoalesceStarts) {
      for (let i = 0; i < token.numNullishCoalesceStarts; i++) {
        if (token.isAsyncOperation) {
          this.resultCode += "await ";
          this.resultCode += this.helperManager.getHelperName("asyncNullishCoalesce");
        } else {
          this.resultCode += this.helperManager.getHelperName("nullishCoalesce");
        }
        this.resultCode += "(";
      }
    }
    if (token.isOptionalChainStart) {
      if (token.isAsyncOperation) {
        this.resultCode += "await ";
      }
      if (this.tokenIndex > 0 && this.tokenAtRelativeIndex(-1).type === _types.TokenType._delete) {
        if (token.isAsyncOperation) {
          this.resultCode += this.helperManager.getHelperName("asyncOptionalChainDelete");
        } else {
          this.resultCode += this.helperManager.getHelperName("optionalChainDelete");
        }
      } else if (token.isAsyncOperation) {
        this.resultCode += this.helperManager.getHelperName("asyncOptionalChain");
      } else {
        this.resultCode += this.helperManager.getHelperName("optionalChain");
      }
      this.resultCode += "([";
    }
  }

   appendTokenSuffix() {
    const token = this.currentToken();
    if (token.isOptionalChainEnd && !this.disableESTransforms) {
      this.resultCode += "])";
    }
    if (token.numNullishCoalesceEnds && !this.disableESTransforms) {
      for (let i = 0; i < token.numNullishCoalesceEnds; i++) {
        this.resultCode += "))";
      }
    }
  }

  appendCode(code) {
    this.resultCode += code;
  }

  currentToken() {
    return this.tokens[this.tokenIndex];
  }

  currentTokenCode() {
    const token = this.currentToken();
    return this.code.slice(token.start, token.end);
  }

  tokenAtRelativeIndex(relativeIndex) {
    return this.tokens[this.tokenIndex + relativeIndex];
  }

  currentIndex() {
    return this.tokenIndex;
  }

  /**
   * Move to the next token. Only suitable in preprocessing steps. When
   * generating new code, you should use copyToken or removeToken.
   */
  nextToken() {
    if (this.tokenIndex === this.tokens.length) {
      throw new Error("Unexpectedly reached end of input.");
    }
    this.tokenIndex++;
  }

  previousToken() {
    this.tokenIndex--;
  }

  finish() {
    if (this.tokenIndex !== this.tokens.length) {
      throw new Error("Tried to finish processing tokens before reaching the end.");
    }
    this.resultCode += this.previousWhitespaceAndComments();
    return {code: this.resultCode, mappings: this.resultMappings};
  }

  isAtEnd() {
    return this.tokenIndex === this.tokens.length;
  }
} exports["default"] = TokenProcessor;


/***/ }),

/***/ 2027:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _genmapping = __webpack_require__(7140);



var _charcodes = __webpack_require__(1537);












/**
 * Generate a source map indicating that each line maps directly to the original line,
 * with the tokens in their new positions.
 */
 function computeSourceMap(
  {code: generatedCode, mappings: rawMappings},
  filePath,
  options,
  source,
  tokens,
) {
  const sourceColumns = computeSourceColumns(source, tokens);
  const map = new (0, _genmapping.GenMapping)({file: options.compiledFilename});
  let tokenIndex = 0;
  // currentMapping is the output source index for the current input token being
  // considered.
  let currentMapping = rawMappings[0];
  while (currentMapping === undefined && tokenIndex < rawMappings.length - 1) {
    tokenIndex++;
    currentMapping = rawMappings[tokenIndex];
  }
  let line = 0;
  let lineStart = 0;
  if (currentMapping !== lineStart) {
    _genmapping.maybeAddSegment.call(void 0, map, line, 0, filePath, line, 0);
  }
  for (let i = 0; i < generatedCode.length; i++) {
    if (i === currentMapping) {
      const genColumn = currentMapping - lineStart;
      const sourceColumn = sourceColumns[tokenIndex];
      _genmapping.maybeAddSegment.call(void 0, map, line, genColumn, filePath, line, sourceColumn);
      while (
        (currentMapping === i || currentMapping === undefined) &&
        tokenIndex < rawMappings.length - 1
      ) {
        tokenIndex++;
        currentMapping = rawMappings[tokenIndex];
      }
    }
    if (generatedCode.charCodeAt(i) === _charcodes.charCodes.lineFeed) {
      line++;
      lineStart = i + 1;
      if (currentMapping !== lineStart) {
        _genmapping.maybeAddSegment.call(void 0, map, line, 0, filePath, line, 0);
      }
    }
  }
  const {sourceRoot, sourcesContent, ...sourceMap} = _genmapping.toEncodedMap.call(void 0, map);
  return sourceMap ;
} exports["default"] = computeSourceMap;

/**
 * Create an array mapping each token index to the 0-based column of the start
 * position of the token.
 */
function computeSourceColumns(code, tokens) {
  const sourceColumns = new Array(tokens.length);
  let tokenIndex = 0;
  let currentMapping = tokens[tokenIndex].start;
  let lineStart = 0;
  for (let i = 0; i < code.length; i++) {
    if (i === currentMapping) {
      sourceColumns[tokenIndex] = currentMapping - lineStart;
      tokenIndex++;
      currentMapping = tokens[tokenIndex].start;
    }
    if (code.charCodeAt(i) === _charcodes.charCodes.lineFeed) {
      lineStart = i + 1;
    }
  }
  return sourceColumns;
}


/***/ }),

/***/ 1458:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));



var _tokenizer = __webpack_require__(2297);

var _types = __webpack_require__(798);


/**
 * Traverse the given tokens and modify them if necessary to indicate that some names shadow global
 * variables.
 */
 function identifyShadowedGlobals(
  tokens,
  scopes,
  globalNames,
) {
  if (!hasShadowedGlobals(tokens, globalNames)) {
    return;
  }
  markShadowedGlobals(tokens, scopes, globalNames);
} exports["default"] = identifyShadowedGlobals;

/**
 * We can do a fast up-front check to see if there are any declarations to global names. If not,
 * then there's no point in computing scope assignments.
 */
// Exported for testing.
 function hasShadowedGlobals(tokens, globalNames) {
  for (const token of tokens.tokens) {
    if (
      token.type === _types.TokenType.name &&
      _tokenizer.isNonTopLevelDeclaration.call(void 0, token) &&
      globalNames.has(tokens.identifierNameForToken(token))
    ) {
      return true;
    }
  }
  return false;
} exports.hasShadowedGlobals = hasShadowedGlobals;

function markShadowedGlobals(
  tokens,
  scopes,
  globalNames,
) {
  const scopeStack = [];
  let scopeIndex = scopes.length - 1;
  // Scopes were generated at completion time, so they're sorted by end index, so we can maintain a
  // good stack by going backwards through them.
  for (let i = tokens.tokens.length - 1; ; i--) {
    while (scopeStack.length > 0 && scopeStack[scopeStack.length - 1].startTokenIndex === i + 1) {
      scopeStack.pop();
    }
    while (scopeIndex >= 0 && scopes[scopeIndex].endTokenIndex === i + 1) {
      scopeStack.push(scopes[scopeIndex]);
      scopeIndex--;
    }
    // Process scopes after the last iteration so we can make sure we pop all of them.
    if (i < 0) {
      break;
    }

    const token = tokens.tokens[i];
    const name = tokens.identifierNameForToken(token);
    if (scopeStack.length > 1 && token.type === _types.TokenType.name && globalNames.has(name)) {
      if (_tokenizer.isBlockScopedDeclaration.call(void 0, token)) {
        markShadowedForScope(scopeStack[scopeStack.length - 1], tokens, name);
      } else if (_tokenizer.isFunctionScopedDeclaration.call(void 0, token)) {
        let stackIndex = scopeStack.length - 1;
        while (stackIndex > 0 && !scopeStack[stackIndex].isFunctionScope) {
          stackIndex--;
        }
        if (stackIndex < 0) {
          throw new Error("Did not find parent function scope.");
        }
        markShadowedForScope(scopeStack[stackIndex], tokens, name);
      }
    }
  }
  if (scopeStack.length > 0) {
    throw new Error("Expected empty scope stack after processing file.");
  }
}

function markShadowedForScope(scope, tokens, name) {
  for (let i = scope.startTokenIndex; i < scope.endTokenIndex; i++) {
    const token = tokens.tokens[i];
    if (
      (token.type === _types.TokenType.name || token.type === _types.TokenType.jsxName) &&
      tokens.identifierNameForToken(token) === name
    ) {
      token.shadowsGlobal = true;
    }
  }
}


/***/ }),

/***/ 8997:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _CJSImportProcessor = __webpack_require__(7494); var _CJSImportProcessor2 = _interopRequireDefault(_CJSImportProcessor);
var _computeSourceMap = __webpack_require__(2027); var _computeSourceMap2 = _interopRequireDefault(_computeSourceMap);
var _HelperManager = __webpack_require__(3903);
var _identifyShadowedGlobals = __webpack_require__(1458); var _identifyShadowedGlobals2 = _interopRequireDefault(_identifyShadowedGlobals);
var _NameManager = __webpack_require__(1662); var _NameManager2 = _interopRequireDefault(_NameManager);
var _Options = __webpack_require__(7006);
var _parser = __webpack_require__(1539);

var _TokenProcessor = __webpack_require__(3824); var _TokenProcessor2 = _interopRequireDefault(_TokenProcessor);
var _RootTransformer = __webpack_require__(3438); var _RootTransformer2 = _interopRequireDefault(_RootTransformer);
var _formatTokens = __webpack_require__(1126); var _formatTokens2 = _interopRequireDefault(_formatTokens);
var _getTSImportedNames = __webpack_require__(6265); var _getTSImportedNames2 = _interopRequireDefault(_getTSImportedNames);



















 function getVersion() {
  /* istanbul ignore next */
  return "3.32.0";
} exports.getVersion = getVersion;

 function transform(code, options) {
  _Options.validateOptions.call(void 0, options);
  try {
    const sucraseContext = getSucraseContext(code, options);
    const transformer = new (0, _RootTransformer2.default)(
      sucraseContext,
      options.transforms,
      Boolean(options.enableLegacyBabel5ModuleInterop),
      options,
    );
    const transformerResult = transformer.transform();
    let result = {code: transformerResult.code};
    if (options.sourceMapOptions) {
      if (!options.filePath) {
        throw new Error("filePath must be specified when generating a source map.");
      }
      result = {
        ...result,
        sourceMap: _computeSourceMap2.default.call(void 0, 
          transformerResult,
          options.filePath,
          options.sourceMapOptions,
          code,
          sucraseContext.tokenProcessor.tokens,
        ),
      };
    }
    return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e) {
    if (options.filePath) {
      e.message = `Error transforming ${options.filePath}: ${e.message}`;
    }
    throw e;
  }
} exports.transform = transform;

/**
 * Return a string representation of the sucrase tokens, mostly useful for
 * diagnostic purposes.
 */
 function getFormattedTokens(code, options) {
  const tokens = getSucraseContext(code, options).tokenProcessor.tokens;
  return _formatTokens2.default.call(void 0, code, tokens);
} exports.getFormattedTokens = getFormattedTokens;

/**
 * Call into the parser/tokenizer and do some further preprocessing:
 * - Come up with a set of used names so that we can assign new names.
 * - Preprocess all import/export statements so we know which globals we are interested in.
 * - Compute situations where any of those globals are shadowed.
 *
 * In the future, some of these preprocessing steps can be skipped based on what actual work is
 * being done.
 */
function getSucraseContext(code, options) {
  const isJSXEnabled = options.transforms.includes("jsx");
  const isTypeScriptEnabled = options.transforms.includes("typescript");
  const isFlowEnabled = options.transforms.includes("flow");
  const disableESTransforms = options.disableESTransforms === true;
  const file = _parser.parse.call(void 0, code, isJSXEnabled, isTypeScriptEnabled, isFlowEnabled);
  const tokens = file.tokens;
  const scopes = file.scopes;

  const nameManager = new (0, _NameManager2.default)(code, tokens);
  const helperManager = new (0, _HelperManager.HelperManager)(nameManager);
  const tokenProcessor = new (0, _TokenProcessor2.default)(
    code,
    tokens,
    isFlowEnabled,
    disableESTransforms,
    helperManager,
  );
  const enableLegacyTypeScriptModuleInterop = Boolean(options.enableLegacyTypeScriptModuleInterop);

  let importProcessor = null;
  if (options.transforms.includes("imports")) {
    importProcessor = new (0, _CJSImportProcessor2.default)(
      nameManager,
      tokenProcessor,
      enableLegacyTypeScriptModuleInterop,
      options,
      options.transforms.includes("typescript"),
      helperManager,
    );
    importProcessor.preprocessTokens();
    // We need to mark shadowed globals after processing imports so we know that the globals are,
    // but before type-only import pruning, since that relies on shadowing information.
    _identifyShadowedGlobals2.default.call(void 0, tokenProcessor, scopes, importProcessor.getGlobalNames());
    if (options.transforms.includes("typescript")) {
      importProcessor.pruneTypeOnlyImports();
    }
  } else if (options.transforms.includes("typescript")) {
    _identifyShadowedGlobals2.default.call(void 0, tokenProcessor, scopes, _getTSImportedNames2.default.call(void 0, tokenProcessor));
  }
  return {tokenProcessor, scopes, nameManager, importProcessor, helperManager};
}


/***/ }),

/***/ 1539:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));

var _base = __webpack_require__(8022);
var _index = __webpack_require__(4893);

 class File {
  
  

  constructor(tokens, scopes) {
    this.tokens = tokens;
    this.scopes = scopes;
  }
} exports.File = File;

 function parse(
  input,
  isJSXEnabled,
  isTypeScriptEnabled,
  isFlowEnabled,
) {
  if (isFlowEnabled && isTypeScriptEnabled) {
    throw new Error("Cannot combine flow and typescript plugins.");
  }
  _base.initParser.call(void 0, input, isJSXEnabled, isTypeScriptEnabled, isFlowEnabled);
  const result = _index.parseFile.call(void 0, );
  if (_base.state.error) {
    throw _base.augmentError.call(void 0, _base.state.error);
  }
  return result;
} exports.parse = parse;


/***/ }),

/***/ 5741:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));/* eslint max-len: 0 */










var _index = __webpack_require__(2297);
var _keywords = __webpack_require__(3464);
var _types = __webpack_require__(798);
var _base = __webpack_require__(8022);













var _expression = __webpack_require__(745);








var _statement = __webpack_require__(1765);









var _util = __webpack_require__(8958);

function isMaybeDefaultImport(lookahead) {
  return (
    (lookahead.type === _types.TokenType.name || !!(lookahead.type & _types.TokenType.IS_KEYWORD)) &&
    lookahead.contextualKeyword !== _keywords.ContextualKeyword._from
  );
}

function flowParseTypeInitialiser(tok) {
  const oldIsType = _index.pushTypeContext.call(void 0, 0);
  _util.expect.call(void 0, tok || _types.TokenType.colon);
  flowParseType();
  _index.popTypeContext.call(void 0, oldIsType);
}

function flowParsePredicate() {
  _util.expect.call(void 0, _types.TokenType.modulo);
  _util.expectContextual.call(void 0, _keywords.ContextualKeyword._checks);
  if (_index.eat.call(void 0, _types.TokenType.parenL)) {
    _expression.parseExpression.call(void 0, );
    _util.expect.call(void 0, _types.TokenType.parenR);
  }
}

function flowParseTypeAndPredicateInitialiser() {
  const oldIsType = _index.pushTypeContext.call(void 0, 0);
  _util.expect.call(void 0, _types.TokenType.colon);
  if (_index.match.call(void 0, _types.TokenType.modulo)) {
    flowParsePredicate();
  } else {
    flowParseType();
    if (_index.match.call(void 0, _types.TokenType.modulo)) {
      flowParsePredicate();
    }
  }
  _index.popTypeContext.call(void 0, oldIsType);
}

function flowParseDeclareClass() {
  _index.next.call(void 0, );
  flowParseInterfaceish(/* isClass */ true);
}

function flowParseDeclareFunction() {
  _index.next.call(void 0, );
  _expression.parseIdentifier.call(void 0, );

  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    flowParseTypeParameterDeclaration();
  }

  _util.expect.call(void 0, _types.TokenType.parenL);
  flowParseFunctionTypeParams();
  _util.expect.call(void 0, _types.TokenType.parenR);

  flowParseTypeAndPredicateInitialiser();

  _util.semicolon.call(void 0, );
}

function flowParseDeclare() {
  if (_index.match.call(void 0, _types.TokenType._class)) {
    flowParseDeclareClass();
  } else if (_index.match.call(void 0, _types.TokenType._function)) {
    flowParseDeclareFunction();
  } else if (_index.match.call(void 0, _types.TokenType._var)) {
    flowParseDeclareVariable();
  } else if (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._module)) {
    if (_index.eat.call(void 0, _types.TokenType.dot)) {
      flowParseDeclareModuleExports();
    } else {
      flowParseDeclareModule();
    }
  } else if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._type)) {
    flowParseDeclareTypeAlias();
  } else if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._opaque)) {
    flowParseDeclareOpaqueType();
  } else if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._interface)) {
    flowParseDeclareInterface();
  } else if (_index.match.call(void 0, _types.TokenType._export)) {
    flowParseDeclareExportDeclaration();
  } else {
    _util.unexpected.call(void 0, );
  }
}

function flowParseDeclareVariable() {
  _index.next.call(void 0, );
  flowParseTypeAnnotatableIdentifier();
  _util.semicolon.call(void 0, );
}

function flowParseDeclareModule() {
  if (_index.match.call(void 0, _types.TokenType.string)) {
    _expression.parseExprAtom.call(void 0, );
  } else {
    _expression.parseIdentifier.call(void 0, );
  }

  _util.expect.call(void 0, _types.TokenType.braceL);
  while (!_index.match.call(void 0, _types.TokenType.braceR) && !_base.state.error) {
    if (_index.match.call(void 0, _types.TokenType._import)) {
      _index.next.call(void 0, );
      _statement.parseImport.call(void 0, );
    } else {
      _util.unexpected.call(void 0, );
    }
  }
  _util.expect.call(void 0, _types.TokenType.braceR);
}

function flowParseDeclareExportDeclaration() {
  _util.expect.call(void 0, _types.TokenType._export);

  if (_index.eat.call(void 0, _types.TokenType._default)) {
    if (_index.match.call(void 0, _types.TokenType._function) || _index.match.call(void 0, _types.TokenType._class)) {
      // declare export default class ...
      // declare export default function ...
      flowParseDeclare();
    } else {
      // declare export default [type];
      flowParseType();
      _util.semicolon.call(void 0, );
    }
  } else if (
    _index.match.call(void 0, _types.TokenType._var) || // declare export var ...
    _index.match.call(void 0, _types.TokenType._function) || // declare export function ...
    _index.match.call(void 0, _types.TokenType._class) || // declare export class ...
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._opaque) // declare export opaque ..
  ) {
    flowParseDeclare();
  } else if (
    _index.match.call(void 0, _types.TokenType.star) || // declare export * from ''
    _index.match.call(void 0, _types.TokenType.braceL) || // declare export {} ...
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._interface) || // declare export interface ...
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._type) || // declare export type ...
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._opaque) // declare export opaque type ...
  ) {
    _statement.parseExport.call(void 0, );
  } else {
    _util.unexpected.call(void 0, );
  }
}

function flowParseDeclareModuleExports() {
  _util.expectContextual.call(void 0, _keywords.ContextualKeyword._exports);
  flowParseTypeAnnotation();
  _util.semicolon.call(void 0, );
}

function flowParseDeclareTypeAlias() {
  _index.next.call(void 0, );
  flowParseTypeAlias();
}

function flowParseDeclareOpaqueType() {
  _index.next.call(void 0, );
  flowParseOpaqueType(true);
}

function flowParseDeclareInterface() {
  _index.next.call(void 0, );
  flowParseInterfaceish();
}

// Interfaces

function flowParseInterfaceish(isClass = false) {
  flowParseRestrictedIdentifier();

  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    flowParseTypeParameterDeclaration();
  }

  if (_index.eat.call(void 0, _types.TokenType._extends)) {
    do {
      flowParseInterfaceExtends();
    } while (!isClass && _index.eat.call(void 0, _types.TokenType.comma));
  }

  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._mixins)) {
    _index.next.call(void 0, );
    do {
      flowParseInterfaceExtends();
    } while (_index.eat.call(void 0, _types.TokenType.comma));
  }

  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._implements)) {
    _index.next.call(void 0, );
    do {
      flowParseInterfaceExtends();
    } while (_index.eat.call(void 0, _types.TokenType.comma));
  }

  flowParseObjectType(isClass, false, isClass);
}

function flowParseInterfaceExtends() {
  flowParseQualifiedTypeIdentifier(false);
  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    flowParseTypeParameterInstantiation();
  }
}

function flowParseInterface() {
  flowParseInterfaceish();
}

function flowParseRestrictedIdentifier() {
  _expression.parseIdentifier.call(void 0, );
}

function flowParseTypeAlias() {
  flowParseRestrictedIdentifier();

  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    flowParseTypeParameterDeclaration();
  }

  flowParseTypeInitialiser(_types.TokenType.eq);
  _util.semicolon.call(void 0, );
}

function flowParseOpaqueType(declare) {
  _util.expectContextual.call(void 0, _keywords.ContextualKeyword._type);
  flowParseRestrictedIdentifier();

  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    flowParseTypeParameterDeclaration();
  }

  // Parse the supertype
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    flowParseTypeInitialiser(_types.TokenType.colon);
  }

  if (!declare) {
    flowParseTypeInitialiser(_types.TokenType.eq);
  }
  _util.semicolon.call(void 0, );
}

function flowParseTypeParameter() {
  flowParseVariance();
  flowParseTypeAnnotatableIdentifier();

  if (_index.eat.call(void 0, _types.TokenType.eq)) {
    flowParseType();
  }
}

 function flowParseTypeParameterDeclaration() {
  const oldIsType = _index.pushTypeContext.call(void 0, 0);
  // istanbul ignore else: this condition is already checked at all call sites
  if (_index.match.call(void 0, _types.TokenType.lessThan) || _index.match.call(void 0, _types.TokenType.typeParameterStart)) {
    _index.next.call(void 0, );
  } else {
    _util.unexpected.call(void 0, );
  }

  do {
    flowParseTypeParameter();
    if (!_index.match.call(void 0, _types.TokenType.greaterThan)) {
      _util.expect.call(void 0, _types.TokenType.comma);
    }
  } while (!_index.match.call(void 0, _types.TokenType.greaterThan) && !_base.state.error);
  _util.expect.call(void 0, _types.TokenType.greaterThan);
  _index.popTypeContext.call(void 0, oldIsType);
} exports.flowParseTypeParameterDeclaration = flowParseTypeParameterDeclaration;

function flowParseTypeParameterInstantiation() {
  const oldIsType = _index.pushTypeContext.call(void 0, 0);
  _util.expect.call(void 0, _types.TokenType.lessThan);
  while (!_index.match.call(void 0, _types.TokenType.greaterThan) && !_base.state.error) {
    flowParseType();
    if (!_index.match.call(void 0, _types.TokenType.greaterThan)) {
      _util.expect.call(void 0, _types.TokenType.comma);
    }
  }
  _util.expect.call(void 0, _types.TokenType.greaterThan);
  _index.popTypeContext.call(void 0, oldIsType);
}

function flowParseInterfaceType() {
  _util.expectContextual.call(void 0, _keywords.ContextualKeyword._interface);
  if (_index.eat.call(void 0, _types.TokenType._extends)) {
    do {
      flowParseInterfaceExtends();
    } while (_index.eat.call(void 0, _types.TokenType.comma));
  }
  flowParseObjectType(false, false, false);
}

function flowParseObjectPropertyKey() {
  if (_index.match.call(void 0, _types.TokenType.num) || _index.match.call(void 0, _types.TokenType.string)) {
    _expression.parseExprAtom.call(void 0, );
  } else {
    _expression.parseIdentifier.call(void 0, );
  }
}

function flowParseObjectTypeIndexer() {
  // Note: bracketL has already been consumed
  if (_index.lookaheadType.call(void 0, ) === _types.TokenType.colon) {
    flowParseObjectPropertyKey();
    flowParseTypeInitialiser();
  } else {
    flowParseType();
  }
  _util.expect.call(void 0, _types.TokenType.bracketR);
  flowParseTypeInitialiser();
}

function flowParseObjectTypeInternalSlot() {
  // Note: both bracketL have already been consumed
  flowParseObjectPropertyKey();
  _util.expect.call(void 0, _types.TokenType.bracketR);
  _util.expect.call(void 0, _types.TokenType.bracketR);
  if (_index.match.call(void 0, _types.TokenType.lessThan) || _index.match.call(void 0, _types.TokenType.parenL)) {
    flowParseObjectTypeMethodish();
  } else {
    _index.eat.call(void 0, _types.TokenType.question);
    flowParseTypeInitialiser();
  }
}

function flowParseObjectTypeMethodish() {
  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    flowParseTypeParameterDeclaration();
  }

  _util.expect.call(void 0, _types.TokenType.parenL);
  while (!_index.match.call(void 0, _types.TokenType.parenR) && !_index.match.call(void 0, _types.TokenType.ellipsis) && !_base.state.error) {
    flowParseFunctionTypeParam();
    if (!_index.match.call(void 0, _types.TokenType.parenR)) {
      _util.expect.call(void 0, _types.TokenType.comma);
    }
  }

  if (_index.eat.call(void 0, _types.TokenType.ellipsis)) {
    flowParseFunctionTypeParam();
  }
  _util.expect.call(void 0, _types.TokenType.parenR);
  flowParseTypeInitialiser();
}

function flowParseObjectTypeCallProperty() {
  flowParseObjectTypeMethodish();
}

function flowParseObjectType(allowStatic, allowExact, allowProto) {
  let endDelim;
  if (allowExact && _index.match.call(void 0, _types.TokenType.braceBarL)) {
    _util.expect.call(void 0, _types.TokenType.braceBarL);
    endDelim = _types.TokenType.braceBarR;
  } else {
    _util.expect.call(void 0, _types.TokenType.braceL);
    endDelim = _types.TokenType.braceR;
  }

  while (!_index.match.call(void 0, endDelim) && !_base.state.error) {
    if (allowProto && _util.isContextual.call(void 0, _keywords.ContextualKeyword._proto)) {
      const lookahead = _index.lookaheadType.call(void 0, );
      if (lookahead !== _types.TokenType.colon && lookahead !== _types.TokenType.question) {
        _index.next.call(void 0, );
        allowStatic = false;
      }
    }
    if (allowStatic && _util.isContextual.call(void 0, _keywords.ContextualKeyword._static)) {
      const lookahead = _index.lookaheadType.call(void 0, );
      if (lookahead !== _types.TokenType.colon && lookahead !== _types.TokenType.question) {
        _index.next.call(void 0, );
      }
    }

    flowParseVariance();

    if (_index.eat.call(void 0, _types.TokenType.bracketL)) {
      if (_index.eat.call(void 0, _types.TokenType.bracketL)) {
        flowParseObjectTypeInternalSlot();
      } else {
        flowParseObjectTypeIndexer();
      }
    } else if (_index.match.call(void 0, _types.TokenType.parenL) || _index.match.call(void 0, _types.TokenType.lessThan)) {
      flowParseObjectTypeCallProperty();
    } else {
      if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._get) || _util.isContextual.call(void 0, _keywords.ContextualKeyword._set)) {
        const lookahead = _index.lookaheadType.call(void 0, );
        if (lookahead === _types.TokenType.name || lookahead === _types.TokenType.string || lookahead === _types.TokenType.num) {
          _index.next.call(void 0, );
        }
      }

      flowParseObjectTypeProperty();
    }

    flowObjectTypeSemicolon();
  }

  _util.expect.call(void 0, endDelim);
}

function flowParseObjectTypeProperty() {
  if (_index.match.call(void 0, _types.TokenType.ellipsis)) {
    _util.expect.call(void 0, _types.TokenType.ellipsis);
    if (!_index.eat.call(void 0, _types.TokenType.comma)) {
      _index.eat.call(void 0, _types.TokenType.semi);
    }
    // Explicit inexact object syntax.
    if (_index.match.call(void 0, _types.TokenType.braceR)) {
      return;
    }
    flowParseType();
  } else {
    flowParseObjectPropertyKey();
    if (_index.match.call(void 0, _types.TokenType.lessThan) || _index.match.call(void 0, _types.TokenType.parenL)) {
      // This is a method property
      flowParseObjectTypeMethodish();
    } else {
      _index.eat.call(void 0, _types.TokenType.question);
      flowParseTypeInitialiser();
    }
  }
}

function flowObjectTypeSemicolon() {
  if (!_index.eat.call(void 0, _types.TokenType.semi) && !_index.eat.call(void 0, _types.TokenType.comma) && !_index.match.call(void 0, _types.TokenType.braceR) && !_index.match.call(void 0, _types.TokenType.braceBarR)) {
    _util.unexpected.call(void 0, );
  }
}

function flowParseQualifiedTypeIdentifier(initialIdAlreadyParsed) {
  if (!initialIdAlreadyParsed) {
    _expression.parseIdentifier.call(void 0, );
  }
  while (_index.eat.call(void 0, _types.TokenType.dot)) {
    _expression.parseIdentifier.call(void 0, );
  }
}

function flowParseGenericType() {
  flowParseQualifiedTypeIdentifier(true);
  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    flowParseTypeParameterInstantiation();
  }
}

function flowParseTypeofType() {
  _util.expect.call(void 0, _types.TokenType._typeof);
  flowParsePrimaryType();
}

function flowParseTupleType() {
  _util.expect.call(void 0, _types.TokenType.bracketL);
  // We allow trailing commas
  while (_base.state.pos < _base.input.length && !_index.match.call(void 0, _types.TokenType.bracketR)) {
    flowParseType();
    if (_index.match.call(void 0, _types.TokenType.bracketR)) {
      break;
    }
    _util.expect.call(void 0, _types.TokenType.comma);
  }
  _util.expect.call(void 0, _types.TokenType.bracketR);
}

function flowParseFunctionTypeParam() {
  const lookahead = _index.lookaheadType.call(void 0, );
  if (lookahead === _types.TokenType.colon || lookahead === _types.TokenType.question) {
    _expression.parseIdentifier.call(void 0, );
    _index.eat.call(void 0, _types.TokenType.question);
    flowParseTypeInitialiser();
  } else {
    flowParseType();
  }
}

function flowParseFunctionTypeParams() {
  while (!_index.match.call(void 0, _types.TokenType.parenR) && !_index.match.call(void 0, _types.TokenType.ellipsis) && !_base.state.error) {
    flowParseFunctionTypeParam();
    if (!_index.match.call(void 0, _types.TokenType.parenR)) {
      _util.expect.call(void 0, _types.TokenType.comma);
    }
  }
  if (_index.eat.call(void 0, _types.TokenType.ellipsis)) {
    flowParseFunctionTypeParam();
  }
}

// The parsing of types roughly parallels the parsing of expressions, and
// primary types are kind of like primary expressions...they're the
// primitives with which other types are constructed.
function flowParsePrimaryType() {
  let isGroupedType = false;
  const oldNoAnonFunctionType = _base.state.noAnonFunctionType;

  switch (_base.state.type) {
    case _types.TokenType.name: {
      if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._interface)) {
        flowParseInterfaceType();
        return;
      }
      _expression.parseIdentifier.call(void 0, );
      flowParseGenericType();
      return;
    }

    case _types.TokenType.braceL:
      flowParseObjectType(false, false, false);
      return;

    case _types.TokenType.braceBarL:
      flowParseObjectType(false, true, false);
      return;

    case _types.TokenType.bracketL:
      flowParseTupleType();
      return;

    case _types.TokenType.lessThan:
      flowParseTypeParameterDeclaration();
      _util.expect.call(void 0, _types.TokenType.parenL);
      flowParseFunctionTypeParams();
      _util.expect.call(void 0, _types.TokenType.parenR);
      _util.expect.call(void 0, _types.TokenType.arrow);
      flowParseType();
      return;

    case _types.TokenType.parenL:
      _index.next.call(void 0, );

      // Check to see if this is actually a grouped type
      if (!_index.match.call(void 0, _types.TokenType.parenR) && !_index.match.call(void 0, _types.TokenType.ellipsis)) {
        if (_index.match.call(void 0, _types.TokenType.name)) {
          const token = _index.lookaheadType.call(void 0, );
          isGroupedType = token !== _types.TokenType.question && token !== _types.TokenType.colon;
        } else {
          isGroupedType = true;
        }
      }

      if (isGroupedType) {
        _base.state.noAnonFunctionType = false;
        flowParseType();
        _base.state.noAnonFunctionType = oldNoAnonFunctionType;

        // A `,` or a `) =>` means this is an anonymous function type
        if (
          _base.state.noAnonFunctionType ||
          !(_index.match.call(void 0, _types.TokenType.comma) || (_index.match.call(void 0, _types.TokenType.parenR) && _index.lookaheadType.call(void 0, ) === _types.TokenType.arrow))
        ) {
          _util.expect.call(void 0, _types.TokenType.parenR);
          return;
        } else {
          // Eat a comma if there is one
          _index.eat.call(void 0, _types.TokenType.comma);
        }
      }

      flowParseFunctionTypeParams();

      _util.expect.call(void 0, _types.TokenType.parenR);
      _util.expect.call(void 0, _types.TokenType.arrow);
      flowParseType();
      return;

    case _types.TokenType.minus:
      _index.next.call(void 0, );
      _expression.parseLiteral.call(void 0, );
      return;

    case _types.TokenType.string:
    case _types.TokenType.num:
    case _types.TokenType._true:
    case _types.TokenType._false:
    case _types.TokenType._null:
    case _types.TokenType._this:
    case _types.TokenType._void:
    case _types.TokenType.star:
      _index.next.call(void 0, );
      return;

    default:
      if (_base.state.type === _types.TokenType._typeof) {
        flowParseTypeofType();
        return;
      } else if (_base.state.type & _types.TokenType.IS_KEYWORD) {
        _index.next.call(void 0, );
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType.name;
        return;
      }
  }

  _util.unexpected.call(void 0, );
}

function flowParsePostfixType() {
  flowParsePrimaryType();
  while (!_util.canInsertSemicolon.call(void 0, ) && (_index.match.call(void 0, _types.TokenType.bracketL) || _index.match.call(void 0, _types.TokenType.questionDot))) {
    _index.eat.call(void 0, _types.TokenType.questionDot);
    _util.expect.call(void 0, _types.TokenType.bracketL);
    if (_index.eat.call(void 0, _types.TokenType.bracketR)) {
      // Array type
    } else {
      // Indexed access type
      flowParseType();
      _util.expect.call(void 0, _types.TokenType.bracketR);
    }
  }
}

function flowParsePrefixType() {
  if (_index.eat.call(void 0, _types.TokenType.question)) {
    flowParsePrefixType();
  } else {
    flowParsePostfixType();
  }
}

function flowParseAnonFunctionWithoutParens() {
  flowParsePrefixType();
  if (!_base.state.noAnonFunctionType && _index.eat.call(void 0, _types.TokenType.arrow)) {
    flowParseType();
  }
}

function flowParseIntersectionType() {
  _index.eat.call(void 0, _types.TokenType.bitwiseAND);
  flowParseAnonFunctionWithoutParens();
  while (_index.eat.call(void 0, _types.TokenType.bitwiseAND)) {
    flowParseAnonFunctionWithoutParens();
  }
}

function flowParseUnionType() {
  _index.eat.call(void 0, _types.TokenType.bitwiseOR);
  flowParseIntersectionType();
  while (_index.eat.call(void 0, _types.TokenType.bitwiseOR)) {
    flowParseIntersectionType();
  }
}

function flowParseType() {
  flowParseUnionType();
}

 function flowParseTypeAnnotation() {
  flowParseTypeInitialiser();
} exports.flowParseTypeAnnotation = flowParseTypeAnnotation;

function flowParseTypeAnnotatableIdentifier() {
  _expression.parseIdentifier.call(void 0, );
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    flowParseTypeAnnotation();
  }
}

 function flowParseVariance() {
  if (_index.match.call(void 0, _types.TokenType.plus) || _index.match.call(void 0, _types.TokenType.minus)) {
    _index.next.call(void 0, );
    _base.state.tokens[_base.state.tokens.length - 1].isType = true;
  }
} exports.flowParseVariance = flowParseVariance;

// ==================================
// Overrides
// ==================================

 function flowParseFunctionBodyAndFinish(funcContextId) {
  // For arrow functions, `parseArrow` handles the return type itself.
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    flowParseTypeAndPredicateInitialiser();
  }

  _expression.parseFunctionBody.call(void 0, false, funcContextId);
} exports.flowParseFunctionBodyAndFinish = flowParseFunctionBodyAndFinish;

 function flowParseSubscript(
  startTokenIndex,
  noCalls,
  stopState,
) {
  if (_index.match.call(void 0, _types.TokenType.questionDot) && _index.lookaheadType.call(void 0, ) === _types.TokenType.lessThan) {
    if (noCalls) {
      stopState.stop = true;
      return;
    }
    _index.next.call(void 0, );
    flowParseTypeParameterInstantiation();
    _util.expect.call(void 0, _types.TokenType.parenL);
    _expression.parseCallExpressionArguments.call(void 0, );
    return;
  } else if (!noCalls && _index.match.call(void 0, _types.TokenType.lessThan)) {
    const snapshot = _base.state.snapshot();
    flowParseTypeParameterInstantiation();
    _util.expect.call(void 0, _types.TokenType.parenL);
    _expression.parseCallExpressionArguments.call(void 0, );
    if (_base.state.error) {
      _base.state.restoreFromSnapshot(snapshot);
    } else {
      return;
    }
  }
  _expression.baseParseSubscript.call(void 0, startTokenIndex, noCalls, stopState);
} exports.flowParseSubscript = flowParseSubscript;

 function flowStartParseNewArguments() {
  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    const snapshot = _base.state.snapshot();
    flowParseTypeParameterInstantiation();
    if (_base.state.error) {
      _base.state.restoreFromSnapshot(snapshot);
    }
  }
} exports.flowStartParseNewArguments = flowStartParseNewArguments;

// interfaces
 function flowTryParseStatement() {
  if (_index.match.call(void 0, _types.TokenType.name) && _base.state.contextualKeyword === _keywords.ContextualKeyword._interface) {
    const oldIsType = _index.pushTypeContext.call(void 0, 0);
    _index.next.call(void 0, );
    flowParseInterface();
    _index.popTypeContext.call(void 0, oldIsType);
    return true;
  } else if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._enum)) {
    flowParseEnumDeclaration();
    return true;
  }
  return false;
} exports.flowTryParseStatement = flowTryParseStatement;

 function flowTryParseExportDefaultExpression() {
  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._enum)) {
    flowParseEnumDeclaration();
    return true;
  }
  return false;
} exports.flowTryParseExportDefaultExpression = flowTryParseExportDefaultExpression;

// declares, interfaces and type aliases
 function flowParseIdentifierStatement(contextualKeyword) {
  if (contextualKeyword === _keywords.ContextualKeyword._declare) {
    if (
      _index.match.call(void 0, _types.TokenType._class) ||
      _index.match.call(void 0, _types.TokenType.name) ||
      _index.match.call(void 0, _types.TokenType._function) ||
      _index.match.call(void 0, _types.TokenType._var) ||
      _index.match.call(void 0, _types.TokenType._export)
    ) {
      const oldIsType = _index.pushTypeContext.call(void 0, 1);
      flowParseDeclare();
      _index.popTypeContext.call(void 0, oldIsType);
    }
  } else if (_index.match.call(void 0, _types.TokenType.name)) {
    if (contextualKeyword === _keywords.ContextualKeyword._interface) {
      const oldIsType = _index.pushTypeContext.call(void 0, 1);
      flowParseInterface();
      _index.popTypeContext.call(void 0, oldIsType);
    } else if (contextualKeyword === _keywords.ContextualKeyword._type) {
      const oldIsType = _index.pushTypeContext.call(void 0, 1);
      flowParseTypeAlias();
      _index.popTypeContext.call(void 0, oldIsType);
    } else if (contextualKeyword === _keywords.ContextualKeyword._opaque) {
      const oldIsType = _index.pushTypeContext.call(void 0, 1);
      flowParseOpaqueType(false);
      _index.popTypeContext.call(void 0, oldIsType);
    }
  }
  _util.semicolon.call(void 0, );
} exports.flowParseIdentifierStatement = flowParseIdentifierStatement;

// export type
 function flowShouldParseExportDeclaration() {
  return (
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._type) ||
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._interface) ||
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._opaque) ||
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._enum)
  );
} exports.flowShouldParseExportDeclaration = flowShouldParseExportDeclaration;

 function flowShouldDisallowExportDefaultSpecifier() {
  return (
    _index.match.call(void 0, _types.TokenType.name) &&
    (_base.state.contextualKeyword === _keywords.ContextualKeyword._type ||
      _base.state.contextualKeyword === _keywords.ContextualKeyword._interface ||
      _base.state.contextualKeyword === _keywords.ContextualKeyword._opaque ||
      _base.state.contextualKeyword === _keywords.ContextualKeyword._enum)
  );
} exports.flowShouldDisallowExportDefaultSpecifier = flowShouldDisallowExportDefaultSpecifier;

 function flowParseExportDeclaration() {
  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._type)) {
    const oldIsType = _index.pushTypeContext.call(void 0, 1);
    _index.next.call(void 0, );

    if (_index.match.call(void 0, _types.TokenType.braceL)) {
      // export type { foo, bar };
      _statement.parseExportSpecifiers.call(void 0, );
      _statement.parseExportFrom.call(void 0, );
    } else {
      // export type Foo = Bar;
      flowParseTypeAlias();
    }
    _index.popTypeContext.call(void 0, oldIsType);
  } else if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._opaque)) {
    const oldIsType = _index.pushTypeContext.call(void 0, 1);
    _index.next.call(void 0, );
    // export opaque type Foo = Bar;
    flowParseOpaqueType(false);
    _index.popTypeContext.call(void 0, oldIsType);
  } else if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._interface)) {
    const oldIsType = _index.pushTypeContext.call(void 0, 1);
    _index.next.call(void 0, );
    flowParseInterface();
    _index.popTypeContext.call(void 0, oldIsType);
  } else {
    _statement.parseStatement.call(void 0, true);
  }
} exports.flowParseExportDeclaration = flowParseExportDeclaration;

 function flowShouldParseExportStar() {
  return _index.match.call(void 0, _types.TokenType.star) || (_util.isContextual.call(void 0, _keywords.ContextualKeyword._type) && _index.lookaheadType.call(void 0, ) === _types.TokenType.star);
} exports.flowShouldParseExportStar = flowShouldParseExportStar;

 function flowParseExportStar() {
  if (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._type)) {
    const oldIsType = _index.pushTypeContext.call(void 0, 2);
    _statement.baseParseExportStar.call(void 0, );
    _index.popTypeContext.call(void 0, oldIsType);
  } else {
    _statement.baseParseExportStar.call(void 0, );
  }
} exports.flowParseExportStar = flowParseExportStar;

// parse a the super class type parameters and implements
 function flowAfterParseClassSuper(hasSuper) {
  if (hasSuper && _index.match.call(void 0, _types.TokenType.lessThan)) {
    flowParseTypeParameterInstantiation();
  }
  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._implements)) {
    const oldIsType = _index.pushTypeContext.call(void 0, 0);
    _index.next.call(void 0, );
    _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._implements;
    do {
      flowParseRestrictedIdentifier();
      if (_index.match.call(void 0, _types.TokenType.lessThan)) {
        flowParseTypeParameterInstantiation();
      }
    } while (_index.eat.call(void 0, _types.TokenType.comma));
    _index.popTypeContext.call(void 0, oldIsType);
  }
} exports.flowAfterParseClassSuper = flowAfterParseClassSuper;

// parse type parameters for object method shorthand
 function flowStartParseObjPropValue() {
  // method shorthand
  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    flowParseTypeParameterDeclaration();
    if (!_index.match.call(void 0, _types.TokenType.parenL)) _util.unexpected.call(void 0, );
  }
} exports.flowStartParseObjPropValue = flowStartParseObjPropValue;

 function flowParseAssignableListItemTypes() {
  const oldIsType = _index.pushTypeContext.call(void 0, 0);
  _index.eat.call(void 0, _types.TokenType.question);
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    flowParseTypeAnnotation();
  }
  _index.popTypeContext.call(void 0, oldIsType);
} exports.flowParseAssignableListItemTypes = flowParseAssignableListItemTypes;

// parse typeof and type imports
 function flowStartParseImportSpecifiers() {
  if (_index.match.call(void 0, _types.TokenType._typeof) || _util.isContextual.call(void 0, _keywords.ContextualKeyword._type)) {
    const lh = _index.lookaheadTypeAndKeyword.call(void 0, );
    if (isMaybeDefaultImport(lh) || lh.type === _types.TokenType.braceL || lh.type === _types.TokenType.star) {
      _index.next.call(void 0, );
    }
  }
} exports.flowStartParseImportSpecifiers = flowStartParseImportSpecifiers;

// parse import-type/typeof shorthand
 function flowParseImportSpecifier() {
  const isTypeKeyword =
    _base.state.contextualKeyword === _keywords.ContextualKeyword._type || _base.state.type === _types.TokenType._typeof;
  if (isTypeKeyword) {
    _index.next.call(void 0, );
  } else {
    _expression.parseIdentifier.call(void 0, );
  }

  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._as) && !_util.isLookaheadContextual.call(void 0, _keywords.ContextualKeyword._as)) {
    _expression.parseIdentifier.call(void 0, );
    if (isTypeKeyword && !_index.match.call(void 0, _types.TokenType.name) && !(_base.state.type & _types.TokenType.IS_KEYWORD)) {
      // `import {type as ,` or `import {type as }`
    } else {
      // `import {type as foo`
      _expression.parseIdentifier.call(void 0, );
    }
  } else {
    if (isTypeKeyword && (_index.match.call(void 0, _types.TokenType.name) || !!(_base.state.type & _types.TokenType.IS_KEYWORD))) {
      // `import {type foo`
      _expression.parseIdentifier.call(void 0, );
    }
    if (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._as)) {
      _expression.parseIdentifier.call(void 0, );
    }
  }
} exports.flowParseImportSpecifier = flowParseImportSpecifier;

// parse function type parameters - function foo<T>() {}
 function flowStartParseFunctionParams() {
  // Originally this checked if the method is a getter/setter, but if it was, we'd crash soon
  // anyway, so don't try to propagate that information.
  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    const oldIsType = _index.pushTypeContext.call(void 0, 0);
    flowParseTypeParameterDeclaration();
    _index.popTypeContext.call(void 0, oldIsType);
  }
} exports.flowStartParseFunctionParams = flowStartParseFunctionParams;

// parse flow type annotations on variable declarator heads - let foo: string = bar
 function flowAfterParseVarHead() {
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    flowParseTypeAnnotation();
  }
} exports.flowAfterParseVarHead = flowAfterParseVarHead;

// parse the return type of an async arrow function - let foo = (async (): number => {});
 function flowStartParseAsyncArrowFromCallExpression() {
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    const oldNoAnonFunctionType = _base.state.noAnonFunctionType;
    _base.state.noAnonFunctionType = true;
    flowParseTypeAnnotation();
    _base.state.noAnonFunctionType = oldNoAnonFunctionType;
  }
} exports.flowStartParseAsyncArrowFromCallExpression = flowStartParseAsyncArrowFromCallExpression;

// We need to support type parameter declarations for arrow functions. This
// is tricky. There are three situations we need to handle
//
// 1. This is either JSX or an arrow function. We'll try JSX first. If that
//    fails, we'll try an arrow function. If that fails, we'll throw the JSX
//    error.
// 2. This is an arrow function. We'll parse the type parameter declaration,
//    parse the rest, make sure the rest is an arrow function, and go from
//    there
// 3. This is neither. Just call the super method
 function flowParseMaybeAssign(noIn, isWithinParens) {
  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    const snapshot = _base.state.snapshot();
    let wasArrow = _expression.baseParseMaybeAssign.call(void 0, noIn, isWithinParens);
    if (_base.state.error) {
      _base.state.restoreFromSnapshot(snapshot);
      _base.state.type = _types.TokenType.typeParameterStart;
    } else {
      return wasArrow;
    }

    const oldIsType = _index.pushTypeContext.call(void 0, 0);
    flowParseTypeParameterDeclaration();
    _index.popTypeContext.call(void 0, oldIsType);
    wasArrow = _expression.baseParseMaybeAssign.call(void 0, noIn, isWithinParens);
    if (wasArrow) {
      return true;
    }
    _util.unexpected.call(void 0, );
  }

  return _expression.baseParseMaybeAssign.call(void 0, noIn, isWithinParens);
} exports.flowParseMaybeAssign = flowParseMaybeAssign;

// handle return types for arrow functions
 function flowParseArrow() {
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    const oldIsType = _index.pushTypeContext.call(void 0, 0);
    const snapshot = _base.state.snapshot();

    const oldNoAnonFunctionType = _base.state.noAnonFunctionType;
    _base.state.noAnonFunctionType = true;
    flowParseTypeAndPredicateInitialiser();
    _base.state.noAnonFunctionType = oldNoAnonFunctionType;

    if (_util.canInsertSemicolon.call(void 0, )) _util.unexpected.call(void 0, );
    if (!_index.match.call(void 0, _types.TokenType.arrow)) _util.unexpected.call(void 0, );

    if (_base.state.error) {
      _base.state.restoreFromSnapshot(snapshot);
    }
    _index.popTypeContext.call(void 0, oldIsType);
  }
  return _index.eat.call(void 0, _types.TokenType.arrow);
} exports.flowParseArrow = flowParseArrow;

 function flowParseSubscripts(startTokenIndex, noCalls = false) {
  if (
    _base.state.tokens[_base.state.tokens.length - 1].contextualKeyword === _keywords.ContextualKeyword._async &&
    _index.match.call(void 0, _types.TokenType.lessThan)
  ) {
    const snapshot = _base.state.snapshot();
    const wasArrow = parseAsyncArrowWithTypeParameters();
    if (wasArrow && !_base.state.error) {
      return;
    }
    _base.state.restoreFromSnapshot(snapshot);
  }

  _expression.baseParseSubscripts.call(void 0, startTokenIndex, noCalls);
} exports.flowParseSubscripts = flowParseSubscripts;

// Returns true if there was an arrow function here.
function parseAsyncArrowWithTypeParameters() {
  _base.state.scopeDepth++;
  const startTokenIndex = _base.state.tokens.length;
  _statement.parseFunctionParams.call(void 0, );
  if (!_expression.parseArrow.call(void 0, )) {
    return false;
  }
  _expression.parseArrowExpression.call(void 0, startTokenIndex);
  return true;
}

function flowParseEnumDeclaration() {
  _util.expectContextual.call(void 0, _keywords.ContextualKeyword._enum);
  _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._enum;
  _expression.parseIdentifier.call(void 0, );
  flowParseEnumBody();
}

function flowParseEnumBody() {
  if (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._of)) {
    _index.next.call(void 0, );
  }
  _util.expect.call(void 0, _types.TokenType.braceL);
  flowParseEnumMembers();
  _util.expect.call(void 0, _types.TokenType.braceR);
}

function flowParseEnumMembers() {
  while (!_index.match.call(void 0, _types.TokenType.braceR) && !_base.state.error) {
    if (_index.eat.call(void 0, _types.TokenType.ellipsis)) {
      break;
    }
    flowParseEnumMember();
    if (!_index.match.call(void 0, _types.TokenType.braceR)) {
      _util.expect.call(void 0, _types.TokenType.comma);
    }
  }
}

function flowParseEnumMember() {
  _expression.parseIdentifier.call(void 0, );
  if (_index.eat.call(void 0, _types.TokenType.eq)) {
    // Flow enum values are always just one token (a string, number, or boolean literal).
    _index.next.call(void 0, );
  }
}


/***/ }),

/***/ 9390:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));









var _index = __webpack_require__(2297);
var _types = __webpack_require__(798);
var _base = __webpack_require__(8022);
var _expression = __webpack_require__(745);
var _util = __webpack_require__(8958);
var _charcodes = __webpack_require__(1537);
var _identifier = __webpack_require__(905);
var _typescript = __webpack_require__(4789);

/**
 * Read token with JSX contents.
 *
 * In addition to detecting jsxTagStart and also regular tokens that might be
 * part of an expression, this code detects the start and end of text ranges
 * within JSX children. In order to properly count the number of children, we
 * distinguish jsxText from jsxEmptyText, which is a text range that simplifies
 * to the empty string after JSX whitespace trimming.
 *
 * It turns out that a JSX text range will simplify to the empty string if and
 * only if both of these conditions hold:
 * - The range consists entirely of whitespace characters (only counting space,
 *   tab, \r, and \n).
 * - The range has at least one newline.
 * This can be proven by analyzing any implementation of whitespace trimming,
 * e.g. formatJSXTextLiteral in Sucrase or cleanJSXElementLiteralChild in Babel.
 */
function jsxReadToken() {
  let sawNewline = false;
  let sawNonWhitespace = false;
  while (true) {
    if (_base.state.pos >= _base.input.length) {
      _util.unexpected.call(void 0, "Unterminated JSX contents");
      return;
    }

    const ch = _base.input.charCodeAt(_base.state.pos);
    if (ch === _charcodes.charCodes.lessThan || ch === _charcodes.charCodes.leftCurlyBrace) {
      if (_base.state.pos === _base.state.start) {
        if (ch === _charcodes.charCodes.lessThan) {
          _base.state.pos++;
          _index.finishToken.call(void 0, _types.TokenType.jsxTagStart);
          return;
        }
        _index.getTokenFromCode.call(void 0, ch);
        return;
      }
      if (sawNewline && !sawNonWhitespace) {
        _index.finishToken.call(void 0, _types.TokenType.jsxEmptyText);
      } else {
        _index.finishToken.call(void 0, _types.TokenType.jsxText);
      }
      return;
    }

    // This is part of JSX text.
    if (ch === _charcodes.charCodes.lineFeed) {
      sawNewline = true;
    } else if (ch !== _charcodes.charCodes.space && ch !== _charcodes.charCodes.carriageReturn && ch !== _charcodes.charCodes.tab) {
      sawNonWhitespace = true;
    }
    _base.state.pos++;
  }
}

function jsxReadString(quote) {
  _base.state.pos++;
  for (;;) {
    if (_base.state.pos >= _base.input.length) {
      _util.unexpected.call(void 0, "Unterminated string constant");
      return;
    }

    const ch = _base.input.charCodeAt(_base.state.pos);
    if (ch === quote) {
      _base.state.pos++;
      break;
    }
    _base.state.pos++;
  }
  _index.finishToken.call(void 0, _types.TokenType.string);
}

// Read a JSX identifier (valid tag or attribute name).
//
// Optimized version since JSX identifiers can't contain
// escape characters and so can be read as single slice.
// Also assumes that first character was already checked
// by isIdentifierStart in readToken.

function jsxReadWord() {
  let ch;
  do {
    if (_base.state.pos > _base.input.length) {
      _util.unexpected.call(void 0, "Unexpectedly reached the end of input.");
      return;
    }
    ch = _base.input.charCodeAt(++_base.state.pos);
  } while (_identifier.IS_IDENTIFIER_CHAR[ch] || ch === _charcodes.charCodes.dash);
  _index.finishToken.call(void 0, _types.TokenType.jsxName);
}

// Parse next token as JSX identifier
function jsxParseIdentifier() {
  nextJSXTagToken();
}

// Parse namespaced identifier.
function jsxParseNamespacedName(identifierRole) {
  jsxParseIdentifier();
  if (!_index.eat.call(void 0, _types.TokenType.colon)) {
    // Plain identifier, so this is an access.
    _base.state.tokens[_base.state.tokens.length - 1].identifierRole = identifierRole;
    return;
  }
  // Process the second half of the namespaced name.
  jsxParseIdentifier();
}

// Parses element name in any form - namespaced, member
// or single identifier.
function jsxParseElementName() {
  const firstTokenIndex = _base.state.tokens.length;
  jsxParseNamespacedName(_index.IdentifierRole.Access);
  let hadDot = false;
  while (_index.match.call(void 0, _types.TokenType.dot)) {
    hadDot = true;
    nextJSXTagToken();
    jsxParseIdentifier();
  }
  // For tags like <div> with a lowercase letter and no dots, the name is
  // actually *not* an identifier access, since it's referring to a built-in
  // tag name. Remove the identifier role in this case so that it's not
  // accidentally transformed by the imports transform when preserving JSX.
  if (!hadDot) {
    const firstToken = _base.state.tokens[firstTokenIndex];
    const firstChar = _base.input.charCodeAt(firstToken.start);
    if (firstChar >= _charcodes.charCodes.lowercaseA && firstChar <= _charcodes.charCodes.lowercaseZ) {
      firstToken.identifierRole = null;
    }
  }
}

// Parses any type of JSX attribute value.
function jsxParseAttributeValue() {
  switch (_base.state.type) {
    case _types.TokenType.braceL:
      _index.next.call(void 0, );
      _expression.parseExpression.call(void 0, );
      nextJSXTagToken();
      return;

    case _types.TokenType.jsxTagStart:
      jsxParseElement();
      nextJSXTagToken();
      return;

    case _types.TokenType.string:
      nextJSXTagToken();
      return;

    default:
      _util.unexpected.call(void 0, "JSX value should be either an expression or a quoted JSX text");
  }
}

// Parse JSX spread child, after already processing the {
// Does not parse the closing }
function jsxParseSpreadChild() {
  _util.expect.call(void 0, _types.TokenType.ellipsis);
  _expression.parseExpression.call(void 0, );
}

// Parses JSX opening tag starting after "<".
// Returns true if the tag was self-closing.
// Does not parse the last token.
function jsxParseOpeningElement(initialTokenIndex) {
  if (_index.match.call(void 0, _types.TokenType.jsxTagEnd)) {
    // This is an open-fragment.
    return false;
  }
  jsxParseElementName();
  if (_base.isTypeScriptEnabled) {
    _typescript.tsTryParseJSXTypeArgument.call(void 0, );
  }
  let hasSeenPropSpread = false;
  while (!_index.match.call(void 0, _types.TokenType.slash) && !_index.match.call(void 0, _types.TokenType.jsxTagEnd) && !_base.state.error) {
    if (_index.eat.call(void 0, _types.TokenType.braceL)) {
      hasSeenPropSpread = true;
      _util.expect.call(void 0, _types.TokenType.ellipsis);
      _expression.parseMaybeAssign.call(void 0, );
      // }
      nextJSXTagToken();
      continue;
    }
    if (
      hasSeenPropSpread &&
      _base.state.end - _base.state.start === 3 &&
      _base.input.charCodeAt(_base.state.start) === _charcodes.charCodes.lowercaseK &&
      _base.input.charCodeAt(_base.state.start + 1) === _charcodes.charCodes.lowercaseE &&
      _base.input.charCodeAt(_base.state.start + 2) === _charcodes.charCodes.lowercaseY
    ) {
      _base.state.tokens[initialTokenIndex].jsxRole = _index.JSXRole.KeyAfterPropSpread;
    }
    jsxParseNamespacedName(_index.IdentifierRole.ObjectKey);
    if (_index.match.call(void 0, _types.TokenType.eq)) {
      nextJSXTagToken();
      jsxParseAttributeValue();
    }
  }
  const isSelfClosing = _index.match.call(void 0, _types.TokenType.slash);
  if (isSelfClosing) {
    // /
    nextJSXTagToken();
  }
  return isSelfClosing;
}

// Parses JSX closing tag starting after "</".
// Does not parse the last token.
function jsxParseClosingElement() {
  if (_index.match.call(void 0, _types.TokenType.jsxTagEnd)) {
    // Fragment syntax, so we immediately have a tag end.
    return;
  }
  jsxParseElementName();
}

// Parses entire JSX element, including its opening tag
// (starting after "<"), attributes, contents and closing tag.
// Does not parse the last token.
function jsxParseElementAt() {
  const initialTokenIndex = _base.state.tokens.length - 1;
  _base.state.tokens[initialTokenIndex].jsxRole = _index.JSXRole.NoChildren;
  let numExplicitChildren = 0;
  const isSelfClosing = jsxParseOpeningElement(initialTokenIndex);
  if (!isSelfClosing) {
    nextJSXExprToken();
    while (true) {
      switch (_base.state.type) {
        case _types.TokenType.jsxTagStart:
          nextJSXTagToken();
          if (_index.match.call(void 0, _types.TokenType.slash)) {
            nextJSXTagToken();
            jsxParseClosingElement();
            // Key after prop spread takes precedence over number of children,
            // since it means we switch to createElement, which doesn't care
            // about number of children.
            if (_base.state.tokens[initialTokenIndex].jsxRole !== _index.JSXRole.KeyAfterPropSpread) {
              if (numExplicitChildren === 1) {
                _base.state.tokens[initialTokenIndex].jsxRole = _index.JSXRole.OneChild;
              } else if (numExplicitChildren > 1) {
                _base.state.tokens[initialTokenIndex].jsxRole = _index.JSXRole.StaticChildren;
              }
            }
            return;
          }
          numExplicitChildren++;
          jsxParseElementAt();
          nextJSXExprToken();
          break;

        case _types.TokenType.jsxText:
          numExplicitChildren++;
          nextJSXExprToken();
          break;

        case _types.TokenType.jsxEmptyText:
          nextJSXExprToken();
          break;

        case _types.TokenType.braceL:
          _index.next.call(void 0, );
          if (_index.match.call(void 0, _types.TokenType.ellipsis)) {
            jsxParseSpreadChild();
            nextJSXExprToken();
            // Spread children are a mechanism to explicitly mark children as
            // static, so count it as 2 children to satisfy the "more than one
            // child" condition.
            numExplicitChildren += 2;
          } else {
            // If we see {}, this is an empty pseudo-expression that doesn't
            // count as a child.
            if (!_index.match.call(void 0, _types.TokenType.braceR)) {
              numExplicitChildren++;
              _expression.parseExpression.call(void 0, );
            }
            nextJSXExprToken();
          }

          break;

        // istanbul ignore next - should never happen
        default:
          _util.unexpected.call(void 0, );
          return;
      }
    }
  }
}

// Parses entire JSX element from current position.
// Does not parse the last token.
 function jsxParseElement() {
  nextJSXTagToken();
  jsxParseElementAt();
} exports.jsxParseElement = jsxParseElement;

// ==================================
// Overrides
// ==================================

 function nextJSXTagToken() {
  _base.state.tokens.push(new (0, _index.Token)());
  _index.skipSpace.call(void 0, );
  _base.state.start = _base.state.pos;
  const code = _base.input.charCodeAt(_base.state.pos);

  if (_identifier.IS_IDENTIFIER_START[code]) {
    jsxReadWord();
  } else if (code === _charcodes.charCodes.quotationMark || code === _charcodes.charCodes.apostrophe) {
    jsxReadString(code);
  } else {
    // The following tokens are just one character each.
    ++_base.state.pos;
    switch (code) {
      case _charcodes.charCodes.greaterThan:
        _index.finishToken.call(void 0, _types.TokenType.jsxTagEnd);
        break;
      case _charcodes.charCodes.lessThan:
        _index.finishToken.call(void 0, _types.TokenType.jsxTagStart);
        break;
      case _charcodes.charCodes.slash:
        _index.finishToken.call(void 0, _types.TokenType.slash);
        break;
      case _charcodes.charCodes.equalsTo:
        _index.finishToken.call(void 0, _types.TokenType.eq);
        break;
      case _charcodes.charCodes.leftCurlyBrace:
        _index.finishToken.call(void 0, _types.TokenType.braceL);
        break;
      case _charcodes.charCodes.dot:
        _index.finishToken.call(void 0, _types.TokenType.dot);
        break;
      case _charcodes.charCodes.colon:
        _index.finishToken.call(void 0, _types.TokenType.colon);
        break;
      default:
        _util.unexpected.call(void 0, );
    }
  }
} exports.nextJSXTagToken = nextJSXTagToken;

function nextJSXExprToken() {
  _base.state.tokens.push(new (0, _index.Token)());
  _base.state.start = _base.state.pos;
  jsxReadToken();
}


/***/ }),

/***/ 9002:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));// Use a Map rather than object to avoid unexpected __proto__ access.
exports["default"] = new Map([
  ["quot", "\u0022"],
  ["amp", "&"],
  ["apos", "\u0027"],
  ["lt", "<"],
  ["gt", ">"],
  ["nbsp", "\u00A0"],
  ["iexcl", "\u00A1"],
  ["cent", "\u00A2"],
  ["pound", "\u00A3"],
  ["curren", "\u00A4"],
  ["yen", "\u00A5"],
  ["brvbar", "\u00A6"],
  ["sect", "\u00A7"],
  ["uml", "\u00A8"],
  ["copy", "\u00A9"],
  ["ordf", "\u00AA"],
  ["laquo", "\u00AB"],
  ["not", "\u00AC"],
  ["shy", "\u00AD"],
  ["reg", "\u00AE"],
  ["macr", "\u00AF"],
  ["deg", "\u00B0"],
  ["plusmn", "\u00B1"],
  ["sup2", "\u00B2"],
  ["sup3", "\u00B3"],
  ["acute", "\u00B4"],
  ["micro", "\u00B5"],
  ["para", "\u00B6"],
  ["middot", "\u00B7"],
  ["cedil", "\u00B8"],
  ["sup1", "\u00B9"],
  ["ordm", "\u00BA"],
  ["raquo", "\u00BB"],
  ["frac14", "\u00BC"],
  ["frac12", "\u00BD"],
  ["frac34", "\u00BE"],
  ["iquest", "\u00BF"],
  ["Agrave", "\u00C0"],
  ["Aacute", "\u00C1"],
  ["Acirc", "\u00C2"],
  ["Atilde", "\u00C3"],
  ["Auml", "\u00C4"],
  ["Aring", "\u00C5"],
  ["AElig", "\u00C6"],
  ["Ccedil", "\u00C7"],
  ["Egrave", "\u00C8"],
  ["Eacute", "\u00C9"],
  ["Ecirc", "\u00CA"],
  ["Euml", "\u00CB"],
  ["Igrave", "\u00CC"],
  ["Iacute", "\u00CD"],
  ["Icirc", "\u00CE"],
  ["Iuml", "\u00CF"],
  ["ETH", "\u00D0"],
  ["Ntilde", "\u00D1"],
  ["Ograve", "\u00D2"],
  ["Oacute", "\u00D3"],
  ["Ocirc", "\u00D4"],
  ["Otilde", "\u00D5"],
  ["Ouml", "\u00D6"],
  ["times", "\u00D7"],
  ["Oslash", "\u00D8"],
  ["Ugrave", "\u00D9"],
  ["Uacute", "\u00DA"],
  ["Ucirc", "\u00DB"],
  ["Uuml", "\u00DC"],
  ["Yacute", "\u00DD"],
  ["THORN", "\u00DE"],
  ["szlig", "\u00DF"],
  ["agrave", "\u00E0"],
  ["aacute", "\u00E1"],
  ["acirc", "\u00E2"],
  ["atilde", "\u00E3"],
  ["auml", "\u00E4"],
  ["aring", "\u00E5"],
  ["aelig", "\u00E6"],
  ["ccedil", "\u00E7"],
  ["egrave", "\u00E8"],
  ["eacute", "\u00E9"],
  ["ecirc", "\u00EA"],
  ["euml", "\u00EB"],
  ["igrave", "\u00EC"],
  ["iacute", "\u00ED"],
  ["icirc", "\u00EE"],
  ["iuml", "\u00EF"],
  ["eth", "\u00F0"],
  ["ntilde", "\u00F1"],
  ["ograve", "\u00F2"],
  ["oacute", "\u00F3"],
  ["ocirc", "\u00F4"],
  ["otilde", "\u00F5"],
  ["ouml", "\u00F6"],
  ["divide", "\u00F7"],
  ["oslash", "\u00F8"],
  ["ugrave", "\u00F9"],
  ["uacute", "\u00FA"],
  ["ucirc", "\u00FB"],
  ["uuml", "\u00FC"],
  ["yacute", "\u00FD"],
  ["thorn", "\u00FE"],
  ["yuml", "\u00FF"],
  ["OElig", "\u0152"],
  ["oelig", "\u0153"],
  ["Scaron", "\u0160"],
  ["scaron", "\u0161"],
  ["Yuml", "\u0178"],
  ["fnof", "\u0192"],
  ["circ", "\u02C6"],
  ["tilde", "\u02DC"],
  ["Alpha", "\u0391"],
  ["Beta", "\u0392"],
  ["Gamma", "\u0393"],
  ["Delta", "\u0394"],
  ["Epsilon", "\u0395"],
  ["Zeta", "\u0396"],
  ["Eta", "\u0397"],
  ["Theta", "\u0398"],
  ["Iota", "\u0399"],
  ["Kappa", "\u039A"],
  ["Lambda", "\u039B"],
  ["Mu", "\u039C"],
  ["Nu", "\u039D"],
  ["Xi", "\u039E"],
  ["Omicron", "\u039F"],
  ["Pi", "\u03A0"],
  ["Rho", "\u03A1"],
  ["Sigma", "\u03A3"],
  ["Tau", "\u03A4"],
  ["Upsilon", "\u03A5"],
  ["Phi", "\u03A6"],
  ["Chi", "\u03A7"],
  ["Psi", "\u03A8"],
  ["Omega", "\u03A9"],
  ["alpha", "\u03B1"],
  ["beta", "\u03B2"],
  ["gamma", "\u03B3"],
  ["delta", "\u03B4"],
  ["epsilon", "\u03B5"],
  ["zeta", "\u03B6"],
  ["eta", "\u03B7"],
  ["theta", "\u03B8"],
  ["iota", "\u03B9"],
  ["kappa", "\u03BA"],
  ["lambda", "\u03BB"],
  ["mu", "\u03BC"],
  ["nu", "\u03BD"],
  ["xi", "\u03BE"],
  ["omicron", "\u03BF"],
  ["pi", "\u03C0"],
  ["rho", "\u03C1"],
  ["sigmaf", "\u03C2"],
  ["sigma", "\u03C3"],
  ["tau", "\u03C4"],
  ["upsilon", "\u03C5"],
  ["phi", "\u03C6"],
  ["chi", "\u03C7"],
  ["psi", "\u03C8"],
  ["omega", "\u03C9"],
  ["thetasym", "\u03D1"],
  ["upsih", "\u03D2"],
  ["piv", "\u03D6"],
  ["ensp", "\u2002"],
  ["emsp", "\u2003"],
  ["thinsp", "\u2009"],
  ["zwnj", "\u200C"],
  ["zwj", "\u200D"],
  ["lrm", "\u200E"],
  ["rlm", "\u200F"],
  ["ndash", "\u2013"],
  ["mdash", "\u2014"],
  ["lsquo", "\u2018"],
  ["rsquo", "\u2019"],
  ["sbquo", "\u201A"],
  ["ldquo", "\u201C"],
  ["rdquo", "\u201D"],
  ["bdquo", "\u201E"],
  ["dagger", "\u2020"],
  ["Dagger", "\u2021"],
  ["bull", "\u2022"],
  ["hellip", "\u2026"],
  ["permil", "\u2030"],
  ["prime", "\u2032"],
  ["Prime", "\u2033"],
  ["lsaquo", "\u2039"],
  ["rsaquo", "\u203A"],
  ["oline", "\u203E"],
  ["frasl", "\u2044"],
  ["euro", "\u20AC"],
  ["image", "\u2111"],
  ["weierp", "\u2118"],
  ["real", "\u211C"],
  ["trade", "\u2122"],
  ["alefsym", "\u2135"],
  ["larr", "\u2190"],
  ["uarr", "\u2191"],
  ["rarr", "\u2192"],
  ["darr", "\u2193"],
  ["harr", "\u2194"],
  ["crarr", "\u21B5"],
  ["lArr", "\u21D0"],
  ["uArr", "\u21D1"],
  ["rArr", "\u21D2"],
  ["dArr", "\u21D3"],
  ["hArr", "\u21D4"],
  ["forall", "\u2200"],
  ["part", "\u2202"],
  ["exist", "\u2203"],
  ["empty", "\u2205"],
  ["nabla", "\u2207"],
  ["isin", "\u2208"],
  ["notin", "\u2209"],
  ["ni", "\u220B"],
  ["prod", "\u220F"],
  ["sum", "\u2211"],
  ["minus", "\u2212"],
  ["lowast", "\u2217"],
  ["radic", "\u221A"],
  ["prop", "\u221D"],
  ["infin", "\u221E"],
  ["ang", "\u2220"],
  ["and", "\u2227"],
  ["or", "\u2228"],
  ["cap", "\u2229"],
  ["cup", "\u222A"],
  ["int", "\u222B"],
  ["there4", "\u2234"],
  ["sim", "\u223C"],
  ["cong", "\u2245"],
  ["asymp", "\u2248"],
  ["ne", "\u2260"],
  ["equiv", "\u2261"],
  ["le", "\u2264"],
  ["ge", "\u2265"],
  ["sub", "\u2282"],
  ["sup", "\u2283"],
  ["nsub", "\u2284"],
  ["sube", "\u2286"],
  ["supe", "\u2287"],
  ["oplus", "\u2295"],
  ["otimes", "\u2297"],
  ["perp", "\u22A5"],
  ["sdot", "\u22C5"],
  ["lceil", "\u2308"],
  ["rceil", "\u2309"],
  ["lfloor", "\u230A"],
  ["rfloor", "\u230B"],
  ["lang", "\u2329"],
  ["rang", "\u232A"],
  ["loz", "\u25CA"],
  ["spades", "\u2660"],
  ["clubs", "\u2663"],
  ["hearts", "\u2665"],
  ["diams", "\u2666"],
]);


/***/ }),

/***/ 5798:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _index = __webpack_require__(2297);
var _types = __webpack_require__(798);
var _base = __webpack_require__(8022);
var _expression = __webpack_require__(745);
var _flow = __webpack_require__(5741);
var _typescript = __webpack_require__(4789);

/**
 * Common parser code for TypeScript and Flow.
 */

// An apparent conditional expression could actually be an optional parameter in an arrow function.
 function typedParseConditional(noIn) {
  // If we see ?:, this can't possibly be a valid conditional. typedParseParenItem will be called
  // later to finish off the arrow parameter. We also need to handle bare ? tokens for optional
  // parameters without type annotations, i.e. ?, and ?) .
  if (_index.match.call(void 0, _types.TokenType.question)) {
    const nextType = _index.lookaheadType.call(void 0, );
    if (nextType === _types.TokenType.colon || nextType === _types.TokenType.comma || nextType === _types.TokenType.parenR) {
      return;
    }
  }
  _expression.baseParseConditional.call(void 0, noIn);
} exports.typedParseConditional = typedParseConditional;

// Note: These "type casts" are *not* valid TS expressions.
// But we parse them here and change them when completing the arrow function.
 function typedParseParenItem() {
  _index.eatTypeToken.call(void 0, _types.TokenType.question);
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    if (_base.isTypeScriptEnabled) {
      _typescript.tsParseTypeAnnotation.call(void 0, );
    } else if (_base.isFlowEnabled) {
      _flow.flowParseTypeAnnotation.call(void 0, );
    }
  }
} exports.typedParseParenItem = typedParseParenItem;


/***/ }),

/***/ 4789:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));










var _index = __webpack_require__(2297);
var _keywords = __webpack_require__(3464);
var _types = __webpack_require__(798);
var _base = __webpack_require__(8022);















var _expression = __webpack_require__(745);
var _lval = __webpack_require__(7212);








var _statement = __webpack_require__(1765);











var _util = __webpack_require__(8958);
var _jsx = __webpack_require__(9390);

function tsIsIdentifier() {
  // TODO: actually a bit more complex in TypeScript, but shouldn't matter.
  // See https://github.com/Microsoft/TypeScript/issues/15008
  return _index.match.call(void 0, _types.TokenType.name);
}

function isLiteralPropertyName() {
  return (
    _index.match.call(void 0, _types.TokenType.name) ||
    Boolean(_base.state.type & _types.TokenType.IS_KEYWORD) ||
    _index.match.call(void 0, _types.TokenType.string) ||
    _index.match.call(void 0, _types.TokenType.num) ||
    _index.match.call(void 0, _types.TokenType.bigint) ||
    _index.match.call(void 0, _types.TokenType.decimal)
  );
}

function tsNextTokenCanFollowModifier() {
  // Note: TypeScript's implementation is much more complicated because
  // more things are considered modifiers there.
  // This implementation only handles modifiers not handled by babylon itself. And "static".
  // TODO: Would be nice to avoid lookahead. Want a hasLineBreakUpNext() method...
  const snapshot = _base.state.snapshot();

  _index.next.call(void 0, );
  const canFollowModifier =
    (_index.match.call(void 0, _types.TokenType.bracketL) ||
      _index.match.call(void 0, _types.TokenType.braceL) ||
      _index.match.call(void 0, _types.TokenType.star) ||
      _index.match.call(void 0, _types.TokenType.ellipsis) ||
      _index.match.call(void 0, _types.TokenType.hash) ||
      isLiteralPropertyName()) &&
    !_util.hasPrecedingLineBreak.call(void 0, );

  if (canFollowModifier) {
    return true;
  } else {
    _base.state.restoreFromSnapshot(snapshot);
    return false;
  }
}

 function tsParseModifiers(allowedModifiers) {
  while (true) {
    const modifier = tsParseModifier(allowedModifiers);
    if (modifier === null) {
      break;
    }
  }
} exports.tsParseModifiers = tsParseModifiers;

/** Parses a modifier matching one the given modifier names. */
 function tsParseModifier(
  allowedModifiers,
) {
  if (!_index.match.call(void 0, _types.TokenType.name)) {
    return null;
  }

  const modifier = _base.state.contextualKeyword;
  if (allowedModifiers.indexOf(modifier) !== -1 && tsNextTokenCanFollowModifier()) {
    switch (modifier) {
      case _keywords.ContextualKeyword._readonly:
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._readonly;
        break;
      case _keywords.ContextualKeyword._abstract:
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._abstract;
        break;
      case _keywords.ContextualKeyword._static:
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._static;
        break;
      case _keywords.ContextualKeyword._public:
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._public;
        break;
      case _keywords.ContextualKeyword._private:
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._private;
        break;
      case _keywords.ContextualKeyword._protected:
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._protected;
        break;
      case _keywords.ContextualKeyword._override:
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._override;
        break;
      case _keywords.ContextualKeyword._declare:
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._declare;
        break;
      default:
        break;
    }
    return modifier;
  }
  return null;
} exports.tsParseModifier = tsParseModifier;

function tsParseEntityName() {
  _expression.parseIdentifier.call(void 0, );
  while (_index.eat.call(void 0, _types.TokenType.dot)) {
    _expression.parseIdentifier.call(void 0, );
  }
}

function tsParseTypeReference() {
  tsParseEntityName();
  if (!_util.hasPrecedingLineBreak.call(void 0, ) && _index.match.call(void 0, _types.TokenType.lessThan)) {
    tsParseTypeArguments();
  }
}

function tsParseThisTypePredicate() {
  _index.next.call(void 0, );
  tsParseTypeAnnotation();
}

function tsParseThisTypeNode() {
  _index.next.call(void 0, );
}

function tsParseTypeQuery() {
  _util.expect.call(void 0, _types.TokenType._typeof);
  if (_index.match.call(void 0, _types.TokenType._import)) {
    tsParseImportType();
  } else {
    tsParseEntityName();
  }
  if (!_util.hasPrecedingLineBreak.call(void 0, ) && _index.match.call(void 0, _types.TokenType.lessThan)) {
    tsParseTypeArguments();
  }
}

function tsParseImportType() {
  _util.expect.call(void 0, _types.TokenType._import);
  _util.expect.call(void 0, _types.TokenType.parenL);
  _util.expect.call(void 0, _types.TokenType.string);
  _util.expect.call(void 0, _types.TokenType.parenR);
  if (_index.eat.call(void 0, _types.TokenType.dot)) {
    tsParseEntityName();
  }
  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    tsParseTypeArguments();
  }
}

function tsParseTypeParameter() {
  _index.eat.call(void 0, _types.TokenType._const);
  const hadIn = _index.eat.call(void 0, _types.TokenType._in);
  const hadOut = _util.eatContextual.call(void 0, _keywords.ContextualKeyword._out);
  _index.eat.call(void 0, _types.TokenType._const);
  if ((hadIn || hadOut) && !_index.match.call(void 0, _types.TokenType.name)) {
    // The "in" or "out" keyword must have actually been the type parameter
    // name, so set it as the name.
    _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType.name;
  } else {
    _expression.parseIdentifier.call(void 0, );
  }

  if (_index.eat.call(void 0, _types.TokenType._extends)) {
    tsParseType();
  }
  if (_index.eat.call(void 0, _types.TokenType.eq)) {
    tsParseType();
  }
}

 function tsTryParseTypeParameters() {
  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    tsParseTypeParameters();
  }
} exports.tsTryParseTypeParameters = tsTryParseTypeParameters;

function tsParseTypeParameters() {
  const oldIsType = _index.pushTypeContext.call(void 0, 0);
  if (_index.match.call(void 0, _types.TokenType.lessThan) || _index.match.call(void 0, _types.TokenType.typeParameterStart)) {
    _index.next.call(void 0, );
  } else {
    _util.unexpected.call(void 0, );
  }

  while (!_index.eat.call(void 0, _types.TokenType.greaterThan) && !_base.state.error) {
    tsParseTypeParameter();
    _index.eat.call(void 0, _types.TokenType.comma);
  }
  _index.popTypeContext.call(void 0, oldIsType);
}

// Note: In TypeScript implementation we must provide `yieldContext` and `awaitContext`,
// but here it's always false, because this is only used for types.
function tsFillSignature(returnToken) {
  // Arrow fns *must* have return token (`=>`). Normal functions can omit it.
  const returnTokenRequired = returnToken === _types.TokenType.arrow;
  tsTryParseTypeParameters();
  _util.expect.call(void 0, _types.TokenType.parenL);
  // Create a scope even though we're doing type parsing so we don't accidentally
  // treat params as top-level bindings.
  _base.state.scopeDepth++;
  tsParseBindingListForSignature(false /* isBlockScope */);
  _base.state.scopeDepth--;
  if (returnTokenRequired) {
    tsParseTypeOrTypePredicateAnnotation(returnToken);
  } else if (_index.match.call(void 0, returnToken)) {
    tsParseTypeOrTypePredicateAnnotation(returnToken);
  }
}

function tsParseBindingListForSignature(isBlockScope) {
  _lval.parseBindingList.call(void 0, _types.TokenType.parenR, isBlockScope);
}

function tsParseTypeMemberSemicolon() {
  if (!_index.eat.call(void 0, _types.TokenType.comma)) {
    _util.semicolon.call(void 0, );
  }
}

function tsParseSignatureMember() {
  tsFillSignature(_types.TokenType.colon);
  tsParseTypeMemberSemicolon();
}

function tsIsUnambiguouslyIndexSignature() {
  const snapshot = _base.state.snapshot();
  _index.next.call(void 0, ); // Skip '{'
  const isIndexSignature = _index.eat.call(void 0, _types.TokenType.name) && _index.match.call(void 0, _types.TokenType.colon);
  _base.state.restoreFromSnapshot(snapshot);
  return isIndexSignature;
}

function tsTryParseIndexSignature() {
  if (!(_index.match.call(void 0, _types.TokenType.bracketL) && tsIsUnambiguouslyIndexSignature())) {
    return false;
  }

  const oldIsType = _index.pushTypeContext.call(void 0, 0);

  _util.expect.call(void 0, _types.TokenType.bracketL);
  _expression.parseIdentifier.call(void 0, );
  tsParseTypeAnnotation();
  _util.expect.call(void 0, _types.TokenType.bracketR);

  tsTryParseTypeAnnotation();
  tsParseTypeMemberSemicolon();

  _index.popTypeContext.call(void 0, oldIsType);
  return true;
}

function tsParsePropertyOrMethodSignature(isReadonly) {
  _index.eat.call(void 0, _types.TokenType.question);

  if (!isReadonly && (_index.match.call(void 0, _types.TokenType.parenL) || _index.match.call(void 0, _types.TokenType.lessThan))) {
    tsFillSignature(_types.TokenType.colon);
    tsParseTypeMemberSemicolon();
  } else {
    tsTryParseTypeAnnotation();
    tsParseTypeMemberSemicolon();
  }
}

function tsParseTypeMember() {
  if (_index.match.call(void 0, _types.TokenType.parenL) || _index.match.call(void 0, _types.TokenType.lessThan)) {
    // call signature
    tsParseSignatureMember();
    return;
  }
  if (_index.match.call(void 0, _types.TokenType._new)) {
    _index.next.call(void 0, );
    if (_index.match.call(void 0, _types.TokenType.parenL) || _index.match.call(void 0, _types.TokenType.lessThan)) {
      // constructor signature
      tsParseSignatureMember();
    } else {
      tsParsePropertyOrMethodSignature(false);
    }
    return;
  }
  const readonly = !!tsParseModifier([_keywords.ContextualKeyword._readonly]);

  const found = tsTryParseIndexSignature();
  if (found) {
    return;
  }
  if (
    (_util.isContextual.call(void 0, _keywords.ContextualKeyword._get) || _util.isContextual.call(void 0, _keywords.ContextualKeyword._set)) &&
    tsNextTokenCanFollowModifier()
  ) {
    // This is a getter/setter on a type. The tsNextTokenCanFollowModifier
    // function already called next() for us, so continue parsing the name.
  }
  _expression.parsePropertyName.call(void 0, -1 /* Types don't need context IDs. */);
  tsParsePropertyOrMethodSignature(readonly);
}

function tsParseTypeLiteral() {
  tsParseObjectTypeMembers();
}

function tsParseObjectTypeMembers() {
  _util.expect.call(void 0, _types.TokenType.braceL);
  while (!_index.eat.call(void 0, _types.TokenType.braceR) && !_base.state.error) {
    tsParseTypeMember();
  }
}

function tsLookaheadIsStartOfMappedType() {
  const snapshot = _base.state.snapshot();
  const isStartOfMappedType = tsIsStartOfMappedType();
  _base.state.restoreFromSnapshot(snapshot);
  return isStartOfMappedType;
}

function tsIsStartOfMappedType() {
  _index.next.call(void 0, );
  if (_index.eat.call(void 0, _types.TokenType.plus) || _index.eat.call(void 0, _types.TokenType.minus)) {
    return _util.isContextual.call(void 0, _keywords.ContextualKeyword._readonly);
  }
  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._readonly)) {
    _index.next.call(void 0, );
  }
  if (!_index.match.call(void 0, _types.TokenType.bracketL)) {
    return false;
  }
  _index.next.call(void 0, );
  if (!tsIsIdentifier()) {
    return false;
  }
  _index.next.call(void 0, );
  return _index.match.call(void 0, _types.TokenType._in);
}

function tsParseMappedTypeParameter() {
  _expression.parseIdentifier.call(void 0, );
  _util.expect.call(void 0, _types.TokenType._in);
  tsParseType();
}

function tsParseMappedType() {
  _util.expect.call(void 0, _types.TokenType.braceL);
  if (_index.match.call(void 0, _types.TokenType.plus) || _index.match.call(void 0, _types.TokenType.minus)) {
    _index.next.call(void 0, );
    _util.expectContextual.call(void 0, _keywords.ContextualKeyword._readonly);
  } else {
    _util.eatContextual.call(void 0, _keywords.ContextualKeyword._readonly);
  }
  _util.expect.call(void 0, _types.TokenType.bracketL);
  tsParseMappedTypeParameter();
  if (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._as)) {
    tsParseType();
  }
  _util.expect.call(void 0, _types.TokenType.bracketR);
  if (_index.match.call(void 0, _types.TokenType.plus) || _index.match.call(void 0, _types.TokenType.minus)) {
    _index.next.call(void 0, );
    _util.expect.call(void 0, _types.TokenType.question);
  } else {
    _index.eat.call(void 0, _types.TokenType.question);
  }
  tsTryParseType();
  _util.semicolon.call(void 0, );
  _util.expect.call(void 0, _types.TokenType.braceR);
}

function tsParseTupleType() {
  _util.expect.call(void 0, _types.TokenType.bracketL);
  while (!_index.eat.call(void 0, _types.TokenType.bracketR) && !_base.state.error) {
    // Do not validate presence of either none or only labeled elements
    tsParseTupleElementType();
    _index.eat.call(void 0, _types.TokenType.comma);
  }
}

function tsParseTupleElementType() {
  // parses `...TsType[]`
  if (_index.eat.call(void 0, _types.TokenType.ellipsis)) {
    tsParseType();
  } else {
    // parses `TsType?`
    tsParseType();
    _index.eat.call(void 0, _types.TokenType.question);
  }

  // The type we parsed above was actually a label
  if (_index.eat.call(void 0, _types.TokenType.colon)) {
    // Labeled tuple types must affix the label with `...` or `?`, so no need to handle those here
    tsParseType();
  }
}

function tsParseParenthesizedType() {
  _util.expect.call(void 0, _types.TokenType.parenL);
  tsParseType();
  _util.expect.call(void 0, _types.TokenType.parenR);
}

function tsParseTemplateLiteralType() {
  // Finish `, read quasi
  _index.nextTemplateToken.call(void 0, );
  // Finish quasi, read ${
  _index.nextTemplateToken.call(void 0, );
  while (!_index.match.call(void 0, _types.TokenType.backQuote) && !_base.state.error) {
    _util.expect.call(void 0, _types.TokenType.dollarBraceL);
    tsParseType();
    // Finish }, read quasi
    _index.nextTemplateToken.call(void 0, );
    // Finish quasi, read either ${ or `
    _index.nextTemplateToken.call(void 0, );
  }
  _index.next.call(void 0, );
}

var FunctionType; (function (FunctionType) {
  const TSFunctionType = 0; FunctionType[FunctionType["TSFunctionType"] = TSFunctionType] = "TSFunctionType";
  const TSConstructorType = TSFunctionType + 1; FunctionType[FunctionType["TSConstructorType"] = TSConstructorType] = "TSConstructorType";
  const TSAbstractConstructorType = TSConstructorType + 1; FunctionType[FunctionType["TSAbstractConstructorType"] = TSAbstractConstructorType] = "TSAbstractConstructorType";
})(FunctionType || (FunctionType = {}));

function tsParseFunctionOrConstructorType(type) {
  if (type === FunctionType.TSAbstractConstructorType) {
    _util.expectContextual.call(void 0, _keywords.ContextualKeyword._abstract);
  }
  if (type === FunctionType.TSConstructorType || type === FunctionType.TSAbstractConstructorType) {
    _util.expect.call(void 0, _types.TokenType._new);
  }
  const oldInDisallowConditionalTypesContext = _base.state.inDisallowConditionalTypesContext;
  _base.state.inDisallowConditionalTypesContext = false;
  tsFillSignature(_types.TokenType.arrow);
  _base.state.inDisallowConditionalTypesContext = oldInDisallowConditionalTypesContext;
}

function tsParseNonArrayType() {
  switch (_base.state.type) {
    case _types.TokenType.name:
      tsParseTypeReference();
      return;
    case _types.TokenType._void:
    case _types.TokenType._null:
      _index.next.call(void 0, );
      return;
    case _types.TokenType.string:
    case _types.TokenType.num:
    case _types.TokenType.bigint:
    case _types.TokenType.decimal:
    case _types.TokenType._true:
    case _types.TokenType._false:
      _expression.parseLiteral.call(void 0, );
      return;
    case _types.TokenType.minus:
      _index.next.call(void 0, );
      _expression.parseLiteral.call(void 0, );
      return;
    case _types.TokenType._this: {
      tsParseThisTypeNode();
      if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._is) && !_util.hasPrecedingLineBreak.call(void 0, )) {
        tsParseThisTypePredicate();
      }
      return;
    }
    case _types.TokenType._typeof:
      tsParseTypeQuery();
      return;
    case _types.TokenType._import:
      tsParseImportType();
      return;
    case _types.TokenType.braceL:
      if (tsLookaheadIsStartOfMappedType()) {
        tsParseMappedType();
      } else {
        tsParseTypeLiteral();
      }
      return;
    case _types.TokenType.bracketL:
      tsParseTupleType();
      return;
    case _types.TokenType.parenL:
      tsParseParenthesizedType();
      return;
    case _types.TokenType.backQuote:
      tsParseTemplateLiteralType();
      return;
    default:
      if (_base.state.type & _types.TokenType.IS_KEYWORD) {
        _index.next.call(void 0, );
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType.name;
        return;
      }
      break;
  }

  _util.unexpected.call(void 0, );
}

function tsParseArrayTypeOrHigher() {
  tsParseNonArrayType();
  while (!_util.hasPrecedingLineBreak.call(void 0, ) && _index.eat.call(void 0, _types.TokenType.bracketL)) {
    if (!_index.eat.call(void 0, _types.TokenType.bracketR)) {
      // If we hit ] immediately, this is an array type, otherwise it's an indexed access type.
      tsParseType();
      _util.expect.call(void 0, _types.TokenType.bracketR);
    }
  }
}

function tsParseInferType() {
  _util.expectContextual.call(void 0, _keywords.ContextualKeyword._infer);
  _expression.parseIdentifier.call(void 0, );
  if (_index.match.call(void 0, _types.TokenType._extends)) {
    // Infer type constraints introduce an ambiguity about whether the "extends"
    // is a constraint for this infer type or is another conditional type.
    const snapshot = _base.state.snapshot();
    _util.expect.call(void 0, _types.TokenType._extends);
    const oldInDisallowConditionalTypesContext = _base.state.inDisallowConditionalTypesContext;
    _base.state.inDisallowConditionalTypesContext = true;
    tsParseType();
    _base.state.inDisallowConditionalTypesContext = oldInDisallowConditionalTypesContext;
    if (_base.state.error || (!_base.state.inDisallowConditionalTypesContext && _index.match.call(void 0, _types.TokenType.question))) {
      _base.state.restoreFromSnapshot(snapshot);
    }
  }
}

function tsParseTypeOperatorOrHigher() {
  if (
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._keyof) ||
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._unique) ||
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._readonly)
  ) {
    _index.next.call(void 0, );
    tsParseTypeOperatorOrHigher();
  } else if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._infer)) {
    tsParseInferType();
  } else {
    const oldInDisallowConditionalTypesContext = _base.state.inDisallowConditionalTypesContext;
    _base.state.inDisallowConditionalTypesContext = false;
    tsParseArrayTypeOrHigher();
    _base.state.inDisallowConditionalTypesContext = oldInDisallowConditionalTypesContext;
  }
}

function tsParseIntersectionTypeOrHigher() {
  _index.eat.call(void 0, _types.TokenType.bitwiseAND);
  tsParseTypeOperatorOrHigher();
  if (_index.match.call(void 0, _types.TokenType.bitwiseAND)) {
    while (_index.eat.call(void 0, _types.TokenType.bitwiseAND)) {
      tsParseTypeOperatorOrHigher();
    }
  }
}

function tsParseUnionTypeOrHigher() {
  _index.eat.call(void 0, _types.TokenType.bitwiseOR);
  tsParseIntersectionTypeOrHigher();
  if (_index.match.call(void 0, _types.TokenType.bitwiseOR)) {
    while (_index.eat.call(void 0, _types.TokenType.bitwiseOR)) {
      tsParseIntersectionTypeOrHigher();
    }
  }
}

function tsIsStartOfFunctionType() {
  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    return true;
  }
  return _index.match.call(void 0, _types.TokenType.parenL) && tsLookaheadIsUnambiguouslyStartOfFunctionType();
}

function tsSkipParameterStart() {
  if (_index.match.call(void 0, _types.TokenType.name) || _index.match.call(void 0, _types.TokenType._this)) {
    _index.next.call(void 0, );
    return true;
  }
  // If this is a possible array/object destructure, walk to the matching bracket/brace.
  // The next token after will tell us definitively whether this is a function param.
  if (_index.match.call(void 0, _types.TokenType.braceL) || _index.match.call(void 0, _types.TokenType.bracketL)) {
    let depth = 1;
    _index.next.call(void 0, );
    while (depth > 0 && !_base.state.error) {
      if (_index.match.call(void 0, _types.TokenType.braceL) || _index.match.call(void 0, _types.TokenType.bracketL)) {
        depth++;
      } else if (_index.match.call(void 0, _types.TokenType.braceR) || _index.match.call(void 0, _types.TokenType.bracketR)) {
        depth--;
      }
      _index.next.call(void 0, );
    }
    return true;
  }
  return false;
}

function tsLookaheadIsUnambiguouslyStartOfFunctionType() {
  const snapshot = _base.state.snapshot();
  const isUnambiguouslyStartOfFunctionType = tsIsUnambiguouslyStartOfFunctionType();
  _base.state.restoreFromSnapshot(snapshot);
  return isUnambiguouslyStartOfFunctionType;
}

function tsIsUnambiguouslyStartOfFunctionType() {
  _index.next.call(void 0, );
  if (_index.match.call(void 0, _types.TokenType.parenR) || _index.match.call(void 0, _types.TokenType.ellipsis)) {
    // ( )
    // ( ...
    return true;
  }
  if (tsSkipParameterStart()) {
    if (_index.match.call(void 0, _types.TokenType.colon) || _index.match.call(void 0, _types.TokenType.comma) || _index.match.call(void 0, _types.TokenType.question) || _index.match.call(void 0, _types.TokenType.eq)) {
      // ( xxx :
      // ( xxx ,
      // ( xxx ?
      // ( xxx =
      return true;
    }
    if (_index.match.call(void 0, _types.TokenType.parenR)) {
      _index.next.call(void 0, );
      if (_index.match.call(void 0, _types.TokenType.arrow)) {
        // ( xxx ) =>
        return true;
      }
    }
  }
  return false;
}

function tsParseTypeOrTypePredicateAnnotation(returnToken) {
  const oldIsType = _index.pushTypeContext.call(void 0, 0);
  _util.expect.call(void 0, returnToken);
  const finishedReturn = tsParseTypePredicateOrAssertsPrefix();
  if (!finishedReturn) {
    tsParseType();
  }
  _index.popTypeContext.call(void 0, oldIsType);
}

function tsTryParseTypeOrTypePredicateAnnotation() {
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    tsParseTypeOrTypePredicateAnnotation(_types.TokenType.colon);
  }
}

 function tsTryParseTypeAnnotation() {
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    tsParseTypeAnnotation();
  }
} exports.tsTryParseTypeAnnotation = tsTryParseTypeAnnotation;

function tsTryParseType() {
  if (_index.eat.call(void 0, _types.TokenType.colon)) {
    tsParseType();
  }
}

/**
 * Detect a few special return syntax cases: `x is T`, `asserts x`, `asserts x is T`,
 * `asserts this is T`.
 *
 * Returns true if we parsed the return type, false if there's still a type to be parsed.
 */
function tsParseTypePredicateOrAssertsPrefix() {
  const snapshot = _base.state.snapshot();
  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._asserts)) {
    // Normally this is `asserts x is T`, but at this point, it might be `asserts is T` (a user-
    // defined type guard on the `asserts` variable) or just a type called `asserts`.
    _index.next.call(void 0, );
    if (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._is)) {
      // If we see `asserts is`, then this must be of the form `asserts is T`, since
      // `asserts is is T` isn't valid.
      tsParseType();
      return true;
    } else if (tsIsIdentifier() || _index.match.call(void 0, _types.TokenType._this)) {
      _index.next.call(void 0, );
      if (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._is)) {
        // If we see `is`, then this is `asserts x is T`. Otherwise, it's `asserts x`.
        tsParseType();
      }
      return true;
    } else {
      // Regular type, so bail out and start type parsing from scratch.
      _base.state.restoreFromSnapshot(snapshot);
      return false;
    }
  } else if (tsIsIdentifier() || _index.match.call(void 0, _types.TokenType._this)) {
    // This is a regular identifier, which may or may not have "is" after it.
    _index.next.call(void 0, );
    if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._is) && !_util.hasPrecedingLineBreak.call(void 0, )) {
      _index.next.call(void 0, );
      tsParseType();
      return true;
    } else {
      // Regular type, so bail out and start type parsing from scratch.
      _base.state.restoreFromSnapshot(snapshot);
      return false;
    }
  }
  return false;
}

 function tsParseTypeAnnotation() {
  const oldIsType = _index.pushTypeContext.call(void 0, 0);
  _util.expect.call(void 0, _types.TokenType.colon);
  tsParseType();
  _index.popTypeContext.call(void 0, oldIsType);
} exports.tsParseTypeAnnotation = tsParseTypeAnnotation;

 function tsParseType() {
  tsParseNonConditionalType();
  if (_base.state.inDisallowConditionalTypesContext || _util.hasPrecedingLineBreak.call(void 0, ) || !_index.eat.call(void 0, _types.TokenType._extends)) {
    return;
  }
  // extends type
  const oldInDisallowConditionalTypesContext = _base.state.inDisallowConditionalTypesContext;
  _base.state.inDisallowConditionalTypesContext = true;
  tsParseNonConditionalType();
  _base.state.inDisallowConditionalTypesContext = oldInDisallowConditionalTypesContext;

  _util.expect.call(void 0, _types.TokenType.question);
  // true type
  tsParseType();
  _util.expect.call(void 0, _types.TokenType.colon);
  // false type
  tsParseType();
} exports.tsParseType = tsParseType;

function isAbstractConstructorSignature() {
  return _util.isContextual.call(void 0, _keywords.ContextualKeyword._abstract) && _index.lookaheadType.call(void 0, ) === _types.TokenType._new;
}

 function tsParseNonConditionalType() {
  if (tsIsStartOfFunctionType()) {
    tsParseFunctionOrConstructorType(FunctionType.TSFunctionType);
    return;
  }
  if (_index.match.call(void 0, _types.TokenType._new)) {
    // As in `new () => Date`
    tsParseFunctionOrConstructorType(FunctionType.TSConstructorType);
    return;
  } else if (isAbstractConstructorSignature()) {
    // As in `abstract new () => Date`
    tsParseFunctionOrConstructorType(FunctionType.TSAbstractConstructorType);
    return;
  }
  tsParseUnionTypeOrHigher();
} exports.tsParseNonConditionalType = tsParseNonConditionalType;

 function tsParseTypeAssertion() {
  const oldIsType = _index.pushTypeContext.call(void 0, 1);
  tsParseType();
  _util.expect.call(void 0, _types.TokenType.greaterThan);
  _index.popTypeContext.call(void 0, oldIsType);
  _expression.parseMaybeUnary.call(void 0, );
} exports.tsParseTypeAssertion = tsParseTypeAssertion;

 function tsTryParseJSXTypeArgument() {
  if (_index.eat.call(void 0, _types.TokenType.jsxTagStart)) {
    _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType.typeParameterStart;
    const oldIsType = _index.pushTypeContext.call(void 0, 1);
    while (!_index.match.call(void 0, _types.TokenType.greaterThan) && !_base.state.error) {
      tsParseType();
      _index.eat.call(void 0, _types.TokenType.comma);
    }
    // Process >, but the one after needs to be parsed JSX-style.
    _jsx.nextJSXTagToken.call(void 0, );
    _index.popTypeContext.call(void 0, oldIsType);
  }
} exports.tsTryParseJSXTypeArgument = tsTryParseJSXTypeArgument;

function tsParseHeritageClause() {
  while (!_index.match.call(void 0, _types.TokenType.braceL) && !_base.state.error) {
    tsParseExpressionWithTypeArguments();
    _index.eat.call(void 0, _types.TokenType.comma);
  }
}

function tsParseExpressionWithTypeArguments() {
  // Note: TS uses parseLeftHandSideExpressionOrHigher,
  // then has grammar errors later if it's not an EntityName.
  tsParseEntityName();
  if (_index.match.call(void 0, _types.TokenType.lessThan)) {
    tsParseTypeArguments();
  }
}

function tsParseInterfaceDeclaration() {
  _lval.parseBindingIdentifier.call(void 0, false);
  tsTryParseTypeParameters();
  if (_index.eat.call(void 0, _types.TokenType._extends)) {
    tsParseHeritageClause();
  }
  tsParseObjectTypeMembers();
}

function tsParseTypeAliasDeclaration() {
  _lval.parseBindingIdentifier.call(void 0, false);
  tsTryParseTypeParameters();
  _util.expect.call(void 0, _types.TokenType.eq);
  tsParseType();
  _util.semicolon.call(void 0, );
}

function tsParseEnumMember() {
  // Computed property names are grammar errors in an enum, so accept just string literal or identifier.
  if (_index.match.call(void 0, _types.TokenType.string)) {
    _expression.parseLiteral.call(void 0, );
  } else {
    _expression.parseIdentifier.call(void 0, );
  }
  if (_index.eat.call(void 0, _types.TokenType.eq)) {
    const eqIndex = _base.state.tokens.length - 1;
    _expression.parseMaybeAssign.call(void 0, );
    _base.state.tokens[eqIndex].rhsEndIndex = _base.state.tokens.length;
  }
}

function tsParseEnumDeclaration() {
  _lval.parseBindingIdentifier.call(void 0, false);
  _util.expect.call(void 0, _types.TokenType.braceL);
  while (!_index.eat.call(void 0, _types.TokenType.braceR) && !_base.state.error) {
    tsParseEnumMember();
    _index.eat.call(void 0, _types.TokenType.comma);
  }
}

function tsParseModuleBlock() {
  _util.expect.call(void 0, _types.TokenType.braceL);
  _statement.parseBlockBody.call(void 0, /* end */ _types.TokenType.braceR);
}

function tsParseModuleOrNamespaceDeclaration() {
  _lval.parseBindingIdentifier.call(void 0, false);
  if (_index.eat.call(void 0, _types.TokenType.dot)) {
    tsParseModuleOrNamespaceDeclaration();
  } else {
    tsParseModuleBlock();
  }
}

function tsParseAmbientExternalModuleDeclaration() {
  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._global)) {
    _expression.parseIdentifier.call(void 0, );
  } else if (_index.match.call(void 0, _types.TokenType.string)) {
    _expression.parseExprAtom.call(void 0, );
  } else {
    _util.unexpected.call(void 0, );
  }

  if (_index.match.call(void 0, _types.TokenType.braceL)) {
    tsParseModuleBlock();
  } else {
    _util.semicolon.call(void 0, );
  }
}

 function tsParseImportEqualsDeclaration() {
  _lval.parseImportedIdentifier.call(void 0, );
  _util.expect.call(void 0, _types.TokenType.eq);
  tsParseModuleReference();
  _util.semicolon.call(void 0, );
} exports.tsParseImportEqualsDeclaration = tsParseImportEqualsDeclaration;

function tsIsExternalModuleReference() {
  return _util.isContextual.call(void 0, _keywords.ContextualKeyword._require) && _index.lookaheadType.call(void 0, ) === _types.TokenType.parenL;
}

function tsParseModuleReference() {
  if (tsIsExternalModuleReference()) {
    tsParseExternalModuleReference();
  } else {
    tsParseEntityName();
  }
}

function tsParseExternalModuleReference() {
  _util.expectContextual.call(void 0, _keywords.ContextualKeyword._require);
  _util.expect.call(void 0, _types.TokenType.parenL);
  if (!_index.match.call(void 0, _types.TokenType.string)) {
    _util.unexpected.call(void 0, );
  }
  _expression.parseLiteral.call(void 0, );
  _util.expect.call(void 0, _types.TokenType.parenR);
}

// Utilities

// Returns true if a statement matched.
function tsTryParseDeclare() {
  if (_util.isLineTerminator.call(void 0, )) {
    return false;
  }
  switch (_base.state.type) {
    case _types.TokenType._function: {
      const oldIsType = _index.pushTypeContext.call(void 0, 1);
      _index.next.call(void 0, );
      // We don't need to precisely get the function start here, since it's only used to mark
      // the function as a type if it's bodiless, and it's already a type here.
      const functionStart = _base.state.start;
      _statement.parseFunction.call(void 0, functionStart, /* isStatement */ true);
      _index.popTypeContext.call(void 0, oldIsType);
      return true;
    }
    case _types.TokenType._class: {
      const oldIsType = _index.pushTypeContext.call(void 0, 1);
      _statement.parseClass.call(void 0, /* isStatement */ true, /* optionalId */ false);
      _index.popTypeContext.call(void 0, oldIsType);
      return true;
    }
    case _types.TokenType._const: {
      if (_index.match.call(void 0, _types.TokenType._const) && _util.isLookaheadContextual.call(void 0, _keywords.ContextualKeyword._enum)) {
        const oldIsType = _index.pushTypeContext.call(void 0, 1);
        // `const enum = 0;` not allowed because "enum" is a strict mode reserved word.
        _util.expect.call(void 0, _types.TokenType._const);
        _util.expectContextual.call(void 0, _keywords.ContextualKeyword._enum);
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._enum;
        tsParseEnumDeclaration();
        _index.popTypeContext.call(void 0, oldIsType);
        return true;
      }
    }
    // falls through
    case _types.TokenType._var:
    case _types.TokenType._let: {
      const oldIsType = _index.pushTypeContext.call(void 0, 1);
      _statement.parseVarStatement.call(void 0, _base.state.type !== _types.TokenType._var);
      _index.popTypeContext.call(void 0, oldIsType);
      return true;
    }
    case _types.TokenType.name: {
      const oldIsType = _index.pushTypeContext.call(void 0, 1);
      const contextualKeyword = _base.state.contextualKeyword;
      let matched = false;
      if (contextualKeyword === _keywords.ContextualKeyword._global) {
        tsParseAmbientExternalModuleDeclaration();
        matched = true;
      } else {
        matched = tsParseDeclaration(contextualKeyword, /* isBeforeToken */ true);
      }
      _index.popTypeContext.call(void 0, oldIsType);
      return matched;
    }
    default:
      return false;
  }
}

// Note: this won't be called unless the keyword is allowed in `shouldParseExportDeclaration`.
// Returns true if it matched a declaration.
function tsTryParseExportDeclaration() {
  return tsParseDeclaration(_base.state.contextualKeyword, /* isBeforeToken */ true);
}

// Returns true if it matched a statement.
function tsParseExpressionStatement(contextualKeyword) {
  switch (contextualKeyword) {
    case _keywords.ContextualKeyword._declare: {
      const declareTokenIndex = _base.state.tokens.length - 1;
      const matched = tsTryParseDeclare();
      if (matched) {
        _base.state.tokens[declareTokenIndex].type = _types.TokenType._declare;
        return true;
      }
      break;
    }
    case _keywords.ContextualKeyword._global:
      // `global { }` (with no `declare`) may appear inside an ambient module declaration.
      // Would like to use tsParseAmbientExternalModuleDeclaration here, but already ran past "global".
      if (_index.match.call(void 0, _types.TokenType.braceL)) {
        tsParseModuleBlock();
        return true;
      }
      break;

    default:
      return tsParseDeclaration(contextualKeyword, /* isBeforeToken */ false);
  }
  return false;
}

/**
 * Common code for parsing a declaration.
 *
 * isBeforeToken indicates that the current parser state is at the contextual
 * keyword (and that it is not yet emitted) rather than reading the token after
 * it. When isBeforeToken is true, we may be preceded by an `export` token and
 * should include that token in a type context we create, e.g. to handle
 * `export interface` or `export type`. (This is a bit of a hack and should be
 * cleaned up at some point.)
 *
 * Returns true if it matched a declaration.
 */
function tsParseDeclaration(contextualKeyword, isBeforeToken) {
  switch (contextualKeyword) {
    case _keywords.ContextualKeyword._abstract:
      if (tsCheckLineTerminator(isBeforeToken) && _index.match.call(void 0, _types.TokenType._class)) {
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._abstract;
        _statement.parseClass.call(void 0, /* isStatement */ true, /* optionalId */ false);
        return true;
      }
      break;

    case _keywords.ContextualKeyword._enum:
      if (tsCheckLineTerminator(isBeforeToken) && _index.match.call(void 0, _types.TokenType.name)) {
        _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._enum;
        tsParseEnumDeclaration();
        return true;
      }
      break;

    case _keywords.ContextualKeyword._interface:
      if (tsCheckLineTerminator(isBeforeToken) && _index.match.call(void 0, _types.TokenType.name)) {
        // `next` is true in "export" and "declare" contexts, so we want to remove that token
        // as well.
        const oldIsType = _index.pushTypeContext.call(void 0, isBeforeToken ? 2 : 1);
        tsParseInterfaceDeclaration();
        _index.popTypeContext.call(void 0, oldIsType);
        return true;
      }
      break;

    case _keywords.ContextualKeyword._module:
      if (tsCheckLineTerminator(isBeforeToken)) {
        if (_index.match.call(void 0, _types.TokenType.string)) {
          const oldIsType = _index.pushTypeContext.call(void 0, isBeforeToken ? 2 : 1);
          tsParseAmbientExternalModuleDeclaration();
          _index.popTypeContext.call(void 0, oldIsType);
          return true;
        } else if (_index.match.call(void 0, _types.TokenType.name)) {
          const oldIsType = _index.pushTypeContext.call(void 0, isBeforeToken ? 2 : 1);
          tsParseModuleOrNamespaceDeclaration();
          _index.popTypeContext.call(void 0, oldIsType);
          return true;
        }
      }
      break;

    case _keywords.ContextualKeyword._namespace:
      if (tsCheckLineTerminator(isBeforeToken) && _index.match.call(void 0, _types.TokenType.name)) {
        const oldIsType = _index.pushTypeContext.call(void 0, isBeforeToken ? 2 : 1);
        tsParseModuleOrNamespaceDeclaration();
        _index.popTypeContext.call(void 0, oldIsType);
        return true;
      }
      break;

    case _keywords.ContextualKeyword._type:
      if (tsCheckLineTerminator(isBeforeToken) && _index.match.call(void 0, _types.TokenType.name)) {
        const oldIsType = _index.pushTypeContext.call(void 0, isBeforeToken ? 2 : 1);
        tsParseTypeAliasDeclaration();
        _index.popTypeContext.call(void 0, oldIsType);
        return true;
      }
      break;

    default:
      break;
  }
  return false;
}

function tsCheckLineTerminator(isBeforeToken) {
  if (isBeforeToken) {
    // Babel checks hasFollowingLineBreak here and returns false, but this
    // doesn't actually come up, e.g. `export interface` can never be on its own
    // line in valid code.
    _index.next.call(void 0, );
    return true;
  } else {
    return !_util.isLineTerminator.call(void 0, );
  }
}

// Returns true if there was a generic async arrow function.
function tsTryParseGenericAsyncArrowFunction() {
  const snapshot = _base.state.snapshot();

  tsParseTypeParameters();
  _statement.parseFunctionParams.call(void 0, );
  tsTryParseTypeOrTypePredicateAnnotation();
  _util.expect.call(void 0, _types.TokenType.arrow);

  if (_base.state.error) {
    _base.state.restoreFromSnapshot(snapshot);
    return false;
  }

  _expression.parseFunctionBody.call(void 0, true);
  return true;
}

/**
 * If necessary, hack the tokenizer state so that this bitshift was actually a
 * less-than token, then keep parsing. This should only be used in situations
 * where we restore from snapshot on error (which reverts this change) or
 * where bitshift would be illegal anyway (e.g. in a class "extends" clause).
 *
 * This hack is useful to handle situations like foo<<T>() => void>() where
 * there can legitimately be two open-angle-brackets in a row in TS.
 */
function tsParseTypeArgumentsWithPossibleBitshift() {
  if (_base.state.type === _types.TokenType.bitShiftL) {
    _base.state.pos -= 1;
    _index.finishToken.call(void 0, _types.TokenType.lessThan);
  }
  tsParseTypeArguments();
}

function tsParseTypeArguments() {
  const oldIsType = _index.pushTypeContext.call(void 0, 0);
  _util.expect.call(void 0, _types.TokenType.lessThan);
  while (!_index.eat.call(void 0, _types.TokenType.greaterThan) && !_base.state.error) {
    tsParseType();
    _index.eat.call(void 0, _types.TokenType.comma);
  }
  _index.popTypeContext.call(void 0, oldIsType);
}

 function tsIsDeclarationStart() {
  if (_index.match.call(void 0, _types.TokenType.name)) {
    switch (_base.state.contextualKeyword) {
      case _keywords.ContextualKeyword._abstract:
      case _keywords.ContextualKeyword._declare:
      case _keywords.ContextualKeyword._enum:
      case _keywords.ContextualKeyword._interface:
      case _keywords.ContextualKeyword._module:
      case _keywords.ContextualKeyword._namespace:
      case _keywords.ContextualKeyword._type:
        return true;
      default:
        break;
    }
  }

  return false;
} exports.tsIsDeclarationStart = tsIsDeclarationStart;

// ======================================================
// OVERRIDES
// ======================================================

 function tsParseFunctionBodyAndFinish(functionStart, funcContextId) {
  // For arrow functions, `parseArrow` handles the return type itself.
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    tsParseTypeOrTypePredicateAnnotation(_types.TokenType.colon);
  }

  // The original code checked the node type to make sure this function type allows a missing
  // body, but we skip that to avoid sending around the node type. We instead just use the
  // allowExpressionBody boolean to make sure it's not an arrow function.
  if (!_index.match.call(void 0, _types.TokenType.braceL) && _util.isLineTerminator.call(void 0, )) {
    // Retroactively mark the function declaration as a type.
    let i = _base.state.tokens.length - 1;
    while (
      i >= 0 &&
      (_base.state.tokens[i].start >= functionStart ||
        _base.state.tokens[i].type === _types.TokenType._default ||
        _base.state.tokens[i].type === _types.TokenType._export)
    ) {
      _base.state.tokens[i].isType = true;
      i--;
    }
    return;
  }

  _expression.parseFunctionBody.call(void 0, false, funcContextId);
} exports.tsParseFunctionBodyAndFinish = tsParseFunctionBodyAndFinish;

 function tsParseSubscript(
  startTokenIndex,
  noCalls,
  stopState,
) {
  if (!_util.hasPrecedingLineBreak.call(void 0, ) && _index.eat.call(void 0, _types.TokenType.bang)) {
    _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType.nonNullAssertion;
    return;
  }

  if (_index.match.call(void 0, _types.TokenType.lessThan) || _index.match.call(void 0, _types.TokenType.bitShiftL)) {
    // There are number of things we are going to "maybe" parse, like type arguments on
    // tagged template expressions. If any of them fail, walk it back and continue.
    const snapshot = _base.state.snapshot();

    if (!noCalls && _expression.atPossibleAsync.call(void 0, )) {
      // Almost certainly this is a generic async function `async <T>() => ...
      // But it might be a call with a type argument `async<T>();`
      const asyncArrowFn = tsTryParseGenericAsyncArrowFunction();
      if (asyncArrowFn) {
        return;
      }
    }
    tsParseTypeArgumentsWithPossibleBitshift();
    if (!noCalls && _index.eat.call(void 0, _types.TokenType.parenL)) {
      // With f<T>(), the subscriptStartIndex marker is on the ( token.
      _base.state.tokens[_base.state.tokens.length - 1].subscriptStartIndex = startTokenIndex;
      _expression.parseCallExpressionArguments.call(void 0, );
    } else if (_index.match.call(void 0, _types.TokenType.backQuote)) {
      // Tagged template with a type argument.
      _expression.parseTemplate.call(void 0, );
    } else if (
      // The remaining possible case is an instantiation expression, e.g.
      // Array<number> . Check for a few cases that would disqualify it and
      // cause us to bail out.
      // a<b>>c is not (a<b>)>c, but a<(b>>c)
      _base.state.type === _types.TokenType.greaterThan ||
      // a<b>c is (a<b)>c
      (_base.state.type !== _types.TokenType.parenL &&
        Boolean(_base.state.type & _types.TokenType.IS_EXPRESSION_START) &&
        !_util.hasPrecedingLineBreak.call(void 0, ))
    ) {
      // Bail out. We have something like a<b>c, which is not an expression with
      // type arguments but an (a < b) > c comparison.
      _util.unexpected.call(void 0, );
    }

    if (_base.state.error) {
      _base.state.restoreFromSnapshot(snapshot);
    } else {
      return;
    }
  } else if (!noCalls && _index.match.call(void 0, _types.TokenType.questionDot) && _index.lookaheadType.call(void 0, ) === _types.TokenType.lessThan) {
    // If we see f?.<, then this must be an optional call with a type argument.
    _index.next.call(void 0, );
    _base.state.tokens[startTokenIndex].isOptionalChainStart = true;
    // With f?.<T>(), the subscriptStartIndex marker is on the ?. token.
    _base.state.tokens[_base.state.tokens.length - 1].subscriptStartIndex = startTokenIndex;

    tsParseTypeArguments();
    _util.expect.call(void 0, _types.TokenType.parenL);
    _expression.parseCallExpressionArguments.call(void 0, );
  }
  _expression.baseParseSubscript.call(void 0, startTokenIndex, noCalls, stopState);
} exports.tsParseSubscript = tsParseSubscript;

 function tsTryParseExport() {
  if (_index.eat.call(void 0, _types.TokenType._import)) {
    // One of these cases:
    // export import A = B;
    // export import type A = require("A");
    if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._type) && _index.lookaheadType.call(void 0, ) !== _types.TokenType.eq) {
      // Eat a `type` token, unless it's actually an identifier name.
      _util.expectContextual.call(void 0, _keywords.ContextualKeyword._type);
    }
    tsParseImportEqualsDeclaration();
    return true;
  } else if (_index.eat.call(void 0, _types.TokenType.eq)) {
    // `export = x;`
    _expression.parseExpression.call(void 0, );
    _util.semicolon.call(void 0, );
    return true;
  } else if (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._as)) {
    // `export as namespace A;`
    // See `parseNamespaceExportDeclaration` in TypeScript's own parser
    _util.expectContextual.call(void 0, _keywords.ContextualKeyword._namespace);
    _expression.parseIdentifier.call(void 0, );
    _util.semicolon.call(void 0, );
    return true;
  } else {
    if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._type)) {
      const nextType = _index.lookaheadType.call(void 0, );
      // export type {foo} from 'a';
      // export type * from 'a';'
      // export type * as ns from 'a';'
      if (nextType === _types.TokenType.braceL || nextType === _types.TokenType.star) {
        _index.next.call(void 0, );
      }
    }
    return false;
  }
} exports.tsTryParseExport = tsTryParseExport;

/**
 * Parse a TS import specifier, which may be prefixed with "type" and may be of
 * the form `foo as bar`.
 *
 * The number of identifier-like tokens we see happens to be enough to uniquely
 * identify the form, so simply count the number of identifiers rather than
 * matching the words `type` or `as`. This is particularly important because
 * `type` and `as` could each actually be plain identifiers rather than
 * keywords.
 */
 function tsParseImportSpecifier() {
  _expression.parseIdentifier.call(void 0, );
  if (_index.match.call(void 0, _types.TokenType.comma) || _index.match.call(void 0, _types.TokenType.braceR)) {
    // import {foo}
    _base.state.tokens[_base.state.tokens.length - 1].identifierRole = _index.IdentifierRole.ImportDeclaration;
    return;
  }
  _expression.parseIdentifier.call(void 0, );
  if (_index.match.call(void 0, _types.TokenType.comma) || _index.match.call(void 0, _types.TokenType.braceR)) {
    // import {type foo}
    _base.state.tokens[_base.state.tokens.length - 1].identifierRole = _index.IdentifierRole.ImportDeclaration;
    _base.state.tokens[_base.state.tokens.length - 2].isType = true;
    _base.state.tokens[_base.state.tokens.length - 1].isType = true;
    return;
  }
  _expression.parseIdentifier.call(void 0, );
  if (_index.match.call(void 0, _types.TokenType.comma) || _index.match.call(void 0, _types.TokenType.braceR)) {
    // import {foo as bar}
    _base.state.tokens[_base.state.tokens.length - 3].identifierRole = _index.IdentifierRole.ImportAccess;
    _base.state.tokens[_base.state.tokens.length - 1].identifierRole = _index.IdentifierRole.ImportDeclaration;
    return;
  }
  _expression.parseIdentifier.call(void 0, );
  // import {type foo as bar}
  _base.state.tokens[_base.state.tokens.length - 3].identifierRole = _index.IdentifierRole.ImportAccess;
  _base.state.tokens[_base.state.tokens.length - 1].identifierRole = _index.IdentifierRole.ImportDeclaration;
  _base.state.tokens[_base.state.tokens.length - 4].isType = true;
  _base.state.tokens[_base.state.tokens.length - 3].isType = true;
  _base.state.tokens[_base.state.tokens.length - 2].isType = true;
  _base.state.tokens[_base.state.tokens.length - 1].isType = true;
} exports.tsParseImportSpecifier = tsParseImportSpecifier;

/**
 * Just like named import specifiers, export specifiers can have from 1 to 4
 * tokens, inclusive, and the number of tokens determines the role of each token.
 */
 function tsParseExportSpecifier() {
  _expression.parseIdentifier.call(void 0, );
  if (_index.match.call(void 0, _types.TokenType.comma) || _index.match.call(void 0, _types.TokenType.braceR)) {
    // export {foo}
    _base.state.tokens[_base.state.tokens.length - 1].identifierRole = _index.IdentifierRole.ExportAccess;
    return;
  }
  _expression.parseIdentifier.call(void 0, );
  if (_index.match.call(void 0, _types.TokenType.comma) || _index.match.call(void 0, _types.TokenType.braceR)) {
    // export {type foo}
    _base.state.tokens[_base.state.tokens.length - 1].identifierRole = _index.IdentifierRole.ExportAccess;
    _base.state.tokens[_base.state.tokens.length - 2].isType = true;
    _base.state.tokens[_base.state.tokens.length - 1].isType = true;
    return;
  }
  _expression.parseIdentifier.call(void 0, );
  if (_index.match.call(void 0, _types.TokenType.comma) || _index.match.call(void 0, _types.TokenType.braceR)) {
    // export {foo as bar}
    _base.state.tokens[_base.state.tokens.length - 3].identifierRole = _index.IdentifierRole.ExportAccess;
    return;
  }
  _expression.parseIdentifier.call(void 0, );
  // export {type foo as bar}
  _base.state.tokens[_base.state.tokens.length - 3].identifierRole = _index.IdentifierRole.ExportAccess;
  _base.state.tokens[_base.state.tokens.length - 4].isType = true;
  _base.state.tokens[_base.state.tokens.length - 3].isType = true;
  _base.state.tokens[_base.state.tokens.length - 2].isType = true;
  _base.state.tokens[_base.state.tokens.length - 1].isType = true;
} exports.tsParseExportSpecifier = tsParseExportSpecifier;

 function tsTryParseExportDefaultExpression() {
  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._abstract) && _index.lookaheadType.call(void 0, ) === _types.TokenType._class) {
    _base.state.type = _types.TokenType._abstract;
    _index.next.call(void 0, ); // Skip "abstract"
    _statement.parseClass.call(void 0, true, true);
    return true;
  }
  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._interface)) {
    // Make sure "export default" are considered type tokens so the whole thing is removed.
    const oldIsType = _index.pushTypeContext.call(void 0, 2);
    tsParseDeclaration(_keywords.ContextualKeyword._interface, true);
    _index.popTypeContext.call(void 0, oldIsType);
    return true;
  }
  return false;
} exports.tsTryParseExportDefaultExpression = tsTryParseExportDefaultExpression;

 function tsTryParseStatementContent() {
  if (_base.state.type === _types.TokenType._const) {
    const ahead = _index.lookaheadTypeAndKeyword.call(void 0, );
    if (ahead.type === _types.TokenType.name && ahead.contextualKeyword === _keywords.ContextualKeyword._enum) {
      _util.expect.call(void 0, _types.TokenType._const);
      _util.expectContextual.call(void 0, _keywords.ContextualKeyword._enum);
      _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._enum;
      tsParseEnumDeclaration();
      return true;
    }
  }
  return false;
} exports.tsTryParseStatementContent = tsTryParseStatementContent;

 function tsTryParseClassMemberWithIsStatic(isStatic) {
  const memberStartIndexAfterStatic = _base.state.tokens.length;
  tsParseModifiers([
    _keywords.ContextualKeyword._abstract,
    _keywords.ContextualKeyword._readonly,
    _keywords.ContextualKeyword._declare,
    _keywords.ContextualKeyword._static,
    _keywords.ContextualKeyword._override,
  ]);

  const modifiersEndIndex = _base.state.tokens.length;
  const found = tsTryParseIndexSignature();
  if (found) {
    // Index signatures are type declarations, so set the modifier tokens as
    // type tokens. Most tokens could be assumed to be type tokens, but `static`
    // is ambiguous unless we set it explicitly here.
    const memberStartIndex = isStatic
      ? memberStartIndexAfterStatic - 1
      : memberStartIndexAfterStatic;
    for (let i = memberStartIndex; i < modifiersEndIndex; i++) {
      _base.state.tokens[i].isType = true;
    }
    return true;
  }
  return false;
} exports.tsTryParseClassMemberWithIsStatic = tsTryParseClassMemberWithIsStatic;

// Note: The reason we do this in `parseIdentifierStatement` and not `parseStatement`
// is that e.g. `type()` is valid JS, so we must try parsing that first.
// If it's really a type, we will parse `type` as the statement, and can correct it here
// by parsing the rest.
 function tsParseIdentifierStatement(contextualKeyword) {
  const matched = tsParseExpressionStatement(contextualKeyword);
  if (!matched) {
    _util.semicolon.call(void 0, );
  }
} exports.tsParseIdentifierStatement = tsParseIdentifierStatement;

 function tsParseExportDeclaration() {
  // "export declare" is equivalent to just "export".
  const isDeclare = _util.eatContextual.call(void 0, _keywords.ContextualKeyword._declare);
  if (isDeclare) {
    _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._declare;
  }

  let matchedDeclaration = false;
  if (_index.match.call(void 0, _types.TokenType.name)) {
    if (isDeclare) {
      const oldIsType = _index.pushTypeContext.call(void 0, 2);
      matchedDeclaration = tsTryParseExportDeclaration();
      _index.popTypeContext.call(void 0, oldIsType);
    } else {
      matchedDeclaration = tsTryParseExportDeclaration();
    }
  }
  if (!matchedDeclaration) {
    if (isDeclare) {
      const oldIsType = _index.pushTypeContext.call(void 0, 2);
      _statement.parseStatement.call(void 0, true);
      _index.popTypeContext.call(void 0, oldIsType);
    } else {
      _statement.parseStatement.call(void 0, true);
    }
  }
} exports.tsParseExportDeclaration = tsParseExportDeclaration;

 function tsAfterParseClassSuper(hasSuper) {
  if (hasSuper && (_index.match.call(void 0, _types.TokenType.lessThan) || _index.match.call(void 0, _types.TokenType.bitShiftL))) {
    tsParseTypeArgumentsWithPossibleBitshift();
  }
  if (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._implements)) {
    _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._implements;
    const oldIsType = _index.pushTypeContext.call(void 0, 1);
    tsParseHeritageClause();
    _index.popTypeContext.call(void 0, oldIsType);
  }
} exports.tsAfterParseClassSuper = tsAfterParseClassSuper;

 function tsStartParseObjPropValue() {
  tsTryParseTypeParameters();
} exports.tsStartParseObjPropValue = tsStartParseObjPropValue;

 function tsStartParseFunctionParams() {
  tsTryParseTypeParameters();
} exports.tsStartParseFunctionParams = tsStartParseFunctionParams;

// `let x: number;`
 function tsAfterParseVarHead() {
  const oldIsType = _index.pushTypeContext.call(void 0, 0);
  if (!_util.hasPrecedingLineBreak.call(void 0, )) {
    _index.eat.call(void 0, _types.TokenType.bang);
  }
  tsTryParseTypeAnnotation();
  _index.popTypeContext.call(void 0, oldIsType);
} exports.tsAfterParseVarHead = tsAfterParseVarHead;

// parse the return type of an async arrow function - let foo = (async (): number => {});
 function tsStartParseAsyncArrowFromCallExpression() {
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    tsParseTypeAnnotation();
  }
} exports.tsStartParseAsyncArrowFromCallExpression = tsStartParseAsyncArrowFromCallExpression;

// Returns true if the expression was an arrow function.
 function tsParseMaybeAssign(noIn, isWithinParens) {
  // Note: When the JSX plugin is on, type assertions (`<T> x`) aren't valid syntax.
  if (_base.isJSXEnabled) {
    return tsParseMaybeAssignWithJSX(noIn, isWithinParens);
  } else {
    return tsParseMaybeAssignWithoutJSX(noIn, isWithinParens);
  }
} exports.tsParseMaybeAssign = tsParseMaybeAssign;

 function tsParseMaybeAssignWithJSX(noIn, isWithinParens) {
  if (!_index.match.call(void 0, _types.TokenType.lessThan)) {
    return _expression.baseParseMaybeAssign.call(void 0, noIn, isWithinParens);
  }

  // Prefer to parse JSX if possible. But may be an arrow fn.
  const snapshot = _base.state.snapshot();
  let wasArrow = _expression.baseParseMaybeAssign.call(void 0, noIn, isWithinParens);
  if (_base.state.error) {
    _base.state.restoreFromSnapshot(snapshot);
  } else {
    return wasArrow;
  }

  // Otherwise, try as type-parameterized arrow function.
  _base.state.type = _types.TokenType.typeParameterStart;
  // This is similar to TypeScript's `tryParseParenthesizedArrowFunctionExpression`.
  tsParseTypeParameters();
  wasArrow = _expression.baseParseMaybeAssign.call(void 0, noIn, isWithinParens);
  if (!wasArrow) {
    _util.unexpected.call(void 0, );
  }

  return wasArrow;
} exports.tsParseMaybeAssignWithJSX = tsParseMaybeAssignWithJSX;

 function tsParseMaybeAssignWithoutJSX(noIn, isWithinParens) {
  if (!_index.match.call(void 0, _types.TokenType.lessThan)) {
    return _expression.baseParseMaybeAssign.call(void 0, noIn, isWithinParens);
  }

  const snapshot = _base.state.snapshot();
  // This is similar to TypeScript's `tryParseParenthesizedArrowFunctionExpression`.
  tsParseTypeParameters();
  const wasArrow = _expression.baseParseMaybeAssign.call(void 0, noIn, isWithinParens);
  if (!wasArrow) {
    _util.unexpected.call(void 0, );
  }
  if (_base.state.error) {
    _base.state.restoreFromSnapshot(snapshot);
  } else {
    return wasArrow;
  }

  // Try parsing a type cast instead of an arrow function.
  // This will start with a type assertion (via parseMaybeUnary).
  // But don't directly call `tsParseTypeAssertion` because we want to handle any binary after it.
  return _expression.baseParseMaybeAssign.call(void 0, noIn, isWithinParens);
} exports.tsParseMaybeAssignWithoutJSX = tsParseMaybeAssignWithoutJSX;

 function tsParseArrow() {
  if (_index.match.call(void 0, _types.TokenType.colon)) {
    // This is different from how the TS parser does it.
    // TS uses lookahead. Babylon parses it as a parenthesized expression and converts.
    const snapshot = _base.state.snapshot();

    tsParseTypeOrTypePredicateAnnotation(_types.TokenType.colon);
    if (_util.canInsertSemicolon.call(void 0, )) _util.unexpected.call(void 0, );
    if (!_index.match.call(void 0, _types.TokenType.arrow)) _util.unexpected.call(void 0, );

    if (_base.state.error) {
      _base.state.restoreFromSnapshot(snapshot);
    }
  }
  return _index.eat.call(void 0, _types.TokenType.arrow);
} exports.tsParseArrow = tsParseArrow;

// Allow type annotations inside of a parameter list.
 function tsParseAssignableListItemTypes() {
  const oldIsType = _index.pushTypeContext.call(void 0, 0);
  _index.eat.call(void 0, _types.TokenType.question);
  tsTryParseTypeAnnotation();
  _index.popTypeContext.call(void 0, oldIsType);
} exports.tsParseAssignableListItemTypes = tsParseAssignableListItemTypes;

 function tsParseMaybeDecoratorArguments() {
  if (_index.match.call(void 0, _types.TokenType.lessThan) || _index.match.call(void 0, _types.TokenType.bitShiftL)) {
    tsParseTypeArgumentsWithPossibleBitshift();
  }
  _statement.baseParseMaybeDecoratorArguments.call(void 0, );
} exports.tsParseMaybeDecoratorArguments = tsParseMaybeDecoratorArguments;


/***/ }),

/***/ 2297:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }/* eslint max-len: 0 */

var _base = __webpack_require__(8022);
var _util = __webpack_require__(8958);
var _charcodes = __webpack_require__(1537);
var _identifier = __webpack_require__(905);
var _whitespace = __webpack_require__(317);
var _keywords = __webpack_require__(3464);
var _readWord = __webpack_require__(5428); var _readWord2 = _interopRequireDefault(_readWord);
var _types = __webpack_require__(798);

var IdentifierRole; (function (IdentifierRole) {
  const Access = 0; IdentifierRole[IdentifierRole["Access"] = Access] = "Access";
  const ExportAccess = Access + 1; IdentifierRole[IdentifierRole["ExportAccess"] = ExportAccess] = "ExportAccess";
  const TopLevelDeclaration = ExportAccess + 1; IdentifierRole[IdentifierRole["TopLevelDeclaration"] = TopLevelDeclaration] = "TopLevelDeclaration";
  const FunctionScopedDeclaration = TopLevelDeclaration + 1; IdentifierRole[IdentifierRole["FunctionScopedDeclaration"] = FunctionScopedDeclaration] = "FunctionScopedDeclaration";
  const BlockScopedDeclaration = FunctionScopedDeclaration + 1; IdentifierRole[IdentifierRole["BlockScopedDeclaration"] = BlockScopedDeclaration] = "BlockScopedDeclaration";
  const ObjectShorthandTopLevelDeclaration = BlockScopedDeclaration + 1; IdentifierRole[IdentifierRole["ObjectShorthandTopLevelDeclaration"] = ObjectShorthandTopLevelDeclaration] = "ObjectShorthandTopLevelDeclaration";
  const ObjectShorthandFunctionScopedDeclaration = ObjectShorthandTopLevelDeclaration + 1; IdentifierRole[IdentifierRole["ObjectShorthandFunctionScopedDeclaration"] = ObjectShorthandFunctionScopedDeclaration] = "ObjectShorthandFunctionScopedDeclaration";
  const ObjectShorthandBlockScopedDeclaration = ObjectShorthandFunctionScopedDeclaration + 1; IdentifierRole[IdentifierRole["ObjectShorthandBlockScopedDeclaration"] = ObjectShorthandBlockScopedDeclaration] = "ObjectShorthandBlockScopedDeclaration";
  const ObjectShorthand = ObjectShorthandBlockScopedDeclaration + 1; IdentifierRole[IdentifierRole["ObjectShorthand"] = ObjectShorthand] = "ObjectShorthand";
  // Any identifier bound in an import statement, e.g. both A and b from
  // `import A, * as b from 'A';`
  const ImportDeclaration = ObjectShorthand + 1; IdentifierRole[IdentifierRole["ImportDeclaration"] = ImportDeclaration] = "ImportDeclaration";
  const ObjectKey = ImportDeclaration + 1; IdentifierRole[IdentifierRole["ObjectKey"] = ObjectKey] = "ObjectKey";
  // The `foo` in `import {foo as bar} from "./abc";`.
  const ImportAccess = ObjectKey + 1; IdentifierRole[IdentifierRole["ImportAccess"] = ImportAccess] = "ImportAccess";
})(IdentifierRole || (exports.IdentifierRole = IdentifierRole = {}));

/**
 * Extra information on jsxTagStart tokens, used to determine which of the three
 * jsx functions are called in the automatic transform.
 */
var JSXRole; (function (JSXRole) {
  // The element is self-closing or has a body that resolves to empty. We
  // shouldn't emit children at all in this case.
  const NoChildren = 0; JSXRole[JSXRole["NoChildren"] = NoChildren] = "NoChildren";
  // The element has a single explicit child, which might still be an arbitrary
  // expression like an array. We should emit that expression as the children.
  const OneChild = NoChildren + 1; JSXRole[JSXRole["OneChild"] = OneChild] = "OneChild";
  // The element has at least two explicitly-specified children or has spread
  // children, so child positions are assumed to be "static". We should wrap
  // these children in an array.
  const StaticChildren = OneChild + 1; JSXRole[JSXRole["StaticChildren"] = StaticChildren] = "StaticChildren";
  // The element has a prop named "key" after a prop spread, so we should fall
  // back to the createElement function.
  const KeyAfterPropSpread = StaticChildren + 1; JSXRole[JSXRole["KeyAfterPropSpread"] = KeyAfterPropSpread] = "KeyAfterPropSpread";
})(JSXRole || (exports.JSXRole = JSXRole = {}));

 function isDeclaration(token) {
  const role = token.identifierRole;
  return (
    role === IdentifierRole.TopLevelDeclaration ||
    role === IdentifierRole.FunctionScopedDeclaration ||
    role === IdentifierRole.BlockScopedDeclaration ||
    role === IdentifierRole.ObjectShorthandTopLevelDeclaration ||
    role === IdentifierRole.ObjectShorthandFunctionScopedDeclaration ||
    role === IdentifierRole.ObjectShorthandBlockScopedDeclaration
  );
} exports.isDeclaration = isDeclaration;

 function isNonTopLevelDeclaration(token) {
  const role = token.identifierRole;
  return (
    role === IdentifierRole.FunctionScopedDeclaration ||
    role === IdentifierRole.BlockScopedDeclaration ||
    role === IdentifierRole.ObjectShorthandFunctionScopedDeclaration ||
    role === IdentifierRole.ObjectShorthandBlockScopedDeclaration
  );
} exports.isNonTopLevelDeclaration = isNonTopLevelDeclaration;

 function isTopLevelDeclaration(token) {
  const role = token.identifierRole;
  return (
    role === IdentifierRole.TopLevelDeclaration ||
    role === IdentifierRole.ObjectShorthandTopLevelDeclaration ||
    role === IdentifierRole.ImportDeclaration
  );
} exports.isTopLevelDeclaration = isTopLevelDeclaration;

 function isBlockScopedDeclaration(token) {
  const role = token.identifierRole;
  // Treat top-level declarations as block scope since the distinction doesn't matter here.
  return (
    role === IdentifierRole.TopLevelDeclaration ||
    role === IdentifierRole.BlockScopedDeclaration ||
    role === IdentifierRole.ObjectShorthandTopLevelDeclaration ||
    role === IdentifierRole.ObjectShorthandBlockScopedDeclaration
  );
} exports.isBlockScopedDeclaration = isBlockScopedDeclaration;

 function isFunctionScopedDeclaration(token) {
  const role = token.identifierRole;
  return (
    role === IdentifierRole.FunctionScopedDeclaration ||
    role === IdentifierRole.ObjectShorthandFunctionScopedDeclaration
  );
} exports.isFunctionScopedDeclaration = isFunctionScopedDeclaration;

 function isObjectShorthandDeclaration(token) {
  return (
    token.identifierRole === IdentifierRole.ObjectShorthandTopLevelDeclaration ||
    token.identifierRole === IdentifierRole.ObjectShorthandBlockScopedDeclaration ||
    token.identifierRole === IdentifierRole.ObjectShorthandFunctionScopedDeclaration
  );
} exports.isObjectShorthandDeclaration = isObjectShorthandDeclaration;

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.
 class Token {
  constructor() {
    this.type = _base.state.type;
    this.contextualKeyword = _base.state.contextualKeyword;
    this.start = _base.state.start;
    this.end = _base.state.end;
    this.scopeDepth = _base.state.scopeDepth;
    this.isType = _base.state.isType;
    this.identifierRole = null;
    this.jsxRole = null;
    this.shadowsGlobal = false;
    this.isAsyncOperation = false;
    this.contextId = null;
    this.rhsEndIndex = null;
    this.isExpression = false;
    this.numNullishCoalesceStarts = 0;
    this.numNullishCoalesceEnds = 0;
    this.isOptionalChainStart = false;
    this.isOptionalChainEnd = false;
    this.subscriptStartIndex = null;
    this.nullishStartIndex = null;
  }

  
  
  
  
  
  
  
  
  // Initially false for all tokens, then may be computed in a follow-up step that does scope
  // analysis.
  
  // Initially false for all tokens, but may be set during transform to mark it as containing an
  // await operation.
  
  
  // For assignments, the index of the RHS. For export tokens, the end of the export.
  
  // For class tokens, records if the class is a class expression or a class statement.
  
  // Number of times to insert a `nullishCoalesce(` snippet before this token.
  
  // Number of times to insert a `)` snippet after this token.
  
  // If true, insert an `optionalChain([` snippet before this token.
  
  // If true, insert a `])` snippet after this token.
  
  // Tag for `.`, `?.`, `[`, `?.[`, `(`, and `?.(` to denote the "root" token for this
  // subscript chain. This can be used to determine if this chain is an optional chain.
  
  // Tag for `??` operators to denote the root token for this nullish coalescing call.
  
} exports.Token = Token;

// ## Tokenizer

// Move to the next token
 function next() {
  _base.state.tokens.push(new Token());
  nextToken();
} exports.next = next;

// Call instead of next when inside a template, since that needs to be handled differently.
 function nextTemplateToken() {
  _base.state.tokens.push(new Token());
  _base.state.start = _base.state.pos;
  readTmplToken();
} exports.nextTemplateToken = nextTemplateToken;

// The tokenizer never parses regexes by default. Instead, the parser is responsible for
// instructing it to parse a regex when we see a slash at the start of an expression.
 function retokenizeSlashAsRegex() {
  if (_base.state.type === _types.TokenType.assign) {
    --_base.state.pos;
  }
  readRegexp();
} exports.retokenizeSlashAsRegex = retokenizeSlashAsRegex;

 function pushTypeContext(existingTokensInType) {
  for (let i = _base.state.tokens.length - existingTokensInType; i < _base.state.tokens.length; i++) {
    _base.state.tokens[i].isType = true;
  }
  const oldIsType = _base.state.isType;
  _base.state.isType = true;
  return oldIsType;
} exports.pushTypeContext = pushTypeContext;

 function popTypeContext(oldIsType) {
  _base.state.isType = oldIsType;
} exports.popTypeContext = popTypeContext;

 function eat(type) {
  if (match(type)) {
    next();
    return true;
  } else {
    return false;
  }
} exports.eat = eat;

 function eatTypeToken(tokenType) {
  const oldIsType = _base.state.isType;
  _base.state.isType = true;
  eat(tokenType);
  _base.state.isType = oldIsType;
} exports.eatTypeToken = eatTypeToken;

 function match(type) {
  return _base.state.type === type;
} exports.match = match;

 function lookaheadType() {
  const snapshot = _base.state.snapshot();
  next();
  const type = _base.state.type;
  _base.state.restoreFromSnapshot(snapshot);
  return type;
} exports.lookaheadType = lookaheadType;

 class TypeAndKeyword {
  
  
  constructor(type, contextualKeyword) {
    this.type = type;
    this.contextualKeyword = contextualKeyword;
  }
} exports.TypeAndKeyword = TypeAndKeyword;

 function lookaheadTypeAndKeyword() {
  const snapshot = _base.state.snapshot();
  next();
  const type = _base.state.type;
  const contextualKeyword = _base.state.contextualKeyword;
  _base.state.restoreFromSnapshot(snapshot);
  return new TypeAndKeyword(type, contextualKeyword);
} exports.lookaheadTypeAndKeyword = lookaheadTypeAndKeyword;

 function nextTokenStart() {
  return nextTokenStartSince(_base.state.pos);
} exports.nextTokenStart = nextTokenStart;

 function nextTokenStartSince(pos) {
  _whitespace.skipWhiteSpace.lastIndex = pos;
  const skip = _whitespace.skipWhiteSpace.exec(_base.input);
  return pos + skip[0].length;
} exports.nextTokenStartSince = nextTokenStartSince;

 function lookaheadCharCode() {
  return _base.input.charCodeAt(nextTokenStart());
} exports.lookaheadCharCode = lookaheadCharCode;

// Read a single token, updating the parser object's token-related
// properties.
 function nextToken() {
  skipSpace();
  _base.state.start = _base.state.pos;
  if (_base.state.pos >= _base.input.length) {
    const tokens = _base.state.tokens;
    // We normally run past the end a bit, but if we're way past the end, avoid an infinite loop.
    // Also check the token positions rather than the types since sometimes we rewrite the token
    // type to something else.
    if (
      tokens.length >= 2 &&
      tokens[tokens.length - 1].start >= _base.input.length &&
      tokens[tokens.length - 2].start >= _base.input.length
    ) {
      _util.unexpected.call(void 0, "Unexpectedly reached the end of input.");
    }
    finishToken(_types.TokenType.eof);
    return;
  }
  readToken(_base.input.charCodeAt(_base.state.pos));
} exports.nextToken = nextToken;

function readToken(code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (
    _identifier.IS_IDENTIFIER_START[code] ||
    code === _charcodes.charCodes.backslash ||
    (code === _charcodes.charCodes.atSign && _base.input.charCodeAt(_base.state.pos + 1) === _charcodes.charCodes.atSign)
  ) {
    _readWord2.default.call(void 0, );
  } else {
    getTokenFromCode(code);
  }
}

function skipBlockComment() {
  while (
    _base.input.charCodeAt(_base.state.pos) !== _charcodes.charCodes.asterisk ||
    _base.input.charCodeAt(_base.state.pos + 1) !== _charcodes.charCodes.slash
  ) {
    _base.state.pos++;
    if (_base.state.pos > _base.input.length) {
      _util.unexpected.call(void 0, "Unterminated comment", _base.state.pos - 2);
      return;
    }
  }
  _base.state.pos += 2;
}

 function skipLineComment(startSkip) {
  let ch = _base.input.charCodeAt((_base.state.pos += startSkip));
  if (_base.state.pos < _base.input.length) {
    while (
      ch !== _charcodes.charCodes.lineFeed &&
      ch !== _charcodes.charCodes.carriageReturn &&
      ch !== _charcodes.charCodes.lineSeparator &&
      ch !== _charcodes.charCodes.paragraphSeparator &&
      ++_base.state.pos < _base.input.length
    ) {
      ch = _base.input.charCodeAt(_base.state.pos);
    }
  }
} exports.skipLineComment = skipLineComment;

// Called at the start of the parse and after every token. Skips
// whitespace and comments.
 function skipSpace() {
  while (_base.state.pos < _base.input.length) {
    const ch = _base.input.charCodeAt(_base.state.pos);
    switch (ch) {
      case _charcodes.charCodes.carriageReturn:
        if (_base.input.charCodeAt(_base.state.pos + 1) === _charcodes.charCodes.lineFeed) {
          ++_base.state.pos;
        }

      case _charcodes.charCodes.lineFeed:
      case _charcodes.charCodes.lineSeparator:
      case _charcodes.charCodes.paragraphSeparator:
        ++_base.state.pos;
        break;

      case _charcodes.charCodes.slash:
        switch (_base.input.charCodeAt(_base.state.pos + 1)) {
          case _charcodes.charCodes.asterisk:
            _base.state.pos += 2;
            skipBlockComment();
            break;

          case _charcodes.charCodes.slash:
            skipLineComment(2);
            break;

          default:
            return;
        }
        break;

      default:
        if (_whitespace.IS_WHITESPACE[ch]) {
          ++_base.state.pos;
        } else {
          return;
        }
    }
  }
} exports.skipSpace = skipSpace;

// Called at the end of every token. Sets various fields, and skips the space after the token, so
// that the next one's `start` will point at the right position.
 function finishToken(
  type,
  contextualKeyword = _keywords.ContextualKeyword.NONE,
) {
  _base.state.end = _base.state.pos;
  _base.state.type = type;
  _base.state.contextualKeyword = contextualKeyword;
} exports.finishToken = finishToken;

// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
function readToken_dot() {
  const nextChar = _base.input.charCodeAt(_base.state.pos + 1);
  if (nextChar >= _charcodes.charCodes.digit0 && nextChar <= _charcodes.charCodes.digit9) {
    readNumber(true);
    return;
  }

  if (nextChar === _charcodes.charCodes.dot && _base.input.charCodeAt(_base.state.pos + 2) === _charcodes.charCodes.dot) {
    _base.state.pos += 3;
    finishToken(_types.TokenType.ellipsis);
  } else {
    ++_base.state.pos;
    finishToken(_types.TokenType.dot);
  }
}

function readToken_slash() {
  const nextChar = _base.input.charCodeAt(_base.state.pos + 1);
  if (nextChar === _charcodes.charCodes.equalsTo) {
    finishOp(_types.TokenType.assign, 2);
  } else {
    finishOp(_types.TokenType.slash, 1);
  }
}

function readToken_mult_modulo(code) {
  // '%*'
  let tokenType = code === _charcodes.charCodes.asterisk ? _types.TokenType.star : _types.TokenType.modulo;
  let width = 1;
  let nextChar = _base.input.charCodeAt(_base.state.pos + 1);

  // Exponentiation operator **
  if (code === _charcodes.charCodes.asterisk && nextChar === _charcodes.charCodes.asterisk) {
    width++;
    nextChar = _base.input.charCodeAt(_base.state.pos + 2);
    tokenType = _types.TokenType.exponent;
  }

  // Match *= or %=, disallowing *=> which can be valid in flow.
  if (
    nextChar === _charcodes.charCodes.equalsTo &&
    _base.input.charCodeAt(_base.state.pos + 2) !== _charcodes.charCodes.greaterThan
  ) {
    width++;
    tokenType = _types.TokenType.assign;
  }

  finishOp(tokenType, width);
}

function readToken_pipe_amp(code) {
  // '|&'
  const nextChar = _base.input.charCodeAt(_base.state.pos + 1);

  if (nextChar === code) {
    if (_base.input.charCodeAt(_base.state.pos + 2) === _charcodes.charCodes.equalsTo) {
      // ||= or &&=
      finishOp(_types.TokenType.assign, 3);
    } else {
      // || or &&
      finishOp(code === _charcodes.charCodes.verticalBar ? _types.TokenType.logicalOR : _types.TokenType.logicalAND, 2);
    }
    return;
  }

  if (code === _charcodes.charCodes.verticalBar) {
    // '|>'
    if (nextChar === _charcodes.charCodes.greaterThan) {
      finishOp(_types.TokenType.pipeline, 2);
      return;
    } else if (nextChar === _charcodes.charCodes.rightCurlyBrace && _base.isFlowEnabled) {
      // '|}'
      finishOp(_types.TokenType.braceBarR, 2);
      return;
    }
  }

  if (nextChar === _charcodes.charCodes.equalsTo) {
    finishOp(_types.TokenType.assign, 2);
    return;
  }

  finishOp(code === _charcodes.charCodes.verticalBar ? _types.TokenType.bitwiseOR : _types.TokenType.bitwiseAND, 1);
}

function readToken_caret() {
  // '^'
  const nextChar = _base.input.charCodeAt(_base.state.pos + 1);
  if (nextChar === _charcodes.charCodes.equalsTo) {
    finishOp(_types.TokenType.assign, 2);
  } else {
    finishOp(_types.TokenType.bitwiseXOR, 1);
  }
}

function readToken_plus_min(code) {
  // '+-'
  const nextChar = _base.input.charCodeAt(_base.state.pos + 1);

  if (nextChar === code) {
    // Tentatively call this a prefix operator, but it might be changed to postfix later.
    finishOp(_types.TokenType.preIncDec, 2);
    return;
  }

  if (nextChar === _charcodes.charCodes.equalsTo) {
    finishOp(_types.TokenType.assign, 2);
  } else if (code === _charcodes.charCodes.plusSign) {
    finishOp(_types.TokenType.plus, 1);
  } else {
    finishOp(_types.TokenType.minus, 1);
  }
}

function readToken_lt() {
  const nextChar = _base.input.charCodeAt(_base.state.pos + 1);

  if (nextChar === _charcodes.charCodes.lessThan) {
    if (_base.input.charCodeAt(_base.state.pos + 2) === _charcodes.charCodes.equalsTo) {
      finishOp(_types.TokenType.assign, 3);
      return;
    }
    // We see <<, but need to be really careful about whether to treat it as a
    // true left-shift or as two < tokens.
    if (_base.state.isType) {
      // Within a type, << might come up in a snippet like `Array<<T>() => void>`,
      // so treat it as two < tokens. Importantly, this should only override <<
      // rather than other tokens like <= . If we treated <= as < in a type
      // context, then the snippet `a as T <= 1` would incorrectly start parsing
      // a type argument on T. We don't need to worry about `a as T << 1`
      // because TypeScript disallows that syntax.
      finishOp(_types.TokenType.lessThan, 1);
    } else {
      // Outside a type, this might be a true left-shift operator, or it might
      // still be two open-type-arg tokens, such as in `f<<T>() => void>()`. We
      // look at the token while considering the `f`, so we don't yet know that
      // we're in a type context. In this case, we initially tokenize as a
      // left-shift and correct after-the-fact as necessary in
      // tsParseTypeArgumentsWithPossibleBitshift .
      finishOp(_types.TokenType.bitShiftL, 2);
    }
    return;
  }

  if (nextChar === _charcodes.charCodes.equalsTo) {
    // <=
    finishOp(_types.TokenType.relationalOrEqual, 2);
  } else {
    finishOp(_types.TokenType.lessThan, 1);
  }
}

function readToken_gt() {
  if (_base.state.isType) {
    // Avoid right-shift for things like `Array<Array<string>>` and
    // greater-than-or-equal for things like `const a: Array<number>=[];`.
    finishOp(_types.TokenType.greaterThan, 1);
    return;
  }

  const nextChar = _base.input.charCodeAt(_base.state.pos + 1);

  if (nextChar === _charcodes.charCodes.greaterThan) {
    const size = _base.input.charCodeAt(_base.state.pos + 2) === _charcodes.charCodes.greaterThan ? 3 : 2;
    if (_base.input.charCodeAt(_base.state.pos + size) === _charcodes.charCodes.equalsTo) {
      finishOp(_types.TokenType.assign, size + 1);
      return;
    }
    finishOp(_types.TokenType.bitShiftR, size);
    return;
  }

  if (nextChar === _charcodes.charCodes.equalsTo) {
    // >=
    finishOp(_types.TokenType.relationalOrEqual, 2);
  } else {
    finishOp(_types.TokenType.greaterThan, 1);
  }
}

/**
 * Called after `as` expressions in TS; we're switching from a type to a
 * non-type context, so a > token may actually be >= . This is needed because >=
 * must be tokenized as a > in a type context because of code like
 * `const x: Array<T>=[];`, but `a as T >= 1` is a code example where it must be
 * treated as >=.
 *
 * Notably, this only applies to >, not <. In a code snippet like `a as T <= 1`,
 * we must NOT tokenize as <, or else the type parser will start parsing a type
 * argument and fail.
 */
 function rescan_gt() {
  if (_base.state.type === _types.TokenType.greaterThan) {
    _base.state.pos -= 1;
    readToken_gt();
  }
} exports.rescan_gt = rescan_gt;

function readToken_eq_excl(code) {
  // '=!'
  const nextChar = _base.input.charCodeAt(_base.state.pos + 1);
  if (nextChar === _charcodes.charCodes.equalsTo) {
    finishOp(_types.TokenType.equality, _base.input.charCodeAt(_base.state.pos + 2) === _charcodes.charCodes.equalsTo ? 3 : 2);
    return;
  }
  if (code === _charcodes.charCodes.equalsTo && nextChar === _charcodes.charCodes.greaterThan) {
    // '=>'
    _base.state.pos += 2;
    finishToken(_types.TokenType.arrow);
    return;
  }
  finishOp(code === _charcodes.charCodes.equalsTo ? _types.TokenType.eq : _types.TokenType.bang, 1);
}

function readToken_question() {
  // '?'
  const nextChar = _base.input.charCodeAt(_base.state.pos + 1);
  const nextChar2 = _base.input.charCodeAt(_base.state.pos + 2);
  if (
    nextChar === _charcodes.charCodes.questionMark &&
    // In Flow (but not TypeScript), ??string is a valid type that should be
    // tokenized as two individual ? tokens.
    !(_base.isFlowEnabled && _base.state.isType)
  ) {
    if (nextChar2 === _charcodes.charCodes.equalsTo) {
      // '??='
      finishOp(_types.TokenType.assign, 3);
    } else {
      // '??'
      finishOp(_types.TokenType.nullishCoalescing, 2);
    }
  } else if (
    nextChar === _charcodes.charCodes.dot &&
    !(nextChar2 >= _charcodes.charCodes.digit0 && nextChar2 <= _charcodes.charCodes.digit9)
  ) {
    // '.' not followed by a number
    _base.state.pos += 2;
    finishToken(_types.TokenType.questionDot);
  } else {
    ++_base.state.pos;
    finishToken(_types.TokenType.question);
  }
}

 function getTokenFromCode(code) {
  switch (code) {
    case _charcodes.charCodes.numberSign:
      ++_base.state.pos;
      finishToken(_types.TokenType.hash);
      return;

    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.

    case _charcodes.charCodes.dot:
      readToken_dot();
      return;

    // Punctuation tokens.
    case _charcodes.charCodes.leftParenthesis:
      ++_base.state.pos;
      finishToken(_types.TokenType.parenL);
      return;
    case _charcodes.charCodes.rightParenthesis:
      ++_base.state.pos;
      finishToken(_types.TokenType.parenR);
      return;
    case _charcodes.charCodes.semicolon:
      ++_base.state.pos;
      finishToken(_types.TokenType.semi);
      return;
    case _charcodes.charCodes.comma:
      ++_base.state.pos;
      finishToken(_types.TokenType.comma);
      return;
    case _charcodes.charCodes.leftSquareBracket:
      ++_base.state.pos;
      finishToken(_types.TokenType.bracketL);
      return;
    case _charcodes.charCodes.rightSquareBracket:
      ++_base.state.pos;
      finishToken(_types.TokenType.bracketR);
      return;

    case _charcodes.charCodes.leftCurlyBrace:
      if (_base.isFlowEnabled && _base.input.charCodeAt(_base.state.pos + 1) === _charcodes.charCodes.verticalBar) {
        finishOp(_types.TokenType.braceBarL, 2);
      } else {
        ++_base.state.pos;
        finishToken(_types.TokenType.braceL);
      }
      return;

    case _charcodes.charCodes.rightCurlyBrace:
      ++_base.state.pos;
      finishToken(_types.TokenType.braceR);
      return;

    case _charcodes.charCodes.colon:
      if (_base.input.charCodeAt(_base.state.pos + 1) === _charcodes.charCodes.colon) {
        finishOp(_types.TokenType.doubleColon, 2);
      } else {
        ++_base.state.pos;
        finishToken(_types.TokenType.colon);
      }
      return;

    case _charcodes.charCodes.questionMark:
      readToken_question();
      return;
    case _charcodes.charCodes.atSign:
      ++_base.state.pos;
      finishToken(_types.TokenType.at);
      return;

    case _charcodes.charCodes.graveAccent:
      ++_base.state.pos;
      finishToken(_types.TokenType.backQuote);
      return;

    case _charcodes.charCodes.digit0: {
      const nextChar = _base.input.charCodeAt(_base.state.pos + 1);
      // '0x', '0X', '0o', '0O', '0b', '0B'
      if (
        nextChar === _charcodes.charCodes.lowercaseX ||
        nextChar === _charcodes.charCodes.uppercaseX ||
        nextChar === _charcodes.charCodes.lowercaseO ||
        nextChar === _charcodes.charCodes.uppercaseO ||
        nextChar === _charcodes.charCodes.lowercaseB ||
        nextChar === _charcodes.charCodes.uppercaseB
      ) {
        readRadixNumber();
        return;
      }
    }
    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case _charcodes.charCodes.digit1:
    case _charcodes.charCodes.digit2:
    case _charcodes.charCodes.digit3:
    case _charcodes.charCodes.digit4:
    case _charcodes.charCodes.digit5:
    case _charcodes.charCodes.digit6:
    case _charcodes.charCodes.digit7:
    case _charcodes.charCodes.digit8:
    case _charcodes.charCodes.digit9:
      readNumber(false);
      return;

    // Quotes produce strings.
    case _charcodes.charCodes.quotationMark:
    case _charcodes.charCodes.apostrophe:
      readString(code);
      return;

    // Operators are parsed inline in tiny state machines. '=' (charCodes.equalsTo) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.

    case _charcodes.charCodes.slash:
      readToken_slash();
      return;

    case _charcodes.charCodes.percentSign:
    case _charcodes.charCodes.asterisk:
      readToken_mult_modulo(code);
      return;

    case _charcodes.charCodes.verticalBar:
    case _charcodes.charCodes.ampersand:
      readToken_pipe_amp(code);
      return;

    case _charcodes.charCodes.caret:
      readToken_caret();
      return;

    case _charcodes.charCodes.plusSign:
    case _charcodes.charCodes.dash:
      readToken_plus_min(code);
      return;

    case _charcodes.charCodes.lessThan:
      readToken_lt();
      return;

    case _charcodes.charCodes.greaterThan:
      readToken_gt();
      return;

    case _charcodes.charCodes.equalsTo:
    case _charcodes.charCodes.exclamationMark:
      readToken_eq_excl(code);
      return;

    case _charcodes.charCodes.tilde:
      finishOp(_types.TokenType.tilde, 1);
      return;

    default:
      break;
  }

  _util.unexpected.call(void 0, `Unexpected character '${String.fromCharCode(code)}'`, _base.state.pos);
} exports.getTokenFromCode = getTokenFromCode;

function finishOp(type, size) {
  _base.state.pos += size;
  finishToken(type);
}

function readRegexp() {
  const start = _base.state.pos;
  let escaped = false;
  let inClass = false;
  for (;;) {
    if (_base.state.pos >= _base.input.length) {
      _util.unexpected.call(void 0, "Unterminated regular expression", start);
      return;
    }
    const code = _base.input.charCodeAt(_base.state.pos);
    if (escaped) {
      escaped = false;
    } else {
      if (code === _charcodes.charCodes.leftSquareBracket) {
        inClass = true;
      } else if (code === _charcodes.charCodes.rightSquareBracket && inClass) {
        inClass = false;
      } else if (code === _charcodes.charCodes.slash && !inClass) {
        break;
      }
      escaped = code === _charcodes.charCodes.backslash;
    }
    ++_base.state.pos;
  }
  ++_base.state.pos;
  // Need to use `skipWord` because '\uXXXX' sequences are allowed here (don't ask).
  skipWord();

  finishToken(_types.TokenType.regexp);
}

/**
 * Read a decimal integer. Note that this can't be unified with the similar code
 * in readRadixNumber (which also handles hex digits) because "e" needs to be
 * the end of the integer so that we can properly handle scientific notation.
 */
function readInt() {
  while (true) {
    const code = _base.input.charCodeAt(_base.state.pos);
    if ((code >= _charcodes.charCodes.digit0 && code <= _charcodes.charCodes.digit9) || code === _charcodes.charCodes.underscore) {
      _base.state.pos++;
    } else {
      break;
    }
  }
}

function readRadixNumber() {
  _base.state.pos += 2; // 0x

  // Walk to the end of the number, allowing hex digits.
  while (true) {
    const code = _base.input.charCodeAt(_base.state.pos);
    if (
      (code >= _charcodes.charCodes.digit0 && code <= _charcodes.charCodes.digit9) ||
      (code >= _charcodes.charCodes.lowercaseA && code <= _charcodes.charCodes.lowercaseF) ||
      (code >= _charcodes.charCodes.uppercaseA && code <= _charcodes.charCodes.uppercaseF) ||
      code === _charcodes.charCodes.underscore
    ) {
      _base.state.pos++;
    } else {
      break;
    }
  }

  const nextChar = _base.input.charCodeAt(_base.state.pos);
  if (nextChar === _charcodes.charCodes.lowercaseN) {
    ++_base.state.pos;
    finishToken(_types.TokenType.bigint);
  } else {
    finishToken(_types.TokenType.num);
  }
}

// Read an integer, octal integer, or floating-point number.
function readNumber(startsWithDot) {
  let isBigInt = false;
  let isDecimal = false;

  if (!startsWithDot) {
    readInt();
  }

  let nextChar = _base.input.charCodeAt(_base.state.pos);
  if (nextChar === _charcodes.charCodes.dot) {
    ++_base.state.pos;
    readInt();
    nextChar = _base.input.charCodeAt(_base.state.pos);
  }

  if (nextChar === _charcodes.charCodes.uppercaseE || nextChar === _charcodes.charCodes.lowercaseE) {
    nextChar = _base.input.charCodeAt(++_base.state.pos);
    if (nextChar === _charcodes.charCodes.plusSign || nextChar === _charcodes.charCodes.dash) {
      ++_base.state.pos;
    }
    readInt();
    nextChar = _base.input.charCodeAt(_base.state.pos);
  }

  if (nextChar === _charcodes.charCodes.lowercaseN) {
    ++_base.state.pos;
    isBigInt = true;
  } else if (nextChar === _charcodes.charCodes.lowercaseM) {
    ++_base.state.pos;
    isDecimal = true;
  }

  if (isBigInt) {
    finishToken(_types.TokenType.bigint);
    return;
  }

  if (isDecimal) {
    finishToken(_types.TokenType.decimal);
    return;
  }

  finishToken(_types.TokenType.num);
}

function readString(quote) {
  _base.state.pos++;
  for (;;) {
    if (_base.state.pos >= _base.input.length) {
      _util.unexpected.call(void 0, "Unterminated string constant");
      return;
    }
    const ch = _base.input.charCodeAt(_base.state.pos);
    if (ch === _charcodes.charCodes.backslash) {
      _base.state.pos++;
    } else if (ch === quote) {
      break;
    }
    _base.state.pos++;
  }
  _base.state.pos++;
  finishToken(_types.TokenType.string);
}

// Reads template string tokens.
function readTmplToken() {
  for (;;) {
    if (_base.state.pos >= _base.input.length) {
      _util.unexpected.call(void 0, "Unterminated template");
      return;
    }
    const ch = _base.input.charCodeAt(_base.state.pos);
    if (
      ch === _charcodes.charCodes.graveAccent ||
      (ch === _charcodes.charCodes.dollarSign && _base.input.charCodeAt(_base.state.pos + 1) === _charcodes.charCodes.leftCurlyBrace)
    ) {
      if (_base.state.pos === _base.state.start && match(_types.TokenType.template)) {
        if (ch === _charcodes.charCodes.dollarSign) {
          _base.state.pos += 2;
          finishToken(_types.TokenType.dollarBraceL);
          return;
        } else {
          ++_base.state.pos;
          finishToken(_types.TokenType.backQuote);
          return;
        }
      }
      finishToken(_types.TokenType.template);
      return;
    }
    if (ch === _charcodes.charCodes.backslash) {
      _base.state.pos++;
    }
    _base.state.pos++;
  }
}

// Skip to the end of the current word. Note that this is the same as the snippet at the end of
// readWord, but calling skipWord from readWord seems to slightly hurt performance from some rough
// measurements.
 function skipWord() {
  while (_base.state.pos < _base.input.length) {
    const ch = _base.input.charCodeAt(_base.state.pos);
    if (_identifier.IS_IDENTIFIER_CHAR[ch]) {
      _base.state.pos++;
    } else if (ch === _charcodes.charCodes.backslash) {
      // \u
      _base.state.pos += 2;
      if (_base.input.charCodeAt(_base.state.pos) === _charcodes.charCodes.leftCurlyBrace) {
        while (
          _base.state.pos < _base.input.length &&
          _base.input.charCodeAt(_base.state.pos) !== _charcodes.charCodes.rightCurlyBrace
        ) {
          _base.state.pos++;
        }
        _base.state.pos++;
      }
    } else {
      break;
    }
  }
} exports.skipWord = skipWord;


/***/ }),

/***/ 3464:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var ContextualKeyword; (function (ContextualKeyword) {
  const NONE = 0; ContextualKeyword[ContextualKeyword["NONE"] = NONE] = "NONE";
  const _abstract = NONE + 1; ContextualKeyword[ContextualKeyword["_abstract"] = _abstract] = "_abstract";
  const _accessor = _abstract + 1; ContextualKeyword[ContextualKeyword["_accessor"] = _accessor] = "_accessor";
  const _as = _accessor + 1; ContextualKeyword[ContextualKeyword["_as"] = _as] = "_as";
  const _assert = _as + 1; ContextualKeyword[ContextualKeyword["_assert"] = _assert] = "_assert";
  const _asserts = _assert + 1; ContextualKeyword[ContextualKeyword["_asserts"] = _asserts] = "_asserts";
  const _async = _asserts + 1; ContextualKeyword[ContextualKeyword["_async"] = _async] = "_async";
  const _await = _async + 1; ContextualKeyword[ContextualKeyword["_await"] = _await] = "_await";
  const _checks = _await + 1; ContextualKeyword[ContextualKeyword["_checks"] = _checks] = "_checks";
  const _constructor = _checks + 1; ContextualKeyword[ContextualKeyword["_constructor"] = _constructor] = "_constructor";
  const _declare = _constructor + 1; ContextualKeyword[ContextualKeyword["_declare"] = _declare] = "_declare";
  const _enum = _declare + 1; ContextualKeyword[ContextualKeyword["_enum"] = _enum] = "_enum";
  const _exports = _enum + 1; ContextualKeyword[ContextualKeyword["_exports"] = _exports] = "_exports";
  const _from = _exports + 1; ContextualKeyword[ContextualKeyword["_from"] = _from] = "_from";
  const _get = _from + 1; ContextualKeyword[ContextualKeyword["_get"] = _get] = "_get";
  const _global = _get + 1; ContextualKeyword[ContextualKeyword["_global"] = _global] = "_global";
  const _implements = _global + 1; ContextualKeyword[ContextualKeyword["_implements"] = _implements] = "_implements";
  const _infer = _implements + 1; ContextualKeyword[ContextualKeyword["_infer"] = _infer] = "_infer";
  const _interface = _infer + 1; ContextualKeyword[ContextualKeyword["_interface"] = _interface] = "_interface";
  const _is = _interface + 1; ContextualKeyword[ContextualKeyword["_is"] = _is] = "_is";
  const _keyof = _is + 1; ContextualKeyword[ContextualKeyword["_keyof"] = _keyof] = "_keyof";
  const _mixins = _keyof + 1; ContextualKeyword[ContextualKeyword["_mixins"] = _mixins] = "_mixins";
  const _module = _mixins + 1; ContextualKeyword[ContextualKeyword["_module"] = _module] = "_module";
  const _namespace = _module + 1; ContextualKeyword[ContextualKeyword["_namespace"] = _namespace] = "_namespace";
  const _of = _namespace + 1; ContextualKeyword[ContextualKeyword["_of"] = _of] = "_of";
  const _opaque = _of + 1; ContextualKeyword[ContextualKeyword["_opaque"] = _opaque] = "_opaque";
  const _out = _opaque + 1; ContextualKeyword[ContextualKeyword["_out"] = _out] = "_out";
  const _override = _out + 1; ContextualKeyword[ContextualKeyword["_override"] = _override] = "_override";
  const _private = _override + 1; ContextualKeyword[ContextualKeyword["_private"] = _private] = "_private";
  const _protected = _private + 1; ContextualKeyword[ContextualKeyword["_protected"] = _protected] = "_protected";
  const _proto = _protected + 1; ContextualKeyword[ContextualKeyword["_proto"] = _proto] = "_proto";
  const _public = _proto + 1; ContextualKeyword[ContextualKeyword["_public"] = _public] = "_public";
  const _readonly = _public + 1; ContextualKeyword[ContextualKeyword["_readonly"] = _readonly] = "_readonly";
  const _require = _readonly + 1; ContextualKeyword[ContextualKeyword["_require"] = _require] = "_require";
  const _satisfies = _require + 1; ContextualKeyword[ContextualKeyword["_satisfies"] = _satisfies] = "_satisfies";
  const _set = _satisfies + 1; ContextualKeyword[ContextualKeyword["_set"] = _set] = "_set";
  const _static = _set + 1; ContextualKeyword[ContextualKeyword["_static"] = _static] = "_static";
  const _symbol = _static + 1; ContextualKeyword[ContextualKeyword["_symbol"] = _symbol] = "_symbol";
  const _type = _symbol + 1; ContextualKeyword[ContextualKeyword["_type"] = _type] = "_type";
  const _unique = _type + 1; ContextualKeyword[ContextualKeyword["_unique"] = _unique] = "_unique";
  const _using = _unique + 1; ContextualKeyword[ContextualKeyword["_using"] = _using] = "_using";
})(ContextualKeyword || (exports.ContextualKeyword = ContextualKeyword = {}));


/***/ }),

/***/ 5428:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _base = __webpack_require__(8022);
var _charcodes = __webpack_require__(1537);
var _identifier = __webpack_require__(905);
var _index = __webpack_require__(2297);
var _readWordTree = __webpack_require__(2972);
var _types = __webpack_require__(798);

/**
 * Read an identifier, producing either a name token or matching on one of the existing keywords.
 * For performance, we pre-generate big decision tree that we traverse. Each node represents a
 * prefix and has 27 values, where the first value is the token or contextual token, if any (-1 if
 * not), and the other 26 values are the transitions to other nodes, or -1 to stop.
 */
 function readWord() {
  let treePos = 0;
  let code = 0;
  let pos = _base.state.pos;
  while (pos < _base.input.length) {
    code = _base.input.charCodeAt(pos);
    if (code < _charcodes.charCodes.lowercaseA || code > _charcodes.charCodes.lowercaseZ) {
      break;
    }
    const next = _readWordTree.READ_WORD_TREE[treePos + (code - _charcodes.charCodes.lowercaseA) + 1];
    if (next === -1) {
      break;
    } else {
      treePos = next;
      pos++;
    }
  }

  const keywordValue = _readWordTree.READ_WORD_TREE[treePos];
  if (keywordValue > -1 && !_identifier.IS_IDENTIFIER_CHAR[code]) {
    _base.state.pos = pos;
    if (keywordValue & 1) {
      _index.finishToken.call(void 0, keywordValue >>> 1);
    } else {
      _index.finishToken.call(void 0, _types.TokenType.name, keywordValue >>> 1);
    }
    return;
  }

  while (pos < _base.input.length) {
    const ch = _base.input.charCodeAt(pos);
    if (_identifier.IS_IDENTIFIER_CHAR[ch]) {
      pos++;
    } else if (ch === _charcodes.charCodes.backslash) {
      // \u
      pos += 2;
      if (_base.input.charCodeAt(pos) === _charcodes.charCodes.leftCurlyBrace) {
        while (pos < _base.input.length && _base.input.charCodeAt(pos) !== _charcodes.charCodes.rightCurlyBrace) {
          pos++;
        }
        pos++;
      }
    } else if (ch === _charcodes.charCodes.atSign && _base.input.charCodeAt(pos + 1) === _charcodes.charCodes.atSign) {
      pos += 2;
    } else {
      break;
    }
  }
  _base.state.pos = pos;
  _index.finishToken.call(void 0, _types.TokenType.name);
} exports["default"] = readWord;


/***/ }),

/***/ 2972:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));// Generated file, do not edit! Run "yarn generate" to re-generate this file.
var _keywords = __webpack_require__(3464);
var _types = __webpack_require__(798);

// prettier-ignore
 const READ_WORD_TREE = new Int32Array([
  // ""
  -1, 27, 783, 918, 1755, 2376, 2862, 3483, -1, 3699, -1, 4617, 4752, 4833, 5130, 5508, 5940, -1, 6480, 6939, 7749, 8181, 8451, 8613, -1, 8829, -1,
  // "a"
  -1, -1, 54, 243, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 432, -1, -1, -1, 675, -1, -1, -1,
  // "ab"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 81, -1, -1, -1, -1, -1, -1, -1,
  // "abs"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 108, -1, -1, -1, -1, -1, -1,
  // "abst"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 135, -1, -1, -1, -1, -1, -1, -1, -1,
  // "abstr"
  -1, 162, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "abstra"
  -1, -1, -1, 189, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "abstrac"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 216, -1, -1, -1, -1, -1, -1,
  // "abstract"
  _keywords.ContextualKeyword._abstract << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ac"
  -1, -1, -1, 270, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "acc"
  -1, -1, -1, -1, -1, 297, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "acce"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 324, -1, -1, -1, -1, -1, -1, -1,
  // "acces"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 351, -1, -1, -1, -1, -1, -1, -1,
  // "access"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 378, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "accesso"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 405, -1, -1, -1, -1, -1, -1, -1, -1,
  // "accessor"
  _keywords.ContextualKeyword._accessor << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "as"
  _keywords.ContextualKeyword._as << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 459, -1, -1, -1, -1, -1, 594, -1,
  // "ass"
  -1, -1, -1, -1, -1, 486, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "asse"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 513, -1, -1, -1, -1, -1, -1, -1, -1,
  // "asser"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 540, -1, -1, -1, -1, -1, -1,
  // "assert"
  _keywords.ContextualKeyword._assert << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 567, -1, -1, -1, -1, -1, -1, -1,
  // "asserts"
  _keywords.ContextualKeyword._asserts << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "asy"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 621, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "asyn"
  -1, -1, -1, 648, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "async"
  _keywords.ContextualKeyword._async << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "aw"
  -1, 702, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "awa"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 729, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "awai"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 756, -1, -1, -1, -1, -1, -1,
  // "await"
  _keywords.ContextualKeyword._await << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "b"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 810, -1, -1, -1, -1, -1, -1, -1, -1,
  // "br"
  -1, -1, -1, -1, -1, 837, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "bre"
  -1, 864, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "brea"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 891, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "break"
  (_types.TokenType._break << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "c"
  -1, 945, -1, -1, -1, -1, -1, -1, 1107, -1, -1, -1, 1242, -1, -1, 1350, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ca"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 972, 1026, -1, -1, -1, -1, -1, -1,
  // "cas"
  -1, -1, -1, -1, -1, 999, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "case"
  (_types.TokenType._case << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "cat"
  -1, -1, -1, 1053, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "catc"
  -1, -1, -1, -1, -1, -1, -1, -1, 1080, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "catch"
  (_types.TokenType._catch << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ch"
  -1, -1, -1, -1, -1, 1134, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "che"
  -1, -1, -1, 1161, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "chec"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1188, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "check"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1215, -1, -1, -1, -1, -1, -1, -1,
  // "checks"
  _keywords.ContextualKeyword._checks << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "cl"
  -1, 1269, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "cla"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1296, -1, -1, -1, -1, -1, -1, -1,
  // "clas"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1323, -1, -1, -1, -1, -1, -1, -1,
  // "class"
  (_types.TokenType._class << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "co"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1377, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "con"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1404, 1620, -1, -1, -1, -1, -1, -1,
  // "cons"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1431, -1, -1, -1, -1, -1, -1,
  // "const"
  (_types.TokenType._const << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1458, -1, -1, -1, -1, -1, -1, -1, -1,
  // "constr"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1485, -1, -1, -1, -1, -1,
  // "constru"
  -1, -1, -1, 1512, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "construc"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1539, -1, -1, -1, -1, -1, -1,
  // "construct"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1566, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "constructo"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1593, -1, -1, -1, -1, -1, -1, -1, -1,
  // "constructor"
  _keywords.ContextualKeyword._constructor << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "cont"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 1647, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "conti"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1674, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "contin"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1701, -1, -1, -1, -1, -1,
  // "continu"
  -1, -1, -1, -1, -1, 1728, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "continue"
  (_types.TokenType._continue << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "d"
  -1, -1, -1, -1, -1, 1782, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2349, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "de"
  -1, -1, 1809, 1971, -1, -1, 2106, -1, -1, -1, -1, -1, 2241, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "deb"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1836, -1, -1, -1, -1, -1,
  // "debu"
  -1, -1, -1, -1, -1, -1, -1, 1863, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "debug"
  -1, -1, -1, -1, -1, -1, -1, 1890, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "debugg"
  -1, -1, -1, -1, -1, 1917, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "debugge"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1944, -1, -1, -1, -1, -1, -1, -1, -1,
  // "debugger"
  (_types.TokenType._debugger << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "dec"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1998, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "decl"
  -1, 2025, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "decla"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2052, -1, -1, -1, -1, -1, -1, -1, -1,
  // "declar"
  -1, -1, -1, -1, -1, 2079, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "declare"
  _keywords.ContextualKeyword._declare << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "def"
  -1, 2133, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "defa"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2160, -1, -1, -1, -1, -1,
  // "defau"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2187, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "defaul"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2214, -1, -1, -1, -1, -1, -1,
  // "default"
  (_types.TokenType._default << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "del"
  -1, -1, -1, -1, -1, 2268, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "dele"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2295, -1, -1, -1, -1, -1, -1,
  // "delet"
  -1, -1, -1, -1, -1, 2322, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "delete"
  (_types.TokenType._delete << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "do"
  (_types.TokenType._do << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "e"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2403, -1, 2484, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2565, -1, -1,
  // "el"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2430, -1, -1, -1, -1, -1, -1, -1,
  // "els"
  -1, -1, -1, -1, -1, 2457, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "else"
  (_types.TokenType._else << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "en"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2511, -1, -1, -1, -1, -1,
  // "enu"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2538, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "enum"
  _keywords.ContextualKeyword._enum << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ex"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2592, -1, -1, -1, 2727, -1, -1, -1, -1, -1, -1,
  // "exp"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2619, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "expo"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2646, -1, -1, -1, -1, -1, -1, -1, -1,
  // "expor"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2673, -1, -1, -1, -1, -1, -1,
  // "export"
  (_types.TokenType._export << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2700, -1, -1, -1, -1, -1, -1, -1,
  // "exports"
  _keywords.ContextualKeyword._exports << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ext"
  -1, -1, -1, -1, -1, 2754, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "exte"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2781, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "exten"
  -1, -1, -1, -1, 2808, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "extend"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2835, -1, -1, -1, -1, -1, -1, -1,
  // "extends"
  (_types.TokenType._extends << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "f"
  -1, 2889, -1, -1, -1, -1, -1, -1, -1, 2997, -1, -1, -1, -1, -1, 3159, -1, -1, 3213, -1, -1, 3294, -1, -1, -1, -1, -1,
  // "fa"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2916, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "fal"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2943, -1, -1, -1, -1, -1, -1, -1,
  // "fals"
  -1, -1, -1, -1, -1, 2970, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "false"
  (_types.TokenType._false << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "fi"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3024, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "fin"
  -1, 3051, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "fina"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3078, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "final"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3105, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "finall"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3132, -1,
  // "finally"
  (_types.TokenType._finally << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "fo"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3186, -1, -1, -1, -1, -1, -1, -1, -1,
  // "for"
  (_types.TokenType._for << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "fr"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3240, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "fro"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3267, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "from"
  _keywords.ContextualKeyword._from << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "fu"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3321, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "fun"
  -1, -1, -1, 3348, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "func"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3375, -1, -1, -1, -1, -1, -1,
  // "funct"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 3402, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "functi"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3429, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "functio"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3456, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "function"
  (_types.TokenType._function << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "g"
  -1, -1, -1, -1, -1, 3510, -1, -1, -1, -1, -1, -1, 3564, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ge"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3537, -1, -1, -1, -1, -1, -1,
  // "get"
  _keywords.ContextualKeyword._get << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "gl"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3591, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "glo"
  -1, -1, 3618, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "glob"
  -1, 3645, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "globa"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3672, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "global"
  _keywords.ContextualKeyword._global << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "i"
  -1, -1, -1, -1, -1, -1, 3726, -1, -1, -1, -1, -1, -1, 3753, 4077, -1, -1, -1, -1, 4590, -1, -1, -1, -1, -1, -1, -1,
  // "if"
  (_types.TokenType._if << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "im"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3780, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "imp"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3807, -1, -1, 3996, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "impl"
  -1, -1, -1, -1, -1, 3834, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "imple"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3861, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "implem"
  -1, -1, -1, -1, -1, 3888, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "impleme"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3915, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "implemen"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3942, -1, -1, -1, -1, -1, -1,
  // "implement"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3969, -1, -1, -1, -1, -1, -1, -1,
  // "implements"
  _keywords.ContextualKeyword._implements << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "impo"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4023, -1, -1, -1, -1, -1, -1, -1, -1,
  // "impor"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4050, -1, -1, -1, -1, -1, -1,
  // "import"
  (_types.TokenType._import << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "in"
  (_types.TokenType._in << 1) + 1, -1, -1, -1, -1, -1, 4104, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4185, 4401, -1, -1, -1, -1, -1, -1,
  // "inf"
  -1, -1, -1, -1, -1, 4131, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "infe"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4158, -1, -1, -1, -1, -1, -1, -1, -1,
  // "infer"
  _keywords.ContextualKeyword._infer << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ins"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4212, -1, -1, -1, -1, -1, -1,
  // "inst"
  -1, 4239, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "insta"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4266, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "instan"
  -1, -1, -1, 4293, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "instanc"
  -1, -1, -1, -1, -1, 4320, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "instance"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4347, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "instanceo"
  -1, -1, -1, -1, -1, -1, 4374, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "instanceof"
  (_types.TokenType._instanceof << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "int"
  -1, -1, -1, -1, -1, 4428, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "inte"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4455, -1, -1, -1, -1, -1, -1, -1, -1,
  // "inter"
  -1, -1, -1, -1, -1, -1, 4482, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "interf"
  -1, 4509, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "interfa"
  -1, -1, -1, 4536, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "interfac"
  -1, -1, -1, -1, -1, 4563, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "interface"
  _keywords.ContextualKeyword._interface << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "is"
  _keywords.ContextualKeyword._is << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "k"
  -1, -1, -1, -1, -1, 4644, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ke"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4671, -1,
  // "key"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4698, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "keyo"
  -1, -1, -1, -1, -1, -1, 4725, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "keyof"
  _keywords.ContextualKeyword._keyof << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "l"
  -1, -1, -1, -1, -1, 4779, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "le"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4806, -1, -1, -1, -1, -1, -1,
  // "let"
  (_types.TokenType._let << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "m"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 4860, -1, -1, -1, -1, -1, 4995, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "mi"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4887, -1, -1,
  // "mix"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 4914, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "mixi"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4941, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "mixin"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4968, -1, -1, -1, -1, -1, -1, -1,
  // "mixins"
  _keywords.ContextualKeyword._mixins << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "mo"
  -1, -1, -1, -1, 5022, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "mod"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5049, -1, -1, -1, -1, -1,
  // "modu"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5076, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "modul"
  -1, -1, -1, -1, -1, 5103, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "module"
  _keywords.ContextualKeyword._module << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "n"
  -1, 5157, -1, -1, -1, 5373, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5427, -1, -1, -1, -1, -1,
  // "na"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5184, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "nam"
  -1, -1, -1, -1, -1, 5211, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "name"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5238, -1, -1, -1, -1, -1, -1, -1,
  // "names"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5265, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "namesp"
  -1, 5292, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "namespa"
  -1, -1, -1, 5319, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "namespac"
  -1, -1, -1, -1, -1, 5346, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "namespace"
  _keywords.ContextualKeyword._namespace << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ne"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5400, -1, -1, -1,
  // "new"
  (_types.TokenType._new << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "nu"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5454, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "nul"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5481, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "null"
  (_types.TokenType._null << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "o"
  -1, -1, -1, -1, -1, -1, 5535, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5562, -1, -1, -1, -1, 5697, 5751, -1, -1, -1, -1,
  // "of"
  _keywords.ContextualKeyword._of << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "op"
  -1, 5589, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "opa"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5616, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "opaq"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5643, -1, -1, -1, -1, -1,
  // "opaqu"
  -1, -1, -1, -1, -1, 5670, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "opaque"
  _keywords.ContextualKeyword._opaque << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ou"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5724, -1, -1, -1, -1, -1, -1,
  // "out"
  _keywords.ContextualKeyword._out << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ov"
  -1, -1, -1, -1, -1, 5778, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ove"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5805, -1, -1, -1, -1, -1, -1, -1, -1,
  // "over"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5832, -1, -1, -1, -1, -1, -1, -1, -1,
  // "overr"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 5859, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "overri"
  -1, -1, -1, -1, 5886, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "overrid"
  -1, -1, -1, -1, -1, 5913, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "override"
  _keywords.ContextualKeyword._override << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "p"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5967, -1, -1, 6345, -1, -1, -1, -1, -1,
  // "pr"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 5994, -1, -1, -1, -1, -1, 6129, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "pri"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6021, -1, -1, -1, -1,
  // "priv"
  -1, 6048, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "priva"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6075, -1, -1, -1, -1, -1, -1,
  // "privat"
  -1, -1, -1, -1, -1, 6102, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "private"
  _keywords.ContextualKeyword._private << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "pro"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6156, -1, -1, -1, -1, -1, -1,
  // "prot"
  -1, -1, -1, -1, -1, 6183, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6318, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "prote"
  -1, -1, -1, 6210, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "protec"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6237, -1, -1, -1, -1, -1, -1,
  // "protect"
  -1, -1, -1, -1, -1, 6264, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "protecte"
  -1, -1, -1, -1, 6291, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "protected"
  _keywords.ContextualKeyword._protected << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "proto"
  _keywords.ContextualKeyword._proto << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "pu"
  -1, -1, 6372, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "pub"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6399, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "publ"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 6426, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "publi"
  -1, -1, -1, 6453, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "public"
  _keywords.ContextualKeyword._public << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "r"
  -1, -1, -1, -1, -1, 6507, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "re"
  -1, 6534, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6696, -1, -1, 6831, -1, -1, -1, -1, -1, -1,
  // "rea"
  -1, -1, -1, -1, 6561, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "read"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6588, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "reado"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6615, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "readon"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6642, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "readonl"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6669, -1,
  // "readonly"
  _keywords.ContextualKeyword._readonly << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "req"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6723, -1, -1, -1, -1, -1,
  // "requ"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 6750, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "requi"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6777, -1, -1, -1, -1, -1, -1, -1, -1,
  // "requir"
  -1, -1, -1, -1, -1, 6804, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "require"
  _keywords.ContextualKeyword._require << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ret"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6858, -1, -1, -1, -1, -1,
  // "retu"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6885, -1, -1, -1, -1, -1, -1, -1, -1,
  // "retur"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6912, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "return"
  (_types.TokenType._return << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "s"
  -1, 6966, -1, -1, -1, 7182, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7236, 7371, -1, 7479, -1, 7614, -1,
  // "sa"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6993, -1, -1, -1, -1, -1, -1,
  // "sat"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 7020, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "sati"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7047, -1, -1, -1, -1, -1, -1, -1,
  // "satis"
  -1, -1, -1, -1, -1, -1, 7074, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "satisf"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 7101, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "satisfi"
  -1, -1, -1, -1, -1, 7128, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "satisfie"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7155, -1, -1, -1, -1, -1, -1, -1,
  // "satisfies"
  _keywords.ContextualKeyword._satisfies << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "se"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7209, -1, -1, -1, -1, -1, -1,
  // "set"
  _keywords.ContextualKeyword._set << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "st"
  -1, 7263, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "sta"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7290, -1, -1, -1, -1, -1, -1,
  // "stat"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 7317, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "stati"
  -1, -1, -1, 7344, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "static"
  _keywords.ContextualKeyword._static << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "su"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7398, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "sup"
  -1, -1, -1, -1, -1, 7425, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "supe"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7452, -1, -1, -1, -1, -1, -1, -1, -1,
  // "super"
  (_types.TokenType._super << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "sw"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 7506, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "swi"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7533, -1, -1, -1, -1, -1, -1,
  // "swit"
  -1, -1, -1, 7560, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "switc"
  -1, -1, -1, -1, -1, -1, -1, -1, 7587, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "switch"
  (_types.TokenType._switch << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "sy"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7641, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "sym"
  -1, -1, 7668, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "symb"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7695, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "symbo"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7722, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "symbol"
  _keywords.ContextualKeyword._symbol << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "t"
  -1, -1, -1, -1, -1, -1, -1, -1, 7776, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7938, -1, -1, -1, -1, -1, -1, 8046, -1,
  // "th"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 7803, -1, -1, -1, -1, -1, -1, -1, -1, 7857, -1, -1, -1, -1, -1, -1, -1, -1,
  // "thi"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7830, -1, -1, -1, -1, -1, -1, -1,
  // "this"
  (_types.TokenType._this << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "thr"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7884, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "thro"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7911, -1, -1, -1,
  // "throw"
  (_types.TokenType._throw << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "tr"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7965, -1, -1, -1, 8019, -1,
  // "tru"
  -1, -1, -1, -1, -1, 7992, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "true"
  (_types.TokenType._true << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "try"
  (_types.TokenType._try << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "ty"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8073, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "typ"
  -1, -1, -1, -1, -1, 8100, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "type"
  _keywords.ContextualKeyword._type << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8127, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "typeo"
  -1, -1, -1, -1, -1, -1, 8154, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "typeof"
  (_types.TokenType._typeof << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "u"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8208, -1, -1, -1, -1, 8343, -1, -1, -1, -1, -1, -1, -1,
  // "un"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 8235, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "uni"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8262, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "uniq"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8289, -1, -1, -1, -1, -1,
  // "uniqu"
  -1, -1, -1, -1, -1, 8316, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "unique"
  _keywords.ContextualKeyword._unique << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "us"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 8370, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "usi"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8397, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "usin"
  -1, -1, -1, -1, -1, -1, -1, 8424, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "using"
  _keywords.ContextualKeyword._using << 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "v"
  -1, 8478, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8532, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "va"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8505, -1, -1, -1, -1, -1, -1, -1, -1,
  // "var"
  (_types.TokenType._var << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "vo"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 8559, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "voi"
  -1, -1, -1, -1, 8586, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "void"
  (_types.TokenType._void << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "w"
  -1, -1, -1, -1, -1, -1, -1, -1, 8640, 8748, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "wh"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 8667, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "whi"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8694, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "whil"
  -1, -1, -1, -1, -1, 8721, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "while"
  (_types.TokenType._while << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "wi"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8775, -1, -1, -1, -1, -1, -1,
  // "wit"
  -1, -1, -1, -1, -1, -1, -1, -1, 8802, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "with"
  (_types.TokenType._with << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "y"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, 8856, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "yi"
  -1, -1, -1, -1, -1, 8883, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "yie"
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8910, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "yiel"
  -1, -1, -1, -1, 8937, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // "yield"
  (_types.TokenType._yield << 1) + 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
]); exports.READ_WORD_TREE = READ_WORD_TREE;


/***/ }),

/***/ 8595:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));
var _keywords = __webpack_require__(3464);
var _types = __webpack_require__(798);

 class Scope {
  
  
  

  constructor(startTokenIndex, endTokenIndex, isFunctionScope) {
    this.startTokenIndex = startTokenIndex;
    this.endTokenIndex = endTokenIndex;
    this.isFunctionScope = isFunctionScope;
  }
} exports.Scope = Scope;

 class StateSnapshot {
  constructor(
     potentialArrowAt,
     noAnonFunctionType,
     inDisallowConditionalTypesContext,
     tokensLength,
     scopesLength,
     pos,
     type,
     contextualKeyword,
     start,
     end,
     isType,
     scopeDepth,
     error,
  ) {;this.potentialArrowAt = potentialArrowAt;this.noAnonFunctionType = noAnonFunctionType;this.inDisallowConditionalTypesContext = inDisallowConditionalTypesContext;this.tokensLength = tokensLength;this.scopesLength = scopesLength;this.pos = pos;this.type = type;this.contextualKeyword = contextualKeyword;this.start = start;this.end = end;this.isType = isType;this.scopeDepth = scopeDepth;this.error = error;}
} exports.StateSnapshot = StateSnapshot;

 class State {constructor() { State.prototype.__init.call(this);State.prototype.__init2.call(this);State.prototype.__init3.call(this);State.prototype.__init4.call(this);State.prototype.__init5.call(this);State.prototype.__init6.call(this);State.prototype.__init7.call(this);State.prototype.__init8.call(this);State.prototype.__init9.call(this);State.prototype.__init10.call(this);State.prototype.__init11.call(this);State.prototype.__init12.call(this);State.prototype.__init13.call(this); }
  // Used to signify the start of a potential arrow function
  __init() {this.potentialArrowAt = -1}

  // Used by Flow to handle an edge case involving function type parsing.
  __init2() {this.noAnonFunctionType = false}

  // Used by TypeScript to handle ambiguities when parsing conditional types.
  __init3() {this.inDisallowConditionalTypesContext = false}

  // Token store.
  __init4() {this.tokens = []}

  // Array of all observed scopes, ordered by their ending position.
  __init5() {this.scopes = []}

  // The current position of the tokenizer in the input.
  __init6() {this.pos = 0}

  // Information about the current token.
  __init7() {this.type = _types.TokenType.eof}
  __init8() {this.contextualKeyword = _keywords.ContextualKeyword.NONE}
  __init9() {this.start = 0}
  __init10() {this.end = 0}

  __init11() {this.isType = false}
  __init12() {this.scopeDepth = 0}

  /**
   * If the parser is in an error state, then the token is always tt.eof and all functions can
   * keep executing but should be written so they don't get into an infinite loop in this situation.
   *
   * This approach, combined with the ability to snapshot and restore state, allows us to implement
   * backtracking without exceptions and without needing to explicitly propagate error states
   * everywhere.
   */
  __init13() {this.error = null}

  snapshot() {
    return new StateSnapshot(
      this.potentialArrowAt,
      this.noAnonFunctionType,
      this.inDisallowConditionalTypesContext,
      this.tokens.length,
      this.scopes.length,
      this.pos,
      this.type,
      this.contextualKeyword,
      this.start,
      this.end,
      this.isType,
      this.scopeDepth,
      this.error,
    );
  }

  restoreFromSnapshot(snapshot) {
    this.potentialArrowAt = snapshot.potentialArrowAt;
    this.noAnonFunctionType = snapshot.noAnonFunctionType;
    this.inDisallowConditionalTypesContext = snapshot.inDisallowConditionalTypesContext;
    this.tokens.length = snapshot.tokensLength;
    this.scopes.length = snapshot.scopesLength;
    this.pos = snapshot.pos;
    this.type = snapshot.type;
    this.contextualKeyword = snapshot.contextualKeyword;
    this.start = snapshot.start;
    this.end = snapshot.end;
    this.isType = snapshot.isType;
    this.scopeDepth = snapshot.scopeDepth;
    this.error = snapshot.error;
  }
} exports["default"] = State;


/***/ }),

/***/ 798:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));// Generated file, do not edit! Run "yarn generate" to re-generate this file.
/* istanbul ignore file */
/**
 * Enum of all token types, with bit fields to signify meaningful properties.
 */
var TokenType; (function (TokenType) {
  // Precedence 0 means not an operator; otherwise it is a positive number up to 12.
  const PRECEDENCE_MASK = 0xf; TokenType[TokenType["PRECEDENCE_MASK"] = PRECEDENCE_MASK] = "PRECEDENCE_MASK";
  const IS_KEYWORD = 1 << 4; TokenType[TokenType["IS_KEYWORD"] = IS_KEYWORD] = "IS_KEYWORD";
  const IS_ASSIGN = 1 << 5; TokenType[TokenType["IS_ASSIGN"] = IS_ASSIGN] = "IS_ASSIGN";
  const IS_RIGHT_ASSOCIATIVE = 1 << 6; TokenType[TokenType["IS_RIGHT_ASSOCIATIVE"] = IS_RIGHT_ASSOCIATIVE] = "IS_RIGHT_ASSOCIATIVE";
  const IS_PREFIX = 1 << 7; TokenType[TokenType["IS_PREFIX"] = IS_PREFIX] = "IS_PREFIX";
  const IS_POSTFIX = 1 << 8; TokenType[TokenType["IS_POSTFIX"] = IS_POSTFIX] = "IS_POSTFIX";
  const IS_EXPRESSION_START = 1 << 9; TokenType[TokenType["IS_EXPRESSION_START"] = IS_EXPRESSION_START] = "IS_EXPRESSION_START";

  const num = 512; TokenType[TokenType["num"] = num] = "num"; // num startsExpr
  const bigint = 1536; TokenType[TokenType["bigint"] = bigint] = "bigint"; // bigint startsExpr
  const decimal = 2560; TokenType[TokenType["decimal"] = decimal] = "decimal"; // decimal startsExpr
  const regexp = 3584; TokenType[TokenType["regexp"] = regexp] = "regexp"; // regexp startsExpr
  const string = 4608; TokenType[TokenType["string"] = string] = "string"; // string startsExpr
  const name = 5632; TokenType[TokenType["name"] = name] = "name"; // name startsExpr
  const eof = 6144; TokenType[TokenType["eof"] = eof] = "eof"; // eof
  const bracketL = 7680; TokenType[TokenType["bracketL"] = bracketL] = "bracketL"; // [ startsExpr
  const bracketR = 8192; TokenType[TokenType["bracketR"] = bracketR] = "bracketR"; // ]
  const braceL = 9728; TokenType[TokenType["braceL"] = braceL] = "braceL"; // { startsExpr
  const braceBarL = 10752; TokenType[TokenType["braceBarL"] = braceBarL] = "braceBarL"; // {| startsExpr
  const braceR = 11264; TokenType[TokenType["braceR"] = braceR] = "braceR"; // }
  const braceBarR = 12288; TokenType[TokenType["braceBarR"] = braceBarR] = "braceBarR"; // |}
  const parenL = 13824; TokenType[TokenType["parenL"] = parenL] = "parenL"; // ( startsExpr
  const parenR = 14336; TokenType[TokenType["parenR"] = parenR] = "parenR"; // )
  const comma = 15360; TokenType[TokenType["comma"] = comma] = "comma"; // ,
  const semi = 16384; TokenType[TokenType["semi"] = semi] = "semi"; // ;
  const colon = 17408; TokenType[TokenType["colon"] = colon] = "colon"; // :
  const doubleColon = 18432; TokenType[TokenType["doubleColon"] = doubleColon] = "doubleColon"; // ::
  const dot = 19456; TokenType[TokenType["dot"] = dot] = "dot"; // .
  const question = 20480; TokenType[TokenType["question"] = question] = "question"; // ?
  const questionDot = 21504; TokenType[TokenType["questionDot"] = questionDot] = "questionDot"; // ?.
  const arrow = 22528; TokenType[TokenType["arrow"] = arrow] = "arrow"; // =>
  const template = 23552; TokenType[TokenType["template"] = template] = "template"; // template
  const ellipsis = 24576; TokenType[TokenType["ellipsis"] = ellipsis] = "ellipsis"; // ...
  const backQuote = 25600; TokenType[TokenType["backQuote"] = backQuote] = "backQuote"; // `
  const dollarBraceL = 27136; TokenType[TokenType["dollarBraceL"] = dollarBraceL] = "dollarBraceL"; // ${ startsExpr
  const at = 27648; TokenType[TokenType["at"] = at] = "at"; // @
  const hash = 29184; TokenType[TokenType["hash"] = hash] = "hash"; // # startsExpr
  const eq = 29728; TokenType[TokenType["eq"] = eq] = "eq"; // = isAssign
  const assign = 30752; TokenType[TokenType["assign"] = assign] = "assign"; // _= isAssign
  const preIncDec = 32640; TokenType[TokenType["preIncDec"] = preIncDec] = "preIncDec"; // ++/-- prefix postfix startsExpr
  const postIncDec = 33664; TokenType[TokenType["postIncDec"] = postIncDec] = "postIncDec"; // ++/-- prefix postfix startsExpr
  const bang = 34432; TokenType[TokenType["bang"] = bang] = "bang"; // ! prefix startsExpr
  const tilde = 35456; TokenType[TokenType["tilde"] = tilde] = "tilde"; // ~ prefix startsExpr
  const pipeline = 35841; TokenType[TokenType["pipeline"] = pipeline] = "pipeline"; // |> prec:1
  const nullishCoalescing = 36866; TokenType[TokenType["nullishCoalescing"] = nullishCoalescing] = "nullishCoalescing"; // ?? prec:2
  const logicalOR = 37890; TokenType[TokenType["logicalOR"] = logicalOR] = "logicalOR"; // || prec:2
  const logicalAND = 38915; TokenType[TokenType["logicalAND"] = logicalAND] = "logicalAND"; // && prec:3
  const bitwiseOR = 39940; TokenType[TokenType["bitwiseOR"] = bitwiseOR] = "bitwiseOR"; // | prec:4
  const bitwiseXOR = 40965; TokenType[TokenType["bitwiseXOR"] = bitwiseXOR] = "bitwiseXOR"; // ^ prec:5
  const bitwiseAND = 41990; TokenType[TokenType["bitwiseAND"] = bitwiseAND] = "bitwiseAND"; // & prec:6
  const equality = 43015; TokenType[TokenType["equality"] = equality] = "equality"; // ==/!= prec:7
  const lessThan = 44040; TokenType[TokenType["lessThan"] = lessThan] = "lessThan"; // < prec:8
  const greaterThan = 45064; TokenType[TokenType["greaterThan"] = greaterThan] = "greaterThan"; // > prec:8
  const relationalOrEqual = 46088; TokenType[TokenType["relationalOrEqual"] = relationalOrEqual] = "relationalOrEqual"; // <=/>= prec:8
  const bitShiftL = 47113; TokenType[TokenType["bitShiftL"] = bitShiftL] = "bitShiftL"; // << prec:9
  const bitShiftR = 48137; TokenType[TokenType["bitShiftR"] = bitShiftR] = "bitShiftR"; // >>/>>> prec:9
  const plus = 49802; TokenType[TokenType["plus"] = plus] = "plus"; // + prec:10 prefix startsExpr
  const minus = 50826; TokenType[TokenType["minus"] = minus] = "minus"; // - prec:10 prefix startsExpr
  const modulo = 51723; TokenType[TokenType["modulo"] = modulo] = "modulo"; // % prec:11 startsExpr
  const star = 52235; TokenType[TokenType["star"] = star] = "star"; // * prec:11
  const slash = 53259; TokenType[TokenType["slash"] = slash] = "slash"; // / prec:11
  const exponent = 54348; TokenType[TokenType["exponent"] = exponent] = "exponent"; // ** prec:12 rightAssociative
  const jsxName = 55296; TokenType[TokenType["jsxName"] = jsxName] = "jsxName"; // jsxName
  const jsxText = 56320; TokenType[TokenType["jsxText"] = jsxText] = "jsxText"; // jsxText
  const jsxEmptyText = 57344; TokenType[TokenType["jsxEmptyText"] = jsxEmptyText] = "jsxEmptyText"; // jsxEmptyText
  const jsxTagStart = 58880; TokenType[TokenType["jsxTagStart"] = jsxTagStart] = "jsxTagStart"; // jsxTagStart startsExpr
  const jsxTagEnd = 59392; TokenType[TokenType["jsxTagEnd"] = jsxTagEnd] = "jsxTagEnd"; // jsxTagEnd
  const typeParameterStart = 60928; TokenType[TokenType["typeParameterStart"] = typeParameterStart] = "typeParameterStart"; // typeParameterStart startsExpr
  const nonNullAssertion = 61440; TokenType[TokenType["nonNullAssertion"] = nonNullAssertion] = "nonNullAssertion"; // nonNullAssertion
  const _break = 62480; TokenType[TokenType["_break"] = _break] = "_break"; // break keyword
  const _case = 63504; TokenType[TokenType["_case"] = _case] = "_case"; // case keyword
  const _catch = 64528; TokenType[TokenType["_catch"] = _catch] = "_catch"; // catch keyword
  const _continue = 65552; TokenType[TokenType["_continue"] = _continue] = "_continue"; // continue keyword
  const _debugger = 66576; TokenType[TokenType["_debugger"] = _debugger] = "_debugger"; // debugger keyword
  const _default = 67600; TokenType[TokenType["_default"] = _default] = "_default"; // default keyword
  const _do = 68624; TokenType[TokenType["_do"] = _do] = "_do"; // do keyword
  const _else = 69648; TokenType[TokenType["_else"] = _else] = "_else"; // else keyword
  const _finally = 70672; TokenType[TokenType["_finally"] = _finally] = "_finally"; // finally keyword
  const _for = 71696; TokenType[TokenType["_for"] = _for] = "_for"; // for keyword
  const _function = 73232; TokenType[TokenType["_function"] = _function] = "_function"; // function keyword startsExpr
  const _if = 73744; TokenType[TokenType["_if"] = _if] = "_if"; // if keyword
  const _return = 74768; TokenType[TokenType["_return"] = _return] = "_return"; // return keyword
  const _switch = 75792; TokenType[TokenType["_switch"] = _switch] = "_switch"; // switch keyword
  const _throw = 77456; TokenType[TokenType["_throw"] = _throw] = "_throw"; // throw keyword prefix startsExpr
  const _try = 77840; TokenType[TokenType["_try"] = _try] = "_try"; // try keyword
  const _var = 78864; TokenType[TokenType["_var"] = _var] = "_var"; // var keyword
  const _let = 79888; TokenType[TokenType["_let"] = _let] = "_let"; // let keyword
  const _const = 80912; TokenType[TokenType["_const"] = _const] = "_const"; // const keyword
  const _while = 81936; TokenType[TokenType["_while"] = _while] = "_while"; // while keyword
  const _with = 82960; TokenType[TokenType["_with"] = _with] = "_with"; // with keyword
  const _new = 84496; TokenType[TokenType["_new"] = _new] = "_new"; // new keyword startsExpr
  const _this = 85520; TokenType[TokenType["_this"] = _this] = "_this"; // this keyword startsExpr
  const _super = 86544; TokenType[TokenType["_super"] = _super] = "_super"; // super keyword startsExpr
  const _class = 87568; TokenType[TokenType["_class"] = _class] = "_class"; // class keyword startsExpr
  const _extends = 88080; TokenType[TokenType["_extends"] = _extends] = "_extends"; // extends keyword
  const _export = 89104; TokenType[TokenType["_export"] = _export] = "_export"; // export keyword
  const _import = 90640; TokenType[TokenType["_import"] = _import] = "_import"; // import keyword startsExpr
  const _yield = 91664; TokenType[TokenType["_yield"] = _yield] = "_yield"; // yield keyword startsExpr
  const _null = 92688; TokenType[TokenType["_null"] = _null] = "_null"; // null keyword startsExpr
  const _true = 93712; TokenType[TokenType["_true"] = _true] = "_true"; // true keyword startsExpr
  const _false = 94736; TokenType[TokenType["_false"] = _false] = "_false"; // false keyword startsExpr
  const _in = 95256; TokenType[TokenType["_in"] = _in] = "_in"; // in prec:8 keyword
  const _instanceof = 96280; TokenType[TokenType["_instanceof"] = _instanceof] = "_instanceof"; // instanceof prec:8 keyword
  const _typeof = 97936; TokenType[TokenType["_typeof"] = _typeof] = "_typeof"; // typeof keyword prefix startsExpr
  const _void = 98960; TokenType[TokenType["_void"] = _void] = "_void"; // void keyword prefix startsExpr
  const _delete = 99984; TokenType[TokenType["_delete"] = _delete] = "_delete"; // delete keyword prefix startsExpr
  const _async = 100880; TokenType[TokenType["_async"] = _async] = "_async"; // async keyword startsExpr
  const _get = 101904; TokenType[TokenType["_get"] = _get] = "_get"; // get keyword startsExpr
  const _set = 102928; TokenType[TokenType["_set"] = _set] = "_set"; // set keyword startsExpr
  const _declare = 103952; TokenType[TokenType["_declare"] = _declare] = "_declare"; // declare keyword startsExpr
  const _readonly = 104976; TokenType[TokenType["_readonly"] = _readonly] = "_readonly"; // readonly keyword startsExpr
  const _abstract = 106000; TokenType[TokenType["_abstract"] = _abstract] = "_abstract"; // abstract keyword startsExpr
  const _static = 107024; TokenType[TokenType["_static"] = _static] = "_static"; // static keyword startsExpr
  const _public = 107536; TokenType[TokenType["_public"] = _public] = "_public"; // public keyword
  const _private = 108560; TokenType[TokenType["_private"] = _private] = "_private"; // private keyword
  const _protected = 109584; TokenType[TokenType["_protected"] = _protected] = "_protected"; // protected keyword
  const _override = 110608; TokenType[TokenType["_override"] = _override] = "_override"; // override keyword
  const _as = 112144; TokenType[TokenType["_as"] = _as] = "_as"; // as keyword startsExpr
  const _enum = 113168; TokenType[TokenType["_enum"] = _enum] = "_enum"; // enum keyword startsExpr
  const _type = 114192; TokenType[TokenType["_type"] = _type] = "_type"; // type keyword startsExpr
  const _implements = 115216; TokenType[TokenType["_implements"] = _implements] = "_implements"; // implements keyword startsExpr
})(TokenType || (exports.TokenType = TokenType = {}));
 function formatTokenType(tokenType) {
  switch (tokenType) {
    case TokenType.num:
      return "num";
    case TokenType.bigint:
      return "bigint";
    case TokenType.decimal:
      return "decimal";
    case TokenType.regexp:
      return "regexp";
    case TokenType.string:
      return "string";
    case TokenType.name:
      return "name";
    case TokenType.eof:
      return "eof";
    case TokenType.bracketL:
      return "[";
    case TokenType.bracketR:
      return "]";
    case TokenType.braceL:
      return "{";
    case TokenType.braceBarL:
      return "{|";
    case TokenType.braceR:
      return "}";
    case TokenType.braceBarR:
      return "|}";
    case TokenType.parenL:
      return "(";
    case TokenType.parenR:
      return ")";
    case TokenType.comma:
      return ",";
    case TokenType.semi:
      return ";";
    case TokenType.colon:
      return ":";
    case TokenType.doubleColon:
      return "::";
    case TokenType.dot:
      return ".";
    case TokenType.question:
      return "?";
    case TokenType.questionDot:
      return "?.";
    case TokenType.arrow:
      return "=>";
    case TokenType.template:
      return "template";
    case TokenType.ellipsis:
      return "...";
    case TokenType.backQuote:
      return "`";
    case TokenType.dollarBraceL:
      return "${";
    case TokenType.at:
      return "@";
    case TokenType.hash:
      return "#";
    case TokenType.eq:
      return "=";
    case TokenType.assign:
      return "_=";
    case TokenType.preIncDec:
      return "++/--";
    case TokenType.postIncDec:
      return "++/--";
    case TokenType.bang:
      return "!";
    case TokenType.tilde:
      return "~";
    case TokenType.pipeline:
      return "|>";
    case TokenType.nullishCoalescing:
      return "??";
    case TokenType.logicalOR:
      return "||";
    case TokenType.logicalAND:
      return "&&";
    case TokenType.bitwiseOR:
      return "|";
    case TokenType.bitwiseXOR:
      return "^";
    case TokenType.bitwiseAND:
      return "&";
    case TokenType.equality:
      return "==/!=";
    case TokenType.lessThan:
      return "<";
    case TokenType.greaterThan:
      return ">";
    case TokenType.relationalOrEqual:
      return "<=/>=";
    case TokenType.bitShiftL:
      return "<<";
    case TokenType.bitShiftR:
      return ">>/>>>";
    case TokenType.plus:
      return "+";
    case TokenType.minus:
      return "-";
    case TokenType.modulo:
      return "%";
    case TokenType.star:
      return "*";
    case TokenType.slash:
      return "/";
    case TokenType.exponent:
      return "**";
    case TokenType.jsxName:
      return "jsxName";
    case TokenType.jsxText:
      return "jsxText";
    case TokenType.jsxEmptyText:
      return "jsxEmptyText";
    case TokenType.jsxTagStart:
      return "jsxTagStart";
    case TokenType.jsxTagEnd:
      return "jsxTagEnd";
    case TokenType.typeParameterStart:
      return "typeParameterStart";
    case TokenType.nonNullAssertion:
      return "nonNullAssertion";
    case TokenType._break:
      return "break";
    case TokenType._case:
      return "case";
    case TokenType._catch:
      return "catch";
    case TokenType._continue:
      return "continue";
    case TokenType._debugger:
      return "debugger";
    case TokenType._default:
      return "default";
    case TokenType._do:
      return "do";
    case TokenType._else:
      return "else";
    case TokenType._finally:
      return "finally";
    case TokenType._for:
      return "for";
    case TokenType._function:
      return "function";
    case TokenType._if:
      return "if";
    case TokenType._return:
      return "return";
    case TokenType._switch:
      return "switch";
    case TokenType._throw:
      return "throw";
    case TokenType._try:
      return "try";
    case TokenType._var:
      return "var";
    case TokenType._let:
      return "let";
    case TokenType._const:
      return "const";
    case TokenType._while:
      return "while";
    case TokenType._with:
      return "with";
    case TokenType._new:
      return "new";
    case TokenType._this:
      return "this";
    case TokenType._super:
      return "super";
    case TokenType._class:
      return "class";
    case TokenType._extends:
      return "extends";
    case TokenType._export:
      return "export";
    case TokenType._import:
      return "import";
    case TokenType._yield:
      return "yield";
    case TokenType._null:
      return "null";
    case TokenType._true:
      return "true";
    case TokenType._false:
      return "false";
    case TokenType._in:
      return "in";
    case TokenType._instanceof:
      return "instanceof";
    case TokenType._typeof:
      return "typeof";
    case TokenType._void:
      return "void";
    case TokenType._delete:
      return "delete";
    case TokenType._async:
      return "async";
    case TokenType._get:
      return "get";
    case TokenType._set:
      return "set";
    case TokenType._declare:
      return "declare";
    case TokenType._readonly:
      return "readonly";
    case TokenType._abstract:
      return "abstract";
    case TokenType._static:
      return "static";
    case TokenType._public:
      return "public";
    case TokenType._private:
      return "private";
    case TokenType._protected:
      return "protected";
    case TokenType._override:
      return "override";
    case TokenType._as:
      return "as";
    case TokenType._enum:
      return "enum";
    case TokenType._type:
      return "type";
    case TokenType._implements:
      return "implements";
    default:
      return "";
  }
} exports.formatTokenType = formatTokenType;


/***/ }),

/***/ 8022:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _state = __webpack_require__(8595); var _state2 = _interopRequireDefault(_state);
var _charcodes = __webpack_require__(1537);

 exports.isJSXEnabled;
 exports.isTypeScriptEnabled;
 exports.isFlowEnabled;
 exports.state;
 exports.input;
 exports.nextContextId;

 function getNextContextId() {
  return exports.nextContextId++;
} exports.getNextContextId = getNextContextId;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
 function augmentError(error) {
  if ("pos" in error) {
    const loc = locationForIndex(error.pos);
    error.message += ` (${loc.line}:${loc.column})`;
    error.loc = loc;
  }
  return error;
} exports.augmentError = augmentError;

 class Loc {
  
  
  constructor(line, column) {
    this.line = line;
    this.column = column;
  }
} exports.Loc = Loc;

 function locationForIndex(pos) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < pos; i++) {
    if (exports.input.charCodeAt(i) === _charcodes.charCodes.lineFeed) {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return new Loc(line, column);
} exports.locationForIndex = locationForIndex;

 function initParser(
  inputCode,
  isJSXEnabledArg,
  isTypeScriptEnabledArg,
  isFlowEnabledArg,
) {
  exports.input = inputCode;
  exports.state = new (0, _state2.default)();
  exports.nextContextId = 1;
  exports.isJSXEnabled = isJSXEnabledArg;
  exports.isTypeScriptEnabled = isTypeScriptEnabledArg;
  exports.isFlowEnabled = isFlowEnabledArg;
} exports.initParser = initParser;


/***/ }),

/***/ 745:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));/* eslint max-len: 0 */

// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser











var _flow = __webpack_require__(5741);
var _index = __webpack_require__(9390);
var _types = __webpack_require__(5798);









var _typescript = __webpack_require__(4789);












var _index3 = __webpack_require__(2297);
var _keywords = __webpack_require__(3464);
var _state = __webpack_require__(8595);
var _types3 = __webpack_require__(798);
var _charcodes = __webpack_require__(1537);
var _identifier = __webpack_require__(905);
var _base = __webpack_require__(8022);






var _lval = __webpack_require__(7212);







var _statement = __webpack_require__(1765);









var _util = __webpack_require__(8958);

 class StopState {
  
  constructor(stop) {
    this.stop = stop;
  }
} exports.StopState = StopState;

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function (s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.
 function parseExpression(noIn = false) {
  parseMaybeAssign(noIn);
  if (_index3.match.call(void 0, _types3.TokenType.comma)) {
    while (_index3.eat.call(void 0, _types3.TokenType.comma)) {
      parseMaybeAssign(noIn);
    }
  }
} exports.parseExpression = parseExpression;

/**
 * noIn is used when parsing a for loop so that we don't interpret a following "in" as the binary
 * operatior.
 * isWithinParens is used to indicate that we're parsing something that might be a comma expression
 * or might be an arrow function or might be a Flow type assertion (which requires explicit parens).
 * In these cases, we should allow : and ?: after the initial "left" part.
 */
 function parseMaybeAssign(noIn = false, isWithinParens = false) {
  if (_base.isTypeScriptEnabled) {
    return _typescript.tsParseMaybeAssign.call(void 0, noIn, isWithinParens);
  } else if (_base.isFlowEnabled) {
    return _flow.flowParseMaybeAssign.call(void 0, noIn, isWithinParens);
  } else {
    return baseParseMaybeAssign(noIn, isWithinParens);
  }
} exports.parseMaybeAssign = parseMaybeAssign;

// Parse an assignment expression. This includes applications of
// operators like `+=`.
// Returns true if the expression was an arrow function.
 function baseParseMaybeAssign(noIn, isWithinParens) {
  if (_index3.match.call(void 0, _types3.TokenType._yield)) {
    parseYield();
    return false;
  }

  if (_index3.match.call(void 0, _types3.TokenType.parenL) || _index3.match.call(void 0, _types3.TokenType.name) || _index3.match.call(void 0, _types3.TokenType._yield)) {
    _base.state.potentialArrowAt = _base.state.start;
  }

  const wasArrow = parseMaybeConditional(noIn);
  if (isWithinParens) {
    parseParenItem();
  }
  if (_base.state.type & _types3.TokenType.IS_ASSIGN) {
    _index3.next.call(void 0, );
    parseMaybeAssign(noIn);
    return false;
  }
  return wasArrow;
} exports.baseParseMaybeAssign = baseParseMaybeAssign;

// Parse a ternary conditional (`?:`) operator.
// Returns true if the expression was an arrow function.
function parseMaybeConditional(noIn) {
  const wasArrow = parseExprOps(noIn);
  if (wasArrow) {
    return true;
  }
  parseConditional(noIn);
  return false;
}

function parseConditional(noIn) {
  if (_base.isTypeScriptEnabled || _base.isFlowEnabled) {
    _types.typedParseConditional.call(void 0, noIn);
  } else {
    baseParseConditional(noIn);
  }
}

 function baseParseConditional(noIn) {
  if (_index3.eat.call(void 0, _types3.TokenType.question)) {
    parseMaybeAssign();
    _util.expect.call(void 0, _types3.TokenType.colon);
    parseMaybeAssign(noIn);
  }
} exports.baseParseConditional = baseParseConditional;

// Start the precedence parser.
// Returns true if this was an arrow function
function parseExprOps(noIn) {
  const startTokenIndex = _base.state.tokens.length;
  const wasArrow = parseMaybeUnary();
  if (wasArrow) {
    return true;
  }
  parseExprOp(startTokenIndex, -1, noIn);
  return false;
}

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.
function parseExprOp(startTokenIndex, minPrec, noIn) {
  if (
    _base.isTypeScriptEnabled &&
    (_types3.TokenType._in & _types3.TokenType.PRECEDENCE_MASK) > minPrec &&
    !_util.hasPrecedingLineBreak.call(void 0, ) &&
    (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._as) || _util.eatContextual.call(void 0, _keywords.ContextualKeyword._satisfies))
  ) {
    const oldIsType = _index3.pushTypeContext.call(void 0, 1);
    _typescript.tsParseType.call(void 0, );
    _index3.popTypeContext.call(void 0, oldIsType);
    _index3.rescan_gt.call(void 0, );
    parseExprOp(startTokenIndex, minPrec, noIn);
    return;
  }

  const prec = _base.state.type & _types3.TokenType.PRECEDENCE_MASK;
  if (prec > 0 && (!noIn || !_index3.match.call(void 0, _types3.TokenType._in))) {
    if (prec > minPrec) {
      const op = _base.state.type;
      _index3.next.call(void 0, );
      if (op === _types3.TokenType.nullishCoalescing) {
        _base.state.tokens[_base.state.tokens.length - 1].nullishStartIndex = startTokenIndex;
      }

      const rhsStartTokenIndex = _base.state.tokens.length;
      parseMaybeUnary();
      // Extend the right operand of this operator if possible.
      parseExprOp(rhsStartTokenIndex, op & _types3.TokenType.IS_RIGHT_ASSOCIATIVE ? prec - 1 : prec, noIn);
      if (op === _types3.TokenType.nullishCoalescing) {
        _base.state.tokens[startTokenIndex].numNullishCoalesceStarts++;
        _base.state.tokens[_base.state.tokens.length - 1].numNullishCoalesceEnds++;
      }
      // Continue with any future operator holding this expression as the left operand.
      parseExprOp(startTokenIndex, minPrec, noIn);
    }
  }
}

// Parse unary operators, both prefix and postfix.
// Returns true if this was an arrow function.
 function parseMaybeUnary() {
  if (_base.isTypeScriptEnabled && !_base.isJSXEnabled && _index3.eat.call(void 0, _types3.TokenType.lessThan)) {
    _typescript.tsParseTypeAssertion.call(void 0, );
    return false;
  }
  if (
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._module) &&
    _index3.lookaheadCharCode.call(void 0, ) === _charcodes.charCodes.leftCurlyBrace &&
    !_util.hasFollowingLineBreak.call(void 0, )
  ) {
    parseModuleExpression();
    return false;
  }
  if (_base.state.type & _types3.TokenType.IS_PREFIX) {
    _index3.next.call(void 0, );
    parseMaybeUnary();
    return false;
  }

  const wasArrow = parseExprSubscripts();
  if (wasArrow) {
    return true;
  }
  while (_base.state.type & _types3.TokenType.IS_POSTFIX && !_util.canInsertSemicolon.call(void 0, )) {
    // The tokenizer calls everything a preincrement, so make it a postincrement when
    // we see it in that context.
    if (_base.state.type === _types3.TokenType.preIncDec) {
      _base.state.type = _types3.TokenType.postIncDec;
    }
    _index3.next.call(void 0, );
  }
  return false;
} exports.parseMaybeUnary = parseMaybeUnary;

// Parse call, dot, and `[]`-subscript expressions.
// Returns true if this was an arrow function.
 function parseExprSubscripts() {
  const startTokenIndex = _base.state.tokens.length;
  const wasArrow = parseExprAtom();
  if (wasArrow) {
    return true;
  }
  parseSubscripts(startTokenIndex);
  // If there was any optional chain operation, the start token would be marked
  // as such, so also mark the end now.
  if (_base.state.tokens.length > startTokenIndex && _base.state.tokens[startTokenIndex].isOptionalChainStart) {
    _base.state.tokens[_base.state.tokens.length - 1].isOptionalChainEnd = true;
  }
  return false;
} exports.parseExprSubscripts = parseExprSubscripts;

function parseSubscripts(startTokenIndex, noCalls = false) {
  if (_base.isFlowEnabled) {
    _flow.flowParseSubscripts.call(void 0, startTokenIndex, noCalls);
  } else {
    baseParseSubscripts(startTokenIndex, noCalls);
  }
}

 function baseParseSubscripts(startTokenIndex, noCalls = false) {
  const stopState = new StopState(false);
  do {
    parseSubscript(startTokenIndex, noCalls, stopState);
  } while (!stopState.stop && !_base.state.error);
} exports.baseParseSubscripts = baseParseSubscripts;

function parseSubscript(startTokenIndex, noCalls, stopState) {
  if (_base.isTypeScriptEnabled) {
    _typescript.tsParseSubscript.call(void 0, startTokenIndex, noCalls, stopState);
  } else if (_base.isFlowEnabled) {
    _flow.flowParseSubscript.call(void 0, startTokenIndex, noCalls, stopState);
  } else {
    baseParseSubscript(startTokenIndex, noCalls, stopState);
  }
}

/** Set 'state.stop = true' to indicate that we should stop parsing subscripts. */
 function baseParseSubscript(
  startTokenIndex,
  noCalls,
  stopState,
) {
  if (!noCalls && _index3.eat.call(void 0, _types3.TokenType.doubleColon)) {
    parseNoCallExpr();
    stopState.stop = true;
    // Propagate startTokenIndex so that `a::b?.()` will keep `a` as the first token. We may want
    // to revisit this in the future when fully supporting bind syntax.
    parseSubscripts(startTokenIndex, noCalls);
  } else if (_index3.match.call(void 0, _types3.TokenType.questionDot)) {
    _base.state.tokens[startTokenIndex].isOptionalChainStart = true;
    if (noCalls && _index3.lookaheadType.call(void 0, ) === _types3.TokenType.parenL) {
      stopState.stop = true;
      return;
    }
    _index3.next.call(void 0, );
    _base.state.tokens[_base.state.tokens.length - 1].subscriptStartIndex = startTokenIndex;

    if (_index3.eat.call(void 0, _types3.TokenType.bracketL)) {
      parseExpression();
      _util.expect.call(void 0, _types3.TokenType.bracketR);
    } else if (_index3.eat.call(void 0, _types3.TokenType.parenL)) {
      parseCallExpressionArguments();
    } else {
      parseMaybePrivateName();
    }
  } else if (_index3.eat.call(void 0, _types3.TokenType.dot)) {
    _base.state.tokens[_base.state.tokens.length - 1].subscriptStartIndex = startTokenIndex;
    parseMaybePrivateName();
  } else if (_index3.eat.call(void 0, _types3.TokenType.bracketL)) {
    _base.state.tokens[_base.state.tokens.length - 1].subscriptStartIndex = startTokenIndex;
    parseExpression();
    _util.expect.call(void 0, _types3.TokenType.bracketR);
  } else if (!noCalls && _index3.match.call(void 0, _types3.TokenType.parenL)) {
    if (atPossibleAsync()) {
      // We see "async", but it's possible it's a usage of the name "async". Parse as if it's a
      // function call, and if we see an arrow later, backtrack and re-parse as a parameter list.
      const snapshot = _base.state.snapshot();
      const asyncStartTokenIndex = _base.state.tokens.length;
      _index3.next.call(void 0, );
      _base.state.tokens[_base.state.tokens.length - 1].subscriptStartIndex = startTokenIndex;

      const callContextId = _base.getNextContextId.call(void 0, );

      _base.state.tokens[_base.state.tokens.length - 1].contextId = callContextId;
      parseCallExpressionArguments();
      _base.state.tokens[_base.state.tokens.length - 1].contextId = callContextId;

      if (shouldParseAsyncArrow()) {
        // We hit an arrow, so backtrack and start again parsing function parameters.
        _base.state.restoreFromSnapshot(snapshot);
        stopState.stop = true;
        _base.state.scopeDepth++;

        _statement.parseFunctionParams.call(void 0, );
        parseAsyncArrowFromCallExpression(asyncStartTokenIndex);
      }
    } else {
      _index3.next.call(void 0, );
      _base.state.tokens[_base.state.tokens.length - 1].subscriptStartIndex = startTokenIndex;
      const callContextId = _base.getNextContextId.call(void 0, );
      _base.state.tokens[_base.state.tokens.length - 1].contextId = callContextId;
      parseCallExpressionArguments();
      _base.state.tokens[_base.state.tokens.length - 1].contextId = callContextId;
    }
  } else if (_index3.match.call(void 0, _types3.TokenType.backQuote)) {
    // Tagged template expression.
    parseTemplate();
  } else {
    stopState.stop = true;
  }
} exports.baseParseSubscript = baseParseSubscript;

 function atPossibleAsync() {
  // This was made less strict than the original version to avoid passing around nodes, but it
  // should be safe to have rare false positives here.
  return (
    _base.state.tokens[_base.state.tokens.length - 1].contextualKeyword === _keywords.ContextualKeyword._async &&
    !_util.canInsertSemicolon.call(void 0, )
  );
} exports.atPossibleAsync = atPossibleAsync;

 function parseCallExpressionArguments() {
  let first = true;
  while (!_index3.eat.call(void 0, _types3.TokenType.parenR) && !_base.state.error) {
    if (first) {
      first = false;
    } else {
      _util.expect.call(void 0, _types3.TokenType.comma);
      if (_index3.eat.call(void 0, _types3.TokenType.parenR)) {
        break;
      }
    }

    parseExprListItem(false);
  }
} exports.parseCallExpressionArguments = parseCallExpressionArguments;

function shouldParseAsyncArrow() {
  return _index3.match.call(void 0, _types3.TokenType.colon) || _index3.match.call(void 0, _types3.TokenType.arrow);
}

function parseAsyncArrowFromCallExpression(startTokenIndex) {
  if (_base.isTypeScriptEnabled) {
    _typescript.tsStartParseAsyncArrowFromCallExpression.call(void 0, );
  } else if (_base.isFlowEnabled) {
    _flow.flowStartParseAsyncArrowFromCallExpression.call(void 0, );
  }
  _util.expect.call(void 0, _types3.TokenType.arrow);
  parseArrowExpression(startTokenIndex);
}

// Parse a no-call expression (like argument of `new` or `::` operators).

function parseNoCallExpr() {
  const startTokenIndex = _base.state.tokens.length;
  parseExprAtom();
  parseSubscripts(startTokenIndex, true);
}

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.
// Returns true if the parsed expression was an arrow function.
 function parseExprAtom() {
  if (_index3.eat.call(void 0, _types3.TokenType.modulo)) {
    // V8 intrinsic expression. Just parse the identifier, and the function invocation is parsed
    // naturally.
    parseIdentifier();
    return false;
  }

  if (_index3.match.call(void 0, _types3.TokenType.jsxText) || _index3.match.call(void 0, _types3.TokenType.jsxEmptyText)) {
    parseLiteral();
    return false;
  } else if (_index3.match.call(void 0, _types3.TokenType.lessThan) && _base.isJSXEnabled) {
    _base.state.type = _types3.TokenType.jsxTagStart;
    _index.jsxParseElement.call(void 0, );
    _index3.next.call(void 0, );
    return false;
  }

  const canBeArrow = _base.state.potentialArrowAt === _base.state.start;
  switch (_base.state.type) {
    case _types3.TokenType.slash:
    case _types3.TokenType.assign:
      _index3.retokenizeSlashAsRegex.call(void 0, );
    // Fall through.

    case _types3.TokenType._super:
    case _types3.TokenType._this:
    case _types3.TokenType.regexp:
    case _types3.TokenType.num:
    case _types3.TokenType.bigint:
    case _types3.TokenType.decimal:
    case _types3.TokenType.string:
    case _types3.TokenType._null:
    case _types3.TokenType._true:
    case _types3.TokenType._false:
      _index3.next.call(void 0, );
      return false;

    case _types3.TokenType._import:
      _index3.next.call(void 0, );
      if (_index3.match.call(void 0, _types3.TokenType.dot)) {
        // import.meta
        _base.state.tokens[_base.state.tokens.length - 1].type = _types3.TokenType.name;
        _index3.next.call(void 0, );
        parseIdentifier();
      }
      return false;

    case _types3.TokenType.name: {
      const startTokenIndex = _base.state.tokens.length;
      const functionStart = _base.state.start;
      const contextualKeyword = _base.state.contextualKeyword;
      parseIdentifier();
      if (contextualKeyword === _keywords.ContextualKeyword._await) {
        parseAwait();
        return false;
      } else if (
        contextualKeyword === _keywords.ContextualKeyword._async &&
        _index3.match.call(void 0, _types3.TokenType._function) &&
        !_util.canInsertSemicolon.call(void 0, )
      ) {
        _index3.next.call(void 0, );
        _statement.parseFunction.call(void 0, functionStart, false);
        return false;
      } else if (
        canBeArrow &&
        contextualKeyword === _keywords.ContextualKeyword._async &&
        !_util.canInsertSemicolon.call(void 0, ) &&
        _index3.match.call(void 0, _types3.TokenType.name)
      ) {
        _base.state.scopeDepth++;
        _lval.parseBindingIdentifier.call(void 0, false);
        _util.expect.call(void 0, _types3.TokenType.arrow);
        // let foo = async bar => {};
        parseArrowExpression(startTokenIndex);
        return true;
      } else if (_index3.match.call(void 0, _types3.TokenType._do) && !_util.canInsertSemicolon.call(void 0, )) {
        _index3.next.call(void 0, );
        _statement.parseBlock.call(void 0, );
        return false;
      }

      if (canBeArrow && !_util.canInsertSemicolon.call(void 0, ) && _index3.match.call(void 0, _types3.TokenType.arrow)) {
        _base.state.scopeDepth++;
        _lval.markPriorBindingIdentifier.call(void 0, false);
        _util.expect.call(void 0, _types3.TokenType.arrow);
        parseArrowExpression(startTokenIndex);
        return true;
      }

      _base.state.tokens[_base.state.tokens.length - 1].identifierRole = _index3.IdentifierRole.Access;
      return false;
    }

    case _types3.TokenType._do: {
      _index3.next.call(void 0, );
      _statement.parseBlock.call(void 0, );
      return false;
    }

    case _types3.TokenType.parenL: {
      const wasArrow = parseParenAndDistinguishExpression(canBeArrow);
      return wasArrow;
    }

    case _types3.TokenType.bracketL:
      _index3.next.call(void 0, );
      parseExprList(_types3.TokenType.bracketR, true);
      return false;

    case _types3.TokenType.braceL:
      parseObj(false, false);
      return false;

    case _types3.TokenType._function:
      parseFunctionExpression();
      return false;

    case _types3.TokenType.at:
      _statement.parseDecorators.call(void 0, );
    // Fall through.

    case _types3.TokenType._class:
      _statement.parseClass.call(void 0, false);
      return false;

    case _types3.TokenType._new:
      parseNew();
      return false;

    case _types3.TokenType.backQuote:
      parseTemplate();
      return false;

    case _types3.TokenType.doubleColon: {
      _index3.next.call(void 0, );
      parseNoCallExpr();
      return false;
    }

    case _types3.TokenType.hash: {
      const code = _index3.lookaheadCharCode.call(void 0, );
      if (_identifier.IS_IDENTIFIER_START[code] || code === _charcodes.charCodes.backslash) {
        parseMaybePrivateName();
      } else {
        _index3.next.call(void 0, );
      }
      // Smart pipeline topic reference.
      return false;
    }

    default:
      _util.unexpected.call(void 0, );
      return false;
  }
} exports.parseExprAtom = parseExprAtom;

function parseMaybePrivateName() {
  _index3.eat.call(void 0, _types3.TokenType.hash);
  parseIdentifier();
}

function parseFunctionExpression() {
  const functionStart = _base.state.start;
  parseIdentifier();
  if (_index3.eat.call(void 0, _types3.TokenType.dot)) {
    // function.sent
    parseIdentifier();
  }
  _statement.parseFunction.call(void 0, functionStart, false);
}

 function parseLiteral() {
  _index3.next.call(void 0, );
} exports.parseLiteral = parseLiteral;

 function parseParenExpression() {
  _util.expect.call(void 0, _types3.TokenType.parenL);
  parseExpression();
  _util.expect.call(void 0, _types3.TokenType.parenR);
} exports.parseParenExpression = parseParenExpression;

// Returns true if this was an arrow expression.
function parseParenAndDistinguishExpression(canBeArrow) {
  // Assume this is a normal parenthesized expression, but if we see an arrow, we'll bail and
  // start over as a parameter list.
  const snapshot = _base.state.snapshot();

  const startTokenIndex = _base.state.tokens.length;
  _util.expect.call(void 0, _types3.TokenType.parenL);

  let first = true;

  while (!_index3.match.call(void 0, _types3.TokenType.parenR) && !_base.state.error) {
    if (first) {
      first = false;
    } else {
      _util.expect.call(void 0, _types3.TokenType.comma);
      if (_index3.match.call(void 0, _types3.TokenType.parenR)) {
        break;
      }
    }

    if (_index3.match.call(void 0, _types3.TokenType.ellipsis)) {
      _lval.parseRest.call(void 0, false /* isBlockScope */);
      parseParenItem();
      break;
    } else {
      parseMaybeAssign(false, true);
    }
  }

  _util.expect.call(void 0, _types3.TokenType.parenR);

  if (canBeArrow && shouldParseArrow()) {
    const wasArrow = parseArrow();
    if (wasArrow) {
      // It was an arrow function this whole time, so start over and parse it as params so that we
      // get proper token annotations.
      _base.state.restoreFromSnapshot(snapshot);
      _base.state.scopeDepth++;
      // Don't specify a context ID because arrow functions don't need a context ID.
      _statement.parseFunctionParams.call(void 0, );
      parseArrow();
      parseArrowExpression(startTokenIndex);
      if (_base.state.error) {
        // Nevermind! This must have been something that looks very much like an
        // arrow function but where its "parameter list" isn't actually a valid
        // parameter list. Force non-arrow parsing.
        // See https://github.com/alangpierce/sucrase/issues/666 for an example.
        _base.state.restoreFromSnapshot(snapshot);
        parseParenAndDistinguishExpression(false);
        return false;
      }
      return true;
    }
  }

  return false;
}

function shouldParseArrow() {
  return _index3.match.call(void 0, _types3.TokenType.colon) || !_util.canInsertSemicolon.call(void 0, );
}

// Returns whether there was an arrow token.
 function parseArrow() {
  if (_base.isTypeScriptEnabled) {
    return _typescript.tsParseArrow.call(void 0, );
  } else if (_base.isFlowEnabled) {
    return _flow.flowParseArrow.call(void 0, );
  } else {
    return _index3.eat.call(void 0, _types3.TokenType.arrow);
  }
} exports.parseArrow = parseArrow;

function parseParenItem() {
  if (_base.isTypeScriptEnabled || _base.isFlowEnabled) {
    _types.typedParseParenItem.call(void 0, );
  }
}

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.
function parseNew() {
  _util.expect.call(void 0, _types3.TokenType._new);
  if (_index3.eat.call(void 0, _types3.TokenType.dot)) {
    // new.target
    parseIdentifier();
    return;
  }
  parseNewCallee();
  if (_base.isFlowEnabled) {
    _flow.flowStartParseNewArguments.call(void 0, );
  }
  if (_index3.eat.call(void 0, _types3.TokenType.parenL)) {
    parseExprList(_types3.TokenType.parenR);
  }
}

function parseNewCallee() {
  parseNoCallExpr();
  _index3.eat.call(void 0, _types3.TokenType.questionDot);
}

 function parseTemplate() {
  // Finish `, read quasi
  _index3.nextTemplateToken.call(void 0, );
  // Finish quasi, read ${
  _index3.nextTemplateToken.call(void 0, );
  while (!_index3.match.call(void 0, _types3.TokenType.backQuote) && !_base.state.error) {
    _util.expect.call(void 0, _types3.TokenType.dollarBraceL);
    parseExpression();
    // Finish }, read quasi
    _index3.nextTemplateToken.call(void 0, );
    // Finish quasi, read either ${ or `
    _index3.nextTemplateToken.call(void 0, );
  }
  _index3.next.call(void 0, );
} exports.parseTemplate = parseTemplate;

// Parse an object literal or binding pattern.
 function parseObj(isPattern, isBlockScope) {
  // Attach a context ID to the object open and close brace and each object key.
  const contextId = _base.getNextContextId.call(void 0, );
  let first = true;

  _index3.next.call(void 0, );
  _base.state.tokens[_base.state.tokens.length - 1].contextId = contextId;

  while (!_index3.eat.call(void 0, _types3.TokenType.braceR) && !_base.state.error) {
    if (first) {
      first = false;
    } else {
      _util.expect.call(void 0, _types3.TokenType.comma);
      if (_index3.eat.call(void 0, _types3.TokenType.braceR)) {
        break;
      }
    }

    let isGenerator = false;
    if (_index3.match.call(void 0, _types3.TokenType.ellipsis)) {
      const previousIndex = _base.state.tokens.length;
      _lval.parseSpread.call(void 0, );
      if (isPattern) {
        // Mark role when the only thing being spread over is an identifier.
        if (_base.state.tokens.length === previousIndex + 2) {
          _lval.markPriorBindingIdentifier.call(void 0, isBlockScope);
        }
        if (_index3.eat.call(void 0, _types3.TokenType.braceR)) {
          break;
        }
      }
      continue;
    }

    if (!isPattern) {
      isGenerator = _index3.eat.call(void 0, _types3.TokenType.star);
    }

    if (!isPattern && _util.isContextual.call(void 0, _keywords.ContextualKeyword._async)) {
      if (isGenerator) _util.unexpected.call(void 0, );

      parseIdentifier();
      if (
        _index3.match.call(void 0, _types3.TokenType.colon) ||
        _index3.match.call(void 0, _types3.TokenType.parenL) ||
        _index3.match.call(void 0, _types3.TokenType.braceR) ||
        _index3.match.call(void 0, _types3.TokenType.eq) ||
        _index3.match.call(void 0, _types3.TokenType.comma)
      ) {
        // This is a key called "async" rather than an async function.
      } else {
        if (_index3.match.call(void 0, _types3.TokenType.star)) {
          _index3.next.call(void 0, );
          isGenerator = true;
        }
        parsePropertyName(contextId);
      }
    } else {
      parsePropertyName(contextId);
    }

    parseObjPropValue(isPattern, isBlockScope, contextId);
  }

  _base.state.tokens[_base.state.tokens.length - 1].contextId = contextId;
} exports.parseObj = parseObj;

function isGetterOrSetterMethod(isPattern) {
  // We go off of the next and don't bother checking if the node key is actually "get" or "set".
  // This lets us avoid generating a node, and should only make the validation worse.
  return (
    !isPattern &&
    (_index3.match.call(void 0, _types3.TokenType.string) || // get "string"() {}
      _index3.match.call(void 0, _types3.TokenType.num) || // get 1() {}
      _index3.match.call(void 0, _types3.TokenType.bracketL) || // get ["string"]() {}
      _index3.match.call(void 0, _types3.TokenType.name) || // get foo() {}
      !!(_base.state.type & _types3.TokenType.IS_KEYWORD)) // get debugger() {}
  );
}

// Returns true if this was a method.
function parseObjectMethod(isPattern, objectContextId) {
  // We don't need to worry about modifiers because object methods can't have optional bodies, so
  // the start will never be used.
  const functionStart = _base.state.start;
  if (_index3.match.call(void 0, _types3.TokenType.parenL)) {
    if (isPattern) _util.unexpected.call(void 0, );
    parseMethod(functionStart, /* isConstructor */ false);
    return true;
  }

  if (isGetterOrSetterMethod(isPattern)) {
    parsePropertyName(objectContextId);
    parseMethod(functionStart, /* isConstructor */ false);
    return true;
  }
  return false;
}

function parseObjectProperty(isPattern, isBlockScope) {
  if (_index3.eat.call(void 0, _types3.TokenType.colon)) {
    if (isPattern) {
      _lval.parseMaybeDefault.call(void 0, isBlockScope);
    } else {
      parseMaybeAssign(false);
    }
    return;
  }

  // Since there's no colon, we assume this is an object shorthand.

  // If we're in a destructuring, we've now discovered that the key was actually an assignee, so
  // we need to tag it as a declaration with the appropriate scope. Otherwise, we might need to
  // transform it on access, so mark it as a normal object shorthand.
  let identifierRole;
  if (isPattern) {
    if (_base.state.scopeDepth === 0) {
      identifierRole = _index3.IdentifierRole.ObjectShorthandTopLevelDeclaration;
    } else if (isBlockScope) {
      identifierRole = _index3.IdentifierRole.ObjectShorthandBlockScopedDeclaration;
    } else {
      identifierRole = _index3.IdentifierRole.ObjectShorthandFunctionScopedDeclaration;
    }
  } else {
    identifierRole = _index3.IdentifierRole.ObjectShorthand;
  }
  _base.state.tokens[_base.state.tokens.length - 1].identifierRole = identifierRole;

  // Regardless of whether we know this to be a pattern or if we're in an ambiguous context, allow
  // parsing as if there's a default value.
  _lval.parseMaybeDefault.call(void 0, isBlockScope, true);
}

function parseObjPropValue(
  isPattern,
  isBlockScope,
  objectContextId,
) {
  if (_base.isTypeScriptEnabled) {
    _typescript.tsStartParseObjPropValue.call(void 0, );
  } else if (_base.isFlowEnabled) {
    _flow.flowStartParseObjPropValue.call(void 0, );
  }
  const wasMethod = parseObjectMethod(isPattern, objectContextId);
  if (!wasMethod) {
    parseObjectProperty(isPattern, isBlockScope);
  }
}

 function parsePropertyName(objectContextId) {
  if (_base.isFlowEnabled) {
    _flow.flowParseVariance.call(void 0, );
  }
  if (_index3.eat.call(void 0, _types3.TokenType.bracketL)) {
    _base.state.tokens[_base.state.tokens.length - 1].contextId = objectContextId;
    parseMaybeAssign();
    _util.expect.call(void 0, _types3.TokenType.bracketR);
    _base.state.tokens[_base.state.tokens.length - 1].contextId = objectContextId;
  } else {
    if (_index3.match.call(void 0, _types3.TokenType.num) || _index3.match.call(void 0, _types3.TokenType.string) || _index3.match.call(void 0, _types3.TokenType.bigint) || _index3.match.call(void 0, _types3.TokenType.decimal)) {
      parseExprAtom();
    } else {
      parseMaybePrivateName();
    }

    _base.state.tokens[_base.state.tokens.length - 1].identifierRole = _index3.IdentifierRole.ObjectKey;
    _base.state.tokens[_base.state.tokens.length - 1].contextId = objectContextId;
  }
} exports.parsePropertyName = parsePropertyName;

// Parse object or class method.
 function parseMethod(functionStart, isConstructor) {
  const funcContextId = _base.getNextContextId.call(void 0, );

  _base.state.scopeDepth++;
  const startTokenIndex = _base.state.tokens.length;
  const allowModifiers = isConstructor; // For TypeScript parameter properties
  _statement.parseFunctionParams.call(void 0, allowModifiers, funcContextId);
  parseFunctionBodyAndFinish(functionStart, funcContextId);
  const endTokenIndex = _base.state.tokens.length;
  _base.state.scopes.push(new (0, _state.Scope)(startTokenIndex, endTokenIndex, true));
  _base.state.scopeDepth--;
} exports.parseMethod = parseMethod;

// Parse arrow function expression.
// If the parameters are provided, they will be converted to an
// assignable list.
 function parseArrowExpression(startTokenIndex) {
  parseFunctionBody(true);
  const endTokenIndex = _base.state.tokens.length;
  _base.state.scopes.push(new (0, _state.Scope)(startTokenIndex, endTokenIndex, true));
  _base.state.scopeDepth--;
} exports.parseArrowExpression = parseArrowExpression;

 function parseFunctionBodyAndFinish(functionStart, funcContextId = 0) {
  if (_base.isTypeScriptEnabled) {
    _typescript.tsParseFunctionBodyAndFinish.call(void 0, functionStart, funcContextId);
  } else if (_base.isFlowEnabled) {
    _flow.flowParseFunctionBodyAndFinish.call(void 0, funcContextId);
  } else {
    parseFunctionBody(false, funcContextId);
  }
} exports.parseFunctionBodyAndFinish = parseFunctionBodyAndFinish;

 function parseFunctionBody(allowExpression, funcContextId = 0) {
  const isExpression = allowExpression && !_index3.match.call(void 0, _types3.TokenType.braceL);

  if (isExpression) {
    parseMaybeAssign();
  } else {
    _statement.parseBlock.call(void 0, true /* isFunctionScope */, funcContextId);
  }
} exports.parseFunctionBody = parseFunctionBody;

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

function parseExprList(close, allowEmpty = false) {
  let first = true;
  while (!_index3.eat.call(void 0, close) && !_base.state.error) {
    if (first) {
      first = false;
    } else {
      _util.expect.call(void 0, _types3.TokenType.comma);
      if (_index3.eat.call(void 0, close)) break;
    }
    parseExprListItem(allowEmpty);
  }
}

function parseExprListItem(allowEmpty) {
  if (allowEmpty && _index3.match.call(void 0, _types3.TokenType.comma)) {
    // Empty item; nothing more to parse for this item.
  } else if (_index3.match.call(void 0, _types3.TokenType.ellipsis)) {
    _lval.parseSpread.call(void 0, );
    parseParenItem();
  } else if (_index3.match.call(void 0, _types3.TokenType.question)) {
    // Partial function application proposal.
    _index3.next.call(void 0, );
  } else {
    parseMaybeAssign(false, true);
  }
}

// Parse the next token as an identifier.
 function parseIdentifier() {
  _index3.next.call(void 0, );
  _base.state.tokens[_base.state.tokens.length - 1].type = _types3.TokenType.name;
} exports.parseIdentifier = parseIdentifier;

// Parses await expression inside async function.
function parseAwait() {
  parseMaybeUnary();
}

// Parses yield expression inside generator.
function parseYield() {
  _index3.next.call(void 0, );
  if (!_index3.match.call(void 0, _types3.TokenType.semi) && !_util.canInsertSemicolon.call(void 0, )) {
    _index3.eat.call(void 0, _types3.TokenType.star);
    parseMaybeAssign();
  }
}

// https://github.com/tc39/proposal-js-module-blocks
function parseModuleExpression() {
  _util.expectContextual.call(void 0, _keywords.ContextualKeyword._module);
  _util.expect.call(void 0, _types3.TokenType.braceL);
  // For now, just call parseBlockBody to parse the block. In the future when we
  // implement full support, we'll want to emit scopes and possibly other
  // information.
  _statement.parseBlockBody.call(void 0, _types3.TokenType.braceR);
}


/***/ }),

/***/ 4893:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));
var _index = __webpack_require__(2297);
var _charcodes = __webpack_require__(1537);
var _base = __webpack_require__(8022);
var _statement = __webpack_require__(1765);

 function parseFile() {
  // If enabled, skip leading hashbang line.
  if (
    _base.state.pos === 0 &&
    _base.input.charCodeAt(0) === _charcodes.charCodes.numberSign &&
    _base.input.charCodeAt(1) === _charcodes.charCodes.exclamationMark
  ) {
    _index.skipLineComment.call(void 0, 2);
  }
  _index.nextToken.call(void 0, );
  return _statement.parseTopLevel.call(void 0, );
} exports.parseFile = parseFile;


/***/ }),

/***/ 7212:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _flow = __webpack_require__(5741);
var _typescript = __webpack_require__(4789);







var _index = __webpack_require__(2297);
var _keywords = __webpack_require__(3464);
var _types = __webpack_require__(798);
var _base = __webpack_require__(8022);
var _expression = __webpack_require__(745);
var _util = __webpack_require__(8958);

 function parseSpread() {
  _index.next.call(void 0, );
  _expression.parseMaybeAssign.call(void 0, false);
} exports.parseSpread = parseSpread;

 function parseRest(isBlockScope) {
  _index.next.call(void 0, );
  parseBindingAtom(isBlockScope);
} exports.parseRest = parseRest;

 function parseBindingIdentifier(isBlockScope) {
  _expression.parseIdentifier.call(void 0, );
  markPriorBindingIdentifier(isBlockScope);
} exports.parseBindingIdentifier = parseBindingIdentifier;

 function parseImportedIdentifier() {
  _expression.parseIdentifier.call(void 0, );
  _base.state.tokens[_base.state.tokens.length - 1].identifierRole = _index.IdentifierRole.ImportDeclaration;
} exports.parseImportedIdentifier = parseImportedIdentifier;

 function markPriorBindingIdentifier(isBlockScope) {
  let identifierRole;
  if (_base.state.scopeDepth === 0) {
    identifierRole = _index.IdentifierRole.TopLevelDeclaration;
  } else if (isBlockScope) {
    identifierRole = _index.IdentifierRole.BlockScopedDeclaration;
  } else {
    identifierRole = _index.IdentifierRole.FunctionScopedDeclaration;
  }
  _base.state.tokens[_base.state.tokens.length - 1].identifierRole = identifierRole;
} exports.markPriorBindingIdentifier = markPriorBindingIdentifier;

// Parses lvalue (assignable) atom.
 function parseBindingAtom(isBlockScope) {
  switch (_base.state.type) {
    case _types.TokenType._this: {
      // In TypeScript, "this" may be the name of a parameter, so allow it.
      const oldIsType = _index.pushTypeContext.call(void 0, 0);
      _index.next.call(void 0, );
      _index.popTypeContext.call(void 0, oldIsType);
      return;
    }

    case _types.TokenType._yield:
    case _types.TokenType.name: {
      _base.state.type = _types.TokenType.name;
      parseBindingIdentifier(isBlockScope);
      return;
    }

    case _types.TokenType.bracketL: {
      _index.next.call(void 0, );
      parseBindingList(_types.TokenType.bracketR, isBlockScope, true /* allowEmpty */);
      return;
    }

    case _types.TokenType.braceL:
      _expression.parseObj.call(void 0, true, isBlockScope);
      return;

    default:
      _util.unexpected.call(void 0, );
  }
} exports.parseBindingAtom = parseBindingAtom;

 function parseBindingList(
  close,
  isBlockScope,
  allowEmpty = false,
  allowModifiers = false,
  contextId = 0,
) {
  let first = true;

  let hasRemovedComma = false;
  const firstItemTokenIndex = _base.state.tokens.length;

  while (!_index.eat.call(void 0, close) && !_base.state.error) {
    if (first) {
      first = false;
    } else {
      _util.expect.call(void 0, _types.TokenType.comma);
      _base.state.tokens[_base.state.tokens.length - 1].contextId = contextId;
      // After a "this" type in TypeScript, we need to set the following comma (if any) to also be
      // a type token so that it will be removed.
      if (!hasRemovedComma && _base.state.tokens[firstItemTokenIndex].isType) {
        _base.state.tokens[_base.state.tokens.length - 1].isType = true;
        hasRemovedComma = true;
      }
    }
    if (allowEmpty && _index.match.call(void 0, _types.TokenType.comma)) {
      // Empty item; nothing further to parse for this item.
    } else if (_index.eat.call(void 0, close)) {
      break;
    } else if (_index.match.call(void 0, _types.TokenType.ellipsis)) {
      parseRest(isBlockScope);
      parseAssignableListItemTypes();
      // Support rest element trailing commas allowed by TypeScript <2.9.
      _index.eat.call(void 0, _types.TokenType.comma);
      _util.expect.call(void 0, close);
      break;
    } else {
      parseAssignableListItem(allowModifiers, isBlockScope);
    }
  }
} exports.parseBindingList = parseBindingList;

function parseAssignableListItem(allowModifiers, isBlockScope) {
  if (allowModifiers) {
    _typescript.tsParseModifiers.call(void 0, [
      _keywords.ContextualKeyword._public,
      _keywords.ContextualKeyword._protected,
      _keywords.ContextualKeyword._private,
      _keywords.ContextualKeyword._readonly,
      _keywords.ContextualKeyword._override,
    ]);
  }

  parseMaybeDefault(isBlockScope);
  parseAssignableListItemTypes();
  parseMaybeDefault(isBlockScope, true /* leftAlreadyParsed */);
}

function parseAssignableListItemTypes() {
  if (_base.isFlowEnabled) {
    _flow.flowParseAssignableListItemTypes.call(void 0, );
  } else if (_base.isTypeScriptEnabled) {
    _typescript.tsParseAssignableListItemTypes.call(void 0, );
  }
}

// Parses assignment pattern around given atom if possible.
 function parseMaybeDefault(isBlockScope, leftAlreadyParsed = false) {
  if (!leftAlreadyParsed) {
    parseBindingAtom(isBlockScope);
  }
  if (!_index.eat.call(void 0, _types.TokenType.eq)) {
    return;
  }
  const eqIndex = _base.state.tokens.length - 1;
  _expression.parseMaybeAssign.call(void 0, );
  _base.state.tokens[eqIndex].rhsEndIndex = _base.state.tokens.length;
} exports.parseMaybeDefault = parseMaybeDefault;


/***/ }),

/***/ 1765:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));/* eslint max-len: 0 */

var _index = __webpack_require__(1539);
















var _flow = __webpack_require__(5741);


















var _typescript = __webpack_require__(4789);












var _tokenizer = __webpack_require__(2297);
var _keywords = __webpack_require__(3464);
var _state = __webpack_require__(8595);
var _types = __webpack_require__(798);
var _charcodes = __webpack_require__(1537);
var _base = __webpack_require__(8022);












var _expression = __webpack_require__(745);





var _lval = __webpack_require__(7212);












var _util = __webpack_require__(8958);

 function parseTopLevel() {
  parseBlockBody(_types.TokenType.eof);
  _base.state.scopes.push(new (0, _state.Scope)(0, _base.state.tokens.length, true));
  if (_base.state.scopeDepth !== 0) {
    throw new Error(`Invalid scope depth at end of file: ${_base.state.scopeDepth}`);
  }
  return new (0, _index.File)(_base.state.tokens, _base.state.scopes);
} exports.parseTopLevel = parseTopLevel;

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

 function parseStatement(declaration) {
  if (_base.isFlowEnabled) {
    if (_flow.flowTryParseStatement.call(void 0, )) {
      return;
    }
  }
  if (_tokenizer.match.call(void 0, _types.TokenType.at)) {
    parseDecorators();
  }
  parseStatementContent(declaration);
} exports.parseStatement = parseStatement;

function parseStatementContent(declaration) {
  if (_base.isTypeScriptEnabled) {
    if (_typescript.tsTryParseStatementContent.call(void 0, )) {
      return;
    }
  }

  const starttype = _base.state.type;

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
    case _types.TokenType._break:
    case _types.TokenType._continue:
      parseBreakContinueStatement();
      return;
    case _types.TokenType._debugger:
      parseDebuggerStatement();
      return;
    case _types.TokenType._do:
      parseDoStatement();
      return;
    case _types.TokenType._for:
      parseForStatement();
      return;
    case _types.TokenType._function:
      if (_tokenizer.lookaheadType.call(void 0, ) === _types.TokenType.dot) break;
      if (!declaration) _util.unexpected.call(void 0, );
      parseFunctionStatement();
      return;

    case _types.TokenType._class:
      if (!declaration) _util.unexpected.call(void 0, );
      parseClass(true);
      return;

    case _types.TokenType._if:
      parseIfStatement();
      return;
    case _types.TokenType._return:
      parseReturnStatement();
      return;
    case _types.TokenType._switch:
      parseSwitchStatement();
      return;
    case _types.TokenType._throw:
      parseThrowStatement();
      return;
    case _types.TokenType._try:
      parseTryStatement();
      return;

    case _types.TokenType._let:
    case _types.TokenType._const:
      if (!declaration) _util.unexpected.call(void 0, ); // NOTE: falls through to _var

    case _types.TokenType._var:
      parseVarStatement(starttype !== _types.TokenType._var);
      return;

    case _types.TokenType._while:
      parseWhileStatement();
      return;
    case _types.TokenType.braceL:
      parseBlock();
      return;
    case _types.TokenType.semi:
      parseEmptyStatement();
      return;
    case _types.TokenType._export:
    case _types.TokenType._import: {
      const nextType = _tokenizer.lookaheadType.call(void 0, );
      if (nextType === _types.TokenType.parenL || nextType === _types.TokenType.dot) {
        break;
      }
      _tokenizer.next.call(void 0, );
      if (starttype === _types.TokenType._import) {
        parseImport();
      } else {
        parseExport();
      }
      return;
    }
    case _types.TokenType.name:
      if (_base.state.contextualKeyword === _keywords.ContextualKeyword._async) {
        const functionStart = _base.state.start;
        // peek ahead and see if next token is a function
        const snapshot = _base.state.snapshot();
        _tokenizer.next.call(void 0, );
        if (_tokenizer.match.call(void 0, _types.TokenType._function) && !_util.canInsertSemicolon.call(void 0, )) {
          _util.expect.call(void 0, _types.TokenType._function);
          parseFunction(functionStart, true);
          return;
        } else {
          _base.state.restoreFromSnapshot(snapshot);
        }
      } else if (
        _base.state.contextualKeyword === _keywords.ContextualKeyword._using &&
        !_util.hasFollowingLineBreak.call(void 0, ) &&
        // Statements like `using[0]` and `using in foo` aren't actual using
        // declarations.
        _tokenizer.lookaheadType.call(void 0, ) === _types.TokenType.name
      ) {
        parseVarStatement(true);
        return;
      }
    default:
      // Do nothing.
      break;
  }

  // If the statement does not start with a statement keyword or a
  // brace, it's an ExpressionStatement or LabeledStatement. We
  // simply start parsing an expression, and afterwards, if the
  // next token is a colon and the expression was a simple
  // Identifier node, we switch to interpreting it as a label.
  const initialTokensLength = _base.state.tokens.length;
  _expression.parseExpression.call(void 0, );
  let simpleName = null;
  if (_base.state.tokens.length === initialTokensLength + 1) {
    const token = _base.state.tokens[_base.state.tokens.length - 1];
    if (token.type === _types.TokenType.name) {
      simpleName = token.contextualKeyword;
    }
  }
  if (simpleName == null) {
    _util.semicolon.call(void 0, );
    return;
  }
  if (_tokenizer.eat.call(void 0, _types.TokenType.colon)) {
    parseLabeledStatement();
  } else {
    // This was an identifier, so we might want to handle flow/typescript-specific cases.
    parseIdentifierStatement(simpleName);
  }
}

 function parseDecorators() {
  while (_tokenizer.match.call(void 0, _types.TokenType.at)) {
    parseDecorator();
  }
} exports.parseDecorators = parseDecorators;

function parseDecorator() {
  _tokenizer.next.call(void 0, );
  if (_tokenizer.eat.call(void 0, _types.TokenType.parenL)) {
    _expression.parseExpression.call(void 0, );
    _util.expect.call(void 0, _types.TokenType.parenR);
  } else {
    _expression.parseIdentifier.call(void 0, );
    while (_tokenizer.eat.call(void 0, _types.TokenType.dot)) {
      _expression.parseIdentifier.call(void 0, );
    }
    parseMaybeDecoratorArguments();
  }
}

function parseMaybeDecoratorArguments() {
  if (_base.isTypeScriptEnabled) {
    _typescript.tsParseMaybeDecoratorArguments.call(void 0, );
  } else {
    baseParseMaybeDecoratorArguments();
  }
}

 function baseParseMaybeDecoratorArguments() {
  if (_tokenizer.eat.call(void 0, _types.TokenType.parenL)) {
    _expression.parseCallExpressionArguments.call(void 0, );
  }
} exports.baseParseMaybeDecoratorArguments = baseParseMaybeDecoratorArguments;

function parseBreakContinueStatement() {
  _tokenizer.next.call(void 0, );
  if (!_util.isLineTerminator.call(void 0, )) {
    _expression.parseIdentifier.call(void 0, );
    _util.semicolon.call(void 0, );
  }
}

function parseDebuggerStatement() {
  _tokenizer.next.call(void 0, );
  _util.semicolon.call(void 0, );
}

function parseDoStatement() {
  _tokenizer.next.call(void 0, );
  parseStatement(false);
  _util.expect.call(void 0, _types.TokenType._while);
  _expression.parseParenExpression.call(void 0, );
  _tokenizer.eat.call(void 0, _types.TokenType.semi);
}

function parseForStatement() {
  _base.state.scopeDepth++;
  const startTokenIndex = _base.state.tokens.length;
  parseAmbiguousForStatement();
  const endTokenIndex = _base.state.tokens.length;
  _base.state.scopes.push(new (0, _state.Scope)(startTokenIndex, endTokenIndex, false));
  _base.state.scopeDepth--;
}

/**
 * Determine if this token is a `using` declaration (explicit resource
 * management) as part of a loop.
 * https://github.com/tc39/proposal-explicit-resource-management
 */
function isUsingInLoop() {
  if (!_util.isContextual.call(void 0, _keywords.ContextualKeyword._using)) {
    return false;
  }
  // This must be `for (using of`, where `using` is the name of the loop
  // variable.
  if (_util.isLookaheadContextual.call(void 0, _keywords.ContextualKeyword._of)) {
    return false;
  }
  return true;
}

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.
function parseAmbiguousForStatement() {
  _tokenizer.next.call(void 0, );

  let forAwait = false;
  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._await)) {
    forAwait = true;
    _tokenizer.next.call(void 0, );
  }
  _util.expect.call(void 0, _types.TokenType.parenL);

  if (_tokenizer.match.call(void 0, _types.TokenType.semi)) {
    if (forAwait) {
      _util.unexpected.call(void 0, );
    }
    parseFor();
    return;
  }

  if (_tokenizer.match.call(void 0, _types.TokenType._var) || _tokenizer.match.call(void 0, _types.TokenType._let) || _tokenizer.match.call(void 0, _types.TokenType._const) || isUsingInLoop()) {
    _tokenizer.next.call(void 0, );
    parseVar(true, _base.state.type !== _types.TokenType._var);
    if (_tokenizer.match.call(void 0, _types.TokenType._in) || _util.isContextual.call(void 0, _keywords.ContextualKeyword._of)) {
      parseForIn(forAwait);
      return;
    }
    parseFor();
    return;
  }

  _expression.parseExpression.call(void 0, true);
  if (_tokenizer.match.call(void 0, _types.TokenType._in) || _util.isContextual.call(void 0, _keywords.ContextualKeyword._of)) {
    parseForIn(forAwait);
    return;
  }
  if (forAwait) {
    _util.unexpected.call(void 0, );
  }
  parseFor();
}

function parseFunctionStatement() {
  const functionStart = _base.state.start;
  _tokenizer.next.call(void 0, );
  parseFunction(functionStart, true);
}

function parseIfStatement() {
  _tokenizer.next.call(void 0, );
  _expression.parseParenExpression.call(void 0, );
  parseStatement(false);
  if (_tokenizer.eat.call(void 0, _types.TokenType._else)) {
    parseStatement(false);
  }
}

function parseReturnStatement() {
  _tokenizer.next.call(void 0, );

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (!_util.isLineTerminator.call(void 0, )) {
    _expression.parseExpression.call(void 0, );
    _util.semicolon.call(void 0, );
  }
}

function parseSwitchStatement() {
  _tokenizer.next.call(void 0, );
  _expression.parseParenExpression.call(void 0, );
  _base.state.scopeDepth++;
  const startTokenIndex = _base.state.tokens.length;
  _util.expect.call(void 0, _types.TokenType.braceL);

  // Don't bother validation; just go through any sequence of cases, defaults, and statements.
  while (!_tokenizer.match.call(void 0, _types.TokenType.braceR) && !_base.state.error) {
    if (_tokenizer.match.call(void 0, _types.TokenType._case) || _tokenizer.match.call(void 0, _types.TokenType._default)) {
      const isCase = _tokenizer.match.call(void 0, _types.TokenType._case);
      _tokenizer.next.call(void 0, );
      if (isCase) {
        _expression.parseExpression.call(void 0, );
      }
      _util.expect.call(void 0, _types.TokenType.colon);
    } else {
      parseStatement(true);
    }
  }
  _tokenizer.next.call(void 0, ); // Closing brace
  const endTokenIndex = _base.state.tokens.length;
  _base.state.scopes.push(new (0, _state.Scope)(startTokenIndex, endTokenIndex, false));
  _base.state.scopeDepth--;
}

function parseThrowStatement() {
  _tokenizer.next.call(void 0, );
  _expression.parseExpression.call(void 0, );
  _util.semicolon.call(void 0, );
}

function parseCatchClauseParam() {
  _lval.parseBindingAtom.call(void 0, true /* isBlockScope */);

  if (_base.isTypeScriptEnabled) {
    _typescript.tsTryParseTypeAnnotation.call(void 0, );
  }
}

function parseTryStatement() {
  _tokenizer.next.call(void 0, );

  parseBlock();

  if (_tokenizer.match.call(void 0, _types.TokenType._catch)) {
    _tokenizer.next.call(void 0, );
    let catchBindingStartTokenIndex = null;
    if (_tokenizer.match.call(void 0, _types.TokenType.parenL)) {
      _base.state.scopeDepth++;
      catchBindingStartTokenIndex = _base.state.tokens.length;
      _util.expect.call(void 0, _types.TokenType.parenL);
      parseCatchClauseParam();
      _util.expect.call(void 0, _types.TokenType.parenR);
    }
    parseBlock();
    if (catchBindingStartTokenIndex != null) {
      // We need a special scope for the catch binding which includes the binding itself and the
      // catch block.
      const endTokenIndex = _base.state.tokens.length;
      _base.state.scopes.push(new (0, _state.Scope)(catchBindingStartTokenIndex, endTokenIndex, false));
      _base.state.scopeDepth--;
    }
  }
  if (_tokenizer.eat.call(void 0, _types.TokenType._finally)) {
    parseBlock();
  }
}

 function parseVarStatement(isBlockScope) {
  _tokenizer.next.call(void 0, );
  parseVar(false, isBlockScope);
  _util.semicolon.call(void 0, );
} exports.parseVarStatement = parseVarStatement;

function parseWhileStatement() {
  _tokenizer.next.call(void 0, );
  _expression.parseParenExpression.call(void 0, );
  parseStatement(false);
}

function parseEmptyStatement() {
  _tokenizer.next.call(void 0, );
}

function parseLabeledStatement() {
  parseStatement(true);
}

/**
 * Parse a statement starting with an identifier of the given name. Subclasses match on the name
 * to handle statements like "declare".
 */
function parseIdentifierStatement(contextualKeyword) {
  if (_base.isTypeScriptEnabled) {
    _typescript.tsParseIdentifierStatement.call(void 0, contextualKeyword);
  } else if (_base.isFlowEnabled) {
    _flow.flowParseIdentifierStatement.call(void 0, contextualKeyword);
  } else {
    _util.semicolon.call(void 0, );
  }
}

// Parse a semicolon-enclosed block of statements.
 function parseBlock(isFunctionScope = false, contextId = 0) {
  const startTokenIndex = _base.state.tokens.length;
  _base.state.scopeDepth++;
  _util.expect.call(void 0, _types.TokenType.braceL);
  if (contextId) {
    _base.state.tokens[_base.state.tokens.length - 1].contextId = contextId;
  }
  parseBlockBody(_types.TokenType.braceR);
  if (contextId) {
    _base.state.tokens[_base.state.tokens.length - 1].contextId = contextId;
  }
  const endTokenIndex = _base.state.tokens.length;
  _base.state.scopes.push(new (0, _state.Scope)(startTokenIndex, endTokenIndex, isFunctionScope));
  _base.state.scopeDepth--;
} exports.parseBlock = parseBlock;

 function parseBlockBody(end) {
  while (!_tokenizer.eat.call(void 0, end) && !_base.state.error) {
    parseStatement(true);
  }
} exports.parseBlockBody = parseBlockBody;

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

function parseFor() {
  _util.expect.call(void 0, _types.TokenType.semi);
  if (!_tokenizer.match.call(void 0, _types.TokenType.semi)) {
    _expression.parseExpression.call(void 0, );
  }
  _util.expect.call(void 0, _types.TokenType.semi);
  if (!_tokenizer.match.call(void 0, _types.TokenType.parenR)) {
    _expression.parseExpression.call(void 0, );
  }
  _util.expect.call(void 0, _types.TokenType.parenR);
  parseStatement(false);
}

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

function parseForIn(forAwait) {
  if (forAwait) {
    _util.eatContextual.call(void 0, _keywords.ContextualKeyword._of);
  } else {
    _tokenizer.next.call(void 0, );
  }
  _expression.parseExpression.call(void 0, );
  _util.expect.call(void 0, _types.TokenType.parenR);
  parseStatement(false);
}

// Parse a list of variable declarations.

function parseVar(isFor, isBlockScope) {
  while (true) {
    parseVarHead(isBlockScope);
    if (_tokenizer.eat.call(void 0, _types.TokenType.eq)) {
      const eqIndex = _base.state.tokens.length - 1;
      _expression.parseMaybeAssign.call(void 0, isFor);
      _base.state.tokens[eqIndex].rhsEndIndex = _base.state.tokens.length;
    }
    if (!_tokenizer.eat.call(void 0, _types.TokenType.comma)) {
      break;
    }
  }
}

function parseVarHead(isBlockScope) {
  _lval.parseBindingAtom.call(void 0, isBlockScope);
  if (_base.isTypeScriptEnabled) {
    _typescript.tsAfterParseVarHead.call(void 0, );
  } else if (_base.isFlowEnabled) {
    _flow.flowAfterParseVarHead.call(void 0, );
  }
}

// Parse a function declaration or literal (depending on the
// `isStatement` parameter).

 function parseFunction(
  functionStart,
  isStatement,
  optionalId = false,
) {
  if (_tokenizer.match.call(void 0, _types.TokenType.star)) {
    _tokenizer.next.call(void 0, );
  }

  if (isStatement && !optionalId && !_tokenizer.match.call(void 0, _types.TokenType.name) && !_tokenizer.match.call(void 0, _types.TokenType._yield)) {
    _util.unexpected.call(void 0, );
  }

  let nameScopeStartTokenIndex = null;

  if (_tokenizer.match.call(void 0, _types.TokenType.name)) {
    // Expression-style functions should limit their name's scope to the function body, so we make
    // a new function scope to enforce that.
    if (!isStatement) {
      nameScopeStartTokenIndex = _base.state.tokens.length;
      _base.state.scopeDepth++;
    }
    _lval.parseBindingIdentifier.call(void 0, false);
  }

  const startTokenIndex = _base.state.tokens.length;
  _base.state.scopeDepth++;
  parseFunctionParams();
  _expression.parseFunctionBodyAndFinish.call(void 0, functionStart);
  const endTokenIndex = _base.state.tokens.length;
  // In addition to the block scope of the function body, we need a separate function-style scope
  // that includes the params.
  _base.state.scopes.push(new (0, _state.Scope)(startTokenIndex, endTokenIndex, true));
  _base.state.scopeDepth--;
  if (nameScopeStartTokenIndex !== null) {
    _base.state.scopes.push(new (0, _state.Scope)(nameScopeStartTokenIndex, endTokenIndex, true));
    _base.state.scopeDepth--;
  }
} exports.parseFunction = parseFunction;

 function parseFunctionParams(
  allowModifiers = false,
  funcContextId = 0,
) {
  if (_base.isTypeScriptEnabled) {
    _typescript.tsStartParseFunctionParams.call(void 0, );
  } else if (_base.isFlowEnabled) {
    _flow.flowStartParseFunctionParams.call(void 0, );
  }

  _util.expect.call(void 0, _types.TokenType.parenL);
  if (funcContextId) {
    _base.state.tokens[_base.state.tokens.length - 1].contextId = funcContextId;
  }
  _lval.parseBindingList.call(void 0, 
    _types.TokenType.parenR,
    false /* isBlockScope */,
    false /* allowEmpty */,
    allowModifiers,
    funcContextId,
  );
  if (funcContextId) {
    _base.state.tokens[_base.state.tokens.length - 1].contextId = funcContextId;
  }
} exports.parseFunctionParams = parseFunctionParams;

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

 function parseClass(isStatement, optionalId = false) {
  // Put a context ID on the class keyword, the open-brace, and the close-brace, so that later
  // code can easily navigate to meaningful points on the class.
  const contextId = _base.getNextContextId.call(void 0, );

  _tokenizer.next.call(void 0, );
  _base.state.tokens[_base.state.tokens.length - 1].contextId = contextId;
  _base.state.tokens[_base.state.tokens.length - 1].isExpression = !isStatement;
  // Like with functions, we declare a special "name scope" from the start of the name to the end
  // of the class, but only with expression-style classes, to represent the fact that the name is
  // available to the body of the class but not an outer declaration.
  let nameScopeStartTokenIndex = null;
  if (!isStatement) {
    nameScopeStartTokenIndex = _base.state.tokens.length;
    _base.state.scopeDepth++;
  }
  parseClassId(isStatement, optionalId);
  parseClassSuper();
  const openBraceIndex = _base.state.tokens.length;
  parseClassBody(contextId);
  if (_base.state.error) {
    return;
  }
  _base.state.tokens[openBraceIndex].contextId = contextId;
  _base.state.tokens[_base.state.tokens.length - 1].contextId = contextId;
  if (nameScopeStartTokenIndex !== null) {
    const endTokenIndex = _base.state.tokens.length;
    _base.state.scopes.push(new (0, _state.Scope)(nameScopeStartTokenIndex, endTokenIndex, false));
    _base.state.scopeDepth--;
  }
} exports.parseClass = parseClass;

function isClassProperty() {
  return _tokenizer.match.call(void 0, _types.TokenType.eq) || _tokenizer.match.call(void 0, _types.TokenType.semi) || _tokenizer.match.call(void 0, _types.TokenType.braceR) || _tokenizer.match.call(void 0, _types.TokenType.bang) || _tokenizer.match.call(void 0, _types.TokenType.colon);
}

function isClassMethod() {
  return _tokenizer.match.call(void 0, _types.TokenType.parenL) || _tokenizer.match.call(void 0, _types.TokenType.lessThan);
}

function parseClassBody(classContextId) {
  _util.expect.call(void 0, _types.TokenType.braceL);

  while (!_tokenizer.eat.call(void 0, _types.TokenType.braceR) && !_base.state.error) {
    if (_tokenizer.eat.call(void 0, _types.TokenType.semi)) {
      continue;
    }

    if (_tokenizer.match.call(void 0, _types.TokenType.at)) {
      parseDecorator();
      continue;
    }
    const memberStart = _base.state.start;
    parseClassMember(memberStart, classContextId);
  }
}

function parseClassMember(memberStart, classContextId) {
  if (_base.isTypeScriptEnabled) {
    _typescript.tsParseModifiers.call(void 0, [
      _keywords.ContextualKeyword._declare,
      _keywords.ContextualKeyword._public,
      _keywords.ContextualKeyword._protected,
      _keywords.ContextualKeyword._private,
      _keywords.ContextualKeyword._override,
    ]);
  }
  let isStatic = false;
  if (_tokenizer.match.call(void 0, _types.TokenType.name) && _base.state.contextualKeyword === _keywords.ContextualKeyword._static) {
    _expression.parseIdentifier.call(void 0, ); // eats 'static'
    if (isClassMethod()) {
      parseClassMethod(memberStart, /* isConstructor */ false);
      return;
    } else if (isClassProperty()) {
      parseClassProperty();
      return;
    }
    // otherwise something static
    _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._static;
    isStatic = true;

    if (_tokenizer.match.call(void 0, _types.TokenType.braceL)) {
      // This is a static block. Mark the word "static" with the class context ID for class element
      // detection and parse as a regular block.
      _base.state.tokens[_base.state.tokens.length - 1].contextId = classContextId;
      parseBlock();
      return;
    }
  }

  parseClassMemberWithIsStatic(memberStart, isStatic, classContextId);
}

function parseClassMemberWithIsStatic(
  memberStart,
  isStatic,
  classContextId,
) {
  if (_base.isTypeScriptEnabled) {
    if (_typescript.tsTryParseClassMemberWithIsStatic.call(void 0, isStatic)) {
      return;
    }
  }
  if (_tokenizer.eat.call(void 0, _types.TokenType.star)) {
    // a generator
    parseClassPropertyName(classContextId);
    parseClassMethod(memberStart, /* isConstructor */ false);
    return;
  }

  // Get the identifier name so we can tell if it's actually a keyword like "async", "get", or
  // "set".
  parseClassPropertyName(classContextId);
  let isConstructor = false;
  const token = _base.state.tokens[_base.state.tokens.length - 1];
  // We allow "constructor" as either an identifier or a string.
  if (token.contextualKeyword === _keywords.ContextualKeyword._constructor) {
    isConstructor = true;
  }
  parsePostMemberNameModifiers();

  if (isClassMethod()) {
    parseClassMethod(memberStart, isConstructor);
  } else if (isClassProperty()) {
    parseClassProperty();
  } else if (token.contextualKeyword === _keywords.ContextualKeyword._async && !_util.isLineTerminator.call(void 0, )) {
    _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._async;
    // an async method
    const isGenerator = _tokenizer.match.call(void 0, _types.TokenType.star);
    if (isGenerator) {
      _tokenizer.next.call(void 0, );
    }

    // The so-called parsed name would have been "async": get the real name.
    parseClassPropertyName(classContextId);
    parsePostMemberNameModifiers();
    parseClassMethod(memberStart, false /* isConstructor */);
  } else if (
    (token.contextualKeyword === _keywords.ContextualKeyword._get ||
      token.contextualKeyword === _keywords.ContextualKeyword._set) &&
    !(_util.isLineTerminator.call(void 0, ) && _tokenizer.match.call(void 0, _types.TokenType.star))
  ) {
    if (token.contextualKeyword === _keywords.ContextualKeyword._get) {
      _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._get;
    } else {
      _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._set;
    }
    // `get\n*` is an uninitialized property named 'get' followed by a generator.
    // a getter or setter
    // The so-called parsed name would have been "get/set": get the real name.
    parseClassPropertyName(classContextId);
    parseClassMethod(memberStart, /* isConstructor */ false);
  } else if (token.contextualKeyword === _keywords.ContextualKeyword._accessor && !_util.isLineTerminator.call(void 0, )) {
    parseClassPropertyName(classContextId);
    parseClassProperty();
  } else if (_util.isLineTerminator.call(void 0, )) {
    // an uninitialized class property (due to ASI, since we don't otherwise recognize the next token)
    parseClassProperty();
  } else {
    _util.unexpected.call(void 0, );
  }
}

function parseClassMethod(functionStart, isConstructor) {
  if (_base.isTypeScriptEnabled) {
    _typescript.tsTryParseTypeParameters.call(void 0, );
  } else if (_base.isFlowEnabled) {
    if (_tokenizer.match.call(void 0, _types.TokenType.lessThan)) {
      _flow.flowParseTypeParameterDeclaration.call(void 0, );
    }
  }
  _expression.parseMethod.call(void 0, functionStart, isConstructor);
}

// Return the name of the class property, if it is a simple identifier.
 function parseClassPropertyName(classContextId) {
  _expression.parsePropertyName.call(void 0, classContextId);
} exports.parseClassPropertyName = parseClassPropertyName;

 function parsePostMemberNameModifiers() {
  if (_base.isTypeScriptEnabled) {
    const oldIsType = _tokenizer.pushTypeContext.call(void 0, 0);
    _tokenizer.eat.call(void 0, _types.TokenType.question);
    _tokenizer.popTypeContext.call(void 0, oldIsType);
  }
} exports.parsePostMemberNameModifiers = parsePostMemberNameModifiers;

 function parseClassProperty() {
  if (_base.isTypeScriptEnabled) {
    _tokenizer.eatTypeToken.call(void 0, _types.TokenType.bang);
    _typescript.tsTryParseTypeAnnotation.call(void 0, );
  } else if (_base.isFlowEnabled) {
    if (_tokenizer.match.call(void 0, _types.TokenType.colon)) {
      _flow.flowParseTypeAnnotation.call(void 0, );
    }
  }

  if (_tokenizer.match.call(void 0, _types.TokenType.eq)) {
    const equalsTokenIndex = _base.state.tokens.length;
    _tokenizer.next.call(void 0, );
    _expression.parseMaybeAssign.call(void 0, );
    _base.state.tokens[equalsTokenIndex].rhsEndIndex = _base.state.tokens.length;
  }
  _util.semicolon.call(void 0, );
} exports.parseClassProperty = parseClassProperty;

function parseClassId(isStatement, optionalId = false) {
  if (
    _base.isTypeScriptEnabled &&
    (!isStatement || optionalId) &&
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._implements)
  ) {
    return;
  }

  if (_tokenizer.match.call(void 0, _types.TokenType.name)) {
    _lval.parseBindingIdentifier.call(void 0, true);
  }

  if (_base.isTypeScriptEnabled) {
    _typescript.tsTryParseTypeParameters.call(void 0, );
  } else if (_base.isFlowEnabled) {
    if (_tokenizer.match.call(void 0, _types.TokenType.lessThan)) {
      _flow.flowParseTypeParameterDeclaration.call(void 0, );
    }
  }
}

// Returns true if there was a superclass.
function parseClassSuper() {
  let hasSuper = false;
  if (_tokenizer.eat.call(void 0, _types.TokenType._extends)) {
    _expression.parseExprSubscripts.call(void 0, );
    hasSuper = true;
  } else {
    hasSuper = false;
  }
  if (_base.isTypeScriptEnabled) {
    _typescript.tsAfterParseClassSuper.call(void 0, hasSuper);
  } else if (_base.isFlowEnabled) {
    _flow.flowAfterParseClassSuper.call(void 0, hasSuper);
  }
}

// Parses module export declaration.

 function parseExport() {
  const exportIndex = _base.state.tokens.length - 1;
  if (_base.isTypeScriptEnabled) {
    if (_typescript.tsTryParseExport.call(void 0, )) {
      return;
    }
  }
  // export * from '...'
  if (shouldParseExportStar()) {
    parseExportStar();
  } else if (isExportDefaultSpecifier()) {
    // export default from
    _expression.parseIdentifier.call(void 0, );
    if (_tokenizer.match.call(void 0, _types.TokenType.comma) && _tokenizer.lookaheadType.call(void 0, ) === _types.TokenType.star) {
      _util.expect.call(void 0, _types.TokenType.comma);
      _util.expect.call(void 0, _types.TokenType.star);
      _util.expectContextual.call(void 0, _keywords.ContextualKeyword._as);
      _expression.parseIdentifier.call(void 0, );
    } else {
      parseExportSpecifiersMaybe();
    }
    parseExportFrom();
  } else if (_tokenizer.eat.call(void 0, _types.TokenType._default)) {
    // export default ...
    parseExportDefaultExpression();
  } else if (shouldParseExportDeclaration()) {
    parseExportDeclaration();
  } else {
    // export { x, y as z } [from '...']
    parseExportSpecifiers();
    parseExportFrom();
  }
  _base.state.tokens[exportIndex].rhsEndIndex = _base.state.tokens.length;
} exports.parseExport = parseExport;

function parseExportDefaultExpression() {
  if (_base.isTypeScriptEnabled) {
    if (_typescript.tsTryParseExportDefaultExpression.call(void 0, )) {
      return;
    }
  }
  if (_base.isFlowEnabled) {
    if (_flow.flowTryParseExportDefaultExpression.call(void 0, )) {
      return;
    }
  }
  const functionStart = _base.state.start;
  if (_tokenizer.eat.call(void 0, _types.TokenType._function)) {
    parseFunction(functionStart, true, true);
  } else if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._async) && _tokenizer.lookaheadType.call(void 0, ) === _types.TokenType._function) {
    // async function declaration
    _util.eatContextual.call(void 0, _keywords.ContextualKeyword._async);
    _tokenizer.eat.call(void 0, _types.TokenType._function);
    parseFunction(functionStart, true, true);
  } else if (_tokenizer.match.call(void 0, _types.TokenType._class)) {
    parseClass(true, true);
  } else if (_tokenizer.match.call(void 0, _types.TokenType.at)) {
    parseDecorators();
    parseClass(true, true);
  } else {
    _expression.parseMaybeAssign.call(void 0, );
    _util.semicolon.call(void 0, );
  }
}

function parseExportDeclaration() {
  if (_base.isTypeScriptEnabled) {
    _typescript.tsParseExportDeclaration.call(void 0, );
  } else if (_base.isFlowEnabled) {
    _flow.flowParseExportDeclaration.call(void 0, );
  } else {
    parseStatement(true);
  }
}

function isExportDefaultSpecifier() {
  if (_base.isTypeScriptEnabled && _typescript.tsIsDeclarationStart.call(void 0, )) {
    return false;
  } else if (_base.isFlowEnabled && _flow.flowShouldDisallowExportDefaultSpecifier.call(void 0, )) {
    return false;
  }
  if (_tokenizer.match.call(void 0, _types.TokenType.name)) {
    return _base.state.contextualKeyword !== _keywords.ContextualKeyword._async;
  }

  if (!_tokenizer.match.call(void 0, _types.TokenType._default)) {
    return false;
  }

  const _next = _tokenizer.nextTokenStart.call(void 0, );
  const lookahead = _tokenizer.lookaheadTypeAndKeyword.call(void 0, );
  const hasFrom =
    lookahead.type === _types.TokenType.name && lookahead.contextualKeyword === _keywords.ContextualKeyword._from;
  if (lookahead.type === _types.TokenType.comma) {
    return true;
  }
  // lookahead again when `export default from` is seen
  if (hasFrom) {
    const nextAfterFrom = _base.input.charCodeAt(_tokenizer.nextTokenStartSince.call(void 0, _next + 4));
    return nextAfterFrom === _charcodes.charCodes.quotationMark || nextAfterFrom === _charcodes.charCodes.apostrophe;
  }
  return false;
}

function parseExportSpecifiersMaybe() {
  if (_tokenizer.eat.call(void 0, _types.TokenType.comma)) {
    parseExportSpecifiers();
  }
}

 function parseExportFrom() {
  if (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._from)) {
    _expression.parseExprAtom.call(void 0, );
    maybeParseImportAssertions();
  }
  _util.semicolon.call(void 0, );
} exports.parseExportFrom = parseExportFrom;

function shouldParseExportStar() {
  if (_base.isFlowEnabled) {
    return _flow.flowShouldParseExportStar.call(void 0, );
  } else {
    return _tokenizer.match.call(void 0, _types.TokenType.star);
  }
}

function parseExportStar() {
  if (_base.isFlowEnabled) {
    _flow.flowParseExportStar.call(void 0, );
  } else {
    baseParseExportStar();
  }
}

 function baseParseExportStar() {
  _util.expect.call(void 0, _types.TokenType.star);

  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._as)) {
    parseExportNamespace();
  } else {
    parseExportFrom();
  }
} exports.baseParseExportStar = baseParseExportStar;

function parseExportNamespace() {
  _tokenizer.next.call(void 0, );
  _base.state.tokens[_base.state.tokens.length - 1].type = _types.TokenType._as;
  _expression.parseIdentifier.call(void 0, );
  parseExportSpecifiersMaybe();
  parseExportFrom();
}

function shouldParseExportDeclaration() {
  return (
    (_base.isTypeScriptEnabled && _typescript.tsIsDeclarationStart.call(void 0, )) ||
    (_base.isFlowEnabled && _flow.flowShouldParseExportDeclaration.call(void 0, )) ||
    _base.state.type === _types.TokenType._var ||
    _base.state.type === _types.TokenType._const ||
    _base.state.type === _types.TokenType._let ||
    _base.state.type === _types.TokenType._function ||
    _base.state.type === _types.TokenType._class ||
    _util.isContextual.call(void 0, _keywords.ContextualKeyword._async) ||
    _tokenizer.match.call(void 0, _types.TokenType.at)
  );
}

// Parses a comma-separated list of module exports.
 function parseExportSpecifiers() {
  let first = true;

  // export { x, y as z } [from '...']
  _util.expect.call(void 0, _types.TokenType.braceL);

  while (!_tokenizer.eat.call(void 0, _types.TokenType.braceR) && !_base.state.error) {
    if (first) {
      first = false;
    } else {
      _util.expect.call(void 0, _types.TokenType.comma);
      if (_tokenizer.eat.call(void 0, _types.TokenType.braceR)) {
        break;
      }
    }
    parseExportSpecifier();
  }
} exports.parseExportSpecifiers = parseExportSpecifiers;

function parseExportSpecifier() {
  if (_base.isTypeScriptEnabled) {
    _typescript.tsParseExportSpecifier.call(void 0, );
    return;
  }
  _expression.parseIdentifier.call(void 0, );
  _base.state.tokens[_base.state.tokens.length - 1].identifierRole = _tokenizer.IdentifierRole.ExportAccess;
  if (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._as)) {
    _expression.parseIdentifier.call(void 0, );
  }
}

/**
 * Starting at the `module` token in an import, determine if it was truly an
 * import reflection token or just looks like one.
 *
 * Returns true for:
 * import module foo from "foo";
 * import module from from "foo";
 *
 * Returns false for:
 * import module from "foo";
 * import module, {bar} from "foo";
 */
function isImportReflection() {
  const snapshot = _base.state.snapshot();
  _util.expectContextual.call(void 0, _keywords.ContextualKeyword._module);
  if (_util.eatContextual.call(void 0, _keywords.ContextualKeyword._from)) {
    if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._from)) {
      _base.state.restoreFromSnapshot(snapshot);
      return true;
    } else {
      _base.state.restoreFromSnapshot(snapshot);
      return false;
    }
  } else if (_tokenizer.match.call(void 0, _types.TokenType.comma)) {
    _base.state.restoreFromSnapshot(snapshot);
    return false;
  } else {
    _base.state.restoreFromSnapshot(snapshot);
    return true;
  }
}

/**
 * Eat the "module" token from the import reflection proposal.
 * https://github.com/tc39/proposal-import-reflection
 */
function parseMaybeImportReflection() {
  // isImportReflection does snapshot/restore, so only run it if we see the word
  // "module".
  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._module) && isImportReflection()) {
    _tokenizer.next.call(void 0, );
  }
}

// Parses import declaration.

 function parseImport() {
  if (_base.isTypeScriptEnabled && _tokenizer.match.call(void 0, _types.TokenType.name) && _tokenizer.lookaheadType.call(void 0, ) === _types.TokenType.eq) {
    _typescript.tsParseImportEqualsDeclaration.call(void 0, );
    return;
  }
  if (_base.isTypeScriptEnabled && _util.isContextual.call(void 0, _keywords.ContextualKeyword._type)) {
    const lookahead = _tokenizer.lookaheadTypeAndKeyword.call(void 0, );
    if (lookahead.type === _types.TokenType.name && lookahead.contextualKeyword !== _keywords.ContextualKeyword._from) {
      // One of these `import type` cases:
      // import type T = require('T');
      // import type A from 'A';
      _util.expectContextual.call(void 0, _keywords.ContextualKeyword._type);
      if (_tokenizer.lookaheadType.call(void 0, ) === _types.TokenType.eq) {
        _typescript.tsParseImportEqualsDeclaration.call(void 0, );
        return;
      }
      // If this is an `import type...from` statement, then we already ate the
      // type token, so proceed to the regular import parser.
    } else if (lookahead.type === _types.TokenType.star || lookahead.type === _types.TokenType.braceL) {
      // One of these `import type` cases, in which case we can eat the type token
      // and proceed as normal:
      // import type * as A from 'A';
      // import type {a} from 'A';
      _util.expectContextual.call(void 0, _keywords.ContextualKeyword._type);
    }
    // Otherwise, we are importing the name "type".
  }

  // import '...'
  if (_tokenizer.match.call(void 0, _types.TokenType.string)) {
    _expression.parseExprAtom.call(void 0, );
  } else {
    parseMaybeImportReflection();
    parseImportSpecifiers();
    _util.expectContextual.call(void 0, _keywords.ContextualKeyword._from);
    _expression.parseExprAtom.call(void 0, );
  }
  maybeParseImportAssertions();
  _util.semicolon.call(void 0, );
} exports.parseImport = parseImport;

// eslint-disable-next-line no-unused-vars
function shouldParseDefaultImport() {
  return _tokenizer.match.call(void 0, _types.TokenType.name);
}

function parseImportSpecifierLocal() {
  _lval.parseImportedIdentifier.call(void 0, );
}

// Parses a comma-separated list of module imports.
function parseImportSpecifiers() {
  if (_base.isFlowEnabled) {
    _flow.flowStartParseImportSpecifiers.call(void 0, );
  }

  let first = true;
  if (shouldParseDefaultImport()) {
    // import defaultObj, { x, y as z } from '...'
    parseImportSpecifierLocal();

    if (!_tokenizer.eat.call(void 0, _types.TokenType.comma)) return;
  }

  if (_tokenizer.match.call(void 0, _types.TokenType.star)) {
    _tokenizer.next.call(void 0, );
    _util.expectContextual.call(void 0, _keywords.ContextualKeyword._as);

    parseImportSpecifierLocal();

    return;
  }

  _util.expect.call(void 0, _types.TokenType.braceL);
  while (!_tokenizer.eat.call(void 0, _types.TokenType.braceR) && !_base.state.error) {
    if (first) {
      first = false;
    } else {
      // Detect an attempt to deep destructure
      if (_tokenizer.eat.call(void 0, _types.TokenType.colon)) {
        _util.unexpected.call(void 0, 
          "ES2015 named imports do not destructure. Use another statement for destructuring after the import.",
        );
      }

      _util.expect.call(void 0, _types.TokenType.comma);
      if (_tokenizer.eat.call(void 0, _types.TokenType.braceR)) {
        break;
      }
    }

    parseImportSpecifier();
  }
}

function parseImportSpecifier() {
  if (_base.isTypeScriptEnabled) {
    _typescript.tsParseImportSpecifier.call(void 0, );
    return;
  }
  if (_base.isFlowEnabled) {
    _flow.flowParseImportSpecifier.call(void 0, );
    return;
  }
  _lval.parseImportedIdentifier.call(void 0, );
  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._as)) {
    _base.state.tokens[_base.state.tokens.length - 1].identifierRole = _tokenizer.IdentifierRole.ImportAccess;
    _tokenizer.next.call(void 0, );
    _lval.parseImportedIdentifier.call(void 0, );
  }
}

/**
 * Parse import assertions like `assert {type: "json"}`.
 *
 * Import assertions technically have their own syntax, but are always parseable
 * as a plain JS object, so just do that for simplicity.
 */
function maybeParseImportAssertions() {
  if (_util.isContextual.call(void 0, _keywords.ContextualKeyword._assert) && !_util.hasPrecedingLineBreak.call(void 0, )) {
    _tokenizer.next.call(void 0, );
    _expression.parseObj.call(void 0, false, false);
  }
}


/***/ }),

/***/ 8958:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _index = __webpack_require__(2297);

var _types = __webpack_require__(798);
var _charcodes = __webpack_require__(1537);
var _base = __webpack_require__(8022);

// ## Parser utilities

// Tests whether parsed token is a contextual keyword.
 function isContextual(contextualKeyword) {
  return _base.state.contextualKeyword === contextualKeyword;
} exports.isContextual = isContextual;

 function isLookaheadContextual(contextualKeyword) {
  const l = _index.lookaheadTypeAndKeyword.call(void 0, );
  return l.type === _types.TokenType.name && l.contextualKeyword === contextualKeyword;
} exports.isLookaheadContextual = isLookaheadContextual;

// Consumes contextual keyword if possible.
 function eatContextual(contextualKeyword) {
  return _base.state.contextualKeyword === contextualKeyword && _index.eat.call(void 0, _types.TokenType.name);
} exports.eatContextual = eatContextual;

// Asserts that following token is given contextual keyword.
 function expectContextual(contextualKeyword) {
  if (!eatContextual(contextualKeyword)) {
    unexpected();
  }
} exports.expectContextual = expectContextual;

// Test whether a semicolon can be inserted at the current position.
 function canInsertSemicolon() {
  return _index.match.call(void 0, _types.TokenType.eof) || _index.match.call(void 0, _types.TokenType.braceR) || hasPrecedingLineBreak();
} exports.canInsertSemicolon = canInsertSemicolon;

 function hasPrecedingLineBreak() {
  const prevToken = _base.state.tokens[_base.state.tokens.length - 1];
  const lastTokEnd = prevToken ? prevToken.end : 0;
  for (let i = lastTokEnd; i < _base.state.start; i++) {
    const code = _base.input.charCodeAt(i);
    if (
      code === _charcodes.charCodes.lineFeed ||
      code === _charcodes.charCodes.carriageReturn ||
      code === 0x2028 ||
      code === 0x2029
    ) {
      return true;
    }
  }
  return false;
} exports.hasPrecedingLineBreak = hasPrecedingLineBreak;

 function hasFollowingLineBreak() {
  const nextStart = _index.nextTokenStart.call(void 0, );
  for (let i = _base.state.end; i < nextStart; i++) {
    const code = _base.input.charCodeAt(i);
    if (
      code === _charcodes.charCodes.lineFeed ||
      code === _charcodes.charCodes.carriageReturn ||
      code === 0x2028 ||
      code === 0x2029
    ) {
      return true;
    }
  }
  return false;
} exports.hasFollowingLineBreak = hasFollowingLineBreak;

 function isLineTerminator() {
  return _index.eat.call(void 0, _types.TokenType.semi) || canInsertSemicolon();
} exports.isLineTerminator = isLineTerminator;

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.
 function semicolon() {
  if (!isLineTerminator()) {
    unexpected('Unexpected token, expected ";"');
  }
} exports.semicolon = semicolon;

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error at given pos.
 function expect(type) {
  const matched = _index.eat.call(void 0, type);
  if (!matched) {
    unexpected(`Unexpected token, expected "${_types.formatTokenType.call(void 0, type)}"`);
  }
} exports.expect = expect;

/**
 * Transition the parser to an error state. All code needs to be written to naturally unwind in this
 * state, which allows us to backtrack without exceptions and without error plumbing everywhere.
 */
 function unexpected(message = "Unexpected token", pos = _base.state.start) {
  if (_base.state.error) {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = new SyntaxError(message);
  err.pos = pos;
  _base.state.error = err;
  _base.state.pos = _base.input.length;
  _index.finishToken.call(void 0, _types.TokenType.eof);
} exports.unexpected = unexpected;


/***/ }),

/***/ 1537:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var charCodes; (function (charCodes) {
  const backSpace = 8; charCodes[charCodes["backSpace"] = backSpace] = "backSpace";
  const lineFeed = 10; charCodes[charCodes["lineFeed"] = lineFeed] = "lineFeed"; //  '\n'
  const tab = 9; charCodes[charCodes["tab"] = tab] = "tab"; //  '\t'
  const carriageReturn = 13; charCodes[charCodes["carriageReturn"] = carriageReturn] = "carriageReturn"; //  '\r'
  const shiftOut = 14; charCodes[charCodes["shiftOut"] = shiftOut] = "shiftOut";
  const space = 32; charCodes[charCodes["space"] = space] = "space";
  const exclamationMark = 33; charCodes[charCodes["exclamationMark"] = exclamationMark] = "exclamationMark"; //  '!'
  const quotationMark = 34; charCodes[charCodes["quotationMark"] = quotationMark] = "quotationMark"; //  '"'
  const numberSign = 35; charCodes[charCodes["numberSign"] = numberSign] = "numberSign"; //  '#'
  const dollarSign = 36; charCodes[charCodes["dollarSign"] = dollarSign] = "dollarSign"; //  '$'
  const percentSign = 37; charCodes[charCodes["percentSign"] = percentSign] = "percentSign"; //  '%'
  const ampersand = 38; charCodes[charCodes["ampersand"] = ampersand] = "ampersand"; //  '&'
  const apostrophe = 39; charCodes[charCodes["apostrophe"] = apostrophe] = "apostrophe"; //  '''
  const leftParenthesis = 40; charCodes[charCodes["leftParenthesis"] = leftParenthesis] = "leftParenthesis"; //  '('
  const rightParenthesis = 41; charCodes[charCodes["rightParenthesis"] = rightParenthesis] = "rightParenthesis"; //  ')'
  const asterisk = 42; charCodes[charCodes["asterisk"] = asterisk] = "asterisk"; //  '*'
  const plusSign = 43; charCodes[charCodes["plusSign"] = plusSign] = "plusSign"; //  '+'
  const comma = 44; charCodes[charCodes["comma"] = comma] = "comma"; //  ','
  const dash = 45; charCodes[charCodes["dash"] = dash] = "dash"; //  '-'
  const dot = 46; charCodes[charCodes["dot"] = dot] = "dot"; //  '.'
  const slash = 47; charCodes[charCodes["slash"] = slash] = "slash"; //  '/'
  const digit0 = 48; charCodes[charCodes["digit0"] = digit0] = "digit0"; //  '0'
  const digit1 = 49; charCodes[charCodes["digit1"] = digit1] = "digit1"; //  '1'
  const digit2 = 50; charCodes[charCodes["digit2"] = digit2] = "digit2"; //  '2'
  const digit3 = 51; charCodes[charCodes["digit3"] = digit3] = "digit3"; //  '3'
  const digit4 = 52; charCodes[charCodes["digit4"] = digit4] = "digit4"; //  '4'
  const digit5 = 53; charCodes[charCodes["digit5"] = digit5] = "digit5"; //  '5'
  const digit6 = 54; charCodes[charCodes["digit6"] = digit6] = "digit6"; //  '6'
  const digit7 = 55; charCodes[charCodes["digit7"] = digit7] = "digit7"; //  '7'
  const digit8 = 56; charCodes[charCodes["digit8"] = digit8] = "digit8"; //  '8'
  const digit9 = 57; charCodes[charCodes["digit9"] = digit9] = "digit9"; //  '9'
  const colon = 58; charCodes[charCodes["colon"] = colon] = "colon"; //  ':'
  const semicolon = 59; charCodes[charCodes["semicolon"] = semicolon] = "semicolon"; //  ';'
  const lessThan = 60; charCodes[charCodes["lessThan"] = lessThan] = "lessThan"; //  '<'
  const equalsTo = 61; charCodes[charCodes["equalsTo"] = equalsTo] = "equalsTo"; //  '='
  const greaterThan = 62; charCodes[charCodes["greaterThan"] = greaterThan] = "greaterThan"; //  '>'
  const questionMark = 63; charCodes[charCodes["questionMark"] = questionMark] = "questionMark"; //  '?'
  const atSign = 64; charCodes[charCodes["atSign"] = atSign] = "atSign"; //  '@'
  const uppercaseA = 65; charCodes[charCodes["uppercaseA"] = uppercaseA] = "uppercaseA"; //  'A'
  const uppercaseB = 66; charCodes[charCodes["uppercaseB"] = uppercaseB] = "uppercaseB"; //  'B'
  const uppercaseC = 67; charCodes[charCodes["uppercaseC"] = uppercaseC] = "uppercaseC"; //  'C'
  const uppercaseD = 68; charCodes[charCodes["uppercaseD"] = uppercaseD] = "uppercaseD"; //  'D'
  const uppercaseE = 69; charCodes[charCodes["uppercaseE"] = uppercaseE] = "uppercaseE"; //  'E'
  const uppercaseF = 70; charCodes[charCodes["uppercaseF"] = uppercaseF] = "uppercaseF"; //  'F'
  const uppercaseG = 71; charCodes[charCodes["uppercaseG"] = uppercaseG] = "uppercaseG"; //  'G'
  const uppercaseH = 72; charCodes[charCodes["uppercaseH"] = uppercaseH] = "uppercaseH"; //  'H'
  const uppercaseI = 73; charCodes[charCodes["uppercaseI"] = uppercaseI] = "uppercaseI"; //  'I'
  const uppercaseJ = 74; charCodes[charCodes["uppercaseJ"] = uppercaseJ] = "uppercaseJ"; //  'J'
  const uppercaseK = 75; charCodes[charCodes["uppercaseK"] = uppercaseK] = "uppercaseK"; //  'K'
  const uppercaseL = 76; charCodes[charCodes["uppercaseL"] = uppercaseL] = "uppercaseL"; //  'L'
  const uppercaseM = 77; charCodes[charCodes["uppercaseM"] = uppercaseM] = "uppercaseM"; //  'M'
  const uppercaseN = 78; charCodes[charCodes["uppercaseN"] = uppercaseN] = "uppercaseN"; //  'N'
  const uppercaseO = 79; charCodes[charCodes["uppercaseO"] = uppercaseO] = "uppercaseO"; //  'O'
  const uppercaseP = 80; charCodes[charCodes["uppercaseP"] = uppercaseP] = "uppercaseP"; //  'P'
  const uppercaseQ = 81; charCodes[charCodes["uppercaseQ"] = uppercaseQ] = "uppercaseQ"; //  'Q'
  const uppercaseR = 82; charCodes[charCodes["uppercaseR"] = uppercaseR] = "uppercaseR"; //  'R'
  const uppercaseS = 83; charCodes[charCodes["uppercaseS"] = uppercaseS] = "uppercaseS"; //  'S'
  const uppercaseT = 84; charCodes[charCodes["uppercaseT"] = uppercaseT] = "uppercaseT"; //  'T'
  const uppercaseU = 85; charCodes[charCodes["uppercaseU"] = uppercaseU] = "uppercaseU"; //  'U'
  const uppercaseV = 86; charCodes[charCodes["uppercaseV"] = uppercaseV] = "uppercaseV"; //  'V'
  const uppercaseW = 87; charCodes[charCodes["uppercaseW"] = uppercaseW] = "uppercaseW"; //  'W'
  const uppercaseX = 88; charCodes[charCodes["uppercaseX"] = uppercaseX] = "uppercaseX"; //  'X'
  const uppercaseY = 89; charCodes[charCodes["uppercaseY"] = uppercaseY] = "uppercaseY"; //  'Y'
  const uppercaseZ = 90; charCodes[charCodes["uppercaseZ"] = uppercaseZ] = "uppercaseZ"; //  'Z'
  const leftSquareBracket = 91; charCodes[charCodes["leftSquareBracket"] = leftSquareBracket] = "leftSquareBracket"; //  '['
  const backslash = 92; charCodes[charCodes["backslash"] = backslash] = "backslash"; //  '\    '
  const rightSquareBracket = 93; charCodes[charCodes["rightSquareBracket"] = rightSquareBracket] = "rightSquareBracket"; //  ']'
  const caret = 94; charCodes[charCodes["caret"] = caret] = "caret"; //  '^'
  const underscore = 95; charCodes[charCodes["underscore"] = underscore] = "underscore"; //  '_'
  const graveAccent = 96; charCodes[charCodes["graveAccent"] = graveAccent] = "graveAccent"; //  '`'
  const lowercaseA = 97; charCodes[charCodes["lowercaseA"] = lowercaseA] = "lowercaseA"; //  'a'
  const lowercaseB = 98; charCodes[charCodes["lowercaseB"] = lowercaseB] = "lowercaseB"; //  'b'
  const lowercaseC = 99; charCodes[charCodes["lowercaseC"] = lowercaseC] = "lowercaseC"; //  'c'
  const lowercaseD = 100; charCodes[charCodes["lowercaseD"] = lowercaseD] = "lowercaseD"; //  'd'
  const lowercaseE = 101; charCodes[charCodes["lowercaseE"] = lowercaseE] = "lowercaseE"; //  'e'
  const lowercaseF = 102; charCodes[charCodes["lowercaseF"] = lowercaseF] = "lowercaseF"; //  'f'
  const lowercaseG = 103; charCodes[charCodes["lowercaseG"] = lowercaseG] = "lowercaseG"; //  'g'
  const lowercaseH = 104; charCodes[charCodes["lowercaseH"] = lowercaseH] = "lowercaseH"; //  'h'
  const lowercaseI = 105; charCodes[charCodes["lowercaseI"] = lowercaseI] = "lowercaseI"; //  'i'
  const lowercaseJ = 106; charCodes[charCodes["lowercaseJ"] = lowercaseJ] = "lowercaseJ"; //  'j'
  const lowercaseK = 107; charCodes[charCodes["lowercaseK"] = lowercaseK] = "lowercaseK"; //  'k'
  const lowercaseL = 108; charCodes[charCodes["lowercaseL"] = lowercaseL] = "lowercaseL"; //  'l'
  const lowercaseM = 109; charCodes[charCodes["lowercaseM"] = lowercaseM] = "lowercaseM"; //  'm'
  const lowercaseN = 110; charCodes[charCodes["lowercaseN"] = lowercaseN] = "lowercaseN"; //  'n'
  const lowercaseO = 111; charCodes[charCodes["lowercaseO"] = lowercaseO] = "lowercaseO"; //  'o'
  const lowercaseP = 112; charCodes[charCodes["lowercaseP"] = lowercaseP] = "lowercaseP"; //  'p'
  const lowercaseQ = 113; charCodes[charCodes["lowercaseQ"] = lowercaseQ] = "lowercaseQ"; //  'q'
  const lowercaseR = 114; charCodes[charCodes["lowercaseR"] = lowercaseR] = "lowercaseR"; //  'r'
  const lowercaseS = 115; charCodes[charCodes["lowercaseS"] = lowercaseS] = "lowercaseS"; //  's'
  const lowercaseT = 116; charCodes[charCodes["lowercaseT"] = lowercaseT] = "lowercaseT"; //  't'
  const lowercaseU = 117; charCodes[charCodes["lowercaseU"] = lowercaseU] = "lowercaseU"; //  'u'
  const lowercaseV = 118; charCodes[charCodes["lowercaseV"] = lowercaseV] = "lowercaseV"; //  'v'
  const lowercaseW = 119; charCodes[charCodes["lowercaseW"] = lowercaseW] = "lowercaseW"; //  'w'
  const lowercaseX = 120; charCodes[charCodes["lowercaseX"] = lowercaseX] = "lowercaseX"; //  'x'
  const lowercaseY = 121; charCodes[charCodes["lowercaseY"] = lowercaseY] = "lowercaseY"; //  'y'
  const lowercaseZ = 122; charCodes[charCodes["lowercaseZ"] = lowercaseZ] = "lowercaseZ"; //  'z'
  const leftCurlyBrace = 123; charCodes[charCodes["leftCurlyBrace"] = leftCurlyBrace] = "leftCurlyBrace"; //  '{'
  const verticalBar = 124; charCodes[charCodes["verticalBar"] = verticalBar] = "verticalBar"; //  '|'
  const rightCurlyBrace = 125; charCodes[charCodes["rightCurlyBrace"] = rightCurlyBrace] = "rightCurlyBrace"; //  '}'
  const tilde = 126; charCodes[charCodes["tilde"] = tilde] = "tilde"; //  '~'
  const nonBreakingSpace = 160; charCodes[charCodes["nonBreakingSpace"] = nonBreakingSpace] = "nonBreakingSpace";
  // eslint-disable-next-line no-irregular-whitespace
  const oghamSpaceMark = 5760; charCodes[charCodes["oghamSpaceMark"] = oghamSpaceMark] = "oghamSpaceMark"; // ' '
  const lineSeparator = 8232; charCodes[charCodes["lineSeparator"] = lineSeparator] = "lineSeparator";
  const paragraphSeparator = 8233; charCodes[charCodes["paragraphSeparator"] = paragraphSeparator] = "paragraphSeparator";
})(charCodes || (exports.charCodes = charCodes = {}));

 function isDigit(code) {
  return (
    (code >= charCodes.digit0 && code <= charCodes.digit9) ||
    (code >= charCodes.lowercaseA && code <= charCodes.lowercaseF) ||
    (code >= charCodes.uppercaseA && code <= charCodes.uppercaseF)
  );
} exports.isDigit = isDigit;


/***/ }),

/***/ 905:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _charcodes = __webpack_require__(1537);
var _whitespace = __webpack_require__(317);

function computeIsIdentifierChar(code) {
  if (code < 48) return code === 36;
  if (code < 58) return true;
  if (code < 65) return false;
  if (code < 91) return true;
  if (code < 97) return code === 95;
  if (code < 123) return true;
  if (code < 128) return false;
  throw new Error("Should not be called with non-ASCII char code.");
}

 const IS_IDENTIFIER_CHAR = new Uint8Array(65536); exports.IS_IDENTIFIER_CHAR = IS_IDENTIFIER_CHAR;
for (let i = 0; i < 128; i++) {
  exports.IS_IDENTIFIER_CHAR[i] = computeIsIdentifierChar(i) ? 1 : 0;
}
for (let i = 128; i < 65536; i++) {
  exports.IS_IDENTIFIER_CHAR[i] = 1;
}
// Aside from whitespace and newlines, all characters outside the ASCII space are either
// identifier characters or invalid. Since we're not performing code validation, we can just
// treat all invalid characters as identifier characters.
for (const whitespaceChar of _whitespace.WHITESPACE_CHARS) {
  exports.IS_IDENTIFIER_CHAR[whitespaceChar] = 0;
}
exports.IS_IDENTIFIER_CHAR[8232] = 0;
exports.IS_IDENTIFIER_CHAR[8233] = 0;

 const IS_IDENTIFIER_START = exports.IS_IDENTIFIER_CHAR.slice(); exports.IS_IDENTIFIER_START = IS_IDENTIFIER_START;
for (let numChar = _charcodes.charCodes.digit0; numChar <= _charcodes.charCodes.digit9; numChar++) {
  exports.IS_IDENTIFIER_START[numChar] = 0;
}


/***/ }),

/***/ 317:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _charcodes = __webpack_require__(1537);

// https://tc39.github.io/ecma262/#sec-white-space
 const WHITESPACE_CHARS = [
  0x0009,
  0x000b,
  0x000c,
  _charcodes.charCodes.space,
  _charcodes.charCodes.nonBreakingSpace,
  _charcodes.charCodes.oghamSpaceMark,
  0x2000, // EN QUAD
  0x2001, // EM QUAD
  0x2002, // EN SPACE
  0x2003, // EM SPACE
  0x2004, // THREE-PER-EM SPACE
  0x2005, // FOUR-PER-EM SPACE
  0x2006, // SIX-PER-EM SPACE
  0x2007, // FIGURE SPACE
  0x2008, // PUNCTUATION SPACE
  0x2009, // THIN SPACE
  0x200a, // HAIR SPACE
  0x202f, // NARROW NO-BREAK SPACE
  0x205f, // MEDIUM MATHEMATICAL SPACE
  0x3000, // IDEOGRAPHIC SPACE
  0xfeff, // ZERO WIDTH NO-BREAK SPACE
]; exports.WHITESPACE_CHARS = WHITESPACE_CHARS;

 const skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g; exports.skipWhiteSpace = skipWhiteSpace;

 const IS_WHITESPACE = new Uint8Array(65536); exports.IS_WHITESPACE = IS_WHITESPACE;
for (const char of exports.WHITESPACE_CHARS) {
  exports.IS_WHITESPACE[char] = 1;
}


/***/ }),

/***/ 1125:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var _tokenizer = __webpack_require__(2297);
var _keywords = __webpack_require__(3464);
var _types = __webpack_require__(798);

var _elideImportEquals = __webpack_require__(4643); var _elideImportEquals2 = _interopRequireDefault(_elideImportEquals);



var _getDeclarationInfo = __webpack_require__(3461); var _getDeclarationInfo2 = _interopRequireDefault(_getDeclarationInfo);
var _getImportExportSpecifierInfo = __webpack_require__(8052); var _getImportExportSpecifierInfo2 = _interopRequireDefault(_getImportExportSpecifierInfo);
var _removeMaybeImportAssertion = __webpack_require__(8147);
var _shouldElideDefaultExport = __webpack_require__(3434); var _shouldElideDefaultExport2 = _interopRequireDefault(_shouldElideDefaultExport);


var _Transformer = __webpack_require__(5702); var _Transformer2 = _interopRequireDefault(_Transformer);

/**
 * Class for editing import statements when we are transforming to commonjs.
 */
 class CJSImportTransformer extends _Transformer2.default {
   __init() {this.hadExport = false}
   __init2() {this.hadNamedExport = false}
   __init3() {this.hadDefaultExport = false}
  

  constructor(
     rootTransformer,
     tokens,
     importProcessor,
     nameManager,
     helperManager,
     reactHotLoaderTransformer,
     enableLegacyBabel5ModuleInterop,
     enableLegacyTypeScriptModuleInterop,
     isTypeScriptTransformEnabled,
     preserveDynamicImport,
  ) {
    super();this.rootTransformer = rootTransformer;this.tokens = tokens;this.importProcessor = importProcessor;this.nameManager = nameManager;this.helperManager = helperManager;this.reactHotLoaderTransformer = reactHotLoaderTransformer;this.enableLegacyBabel5ModuleInterop = enableLegacyBabel5ModuleInterop;this.enableLegacyTypeScriptModuleInterop = enableLegacyTypeScriptModuleInterop;this.isTypeScriptTransformEnabled = isTypeScriptTransformEnabled;this.preserveDynamicImport = preserveDynamicImport;CJSImportTransformer.prototype.__init.call(this);CJSImportTransformer.prototype.__init2.call(this);CJSImportTransformer.prototype.__init3.call(this);;
    this.declarationInfo = isTypeScriptTransformEnabled
      ? _getDeclarationInfo2.default.call(void 0, tokens)
      : _getDeclarationInfo.EMPTY_DECLARATION_INFO;
  }

  getPrefixCode() {
    let prefix = "";
    if (this.hadExport) {
      prefix += 'Object.defineProperty(exports, "__esModule", {value: true});';
    }
    return prefix;
  }

  getSuffixCode() {
    if (this.enableLegacyBabel5ModuleInterop && this.hadDefaultExport && !this.hadNamedExport) {
      return "\nmodule.exports = exports.default;\n";
    }
    return "";
  }

  process() {
    // TypeScript `import foo = require('foo');` should always just be translated to plain require.
    if (this.tokens.matches3(_types.TokenType._import, _types.TokenType.name, _types.TokenType.eq)) {
      return this.processImportEquals();
    }
    if (this.tokens.matches1(_types.TokenType._import)) {
      this.processImport();
      return true;
    }
    if (this.tokens.matches2(_types.TokenType._export, _types.TokenType.eq)) {
      this.tokens.replaceToken("module.exports");
      return true;
    }
    if (this.tokens.matches1(_types.TokenType._export) && !this.tokens.currentToken().isType) {
      this.hadExport = true;
      return this.processExport();
    }
    if (this.tokens.matches2(_types.TokenType.name, _types.TokenType.postIncDec)) {
      // Fall through to normal identifier matching if this doesn't apply.
      if (this.processPostIncDec()) {
        return true;
      }
    }
    if (this.tokens.matches1(_types.TokenType.name) || this.tokens.matches1(_types.TokenType.jsxName)) {
      return this.processIdentifier();
    }
    if (this.tokens.matches1(_types.TokenType.eq)) {
      return this.processAssignment();
    }
    if (this.tokens.matches1(_types.TokenType.assign)) {
      return this.processComplexAssignment();
    }
    if (this.tokens.matches1(_types.TokenType.preIncDec)) {
      return this.processPreIncDec();
    }
    return false;
  }

   processImportEquals() {
    const importName = this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 1);
    if (this.importProcessor.isTypeName(importName)) {
      // If this name is only used as a type, elide the whole import.
      _elideImportEquals2.default.call(void 0, this.tokens);
    } else {
      // Otherwise, switch `import` to `const`.
      this.tokens.replaceToken("const");
    }
    return true;
  }

  /**
   * Transform this:
   * import foo, {bar} from 'baz';
   * into
   * var _baz = require('baz'); var _baz2 = _interopRequireDefault(_baz);
   *
   * The import code was already generated in the import preprocessing step, so
   * we just need to look it up.
   */
   processImport() {
    if (this.tokens.matches2(_types.TokenType._import, _types.TokenType.parenL)) {
      if (this.preserveDynamicImport) {
        // Bail out, only making progress for this one token.
        this.tokens.copyToken();
        return;
      }
      const requireWrapper = this.enableLegacyTypeScriptModuleInterop
        ? ""
        : `${this.helperManager.getHelperName("interopRequireWildcard")}(`;
      this.tokens.replaceToken(`Promise.resolve().then(() => ${requireWrapper}require`);
      const contextId = this.tokens.currentToken().contextId;
      if (contextId == null) {
        throw new Error("Expected context ID on dynamic import invocation.");
      }
      this.tokens.copyToken();
      while (!this.tokens.matchesContextIdAndLabel(_types.TokenType.parenR, contextId)) {
        this.rootTransformer.processToken();
      }
      this.tokens.replaceToken(requireWrapper ? ")))" : "))");
      return;
    }

    const wasOnlyTypes = this.removeImportAndDetectIfType();

    if (wasOnlyTypes) {
      this.tokens.removeToken();
    } else {
      const path = this.tokens.stringValue();
      this.tokens.replaceTokenTrimmingLeftWhitespace(this.importProcessor.claimImportCode(path));
      this.tokens.appendCode(this.importProcessor.claimImportCode(path));
    }
    _removeMaybeImportAssertion.removeMaybeImportAssertion.call(void 0, this.tokens);
    if (this.tokens.matches1(_types.TokenType.semi)) {
      this.tokens.removeToken();
    }
  }

  /**
   * Erase this import, and return true if it was either of the form "import type" or contained only
   * "type" named imports. Such imports should not even do a side-effect import.
   *
   * The position should end at the import string.
   */
   removeImportAndDetectIfType() {
    this.tokens.removeInitialToken();
    if (
      this.tokens.matchesContextual(_keywords.ContextualKeyword._type) &&
      !this.tokens.matches1AtIndex(this.tokens.currentIndex() + 1, _types.TokenType.comma) &&
      !this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 1, _keywords.ContextualKeyword._from)
    ) {
      // This is an "import type" statement, so exit early.
      this.removeRemainingImport();
      return true;
    }

    if (this.tokens.matches1(_types.TokenType.name) || this.tokens.matches1(_types.TokenType.star)) {
      // We have a default import or namespace import, so there must be some
      // non-type import.
      this.removeRemainingImport();
      return false;
    }

    if (this.tokens.matches1(_types.TokenType.string)) {
      // This is a bare import, so we should proceed with the import.
      return false;
    }

    let foundNonType = false;
    while (!this.tokens.matches1(_types.TokenType.string)) {
      // Check if any named imports are of the form "foo" or "foo as bar", with
      // no leading "type".
      if ((!foundNonType && this.tokens.matches1(_types.TokenType.braceL)) || this.tokens.matches1(_types.TokenType.comma)) {
        this.tokens.removeToken();
        if (
          this.tokens.matches2(_types.TokenType.name, _types.TokenType.comma) ||
          this.tokens.matches2(_types.TokenType.name, _types.TokenType.braceR) ||
          this.tokens.matches4(_types.TokenType.name, _types.TokenType.name, _types.TokenType.name, _types.TokenType.comma) ||
          this.tokens.matches4(_types.TokenType.name, _types.TokenType.name, _types.TokenType.name, _types.TokenType.braceR)
        ) {
          foundNonType = true;
        }
      }
      this.tokens.removeToken();
    }
    return !foundNonType;
  }

   removeRemainingImport() {
    while (!this.tokens.matches1(_types.TokenType.string)) {
      this.tokens.removeToken();
    }
  }

   processIdentifier() {
    const token = this.tokens.currentToken();
    if (token.shadowsGlobal) {
      return false;
    }

    if (token.identifierRole === _tokenizer.IdentifierRole.ObjectShorthand) {
      return this.processObjectShorthand();
    }

    if (token.identifierRole !== _tokenizer.IdentifierRole.Access) {
      return false;
    }
    const replacement = this.importProcessor.getIdentifierReplacement(
      this.tokens.identifierNameForToken(token),
    );
    if (!replacement) {
      return false;
    }
    // Tolerate any number of closing parens while looking for an opening paren
    // that indicates a function call.
    let possibleOpenParenIndex = this.tokens.currentIndex() + 1;
    while (
      possibleOpenParenIndex < this.tokens.tokens.length &&
      this.tokens.tokens[possibleOpenParenIndex].type === _types.TokenType.parenR
    ) {
      possibleOpenParenIndex++;
    }
    // Avoid treating imported functions as methods of their `exports` object
    // by using `(0, f)` when the identifier is in a paren expression. Else
    // use `Function.prototype.call` when the identifier is a guaranteed
    // function call. When using `call`, pass undefined as the context.
    if (this.tokens.tokens[possibleOpenParenIndex].type === _types.TokenType.parenL) {
      if (
        this.tokens.tokenAtRelativeIndex(1).type === _types.TokenType.parenL &&
        this.tokens.tokenAtRelativeIndex(-1).type !== _types.TokenType._new
      ) {
        this.tokens.replaceToken(`${replacement}.call(void 0, `);
        // Remove the old paren.
        this.tokens.removeToken();
        // Balance out the new paren.
        this.rootTransformer.processBalancedCode();
        this.tokens.copyExpectedToken(_types.TokenType.parenR);
      } else {
        // See here: http://2ality.com/2015/12/references.html
        this.tokens.replaceToken(`(0, ${replacement})`);
      }
    } else {
      this.tokens.replaceToken(replacement);
    }
    return true;
  }

  processObjectShorthand() {
    const identifier = this.tokens.identifierName();
    const replacement = this.importProcessor.getIdentifierReplacement(identifier);
    if (!replacement) {
      return false;
    }
    this.tokens.replaceToken(`${identifier}: ${replacement}`);
    return true;
  }

  processExport() {
    if (
      this.tokens.matches2(_types.TokenType._export, _types.TokenType._enum) ||
      this.tokens.matches3(_types.TokenType._export, _types.TokenType._const, _types.TokenType._enum)
    ) {
      // Let the TypeScript transform handle it.
      return false;
    }
    if (this.tokens.matches2(_types.TokenType._export, _types.TokenType._default)) {
      this.hadDefaultExport = true;
      if (this.tokens.matches3(_types.TokenType._export, _types.TokenType._default, _types.TokenType._enum)) {
        // Flow export default enums need some special handling, so handle them
        // in that tranform rather than this one.
        return false;
      }
      this.processExportDefault();
      return true;
    }
    this.hadNamedExport = true;
    if (
      this.tokens.matches2(_types.TokenType._export, _types.TokenType._var) ||
      this.tokens.matches2(_types.TokenType._export, _types.TokenType._let) ||
      this.tokens.matches2(_types.TokenType._export, _types.TokenType._const)
    ) {
      this.processExportVar();
      return true;
    } else if (
      this.tokens.matches2(_types.TokenType._export, _types.TokenType._function) ||
      // export async function
      this.tokens.matches3(_types.TokenType._export, _types.TokenType.name, _types.TokenType._function)
    ) {
      this.processExportFunction();
      return true;
    } else if (
      this.tokens.matches2(_types.TokenType._export, _types.TokenType._class) ||
      this.tokens.matches3(_types.TokenType._export, _types.TokenType._abstract, _types.TokenType._class) ||
      this.tokens.matches2(_types.TokenType._export, _types.TokenType.at)
    ) {
      this.processExportClass();
      return true;
    } else if (this.tokens.matches2(_types.TokenType._export, _types.TokenType.braceL)) {
      this.processExportBindings();
      return true;
    } else if (this.tokens.matches2(_types.TokenType._export, _types.TokenType.star)) {
      this.processExportStar();
      return true;
    } else if (
      this.tokens.matches2(_types.TokenType._export, _types.TokenType.name) &&
      this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 1, _keywords.ContextualKeyword._type)
    ) {
      // export type {a};
      // export type {a as b};
      // export type {a} from './b';
      // export type * from './b';
      // export type * as ns from './b';
      this.tokens.removeInitialToken();
      this.tokens.removeToken();
      if (this.tokens.matches1(_types.TokenType.braceL)) {
        while (!this.tokens.matches1(_types.TokenType.braceR)) {
          this.tokens.removeToken();
        }
        this.tokens.removeToken();
      } else {
        // *
        this.tokens.removeToken();
        if (this.tokens.matches1(_types.TokenType._as)) {
          // as
          this.tokens.removeToken();
          // ns
          this.tokens.removeToken();
        }
      }
      // Remove type re-export `... } from './T'`
      if (
        this.tokens.matchesContextual(_keywords.ContextualKeyword._from) &&
        this.tokens.matches1AtIndex(this.tokens.currentIndex() + 1, _types.TokenType.string)
      ) {
        this.tokens.removeToken();
        this.tokens.removeToken();
        _removeMaybeImportAssertion.removeMaybeImportAssertion.call(void 0, this.tokens);
      }
      return true;
    } else {
      throw new Error("Unrecognized export syntax.");
    }
  }

   processAssignment() {
    const index = this.tokens.currentIndex();
    const identifierToken = this.tokens.tokens[index - 1];
    // If the LHS is a type identifier, this must be a declaration like `let a: b = c;`,
    // with `b` as the identifier, so nothing needs to be done in that case.
    if (identifierToken.isType || identifierToken.type !== _types.TokenType.name) {
      return false;
    }
    if (identifierToken.shadowsGlobal) {
      return false;
    }
    if (index >= 2 && this.tokens.matches1AtIndex(index - 2, _types.TokenType.dot)) {
      return false;
    }
    if (index >= 2 && [_types.TokenType._var, _types.TokenType._let, _types.TokenType._const].includes(this.tokens.tokens[index - 2].type)) {
      // Declarations don't need an extra assignment. This doesn't avoid the
      // assignment for comma-separated declarations, but it's still correct
      // since the assignment is just redundant.
      return false;
    }
    const assignmentSnippet = this.importProcessor.resolveExportBinding(
      this.tokens.identifierNameForToken(identifierToken),
    );
    if (!assignmentSnippet) {
      return false;
    }
    this.tokens.copyToken();
    this.tokens.appendCode(` ${assignmentSnippet} =`);
    return true;
  }

  /**
   * Process something like `a += 3`, where `a` might be an exported value.
   */
   processComplexAssignment() {
    const index = this.tokens.currentIndex();
    const identifierToken = this.tokens.tokens[index - 1];
    if (identifierToken.type !== _types.TokenType.name) {
      return false;
    }
    if (identifierToken.shadowsGlobal) {
      return false;
    }
    if (index >= 2 && this.tokens.matches1AtIndex(index - 2, _types.TokenType.dot)) {
      return false;
    }
    const assignmentSnippet = this.importProcessor.resolveExportBinding(
      this.tokens.identifierNameForToken(identifierToken),
    );
    if (!assignmentSnippet) {
      return false;
    }
    this.tokens.appendCode(` = ${assignmentSnippet}`);
    this.tokens.copyToken();
    return true;
  }

  /**
   * Process something like `++a`, where `a` might be an exported value.
   */
   processPreIncDec() {
    const index = this.tokens.currentIndex();
    const identifierToken = this.tokens.tokens[index + 1];
    if (identifierToken.type !== _types.TokenType.name) {
      return false;
    }
    if (identifierToken.shadowsGlobal) {
      return false;
    }
    // Ignore things like ++a.b and ++a[b] and ++a().b.
    if (
      index + 2 < this.tokens.tokens.length &&
      (this.tokens.matches1AtIndex(index + 2, _types.TokenType.dot) ||
        this.tokens.matches1AtIndex(index + 2, _types.TokenType.bracketL) ||
        this.tokens.matches1AtIndex(index + 2, _types.TokenType.parenL))
    ) {
      return false;
    }
    const identifierName = this.tokens.identifierNameForToken(identifierToken);
    const assignmentSnippet = this.importProcessor.resolveExportBinding(identifierName);
    if (!assignmentSnippet) {
      return false;
    }
    this.tokens.appendCode(`${assignmentSnippet} = `);
    this.tokens.copyToken();
    return true;
  }

  /**
   * Process something like `a++`, where `a` might be an exported value.
   * This starts at the `a`, not at the `++`.
   */
   processPostIncDec() {
    const index = this.tokens.currentIndex();
    const identifierToken = this.tokens.tokens[index];
    const operatorToken = this.tokens.tokens[index + 1];
    if (identifierToken.type !== _types.TokenType.name) {
      return false;
    }
    if (identifierToken.shadowsGlobal) {
      return false;
    }
    if (index >= 1 && this.tokens.matches1AtIndex(index - 1, _types.TokenType.dot)) {
      return false;
    }
    const identifierName = this.tokens.identifierNameForToken(identifierToken);
    const assignmentSnippet = this.importProcessor.resolveExportBinding(identifierName);
    if (!assignmentSnippet) {
      return false;
    }
    const operatorCode = this.tokens.rawCodeForToken(operatorToken);
    // We might also replace the identifier with something like exports.x, so
    // do that replacement here as well.
    const base = this.importProcessor.getIdentifierReplacement(identifierName) || identifierName;
    if (operatorCode === "++") {
      this.tokens.replaceToken(`(${base} = ${assignmentSnippet} = ${base} + 1, ${base} - 1)`);
    } else if (operatorCode === "--") {
      this.tokens.replaceToken(`(${base} = ${assignmentSnippet} = ${base} - 1, ${base} + 1)`);
    } else {
      throw new Error(`Unexpected operator: ${operatorCode}`);
    }
    this.tokens.removeToken();
    return true;
  }

   processExportDefault() {
    if (
      this.tokens.matches4(_types.TokenType._export, _types.TokenType._default, _types.TokenType._function, _types.TokenType.name) ||
      // export default async function
      (this.tokens.matches5(_types.TokenType._export, _types.TokenType._default, _types.TokenType.name, _types.TokenType._function, _types.TokenType.name) &&
        this.tokens.matchesContextualAtIndex(
          this.tokens.currentIndex() + 2,
          _keywords.ContextualKeyword._async,
        ))
    ) {
      this.tokens.removeInitialToken();
      this.tokens.removeToken();
      // Named function export case: change it to a top-level function
      // declaration followed by exports statement.
      const name = this.processNamedFunction();
      this.tokens.appendCode(` exports.default = ${name};`);
    } else if (
      this.tokens.matches4(_types.TokenType._export, _types.TokenType._default, _types.TokenType._class, _types.TokenType.name) ||
      this.tokens.matches5(_types.TokenType._export, _types.TokenType._default, _types.TokenType._abstract, _types.TokenType._class, _types.TokenType.name) ||
      this.tokens.matches3(_types.TokenType._export, _types.TokenType._default, _types.TokenType.at)
    ) {
      this.tokens.removeInitialToken();
      this.tokens.removeToken();
      this.copyDecorators();
      if (this.tokens.matches1(_types.TokenType._abstract)) {
        this.tokens.removeToken();
      }
      const name = this.rootTransformer.processNamedClass();
      this.tokens.appendCode(` exports.default = ${name};`);
      // After this point, this is a plain "export default E" statement.
    } else if (
      _shouldElideDefaultExport2.default.call(void 0, this.isTypeScriptTransformEnabled, this.tokens, this.declarationInfo)
    ) {
      // If the exported value is just an identifier and should be elided by TypeScript
      // rules, then remove it entirely. It will always have the form `export default e`,
      // where `e` is an identifier.
      this.tokens.removeInitialToken();
      this.tokens.removeToken();
      this.tokens.removeToken();
    } else if (this.reactHotLoaderTransformer) {
      // We need to assign E to a variable. Change "export default E" to
      // "let _default; exports.default = _default = E"
      const defaultVarName = this.nameManager.claimFreeName("_default");
      this.tokens.replaceToken(`let ${defaultVarName}; exports.`);
      this.tokens.copyToken();
      this.tokens.appendCode(` = ${defaultVarName} =`);
      this.reactHotLoaderTransformer.setExtractedDefaultExportName(defaultVarName);
    } else {
      // Change "export default E" to "exports.default = E"
      this.tokens.replaceToken("exports.");
      this.tokens.copyToken();
      this.tokens.appendCode(" =");
    }
  }

   copyDecorators() {
    while (this.tokens.matches1(_types.TokenType.at)) {
      this.tokens.copyToken();
      if (this.tokens.matches1(_types.TokenType.parenL)) {
        this.tokens.copyExpectedToken(_types.TokenType.parenL);
        this.rootTransformer.processBalancedCode();
        this.tokens.copyExpectedToken(_types.TokenType.parenR);
      } else {
        this.tokens.copyExpectedToken(_types.TokenType.name);
        while (this.tokens.matches1(_types.TokenType.dot)) {
          this.tokens.copyExpectedToken(_types.TokenType.dot);
          this.tokens.copyExpectedToken(_types.TokenType.name);
        }
        if (this.tokens.matches1(_types.TokenType.parenL)) {
          this.tokens.copyExpectedToken(_types.TokenType.parenL);
          this.rootTransformer.processBalancedCode();
          this.tokens.copyExpectedToken(_types.TokenType.parenR);
        }
      }
    }
  }

  /**
   * Transform a declaration like `export var`, `export let`, or `export const`.
   */
   processExportVar() {
    if (this.isSimpleExportVar()) {
      this.processSimpleExportVar();
    } else {
      this.processComplexExportVar();
    }
  }

  /**
   * Determine if the export is of the form:
   * export var/let/const [varName] = [expr];
   * In other words, determine if function name inference might apply.
   */
   isSimpleExportVar() {
    let tokenIndex = this.tokens.currentIndex();
    // export
    tokenIndex++;
    // var/let/const
    tokenIndex++;
    if (!this.tokens.matches1AtIndex(tokenIndex, _types.TokenType.name)) {
      return false;
    }
    tokenIndex++;
    while (tokenIndex < this.tokens.tokens.length && this.tokens.tokens[tokenIndex].isType) {
      tokenIndex++;
    }
    if (!this.tokens.matches1AtIndex(tokenIndex, _types.TokenType.eq)) {
      return false;
    }
    return true;
  }

  /**
   * Transform an `export var` declaration initializing a single variable.
   *
   * For example, this:
   * export const f = () => {};
   * becomes this:
   * const f = () => {}; exports.f = f;
   *
   * The variable is unused (e.g. exports.f has the true value of the export).
   * We need to produce an assignment of this form so that the function will
   * have an inferred name of "f", which wouldn't happen in the more general
   * case below.
   */
   processSimpleExportVar() {
    // export
    this.tokens.removeInitialToken();
    // var/let/const
    this.tokens.copyToken();
    const varName = this.tokens.identifierName();
    // x: number  ->  x
    while (!this.tokens.matches1(_types.TokenType.eq)) {
      this.rootTransformer.processToken();
    }
    const endIndex = this.tokens.currentToken().rhsEndIndex;
    if (endIndex == null) {
      throw new Error("Expected = token with an end index.");
    }
    while (this.tokens.currentIndex() < endIndex) {
      this.rootTransformer.processToken();
    }
    this.tokens.appendCode(`; exports.${varName} = ${varName}`);
  }

  /**
   * Transform normal declaration exports, including handling destructuring.
   * For example, this:
   * export const {x: [a = 2, b], c} = d;
   * becomes this:
   * ({x: [exports.a = 2, exports.b], c: exports.c} = d;)
   */
   processComplexExportVar() {
    this.tokens.removeInitialToken();
    this.tokens.removeToken();
    const needsParens = this.tokens.matches1(_types.TokenType.braceL);
    if (needsParens) {
      this.tokens.appendCode("(");
    }

    let depth = 0;
    while (true) {
      if (
        this.tokens.matches1(_types.TokenType.braceL) ||
        this.tokens.matches1(_types.TokenType.dollarBraceL) ||
        this.tokens.matches1(_types.TokenType.bracketL)
      ) {
        depth++;
        this.tokens.copyToken();
      } else if (this.tokens.matches1(_types.TokenType.braceR) || this.tokens.matches1(_types.TokenType.bracketR)) {
        depth--;
        this.tokens.copyToken();
      } else if (
        depth === 0 &&
        !this.tokens.matches1(_types.TokenType.name) &&
        !this.tokens.currentToken().isType
      ) {
        break;
      } else if (this.tokens.matches1(_types.TokenType.eq)) {
        // Default values might have assignments in the RHS that we want to ignore, so skip past
        // them.
        const endIndex = this.tokens.currentToken().rhsEndIndex;
        if (endIndex == null) {
          throw new Error("Expected = token with an end index.");
        }
        while (this.tokens.currentIndex() < endIndex) {
          this.rootTransformer.processToken();
        }
      } else {
        const token = this.tokens.currentToken();
        if (_tokenizer.isDeclaration.call(void 0, token)) {
          const name = this.tokens.identifierName();
          let replacement = this.importProcessor.getIdentifierReplacement(name);
          if (replacement === null) {
            throw new Error(`Expected a replacement for ${name} in \`export var\` syntax.`);
          }
          if (_tokenizer.isObjectShorthandDeclaration.call(void 0, token)) {
            replacement = `${name}: ${replacement}`;
          }
          this.tokens.replaceToken(replacement);
        } else {
          this.rootTransformer.processToken();
        }
      }
    }

    if (needsParens) {
      // Seek to the end of the RHS.
      const endIndex = this.tokens.currentToken().rhsEndIndex;
      if (endIndex == null) {
        throw new Error("Expected = token with an end index.");
      }
      while (this.tokens.currentIndex() < endIndex) {
        this.rootTransformer.processToken();
      }
      this.tokens.appendCode(")");
    }
  }

  /**
   * Transform this:
   * export function foo() {}
   * into this:
   * function foo() {} exports.foo = foo;
   */
   processExportFunction() {
    this.tokens.replaceToken("");
    const name = this.processNamedFunction();
    this.tokens.appendCode(` exports.${name} = ${name};`);
  }

  /**
   * Skip past a function with a name and return that name.
   */
   processNamedFunction() {
    if (this.tokens.matches1(_types.TokenType._function)) {
      this.tokens.copyToken();
    } else if (this.tokens.matches2(_types.TokenType.name, _types.TokenType._function)) {
      if (!this.tokens.matchesContextual(_keywords.ContextualKeyword._async)) {
        throw new Error("Expected async keyword in function export.");
      }
      this.tokens.copyToken();
      this.tokens.copyToken();
    }
    if (this.tokens.matches1(_types.TokenType.star)) {
      this.tokens.copyToken();
    }
    if (!this.tokens.matches1(_types.TokenType.name)) {
      throw new Error("Expected identifier for exported function name.");
    }
    const name = this.tokens.identifierName();
    this.tokens.copyToken();
    if (this.tokens.currentToken().isType) {
      this.tokens.removeInitialToken();
      while (this.tokens.currentToken().isType) {
        this.tokens.removeToken();
      }
    }
    this.tokens.copyExpectedToken(_types.TokenType.parenL);
    this.rootTransformer.processBalancedCode();
    this.tokens.copyExpectedToken(_types.TokenType.parenR);
    this.rootTransformer.processPossibleTypeRange();
    this.tokens.copyExpectedToken(_types.TokenType.braceL);
    this.rootTransformer.processBalancedCode();
    this.tokens.copyExpectedToken(_types.TokenType.braceR);
    return name;
  }

  /**
   * Transform this:
   * export class A {}
   * into this:
   * class A {} exports.A = A;
   */
   processExportClass() {
    this.tokens.removeInitialToken();
    this.copyDecorators();
    if (this.tokens.matches1(_types.TokenType._abstract)) {
      this.tokens.removeToken();
    }
    const name = this.rootTransformer.processNamedClass();
    this.tokens.appendCode(` exports.${name} = ${name};`);
  }

  /**
   * Transform this:
   * export {a, b as c};
   * into this:
   * exports.a = a; exports.c = b;
   *
   * OR
   *
   * Transform this:
   * export {a, b as c} from './foo';
   * into the pre-generated Object.defineProperty code from the ImportProcessor.
   *
   * For the first case, if the TypeScript transform is enabled, we need to skip
   * exports that are only defined as types.
   */
   processExportBindings() {
    this.tokens.removeInitialToken();
    this.tokens.removeToken();

    const exportStatements = [];
    while (true) {
      if (this.tokens.matches1(_types.TokenType.braceR)) {
        this.tokens.removeToken();
        break;
      }

      const specifierInfo = _getImportExportSpecifierInfo2.default.call(void 0, this.tokens);
      while (this.tokens.currentIndex() < specifierInfo.endIndex) {
        this.tokens.removeToken();
      }
      if (!specifierInfo.isType && !this.shouldElideExportedIdentifier(specifierInfo.leftName)) {
        const localName = specifierInfo.leftName;
        const exportedName = specifierInfo.rightName;
        const newLocalName = this.importProcessor.getIdentifierReplacement(localName);
        exportStatements.push(`exports.${exportedName} = ${newLocalName || localName};`);
      }

      if (this.tokens.matches1(_types.TokenType.braceR)) {
        this.tokens.removeToken();
        break;
      }
      if (this.tokens.matches2(_types.TokenType.comma, _types.TokenType.braceR)) {
        this.tokens.removeToken();
        this.tokens.removeToken();
        break;
      } else if (this.tokens.matches1(_types.TokenType.comma)) {
        this.tokens.removeToken();
      } else {
        throw new Error(`Unexpected token: ${JSON.stringify(this.tokens.currentToken())}`);
      }
    }

    if (this.tokens.matchesContextual(_keywords.ContextualKeyword._from)) {
      // This is an export...from, so throw away the normal named export code
      // and use the Object.defineProperty code from ImportProcessor.
      this.tokens.removeToken();
      const path = this.tokens.stringValue();
      this.tokens.replaceTokenTrimmingLeftWhitespace(this.importProcessor.claimImportCode(path));
      _removeMaybeImportAssertion.removeMaybeImportAssertion.call(void 0, this.tokens);
    } else {
      // This is a normal named export, so use that.
      this.tokens.appendCode(exportStatements.join(" "));
    }

    if (this.tokens.matches1(_types.TokenType.semi)) {
      this.tokens.removeToken();
    }
  }

   processExportStar() {
    this.tokens.removeInitialToken();
    while (!this.tokens.matches1(_types.TokenType.string)) {
      this.tokens.removeToken();
    }
    const path = this.tokens.stringValue();
    this.tokens.replaceTokenTrimmingLeftWhitespace(this.importProcessor.claimImportCode(path));
    _removeMaybeImportAssertion.removeMaybeImportAssertion.call(void 0, this.tokens);
    if (this.tokens.matches1(_types.TokenType.semi)) {
      this.tokens.removeToken();
    }
  }

   shouldElideExportedIdentifier(name) {
    return this.isTypeScriptTransformEnabled && !this.declarationInfo.valueDeclarations.has(name);
  }
} exports["default"] = CJSImportTransformer;


/***/ }),

/***/ 1893:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var _keywords = __webpack_require__(3464);
var _types = __webpack_require__(798);

var _elideImportEquals = __webpack_require__(4643); var _elideImportEquals2 = _interopRequireDefault(_elideImportEquals);



var _getDeclarationInfo = __webpack_require__(3461); var _getDeclarationInfo2 = _interopRequireDefault(_getDeclarationInfo);
var _getImportExportSpecifierInfo = __webpack_require__(8052); var _getImportExportSpecifierInfo2 = _interopRequireDefault(_getImportExportSpecifierInfo);
var _getNonTypeIdentifiers = __webpack_require__(1281);
var _removeMaybeImportAssertion = __webpack_require__(8147);
var _shouldElideDefaultExport = __webpack_require__(3434); var _shouldElideDefaultExport2 = _interopRequireDefault(_shouldElideDefaultExport);

var _Transformer = __webpack_require__(5702); var _Transformer2 = _interopRequireDefault(_Transformer);

/**
 * Class for editing import statements when we are keeping the code as ESM. We still need to remove
 * type-only imports in TypeScript and Flow.
 */
 class ESMImportTransformer extends _Transformer2.default {
  
  
  

  constructor(
     tokens,
     nameManager,
     helperManager,
     reactHotLoaderTransformer,
     isTypeScriptTransformEnabled,
    options,
  ) {
    super();this.tokens = tokens;this.nameManager = nameManager;this.helperManager = helperManager;this.reactHotLoaderTransformer = reactHotLoaderTransformer;this.isTypeScriptTransformEnabled = isTypeScriptTransformEnabled;;
    this.nonTypeIdentifiers = isTypeScriptTransformEnabled
      ? _getNonTypeIdentifiers.getNonTypeIdentifiers.call(void 0, tokens, options)
      : new Set();
    this.declarationInfo = isTypeScriptTransformEnabled
      ? _getDeclarationInfo2.default.call(void 0, tokens)
      : _getDeclarationInfo.EMPTY_DECLARATION_INFO;
    this.injectCreateRequireForImportRequire = Boolean(options.injectCreateRequireForImportRequire);
  }

  process() {
    // TypeScript `import foo = require('foo');` should always just be translated to plain require.
    if (this.tokens.matches3(_types.TokenType._import, _types.TokenType.name, _types.TokenType.eq)) {
      return this.processImportEquals();
    }
    if (
      this.tokens.matches4(_types.TokenType._import, _types.TokenType.name, _types.TokenType.name, _types.TokenType.eq) &&
      this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 1, _keywords.ContextualKeyword._type)
    ) {
      // import type T = require('T')
      this.tokens.removeInitialToken();
      // This construct is always exactly 8 tokens long, so remove the 7 remaining tokens.
      for (let i = 0; i < 7; i++) {
        this.tokens.removeToken();
      }
      return true;
    }
    if (this.tokens.matches2(_types.TokenType._export, _types.TokenType.eq)) {
      this.tokens.replaceToken("module.exports");
      return true;
    }
    if (
      this.tokens.matches5(_types.TokenType._export, _types.TokenType._import, _types.TokenType.name, _types.TokenType.name, _types.TokenType.eq) &&
      this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 2, _keywords.ContextualKeyword._type)
    ) {
      // export import type T = require('T')
      this.tokens.removeInitialToken();
      // This construct is always exactly 9 tokens long, so remove the 8 remaining tokens.
      for (let i = 0; i < 8; i++) {
        this.tokens.removeToken();
      }
      return true;
    }
    if (this.tokens.matches1(_types.TokenType._import)) {
      return this.processImport();
    }
    if (this.tokens.matches2(_types.TokenType._export, _types.TokenType._default)) {
      return this.processExportDefault();
    }
    if (this.tokens.matches2(_types.TokenType._export, _types.TokenType.braceL)) {
      return this.processNamedExports();
    }
    if (
      this.tokens.matches2(_types.TokenType._export, _types.TokenType.name) &&
      this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 1, _keywords.ContextualKeyword._type)
    ) {
      // export type {a};
      // export type {a as b};
      // export type {a} from './b';
      // export type * from './b';
      // export type * as ns from './b';
      this.tokens.removeInitialToken();
      this.tokens.removeToken();
      if (this.tokens.matches1(_types.TokenType.braceL)) {
        while (!this.tokens.matches1(_types.TokenType.braceR)) {
          this.tokens.removeToken();
        }
        this.tokens.removeToken();
      } else {
        // *
        this.tokens.removeToken();
        if (this.tokens.matches1(_types.TokenType._as)) {
          // as
          this.tokens.removeToken();
          // ns
          this.tokens.removeToken();
        }
      }
      // Remove type re-export `... } from './T'`
      if (
        this.tokens.matchesContextual(_keywords.ContextualKeyword._from) &&
        this.tokens.matches1AtIndex(this.tokens.currentIndex() + 1, _types.TokenType.string)
      ) {
        this.tokens.removeToken();
        this.tokens.removeToken();
        _removeMaybeImportAssertion.removeMaybeImportAssertion.call(void 0, this.tokens);
      }
      return true;
    }
    return false;
  }

   processImportEquals() {
    const importName = this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 1);
    if (this.isTypeName(importName)) {
      // If this name is only used as a type, elide the whole import.
      _elideImportEquals2.default.call(void 0, this.tokens);
    } else if (this.injectCreateRequireForImportRequire) {
      // We're using require in an environment (Node ESM) that doesn't provide
      // it as a global, so generate a helper to import it.
      // import -> const
      this.tokens.replaceToken("const");
      // Foo
      this.tokens.copyToken();
      // =
      this.tokens.copyToken();
      // require
      this.tokens.replaceToken(this.helperManager.getHelperName("require"));
    } else {
      // Otherwise, just switch `import` to `const`.
      this.tokens.replaceToken("const");
    }
    return true;
  }

   processImport() {
    if (this.tokens.matches2(_types.TokenType._import, _types.TokenType.parenL)) {
      // Dynamic imports don't need to be transformed.
      return false;
    }

    const snapshot = this.tokens.snapshot();
    const allImportsRemoved = this.removeImportTypeBindings();
    if (allImportsRemoved) {
      this.tokens.restoreToSnapshot(snapshot);
      while (!this.tokens.matches1(_types.TokenType.string)) {
        this.tokens.removeToken();
      }
      this.tokens.removeToken();
      _removeMaybeImportAssertion.removeMaybeImportAssertion.call(void 0, this.tokens);
      if (this.tokens.matches1(_types.TokenType.semi)) {
        this.tokens.removeToken();
      }
    }
    return true;
  }

  /**
   * Remove type bindings from this import, leaving the rest of the import intact.
   *
   * Return true if this import was ONLY types, and thus is eligible for removal. This will bail out
   * of the replacement operation, so we can return early here.
   */
   removeImportTypeBindings() {
    this.tokens.copyExpectedToken(_types.TokenType._import);
    if (
      this.tokens.matchesContextual(_keywords.ContextualKeyword._type) &&
      !this.tokens.matches1AtIndex(this.tokens.currentIndex() + 1, _types.TokenType.comma) &&
      !this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 1, _keywords.ContextualKeyword._from)
    ) {
      // This is an "import type" statement, so exit early.
      return true;
    }

    if (this.tokens.matches1(_types.TokenType.string)) {
      // This is a bare import, so we should proceed with the import.
      this.tokens.copyToken();
      return false;
    }

    // Skip the "module" token in import reflection.
    if (
      this.tokens.matchesContextual(_keywords.ContextualKeyword._module) &&
      this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 2, _keywords.ContextualKeyword._from)
    ) {
      this.tokens.copyToken();
    }

    let foundNonTypeImport = false;
    let needsComma = false;

    if (this.tokens.matches1(_types.TokenType.name)) {
      if (this.isTypeName(this.tokens.identifierName())) {
        this.tokens.removeToken();
        if (this.tokens.matches1(_types.TokenType.comma)) {
          this.tokens.removeToken();
        }
      } else {
        foundNonTypeImport = true;
        this.tokens.copyToken();
        if (this.tokens.matches1(_types.TokenType.comma)) {
          // We're in a statement like:
          // import A, * as B from './A';
          // or
          // import A, {foo} from './A';
          // where the `A` is being kept. The comma should be removed if an only
          // if the next part of the import statement is elided, but that's hard
          // to determine at this point in the code. Instead, always remove it
          // and set a flag to add it back if necessary.
          needsComma = true;
          this.tokens.removeToken();
        }
      }
    }

    if (this.tokens.matches1(_types.TokenType.star)) {
      if (this.isTypeName(this.tokens.identifierNameAtRelativeIndex(2))) {
        this.tokens.removeToken();
        this.tokens.removeToken();
        this.tokens.removeToken();
      } else {
        if (needsComma) {
          this.tokens.appendCode(",");
        }
        foundNonTypeImport = true;
        this.tokens.copyExpectedToken(_types.TokenType.star);
        this.tokens.copyExpectedToken(_types.TokenType.name);
        this.tokens.copyExpectedToken(_types.TokenType.name);
      }
    } else if (this.tokens.matches1(_types.TokenType.braceL)) {
      if (needsComma) {
        this.tokens.appendCode(",");
      }
      this.tokens.copyToken();
      while (!this.tokens.matches1(_types.TokenType.braceR)) {
        const specifierInfo = _getImportExportSpecifierInfo2.default.call(void 0, this.tokens);
        if (specifierInfo.isType || this.isTypeName(specifierInfo.rightName)) {
          while (this.tokens.currentIndex() < specifierInfo.endIndex) {
            this.tokens.removeToken();
          }
          if (this.tokens.matches1(_types.TokenType.comma)) {
            this.tokens.removeToken();
          }
        } else {
          foundNonTypeImport = true;
          while (this.tokens.currentIndex() < specifierInfo.endIndex) {
            this.tokens.copyToken();
          }
          if (this.tokens.matches1(_types.TokenType.comma)) {
            this.tokens.copyToken();
          }
        }
      }
      this.tokens.copyExpectedToken(_types.TokenType.braceR);
    }

    return !foundNonTypeImport;
  }

   isTypeName(name) {
    return this.isTypeScriptTransformEnabled && !this.nonTypeIdentifiers.has(name);
  }

   processExportDefault() {
    if (
      _shouldElideDefaultExport2.default.call(void 0, this.isTypeScriptTransformEnabled, this.tokens, this.declarationInfo)
    ) {
      // If the exported value is just an identifier and should be elided by TypeScript
      // rules, then remove it entirely. It will always have the form `export default e`,
      // where `e` is an identifier.
      this.tokens.removeInitialToken();
      this.tokens.removeToken();
      this.tokens.removeToken();
      return true;
    }

    const alreadyHasName =
      this.tokens.matches4(_types.TokenType._export, _types.TokenType._default, _types.TokenType._function, _types.TokenType.name) ||
      // export default async function
      (this.tokens.matches5(_types.TokenType._export, _types.TokenType._default, _types.TokenType.name, _types.TokenType._function, _types.TokenType.name) &&
        this.tokens.matchesContextualAtIndex(
          this.tokens.currentIndex() + 2,
          _keywords.ContextualKeyword._async,
        )) ||
      this.tokens.matches4(_types.TokenType._export, _types.TokenType._default, _types.TokenType._class, _types.TokenType.name) ||
      this.tokens.matches5(_types.TokenType._export, _types.TokenType._default, _types.TokenType._abstract, _types.TokenType._class, _types.TokenType.name);

    if (!alreadyHasName && this.reactHotLoaderTransformer) {
      // This is a plain "export default E" statement and we need to assign E to a variable.
      // Change "export default E" to "let _default; export default _default = E"
      const defaultVarName = this.nameManager.claimFreeName("_default");
      this.tokens.replaceToken(`let ${defaultVarName}; export`);
      this.tokens.copyToken();
      this.tokens.appendCode(` ${defaultVarName} =`);
      this.reactHotLoaderTransformer.setExtractedDefaultExportName(defaultVarName);
      return true;
    }
    return false;
  }

  /**
   * In TypeScript, we need to remove named exports that were never declared or only declared as a
   * type.
   */
   processNamedExports() {
    if (!this.isTypeScriptTransformEnabled) {
      return false;
    }
    this.tokens.copyExpectedToken(_types.TokenType._export);
    this.tokens.copyExpectedToken(_types.TokenType.braceL);

    while (!this.tokens.matches1(_types.TokenType.braceR)) {
      const specifierInfo = _getImportExportSpecifierInfo2.default.call(void 0, this.tokens);
      if (specifierInfo.isType || this.shouldElideExportedName(specifierInfo.leftName)) {
        // Type export, so remove all tokens, including any comma.
        while (this.tokens.currentIndex() < specifierInfo.endIndex) {
          this.tokens.removeToken();
        }
        if (this.tokens.matches1(_types.TokenType.comma)) {
          this.tokens.removeToken();
        }
      } else {
        // Non-type export, so copy all tokens, including any comma.
        while (this.tokens.currentIndex() < specifierInfo.endIndex) {
          this.tokens.copyToken();
        }
        if (this.tokens.matches1(_types.TokenType.comma)) {
          this.tokens.copyToken();
        }
      }
    }
    this.tokens.copyExpectedToken(_types.TokenType.braceR);
    return true;
  }

  /**
   * ESM elides all imports with the rule that we only elide if we see that it's
   * a type and never see it as a value. This is in contrast to CJS, which
   * elides imports that are completely unknown.
   */
   shouldElideExportedName(name) {
    return (
      this.isTypeScriptTransformEnabled &&
      this.declarationInfo.typeDeclarations.has(name) &&
      !this.declarationInfo.valueDeclarations.has(name)
    );
  }
} exports["default"] = ESMImportTransformer;


/***/ }),

/***/ 7628:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _keywords = __webpack_require__(3464);
var _types = __webpack_require__(798);


var _Transformer = __webpack_require__(5702); var _Transformer2 = _interopRequireDefault(_Transformer);

 class FlowTransformer extends _Transformer2.default {
  constructor(
     rootTransformer,
     tokens,
     isImportsTransformEnabled,
  ) {
    super();this.rootTransformer = rootTransformer;this.tokens = tokens;this.isImportsTransformEnabled = isImportsTransformEnabled;;
  }

  process() {
    if (
      this.rootTransformer.processPossibleArrowParamEnd() ||
      this.rootTransformer.processPossibleAsyncArrowWithTypeParams() ||
      this.rootTransformer.processPossibleTypeRange()
    ) {
      return true;
    }
    if (this.tokens.matches1(_types.TokenType._enum)) {
      this.processEnum();
      return true;
    }
    if (this.tokens.matches2(_types.TokenType._export, _types.TokenType._enum)) {
      this.processNamedExportEnum();
      return true;
    }
    if (this.tokens.matches3(_types.TokenType._export, _types.TokenType._default, _types.TokenType._enum)) {
      this.processDefaultExportEnum();
      return true;
    }
    return false;
  }

  /**
   * Handle a declaration like:
   * export enum E ...
   *
   * With this imports transform, this becomes:
   * const E = [[enum]]; exports.E = E;
   *
   * otherwise, it becomes:
   * export const E = [[enum]];
   */
  processNamedExportEnum() {
    if (this.isImportsTransformEnabled) {
      // export
      this.tokens.removeInitialToken();
      const enumName = this.tokens.identifierNameAtRelativeIndex(1);
      this.processEnum();
      this.tokens.appendCode(` exports.${enumName} = ${enumName};`);
    } else {
      this.tokens.copyToken();
      this.processEnum();
    }
  }

  /**
   * Handle a declaration like:
   * export default enum E
   *
   * With the imports transform, this becomes:
   * const E = [[enum]]; exports.default = E;
   *
   * otherwise, it becomes:
   * const E = [[enum]]; export default E;
   */
  processDefaultExportEnum() {
    // export
    this.tokens.removeInitialToken();
    // default
    this.tokens.removeToken();
    const enumName = this.tokens.identifierNameAtRelativeIndex(1);
    this.processEnum();
    if (this.isImportsTransformEnabled) {
      this.tokens.appendCode(` exports.default = ${enumName};`);
    } else {
      this.tokens.appendCode(` export default ${enumName};`);
    }
  }

  /**
   * Transpile flow enums to invoke the "flow-enums-runtime" library.
   *
   * Currently, the transpiled code always uses `require("flow-enums-runtime")`,
   * but if future flexibility is needed, we could expose a config option for
   * this string (similar to configurable JSX). Even when targeting ESM, the
   * default behavior of babel-plugin-transform-flow-enums is to use require
   * rather than injecting an import.
   *
   * Flow enums are quite a bit simpler than TS enums and have some convenient
   * constraints:
   * - Element initializers must be either always present or always absent. That
   *   means that we can use fixed lookahead on the first element (if any) and
   *   assume that all elements are like that.
   * - The right-hand side of an element initializer must be a literal value,
   *   not a complex expression and not referencing other elements. That means
   *   we can simply copy a single token.
   *
   * Enums can be broken up into three basic cases:
   *
   * Mirrored enums:
   * enum E {A, B}
   *   ->
   * const E = require("flow-enums-runtime").Mirrored(["A", "B"]);
   *
   * Initializer enums:
   * enum E {A = 1, B = 2}
   *   ->
   * const E = require("flow-enums-runtime")({A: 1, B: 2});
   *
   * Symbol enums:
   * enum E of symbol {A, B}
   *   ->
   * const E = require("flow-enums-runtime")({A: Symbol("A"), B: Symbol("B")});
   *
   * We can statically detect which of the three cases this is by looking at the
   * "of" declaration (if any) and seeing if the first element has an initializer.
   * Since the other transform details are so similar between the three cases, we
   * use a single implementation and vary the transform within processEnumElement
   * based on case.
   */
  processEnum() {
    // enum E -> const E
    this.tokens.replaceToken("const");
    this.tokens.copyExpectedToken(_types.TokenType.name);

    let isSymbolEnum = false;
    if (this.tokens.matchesContextual(_keywords.ContextualKeyword._of)) {
      this.tokens.removeToken();
      isSymbolEnum = this.tokens.matchesContextual(_keywords.ContextualKeyword._symbol);
      this.tokens.removeToken();
    }
    const hasInitializers = this.tokens.matches3(_types.TokenType.braceL, _types.TokenType.name, _types.TokenType.eq);
    this.tokens.appendCode(' = require("flow-enums-runtime")');

    const isMirrored = !isSymbolEnum && !hasInitializers;
    this.tokens.replaceTokenTrimmingLeftWhitespace(isMirrored ? ".Mirrored([" : "({");

    while (!this.tokens.matches1(_types.TokenType.braceR)) {
      // ... is allowed at the end and has no runtime behavior.
      if (this.tokens.matches1(_types.TokenType.ellipsis)) {
        this.tokens.removeToken();
        break;
      }
      this.processEnumElement(isSymbolEnum, hasInitializers);
      if (this.tokens.matches1(_types.TokenType.comma)) {
        this.tokens.copyToken();
      }
    }

    this.tokens.replaceToken(isMirrored ? "]);" : "});");
  }

  /**
   * Process an individual enum element, producing either an array element or an
   * object element based on what type of enum this is.
   */
  processEnumElement(isSymbolEnum, hasInitializers) {
    if (isSymbolEnum) {
      // Symbol enums never have initializers and are expanded to object elements.
      // A, -> A: Symbol("A"),
      const elementName = this.tokens.identifierName();
      this.tokens.copyToken();
      this.tokens.appendCode(`: Symbol("${elementName}")`);
    } else if (hasInitializers) {
      // Initializers are expanded to object elements.
      // A = 1, -> A: 1,
      this.tokens.copyToken();
      this.tokens.replaceTokenTrimmingLeftWhitespace(":");
      this.tokens.copyToken();
    } else {
      // Enum elements without initializers become string literal array elements.
      // A, -> "A",
      this.tokens.replaceToken(`"${this.tokens.identifierName()}"`);
    }
  }
} exports["default"] = FlowTransformer;


/***/ }),

/***/ 5526:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var _xhtml = __webpack_require__(9002); var _xhtml2 = _interopRequireDefault(_xhtml);
var _tokenizer = __webpack_require__(2297);
var _types = __webpack_require__(798);
var _charcodes = __webpack_require__(1537);

var _getJSXPragmaInfo = __webpack_require__(3654); var _getJSXPragmaInfo2 = _interopRequireDefault(_getJSXPragmaInfo);

var _Transformer = __webpack_require__(5702); var _Transformer2 = _interopRequireDefault(_Transformer);

 class JSXTransformer extends _Transformer2.default {
  
  
  

  // State for calculating the line number of each JSX tag in development.
  __init() {this.lastLineNumber = 1}
  __init2() {this.lastIndex = 0}

  // In development, variable name holding the name of the current file.
  __init3() {this.filenameVarName = null}
  // Mapping of claimed names for imports in the automatic transform, e,g.
  // {jsx: "_jsx"}. This determines which imports to generate in the prefix.
  __init4() {this.esmAutomaticImportNameResolutions = {}}
  // When automatically adding imports in CJS mode, we store the variable name
  // holding the imported CJS module so we can require it in the prefix.
  __init5() {this.cjsAutomaticModuleNameResolutions = {}}

  constructor(
     rootTransformer,
     tokens,
     importProcessor,
     nameManager,
     options,
  ) {
    super();this.rootTransformer = rootTransformer;this.tokens = tokens;this.importProcessor = importProcessor;this.nameManager = nameManager;this.options = options;JSXTransformer.prototype.__init.call(this);JSXTransformer.prototype.__init2.call(this);JSXTransformer.prototype.__init3.call(this);JSXTransformer.prototype.__init4.call(this);JSXTransformer.prototype.__init5.call(this);;
    this.jsxPragmaInfo = _getJSXPragmaInfo2.default.call(void 0, options);
    this.isAutomaticRuntime = options.jsxRuntime === "automatic";
    this.jsxImportSource = options.jsxImportSource || "react";
  }

  process() {
    if (this.tokens.matches1(_types.TokenType.jsxTagStart)) {
      this.processJSXTag();
      return true;
    }
    return false;
  }

  getPrefixCode() {
    let prefix = "";
    if (this.filenameVarName) {
      prefix += `const ${this.filenameVarName} = ${JSON.stringify(this.options.filePath || "")};`;
    }
    if (this.isAutomaticRuntime) {
      if (this.importProcessor) {
        // CJS mode: emit require statements for all modules that were referenced.
        for (const [path, resolvedName] of Object.entries(this.cjsAutomaticModuleNameResolutions)) {
          prefix += `var ${resolvedName} = require("${path}");`;
        }
      } else {
        // ESM mode: consolidate and emit import statements for referenced names.
        const {createElement: createElementResolution, ...otherResolutions} =
          this.esmAutomaticImportNameResolutions;
        if (createElementResolution) {
          prefix += `import {createElement as ${createElementResolution}} from "${this.jsxImportSource}";`;
        }
        const importSpecifiers = Object.entries(otherResolutions)
          .map(([name, resolvedName]) => `${name} as ${resolvedName}`)
          .join(", ");
        if (importSpecifiers) {
          const importPath =
            this.jsxImportSource + (this.options.production ? "/jsx-runtime" : "/jsx-dev-runtime");
          prefix += `import {${importSpecifiers}} from "${importPath}";`;
        }
      }
    }
    return prefix;
  }

  processJSXTag() {
    const {jsxRole, start} = this.tokens.currentToken();
    // Calculate line number information at the very start (if in development
    // mode) so that the information is guaranteed to be queried in token order.
    const elementLocationCode = this.options.production ? null : this.getElementLocationCode(start);
    if (this.isAutomaticRuntime && jsxRole !== _tokenizer.JSXRole.KeyAfterPropSpread) {
      this.transformTagToJSXFunc(elementLocationCode, jsxRole);
    } else {
      this.transformTagToCreateElement(elementLocationCode);
    }
  }

  getElementLocationCode(firstTokenStart) {
    const lineNumber = this.getLineNumberForIndex(firstTokenStart);
    return `lineNumber: ${lineNumber}`;
  }

  /**
   * Get the line number for this source position. This is calculated lazily and
   * must be called in increasing order by index.
   */
  getLineNumberForIndex(index) {
    const code = this.tokens.code;
    while (this.lastIndex < index && this.lastIndex < code.length) {
      if (code[this.lastIndex] === "\n") {
        this.lastLineNumber++;
      }
      this.lastIndex++;
    }
    return this.lastLineNumber;
  }

  /**
   * Convert the current JSX element to a call to jsx, jsxs, or jsxDEV. This is
   * the primary transformation for the automatic transform.
   *
   * Example:
   * <div a={1} key={2}>Hello{x}</div>
   * becomes
   * jsxs('div', {a: 1, children: ["Hello", x]}, 2)
   */
  transformTagToJSXFunc(elementLocationCode, jsxRole) {
    const isStatic = jsxRole === _tokenizer.JSXRole.StaticChildren;
    // First tag is always jsxTagStart.
    this.tokens.replaceToken(this.getJSXFuncInvocationCode(isStatic));

    let keyCode = null;
    if (this.tokens.matches1(_types.TokenType.jsxTagEnd)) {
      // Fragment syntax.
      this.tokens.replaceToken(`${this.getFragmentCode()}, {`);
      this.processAutomaticChildrenAndEndProps(jsxRole);
    } else {
      // Normal open tag or self-closing tag.
      this.processTagIntro();
      this.tokens.appendCode(", {");
      keyCode = this.processProps(true);

      if (this.tokens.matches2(_types.TokenType.slash, _types.TokenType.jsxTagEnd)) {
        // Self-closing tag, no children to add, so close the props.
        this.tokens.appendCode("}");
      } else if (this.tokens.matches1(_types.TokenType.jsxTagEnd)) {
        // Tag with children.
        this.tokens.removeToken();
        this.processAutomaticChildrenAndEndProps(jsxRole);
      } else {
        throw new Error("Expected either /> or > at the end of the tag.");
      }
      // If a key was present, move it to its own arg. Note that moving code
      // like this will cause line numbers to get out of sync within the JSX
      // element if the key expression has a newline in it. This is unfortunate,
      // but hopefully should be rare.
      if (keyCode) {
        this.tokens.appendCode(`, ${keyCode}`);
      }
    }
    if (!this.options.production) {
      // If the key wasn't already added, add it now so we can correctly set
      // positional args for jsxDEV.
      if (keyCode === null) {
        this.tokens.appendCode(", void 0");
      }
      this.tokens.appendCode(`, ${isStatic}, ${this.getDevSource(elementLocationCode)}, this`);
    }
    // We're at the close-tag or the end of a self-closing tag, so remove
    // everything else and close the function call.
    this.tokens.removeInitialToken();
    while (!this.tokens.matches1(_types.TokenType.jsxTagEnd)) {
      this.tokens.removeToken();
    }
    this.tokens.replaceToken(")");
  }

  /**
   * Convert the current JSX element to a createElement call. In the classic
   * runtime, this is the only case. In the automatic runtime, this is called
   * as a fallback in some situations.
   *
   * Example:
   * <div a={1} key={2}>Hello{x}</div>
   * becomes
   * React.createElement('div', {a: 1, key: 2}, "Hello", x)
   */
  transformTagToCreateElement(elementLocationCode) {
    // First tag is always jsxTagStart.
    this.tokens.replaceToken(this.getCreateElementInvocationCode());

    if (this.tokens.matches1(_types.TokenType.jsxTagEnd)) {
      // Fragment syntax.
      this.tokens.replaceToken(`${this.getFragmentCode()}, null`);
      this.processChildren(true);
    } else {
      // Normal open tag or self-closing tag.
      this.processTagIntro();
      this.processPropsObjectWithDevInfo(elementLocationCode);

      if (this.tokens.matches2(_types.TokenType.slash, _types.TokenType.jsxTagEnd)) {
        // Self-closing tag; no children to process.
      } else if (this.tokens.matches1(_types.TokenType.jsxTagEnd)) {
        // Tag with children and a close-tag; process the children as args.
        this.tokens.removeToken();
        this.processChildren(true);
      } else {
        throw new Error("Expected either /> or > at the end of the tag.");
      }
    }
    // We're at the close-tag or the end of a self-closing tag, so remove
    // everything else and close the function call.
    this.tokens.removeInitialToken();
    while (!this.tokens.matches1(_types.TokenType.jsxTagEnd)) {
      this.tokens.removeToken();
    }
    this.tokens.replaceToken(")");
  }

  /**
   * Get the code for the relevant function for this context: jsx, jsxs,
   * or jsxDEV. The following open-paren is included as well.
   *
   * These functions are only used for the automatic runtime, so they are always
   * auto-imported, but the auto-import will be either CJS or ESM based on the
   * target module format.
   */
  getJSXFuncInvocationCode(isStatic) {
    if (this.options.production) {
      if (isStatic) {
        return this.claimAutoImportedFuncInvocation("jsxs", "/jsx-runtime");
      } else {
        return this.claimAutoImportedFuncInvocation("jsx", "/jsx-runtime");
      }
    } else {
      return this.claimAutoImportedFuncInvocation("jsxDEV", "/jsx-dev-runtime");
    }
  }

  /**
   * Return the code to use for the createElement function, e.g.
   * `React.createElement`, including the following open-paren.
   *
   * This is the main function to use for the classic runtime. For the
   * automatic runtime, this function is used as a fallback function to
   * preserve behavior when there is a prop spread followed by an explicit
   * key. In that automatic runtime case, the function should be automatically
   * imported.
   */
  getCreateElementInvocationCode() {
    if (this.isAutomaticRuntime) {
      return this.claimAutoImportedFuncInvocation("createElement", "");
    } else {
      const {jsxPragmaInfo} = this;
      const resolvedPragmaBaseName = this.importProcessor
        ? this.importProcessor.getIdentifierReplacement(jsxPragmaInfo.base) || jsxPragmaInfo.base
        : jsxPragmaInfo.base;
      return `${resolvedPragmaBaseName}${jsxPragmaInfo.suffix}(`;
    }
  }

  /**
   * Return the code to use as the component when compiling a shorthand
   * fragment, e.g. `React.Fragment`.
   *
   * This may be called from either the classic or automatic runtime, and
   * the value should be auto-imported for the automatic runtime.
   */
  getFragmentCode() {
    if (this.isAutomaticRuntime) {
      return this.claimAutoImportedName(
        "Fragment",
        this.options.production ? "/jsx-runtime" : "/jsx-dev-runtime",
      );
    } else {
      const {jsxPragmaInfo} = this;
      const resolvedFragmentPragmaBaseName = this.importProcessor
        ? this.importProcessor.getIdentifierReplacement(jsxPragmaInfo.fragmentBase) ||
          jsxPragmaInfo.fragmentBase
        : jsxPragmaInfo.fragmentBase;
      return resolvedFragmentPragmaBaseName + jsxPragmaInfo.fragmentSuffix;
    }
  }

  /**
   * Return code that invokes the given function.
   *
   * When the imports transform is enabled, use the CJSImportTransformer
   * strategy of using `.call(void 0, ...` to avoid passing a `this` value in a
   * situation that would otherwise look like a method call.
   */
  claimAutoImportedFuncInvocation(funcName, importPathSuffix) {
    const funcCode = this.claimAutoImportedName(funcName, importPathSuffix);
    if (this.importProcessor) {
      return `${funcCode}.call(void 0, `;
    } else {
      return `${funcCode}(`;
    }
  }

  claimAutoImportedName(funcName, importPathSuffix) {
    if (this.importProcessor) {
      // CJS mode: claim a name for the module and mark it for import.
      const path = this.jsxImportSource + importPathSuffix;
      if (!this.cjsAutomaticModuleNameResolutions[path]) {
        this.cjsAutomaticModuleNameResolutions[path] =
          this.importProcessor.getFreeIdentifierForPath(path);
      }
      return `${this.cjsAutomaticModuleNameResolutions[path]}.${funcName}`;
    } else {
      // ESM mode: claim a name for this function and add it to the names that
      // should be auto-imported when the prefix is generated.
      if (!this.esmAutomaticImportNameResolutions[funcName]) {
        this.esmAutomaticImportNameResolutions[funcName] = this.nameManager.claimFreeName(
          `_${funcName}`,
        );
      }
      return this.esmAutomaticImportNameResolutions[funcName];
    }
  }

  /**
   * Process the first part of a tag, before any props.
   */
  processTagIntro() {
    // Walk forward until we see one of these patterns:
    // jsxName to start the first prop, preceded by another jsxName to end the tag name.
    // jsxName to start the first prop, preceded by greaterThan to end the type argument.
    // [open brace] to start the first prop.
    // [jsxTagEnd] to end the open-tag.
    // [slash, jsxTagEnd] to end the self-closing tag.
    let introEnd = this.tokens.currentIndex() + 1;
    while (
      this.tokens.tokens[introEnd].isType ||
      (!this.tokens.matches2AtIndex(introEnd - 1, _types.TokenType.jsxName, _types.TokenType.jsxName) &&
        !this.tokens.matches2AtIndex(introEnd - 1, _types.TokenType.greaterThan, _types.TokenType.jsxName) &&
        !this.tokens.matches1AtIndex(introEnd, _types.TokenType.braceL) &&
        !this.tokens.matches1AtIndex(introEnd, _types.TokenType.jsxTagEnd) &&
        !this.tokens.matches2AtIndex(introEnd, _types.TokenType.slash, _types.TokenType.jsxTagEnd))
    ) {
      introEnd++;
    }
    if (introEnd === this.tokens.currentIndex() + 1) {
      const tagName = this.tokens.identifierName();
      if (startsWithLowerCase(tagName)) {
        this.tokens.replaceToken(`'${tagName}'`);
      }
    }
    while (this.tokens.currentIndex() < introEnd) {
      this.rootTransformer.processToken();
    }
  }

  /**
   * Starting at the beginning of the props, add the props argument to
   * React.createElement, including the comma before it.
   */
  processPropsObjectWithDevInfo(elementLocationCode) {
    const devProps = this.options.production
      ? ""
      : `__self: this, __source: ${this.getDevSource(elementLocationCode)}`;
    if (!this.tokens.matches1(_types.TokenType.jsxName) && !this.tokens.matches1(_types.TokenType.braceL)) {
      if (devProps) {
        this.tokens.appendCode(`, {${devProps}}`);
      } else {
        this.tokens.appendCode(`, null`);
      }
      return;
    }
    this.tokens.appendCode(`, {`);
    this.processProps(false);
    if (devProps) {
      this.tokens.appendCode(` ${devProps}}`);
    } else {
      this.tokens.appendCode("}");
    }
  }

  /**
   * Transform the core part of the props, assuming that a { has already been
   * inserted before us and that a } will be inserted after us.
   *
   * If extractKeyCode is true (i.e. when using any jsx... function), any prop
   * named "key" has its code captured and returned rather than being emitted to
   * the output code. This shifts line numbers, and emitting the code later will
   * correct line numbers again. If no key is found or if extractKeyCode is
   * false, this function returns null.
   */
  processProps(extractKeyCode) {
    let keyCode = null;
    while (true) {
      if (this.tokens.matches2(_types.TokenType.jsxName, _types.TokenType.eq)) {
        // This is a regular key={value} or key="value" prop.
        const propName = this.tokens.identifierName();
        if (extractKeyCode && propName === "key") {
          if (keyCode !== null) {
            // The props list has multiple keys. Different implementations are
            // inconsistent about what to do here: as of this writing, Babel and
            // swc keep the *last* key and completely remove the rest, while
            // TypeScript uses the *first* key and leaves the others as regular
            // props. The React team collaborated with Babel on the
            // implementation of this behavior, so presumably the Babel behavior
            // is the one to use.
            // Since we won't ever be emitting the previous key code, we need to
            // at least emit its newlines here so that the line numbers match up
            // in the long run.
            this.tokens.appendCode(keyCode.replace(/[^\n]/g, ""));
          }
          // key
          this.tokens.removeToken();
          // =
          this.tokens.removeToken();
          const snapshot = this.tokens.snapshot();
          this.processPropValue();
          keyCode = this.tokens.dangerouslyGetAndRemoveCodeSinceSnapshot(snapshot);
          // Don't add a comma
          continue;
        } else {
          this.processPropName(propName);
          this.tokens.replaceToken(": ");
          this.processPropValue();
        }
      } else if (this.tokens.matches1(_types.TokenType.jsxName)) {
        // This is a shorthand prop like <input disabled />.
        const propName = this.tokens.identifierName();
        this.processPropName(propName);
        this.tokens.appendCode(": true");
      } else if (this.tokens.matches1(_types.TokenType.braceL)) {
        // This is prop spread, like <div {...getProps()}>, which we can pass
        // through fairly directly as an object spread.
        this.tokens.replaceToken("");
        this.rootTransformer.processBalancedCode();
        this.tokens.replaceToken("");
      } else {
        break;
      }
      this.tokens.appendCode(",");
    }
    return keyCode;
  }

  processPropName(propName) {
    if (propName.includes("-")) {
      this.tokens.replaceToken(`'${propName}'`);
    } else {
      this.tokens.copyToken();
    }
  }

  processPropValue() {
    if (this.tokens.matches1(_types.TokenType.braceL)) {
      this.tokens.replaceToken("");
      this.rootTransformer.processBalancedCode();
      this.tokens.replaceToken("");
    } else if (this.tokens.matches1(_types.TokenType.jsxTagStart)) {
      this.processJSXTag();
    } else {
      this.processStringPropValue();
    }
  }

  processStringPropValue() {
    const token = this.tokens.currentToken();
    const valueCode = this.tokens.code.slice(token.start + 1, token.end - 1);
    const replacementCode = formatJSXTextReplacement(valueCode);
    const literalCode = formatJSXStringValueLiteral(valueCode);
    this.tokens.replaceToken(literalCode + replacementCode);
  }

  /**
   * Starting in the middle of the props object literal, produce an additional
   * prop for the children and close the object literal.
   */
  processAutomaticChildrenAndEndProps(jsxRole) {
    if (jsxRole === _tokenizer.JSXRole.StaticChildren) {
      this.tokens.appendCode(" children: [");
      this.processChildren(false);
      this.tokens.appendCode("]}");
    } else {
      // The parser information tells us whether we will see a real child or if
      // all remaining children (if any) will resolve to empty. If there are no
      // non-empty children, don't emit a children prop at all, but still
      // process children so that we properly transform the code into nothing.
      if (jsxRole === _tokenizer.JSXRole.OneChild) {
        this.tokens.appendCode(" children: ");
      }
      this.processChildren(false);
      this.tokens.appendCode("}");
    }
  }

  /**
   * Transform children into a comma-separated list, which will be either
   * arguments to createElement or array elements of a children prop.
   */
  processChildren(needsInitialComma) {
    let needsComma = needsInitialComma;
    while (true) {
      if (this.tokens.matches2(_types.TokenType.jsxTagStart, _types.TokenType.slash)) {
        // Closing tag, so no more children.
        return;
      }
      let didEmitElement = false;
      if (this.tokens.matches1(_types.TokenType.braceL)) {
        if (this.tokens.matches2(_types.TokenType.braceL, _types.TokenType.braceR)) {
          // Empty interpolations and comment-only interpolations are allowed
          // and don't create an extra child arg.
          this.tokens.replaceToken("");
          this.tokens.replaceToken("");
        } else {
          // Interpolated expression.
          this.tokens.replaceToken(needsComma ? ", " : "");
          this.rootTransformer.processBalancedCode();
          this.tokens.replaceToken("");
          didEmitElement = true;
        }
      } else if (this.tokens.matches1(_types.TokenType.jsxTagStart)) {
        // Child JSX element
        this.tokens.appendCode(needsComma ? ", " : "");
        this.processJSXTag();
        didEmitElement = true;
      } else if (this.tokens.matches1(_types.TokenType.jsxText) || this.tokens.matches1(_types.TokenType.jsxEmptyText)) {
        didEmitElement = this.processChildTextElement(needsComma);
      } else {
        throw new Error("Unexpected token when processing JSX children.");
      }
      if (didEmitElement) {
        needsComma = true;
      }
    }
  }

  /**
   * Turn a JSX text element into a string literal, or nothing at all if the JSX
   * text resolves to the empty string.
   *
   * Returns true if a string literal is emitted, false otherwise.
   */
  processChildTextElement(needsComma) {
    const token = this.tokens.currentToken();
    const valueCode = this.tokens.code.slice(token.start, token.end);
    const replacementCode = formatJSXTextReplacement(valueCode);
    const literalCode = formatJSXTextLiteral(valueCode);
    if (literalCode === '""') {
      this.tokens.replaceToken(replacementCode);
      return false;
    } else {
      this.tokens.replaceToken(`${needsComma ? ", " : ""}${literalCode}${replacementCode}`);
      return true;
    }
  }

  getDevSource(elementLocationCode) {
    return `{fileName: ${this.getFilenameVarName()}, ${elementLocationCode}}`;
  }

  getFilenameVarName() {
    if (!this.filenameVarName) {
      this.filenameVarName = this.nameManager.claimFreeName("_jsxFileName");
    }
    return this.filenameVarName;
  }
} exports["default"] = JSXTransformer;

/**
 * Spec for identifiers: https://tc39.github.io/ecma262/#prod-IdentifierStart.
 *
 * Really only treat anything starting with a-z as tag names.  `_`, `$`, `é`
 * should be treated as component names
 */
 function startsWithLowerCase(s) {
  const firstChar = s.charCodeAt(0);
  return firstChar >= _charcodes.charCodes.lowercaseA && firstChar <= _charcodes.charCodes.lowercaseZ;
} exports.startsWithLowerCase = startsWithLowerCase;

/**
 * Turn the given jsxText string into a JS string literal. Leading and trailing
 * whitespace on lines is removed, except immediately after the open-tag and
 * before the close-tag. Empty lines are completely removed, and spaces are
 * added between lines after that.
 *
 * We use JSON.stringify to introduce escape characters as necessary, and trim
 * the start and end of each line and remove blank lines.
 */
function formatJSXTextLiteral(text) {
  let result = "";
  let whitespace = "";

  let isInInitialLineWhitespace = false;
  let seenNonWhitespace = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === " " || c === "\t" || c === "\r") {
      if (!isInInitialLineWhitespace) {
        whitespace += c;
      }
    } else if (c === "\n") {
      whitespace = "";
      isInInitialLineWhitespace = true;
    } else {
      if (seenNonWhitespace && isInInitialLineWhitespace) {
        result += " ";
      }
      result += whitespace;
      whitespace = "";
      if (c === "&") {
        const {entity, newI} = processEntity(text, i + 1);
        i = newI - 1;
        result += entity;
      } else {
        result += c;
      }
      seenNonWhitespace = true;
      isInInitialLineWhitespace = false;
    }
  }
  if (!isInInitialLineWhitespace) {
    result += whitespace;
  }
  return JSON.stringify(result);
}

/**
 * Produce the code that should be printed after the JSX text string literal,
 * with most content removed, but all newlines preserved and all spacing at the
 * end preserved.
 */
function formatJSXTextReplacement(text) {
  let numNewlines = 0;
  let numSpaces = 0;
  for (const c of text) {
    if (c === "\n") {
      numNewlines++;
      numSpaces = 0;
    } else if (c === " ") {
      numSpaces++;
    }
  }
  return "\n".repeat(numNewlines) + " ".repeat(numSpaces);
}

/**
 * Format a string in the value position of a JSX prop.
 *
 * Use the same implementation as convertAttribute from
 * babel-helper-builder-react-jsx.
 */
function formatJSXStringValueLiteral(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "\n") {
      if (/\s/.test(text[i + 1])) {
        result += " ";
        while (i < text.length && /\s/.test(text[i + 1])) {
          i++;
        }
      } else {
        result += "\n";
      }
    } else if (c === "&") {
      const {entity, newI} = processEntity(text, i + 1);
      result += entity;
      i = newI - 1;
    } else {
      result += c;
    }
  }
  return JSON.stringify(result);
}

/**
 * Starting at a &, see if there's an HTML entity (specified by name, decimal
 * char code, or hex char code) and return it if so.
 *
 * Modified from jsxReadString in babel-parser.
 */
function processEntity(text, indexAfterAmpersand) {
  let str = "";
  let count = 0;
  let entity;
  let i = indexAfterAmpersand;

  if (text[i] === "#") {
    let radix = 10;
    i++;
    let numStart;
    if (text[i] === "x") {
      radix = 16;
      i++;
      numStart = i;
      while (i < text.length && isHexDigit(text.charCodeAt(i))) {
        i++;
      }
    } else {
      numStart = i;
      while (i < text.length && isDecimalDigit(text.charCodeAt(i))) {
        i++;
      }
    }
    if (text[i] === ";") {
      const numStr = text.slice(numStart, i);
      if (numStr) {
        i++;
        entity = String.fromCodePoint(parseInt(numStr, radix));
      }
    }
  } else {
    while (i < text.length && count++ < 10) {
      const ch = text[i];
      i++;
      if (ch === ";") {
        entity = _xhtml2.default.get(str);
        break;
      }
      str += ch;
    }
  }

  if (!entity) {
    return {entity: "&", newI: indexAfterAmpersand};
  }
  return {entity, newI: i};
}

function isDecimalDigit(code) {
  return code >= _charcodes.charCodes.digit0 && code <= _charcodes.charCodes.digit9;
}

function isHexDigit(code) {
  return (
    (code >= _charcodes.charCodes.digit0 && code <= _charcodes.charCodes.digit9) ||
    (code >= _charcodes.charCodes.lowercaseA && code <= _charcodes.charCodes.lowercaseF) ||
    (code >= _charcodes.charCodes.uppercaseA && code <= _charcodes.charCodes.uppercaseF)
  );
}


/***/ }),

/***/ 6841:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _types = __webpack_require__(798);


var _Transformer = __webpack_require__(5702); var _Transformer2 = _interopRequireDefault(_Transformer);

const JEST_GLOBAL_NAME = "jest";
const HOISTED_METHODS = ["mock", "unmock", "enableAutomock", "disableAutomock"];

/**
 * Implementation of babel-plugin-jest-hoist, which hoists up some jest method
 * calls above the imports to allow them to override other imports.
 *
 * To preserve line numbers, rather than directly moving the jest.mock code, we
 * wrap each invocation in a function statement and then call the function from
 * the top of the file.
 */
 class JestHoistTransformer extends _Transformer2.default {
    __init() {this.hoistedFunctionNames = []}

  constructor(
     rootTransformer,
     tokens,
     nameManager,
     importProcessor,
  ) {
    super();this.rootTransformer = rootTransformer;this.tokens = tokens;this.nameManager = nameManager;this.importProcessor = importProcessor;JestHoistTransformer.prototype.__init.call(this);;
  }

  process() {
    if (
      this.tokens.currentToken().scopeDepth === 0 &&
      this.tokens.matches4(_types.TokenType.name, _types.TokenType.dot, _types.TokenType.name, _types.TokenType.parenL) &&
      this.tokens.identifierName() === JEST_GLOBAL_NAME
    ) {
      // TODO: This only works if imports transform is active, which it will be for jest.
      //       But if jest adds module support and we no longer need the import transform, this needs fixing.
      if (_optionalChain([this, 'access', _ => _.importProcessor, 'optionalAccess', _2 => _2.getGlobalNames, 'call', _3 => _3(), 'optionalAccess', _4 => _4.has, 'call', _5 => _5(JEST_GLOBAL_NAME)])) {
        return false;
      }
      return this.extractHoistedCalls();
    }

    return false;
  }

  getHoistedCode() {
    if (this.hoistedFunctionNames.length > 0) {
      // This will be placed before module interop code, but that's fine since
      // imports aren't allowed in module mock factories.
      return this.hoistedFunctionNames.map((name) => `${name}();`).join("");
    }
    return "";
  }

  /**
   * Extracts any methods calls on the jest-object that should be hoisted.
   *
   * According to the jest docs, https://jestjs.io/docs/en/jest-object#jestmockmodulename-factory-options,
   * mock, unmock, enableAutomock, disableAutomock, are the methods that should be hoisted.
   *
   * We do not apply the same checks of the arguments as babel-plugin-jest-hoist does.
   */
   extractHoistedCalls() {
    // We're handling a chain of calls where `jest` may or may not need to be inserted for each call
    // in the chain, so remove the initial `jest` to make the loop implementation cleaner.
    this.tokens.removeToken();
    // Track some state so that multiple non-hoisted chained calls in a row keep their chaining
    // syntax.
    let followsNonHoistedJestCall = false;

    // Iterate through all chained calls on the jest object.
    while (this.tokens.matches3(_types.TokenType.dot, _types.TokenType.name, _types.TokenType.parenL)) {
      const methodName = this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 1);
      const shouldHoist = HOISTED_METHODS.includes(methodName);
      if (shouldHoist) {
        // We've matched e.g. `.mock(...)` or similar call.
        // Replace the initial `.` with `function __jestHoist(){jest.`
        const hoistedFunctionName = this.nameManager.claimFreeName("__jestHoist");
        this.hoistedFunctionNames.push(hoistedFunctionName);
        this.tokens.replaceToken(`function ${hoistedFunctionName}(){${JEST_GLOBAL_NAME}.`);
        this.tokens.copyToken();
        this.tokens.copyToken();
        this.rootTransformer.processBalancedCode();
        this.tokens.copyExpectedToken(_types.TokenType.parenR);
        this.tokens.appendCode(";}");
        followsNonHoistedJestCall = false;
      } else {
        // This is a non-hoisted method, so just transform the code as usual.
        if (followsNonHoistedJestCall) {
          // If we didn't hoist the previous call, we can leave the code as-is to chain off of the
          // previous method call. It's important to preserve the code here because we don't know
          // for sure that the method actually returned the jest object for chaining.
          this.tokens.copyToken();
        } else {
          // If we hoisted the previous call, we know it returns the jest object back, so we insert
          // the identifier `jest` to continue the chain.
          this.tokens.replaceToken(`${JEST_GLOBAL_NAME}.`);
        }
        this.tokens.copyToken();
        this.tokens.copyToken();
        this.rootTransformer.processBalancedCode();
        this.tokens.copyExpectedToken(_types.TokenType.parenR);
        followsNonHoistedJestCall = true;
      }
    }

    return true;
  }
} exports["default"] = JestHoistTransformer;


/***/ }),

/***/ 6548:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _types = __webpack_require__(798);

var _Transformer = __webpack_require__(5702); var _Transformer2 = _interopRequireDefault(_Transformer);

 class NumericSeparatorTransformer extends _Transformer2.default {
  constructor( tokens) {
    super();this.tokens = tokens;;
  }

  process() {
    if (this.tokens.matches1(_types.TokenType.num)) {
      const code = this.tokens.currentTokenCode();
      if (code.includes("_")) {
        this.tokens.replaceToken(code.replace(/_/g, ""));
        return true;
      }
    }
    return false;
  }
} exports["default"] = NumericSeparatorTransformer;


/***/ }),

/***/ 50:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _types = __webpack_require__(798);

var _Transformer = __webpack_require__(5702); var _Transformer2 = _interopRequireDefault(_Transformer);

 class OptionalCatchBindingTransformer extends _Transformer2.default {
  constructor( tokens,  nameManager) {
    super();this.tokens = tokens;this.nameManager = nameManager;;
  }

  process() {
    if (this.tokens.matches2(_types.TokenType._catch, _types.TokenType.braceL)) {
      this.tokens.copyToken();
      this.tokens.appendCode(` (${this.nameManager.claimFreeName("e")})`);
      return true;
    }
    return false;
  }
} exports["default"] = OptionalCatchBindingTransformer;


/***/ }),

/***/ 5063:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _types = __webpack_require__(798);

var _Transformer = __webpack_require__(5702); var _Transformer2 = _interopRequireDefault(_Transformer);

/**
 * Transformer supporting the optional chaining and nullish coalescing operators.
 *
 * Tech plan here:
 * https://github.com/alangpierce/sucrase/wiki/Sucrase-Optional-Chaining-and-Nullish-Coalescing-Technical-Plan
 *
 * The prefix and suffix code snippets are handled by TokenProcessor, and this transformer handles
 * the operators themselves.
 */
 class OptionalChainingNullishTransformer extends _Transformer2.default {
  constructor( tokens,  nameManager) {
    super();this.tokens = tokens;this.nameManager = nameManager;;
  }

  process() {
    if (this.tokens.matches1(_types.TokenType.nullishCoalescing)) {
      const token = this.tokens.currentToken();
      if (this.tokens.tokens[token.nullishStartIndex].isAsyncOperation) {
        this.tokens.replaceTokenTrimmingLeftWhitespace(", async () => (");
      } else {
        this.tokens.replaceTokenTrimmingLeftWhitespace(", () => (");
      }
      return true;
    }
    if (this.tokens.matches1(_types.TokenType._delete)) {
      const nextToken = this.tokens.tokenAtRelativeIndex(1);
      if (nextToken.isOptionalChainStart) {
        this.tokens.removeInitialToken();
        return true;
      }
    }
    const token = this.tokens.currentToken();
    const chainStart = token.subscriptStartIndex;
    if (
      chainStart != null &&
      this.tokens.tokens[chainStart].isOptionalChainStart &&
      // Super subscripts can't be optional (since super is never null/undefined), and the syntax
      // relies on the subscript being intact, so leave this token alone.
      this.tokens.tokenAtRelativeIndex(-1).type !== _types.TokenType._super
    ) {
      const param = this.nameManager.claimFreeName("_");
      let arrowStartSnippet;
      if (
        chainStart > 0 &&
        this.tokens.matches1AtIndex(chainStart - 1, _types.TokenType._delete) &&
        this.isLastSubscriptInChain()
      ) {
        // Delete operations are special: we already removed the delete keyword, and to still
        // perform a delete, we need to insert a delete in the very last part of the chain, which
        // in correct code will always be a property access.
        arrowStartSnippet = `${param} => delete ${param}`;
      } else {
        arrowStartSnippet = `${param} => ${param}`;
      }
      if (this.tokens.tokens[chainStart].isAsyncOperation) {
        arrowStartSnippet = `async ${arrowStartSnippet}`;
      }
      if (
        this.tokens.matches2(_types.TokenType.questionDot, _types.TokenType.parenL) ||
        this.tokens.matches2(_types.TokenType.questionDot, _types.TokenType.lessThan)
      ) {
        if (this.justSkippedSuper()) {
          this.tokens.appendCode(".bind(this)");
        }
        this.tokens.replaceTokenTrimmingLeftWhitespace(`, 'optionalCall', ${arrowStartSnippet}`);
      } else if (this.tokens.matches2(_types.TokenType.questionDot, _types.TokenType.bracketL)) {
        this.tokens.replaceTokenTrimmingLeftWhitespace(`, 'optionalAccess', ${arrowStartSnippet}`);
      } else if (this.tokens.matches1(_types.TokenType.questionDot)) {
        this.tokens.replaceTokenTrimmingLeftWhitespace(`, 'optionalAccess', ${arrowStartSnippet}.`);
      } else if (this.tokens.matches1(_types.TokenType.dot)) {
        this.tokens.replaceTokenTrimmingLeftWhitespace(`, 'access', ${arrowStartSnippet}.`);
      } else if (this.tokens.matches1(_types.TokenType.bracketL)) {
        this.tokens.replaceTokenTrimmingLeftWhitespace(`, 'access', ${arrowStartSnippet}[`);
      } else if (this.tokens.matches1(_types.TokenType.parenL)) {
        if (this.justSkippedSuper()) {
          this.tokens.appendCode(".bind(this)");
        }
        this.tokens.replaceTokenTrimmingLeftWhitespace(`, 'call', ${arrowStartSnippet}(`);
      } else {
        throw new Error("Unexpected subscript operator in optional chain.");
      }
      return true;
    }
    return false;
  }

  /**
   * Determine if the current token is the last of its chain, so that we know whether it's eligible
   * to have a delete op inserted.
   *
   * We can do this by walking forward until we determine one way or another. Each
   * isOptionalChainStart token must be paired with exactly one isOptionalChainEnd token after it in
   * a nesting way, so we can track depth and walk to the end of the chain (the point where the
   * depth goes negative) and see if any other subscript token is after us in the chain.
   */
  isLastSubscriptInChain() {
    let depth = 0;
    for (let i = this.tokens.currentIndex() + 1; ; i++) {
      if (i >= this.tokens.tokens.length) {
        throw new Error("Reached the end of the code while finding the end of the access chain.");
      }
      if (this.tokens.tokens[i].isOptionalChainStart) {
        depth++;
      } else if (this.tokens.tokens[i].isOptionalChainEnd) {
        depth--;
      }
      if (depth < 0) {
        return true;
      }

      // This subscript token is a later one in the same chain.
      if (depth === 0 && this.tokens.tokens[i].subscriptStartIndex != null) {
        return false;
      }
    }
  }

  /**
   * Determine if we are the open-paren in an expression like super.a()?.b.
   *
   * We can do this by walking backward to find the previous subscript. If that subscript was
   * preceded by a super, then we must be the subscript after it, so if this is a call expression,
   * we'll need to attach the right context.
   */
  justSkippedSuper() {
    let depth = 0;
    let index = this.tokens.currentIndex() - 1;
    while (true) {
      if (index < 0) {
        throw new Error(
          "Reached the start of the code while finding the start of the access chain.",
        );
      }
      if (this.tokens.tokens[index].isOptionalChainStart) {
        depth--;
      } else if (this.tokens.tokens[index].isOptionalChainEnd) {
        depth++;
      }
      if (depth < 0) {
        return false;
      }

      // This subscript token is a later one in the same chain.
      if (depth === 0 && this.tokens.tokens[index].subscriptStartIndex != null) {
        return this.tokens.tokens[index - 1].type === _types.TokenType._super;
      }
      index--;
    }
  }
} exports["default"] = OptionalChainingNullishTransformer;


/***/ }),

/***/ 506:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _tokenizer = __webpack_require__(2297);
var _types = __webpack_require__(798);


var _Transformer = __webpack_require__(5702); var _Transformer2 = _interopRequireDefault(_Transformer);

/**
 * Implementation of babel-plugin-transform-react-display-name, which adds a
 * display name to usages of React.createClass and createReactClass.
 */
 class ReactDisplayNameTransformer extends _Transformer2.default {
  constructor(
     rootTransformer,
     tokens,
     importProcessor,
     options,
  ) {
    super();this.rootTransformer = rootTransformer;this.tokens = tokens;this.importProcessor = importProcessor;this.options = options;;
  }

  process() {
    const startIndex = this.tokens.currentIndex();
    if (this.tokens.identifierName() === "createReactClass") {
      const newName =
        this.importProcessor && this.importProcessor.getIdentifierReplacement("createReactClass");
      if (newName) {
        this.tokens.replaceToken(`(0, ${newName})`);
      } else {
        this.tokens.copyToken();
      }
      this.tryProcessCreateClassCall(startIndex);
      return true;
    }
    if (
      this.tokens.matches3(_types.TokenType.name, _types.TokenType.dot, _types.TokenType.name) &&
      this.tokens.identifierName() === "React" &&
      this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 2) === "createClass"
    ) {
      const newName = this.importProcessor
        ? this.importProcessor.getIdentifierReplacement("React") || "React"
        : "React";
      if (newName) {
        this.tokens.replaceToken(newName);
        this.tokens.copyToken();
        this.tokens.copyToken();
      } else {
        this.tokens.copyToken();
        this.tokens.copyToken();
        this.tokens.copyToken();
      }
      this.tryProcessCreateClassCall(startIndex);
      return true;
    }
    return false;
  }

  /**
   * This is called with the token position at the open-paren.
   */
   tryProcessCreateClassCall(startIndex) {
    const displayName = this.findDisplayName(startIndex);
    if (!displayName) {
      return;
    }

    if (this.classNeedsDisplayName()) {
      this.tokens.copyExpectedToken(_types.TokenType.parenL);
      this.tokens.copyExpectedToken(_types.TokenType.braceL);
      this.tokens.appendCode(`displayName: '${displayName}',`);
      this.rootTransformer.processBalancedCode();
      this.tokens.copyExpectedToken(_types.TokenType.braceR);
      this.tokens.copyExpectedToken(_types.TokenType.parenR);
    }
  }

   findDisplayName(startIndex) {
    if (startIndex < 2) {
      return null;
    }
    if (this.tokens.matches2AtIndex(startIndex - 2, _types.TokenType.name, _types.TokenType.eq)) {
      // This is an assignment (or declaration) and the LHS is either an identifier or a member
      // expression ending in an identifier, so use that identifier name.
      return this.tokens.identifierNameAtIndex(startIndex - 2);
    }
    if (
      startIndex >= 2 &&
      this.tokens.tokens[startIndex - 2].identifierRole === _tokenizer.IdentifierRole.ObjectKey
    ) {
      // This is an object literal value.
      return this.tokens.identifierNameAtIndex(startIndex - 2);
    }
    if (this.tokens.matches2AtIndex(startIndex - 2, _types.TokenType._export, _types.TokenType._default)) {
      return this.getDisplayNameFromFilename();
    }
    return null;
  }

   getDisplayNameFromFilename() {
    const filePath = this.options.filePath || "unknown";
    const pathSegments = filePath.split("/");
    const filename = pathSegments[pathSegments.length - 1];
    const dotIndex = filename.lastIndexOf(".");
    const baseFilename = dotIndex === -1 ? filename : filename.slice(0, dotIndex);
    if (baseFilename === "index" && pathSegments[pathSegments.length - 2]) {
      return pathSegments[pathSegments.length - 2];
    } else {
      return baseFilename;
    }
  }

  /**
   * We only want to add a display name when this is a function call containing
   * one argument, which is an object literal without `displayName` as an
   * existing key.
   */
   classNeedsDisplayName() {
    let index = this.tokens.currentIndex();
    if (!this.tokens.matches2(_types.TokenType.parenL, _types.TokenType.braceL)) {
      return false;
    }
    // The block starts on the {, and we expect any displayName key to be in
    // that context. We need to ignore other other contexts to avoid matching
    // nested displayName keys.
    const objectStartIndex = index + 1;
    const objectContextId = this.tokens.tokens[objectStartIndex].contextId;
    if (objectContextId == null) {
      throw new Error("Expected non-null context ID on object open-brace.");
    }

    for (; index < this.tokens.tokens.length; index++) {
      const token = this.tokens.tokens[index];
      if (token.type === _types.TokenType.braceR && token.contextId === objectContextId) {
        index++;
        break;
      }

      if (
        this.tokens.identifierNameAtIndex(index) === "displayName" &&
        this.tokens.tokens[index].identifierRole === _tokenizer.IdentifierRole.ObjectKey &&
        token.contextId === objectContextId
      ) {
        // We found a displayName key, so bail out.
        return false;
      }
    }

    if (index === this.tokens.tokens.length) {
      throw new Error("Unexpected end of input when processing React class.");
    }

    // If we got this far, we know we have createClass with an object with no
    // display name, so we want to proceed as long as that was the only argument.
    return (
      this.tokens.matches1AtIndex(index, _types.TokenType.parenR) ||
      this.tokens.matches2AtIndex(index, _types.TokenType.comma, _types.TokenType.parenR)
    );
  }
} exports["default"] = ReactDisplayNameTransformer;


/***/ }),

/***/ 262:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _tokenizer = __webpack_require__(2297);

var _Transformer = __webpack_require__(5702); var _Transformer2 = _interopRequireDefault(_Transformer);

 class ReactHotLoaderTransformer extends _Transformer2.default {
   __init() {this.extractedDefaultExportName = null}

  constructor( tokens,  filePath) {
    super();this.tokens = tokens;this.filePath = filePath;ReactHotLoaderTransformer.prototype.__init.call(this);;
  }

  setExtractedDefaultExportName(extractedDefaultExportName) {
    this.extractedDefaultExportName = extractedDefaultExportName;
  }

  getPrefixCode() {
    return `
      (function () {
        var enterModule = require('react-hot-loader').enterModule;
        enterModule && enterModule(module);
      })();`
      .replace(/\s+/g, " ")
      .trim();
  }

  getSuffixCode() {
    const topLevelNames = new Set();
    for (const token of this.tokens.tokens) {
      if (
        !token.isType &&
        _tokenizer.isTopLevelDeclaration.call(void 0, token) &&
        token.identifierRole !== _tokenizer.IdentifierRole.ImportDeclaration
      ) {
        topLevelNames.add(this.tokens.identifierNameForToken(token));
      }
    }
    const namesToRegister = Array.from(topLevelNames).map((name) => ({
      variableName: name,
      uniqueLocalName: name,
    }));
    if (this.extractedDefaultExportName) {
      namesToRegister.push({
        variableName: this.extractedDefaultExportName,
        uniqueLocalName: "default",
      });
    }
    return `
;(function () {
  var reactHotLoader = require('react-hot-loader').default;
  var leaveModule = require('react-hot-loader').leaveModule;
  if (!reactHotLoader) {
    return;
  }
${namesToRegister
  .map(
    ({variableName, uniqueLocalName}) =>
      `  reactHotLoader.register(${variableName}, "${uniqueLocalName}", ${JSON.stringify(
        this.filePath || "",
      )});`,
  )
  .join("\n")}
  leaveModule(module);
})();`;
  }

  process() {
    return false;
  }
} exports["default"] = ReactHotLoaderTransformer;


/***/ }),

/***/ 3438:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var _keywords = __webpack_require__(3464);
var _types = __webpack_require__(798);

var _getClassInfo = __webpack_require__(3546); var _getClassInfo2 = _interopRequireDefault(_getClassInfo);
var _CJSImportTransformer = __webpack_require__(1125); var _CJSImportTransformer2 = _interopRequireDefault(_CJSImportTransformer);
var _ESMImportTransformer = __webpack_require__(1893); var _ESMImportTransformer2 = _interopRequireDefault(_ESMImportTransformer);
var _FlowTransformer = __webpack_require__(7628); var _FlowTransformer2 = _interopRequireDefault(_FlowTransformer);
var _JestHoistTransformer = __webpack_require__(6841); var _JestHoistTransformer2 = _interopRequireDefault(_JestHoistTransformer);
var _JSXTransformer = __webpack_require__(5526); var _JSXTransformer2 = _interopRequireDefault(_JSXTransformer);
var _NumericSeparatorTransformer = __webpack_require__(6548); var _NumericSeparatorTransformer2 = _interopRequireDefault(_NumericSeparatorTransformer);
var _OptionalCatchBindingTransformer = __webpack_require__(50); var _OptionalCatchBindingTransformer2 = _interopRequireDefault(_OptionalCatchBindingTransformer);
var _OptionalChainingNullishTransformer = __webpack_require__(5063); var _OptionalChainingNullishTransformer2 = _interopRequireDefault(_OptionalChainingNullishTransformer);
var _ReactDisplayNameTransformer = __webpack_require__(506); var _ReactDisplayNameTransformer2 = _interopRequireDefault(_ReactDisplayNameTransformer);
var _ReactHotLoaderTransformer = __webpack_require__(262); var _ReactHotLoaderTransformer2 = _interopRequireDefault(_ReactHotLoaderTransformer);

var _TypeScriptTransformer = __webpack_require__(1047); var _TypeScriptTransformer2 = _interopRequireDefault(_TypeScriptTransformer);








 class RootTransformer {
   __init() {this.transformers = []}
  
  
   __init2() {this.generatedVariables = []}
  
  
  
  

  constructor(
    sucraseContext,
    transforms,
    enableLegacyBabel5ModuleInterop,
    options,
  ) {;RootTransformer.prototype.__init.call(this);RootTransformer.prototype.__init2.call(this);
    this.nameManager = sucraseContext.nameManager;
    this.helperManager = sucraseContext.helperManager;
    const {tokenProcessor, importProcessor} = sucraseContext;
    this.tokens = tokenProcessor;
    this.isImportsTransformEnabled = transforms.includes("imports");
    this.isReactHotLoaderTransformEnabled = transforms.includes("react-hot-loader");
    this.disableESTransforms = Boolean(options.disableESTransforms);

    if (!options.disableESTransforms) {
      this.transformers.push(
        new (0, _OptionalChainingNullishTransformer2.default)(tokenProcessor, this.nameManager),
      );
      this.transformers.push(new (0, _NumericSeparatorTransformer2.default)(tokenProcessor));
      this.transformers.push(new (0, _OptionalCatchBindingTransformer2.default)(tokenProcessor, this.nameManager));
    }

    if (transforms.includes("jsx")) {
      if (options.jsxRuntime !== "preserve") {
        this.transformers.push(
          new (0, _JSXTransformer2.default)(this, tokenProcessor, importProcessor, this.nameManager, options),
        );
      }
      this.transformers.push(
        new (0, _ReactDisplayNameTransformer2.default)(this, tokenProcessor, importProcessor, options),
      );
    }

    let reactHotLoaderTransformer = null;
    if (transforms.includes("react-hot-loader")) {
      if (!options.filePath) {
        throw new Error("filePath is required when using the react-hot-loader transform.");
      }
      reactHotLoaderTransformer = new (0, _ReactHotLoaderTransformer2.default)(tokenProcessor, options.filePath);
      this.transformers.push(reactHotLoaderTransformer);
    }

    // Note that we always want to enable the imports transformer, even when the import transform
    // itself isn't enabled, since we need to do type-only import pruning for both Flow and
    // TypeScript.
    if (transforms.includes("imports")) {
      if (importProcessor === null) {
        throw new Error("Expected non-null importProcessor with imports transform enabled.");
      }
      this.transformers.push(
        new (0, _CJSImportTransformer2.default)(
          this,
          tokenProcessor,
          importProcessor,
          this.nameManager,
          this.helperManager,
          reactHotLoaderTransformer,
          enableLegacyBabel5ModuleInterop,
          Boolean(options.enableLegacyTypeScriptModuleInterop),
          transforms.includes("typescript"),
          Boolean(options.preserveDynamicImport),
        ),
      );
    } else {
      this.transformers.push(
        new (0, _ESMImportTransformer2.default)(
          tokenProcessor,
          this.nameManager,
          this.helperManager,
          reactHotLoaderTransformer,
          transforms.includes("typescript"),
          options,
        ),
      );
    }

    if (transforms.includes("flow")) {
      this.transformers.push(
        new (0, _FlowTransformer2.default)(this, tokenProcessor, transforms.includes("imports")),
      );
    }
    if (transforms.includes("typescript")) {
      this.transformers.push(
        new (0, _TypeScriptTransformer2.default)(this, tokenProcessor, transforms.includes("imports")),
      );
    }
    if (transforms.includes("jest")) {
      this.transformers.push(
        new (0, _JestHoistTransformer2.default)(this, tokenProcessor, this.nameManager, importProcessor),
      );
    }
  }

  transform() {
    this.tokens.reset();
    this.processBalancedCode();
    const shouldAddUseStrict = this.isImportsTransformEnabled;
    // "use strict" always needs to be first, so override the normal transformer order.
    let prefix = shouldAddUseStrict ? '"use strict";' : "";
    for (const transformer of this.transformers) {
      prefix += transformer.getPrefixCode();
    }
    prefix += this.helperManager.emitHelpers();
    prefix += this.generatedVariables.map((v) => ` var ${v};`).join("");
    for (const transformer of this.transformers) {
      prefix += transformer.getHoistedCode();
    }
    let suffix = "";
    for (const transformer of this.transformers) {
      suffix += transformer.getSuffixCode();
    }
    const result = this.tokens.finish();
    let {code} = result;
    if (code.startsWith("#!")) {
      let newlineIndex = code.indexOf("\n");
      if (newlineIndex === -1) {
        newlineIndex = code.length;
        code += "\n";
      }
      return {
        code: code.slice(0, newlineIndex + 1) + prefix + code.slice(newlineIndex + 1) + suffix,
        // The hashbang line has no tokens, so shifting the tokens to account
        // for prefix can happen normally.
        mappings: this.shiftMappings(result.mappings, prefix.length),
      };
    } else {
      return {
        code: prefix + code + suffix,
        mappings: this.shiftMappings(result.mappings, prefix.length),
      };
    }
  }

  processBalancedCode() {
    let braceDepth = 0;
    let parenDepth = 0;
    while (!this.tokens.isAtEnd()) {
      if (this.tokens.matches1(_types.TokenType.braceL) || this.tokens.matches1(_types.TokenType.dollarBraceL)) {
        braceDepth++;
      } else if (this.tokens.matches1(_types.TokenType.braceR)) {
        if (braceDepth === 0) {
          return;
        }
        braceDepth--;
      }
      if (this.tokens.matches1(_types.TokenType.parenL)) {
        parenDepth++;
      } else if (this.tokens.matches1(_types.TokenType.parenR)) {
        if (parenDepth === 0) {
          return;
        }
        parenDepth--;
      }
      this.processToken();
    }
  }

  processToken() {
    if (this.tokens.matches1(_types.TokenType._class)) {
      this.processClass();
      return;
    }
    for (const transformer of this.transformers) {
      const wasProcessed = transformer.process();
      if (wasProcessed) {
        return;
      }
    }
    this.tokens.copyToken();
  }

  /**
   * Skip past a class with a name and return that name.
   */
  processNamedClass() {
    if (!this.tokens.matches2(_types.TokenType._class, _types.TokenType.name)) {
      throw new Error("Expected identifier for exported class name.");
    }
    const name = this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 1);
    this.processClass();
    return name;
  }

  processClass() {
    const classInfo = _getClassInfo2.default.call(void 0, this, this.tokens, this.nameManager, this.disableESTransforms);

    // Both static and instance initializers need a class name to use to invoke the initializer, so
    // assign to one if necessary.
    const needsCommaExpression =
      (classInfo.headerInfo.isExpression || !classInfo.headerInfo.className) &&
      classInfo.staticInitializerNames.length + classInfo.instanceInitializerNames.length > 0;

    let className = classInfo.headerInfo.className;
    if (needsCommaExpression) {
      className = this.nameManager.claimFreeName("_class");
      this.generatedVariables.push(className);
      this.tokens.appendCode(` (${className} =`);
    }

    const classToken = this.tokens.currentToken();
    const contextId = classToken.contextId;
    if (contextId == null) {
      throw new Error("Expected class to have a context ID.");
    }
    this.tokens.copyExpectedToken(_types.TokenType._class);
    while (!this.tokens.matchesContextIdAndLabel(_types.TokenType.braceL, contextId)) {
      this.processToken();
    }

    this.processClassBody(classInfo, className);

    const staticInitializerStatements = classInfo.staticInitializerNames.map(
      (name) => `${className}.${name}()`,
    );
    if (needsCommaExpression) {
      this.tokens.appendCode(
        `, ${staticInitializerStatements.map((s) => `${s}, `).join("")}${className})`,
      );
    } else if (classInfo.staticInitializerNames.length > 0) {
      this.tokens.appendCode(` ${staticInitializerStatements.map((s) => `${s};`).join(" ")}`);
    }
  }

  /**
   * We want to just handle class fields in all contexts, since TypeScript supports them. Later,
   * when some JS implementations support class fields, this should be made optional.
   */
  processClassBody(classInfo, className) {
    const {
      headerInfo,
      constructorInsertPos,
      constructorInitializerStatements,
      fields,
      instanceInitializerNames,
      rangesToRemove,
    } = classInfo;
    let fieldIndex = 0;
    let rangeToRemoveIndex = 0;
    const classContextId = this.tokens.currentToken().contextId;
    if (classContextId == null) {
      throw new Error("Expected non-null context ID on class.");
    }
    this.tokens.copyExpectedToken(_types.TokenType.braceL);
    if (this.isReactHotLoaderTransformEnabled) {
      this.tokens.appendCode(
        "__reactstandin__regenerateByEval(key, code) {this[key] = eval(code);}",
      );
    }

    const needsConstructorInit =
      constructorInitializerStatements.length + instanceInitializerNames.length > 0;

    if (constructorInsertPos === null && needsConstructorInit) {
      const constructorInitializersCode = this.makeConstructorInitCode(
        constructorInitializerStatements,
        instanceInitializerNames,
        className,
      );
      if (headerInfo.hasSuperclass) {
        const argsName = this.nameManager.claimFreeName("args");
        this.tokens.appendCode(
          `constructor(...${argsName}) { super(...${argsName}); ${constructorInitializersCode}; }`,
        );
      } else {
        this.tokens.appendCode(`constructor() { ${constructorInitializersCode}; }`);
      }
    }

    while (!this.tokens.matchesContextIdAndLabel(_types.TokenType.braceR, classContextId)) {
      if (fieldIndex < fields.length && this.tokens.currentIndex() === fields[fieldIndex].start) {
        let needsCloseBrace = false;
        if (this.tokens.matches1(_types.TokenType.bracketL)) {
          this.tokens.copyTokenWithPrefix(`${fields[fieldIndex].initializerName}() {this`);
        } else if (this.tokens.matches1(_types.TokenType.string) || this.tokens.matches1(_types.TokenType.num)) {
          this.tokens.copyTokenWithPrefix(`${fields[fieldIndex].initializerName}() {this[`);
          needsCloseBrace = true;
        } else {
          this.tokens.copyTokenWithPrefix(`${fields[fieldIndex].initializerName}() {this.`);
        }
        while (this.tokens.currentIndex() < fields[fieldIndex].end) {
          if (needsCloseBrace && this.tokens.currentIndex() === fields[fieldIndex].equalsIndex) {
            this.tokens.appendCode("]");
          }
          this.processToken();
        }
        this.tokens.appendCode("}");
        fieldIndex++;
      } else if (
        rangeToRemoveIndex < rangesToRemove.length &&
        this.tokens.currentIndex() >= rangesToRemove[rangeToRemoveIndex].start
      ) {
        if (this.tokens.currentIndex() < rangesToRemove[rangeToRemoveIndex].end) {
          this.tokens.removeInitialToken();
        }
        while (this.tokens.currentIndex() < rangesToRemove[rangeToRemoveIndex].end) {
          this.tokens.removeToken();
        }
        rangeToRemoveIndex++;
      } else if (this.tokens.currentIndex() === constructorInsertPos) {
        this.tokens.copyToken();
        if (needsConstructorInit) {
          this.tokens.appendCode(
            `;${this.makeConstructorInitCode(
              constructorInitializerStatements,
              instanceInitializerNames,
              className,
            )};`,
          );
        }
        this.processToken();
      } else {
        this.processToken();
      }
    }
    this.tokens.copyExpectedToken(_types.TokenType.braceR);
  }

  makeConstructorInitCode(
    constructorInitializerStatements,
    instanceInitializerNames,
    className,
  ) {
    return [
      ...constructorInitializerStatements,
      ...instanceInitializerNames.map((name) => `${className}.prototype.${name}.call(this)`),
    ].join(";");
  }

  /**
   * Normally it's ok to simply remove type tokens, but we need to be more careful when dealing with
   * arrow function return types since they can confuse the parser. In that case, we want to move
   * the close-paren to the same line as the arrow.
   *
   * See https://github.com/alangpierce/sucrase/issues/391 for more details.
   */
  processPossibleArrowParamEnd() {
    if (this.tokens.matches2(_types.TokenType.parenR, _types.TokenType.colon) && this.tokens.tokenAtRelativeIndex(1).isType) {
      let nextNonTypeIndex = this.tokens.currentIndex() + 1;
      // Look ahead to see if this is an arrow function or something else.
      while (this.tokens.tokens[nextNonTypeIndex].isType) {
        nextNonTypeIndex++;
      }
      if (this.tokens.matches1AtIndex(nextNonTypeIndex, _types.TokenType.arrow)) {
        this.tokens.removeInitialToken();
        while (this.tokens.currentIndex() < nextNonTypeIndex) {
          this.tokens.removeToken();
        }
        this.tokens.replaceTokenTrimmingLeftWhitespace(") =>");
        return true;
      }
    }
    return false;
  }

  /**
   * An async arrow function might be of the form:
   *
   * async <
   *   T
   * >() => {}
   *
   * in which case, removing the type parameters will cause a syntax error. Detect this case and
   * move the open-paren earlier.
   */
  processPossibleAsyncArrowWithTypeParams() {
    if (
      !this.tokens.matchesContextual(_keywords.ContextualKeyword._async) &&
      !this.tokens.matches1(_types.TokenType._async)
    ) {
      return false;
    }
    const nextToken = this.tokens.tokenAtRelativeIndex(1);
    if (nextToken.type !== _types.TokenType.lessThan || !nextToken.isType) {
      return false;
    }

    let nextNonTypeIndex = this.tokens.currentIndex() + 1;
    // Look ahead to see if this is an arrow function or something else.
    while (this.tokens.tokens[nextNonTypeIndex].isType) {
      nextNonTypeIndex++;
    }
    if (this.tokens.matches1AtIndex(nextNonTypeIndex, _types.TokenType.parenL)) {
      this.tokens.replaceToken("async (");
      this.tokens.removeInitialToken();
      while (this.tokens.currentIndex() < nextNonTypeIndex) {
        this.tokens.removeToken();
      }
      this.tokens.removeToken();
      // We ate a ( token, so we need to process the tokens in between and then the ) token so that
      // we remain balanced.
      this.processBalancedCode();
      this.processToken();
      return true;
    }
    return false;
  }

  processPossibleTypeRange() {
    if (this.tokens.currentToken().isType) {
      this.tokens.removeInitialToken();
      while (this.tokens.currentToken().isType) {
        this.tokens.removeToken();
      }
      return true;
    }
    return false;
  }

  shiftMappings(
    mappings,
    prefixLength,
  ) {
    for (let i = 0; i < mappings.length; i++) {
      const mapping = mappings[i];
      if (mapping !== undefined) {
        mappings[i] = mapping + prefixLength;
      }
    }
    return mappings;
  }
} exports["default"] = RootTransformer;


/***/ }),

/***/ 5702:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); class Transformer {
  // Return true if anything was processed, false otherwise.
  

  getPrefixCode() {
    return "";
  }

  getHoistedCode() {
    return "";
  }

  getSuffixCode() {
    return "";
  }
} exports["default"] = Transformer;


/***/ }),

/***/ 1047:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _types = __webpack_require__(798);

var _isIdentifier = __webpack_require__(1296); var _isIdentifier2 = _interopRequireDefault(_isIdentifier);

var _Transformer = __webpack_require__(5702); var _Transformer2 = _interopRequireDefault(_Transformer);

 class TypeScriptTransformer extends _Transformer2.default {
  constructor(
     rootTransformer,
     tokens,
     isImportsTransformEnabled,
  ) {
    super();this.rootTransformer = rootTransformer;this.tokens = tokens;this.isImportsTransformEnabled = isImportsTransformEnabled;;
  }

  process() {
    if (
      this.rootTransformer.processPossibleArrowParamEnd() ||
      this.rootTransformer.processPossibleAsyncArrowWithTypeParams() ||
      this.rootTransformer.processPossibleTypeRange()
    ) {
      return true;
    }
    if (
      this.tokens.matches1(_types.TokenType._public) ||
      this.tokens.matches1(_types.TokenType._protected) ||
      this.tokens.matches1(_types.TokenType._private) ||
      this.tokens.matches1(_types.TokenType._abstract) ||
      this.tokens.matches1(_types.TokenType._readonly) ||
      this.tokens.matches1(_types.TokenType._override) ||
      this.tokens.matches1(_types.TokenType.nonNullAssertion)
    ) {
      this.tokens.removeInitialToken();
      return true;
    }
    if (this.tokens.matches1(_types.TokenType._enum) || this.tokens.matches2(_types.TokenType._const, _types.TokenType._enum)) {
      this.processEnum();
      return true;
    }
    if (
      this.tokens.matches2(_types.TokenType._export, _types.TokenType._enum) ||
      this.tokens.matches3(_types.TokenType._export, _types.TokenType._const, _types.TokenType._enum)
    ) {
      this.processEnum(true);
      return true;
    }
    return false;
  }

  processEnum(isExport = false) {
    // We might have "export const enum", so just remove all relevant tokens.
    this.tokens.removeInitialToken();
    while (this.tokens.matches1(_types.TokenType._const) || this.tokens.matches1(_types.TokenType._enum)) {
      this.tokens.removeToken();
    }
    const enumName = this.tokens.identifierName();
    this.tokens.removeToken();
    if (isExport && !this.isImportsTransformEnabled) {
      this.tokens.appendCode("export ");
    }
    this.tokens.appendCode(`var ${enumName}; (function (${enumName})`);
    this.tokens.copyExpectedToken(_types.TokenType.braceL);
    this.processEnumBody(enumName);
    this.tokens.copyExpectedToken(_types.TokenType.braceR);
    if (isExport && this.isImportsTransformEnabled) {
      this.tokens.appendCode(`)(${enumName} || (exports.${enumName} = ${enumName} = {}));`);
    } else {
      this.tokens.appendCode(`)(${enumName} || (${enumName} = {}));`);
    }
  }

  /**
   * Transform an enum into equivalent JS. This has complexity in a few places:
   * - TS allows string enums, numeric enums, and a mix of the two styles within an enum.
   * - Enum keys are allowed to be referenced in later enum values.
   * - Enum keys are allowed to be strings.
   * - When enum values are omitted, they should follow an auto-increment behavior.
   */
  processEnumBody(enumName) {
    // Code that can be used to reference the previous enum member, or null if this is the first
    // enum member.
    let previousValueCode = null;
    while (true) {
      if (this.tokens.matches1(_types.TokenType.braceR)) {
        break;
      }
      const {nameStringCode, variableName} = this.extractEnumKeyInfo(this.tokens.currentToken());
      this.tokens.removeInitialToken();

      if (
        this.tokens.matches3(_types.TokenType.eq, _types.TokenType.string, _types.TokenType.comma) ||
        this.tokens.matches3(_types.TokenType.eq, _types.TokenType.string, _types.TokenType.braceR)
      ) {
        this.processStringLiteralEnumMember(enumName, nameStringCode, variableName);
      } else if (this.tokens.matches1(_types.TokenType.eq)) {
        this.processExplicitValueEnumMember(enumName, nameStringCode, variableName);
      } else {
        this.processImplicitValueEnumMember(
          enumName,
          nameStringCode,
          variableName,
          previousValueCode,
        );
      }
      if (this.tokens.matches1(_types.TokenType.comma)) {
        this.tokens.removeToken();
      }

      if (variableName != null) {
        previousValueCode = variableName;
      } else {
        previousValueCode = `${enumName}[${nameStringCode}]`;
      }
    }
  }

  /**
   * Detect name information about this enum key, which will be used to determine which code to emit
   * and whether we should declare a variable as part of this declaration.
   *
   * Some cases to keep in mind:
   * - Enum keys can be implicitly referenced later, e.g. `X = 1, Y = X`. In Sucrase, we implement
   *   this by declaring a variable `X` so that later expressions can use it.
   * - In addition to the usual identifier key syntax, enum keys are allowed to be string literals,
   *   e.g. `"hello world" = 3,`. Template literal syntax is NOT allowed.
   * - Even if the enum key is defined as a string literal, it may still be referenced by identifier
   *   later, e.g. `"X" = 1, Y = X`. That means that we need to detect whether or not a string
   *   literal is identifier-like and emit a variable if so, even if the declaration did not use an
   *   identifier.
   * - Reserved keywords like `break` are valid enum keys, but are not valid to be referenced later
   *   and would be a syntax error if we emitted a variable, so we need to skip the variable
   *   declaration in those cases.
   *
   * The variableName return value captures these nuances: if non-null, we can and must emit a
   * variable declaration, and if null, we can't and shouldn't.
   */
  extractEnumKeyInfo(nameToken) {
    if (nameToken.type === _types.TokenType.name) {
      const name = this.tokens.identifierNameForToken(nameToken);
      return {
        nameStringCode: `"${name}"`,
        variableName: _isIdentifier2.default.call(void 0, name) ? name : null,
      };
    } else if (nameToken.type === _types.TokenType.string) {
      const name = this.tokens.stringValueForToken(nameToken);
      return {
        nameStringCode: this.tokens.code.slice(nameToken.start, nameToken.end),
        variableName: _isIdentifier2.default.call(void 0, name) ? name : null,
      };
    } else {
      throw new Error("Expected name or string at beginning of enum element.");
    }
  }

  /**
   * Handle an enum member where the RHS is just a string literal (not omitted, not a number, and
   * not a complex expression). This is the typical form for TS string enums, and in this case, we
   * do *not* create a reverse mapping.
   *
   * This is called after deleting the key token, when the token processor is at the equals sign.
   *
   * Example 1:
   * someKey = "some value"
   * ->
   * const someKey = "some value"; MyEnum["someKey"] = someKey;
   *
   * Example 2:
   * "some key" = "some value"
   * ->
   * MyEnum["some key"] = "some value";
   */
  processStringLiteralEnumMember(
    enumName,
    nameStringCode,
    variableName,
  ) {
    if (variableName != null) {
      this.tokens.appendCode(`const ${variableName}`);
      // =
      this.tokens.copyToken();
      // value string
      this.tokens.copyToken();
      this.tokens.appendCode(`; ${enumName}[${nameStringCode}] = ${variableName};`);
    } else {
      this.tokens.appendCode(`${enumName}[${nameStringCode}]`);
      // =
      this.tokens.copyToken();
      // value string
      this.tokens.copyToken();
      this.tokens.appendCode(";");
    }
  }

  /**
   * Handle an enum member initialized with an expression on the right-hand side (other than a
   * string literal). In these cases, we should transform the expression and emit code that sets up
   * a reverse mapping.
   *
   * The TypeScript implementation of this operation distinguishes between expressions that can be
   * "constant folded" at compile time (i.e. consist of number literals and simple math operations
   * on those numbers) and ones that are dynamic. For constant expressions, it emits the resolved
   * numeric value, and auto-incrementing is only allowed in that case. Evaluating expressions at
   * compile time would add significant complexity to Sucrase, so Sucrase instead leaves the
   * expression as-is, and will later emit something like `MyEnum["previousKey"] + 1` to implement
   * auto-incrementing.
   *
   * This is called after deleting the key token, when the token processor is at the equals sign.
   *
   * Example 1:
   * someKey = 1 + 1
   * ->
   * const someKey = 1 + 1; MyEnum[MyEnum["someKey"] = someKey] = "someKey";
   *
   * Example 2:
   * "some key" = 1 + 1
   * ->
   * MyEnum[MyEnum["some key"] = 1 + 1] = "some key";
   */
  processExplicitValueEnumMember(
    enumName,
    nameStringCode,
    variableName,
  ) {
    const rhsEndIndex = this.tokens.currentToken().rhsEndIndex;
    if (rhsEndIndex == null) {
      throw new Error("Expected rhsEndIndex on enum assign.");
    }

    if (variableName != null) {
      this.tokens.appendCode(`const ${variableName}`);
      this.tokens.copyToken();
      while (this.tokens.currentIndex() < rhsEndIndex) {
        this.rootTransformer.processToken();
      }
      this.tokens.appendCode(
        `; ${enumName}[${enumName}[${nameStringCode}] = ${variableName}] = ${nameStringCode};`,
      );
    } else {
      this.tokens.appendCode(`${enumName}[${enumName}[${nameStringCode}]`);
      this.tokens.copyToken();
      while (this.tokens.currentIndex() < rhsEndIndex) {
        this.rootTransformer.processToken();
      }
      this.tokens.appendCode(`] = ${nameStringCode};`);
    }
  }

  /**
   * Handle an enum member with no right-hand side expression. In this case, the value is the
   * previous value plus 1, or 0 if there was no previous value. We should also always emit a
   * reverse mapping.
   *
   * Example 1:
   * someKey2
   * ->
   * const someKey2 = someKey1 + 1; MyEnum[MyEnum["someKey2"] = someKey2] = "someKey2";
   *
   * Example 2:
   * "some key 2"
   * ->
   * MyEnum[MyEnum["some key 2"] = someKey1 + 1] = "some key 2";
   */
  processImplicitValueEnumMember(
    enumName,
    nameStringCode,
    variableName,
    previousValueCode,
  ) {
    let valueCode = previousValueCode != null ? `${previousValueCode} + 1` : "0";
    if (variableName != null) {
      this.tokens.appendCode(`const ${variableName} = ${valueCode}; `);
      valueCode = variableName;
    }
    this.tokens.appendCode(
      `${enumName}[${enumName}[${nameStringCode}] = ${valueCode}] = ${nameStringCode};`,
    );
  }
} exports["default"] = TypeScriptTransformer;


/***/ }),

/***/ 4643:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _types = __webpack_require__(798);


 function elideImportEquals(tokens) {
  // import
  tokens.removeInitialToken();
  // name
  tokens.removeToken();
  // =
  tokens.removeToken();
  // name or require
  tokens.removeToken();
  // Handle either `import A = require('A')` or `import A = B.C.D`.
  if (tokens.matches1(_types.TokenType.parenL)) {
    // (
    tokens.removeToken();
    // path string
    tokens.removeToken();
    // )
    tokens.removeToken();
  } else {
    while (tokens.matches1(_types.TokenType.dot)) {
      // .
      tokens.removeToken();
      // name
      tokens.removeToken();
    }
  }
} exports["default"] = elideImportEquals;


/***/ }),

/***/ 1126:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _linesandcolumns = __webpack_require__(2101); var _linesandcolumns2 = _interopRequireDefault(_linesandcolumns);


var _types = __webpack_require__(798);

 function formatTokens(code, tokens) {
  if (tokens.length === 0) {
    return "";
  }

  const tokenKeys = Object.keys(tokens[0]).filter(
    (k) => k !== "type" && k !== "value" && k !== "start" && k !== "end" && k !== "loc",
  );
  const typeKeys = Object.keys(tokens[0].type).filter((k) => k !== "label" && k !== "keyword");

  const headings = ["Location", "Label", "Raw", ...tokenKeys, ...typeKeys];

  const lines = new (0, _linesandcolumns2.default)(code);
  const rows = [headings, ...tokens.map(getTokenComponents)];
  const padding = headings.map(() => 0);
  for (const components of rows) {
    for (let i = 0; i < components.length; i++) {
      padding[i] = Math.max(padding[i], components[i].length);
    }
  }
  return rows
    .map((components) => components.map((component, i) => component.padEnd(padding[i])).join(" "))
    .join("\n");

  function getTokenComponents(token) {
    const raw = code.slice(token.start, token.end);
    return [
      formatRange(token.start, token.end),
      _types.formatTokenType.call(void 0, token.type),
      truncate(String(raw), 14),
      // @ts-ignore: Intentional dynamic access by key.
      ...tokenKeys.map((key) => formatValue(token[key], key)),
      // @ts-ignore: Intentional dynamic access by key.
      ...typeKeys.map((key) => formatValue(token.type[key], key)),
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function formatValue(value, key) {
    if (value === true) {
      return key;
    } else if (value === false || value === null) {
      return "";
    } else {
      return String(value);
    }
  }

  function formatRange(start, end) {
    return `${formatPos(start)}-${formatPos(end)}`;
  }

  function formatPos(pos) {
    const location = lines.locationForIndex(pos);
    if (!location) {
      return "Unknown";
    } else {
      return `${location.line + 1}:${location.column + 1}`;
    }
  }
} exports["default"] = formatTokens;

function truncate(s, length) {
  if (s.length > length) {
    return `${s.slice(0, length - 3)}...`;
  } else {
    return s;
  }
}


/***/ }),

/***/ 3546:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));

var _keywords = __webpack_require__(3464);
var _types = __webpack_require__(798);







































/**
 * Get information about the class fields for this class, given a token processor pointing to the
 * open-brace at the start of the class.
 */
 function getClassInfo(
  rootTransformer,
  tokens,
  nameManager,
  disableESTransforms,
) {
  const snapshot = tokens.snapshot();

  const headerInfo = processClassHeader(tokens);

  let constructorInitializerStatements = [];
  const instanceInitializerNames = [];
  const staticInitializerNames = [];
  let constructorInsertPos = null;
  const fields = [];
  const rangesToRemove = [];

  const classContextId = tokens.currentToken().contextId;
  if (classContextId == null) {
    throw new Error("Expected non-null class context ID on class open-brace.");
  }

  tokens.nextToken();
  while (!tokens.matchesContextIdAndLabel(_types.TokenType.braceR, classContextId)) {
    if (tokens.matchesContextual(_keywords.ContextualKeyword._constructor) && !tokens.currentToken().isType) {
      ({constructorInitializerStatements, constructorInsertPos} = processConstructor(tokens));
    } else if (tokens.matches1(_types.TokenType.semi)) {
      if (!disableESTransforms) {
        rangesToRemove.push({start: tokens.currentIndex(), end: tokens.currentIndex() + 1});
      }
      tokens.nextToken();
    } else if (tokens.currentToken().isType) {
      tokens.nextToken();
    } else {
      // Either a method or a field. Skip to the identifier part.
      const statementStartIndex = tokens.currentIndex();
      let isStatic = false;
      let isESPrivate = false;
      let isDeclareOrAbstract = false;
      while (isAccessModifier(tokens.currentToken())) {
        if (tokens.matches1(_types.TokenType._static)) {
          isStatic = true;
        }
        if (tokens.matches1(_types.TokenType.hash)) {
          isESPrivate = true;
        }
        if (tokens.matches1(_types.TokenType._declare) || tokens.matches1(_types.TokenType._abstract)) {
          isDeclareOrAbstract = true;
        }
        tokens.nextToken();
      }
      if (isStatic && tokens.matches1(_types.TokenType.braceL)) {
        // This is a static block, so don't process it in any special way.
        skipToNextClassElement(tokens, classContextId);
        continue;
      }
      if (isESPrivate) {
        // Sucrase doesn't attempt to transpile private fields; just leave them as-is.
        skipToNextClassElement(tokens, classContextId);
        continue;
      }
      if (
        tokens.matchesContextual(_keywords.ContextualKeyword._constructor) &&
        !tokens.currentToken().isType
      ) {
        ({constructorInitializerStatements, constructorInsertPos} = processConstructor(tokens));
        continue;
      }

      const nameStartIndex = tokens.currentIndex();
      skipFieldName(tokens);
      if (tokens.matches1(_types.TokenType.lessThan) || tokens.matches1(_types.TokenType.parenL)) {
        // This is a method, so nothing to process.
        skipToNextClassElement(tokens, classContextId);
        continue;
      }
      // There might be a type annotation that we need to skip.
      while (tokens.currentToken().isType) {
        tokens.nextToken();
      }
      if (tokens.matches1(_types.TokenType.eq)) {
        const equalsIndex = tokens.currentIndex();
        // This is an initializer, so we need to wrap in an initializer method.
        const valueEnd = tokens.currentToken().rhsEndIndex;
        if (valueEnd == null) {
          throw new Error("Expected rhsEndIndex on class field assignment.");
        }
        tokens.nextToken();
        while (tokens.currentIndex() < valueEnd) {
          rootTransformer.processToken();
        }
        let initializerName;
        if (isStatic) {
          initializerName = nameManager.claimFreeName("__initStatic");
          staticInitializerNames.push(initializerName);
        } else {
          initializerName = nameManager.claimFreeName("__init");
          instanceInitializerNames.push(initializerName);
        }
        // Fields start at the name, so `static x = 1;` has a field range of `x = 1;`.
        fields.push({
          initializerName,
          equalsIndex,
          start: nameStartIndex,
          end: tokens.currentIndex(),
        });
      } else if (!disableESTransforms || isDeclareOrAbstract) {
        // This is a regular field declaration, like `x;`. With the class transform enabled, we just
        // remove the line so that no output is produced. With the class transform disabled, we
        // usually want to preserve the declaration (but still strip types), but if the `declare`
        // or `abstract` keyword is specified, we should remove the line to avoid initializing the
        // value to undefined.
        rangesToRemove.push({start: statementStartIndex, end: tokens.currentIndex()});
      }
    }
  }

  tokens.restoreToSnapshot(snapshot);
  if (disableESTransforms) {
    // With ES transforms disabled, we don't want to transform regular class
    // field declarations, and we don't need to do any additional tricks to
    // reference the constructor for static init, but we still need to transform
    // TypeScript field initializers defined as constructor parameters and we
    // still need to remove `declare` fields. For now, we run the same code
    // path but omit any field information, as if the class had no field
    // declarations. In the future, when we fully drop the class fields
    // transform, we can simplify this code significantly.
    return {
      headerInfo,
      constructorInitializerStatements,
      instanceInitializerNames: [],
      staticInitializerNames: [],
      constructorInsertPos,
      fields: [],
      rangesToRemove,
    };
  } else {
    return {
      headerInfo,
      constructorInitializerStatements,
      instanceInitializerNames,
      staticInitializerNames,
      constructorInsertPos,
      fields,
      rangesToRemove,
    };
  }
} exports["default"] = getClassInfo;

/**
 * Move the token processor to the next method/field in the class.
 *
 * To do that, we seek forward to the next start of a class name (either an open
 * bracket or an identifier, or the closing curly brace), then seek backward to
 * include any access modifiers.
 */
function skipToNextClassElement(tokens, classContextId) {
  tokens.nextToken();
  while (tokens.currentToken().contextId !== classContextId) {
    tokens.nextToken();
  }
  while (isAccessModifier(tokens.tokenAtRelativeIndex(-1))) {
    tokens.previousToken();
  }
}

function processClassHeader(tokens) {
  const classToken = tokens.currentToken();
  const contextId = classToken.contextId;
  if (contextId == null) {
    throw new Error("Expected context ID on class token.");
  }
  const isExpression = classToken.isExpression;
  if (isExpression == null) {
    throw new Error("Expected isExpression on class token.");
  }
  let className = null;
  let hasSuperclass = false;
  tokens.nextToken();
  if (tokens.matches1(_types.TokenType.name)) {
    className = tokens.identifierName();
  }
  while (!tokens.matchesContextIdAndLabel(_types.TokenType.braceL, contextId)) {
    // If this has a superclass, there will always be an `extends` token. If it doesn't have a
    // superclass, only type parameters and `implements` clauses can show up here, all of which
    // consist only of type tokens. A declaration like `class A<B extends C> {` should *not* count
    // as having a superclass.
    if (tokens.matches1(_types.TokenType._extends) && !tokens.currentToken().isType) {
      hasSuperclass = true;
    }
    tokens.nextToken();
  }
  return {isExpression, className, hasSuperclass};
}

/**
 * Extract useful information out of a constructor, starting at the "constructor" name.
 */
function processConstructor(tokens)


 {
  const constructorInitializerStatements = [];

  tokens.nextToken();
  const constructorContextId = tokens.currentToken().contextId;
  if (constructorContextId == null) {
    throw new Error("Expected context ID on open-paren starting constructor params.");
  }
  // Advance through parameters looking for access modifiers.
  while (!tokens.matchesContextIdAndLabel(_types.TokenType.parenR, constructorContextId)) {
    if (tokens.currentToken().contextId === constructorContextId) {
      // Current token is an open paren or comma just before a param, so check
      // that param for access modifiers.
      tokens.nextToken();
      if (isAccessModifier(tokens.currentToken())) {
        tokens.nextToken();
        while (isAccessModifier(tokens.currentToken())) {
          tokens.nextToken();
        }
        const token = tokens.currentToken();
        if (token.type !== _types.TokenType.name) {
          throw new Error("Expected identifier after access modifiers in constructor arg.");
        }
        const name = tokens.identifierNameForToken(token);
        constructorInitializerStatements.push(`this.${name} = ${name}`);
      }
    } else {
      tokens.nextToken();
    }
  }
  // )
  tokens.nextToken();
  let constructorInsertPos = tokens.currentIndex();

  // Advance through body looking for a super call.
  let foundSuperCall = false;
  while (!tokens.matchesContextIdAndLabel(_types.TokenType.braceR, constructorContextId)) {
    if (!foundSuperCall && tokens.matches2(_types.TokenType._super, _types.TokenType.parenL)) {
      tokens.nextToken();
      const superCallContextId = tokens.currentToken().contextId;
      if (superCallContextId == null) {
        throw new Error("Expected a context ID on the super call");
      }
      while (!tokens.matchesContextIdAndLabel(_types.TokenType.parenR, superCallContextId)) {
        tokens.nextToken();
      }
      constructorInsertPos = tokens.currentIndex();
      foundSuperCall = true;
    }
    tokens.nextToken();
  }
  // }
  tokens.nextToken();

  return {constructorInitializerStatements, constructorInsertPos};
}

/**
 * Determine if this is any token that can go before the name in a method/field.
 */
function isAccessModifier(token) {
  return [
    _types.TokenType._async,
    _types.TokenType._get,
    _types.TokenType._set,
    _types.TokenType.plus,
    _types.TokenType.minus,
    _types.TokenType._readonly,
    _types.TokenType._static,
    _types.TokenType._public,
    _types.TokenType._private,
    _types.TokenType._protected,
    _types.TokenType._override,
    _types.TokenType._abstract,
    _types.TokenType.star,
    _types.TokenType._declare,
    _types.TokenType.hash,
  ].includes(token.type);
}

/**
 * The next token or set of tokens is either an identifier or an expression in square brackets, for
 * a method or field name.
 */
function skipFieldName(tokens) {
  if (tokens.matches1(_types.TokenType.bracketL)) {
    const startToken = tokens.currentToken();
    const classContextId = startToken.contextId;
    if (classContextId == null) {
      throw new Error("Expected class context ID on computed name open bracket.");
    }
    while (!tokens.matchesContextIdAndLabel(_types.TokenType.bracketR, classContextId)) {
      tokens.nextToken();
    }
    tokens.nextToken();
  } else {
    tokens.nextToken();
  }
}


/***/ }),

/***/ 3461:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _tokenizer = __webpack_require__(2297);
var _types = __webpack_require__(798);







 const EMPTY_DECLARATION_INFO = {
  typeDeclarations: new Set(),
  valueDeclarations: new Set(),
}; exports.EMPTY_DECLARATION_INFO = EMPTY_DECLARATION_INFO;

/**
 * Get all top-level identifiers that should be preserved when exported in TypeScript.
 *
 * Examples:
 * - If an identifier is declared as `const x`, then `export {x}` should be preserved.
 * - If it's declared as `type x`, then `export {x}` should be removed.
 * - If it's declared as both `const x` and `type x`, then the export should be preserved.
 * - Classes and enums should be preserved (even though they also introduce types).
 * - Imported identifiers should be preserved since we don't have enough information to
 *   rule them out. --isolatedModules disallows re-exports, which catches errors here.
 */
 function getDeclarationInfo(tokens) {
  const typeDeclarations = new Set();
  const valueDeclarations = new Set();
  for (let i = 0; i < tokens.tokens.length; i++) {
    const token = tokens.tokens[i];
    if (token.type === _types.TokenType.name && _tokenizer.isTopLevelDeclaration.call(void 0, token)) {
      if (token.isType) {
        typeDeclarations.add(tokens.identifierNameForToken(token));
      } else {
        valueDeclarations.add(tokens.identifierNameForToken(token));
      }
    }
  }
  return {typeDeclarations, valueDeclarations};
} exports["default"] = getDeclarationInfo;


/***/ }),

/***/ 4307:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));
var _types = __webpack_require__(798);

/**
 * Get all identifier names in the code, in order, including duplicates.
 */
 function getIdentifierNames(code, tokens) {
  const names = [];
  for (const token of tokens) {
    if (token.type === _types.TokenType.name) {
      names.push(code.slice(token.start, token.end));
    }
  }
  return names;
} exports["default"] = getIdentifierNames;


/***/ }),

/***/ 8052:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _types = __webpack_require__(798);
















/**
 * Determine information about this named import or named export specifier.
 *
 * This syntax is the `a` from statements like these:
 * import {A} from "./foo";
 * export {A};
 * export {A} from "./foo";
 *
 * As it turns out, we can exactly characterize the syntax meaning by simply
 * counting the number of tokens, which can be from 1 to 4:
 * {A}
 * {type A}
 * {A as B}
 * {type A as B}
 *
 * In the type case, we never actually need the names in practice, so don't get
 * them.
 *
 * TODO: There's some redundancy with the type detection here and the isType
 * flag that's already present on tokens in TS mode. This function could
 * potentially be simplified and/or pushed to the call sites to avoid the object
 * allocation.
 */
 function getImportExportSpecifierInfo(
  tokens,
  index = tokens.currentIndex(),
) {
  let endIndex = index + 1;
  if (isSpecifierEnd(tokens, endIndex)) {
    // import {A}
    const name = tokens.identifierNameAtIndex(index);
    return {
      isType: false,
      leftName: name,
      rightName: name,
      endIndex,
    };
  }
  endIndex++;
  if (isSpecifierEnd(tokens, endIndex)) {
    // import {type A}
    return {
      isType: true,
      leftName: null,
      rightName: null,
      endIndex,
    };
  }
  endIndex++;
  if (isSpecifierEnd(tokens, endIndex)) {
    // import {A as B}
    return {
      isType: false,
      leftName: tokens.identifierNameAtIndex(index),
      rightName: tokens.identifierNameAtIndex(index + 2),
      endIndex,
    };
  }
  endIndex++;
  if (isSpecifierEnd(tokens, endIndex)) {
    // import {type A as B}
    return {
      isType: true,
      leftName: null,
      rightName: null,
      endIndex,
    };
  }
  throw new Error(`Unexpected import/export specifier at ${index}`);
} exports["default"] = getImportExportSpecifierInfo;

function isSpecifierEnd(tokens, index) {
  const token = tokens.tokens[index];
  return token.type === _types.TokenType.braceR || token.type === _types.TokenType.comma;
}


/***/ }),

/***/ 3654:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));








 function getJSXPragmaInfo(options) {
  const [base, suffix] = splitPragma(options.jsxPragma || "React.createElement");
  const [fragmentBase, fragmentSuffix] = splitPragma(options.jsxFragmentPragma || "React.Fragment");
  return {base, suffix, fragmentBase, fragmentSuffix};
} exports["default"] = getJSXPragmaInfo;

function splitPragma(pragma) {
  let dotIndex = pragma.indexOf(".");
  if (dotIndex === -1) {
    dotIndex = pragma.length;
  }
  return [pragma.slice(0, dotIndex), pragma.slice(dotIndex)];
}


/***/ }),

/***/ 1281:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _tokenizer = __webpack_require__(2297);
var _types = __webpack_require__(798);

var _JSXTransformer = __webpack_require__(5526);
var _getJSXPragmaInfo = __webpack_require__(3654); var _getJSXPragmaInfo2 = _interopRequireDefault(_getJSXPragmaInfo);

 function getNonTypeIdentifiers(tokens, options) {
  const jsxPragmaInfo = _getJSXPragmaInfo2.default.call(void 0, options);
  const nonTypeIdentifiers = new Set();
  for (let i = 0; i < tokens.tokens.length; i++) {
    const token = tokens.tokens[i];
    if (
      token.type === _types.TokenType.name &&
      !token.isType &&
      (token.identifierRole === _tokenizer.IdentifierRole.Access ||
        token.identifierRole === _tokenizer.IdentifierRole.ObjectShorthand ||
        token.identifierRole === _tokenizer.IdentifierRole.ExportAccess) &&
      !token.shadowsGlobal
    ) {
      nonTypeIdentifiers.add(tokens.identifierNameForToken(token));
    }
    if (token.type === _types.TokenType.jsxTagStart) {
      nonTypeIdentifiers.add(jsxPragmaInfo.base);
    }
    if (
      token.type === _types.TokenType.jsxTagStart &&
      i + 1 < tokens.tokens.length &&
      tokens.tokens[i + 1].type === _types.TokenType.jsxTagEnd
    ) {
      nonTypeIdentifiers.add(jsxPragmaInfo.base);
      nonTypeIdentifiers.add(jsxPragmaInfo.fragmentBase);
    }
    if (token.type === _types.TokenType.jsxName && token.identifierRole === _tokenizer.IdentifierRole.Access) {
      const identifierName = tokens.identifierNameForToken(token);
      // Lower-case single-component tag names like "div" don't count.
      if (!_JSXTransformer.startsWithLowerCase.call(void 0, identifierName) || tokens.tokens[i + 1].type === _types.TokenType.dot) {
        nonTypeIdentifiers.add(tokens.identifierNameForToken(token));
      }
    }
  }
  return nonTypeIdentifiers;
} exports.getNonTypeIdentifiers = getNonTypeIdentifiers;


/***/ }),

/***/ 6265:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true})); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _types = __webpack_require__(798);

var _getImportExportSpecifierInfo = __webpack_require__(8052); var _getImportExportSpecifierInfo2 = _interopRequireDefault(_getImportExportSpecifierInfo);

/**
 * Special case code to scan for imported names in ESM TypeScript. We need to do this so we can
 * properly get globals so we can compute shadowed globals.
 *
 * This is similar to logic in CJSImportProcessor, but trimmed down to avoid logic with CJS
 * replacement and flow type imports.
 */
 function getTSImportedNames(tokens) {
  const importedNames = new Set();
  for (let i = 0; i < tokens.tokens.length; i++) {
    if (
      tokens.matches1AtIndex(i, _types.TokenType._import) &&
      !tokens.matches3AtIndex(i, _types.TokenType._import, _types.TokenType.name, _types.TokenType.eq)
    ) {
      collectNamesForImport(tokens, i, importedNames);
    }
  }
  return importedNames;
} exports["default"] = getTSImportedNames;

function collectNamesForImport(
  tokens,
  index,
  importedNames,
) {
  index++;

  if (tokens.matches1AtIndex(index, _types.TokenType.parenL)) {
    // Dynamic import, so nothing to do
    return;
  }

  if (tokens.matches1AtIndex(index, _types.TokenType.name)) {
    importedNames.add(tokens.identifierNameAtIndex(index));
    index++;
    if (tokens.matches1AtIndex(index, _types.TokenType.comma)) {
      index++;
    }
  }

  if (tokens.matches1AtIndex(index, _types.TokenType.star)) {
    // * as
    index += 2;
    importedNames.add(tokens.identifierNameAtIndex(index));
    index++;
  }

  if (tokens.matches1AtIndex(index, _types.TokenType.braceL)) {
    index++;
    collectNamesForNamedImport(tokens, index, importedNames);
  }
}

function collectNamesForNamedImport(
  tokens,
  index,
  importedNames,
) {
  while (true) {
    if (tokens.matches1AtIndex(index, _types.TokenType.braceR)) {
      return;
    }

    const specifierInfo = _getImportExportSpecifierInfo2.default.call(void 0, tokens, index);
    index = specifierInfo.endIndex;
    if (!specifierInfo.isType) {
      importedNames.add(specifierInfo.rightName);
    }

    if (tokens.matches2AtIndex(index, _types.TokenType.comma, _types.TokenType.braceR)) {
      return;
    } else if (tokens.matches1AtIndex(index, _types.TokenType.braceR)) {
      return;
    } else if (tokens.matches1AtIndex(index, _types.TokenType.comma)) {
      index++;
    } else {
      throw new Error(`Unexpected token: ${JSON.stringify(tokens.tokens[index])}`);
    }
  }
}


/***/ }),

/***/ 874:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _keywords = __webpack_require__(3464);


/**
 * Determine whether this optional chain or nullish coalescing operation has any await statements in
 * it. If so, we'll need to transpile to an async operation.
 *
 * We compute this by walking the length of the operation and returning true if we see an await
 * keyword used as a real await (rather than an object key or property access). Nested optional
 * chain/nullish operations need to be tracked but don't silence await, but a nested async function
 * (or any other nested scope) will make the await not count.
 */
 function isAsyncOperation(tokens) {
  let index = tokens.currentIndex();
  let depth = 0;
  const startToken = tokens.currentToken();
  do {
    const token = tokens.tokens[index];
    if (token.isOptionalChainStart) {
      depth++;
    }
    if (token.isOptionalChainEnd) {
      depth--;
    }
    depth += token.numNullishCoalesceStarts;
    depth -= token.numNullishCoalesceEnds;

    if (
      token.contextualKeyword === _keywords.ContextualKeyword._await &&
      token.identifierRole == null &&
      token.scopeDepth === startToken.scopeDepth
    ) {
      return true;
    }
    index += 1;
  } while (depth > 0 && index < tokens.tokens.length);
  return false;
} exports["default"] = isAsyncOperation;


/***/ }),

/***/ 1296:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _identifier = __webpack_require__(905);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar
// Hard-code a list of reserved words rather than trying to use keywords or contextual keywords
// from the parser, since currently there are various exceptions, like `package` being reserved
// but unused and various contextual keywords being reserved. Note that we assume that all code
// compiled by Sucrase is in a module, so strict mode words and await are all considered reserved
// here.
const RESERVED_WORDS = new Set([
  // Reserved keywords as of ECMAScript 2015
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  // Future reserved keywords
  "enum",
  "implements",
  "interface",
  "let",
  "package",
  "private",
  "protected",
  "public",
  "static",
  "await",
  // Literals that cannot be used as identifiers
  "false",
  "null",
  "true",
]);

/**
 * Determine if the given name is a legal variable name.
 *
 * This is needed when transforming TypeScript enums; if an enum key is a valid
 * variable name, it might be referenced later in the enum, so we need to
 * declare a variable.
 */
 function isIdentifier(name) {
  if (name.length === 0) {
    return false;
  }
  if (!_identifier.IS_IDENTIFIER_START[name.charCodeAt(0)]) {
    return false;
  }
  for (let i = 1; i < name.length; i++) {
    if (!_identifier.IS_IDENTIFIER_CHAR[name.charCodeAt(i)]) {
      return false;
    }
  }
  return !RESERVED_WORDS.has(name);
} exports["default"] = isIdentifier;


/***/ }),

/***/ 8147:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _keywords = __webpack_require__(3464);
var _types = __webpack_require__(798);


/**
 * Starting at a potential `assert` token remove the import assertion if there
 * is one.
 */
 function removeMaybeImportAssertion(tokens) {
  if (tokens.matches2(_types.TokenType.name, _types.TokenType.braceL) && tokens.matchesContextual(_keywords.ContextualKeyword._assert)) {
    // assert
    tokens.removeToken();
    // {
    tokens.removeToken();
    tokens.removeBalancedCode();
    // }
    tokens.removeToken();
  }
} exports.removeMaybeImportAssertion = removeMaybeImportAssertion;


/***/ }),

/***/ 3434:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value: true}));var _types = __webpack_require__(798);



/**
 * Common method sharing code between CJS and ESM cases, since they're the same here.
 */
 function shouldElideDefaultExport(
  isTypeScriptTransformEnabled,
  tokens,
  declarationInfo,
) {
  if (!isTypeScriptTransformEnabled) {
    return false;
  }
  const exportToken = tokens.currentToken();
  if (exportToken.rhsEndIndex == null) {
    throw new Error("Expected non-null rhsEndIndex on export token.");
  }
  // The export must be of the form `export default a` or `export default a;`.
  const numTokens = exportToken.rhsEndIndex - tokens.currentIndex();
  if (
    numTokens !== 3 &&
    !(numTokens === 4 && tokens.matches1AtIndex(exportToken.rhsEndIndex - 1, _types.TokenType.semi))
  ) {
    return false;
  }
  const identifierToken = tokens.tokenAtRelativeIndex(2);
  if (identifierToken.type !== _types.TokenType.name) {
    return false;
  }
  const exportedName = tokens.identifierNameForToken(identifierToken);
  return (
    declarationInfo.typeDeclarations.has(exportedName) &&
    !declarationInfo.valueDeclarations.has(exportedName)
  );
} exports["default"] = shouldElideDefaultExport;


/***/ }),

/***/ 3281:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Checker = exports.createCheckers = void 0;
var types_1 = __webpack_require__(2784);
var util_1 = __webpack_require__(5518);
/**
 * Export functions used to define interfaces.
 */
var types_2 = __webpack_require__(2784);
Object.defineProperty(exports, "TArray", ({ enumerable: true, get: function () { return types_2.TArray; } }));
Object.defineProperty(exports, "TEnumType", ({ enumerable: true, get: function () { return types_2.TEnumType; } }));
Object.defineProperty(exports, "TEnumLiteral", ({ enumerable: true, get: function () { return types_2.TEnumLiteral; } }));
Object.defineProperty(exports, "TFunc", ({ enumerable: true, get: function () { return types_2.TFunc; } }));
Object.defineProperty(exports, "TIface", ({ enumerable: true, get: function () { return types_2.TIface; } }));
Object.defineProperty(exports, "TLiteral", ({ enumerable: true, get: function () { return types_2.TLiteral; } }));
Object.defineProperty(exports, "TName", ({ enumerable: true, get: function () { return types_2.TName; } }));
Object.defineProperty(exports, "TOptional", ({ enumerable: true, get: function () { return types_2.TOptional; } }));
Object.defineProperty(exports, "TParam", ({ enumerable: true, get: function () { return types_2.TParam; } }));
Object.defineProperty(exports, "TParamList", ({ enumerable: true, get: function () { return types_2.TParamList; } }));
Object.defineProperty(exports, "TProp", ({ enumerable: true, get: function () { return types_2.TProp; } }));
Object.defineProperty(exports, "TTuple", ({ enumerable: true, get: function () { return types_2.TTuple; } }));
Object.defineProperty(exports, "TType", ({ enumerable: true, get: function () { return types_2.TType; } }));
Object.defineProperty(exports, "TUnion", ({ enumerable: true, get: function () { return types_2.TUnion; } }));
Object.defineProperty(exports, "TIntersection", ({ enumerable: true, get: function () { return types_2.TIntersection; } }));
Object.defineProperty(exports, "array", ({ enumerable: true, get: function () { return types_2.array; } }));
Object.defineProperty(exports, "enumlit", ({ enumerable: true, get: function () { return types_2.enumlit; } }));
Object.defineProperty(exports, "enumtype", ({ enumerable: true, get: function () { return types_2.enumtype; } }));
Object.defineProperty(exports, "func", ({ enumerable: true, get: function () { return types_2.func; } }));
Object.defineProperty(exports, "iface", ({ enumerable: true, get: function () { return types_2.iface; } }));
Object.defineProperty(exports, "lit", ({ enumerable: true, get: function () { return types_2.lit; } }));
Object.defineProperty(exports, "name", ({ enumerable: true, get: function () { return types_2.name; } }));
Object.defineProperty(exports, "opt", ({ enumerable: true, get: function () { return types_2.opt; } }));
Object.defineProperty(exports, "param", ({ enumerable: true, get: function () { return types_2.param; } }));
Object.defineProperty(exports, "tuple", ({ enumerable: true, get: function () { return types_2.tuple; } }));
Object.defineProperty(exports, "union", ({ enumerable: true, get: function () { return types_2.union; } }));
Object.defineProperty(exports, "intersection", ({ enumerable: true, get: function () { return types_2.intersection; } }));
Object.defineProperty(exports, "BasicType", ({ enumerable: true, get: function () { return types_2.BasicType; } }));
var util_2 = __webpack_require__(5518);
Object.defineProperty(exports, "VError", ({ enumerable: true, get: function () { return util_2.VError; } }));
/**
 * Takes one of more type suites (e.g. a module generated by `ts-interface-builder`), and combines
 * them into a suite of interface checkers. If a type is used by name, that name should be present
 * among the passed-in type suites.
 *
 * The returned object maps type names to Checker objects.
 */
function createCheckers() {
    var typeSuite = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        typeSuite[_i] = arguments[_i];
    }
    var fullSuite = Object.assign.apply(Object, __spreadArrays([{}, types_1.basicTypes], typeSuite));
    var checkers = {};
    for (var _a = 0, typeSuite_1 = typeSuite; _a < typeSuite_1.length; _a++) {
        var suite_1 = typeSuite_1[_a];
        for (var _b = 0, _c = Object.keys(suite_1); _b < _c.length; _b++) {
            var name = _c[_b];
            checkers[name] = new Checker(fullSuite, suite_1[name]);
        }
    }
    return checkers;
}
exports.createCheckers = createCheckers;
/**
 * Checker implements validation of objects, and also includes accessors to validate method calls.
 * Checkers should be created using `createCheckers()`.
 */
var Checker = /** @class */ (function () {
    // Create checkers by using `createCheckers()` function.
    function Checker(suite, ttype, _path) {
        if (_path === void 0) { _path = 'value'; }
        this.suite = suite;
        this.ttype = ttype;
        this._path = _path;
        this.props = new Map();
        if (ttype instanceof types_1.TIface) {
            for (var _i = 0, _a = ttype.props; _i < _a.length; _i++) {
                var p = _a[_i];
                this.props.set(p.name, p.ttype);
            }
        }
        this.checkerPlain = this.ttype.getChecker(suite, false);
        this.checkerStrict = this.ttype.getChecker(suite, true);
    }
    /**
     * Set the path to report in errors, instead of the default "value". (E.g. if the Checker is for
     * a "person" interface, set path to "person" to report e.g. "person.name is not a string".)
     */
    Checker.prototype.setReportedPath = function (path) {
        this._path = path;
    };
    /**
     * Check that the given value satisfies this checker's type, or throw Error.
     */
    Checker.prototype.check = function (value) { return this._doCheck(this.checkerPlain, value); };
    /**
     * A fast check for whether or not the given value satisfies this Checker's type. This returns
     * true or false, does not produce an error message, and is fast both on success and on failure.
     */
    Checker.prototype.test = function (value) {
        return this.checkerPlain(value, new util_1.NoopContext());
    };
    /**
     * Returns an error object describing the errors if the given value does not satisfy this
     * Checker's type, or null if it does.
     */
    Checker.prototype.validate = function (value) {
        return this._doValidate(this.checkerPlain, value);
    };
    /**
     * Check that the given value satisfies this checker's type strictly. This checks that objects
     * and tuples have no extra members. Note that this prevents backward compatibility, so usually
     * a plain check() is more appropriate.
     */
    Checker.prototype.strictCheck = function (value) { return this._doCheck(this.checkerStrict, value); };
    /**
     * A fast strict check for whether or not the given value satisfies this Checker's type. Returns
     * true or false, does not produce an error message, and is fast both on success and on failure.
     */
    Checker.prototype.strictTest = function (value) {
        return this.checkerStrict(value, new util_1.NoopContext());
    };
    /**
     * Returns an error object describing the errors if the given value does not satisfy this
     * Checker's type strictly, or null if it does.
     */
    Checker.prototype.strictValidate = function (value) {
        return this._doValidate(this.checkerStrict, value);
    };
    /**
     * If this checker is for an interface, returns a Checker for the type required for the given
     * property of this interface.
     */
    Checker.prototype.getProp = function (prop) {
        var ttype = this.props.get(prop);
        if (!ttype) {
            throw new Error("Type has no property " + prop);
        }
        return new Checker(this.suite, ttype, this._path + "." + prop);
    };
    /**
     * If this checker is for an interface, returns a Checker for the argument-list required to call
     * the given method of this interface. E.g. if this Checker is for the interface:
     *    interface Foo {
     *      find(s: string, pos?: number): number;
     *    }
     * Then methodArgs("find").check(...) will succeed for ["foo"] and ["foo", 3], but not for [17].
     */
    Checker.prototype.methodArgs = function (methodName) {
        var tfunc = this._getMethod(methodName);
        return new Checker(this.suite, tfunc.paramList);
    };
    /**
     * If this checker is for an interface, returns a Checker for the return value of the given
     * method of this interface.
     */
    Checker.prototype.methodResult = function (methodName) {
        var tfunc = this._getMethod(methodName);
        return new Checker(this.suite, tfunc.result);
    };
    /**
     * If this checker is for a function, returns a Checker for its argument-list.
     */
    Checker.prototype.getArgs = function () {
        if (!(this.ttype instanceof types_1.TFunc)) {
            throw new Error("getArgs() applied to non-function");
        }
        return new Checker(this.suite, this.ttype.paramList);
    };
    /**
     * If this checker is for a function, returns a Checker for its result.
     */
    Checker.prototype.getResult = function () {
        if (!(this.ttype instanceof types_1.TFunc)) {
            throw new Error("getResult() applied to non-function");
        }
        return new Checker(this.suite, this.ttype.result);
    };
    /**
     * Return the type for which this is a checker.
     */
    Checker.prototype.getType = function () {
        return this.ttype;
    };
    /**
     * Actual implementation of check() and strictCheck().
     */
    Checker.prototype._doCheck = function (checkerFunc, value) {
        var noopCtx = new util_1.NoopContext();
        if (!checkerFunc(value, noopCtx)) {
            var detailCtx = new util_1.DetailContext();
            checkerFunc(value, detailCtx);
            throw detailCtx.getError(this._path);
        }
    };
    Checker.prototype._doValidate = function (checkerFunc, value) {
        var noopCtx = new util_1.NoopContext();
        if (checkerFunc(value, noopCtx)) {
            return null;
        }
        var detailCtx = new util_1.DetailContext();
        checkerFunc(value, detailCtx);
        return detailCtx.getErrorDetail(this._path);
    };
    Checker.prototype._getMethod = function (methodName) {
        var ttype = this.props.get(methodName);
        if (!ttype) {
            throw new Error("Type has no property " + methodName);
        }
        if (!(ttype instanceof types_1.TFunc)) {
            throw new Error("Property " + methodName + " is not a method");
        }
        return ttype;
    };
    return Checker;
}());
exports.Checker = Checker;


/***/ }),

/***/ 2784:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * This module defines nodes used to define types and validations for objects and interfaces.
 */
// tslint:disable:no-shadowed-variable prefer-for-of
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.basicTypes = exports.BasicType = exports.TParamList = exports.TParam = exports.param = exports.TFunc = exports.func = exports.TProp = exports.TOptional = exports.opt = exports.TIface = exports.iface = exports.TEnumLiteral = exports.enumlit = exports.TEnumType = exports.enumtype = exports.TIntersection = exports.intersection = exports.TUnion = exports.union = exports.TTuple = exports.tuple = exports.TArray = exports.array = exports.TLiteral = exports.lit = exports.TName = exports.name = exports.TType = void 0;
var util_1 = __webpack_require__(5518);
/** Node that represents a type. */
var TType = /** @class */ (function () {
    function TType() {
    }
    return TType;
}());
exports.TType = TType;
/** Parses a type spec into a TType node. */
function parseSpec(typeSpec) {
    return typeof typeSpec === "string" ? name(typeSpec) : typeSpec;
}
function getNamedType(suite, name) {
    var ttype = suite[name];
    if (!ttype) {
        throw new Error("Unknown type " + name);
    }
    return ttype;
}
/**
 * Defines a type name, either built-in, or defined in this suite. It can typically be included in
 * the specs as just a plain string.
 */
function name(value) { return new TName(value); }
exports.name = name;
var TName = /** @class */ (function (_super) {
    __extends(TName, _super);
    function TName(name) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this._failMsg = "is not a " + name;
        return _this;
    }
    TName.prototype.getChecker = function (suite, strict, allowedProps) {
        var _this = this;
        var ttype = getNamedType(suite, this.name);
        var checker = ttype.getChecker(suite, strict, allowedProps);
        if (ttype instanceof BasicType || ttype instanceof TName) {
            return checker;
        }
        // For complex types, add an additional "is not a <Type>" message on failure.
        return function (value, ctx) { return checker(value, ctx) ? true : ctx.fail(null, _this._failMsg, 0); };
    };
    return TName;
}(TType));
exports.TName = TName;
/**
 * Defines a literal value, e.g. lit('hello') or lit(123).
 */
function lit(value) { return new TLiteral(value); }
exports.lit = lit;
var TLiteral = /** @class */ (function (_super) {
    __extends(TLiteral, _super);
    function TLiteral(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        _this.name = JSON.stringify(value);
        _this._failMsg = "is not " + _this.name;
        return _this;
    }
    TLiteral.prototype.getChecker = function (suite, strict) {
        var _this = this;
        return function (value, ctx) { return (value === _this.value) ? true : ctx.fail(null, _this._failMsg, -1); };
    };
    return TLiteral;
}(TType));
exports.TLiteral = TLiteral;
/**
 * Defines an array type, e.g. array('number').
 */
function array(typeSpec) { return new TArray(parseSpec(typeSpec)); }
exports.array = array;
var TArray = /** @class */ (function (_super) {
    __extends(TArray, _super);
    function TArray(ttype) {
        var _this = _super.call(this) || this;
        _this.ttype = ttype;
        return _this;
    }
    TArray.prototype.getChecker = function (suite, strict) {
        var itemChecker = this.ttype.getChecker(suite, strict);
        return function (value, ctx) {
            if (!Array.isArray(value)) {
                return ctx.fail(null, "is not an array", 0);
            }
            for (var i = 0; i < value.length; i++) {
                var ok = itemChecker(value[i], ctx);
                if (!ok) {
                    return ctx.fail(i, null, 1);
                }
            }
            return true;
        };
    };
    return TArray;
}(TType));
exports.TArray = TArray;
/**
 * Defines a tuple type, e.g. tuple('string', 'number').
 */
function tuple() {
    var typeSpec = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        typeSpec[_i] = arguments[_i];
    }
    return new TTuple(typeSpec.map(function (t) { return parseSpec(t); }));
}
exports.tuple = tuple;
var TTuple = /** @class */ (function (_super) {
    __extends(TTuple, _super);
    function TTuple(ttypes) {
        var _this = _super.call(this) || this;
        _this.ttypes = ttypes;
        return _this;
    }
    TTuple.prototype.getChecker = function (suite, strict) {
        var itemCheckers = this.ttypes.map(function (t) { return t.getChecker(suite, strict); });
        var checker = function (value, ctx) {
            if (!Array.isArray(value)) {
                return ctx.fail(null, "is not an array", 0);
            }
            for (var i = 0; i < itemCheckers.length; i++) {
                var ok = itemCheckers[i](value[i], ctx);
                if (!ok) {
                    return ctx.fail(i, null, 1);
                }
            }
            return true;
        };
        if (!strict) {
            return checker;
        }
        return function (value, ctx) {
            if (!checker(value, ctx)) {
                return false;
            }
            return value.length <= itemCheckers.length ? true :
                ctx.fail(itemCheckers.length, "is extraneous", 2);
        };
    };
    return TTuple;
}(TType));
exports.TTuple = TTuple;
/**
 * Defines a union type, e.g. union('number', 'null').
 */
function union() {
    var typeSpec = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        typeSpec[_i] = arguments[_i];
    }
    return new TUnion(typeSpec.map(function (t) { return parseSpec(t); }));
}
exports.union = union;
var TUnion = /** @class */ (function (_super) {
    __extends(TUnion, _super);
    function TUnion(ttypes) {
        var _this = _super.call(this) || this;
        _this.ttypes = ttypes;
        var names = ttypes.map(function (t) { return t instanceof TName || t instanceof TLiteral ? t.name : null; })
            .filter(function (n) { return n; });
        var otherTypes = ttypes.length - names.length;
        if (names.length) {
            if (otherTypes > 0) {
                names.push(otherTypes + " more");
            }
            _this._failMsg = "is none of " + names.join(", ");
        }
        else {
            _this._failMsg = "is none of " + otherTypes + " types";
        }
        return _this;
    }
    TUnion.prototype.getChecker = function (suite, strict) {
        var _this = this;
        var itemCheckers = this.ttypes.map(function (t) { return t.getChecker(suite, strict); });
        return function (value, ctx) {
            var ur = ctx.unionResolver();
            for (var i = 0; i < itemCheckers.length; i++) {
                var ok = itemCheckers[i](value, ur.createContext());
                if (ok) {
                    return true;
                }
            }
            ctx.resolveUnion(ur);
            return ctx.fail(null, _this._failMsg, 0);
        };
    };
    return TUnion;
}(TType));
exports.TUnion = TUnion;
/**
 * Defines an intersection type, e.g. intersection('number', 'null').
 */
function intersection() {
    var typeSpec = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        typeSpec[_i] = arguments[_i];
    }
    return new TIntersection(typeSpec.map(function (t) { return parseSpec(t); }));
}
exports.intersection = intersection;
var TIntersection = /** @class */ (function (_super) {
    __extends(TIntersection, _super);
    function TIntersection(ttypes) {
        var _this = _super.call(this) || this;
        _this.ttypes = ttypes;
        return _this;
    }
    TIntersection.prototype.getChecker = function (suite, strict) {
        var allowedProps = new Set();
        var itemCheckers = this.ttypes.map(function (t) { return t.getChecker(suite, strict, allowedProps); });
        return function (value, ctx) {
            var ok = itemCheckers.every(function (checker) { return checker(value, ctx); });
            if (ok) {
                return true;
            }
            return ctx.fail(null, null, 0);
        };
    };
    return TIntersection;
}(TType));
exports.TIntersection = TIntersection;
/**
 * Defines an enum type, e.g. enum({'A': 1, 'B': 2}).
 */
function enumtype(values) {
    return new TEnumType(values);
}
exports.enumtype = enumtype;
var TEnumType = /** @class */ (function (_super) {
    __extends(TEnumType, _super);
    function TEnumType(members) {
        var _this = _super.call(this) || this;
        _this.members = members;
        _this.validValues = new Set();
        _this._failMsg = "is not a valid enum value";
        _this.validValues = new Set(Object.keys(members).map(function (name) { return members[name]; }));
        return _this;
    }
    TEnumType.prototype.getChecker = function (suite, strict) {
        var _this = this;
        return function (value, ctx) {
            return (_this.validValues.has(value) ? true : ctx.fail(null, _this._failMsg, 0));
        };
    };
    return TEnumType;
}(TType));
exports.TEnumType = TEnumType;
/**
 * Defines a literal enum value, such as Direction.Up, specified as enumlit("Direction", "Up").
 */
function enumlit(name, prop) {
    return new TEnumLiteral(name, prop);
}
exports.enumlit = enumlit;
var TEnumLiteral = /** @class */ (function (_super) {
    __extends(TEnumLiteral, _super);
    function TEnumLiteral(enumName, prop) {
        var _this = _super.call(this) || this;
        _this.enumName = enumName;
        _this.prop = prop;
        _this._failMsg = "is not " + enumName + "." + prop;
        return _this;
    }
    TEnumLiteral.prototype.getChecker = function (suite, strict) {
        var _this = this;
        var ttype = getNamedType(suite, this.enumName);
        if (!(ttype instanceof TEnumType)) {
            throw new Error("Type " + this.enumName + " used in enumlit is not an enum type");
        }
        var val = ttype.members[this.prop];
        if (!ttype.members.hasOwnProperty(this.prop)) {
            throw new Error("Unknown value " + this.enumName + "." + this.prop + " used in enumlit");
        }
        return function (value, ctx) { return (value === val) ? true : ctx.fail(null, _this._failMsg, -1); };
    };
    return TEnumLiteral;
}(TType));
exports.TEnumLiteral = TEnumLiteral;
function makeIfaceProps(props) {
    return Object.keys(props).map(function (name) { return makeIfaceProp(name, props[name]); });
}
function makeIfaceProp(name, prop) {
    return prop instanceof TOptional ?
        new TProp(name, prop.ttype, true) :
        new TProp(name, parseSpec(prop), false);
}
/**
 * Defines an interface. The first argument is an array of interfaces that it extends, and the
 * second is an array of properties.
 */
function iface(bases, props) {
    return new TIface(bases, makeIfaceProps(props));
}
exports.iface = iface;
var TIface = /** @class */ (function (_super) {
    __extends(TIface, _super);
    function TIface(bases, props) {
        var _this = _super.call(this) || this;
        _this.bases = bases;
        _this.props = props;
        _this.propSet = new Set(props.map(function (p) { return p.name; }));
        return _this;
    }
    TIface.prototype.getChecker = function (suite, strict, allowedProps) {
        var _this = this;
        var baseCheckers = this.bases.map(function (b) { return getNamedType(suite, b).getChecker(suite, strict); });
        var propCheckers = this.props.map(function (prop) { return prop.ttype.getChecker(suite, strict); });
        var testCtx = new util_1.NoopContext();
        // Consider a prop required if it's not optional AND does not allow for undefined as a value.
        var isPropRequired = this.props.map(function (prop, i) {
            return !prop.isOpt && !propCheckers[i](undefined, testCtx);
        });
        var checker = function (value, ctx) {
            if (typeof value !== "object" || value === null) {
                return ctx.fail(null, "is not an object", 0);
            }
            for (var i = 0; i < baseCheckers.length; i++) {
                if (!baseCheckers[i](value, ctx)) {
                    return false;
                }
            }
            for (var i = 0; i < propCheckers.length; i++) {
                var name_1 = _this.props[i].name;
                var v = value[name_1];
                if (v === undefined) {
                    if (isPropRequired[i]) {
                        return ctx.fail(name_1, "is missing", 1);
                    }
                }
                else {
                    var ok = propCheckers[i](v, ctx);
                    if (!ok) {
                        return ctx.fail(name_1, null, 1);
                    }
                }
            }
            return true;
        };
        if (!strict) {
            return checker;
        }
        var propSet = this.propSet;
        if (allowedProps) {
            this.propSet.forEach(function (prop) { return allowedProps.add(prop); });
            propSet = allowedProps;
        }
        // In strict mode, check also for unknown enumerable properties.
        return function (value, ctx) {
            if (!checker(value, ctx)) {
                return false;
            }
            for (var prop in value) {
                if (!propSet.has(prop)) {
                    return ctx.fail(prop, "is extraneous", 2);
                }
            }
            return true;
        };
    };
    return TIface;
}(TType));
exports.TIface = TIface;
/**
 * Defines an optional property on an interface.
 */
function opt(typeSpec) { return new TOptional(parseSpec(typeSpec)); }
exports.opt = opt;
var TOptional = /** @class */ (function (_super) {
    __extends(TOptional, _super);
    function TOptional(ttype) {
        var _this = _super.call(this) || this;
        _this.ttype = ttype;
        return _this;
    }
    TOptional.prototype.getChecker = function (suite, strict) {
        var itemChecker = this.ttype.getChecker(suite, strict);
        return function (value, ctx) {
            return value === undefined || itemChecker(value, ctx);
        };
    };
    return TOptional;
}(TType));
exports.TOptional = TOptional;
/**
 * Defines a property in an interface.
 */
var TProp = /** @class */ (function () {
    function TProp(name, ttype, isOpt) {
        this.name = name;
        this.ttype = ttype;
        this.isOpt = isOpt;
    }
    return TProp;
}());
exports.TProp = TProp;
/**
 * Defines a function. The first argument declares the function's return type, the rest declare
 * its parameters.
 */
function func(resultSpec) {
    var params = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        params[_i - 1] = arguments[_i];
    }
    return new TFunc(new TParamList(params), parseSpec(resultSpec));
}
exports.func = func;
var TFunc = /** @class */ (function (_super) {
    __extends(TFunc, _super);
    function TFunc(paramList, result) {
        var _this = _super.call(this) || this;
        _this.paramList = paramList;
        _this.result = result;
        return _this;
    }
    TFunc.prototype.getChecker = function (suite, strict) {
        return function (value, ctx) {
            return typeof value === "function" ? true : ctx.fail(null, "is not a function", 0);
        };
    };
    return TFunc;
}(TType));
exports.TFunc = TFunc;
/**
 * Defines a function parameter.
 */
function param(name, typeSpec, isOpt) {
    return new TParam(name, parseSpec(typeSpec), Boolean(isOpt));
}
exports.param = param;
var TParam = /** @class */ (function () {
    function TParam(name, ttype, isOpt) {
        this.name = name;
        this.ttype = ttype;
        this.isOpt = isOpt;
    }
    return TParam;
}());
exports.TParam = TParam;
/**
 * Defines a function parameter list.
 */
var TParamList = /** @class */ (function (_super) {
    __extends(TParamList, _super);
    function TParamList(params) {
        var _this = _super.call(this) || this;
        _this.params = params;
        return _this;
    }
    TParamList.prototype.getChecker = function (suite, strict) {
        var _this = this;
        var itemCheckers = this.params.map(function (t) { return t.ttype.getChecker(suite, strict); });
        var testCtx = new util_1.NoopContext();
        var isParamRequired = this.params.map(function (param, i) {
            return !param.isOpt && !itemCheckers[i](undefined, testCtx);
        });
        var checker = function (value, ctx) {
            if (!Array.isArray(value)) {
                return ctx.fail(null, "is not an array", 0);
            }
            for (var i = 0; i < itemCheckers.length; i++) {
                var p = _this.params[i];
                if (value[i] === undefined) {
                    if (isParamRequired[i]) {
                        return ctx.fail(p.name, "is missing", 1);
                    }
                }
                else {
                    var ok = itemCheckers[i](value[i], ctx);
                    if (!ok) {
                        return ctx.fail(p.name, null, 1);
                    }
                }
            }
            return true;
        };
        if (!strict) {
            return checker;
        }
        return function (value, ctx) {
            if (!checker(value, ctx)) {
                return false;
            }
            return value.length <= itemCheckers.length ? true :
                ctx.fail(itemCheckers.length, "is extraneous", 2);
        };
    };
    return TParamList;
}(TType));
exports.TParamList = TParamList;
/**
 * Single TType implementation for all basic built-in types.
 */
var BasicType = /** @class */ (function (_super) {
    __extends(BasicType, _super);
    function BasicType(validator, message) {
        var _this = _super.call(this) || this;
        _this.validator = validator;
        _this.message = message;
        return _this;
    }
    BasicType.prototype.getChecker = function (suite, strict) {
        var _this = this;
        return function (value, ctx) { return _this.validator(value) ? true : ctx.fail(null, _this.message, 0); };
    };
    return BasicType;
}(TType));
exports.BasicType = BasicType;
/**
 * Defines the suite of basic types.
 */
exports.basicTypes = {
    any: new BasicType(function (v) { return true; }, "is invalid"),
    number: new BasicType(function (v) { return (typeof v === "number"); }, "is not a number"),
    object: new BasicType(function (v) { return (typeof v === "object" && v); }, "is not an object"),
    boolean: new BasicType(function (v) { return (typeof v === "boolean"); }, "is not a boolean"),
    string: new BasicType(function (v) { return (typeof v === "string"); }, "is not a string"),
    symbol: new BasicType(function (v) { return (typeof v === "symbol"); }, "is not a symbol"),
    void: new BasicType(function (v) { return (v == null); }, "is not void"),
    undefined: new BasicType(function (v) { return (v === undefined); }, "is not undefined"),
    null: new BasicType(function (v) { return (v === null); }, "is not null"),
    never: new BasicType(function (v) { return false; }, "is unexpected"),
    Date: new BasicType(getIsNativeChecker("[object Date]"), "is not a Date"),
    RegExp: new BasicType(getIsNativeChecker("[object RegExp]"), "is not a RegExp"),
};
// This approach for checking native object types mirrors that of lodash. Its advantage over
// `isinstance` is that it can still return true for native objects created in different JS
// execution environments.
var nativeToString = Object.prototype.toString;
function getIsNativeChecker(tag) {
    return function (v) { return typeof v === "object" && v && nativeToString.call(v) === tag; };
}
if (typeof Buffer !== "undefined") {
    exports.basicTypes.Buffer = new BasicType(function (v) { return Buffer.isBuffer(v); }, "is not a Buffer");
}
var _loop_1 = function (array_1) {
    exports.basicTypes[array_1.name] = new BasicType(function (v) { return (v instanceof array_1); }, "is not a " + array_1.name);
};
// Support typed arrays of various flavors
for (var _i = 0, _a = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array,
    Int32Array, Uint32Array, Float32Array, Float64Array, ArrayBuffer]; _i < _a.length; _i++) {
    var array_1 = _a[_i];
    _loop_1(array_1);
}


/***/ }),

/***/ 5518:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DetailContext = exports.NoopContext = exports.VError = void 0;
/**
 * Error thrown by validation. Besides an informative message, it includes the path to the
 * property which triggered the failure.
 */
var VError = /** @class */ (function (_super) {
    __extends(VError, _super);
    function VError(path, message) {
        var _this = _super.call(this, message) || this;
        _this.path = path;
        // See https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work for info about this workaround.
        Object.setPrototypeOf(_this, VError.prototype);
        return _this;
    }
    return VError;
}(Error));
exports.VError = VError;
/**
 * Fast implementation of IContext used for first-pass validation. If that fails, we can validate
 * using DetailContext to collect error messages. That's faster for the common case when messages
 * normally pass validation.
 */
var NoopContext = /** @class */ (function () {
    function NoopContext() {
    }
    NoopContext.prototype.fail = function (relPath, message, score) {
        return false;
    };
    NoopContext.prototype.unionResolver = function () { return this; };
    NoopContext.prototype.createContext = function () { return this; };
    NoopContext.prototype.resolveUnion = function (ur) { };
    return NoopContext;
}());
exports.NoopContext = NoopContext;
/**
 * Complete implementation of IContext that collects meaningfull errors.
 */
var DetailContext = /** @class */ (function () {
    function DetailContext() {
        // Stack of property names and associated messages for reporting helpful error messages.
        this._propNames = [""];
        this._messages = [null];
        // Score is used to choose the best union member whose DetailContext to use for reporting.
        // Higher score means better match (or rather less severe mismatch).
        this._score = 0;
    }
    DetailContext.prototype.fail = function (relPath, message, score) {
        this._propNames.push(relPath);
        this._messages.push(message);
        this._score += score;
        return false;
    };
    DetailContext.prototype.unionResolver = function () {
        return new DetailUnionResolver();
    };
    DetailContext.prototype.resolveUnion = function (unionResolver) {
        var _a, _b;
        var u = unionResolver;
        var best = null;
        for (var _i = 0, _c = u.contexts; _i < _c.length; _i++) {
            var ctx = _c[_i];
            if (!best || ctx._score >= best._score) {
                best = ctx;
            }
        }
        if (best && best._score > 0) {
            (_a = this._propNames).push.apply(_a, best._propNames);
            (_b = this._messages).push.apply(_b, best._messages);
        }
    };
    DetailContext.prototype.getError = function (path) {
        var msgParts = [];
        for (var i = this._propNames.length - 1; i >= 0; i--) {
            var p = this._propNames[i];
            path += (typeof p === "number") ? "[" + p + "]" : (p ? "." + p : "");
            var m = this._messages[i];
            if (m) {
                msgParts.push(path + " " + m);
            }
        }
        return new VError(path, msgParts.join("; "));
    };
    DetailContext.prototype.getErrorDetail = function (path) {
        var details = [];
        for (var i = this._propNames.length - 1; i >= 0; i--) {
            var p = this._propNames[i];
            path += (typeof p === "number") ? "[" + p + "]" : (p ? "." + p : "");
            var message = this._messages[i];
            if (message) {
                details.push({ path: path, message: message });
            }
        }
        var detail = null;
        for (var i = details.length - 1; i >= 0; i--) {
            if (detail) {
                details[i].nested = [detail];
            }
            detail = details[i];
        }
        return detail;
    };
    return DetailContext;
}());
exports.DetailContext = DetailContext;
var DetailUnionResolver = /** @class */ (function () {
    function DetailUnionResolver() {
        this.contexts = [];
    }
    DetailUnionResolver.prototype.createContext = function () {
        var ctx = new DetailContext();
        this.contexts.push(ctx);
        return ctx;
    };
    return DetailUnionResolver;
}());


/***/ }),

/***/ 3334:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var react = __webpack_require__(8038), observerSettings = {
  characterData: !0,
  characterDataOldValue: !0,
  childList: !0,
  subtree: !0
}, getCurrentRange = function() {
  return window.getSelection().getRangeAt(0);
}, setCurrentRange = function(c) {
  var a = window.getSelection();
  a.empty();
  a.addRange(c);
}, isUndoRedoKey = function(c) {
  return (c.metaKey || c.ctrlKey) && !c.altKey && "KeyZ" === c.code;
}, toString = function(c) {
  c = [ c.firstChild ];
  for (var b, a = ""; b = c.pop(); ) {
    b.nodeType === Node.TEXT_NODE ? a += b.textContent : b.nodeType === Node.ELEMENT_NODE && "BR" === b.nodeName && (a += "\n"), 
    b.nextSibling && c.push(b.nextSibling), b.firstChild && c.push(b.firstChild);
  }
  "\n" !== a[a.length - 1] && (a += "\n");
  return a;
}, setStart = function(c, a, b) {
  b < a.textContent.length ? c.setStart(a, b) : c.setStartAfter(a);
}, setEnd = function(c, a, b) {
  b < a.textContent.length ? c.setEnd(a, b) : c.setEndAfter(a);
}, getPosition = function(c) {
  var a = getCurrentRange(), b = a.collapsed ? 0 : a.toString().length, d = document.createRange();
  d.setStart(c, 0);
  d.setEnd(a.startContainer, a.startOffset);
  return {
    position: c = (d = d.toString()).length,
    extent: b,
    content: d = (d = d.split("\n"))[a = d.length - 1],
    line: a
  };
}, makeRange = function(c, a, b) {
  0 >= a && (a = 0);
  if (!b || 0 > b) {
    b = a;
  }
  var d = document.createRange();
  c = [ c.firstChild ];
  for (var f, k = 0, g = a; f = c[c.length - 1]; ) {
    if (f.nodeType === Node.TEXT_NODE) {
      if (k + f.textContent.length >= g) {
        var l = g - k;
        if (g === a) {
          if (setStart(d, f, l), b !== a) {
            g = b;
            continue;
          } else {
            break;
          }
        } else {
          setEnd(d, f, l);
          break;
        }
      }
      k += f.textContent.length;
    } else if (f.nodeType === Node.ELEMENT_NODE && "BR" === f.nodeName) {
      if (k + 1 >= g) {
        if (g === a) {
          if (setStart(d, f, 0), b !== a) {
            g = b;
            continue;
          } else {
            break;
          }
        } else {
          setEnd(d, f, 0);
          break;
        }
      }
      k++;
    }
    c.pop();
    f.nextSibling && c.push(f.nextSibling);
    f.firstChild && c.push(f.firstChild);
  }
  return d;
};

exports.useEditable = function(c, a, b) {
  function d(h) {
    var b = c.current;
    if (b) {
      var a = getPosition(b);
      b = toString(b);
      a.position += h.length - b.length;
      e.position = a;
      e.onChange(h, a);
    }
  }
  function k(h, b) {
    var a = c.current;
    if (a) {
      var e = getCurrentRange();
      e.deleteContents();
      e.collapse();
      e = getPosition(a);
      var n = b || 0;
      (e = makeRange(a, b = e.position + (0 > n ? n : 0), e.position + (0 < n ? n : 0))).deleteContents();
      h && e.insertNode(document.createTextNode(h));
      setCurrentRange(makeRange(a, b + h.length));
    }
  }
  function f(b) {
    var e = c.current;
    if (e) {
      e.focus();
      var a = 0;
      if ("number" == typeof b) {
        a = b;
      } else {
        var h = toString(e).split("\n").slice(0, b.row);
        b.row && (a += h.join("\n").length + 1);
        a += b.column;
      }
      setCurrentRange(makeRange(e, a));
    }
  }
  function g() {
    var b = c.current;
    return {
      text: toString(b),
      position: b = getPosition(b)
    };
  }
  function l() {
    e.observer.disconnect();
  }
  b || (b = {});
  var y = react.useState([])[1], e = react.useState((function() {
    var e = {
      observer: null,
      disconnected: !1,
      onChange: a,
      queue: [],
      history: [],
      historyAt: -1,
      position: null
    };
    "undefined" != typeof MutationObserver && (e.observer = new MutationObserver((function b(b) {
      var a;
      (a = e.queue).push.apply(a, b);
    })));
    return e;
  }))[0], m = react.useMemo((function() {
    return {
      update: d,
      insert: k,
      move: f,
      getState: g
    };
  }), []);
  if ("object" != typeof navigator) {
    return m;
  }
  react.useLayoutEffect((function() {
    e.onChange = a;
    if (c.current && !b.disabled) {
      e.disconnected = !1;
      e.observer.observe(c.current, observerSettings);
      if (e.position) {
        var h = e.position, d = h.position;
        setCurrentRange(makeRange(c.current, d, d + h.extent));
      }
      return l;
    }
  }));
  react.useLayoutEffect((function() {
    if (!c.current || b.disabled) {
      e.history.length = 0, e.historyAt = -1;
    } else {
      var a = c.current;
      if (e.position) {
        a.focus();
        var d = e.position, f = d.position;
        setCurrentRange(makeRange(a, f, f + d.extent));
      }
      var g = a.style.whiteSpace, k = a.contentEditable, l = !0;
      try {
        a.contentEditable = "plaintext-only";
      } catch (q) {
        a.contentEditable = "true", l = !1;
      }
      "pre" !== g && (a.style.whiteSpace = "pre-wrap");
      b.indentation && (a.style.tabSize = a.style.MozTabSize = "" + b.indentation);
      d = "" + " ".repeat(b.indentation || 0);
      var t, z = new RegExp("^(?:" + d + ")"), A = new RegExp("^(?:" + d + ")*(" + d + ")$"), p = function(b) {
        if (c.current && e.position) {
          var q = toString(a), d = getPosition(a), f = (new Date).valueOf(), g = e.history[e.historyAt];
          !b && 500 > f - t || g && g[1] === q ? t = f : (b = ++e.historyAt, e.history[b] = [ d, q ], 
          e.history.splice(b + 1), 500 < b && (e.historyAt--, e.history.shift()));
        }
      }, r = function() {
        var b;
        (b = e.queue).push.apply(b, e.observer.takeRecords());
        b = getPosition(a);
        if (e.queue.length) {
          e.observer.disconnect();
          e.disconnected = !0;
          var c = toString(a);
          e.position = b;
          for (var d, f; d = e.queue.pop(); ) {
            null !== d.oldValue && (d.target.textContent = d.oldValue);
            for (f = d.removedNodes.length - 1; 0 <= f; f--) {
              d.target.insertBefore(d.removedNodes[f], d.nextSibling);
            }
            for (f = d.addedNodes.length - 1; 0 <= f; f--) {
              d.addedNodes[f].parentNode && d.target.removeChild(d.addedNodes[f]);
            }
          }
          e.onChange(c, b);
        }
      }, u = function(c) {
        if (!c.defaultPrevented && c.target === a) {
          if (e.disconnected) {
            return c.preventDefault(), y([]);
          }
          if (isUndoRedoKey(c)) {
            c.preventDefault(), c.shiftKey ? (c = ++e.historyAt, (c = e.history[c]) || (e.historyAt = e.history.length - 1)) : (c = --e.historyAt, 
            (c = e.history[c]) || (e.historyAt = 0)), c && (e.observer.disconnect(), e.disconnected = !0, 
            e.position = c[0], e.onChange(c[1], c[0]));
          } else {
            p();
            if ("Enter" === c.key) {
              c.preventDefault();
              var d = getPosition(a), f = /\S/g.exec(d.content);
              d = "\n" + d.content.slice(0, f ? f.index : d.content.length);
              m.insert(d);
            } else if ((!l || b.indentation) && "Backspace" === c.key) {
              c.preventDefault(), getCurrentRange().collapsed ? (d = getPosition(a), d = A.exec(d.content), 
              m.insert("", d ? -d[1].length : -1)) : m.insert("", 0);
            } else if (b.indentation && "Tab" === c.key) {
              c.preventDefault();
              f = (d = getPosition(a)).position - d.content.length;
              var g = toString(a);
              d = c.shiftKey ? g.slice(0, f) + d.content.replace(z, "") + g.slice(f + d.content.length) : g.slice(0, f) + (b.indentation ? " ".repeat(b.indentation) : "\t") + g.slice(f);
              m.update(d);
            }
            c.repeat && r();
          }
        }
      }, v = function(b) {
        b.defaultPrevented || b.isComposing || (isUndoRedoKey(b) || p(), r(), a.focus());
      }, w = function(b) {
        e.position = window.getSelection().rangeCount && b.target === a ? getPosition(a) : null;
      }, x = function(a) {
        a.preventDefault();
        p(!0);
        m.insert(a.clipboardData.getData("text/plain"));
        p(!0);
        r();
      };
      document.addEventListener("selectstart", w);
      window.addEventListener("keydown", u);
      a.addEventListener("paste", x);
      a.addEventListener("keyup", v);
      return function() {
        document.removeEventListener("selectstart", w);
        window.removeEventListener("keydown", u);
        a.removeEventListener("paste", x);
        a.removeEventListener("keyup", v);
        a.style.whiteSpace = g;
        a.contentEditable = k;
      };
    }
  }), [ c.current, b.disabled, b.indentation ]);
  return m;
};
//# sourceMappingURL=use-editable.js.map


/***/ })

};
;