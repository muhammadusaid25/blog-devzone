// 1) Supabase > Project Settings > API: paste URL and anon (publishable) key.
window.CFG = {
  SITE_NAME: "DevZone",
  SUPABASE_URL: "https://teflywkashceeewppxaw.supabase.co",
  ADMIN_EMAIL: "usaid.aries@gmail.com", // this email is sent to admin.html after login
  SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZmx5d2thc2hjZWVld3BweGF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0ODAwNjcsImV4cCI6MjEwNzA1NjA2N30.NxnLZr3XQ9g59ogqXAigKtTA66wVYBwi4n3vgIiB3z8"
};
// 2) Paste your ad network code between the backticks. Leave empty to show a placeholder.
window.ADS = {
  header:    ``, // 728x90 / responsive banner under the menu
  inArticle: ``, // injected after the 2nd paragraph of every post
  sidebar:   ``, // 300x250 / 300x600 on post pages
  footer:    ``, // banner above footer
  popunder:  ``  // Adsterra / PropellerAds pop-under or social-bar script
};
