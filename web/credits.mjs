import { initLanguageUI, t } from './i18n.mjs';

initLanguageUI();
function updateTitle() { document.title = `${t('creditsTitle')} · Little Space Explorer`; }
window.addEventListener('app-languagechange', updateTitle);
updateTitle();
