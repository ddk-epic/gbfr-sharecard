// Minimal MessagePack reader, enough for the game's .msg text tables.
//
// system/table/text/<lang>/*.msg are MessagePack documents shaped
// { rows_: [ { column_: { id_hash_, subid_hash_, text_ } } ] } - the English
// strings behind every TXT_* key the .tbl databases reference. Decoding them
// is what lets the game be its own name source; see docs/archive.md.
//
// Only the types those files actually use are handled. Anything else throws
// rather than silently returning a wrong value.

/** Decode a MessagePack buffer to plain JS values. */
export function decode(buffer) {
  const view = new DataView(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength,
  );
  let offset = 0;

  const str = (length) => {
    const value = buffer.toString("utf8", offset, offset + length);
    offset += length;
    return value;
  };
  const array = (length) => Array.from({ length }, read);
  const map = (length) => {
    const object = {};
    for (let i = 0; i < length; i++) object[read()] = read();
    return object;
  };
  const u = (bytes, get) => {
    const value = get.call(view, offset);
    offset += bytes;
    return value;
  };

  function read() {
    const byte = buffer[offset++];
    if (byte <= 0x7f) return byte; // positive fixint
    if (byte >= 0xe0) return byte - 256; // negative fixint
    if (byte <= 0x8f) return map(byte & 0x0f); // fixmap
    if (byte <= 0x9f) return array(byte & 0x0f); // fixarray
    if (byte <= 0xbf) return str(byte & 0x1f); // fixstr
    switch (byte) {
      case 0xc0: return null;
      case 0xc2: return false;
      case 0xc3: return true;
      case 0xca: return u(4, view.getFloat32);
      case 0xcb: return u(8, view.getFloat64);
      case 0xcc: return u(1, view.getUint8);
      case 0xcd: return u(2, view.getUint16);
      case 0xce: return u(4, view.getUint32);
      case 0xcf: return Number(u(8, view.getBigUint64));
      case 0xd0: return u(1, view.getInt8);
      case 0xd1: return u(2, view.getInt16);
      case 0xd2: return u(4, view.getInt32);
      case 0xd3: return Number(u(8, view.getBigInt64));
      case 0xd9: return str(u(1, view.getUint8));
      case 0xda: return str(u(2, view.getUint16));
      case 0xdb: return str(u(4, view.getUint32));
      case 0xdc: return array(u(2, view.getUint16));
      case 0xdd: return array(u(4, view.getUint32));
      case 0xde: return map(u(2, view.getUint16));
      case 0xdf: return map(u(4, view.getUint32));
      default:
        throw new Error(
          `unhandled msgpack byte 0x${byte.toString(16)} at ${offset - 1}`,
        );
    }
  }

  return read();
}

/**
 * Every TXT_* key to its English string, merged across the text tables in a
 * `system/table/text/en` directory. Files that fail to decode are skipped -
 * a handful are not text tables at all.
 */
export async function readTextTables(directory, { readFile, readdir }) {
  const text = new Map();
  for (const file of (await readdir(directory)).filter((f) =>
    f.endsWith(".msg"),
  )) {
    let document;
    try {
      document = decode(await readFile(`${directory}/${file}`));
    } catch {
      continue;
    }
    for (const row of document.rows_ ?? [])
      if (row.column_?.id_hash_)
        text.set(row.column_.id_hash_, row.column_.text_);
  }
  return text;
}
