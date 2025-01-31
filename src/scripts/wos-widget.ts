async function removeUnnecessaryElements() {
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const wosHelperControls = document.getElementById('wos-helper-controls');
  const wosHelperLogs = document.getElementById('wos-helper-logs');

  if (header) {
    header.remove();
  }

  if (footer) {
    footer.remove();
  }

  if (wosHelperControls) {
    wosHelperControls.remove();
  }

  if (wosHelperLogs) {
    wosHelperLogs.remove();
  }
}

export { removeUnnecessaryElements };
