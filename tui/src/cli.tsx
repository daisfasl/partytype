import process from 'node:process';
import {render} from 'ink';
import App from './App.js';

process.stdout.write('\x1B[?1049h'); // enter alternate screen
process.stdout.write('\x1B[?25l');   // hide cursor

function restoreTerminal() {
  process.stdout.write('\x1B[?25h');   // show cursor
  process.stdout.write('\x1B[?1049l'); // exit alternate screen
}

process.on('exit', restoreTerminal);
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

render(<App />);
