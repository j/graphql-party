const cp = require('child_process');

let ava;

cp.spawn('yarn', ['test:build'], { shell: true }).stdout.on('data', data => {
  const text = data.toString();

  if (/.*Compilation complete/.test(text)) {
    // process.stdout.write('\033c');

    if (!ava) {
      ava = cp.spawn('yarn', ['test:ava:watch'], {
        stdio: 'inherit',
        shell: true,
      });
    }
  }
});
