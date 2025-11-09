# MostlyMyelinated - Feature Testing Guide

This guide provides step-by-step instructions for testing all the MVP features.

## Setup

1. Start the development servers:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

2. Open browser to `http://localhost:5173`

---

## 1. Card Preview/Edit Feature

### Testing Steps

1. **Create a Node**
   - Click "New Node"
   - Name: "Neural Development"
   - Summary: "Early nervous system formation"
   - Click "Create"

2. **Add a Fact with Card Preview**
   - In the Quick Add bar, enter:
     - Statement: "Neural tube = forms from neural plate via neurulation"
     - Type: "definition"
   - Click "Add Fact"

3. **Preview Modal Should Open**
   - You should see a modal titled "Preview & Edit Cards"
   - Should display the original fact statement
   - Should show 3 generated cards (typical for definition type)

4. **Test Card Editing**
   - Click the edit icon (pencil) on the first card
   - Modify the front: "What structure forms from the neural plate?"
   - Modify the back: "Neural tube (via neurulation)"
   - Click "Save"

5. **Test Card Deletion**
   - Click the delete icon (trash) on the second card
   - Card should be removed from preview

6. **Test Add Card**
   - Click "Add Card"
   - New editable card should appear
   - Fill in custom front and back
   - Click "Save"

7. **Save Cards**
   - Click "Save X Cards" button
   - Modal should close
   - Node should reload showing the fact with cards generated

8. **Test Cancel/Close**
   - Add another fact
   - When preview modal opens, click "Cancel" or "X"
   - Fact should be deleted (not saved without cards)

### Expected Results
- ✓ Preview modal opens after adding fact
- ✓ Can edit card front, back, hint, and type
- ✓ Can delete cards from preview
- ✓ Can add custom cards
- ✓ Saving creates cards in database
- ✓ Canceling deletes the fact

---

## 2. Image Upload Feature

### Testing Steps

1. **Navigate to a Node**
   - Open any node detail page

2. **Expand Images Section**
   - Click "Images (0) ▶" to expand

3. **Test Drag and Drop Upload**
   - Find an image file on your computer (JPEG, PNG, GIF, or WebP)
   - Drag it onto the upload area
   - Should show "Uploading..." briefly
   - Image should appear in the gallery below

4. **Test Click to Upload**
   - Click the upload area
   - File picker should open
   - Select an image
   - Image uploads and appears in gallery

5. **Test File Validation**
   - Try uploading a non-image file (PDF, TXT)
   - Should show error: "Please select an image file"
   - Try uploading a very large file (>10MB)
   - Should show error about file size

6. **Test Image Display**
   - Uploaded images should show:
     - Thumbnail preview
     - Filename
     - Image type badge
     - Hover effects showing edit/delete buttons

7. **Test Image Deletion**
   - Hover over an image
   - Click the red delete button (X icon)
   - Confirm deletion
   - Image should be removed

### Expected Results
- ✓ Drag and drop upload works
- ✓ Click upload works
- ✓ File validation prevents invalid files
- ✓ Images display correctly in gallery
- ✓ Can delete images
- ✓ Images persist on page reload

---

## 3. Image Annotation Feature

### Testing Steps

