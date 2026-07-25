# Wedding Website Admin Panel Guide

## Accessing the Admin Panel

### Method 1: Click the Settings Button
A **⚙️ settings button** appears in the bottom-right corner of the website. Click it to access the admin panel login screen.

### Method 2: Direct URL
Type `/admin` in the address bar to access the admin panel login screen.

### Method 3: Keyboard Shortcut
Press `Ctrl+Shift+A` on any page to trigger admin mode.

## Login Credentials

**Default Password:** `admin2026`

> ⚠️ **Security Note:** Change this password in the code (`src/AdminLogin.tsx`) before deploying to production!

## Features

### 1. **Text Editing**
Edit all text content across the website:
- Hero section (title, date, location)
- Story section (heading, paragraphs)
- Ceremony details (date, time, place)
- Travel information
- Registry section
- Footer content

### 2. **Image Management**
Upload and manage images for:
- Hero image
- Couple photos
- Story images

Simply click the file upload button and select an image from your computer. The image will be converted to base64 and stored in your browser.

### 3. **Section Toggles**
Show or hide entire sections with a single click:
- ✅ Hero section
- ✅ Intro section
- ✅ Ceremony
- ✅ Story
- ✅ FAQ
- ✅ Travel
- ✅ Registry
- ✅ Footer

Hidden sections won't appear on the website at all.

### 4. **RSVP Settings**
Configure WhatsApp RSVP:
- **Phone Number:** Enter the WhatsApp phone number where RSVPs should be sent (format: +1234567890)
- **Enable WhatsApp:** Toggle WhatsApp RSVP feature on/off

## How to Use

1. **Click the Settings Button** (⚙️) in the bottom-right corner
2. **Login** with password: `admin2026`
3. **Select a Section** from the tabs at the top (Hero, Intro, Ceremony, etc.)
4. **Edit Content:**
   - For text: Click the input field and type
   - For images: Click "Choose File" to upload a new image
   - For sections: Check/uncheck the "Show this section" option
5. **Save Changes** by clicking the "Save Changes" button at the bottom

All changes are automatically saved to your browser's local storage and will persist across sessions.

## Section Editing Details

### Hero Section
- **Title:** Main wedding title (appears with decorative capital letters)
- **Date:** Wedding date and time
- **Place:** Venue name and location
- **Image:** Hero background photo

### Intro Section
- **Eyebrow:** Small label above the heading
- **Heading:** Main intro heading
- **Paragraphs:** Two paragraphs about the couple
- **Signature:** Signed by names
- **Image:** Couple photo

### Ceremony Section
- **Date:** October 26, 2026 (customizable)
- **Time:** 5:00 PM sharp (customizable)
- **Place:** Venue details

### Story Section
- **Eyebrow:** "our story"
- **Heading:** Story title
- **Paragraphs:** Two detailed paragraphs
- **Signature:** Ending with date met
- **Image:** Story photo

### FAQ Section
- **Heading:** Section title
- **Paragraph:** Introduction text
- (Individual FAQ questions are managed in the FAQ modal component)

### Travel Section
- **Eyebrow:** Section category label
- **Heading:** Main title
- **Paragraph:** Introduction to travel tips

### Registry Section
- **Eyebrow:** Section label
- **Heading:** Main message
- **Paragraph:** Registry policy/message

### Footer Section
- **Heading:** Large closing message
- **Hashtag:** Social media hashtag
- **Copyright:** Copyright/credit text

### RSVP Settings
- **Phone Number:** WhatsApp number to receive RSVPs (must be in international format)
- **Enable WhatsApp:** Toggle to enable/disable WhatsApp integration

## Data Storage

All content is stored in your browser's **Local Storage**:
- `weddingContent` - All text and images
- `weddingSections` - Section visibility toggles
- `adminAuthenticated` - Login session state
- `weddingSections` - Which sections are visible

### Important Notes:
- Data is only stored in this browser/device
- Clearing browser data will reset to defaults
- To backup your content, export the localStorage data
- To share settings across devices, you'll need a server backend

## Exporting Your Content

To backup your content, open your browser's Developer Tools (F12) and run:

```javascript
console.save = function(data, filename){
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}

// Export content
console.save({
  content: JSON.parse(localStorage.getItem('weddingContent')),
  sections: JSON.parse(localStorage.getItem('weddingSections'))
}, 'wedding-backup.json');
```

## Logging Out

Click the **"Logout"** button in the top-right corner of the admin panel to exit and return to the website view.

## Password Reset

To change the admin password:
1. Open `src/AdminLogin.tsx`
2. Find: `if (password === 'admin2026')`
3. Change `'admin2026'` to your new password
4. Rebuild the project

## Troubleshooting

### Changes not appearing on website?
- Click "Save Changes" button
- Refresh the page (Ctrl+R or Cmd+R)
- Check that section visibility is enabled

### Images not uploading?
- Ensure the image file is smaller than a few MB
- Try a different image format (JPG, PNG, WebP)
- Check browser console (F12) for errors

### Lost access to admin panel?
- Clear browser cache/cookies for this site
- Check that localStorage wasn't cleared
- Try accessing from incognito/private mode

### Mobile number not working for RSVP?
- Ensure it's in international format: +1 (country code) (phone number)
- For US: +1234567890
- For other countries, include proper country code

## Advanced: Connecting to a Backend

For production use with multiple editors across devices, consider:
1. Creating an API endpoint to save/load content
2. Using a database (Firebase, MongoDB, etc.)
3. Implementing proper user authentication
4. Setting up a content delivery system for images

## Questions?

If you have issues with the admin panel, check:
- Browser console for error messages (F12 → Console)
- Local storage contents (F12 → Application → Local Storage)
- That JavaScript is enabled in your browser
