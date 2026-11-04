// Regression guard for the approved desktop "新增筆記" button.
// npm run build runs this before Vite. Update only when the button design is intentionally changed.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('../src/AddNoteButton.module.css', import.meta.url), 'utf8');
const component = readFileSync(new URL('../src/AddNoteButton.jsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');

const check = (rule, message) => assert.match(css, rule, message);
check(/\.anchor\s*\{[^}]*width:\s*48px;[^}]*height:\s*48px;/s, 'Collapsed button anchor must stay 48px');
check(/grid-template-columns:\s*24px max-content;/, 'Icon must keep a 24px grid column');
check(/column-gap:\s*8px;/, 'Icon-label gap must stay 8px');
check(/max-width:\s*48px;/, 'Collapsed pill must stay 48px');
check(/padding-inline:\s*12px;/, 'Base left/right padding must stay 12px');
check(/padding-inline:\s*calc\(12px \+ 1\.5pt\);/, 'Expanded left/right padding must stay +1.5pt');
check(/padding-right:\s*8px;/, 'Label trailing spacing must stay 8px');
check(/max-width:\s*200px;/, 'Expanded pill must have sufficient clipping width');
check(/transform:\s*rotate\(90deg\);/, 'Plus rotation must be preserved');
check(/transition-delay:\s*0\.2s;/, 'Label fade-in delay must be preserved');
assert.match(component, /styles\.button/, 'Button must use its scoped stylesheet');
assert.match(app, /<AddNoteButton onClick=\{onAddNote\}\s*\/>/, 'Main app must use the locked component');
assert.doesNotMatch(app, /expanding-note-button/, 'Old inline button styling must not return');
console.log('AddNoteButton style regression checks passed.');