1. **Open Annotation Tool**
   - Upload an image (if you haven't already)
   - Hover over the image
   - Click the blue edit button (pencil icon)
   - Full-screen annotation interface should open

2. **Test Arrow Tool**
   - Select arrow tool (should be selected by default)
   - Click and drag on the image to draw an arrow
   - Arrow should appear with arrowhead pointing to end
   - Try drawing multiple arrows

3. **Test Highlight Tool**
   - Click the highlighter icon
   - Click and drag to create a rectangular highlight
   - Should be semi-transparent
   - Try different colors

4. **Test Text Tool**
   - Click the "T" (text) icon
   - Click on the image
   - Text input modal should appear
   - Enter text: "Important region"
   - Click "Add"
   - Text should appear on image

5. **Test Color Selection**
   - Select different colors (red, green, blue, yellow, magenta)
   - Draw arrows/highlights in each color
   - Colors should be clearly visible

6. **Test Undo**
   - Add several annotations
   - Click "Undo" button
   - Last annotation should be removed
   - Click multiple times to undo more

7. **Test Download**
   - Click "Download" button
   - Annotated image should download to your computer

8. **Test Save**
   - Click "Save" button
   - Should close annotation interface
   - New annotated image should appear in gallery
   - Image type should show "annotated"

9. **Test Close**
   - Open annotation again
   - Click "X" to close without saving
   - Should close and not save changes

### Expected Results
- ✓ Annotation interface opens in full-screen
- ✓ Arrow tool draws arrows with proper heads
- ✓ Highlight tool creates semi-transparent rectangles
- ✓ Text tool allows adding text annotations
- ✓ Colors work correctly
- ✓ Undo removes last annotation
- ✓ Download saves annotated image locally
- ✓ Save creates new annotated version
- ✓ Close without saving works

---

## 4. PWA Functionality

### Testing Steps - Desktop

1. **Check PWA Manifest**
   - Open browser DevTools (F12)
   - Go to Application tab (Chrome) or Storage tab (Firefox)
   - Click "Manifest" in sidebar
   - Should show MostlyMyelinated manifest with:
     - Name: "MostlyMyelinated"
     - Theme color: #3b82f6
     - Icon

2. **Install PWA (Desktop)**
   - Chrome: Look for install icon in address bar
   - Click to install
   - App should open in standalone window

3. **Test Service Worker**
   - In DevTools → Application → Service Workers
   - Should show service-worker.js registered
   - Status should be "activated and running"

4. **Test Offline (Basic)**
   - With app loaded, go to DevTools → Network
   - Check "Offline" checkbox
   - Reload page
   - Should still load (from cache)
   - Note: API calls will fail gracefully

### Testing Steps - Mobile

1. **Open on Mobile Device**
   - Deploy to Railway or use local network IP
   - Open in mobile browser (Safari/Chrome)

2. **Test Responsive Layout**
   - All pages should be readable and usable
   - Buttons should be easily tappable (44px minimum)
   - No horizontal scrolling
   - Forms should be easy to use

3. **Install PWA (iOS)**
   - Safari: Tap share button
   - Tap "Add to Home Screen"
   - Name it, tap "Add"
   - Icon should appear on home screen
   - Tap icon - should open in full-screen mode

4. **Install PWA (Android)**
   - Chrome: Look for "Install app" prompt
   - Or: Menu → "Install app" / "Add to Home screen"
   - Follow prompts
   - Icon appears on home screen
   - Opens in standalone mode

5. **Test Touch Interactions**
   - Tap buttons (should have no delay)
   - Drag images for upload
   - Pinch to zoom (should work on images)
   - Swipe gestures (should work naturally)

### Expected Results
- ✓ Manifest loads correctly
- ✓ Service worker registers and activates
- ✓ Can install as PWA on desktop
- ✓ Can install as PWA on mobile (iOS/Android)
- ✓ Runs in standalone mode when installed
- ✓ Basic offline support (cached pages load)
- ✓ Responsive layout on all screen sizes
- ✓ Touch targets are appropriately sized

---

## 5. End-to-End Workflow Test

Complete workflow to ensure all features work together:

### Scenario: Study Neuroanatomy

1. **Create Account**
   - Register new user
   - Log in

2. **Create Knowledge Structure**
   - Create node: "Cranial Nerves"
   - Add child node: "CN I - Olfactory"

3. **Add Visual Content**
   - Navigate to "CN I - Olfactory" node
   - Upload diagram of olfactory pathway
   - Annotate image:
     - Arrow pointing to olfactory bulb
     - Highlight the cribriform plate
     - Text label: "Axons pass through cribriform plate"
   - Save annotated image

4. **Create Facts and Cards**
   - Add fact: "CN I = olfactory nerve, sensory for smell"
   - Preview cards
   - Edit one card to be more specific
   - Save cards

5. **Study Session**
   - Navigate to Study page
   - Review cards
   - Rate cards (Again/Hard/Good/Easy)
   - Complete session

6. **Verify Learning Progress**
   - Go back to Dashboard
   - Check node strength updated
   - Verify cards have new due dates

### Expected Results
- ✓ Complete workflow executes without errors
- ✓ Data persists across pages
- ✓ Images display in context
- ✓ Cards generate correctly
- ✓ Study session tracks progress
- ✓ FSRS algorithm updates due dates

---

## Common Issues and Solutions

### Issue: Images not uploading
- Check file size (<10MB)
- Check file type (JPEG, PNG, GIF, WebP only)
- Check browser console for errors
- Check backend logs for upload errors

### Issue: Service worker not registering
- Check browser console for errors
- Ensure HTTPS or localhost
- Clear browser cache and reload
- Check that service-worker.js exists in public folder

### Issue: Cards not previewing
- Check browser console for errors
- Verify backend is running
- Check that fact was created (check Network tab)
- Verify preview-cards endpoint is accessible

### Issue: Annotation not working
- Check browser console for errors
- Verify image URL is valid
- Check that canvas is rendering
- Try in different browser

### Issue: Mobile responsive issues
- Test in actual mobile devices, not just DevTools
- Check viewport meta tag is set
- Verify CSS uses responsive units (rem, %, vh/vw)
- Check touch targets are at least 44px

---

## Automated Testing (Future)

For production, consider adding:

1. **Unit Tests**
   - Jest for React components
   - Jest for backend functions

2. **Integration Tests**
   - API endpoint testing
   - Database operations

3. **E2E Tests**
   - Playwright or Cypress
   - Test complete workflows

4. **Performance Testing**
   - Lighthouse CI
   - Core Web Vitals
   - Image optimization

---

## Reporting Issues

When reporting issues, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/device information
- Screenshots/videos
- Console errors
- Network tab information