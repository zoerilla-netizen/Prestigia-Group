# Prestigia Group website

Plain HTML, CSS and JavaScript. No build step, no database, nothing to install.

## Put it online (about 10 minutes)
1. **GitHub:** create a new repository named `prestigia-website`. Click "uploading an existing file", drag in everything in this folder (not the folder itself), and click **Commit changes**.
2. **Vercel:** click **Add New → Project**, import `prestigia-website`, leave the settings as they are, and click **Deploy**.
3. **Domain:** in the Vercel project, go to **Settings → Domains** and add `prestigiagroup.com` and `www.prestigiagroup.com`. Add the DNS records Vercel shows where you bought the domain.

## Update company details later
Open `assets/site-config.js` on GitHub, click the pencil icon, fill in the values, and click **Commit changes**. Vercel republishes in about a minute.

- `email` — shows your email on the site and turns on the contact forms (they open the visitor's email app, addressed to you). Until then, the contact page asks visitors to call.
- `uei`, `cage`, `naics` — appear on the About and Contact pages and the footer once filled in.

Anything left as `""` stays hidden.
