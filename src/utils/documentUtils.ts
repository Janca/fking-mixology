export function setTitle(title?: string, appName: string = "Mixology") {
  document.title = title ? `${title} | ${appName}` : appName;
}
