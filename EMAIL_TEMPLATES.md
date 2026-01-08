# ClinicALL Email Templates for Supabase

Professional, branded email templates in Hebrew for your clinic management system.

---

## 1. Reset Password Template

**Subject**: `איפוס סיסמה - ClinicALL`

**Body**:

```html
<!DOCTYPE html>
<html dir="rtl" lang="he">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica,
          Arial, sans-serif;
        background-color: #f8f8f8;
        direction: rtl;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }
      .header {
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        padding: 40px 20px;
        text-align: center;
      }
      .logo {
        width: 60px;
        height: 60px;
        background-color: white;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: bold;
        color: #0d9488;
        margin-bottom: 16px;
      }
      .header-title {
        color: white;
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      }
      .content {
        padding: 40px 30px;
        color: #333333;
        line-height: 1.8;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #1a1a1a;
      }
      .message {
        font-size: 16px;
        color: #555555;
        margin-bottom: 30px;
      }
      .button-container {
        text-align: center;
        margin: 40px 0;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        color: white !important;
        text-decoration: none;
        padding: 16px 48px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
      }
      .button:hover {
        box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
      }
      .note {
        background-color: #fff7ed;
        border-right: 4px solid #f97316;
        padding: 16px 20px;
        margin: 30px 0;
        border-radius: 8px;
        font-size: 14px;
        color: #7c2d12;
      }
      .expiry {
        text-align: center;
        font-size: 14px;
        color: #888888;
        margin: 20px 0;
      }
      .footer {
        background-color: #1a1a1a;
        color: #999999;
        padding: 30px;
        text-align: center;
        font-size: 13px;
      }
      .footer-brand {
        color: #ffffff;
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 8px;
      }
      .divider {
        height: 1px;
        background-color: #e5e5e5;
        margin: 30px 0;
      }
      @media only screen and (max-width: 600px) {
        .content {
          padding: 30px 20px;
        }
        .header {
          padding: 30px 20px;
        }
        .button {
          padding: 14px 32px;
          font-size: 15px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo">C</div>
        <h1 class="header-title">ClinicALL</h1>
      </div>

      <!-- Content -->
      <div class="content">
        <div class="greeting">שלום,</div>

        <div class="message">
          קיבלנו בקשה לאיפוס הסיסמה של חשבון ClinicALL שלך.
        </div>

        <div class="message">לחץ על הכפתור הבא כדי ליצור סיסמה חדשה:</div>

        <!-- Button -->
        <div class="button-container">
          <a href="{{ .ConfirmationURL }}" class="button">אפס סיסמה</a>
        </div>

        <div class="expiry">⏱ הקישור תקף ל-60 דקות בלבד</div>

        <!-- Warning Note -->
        <div class="note">
          <strong>⚠️ לא ביקשת איפוס?</strong><br />
          אם לא ביקשת לאפס את הסיסמה, התעלם מהודעה זו. הסיסמה שלך תישאר ללא
          שינוי.
        </div>

        <div class="divider"></div>

        <div class="message" style="font-size: 14px; color: #888888;">
          אם הכפתור לא עובד, העתק והדבק את הקישור הבא בדפדפן:<br />
          <a
            href="{{ .ConfirmationURL }}"
            style="color: #0D9488; word-break: break-all;"
            >{{ .ConfirmationURL }}</a
          >
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-brand">ClinicALL</div>
        <div>מערכת הניהול המתקדמת לקליניקות אסתטיות</div>
        <div style="margin-top: 16px;">
          © 2025 ClinicALL. כל הזכויות שמורות.
        </div>
      </div>
    </div>
  </body>
</html>
```

---

## 2. Confirm Signup (Email Verification)

**Subject**: `אישור הרשמה - ClinicALL`

**Body**:

