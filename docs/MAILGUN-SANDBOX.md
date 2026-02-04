# Mailgun sandbox: why emails don’t arrive

With a **Mailgun sandbox domain** (free tier), Mailgun only delivers to **authorized recipients**. If you don’t add the address there, you get:

**"Domain ... is not allowed to send: Free accounts are for test purposes only. Please upgrade or add the address to your authorized recipients. (code 403)"**

## Fix: add authorized recipients

1. Log in at [app.mailgun.com](https://app.mailgun.com).
2. Open **Sending** → **Domain** → your sandbox domain.
3. Go to **Authorized recipients** (or **Recipients** in the left menu).
4. Click **Add recipient**.
5. Enter the **email address** that should receive invite/password-reset emails (e.g. `daniel@mailinator.com` or your real customer emails).
6. Mailgun sends a verification email to that address. **Open it and click the verification link.**
7. After verification, that address can receive mail from your sandbox.

Repeat for every address that should receive emails (each customer, your own test address, etc.).

## Test after adding a recipient

```bash
php artisan mail:test the-verified-email@example.com
```

You should see “Sent successfully” and the message in that inbox.

## Production

For production, add and verify your **own domain** in Mailgun (Sending → Domains → Add domain). Then you can send to any address without authorizing each one. Update `.env` with your production domain and from-address on that domain.
