async function removeUnnecessaryElements() {
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const wosHelperControls = document.getElementById('wos-helper-controls');
  const wosHelperLogs = document.getElementById('wos-helper-logs');
  const siteHeader = document.getElementById('logo-container-id');

  if (header) {
    header.style.display = 'none';
  }

  if (footer) {
    footer.style.display = 'none';
  }

  if (wosHelperControls) {
    wosHelperControls.style.display = 'none';
  }

  if (wosHelperLogs) {
    wosHelperLogs.style.display = 'none';
  }

  if (siteHeader) {
    siteHeader.style.display = 'none';
  }
}

export { removeUnnecessaryElements };