```html
<!DOCTYPE html>
<html dir="rtl" lang="he">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica,
          Arial, sans-serif;
        background-color: #f8f8f8;
        direction: rtl;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }
      .header {
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        padding: 40px 20px;
        text-align: center;
      }
      .logo {
        width: 60px;
        height: 60px;
        background-color: white;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: bold;
        color: #0d9488;
        margin-bottom: 16px;
      }
      .header-title {
        color: white;
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      }
      .content {
        padding: 40px 30px;
        color: #333333;
        line-height: 1.8;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #1a1a1a;
      }
      .message {
        font-size: 16px;
        color: #555555;
        margin-bottom: 30px;
      }
      .welcome-emoji {
        font-size: 48px;
        text-align: center;
        margin: 20px 0;
      }
      .button-container {
        text-align: center;
        margin: 40px 0;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        color: white !important;
        text-decoration: none;
        padding: 16px 48px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
      }
      .features {
        background-color: #f0fdfa;
        border-radius: 12px;
        padding: 24px;
        margin: 30px 0;
      }
      .feature-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16px;
        gap: 12px;
      }
      .feature-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        background-color: #0d9488;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }
      .footer {
        background-color: #1a1a1a;
        color: #999999;
        padding: 30px;
        text-align: center;
        font-size: 13px;
      }
      .footer-brand {
        color: #ffffff;
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 8px;
      }
      @media only screen and (max-width: 600px) {
        .content {
          padding: 30px 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">C</div>
        <h1 class="header-title">ClinicALL</h1>
      </div>

      <div class="content">
        <div class="welcome-emoji">🎉</div>

        <div class="greeting">ברוכים הבאים ל-ClinicALL!</div>

        <div class="message">
          תודה על הרשמתך למערכת הניהול המתקדמת לקליניקות אסתטיות.
        </div>

        <div class="message">
          כדי להשלים את תהליך ההרשמה ולהתחיל להשתמש במערכת, נא לאמת את כתובת
          האימייל שלך:
        </div>

        <div class="button-container">
          <a href="{{ .ConfirmationURL }}" class="button">אמת אימייל</a>
        </div>

        <div class="features">
          <h3 style="margin-top: 0; color: #0D9488;">✨ מה מחכה לך?</h3>
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <div>ניהול יומן תורים חכם עם תזכורות אוטומטיות</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <div>תיק רפואי דיגיטלי מלא למטופלים</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <div>אתר תדמית מעוצב לקליניקה שלך</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <div>כלי שיווק ואוטומציה להגדלת ההכנסות</div>
          </div>
        </div>

        <div class="message" style="font-size: 14px; color: #888888;">
          אם הכפתור לא עובד, העתק והדבק את הקישור הבא:<br />
          <a
            href="{{ .ConfirmationURL }}"
            style="color: #0D9488; word-break: break-all;"
            >{{ .ConfirmationURL }}</a
          >
        </div>
      </div>

      <div class="footer">
        <div class="footer-brand">ClinicALL</div>
        <div>מערכת הניהול המתקדמת לקליניקות אסתטיות</div>
        <div style="margin-top: 16px;">
          © 2025 ClinicALL. כל הזכויות שמורות.
        </div>
      </div>
    </div>
  </body>
</html>
```

---

## 3. Magic Link (Passwordless Login)

**Subject**: `קישור התחברות - ClinicALL`

**Body**:

```html
<!DOCTYPE html>
<html dir="rtl" lang="he">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica,
          Arial, sans-serif;
        background-color: #f8f8f8;
        direction: rtl;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }
      .header {
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        padding: 40px 20px;
        text-align: center;
      }
      .logo {
        width: 60px;
        height: 60px;
        background-color: white;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: bold;
        color: #0d9488;
        margin-bottom: 16px;
      }
      .header-title {
        color: white;
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      }
      .content {
        padding: 40px 30px;
        color: #333333;
        line-height: 1.8;
      }
      .icon-large {
        font-size: 64px;
        text-align: center;
        margin: 20px 0;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #1a1a1a;
      }
      .message {
        font-size: 16px;
        color: #555555;
        margin-bottom: 30px;
      }
      .button-container {
        text-align: center;
        margin: 40px 0;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        color: white !important;
        text-decoration: none;
        padding: 16px 48px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
      }
      .expiry {
        text-align: center;
        font-size: 14px;
        color: #888888;
        margin: 20px 0;
      }
      .note {
        background-color: #fff7ed;
        border-right: 4px solid #f97316;
        padding: 16px 20px;
        margin: 30px 0;
        border-radius: 8px;
        font-size: 14px;
        color: #7c2d12;
      }
      .footer {
        background-color: #1a1a1a;
        color: #999999;
        padding: 30px;
        text-align: center;
        font-size: 13px;
      }
      .footer-brand {
        color: #ffffff;
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">C</div>
        <h1 class="header-title">ClinicALL</h1>
      </div>

      <div class="content">
        <div class="icon-large">🔐</div>

        <div class="greeting">התחברות מאובטחת</div>

        <div class="message">קיבלנו בקשה להתחברות לחשבון ClinicALL שלך.</div>

        <div class="message">
          לחץ על הכפתור הבא להתחברות מיידית ומאובטחת ללא צורך בסיסמה:
        </div>

        <div class="button-container">
          <a href="{{ .ConfirmationURL }}" class="button">התחבר עכשיו</a>
        </div>

        <div class="expiry">⏱ קישור זה תקף ל-15 דקות בלבד</div>

        <div class="note">
          <strong>⚠️ לא ביקשת להתחבר?</strong><br />
          אם לא ניסית להתחבר לחשבון שלך, התעלם מהודעה זו. החשבון שלך מאובטח.
        </div>

        <div
          class="message"
          style="font-size: 14px; color: #888888; margin-top: 30px;"
        >
          אם הכפתור לא עובד, העתק והדבק את הקישור הבא:<br />
          <a
            href="{{ .ConfirmationURL }}"
            style="color: #0D9488; word-break: break-all;"
            >{{ .ConfirmationURL }}</a
          >
        </div>
      </div>

      <div class="footer">
        <div class="footer-brand">ClinicALL</div>
        <div>מערכת הניהול המתקדמת לקליניקות אסתטיות</div>
        <div style="margin-top: 16px;">
          © 2025 ClinicALL. כל הזכויות שמורות.
        </div>
      </div>
    </div>
  </body>
</html>
```

