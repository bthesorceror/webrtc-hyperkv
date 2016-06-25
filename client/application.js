const level     = require('level-browserify');
const hyperlog  = require('hyperlog');
const hyperkv   = require('hyperkv');
const sub       = require('subleveldown');
const signalhub = require('signalhub');
const webrtc    = require('webrtc-swarm');
const $         = require('jquery');

let hub = signalhub('app1', ['https://rocky-bastion-23364.herokuapp.com']);

let db = level('log.db');
let log = hyperlog(sub(db, 'log'), { valueEncoding: 'json' });
let kv = hyperkv({
  log: log,
  db: sub(db, 'kv')
});

const appendValue = (key, values) => {
  let $tbody = $('table#values-table tbody');

  kv.get(key, (err, values) => {
    values = JSON.stringify(values);
    let $tr = $tbody.find(`tr#${key}`);

    if ($tr.length) {
      return $tr.find('td:nth-child(2)').text(values);
    }

    $tr = $('<tr />').attr('id', key);
    $tr.append($('<td />').text(key));
    $tr.append($('<td />').text(values));
    $tbody.append($tr);
  });
}

const updateCount = (count) => {
  let text = `${count} Connection`;
  if (count !== 1) {
    text += 's';
  }
  $('#peer-count').text(text);
}

kv.on('update', appendValue);

const listen = () => {
  let swarm = webrtc(hub);

  swarm.on('peer', (peer, id) => {
    updateCount(swarm.peers.length);
    peer.pipe(log.replicate({ live: true })).pipe(peer);
  });

  swarm.on('disconnect', (peer, id) => {
    updateCount(swarm.peers.length);
  });
}

kv.createReadStream().on('data', (data) => {
  let key = data.key;
  let values = data.values;

  appendValue(key, values);
}).on('end', listen);

$(() => {
  let $form = $('form');
  let $value = $form.find('input[name="value"]');
  let $key = $form.find('input[name="key"]');

  $form.on('submit', (event) => {
    event.preventDefault();
    let key = $key.val();
    let value = $value.val();
    $form[0].reset();

    if (key && value) {
      kv.put(key, value);
    } else {
      alert('key and value required');
    }
  });
});
