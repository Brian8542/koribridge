function gtag(...args) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag(...args);
}

export function pageView(pageName) {
  gtag("event", "page_view", {
    page_title: pageName,
    page_location: window.location.href,
  });
}

export function signUp(method) {
  gtag("event", "sign_up", { method });
}

export function login(method) {
  gtag("event", "login", { method });
}

export function startChat(partnerId) {
  gtag("event", "start_chat", { partner_id: partnerId });
}

export function viewProfile(profileId) {
  gtag("event", "view_profile", { profile_id: profileId });
}