---

## 4. Invite User (Team Invitation)

**Subject**: `הוזמנת להצטרף ל-ClinicALL`

**Body**:

```html
<!DOCTYPE html>
<html dir="rtl" lang="he">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica,
          Arial, sans-serif;
        background-color: #f8f8f8;
        direction: rtl;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }
      .header {
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        padding: 40px 20px;
        text-align: center;
      }
      .logo {
        width: 60px;
        height: 60px;
        background-color: white;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: bold;
        color: #0d9488;
        margin-bottom: 16px;
      }
      .header-title {
        color: white;
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      }
      .content {
        padding: 40px 30px;
        color: #333333;
        line-height: 1.8;
      }
      .icon-large {
        font-size: 64px;
        text-align: center;
        margin: 20px 0;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #1a1a1a;
      }
      .message {
        font-size: 16px;
        color: #555555;
        margin-bottom: 30px;
      }
      .invitation-box {
        background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
        border-radius: 12px;
        padding: 24px;
        margin: 30px 0;
        text-align: center;
      }
      .invitation-from {
        font-size: 14px;
        color: #0f766e;
        margin-bottom: 8px;
      }
      .invitation-org {
        font-size: 20px;
        font-weight: bold;
        color: #0d9488;
      }
      .button-container {
        text-align: center;
        margin: 40px 0;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        color: white !important;
        text-decoration: none;
        padding: 16px 48px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
      }
      .footer {
        background-color: #1a1a1a;
        color: #999999;
        padding: 30px;
        text-align: center;
        font-size: 13px;
      }
      .footer-brand {
        color: #ffffff;
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">C</div>
        <h1 class="header-title">ClinicALL</h1>
      </div>

      <div class="content">
        <div class="icon-large">💼</div>

        <div class="greeting">הוזמנת להצטרף!</div>

        <div class="message">
          קיבלת הזמנה להצטרף כחבר צוות במערכת ניהול הקליניקה.
        </div>

        <div class="invitation-box">
          <div class="invitation-from">הזמנה מ:</div>
          <div class="invitation-org">{{ .Data.clinic_name }}</div>
        </div>

        <div class="message">
          לחץ על הכפתור הבא כדי לקבל את ההזמנה ולהצטרף לצוות:
        </div>

        <div class="button-container">
          <a href="{{ .ConfirmationURL }}" class="button">קבל הזמנה</a>
        </div>

        <div
          class="message"
          style="font-size: 14px; color: #888888; background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 30px;"
        >
          💡 <strong>מה הלאה?</strong><br />
          לאחר קבלת ההזמנה, תוכל ליצור סיסמה ולהתחיל לעבוד עם המערכת.
        </div>

        <div
          class="message"
          style="font-size: 14px; color: #888888; margin-top: 30px;"
        >
          אם הכפתור לא עובד, העתק והדבק את הקישור הבא:<br />
          <a
            href="{{ .ConfirmationURL }}"
            style="color: #0D9488; word-break: break-all;"
            >{{ .ConfirmationURL }}</a
          >
        </div>
      </div>

      <div class="footer">
        <div class="footer-brand">ClinicALL</div>
        <div>מערכת הניהול המתקדמת לקליניקות אסתטיות</div>
        <div style="margin-top: 16px;">
          © 2025 ClinicALL. כל הזכויות שמורות.
        </div>
      </div>
    </div>
  </body>
</html>
```

---

## 5. Change Email Address

**Subject**: `אישור שינוי כתובת אימייל - ClinicALL`

**Body**:

