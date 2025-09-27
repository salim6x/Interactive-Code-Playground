// DOM elements
const htmlTextArea = document.getElementById('html-editor');
const cssTextArea = document.getElementById('css-editor');
const jsTextArea = document.getElementById('js-editor');
const previewFrame = document.getElementById('preview');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const exportBtn = document.getElementById('export-btn');
const themeSelect = document.getElementById('theme-select');

let htmlEditor, cssEditor, jsEditor;

const LOCAL_STORAGE_KEY = 'codePlaygroundSnippet';

// Initialize CodeMirror editors with syntax highlighting
function initEditors(theme) {
  htmlEditor = CodeMirror.fromTextArea(htmlTextArea, {
    mode: 'htmlmixed',
    lineNumbers: true,
    theme,
    tabSize: 2,
    viewportMargin: Infinity,
    autoCloseTags: true,
  });
  cssEditor = CodeMirror.fromTextArea(cssTextArea, {
    mode: 'css',
    lineNumbers: true,
    theme,
    tabSize: 2,
    viewportMargin: Infinity,
  });
  jsEditor = CodeMirror.fromTextArea(jsTextArea, {
    mode: 'javascript',
    lineNumbers: true,
    theme,
    tabSize: 2,
    viewportMargin: Infinity,
  });

  // On content change update preview
  [htmlEditor, cssEditor, jsEditor].forEach(editor => {
    editor.on('change', updatePreview);
  });
}

// Compose the full HTML content for iframe preview
function composePreviewContent() {
  const htmlCode = htmlEditor.getValue();
  const cssCode = `<style>${cssEditor.getValue()}</style>`;
  const jsCode = `<script>${jsEditor.getValue()}<\/script>`;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    ${cssCode}
  </head>
  <body>
    ${htmlCode}
    ${jsCode}
  </body>
  </html>
  `;
}

// Update the iframe preview live
function updatePreview() {
  const content = composePreviewContent();
  const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(content);
  iframeDoc.close();
}

// Save snippet to localStorage
function saveSnippet() {
  const snippet = {
    html: htmlEditor.getValue(),
    css: cssEditor.getValue(),
    js: jsEditor.getValue(),
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snippet));
  alert('Snippet saved!');
}

// Load snippet from localStorage
function loadSnippet() {
  const snippetString = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!snippetString) {
    alert('No saved snippet found');
    return;
  }
  const snippet = JSON.parse(snippetString);
  htmlEditor.setValue(snippet.html || '');
  cssEditor.setValue(snippet.css || '');
  jsEditor.setValue(snippet.js || '');
  updatePreview();
  alert('Snippet loaded!');
}

// Export files as downloadable
function exportFiles() {
  const snippet = {
    html: htmlEditor.getValue(),
    css: cssEditor.getValue(),
    js: jsEditor.getValue(),
  };

  const htmlContent = snippet.html || '';
  const cssContent = snippet.css || '';
  const jsContent = snippet.js || '';

  // HTML file content with embedded calls to CSS and JS files
  const exportHTML = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Exported Code</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
  ${htmlContent}
  <script src="script.js"></script>
  </body>
  </html>
  `.trim();

  // Create blobs and download
  downloadFile('index.html', exportHTML);
  downloadFile('style.css', cssContent);
  downloadFile('script.js', jsContent);
}

function downloadFile(filename, content) {
  const element = document.createElement('a');
  const blob = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(blob);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  setTimeout(() => {
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  }, 0);
}

// Change theme dynamically
function changeTheme(theme) {
  [htmlEditor, cssEditor, jsEditor].forEach(editor => {
    editor.setOption('theme', theme);
  });
}

// Initialization
window.onload = () => {
  initEditors(themeSelect.value);
  updatePreview();

  // Event listeners for buttons
  saveBtn.addEventListener('click', saveSnippet);
  loadBtn.addEventListener('click', loadSnippet);
  exportBtn.addEventListener('click', exportFiles);
  themeSelect.addEventListener('change', e => {
    changeTheme(e.target.value);
  });
};
