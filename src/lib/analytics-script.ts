export function sanitizeAnalyticsId(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function buildGaConfigScript(gaId: string): string {
  const encodedGaId = JSON.stringify(gaId);

  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${encodedGaId});`;
}

export function buildOpenPanelScript(openpanelId: string): string {
  const encodedOpenPanelId = JSON.stringify(openpanelId);

  return `!function(){var e="https://openpanel.dev/op.js",t=window.op=window.op||function(){(window.op.q=window.op.q||[]).push(arguments)};t("init",{clientId:${encodedOpenPanelId},trackScreenViews:true,trackOutgoingLinks:true,trackAttributes:true});var a=document.createElement("script");a.async=!0,a.src=e;var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)}();`;
}