```html
<!DOCTYPE html>
<html dir="rtl" lang="he">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica,
          Arial, sans-serif;
        background-color: #f8f8f8;
        direction: rtl;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }
      .header {
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        padding: 40px 20px;
        text-align: center;
      }
      .logo {
        width: 60px;
        height: 60px;
        background-color: white;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: bold;
        color: #0d9488;
        margin-bottom: 16px;
      }
      .header-title {
        color: white;
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      }
      .content {
        padding: 40px 30px;
        color: #333333;
        line-height: 1.8;
      }
      .icon-large {
        font-size: 64px;
        text-align: center;
        margin: 20px 0;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #1a1a1a;
      }
      .message {
        font-size: 16px;
        color: #555555;
        margin-bottom: 30px;
      }
      .button-container {
        text-align: center;
        margin: 40px 0;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        color: white !important;
        text-decoration: none;
        padding: 16px 48px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
      }
      .note {
        background-color: #fff7ed;
        border-right: 4px solid #f97316;
        padding: 16px 20px;
        margin: 30px 0;
        border-radius: 8px;
        font-size: 14px;
        color: #7c2d12;
      }
      .footer {
        background-color: #1a1a1a;
        color: #999999;
        padding: 30px;
        text-align: center;
        font-size: 13px;
      }
      .footer-brand {
        color: #ffffff;
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">C</div>
        <h1 class="header-title">ClinicALL</h1>
      </div>

      <div class="content">
        <div class="icon-large">📧</div>

        <div class="greeting">אישור שינוי כתובת אימייל</div>

        <div class="message">
          קיבלנו בקשה לשנות את כתובת האימייל של חשבון ClinicALL שלך.
        </div>

        <div class="message">
          לחץ על הכפתור הבא כדי לאשר את כתובת האימייל החדשה:
        </div>

        <div class="button-container">
          <a href="{{ .ConfirmationURL }}" class="button">אשר שינוי</a>
        </div>

        <div class="note">
          <strong>⚠️ לא ביקשת לשנות?</strong><br />
          אם לא ביקשת לשנות את כתובת האימייל, התעלם מהודעה זו או צור קשר עם
          התמיכה.
        </div>

        <div
          class="message"
          style="font-size: 14px; color: #888888; margin-top: 30px;"
        >
          אם הכפתור לא עובד, העתק והדבק את הקישור הבא:<br />
          <a
            href="{{ .ConfirmationURL }}"
            style="color: #0D9488; word-break: break-all;"
            >{{ .ConfirmationURL }}</a
          >
        </div>
      </div>

      <div class="footer">
        <div class="footer-brand">ClinicALL</div>
        <div>מערכת הניהול המתקדמת לקליניקות אסתטיות</div>
        <div style="margin-top: 16px;">
          © 2025 ClinicALL. כל הזכויות שמורות.
        </div>
      </div>
    </div>
  </body>
</html>
```

---

## How to Apply These Templates

### Step 1: Go to Supabase Dashboard

https://supabase.com/dashboard/project/ggrgdkggmpzzkoqawasn/auth/templates

### Step 2: Update Each Template

For each email type (Reset password, Confirm signup, etc.):

1. Click on the template name
2. Update the **Subject** field
3. Replace the **Body** with the HTML code above
4. Click **Save changes**

### Step 3: Preview

Use the **Preview** tab to see how the email looks before saving.

---

## Features of These Templates

✅ **Professional Design**: Modern, clean, medical-grade aesthetics
✅ **Fully Branded**: ClinicALL logo, colors (#0D9488), and messaging
✅ **RTL Support**: Proper Hebrew right-to-left layout
✅ **Mobile Responsive**: Works perfectly on all devices
✅ **Security Warnings**: Clear warnings about suspicious activity
✅ **Accessibility**: High contrast, readable fonts
✅ **Fallback Links**: If button doesn't work, plain URL provided
✅ **Consistent Footer**: Brand identity maintained throughout

---

## Customization Tips

### Change Brand Color

Replace `#0D9488` with your desired color throughout the templates.

### Add Logo Image

Replace the `<div class="logo">C</div>` with:

```html
<img
  src="https://yourdomain.com/logo.png"
  alt="ClinicALL"
  style="width: 60px; height: 60px; border-radius: 16px;"
/>
```

### Add Social Links

Add to footer:

```html
<div style="margin-top: 20px;">
  <a
    href="https://facebook.com/yourpage"
    style="color: #0D9488; margin: 0 10px;"
    >Facebook</a
  >
  <a
    href="https://instagram.com/yourpage"
    style="color: #0D9488; margin: 0 10px;"
    >Instagram</a
  >
</div>
```

---

## Testing

After applying templates:

1. Test each email flow
2. Check spam folder
3. Test on multiple email clients (Gmail, Outlook, Apple Mail)
4. Test on mobile devices
5. Verify all links work correctly

---

Enjoy your beautiful, professional email templates! 🎉
