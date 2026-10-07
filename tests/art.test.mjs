// Tests for course pictures: the cover-picture prompt and validator (30-prompts.js) and the pure
// parts of U.art (35-art.js): the image model's prompt, finding the picture in a tool result,
// the seed, and what Dan is told when a picture could not be drawn.
// Run: node --test tests/art.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'app', 'src', 'js', f), 'utf8');
const plain = (x) => JSON.parse(JSON.stringify(x));

// Pure at load: 00-core, 30-prompts and 35-art run in a VM with no DOM.
function load() {
  const ctx = { console, Math, JSON, Date, setTimeout, clearTimeout };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['00-core.js', '30-prompts.js', '35-art.js']) vm.runInContext(src(f), ctx, { filename: f });
  return ctx.U;
}
const U = load();
const TOPIC = {
  id: 'tides-ab12', title: 'How tides work', query: 'tides', status: 'ready',
  oneBreath: 'The **Moon** pulls the oceans into two bulges, and the Earth turns under them.',
  ideas: [{ id: 'i1', title: 'The Moon pulls' }, { id: 'i2', title: 'Two bulges' }, { id: 'i3', title: 'Spring and neap tides' }],
};

test('the cover-picture prompt: TASK line, the course, the rules, the reply shape', () => {
  const p = U.prompts.coverPicture(TOPIC);
  assert.equal(p.split('\n')[0], 'TASK: cover-picture');
  assert.match(p, /Title: How tides work/);
  assert.match(p, /In one breath: The Moon pulls the oceans/, 'the summary as plain words');
  assert.ok(!p.includes('**'), 'no markdown reaches the picture prompt');
  assert.match(p, /- The Moon pulls\n- Two bulges\n- Spring and neap tides/);
  assert.match(p, /no diagrams, charts, graphs, maps, formulas/);
  assert.match(p, /No real, named people/);
  assert.match(p, /\{ "scene": "<12-35 words>" \}/);
  // An older topic with no summary and no ideas still gets a whole prompt.
  const bare = U.prompts.coverPicture({ query: 'jazz chords' });
  assert.match(bare, /Title: jazz chords/);
  assert.ok(!/In one breath|Its ideas/.test(bare));
});

