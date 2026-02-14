# Privacy Policy

**Effective date: February 14, 2026**

Open Engram ("we", "us", "our") is operated by Beaux Walton in Powell River, British Columbia, Canada. This policy explains what data we collect, how we use it, and your rights.

We keep this simple because privacy policies shouldn't require a law degree.

---

## What We Collect

### Account Information
- Email address
- Hashed password (managed by Supabase Auth)
- Billing information (processed by Stripe — we don't store card numbers)

### Memories and Embeddings
When you use the API, we store:
- **Text memories**: The content you send us
- **Vector embeddings**: Mathematical representations of your text, generated automatically for semantic search
- **Metadata**: Any tags, timestamps, or structured data you attach to memories

Embeddings are numerical vectors derived from your text. They're stored alongside the original content to power similarity search. They cannot be meaningfully reversed back into readable text by third parties.

### Usage Data
- API request counts and timestamps
- Rate limit and quota usage
- Error logs (without memory content)

### Minimal Browser Data
- Authentication tokens (stored as cookies)
- We don't use analytics trackers, advertising cookies, or fingerprinting

## How We Use Your Data

- **To provide the service**: Store memories, generate embeddings, serve API requests
- **To manage your account**: Authentication, billing, plan management
- **To improve reliability**: Monitor errors, prevent abuse, maintain uptime
- **To communicate with you**: Service updates, billing notices, security alerts

We do **not**:
- Sell your data
- Use your memories to train AI models
- Share your content with other users
- Profile you for advertising

## Third-Party Services

We use a small number of trusted services to operate:

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| **Supabase** | Authentication, database | Account info, stored memories |
| **Stripe** | Payment processing | Email, payment method, billing address |
| **Railway** | Infrastructure hosting | All service data (hosted on their servers) |

These providers process data under their own privacy policies. Servers are located in the US and/or Canada.

## Data Retention

- **Active accounts**: Your data is stored as long as your account is active.
- **Deleted memories**: Removed from our database promptly. May persist in backups for up to 30 days.
- **Closed accounts**: All data is deleted within 30 days of account closure.
- **Usage logs**: Retained for up to 90 days for operational purposes.

## Your Rights

Regardless of where you're located, we provide these rights to all users:

- **Access**: View all data we have about you via the dashboard or API
- **Export**: Download your memories and metadata at any time
- **Delete**: Delete individual memories or your entire account
- **Correction**: Update your account information anytime
- **Portability**: Export your data in standard formats

### For EU/EEA Residents (GDPR)
We process your data based on contractual necessity (to provide the service you signed up for). You have additional rights under GDPR including the right to object to processing and to lodge a complaint with your supervisory authority.

### For Canadian Residents (PIPEDA)
We comply with Canada's Personal Information Protection and Electronic Documents Act. You may file a complaint with the Office of the Privacy Commissioner of Canada.

## Data Security

We take reasonable measures to protect your data:

- All data transmitted over HTTPS/TLS
- Passwords are hashed, never stored in plaintext
- API keys are generated with sufficient entropy
- Database access is restricted and authenticated
- Infrastructure is managed by Railway with their security practices

No system is perfectly secure. We can't guarantee absolute security, but we take it seriously and respond promptly to any incidents.

## Cookies

We use cookies only for authentication (keeping you signed in). That's it. No tracking cookies, no third-party cookies, no cookie banners needed.

## Children

Open Engram is not directed at children under 16. We don't knowingly collect data from children. If you believe a child has created an account, contact us and we'll delete it.

## Changes to This Policy

If we make material changes, we'll notify you by email or through the dashboard at least 30 days in advance. The updated date at the top of this page reflects the latest version.

## Contact

For privacy questions, data requests, or concerns:

**Email**: hello@openengram.ai
**Location**: Powell River, British Columbia, Canada
