export default async function handler(req, res) {
  // ─── STEP 1: Get the email from the URL ───────────────────────────────────
  const email = req.query.email;

  // If no email was passed in the URL, send to a default fallback
  if (!email) {
    return res.redirect(302, "https://go.oncehub.com/KimberlyChristen");
  }

  try {
    // ─── STEP 2: Look up the contact in GHL by email ────────────────────────
    const GHL_API_KEY = process.env.GHL_API_KEY; // Set this in Vercel (instructions below)

    const searchResponse = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const searchData = await searchResponse.json();
    const contact = searchData?.contacts?.[0];

    // If contact not found, redirect to default
    if (!contact) {
      return res.redirect(302, "https://go.oncehub.com/KimberlyChristen");
    }

    // ─── STEP 3: Read the custom field value ────────────────────────────────
    // Replace "Sales rep first name (Sendblue)" with your EXACT GHL custom field name
    const CUSTOM_FIELD_NAME = "Sales rep first name (Sendblue)";

    const customFields = contact.customField || [];
    const repField = customFields.find((f) => f.name === CUSTOM_FIELD_NAME);
    const repName = repField?.value?.trim() || "";

    // ─── STEP 4: Match the rep name to their OnceHub calendar URL ────────────
    const repCalendars = {
      Kimberly: "https://go.oncehub.com/KimberlyChristen",
      Terry: "https://go.oncehub.com/Terry1",
      Stephanie: "https://go.oncehub.com/Stephanie7",
      Matthew: "https://go.oncehub.com/Matthewoneil",
      Megan: "https://go.oncehub.com/MeganBuckland",
    };

    // Find a matching rep (case-insensitive, checks if field value contains the name)
    let redirectUrl = null;
    for (const [name, url] of Object.entries(repCalendars)) {
      if (repName.toLowerCase().includes(name.toLowerCase())) {
        redirectUrl = url;
        break;
      }
    }

    // If no rep matched, use default (Kimberly as fallback)
    if (!redirectUrl) {
      redirectUrl = "https://go.oncehub.com/KimberlyChristen";
    }

    // ─── STEP 5: Redirect the lead to the correct calendar ──────────────────
    return res.redirect(302, redirectUrl);

  } catch (error) {
    // If anything goes wrong, send to default calendar
    console.error("Router error:", error);
    return res.redirect(302, "https://go.oncehub.com/KimberlyChristen");
  }
}