test('the cover-picture validator: a drawable scene of 6-35 words', () => {
  const ok = U.validate.cover({ scene: 'A rocky shore at low tide under a pale full moon, with seaweed, rock pools and a small wooden boat resting on the wet sand' });
  assert.deepEqual(plain(ok), []);
  assert.match(plain(U.validate.cover(null))[0], /one JSON object \{ "scene"/);
  assert.match(plain(U.validate.cover({ scene: '' }))[0], /one JSON object/);
  assert.match(plain(U.validate.cover({ scene: 'The moon and sea.' }))[0], /4 words; describe the picture in 12-35 words/);
  const long = U.validate.cover({ scene: Array(50).fill('shell').join(' ') });
  assert.equal(long.length, 1);
  assert.match(long[0], /50 words; keep it to at most 35/);
  assert.deepEqual(plain(long.soft), plain(long), 'length is soft');
  for (const bad of ['a chart of tide heights', 'a map of the coast with labels', 'a diagram of the Moon and Earth', 'a sign with the words HIGH TIDE']) {
    const p = U.validate.cover({ scene: bad + ' on a sandy beach under a bright moon at evening' });
    assert.ok(p.some((x) => /cannot draw writing, diagrams, maps or numbers/.test(x)), bad);
    assert.ok(U.validate.hard(p).length > 0, 'a scene the model cannot draw is a hard problem: ' + bad);
  }
});

test('the image prompt is the scene, then the house style with no text', () => {
  const p = U.art.prompt('  A rocky shore at low tide.  ');
  assert.ok(p.startsWith('A rocky shore at low tide. Illustration in the style of a naturalist'), p);
  assert.match(p, /No text, no letters, no numbers, no labels, no words/);
  assert.match(p, /No book, no page edges, no border, no frame/);
  assert.equal(U.art.prompt(''), U.art.STYLE);
});

test('finding the picture in a tool result', () => {
  const b64 = 'UklGR' + 'A'.repeat(200);
  // The MCP spelling: {type:'image', data, mimeType}.
  assert.deepEqual(plain(U.art.fromResult({ content: [{ type: 'text', text: 'Image URL: x' }, { type: 'image', data: b64, mimeType: 'image/webp' }] })), { data: b64, mime: 'image/webp' });
  // The {source:{data, media_type}} spelling; an unknown type is read as WebP.
  assert.deepEqual(plain(U.art.fromResult({ content: [{ type: 'image', source: { type: 'base64', media_type: 'image/png', data: b64 } }] })), { data: b64, mime: 'image/png' });
  assert.deepEqual(plain(U.art.fromResult({ content: [{ type: 'image', data: b64, mimeType: 'application/x-what' }] })), { data: b64, mime: 'image/webp' });
  // Too short, or not base64: not a picture.
  assert.equal(U.art.fromResult({ content: [{ type: 'image', data: 'abc', mimeType: 'image/png' }] }), null);
  assert.equal(U.art.fromResult({ content: [{ type: 'image', data: 'A'.repeat(150) + '<script>', mimeType: 'image/png' }] }), null);
  // Only a link, in the text or the payload.
  const url = 'https://mcp-tools-z-image-turbo.hf.space/--replicas/92bgs/gradio_api/file=/tmp/gradio/7edb/image.webp';
  assert.deepEqual(plain(U.art.fromResult({ content: [{ type: 'text', text: 'Image URL: ' + url }, { type: 'text', text: 'The seed used for generation was553645' }] })), { url });
  assert.deepEqual(plain(U.art.fromResult({ content: [], payload: { image: { url: url } } })), { url });
  assert.deepEqual(plain(U.art.fromResult({ content: [], payload: [[{ image: url, caption: null }], '553645', 553645] })), { url });
  // Nothing usable.
  assert.equal(U.art.fromResult({ content: [{ type: 'text', text: 'Error: GPU quota exceeded' }] }), null);
  assert.equal(U.art.fromResult(null), null);
  assert.equal(U.art.fromResult('text'), null);
});

test('the seed, and what Dan is told when a picture could not be drawn', () => {
  assert.equal(U.art.seedOf({ content: [{ type: 'text', text: 'The seed used for generation was553645' }] }), 553645);
  assert.equal(U.art.seedOf({ content: [] }), null);
  // Never from the picture's own data: base64 can spell "seed" before the real line.
  const img = { type: 'image', data: 'AAAAseedAAAA2AAAA' + 'B'.repeat(300), mimeType: 'image/webp' };
  assert.equal(U.art.seedOf({ content: [img, { type: 'text', text: 'Image URL: https://x.hf.space/a.webp' }, { type: 'text', text: 'The seed used for generation was553645' }] }), 553645);
  assert.equal(U.art.seedOf({ content: [img] }), null);
  assert.match(U.art.why({ code: 'not_in_manifest' }), /not allowed for this app\. Settings shows how to allow it/);
  assert.match(U.art.why({ code: 'server_not_connected' }), /Claude MCP, your Hugging Face connector, is not connected/);
  assert.match(U.art.why({ code: 'timeout' }), /did not answer in time/);
  assert.match(U.art.why({ code: 'no_image' }), /no picture that could be used/);
  assert.match(U.art.why({ code: 'tool_error' }), /something went wrong/);
  assert.equal(U.art.why({ code: 'tool_error', detail: '  GPU   quota exceeded ' }), 'the image model said “GPU quota exceeded”');
  assert.match(U.art.why({ code: 'upstream_error' }), /did not answer in time/);
  assert.match(U.art.why({ code: 'approval_required' }), /organisation's settings/);
  assert.match(U.art.why({ code: 'selection_required' }), /more than one connector/);
  assert.match(U.art.why(null), /something went wrong/);
});

test('with no runtime, nothing is drawn or shown and nothing throws', () => {
  assert.equal(U.art.shown(), true, 'not asked yet: pictures already drawn elsewhere still show');
  assert.equal(U.art.wanted(), false);
  assert.equal(U.art.asked(), false);
  assert.equal(U.art.src('tides-ab12'), null);
  U.art.want([TOPIC]);
  assert.equal(U.art.state('tides-ab12'), 'none');
});
