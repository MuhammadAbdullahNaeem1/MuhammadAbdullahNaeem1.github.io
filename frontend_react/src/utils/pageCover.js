// While a project modal covers the page, the background WebGL scenes pause
// (nobody can see them, and rendering under the modal cost scroll smoothness).
// Kept free of three.js so the main bundle can import it.

export const PAGE_COVER_EVENT = "app:page-cover";

export const pageCovered = () =>
  document.documentElement.classList.contains("is-modal-open");

export function setPageCovered(covered) {
  document.documentElement.classList.toggle("is-modal-open", covered);
  window.dispatchEvent(new Event(PAGE_COVER_EVENT));
}
