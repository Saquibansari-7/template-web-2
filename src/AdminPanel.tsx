import { useState, useEffect } from 'react';
import { useWebsiteContext } from './context/WebsiteContext';
import { syncContentToDOM, saveImageToDB, loadImageFromDB } from './utils/contentSync';
import { saveContent } from './services/saveContent';
import { uploadImage } from './services/uploadImage';
import './AdminPanel.css';

function AdminPanel() {
  const { content, sections, updateContent, updateSection, saveToLocalStorage } = useWebsiteContext();
  const siteId = new URLSearchParams(window.location.search).get('site');
  const [activeTab, setActiveTab] = useState('hero');
  const [imagePreview, setImagePreview] = useState<{ [key: string]: string }>({});
  const [tempImages, setTempImages] = useState<{ [key: string]: string }>({});

  // Load saved images on mount
  useEffect(() => {
    const loadSavedImages = async () => {
      const savedContent = localStorage.getItem('weddingContent');
      if (savedContent) {
        try {
          const parsed = JSON.parse(savedContent);
          // Extract image references from saved content and load from IndexedDB
          const savedImages: { [key: string]: string } = {};

          for (const [section, sectionData] of Object.entries(parsed as any)) {
            if (sectionData && typeof sectionData === 'object') {
              for (const [field, value] of Object.entries(sectionData)) {
                if (field === 'image' && typeof value === 'string' && value.startsWith('db:')) {
                  const imageKey = value.slice(3); // Remove 'db:' prefix
                  const imageData = await loadImageFromDB(imageKey);
                  if (imageData) {
                    savedImages[imageKey] = imageData;
                  }
                }
              }
            }
          }

          setTempImages(savedImages);
          setImagePreview(savedImages);
        } catch (e) {
          console.error('Error loading saved images:', e);
        }
      }
    };

    loadSavedImages();
  }, []);

  const handleImageUpload = async (section: string, field: string, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;

      try {
        // Save image to IndexedDB for persistence (existing behavior)
        const imageKey = `${section}-${field}`;
        await saveImageToDB(imageKey, base64);

        // Upload image to Supabase Storage (Step 8)
        let publicUrl = '';
        if (siteId) {
          try {
            publicUrl = await uploadImage(siteId, file);
          } catch (err) {
            console.error('Supabase image upload failed:', err);
          }
        }

        // Store image for preview and DOM sync
        setTempImages((prev) => ({ ...prev, [imageKey]: base64 }));
        setImagePreview((prev) => ({ ...prev, [imageKey]: base64 }));

        // Store a reference in content (not the actual data)
        // Use the Supabase public URL when available, otherwise the local db reference
        updateContent(section as keyof typeof content, field, publicUrl || `db:${imageKey}`);
      } catch (error) {
        console.error('Error saving image:', error);
        alert('Error saving image. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      console.log('Attempting to save content...');

      // Save to localStorage (text content only, images are in IndexedDB)
      saveToLocalStorage();
      console.log('Successfully saved to localStorage');

      // Sync the saved content to the DOM immediately
      await syncContentToDOM(content, tempImages);
      console.log('Successfully synced content to DOM');

      // Save content to Supabase (Step 5)
      if (siteId) {
        const { error } = await saveContent(siteId, {
          hero: content.hero,
          story: content.story,
          gallery: (content as any).gallery,
          events: (content as any).events,
          venue: content.ceremony,
          family: (content as any).family,
          rsvp: content.rsvp,
          settings: (content as any).settings,
          intro: content.intro,
          faq: content.faq,
          travel: content.travel,
          registry: content.registry,
          footer: content.footer,
          sections,
        });
        if (error) {
          console.error('Supabase save error:', error);
        } else {
          console.log('Successfully saved to Supabase');
        }
      }

      // Show success message
      alert('Changes saved and applied to the website!');
    } catch (error) {
      console.error('Error in handleSave:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error saving changes: ${errorMessage}`);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Website Admin Panel</h1>
        <button className="admin-exit-btn" onClick={() => {
          localStorage.removeItem('adminAuthenticated');
          window.location.reload();
        }}>
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        {['hero', 'intro', 'ceremony', 'story', 'faq', 'travel', 'registry', 'footer', 'rsvp'].map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {/* Section Visibility Toggle */}
        {activeTab !== 'rsvp' && (
          <div className="admin-section">
            <h3>Section Visibility</h3>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={sections[activeTab]?.visible ?? true}
                onChange={(e) => updateSection(activeTab, e.target.checked)}
              />
              <span>Show this section</span>
            </label>
          </div>
        )}

        {/* HERO */}
        {activeTab === 'hero' && (
          <div className="admin-section">
            <h2>Hero Section</h2>
            <div className="admin-field">
              <label>Title</label>
              <input
                type="text"
                value={content.hero.title}
                onChange={(e) => updateContent('hero', 'title', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Date</label>
              <input
                type="text"
                value={content.hero.date}
                onChange={(e) => updateContent('hero', 'date', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Place</label>
              <input
                type="text"
                value={content.hero.place}
                onChange={(e) => updateContent('hero', 'place', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Hero Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload('hero', 'image', e.target.files[0])}
              />
              {(imagePreview['hero-image'] || (content.hero.image && (content.hero.image.startsWith('data:image') || content.hero.image.startsWith('db:')))) && (
                <img src={imagePreview['hero-image'] || (content.hero.image.startsWith('data:image') ? content.hero.image : '')} alt="Hero" className="admin-preview" />
              )}
              {tempImages['hero-image'] && (
                <p className="image-note">✓ Image loaded and will be applied to website</p>
              )}
            </div>
          </div>
        )}

        {/* INTRO */}
        {activeTab === 'intro' && (
          <div className="admin-section">
            <h2>Intro Section</h2>
            <div className="admin-field">
              <label>Eyebrow</label>
              <input
                type="text"
                value={content.intro.eyebrow}
                onChange={(e) => updateContent('intro', 'eyebrow', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Heading</label>
              <input
                type="text"
                value={content.intro.heading}
                onChange={(e) => updateContent('intro', 'heading', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Paragraph 1</label>
              <textarea
                value={content.intro.paragraph1}
                onChange={(e) => updateContent('intro', 'paragraph1', e.target.value)}
                rows={3}
              />
            </div>
            <div className="admin-field">
              <label>Paragraph 2</label>
              <textarea
                value={content.intro.paragraph2}
                onChange={(e) => updateContent('intro', 'paragraph2', e.target.value)}
                rows={3}
              />
            </div>
            <div className="admin-field">
              <label>Signature</label>
              <input
                type="text"
                value={content.intro.signature}
                onChange={(e) => updateContent('intro', 'signature', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload('intro', 'image', e.target.files[0])}
              />
              {(imagePreview['intro-image'] || (content.intro.image && (content.intro.image.startsWith('data:image') || content.intro.image.startsWith('db:')))) && (
                <img src={imagePreview['intro-image'] || (content.intro.image.startsWith('data:image') ? content.intro.image : '')} alt="Intro" className="admin-preview" />
              )}
              {tempImages['intro-image'] && (
                <p className="image-note">✓ Image loaded and will be applied to website</p>
              )}
            </div>
          </div>
        )}

        {/* CEREMONY */}
        {activeTab === 'ceremony' && (
          <div className="admin-section">
            <h2>Ceremony Section</h2>
            <div className="admin-field">
              <label>Date</label>
              <input
                type="text"
                value={content.ceremony.date}
                onChange={(e) => updateContent('ceremony', 'date', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Time</label>
              <input
                type="text"
                value={content.ceremony.time}
                onChange={(e) => updateContent('ceremony', 'time', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Place</label>
              <input
                type="text"
                value={content.ceremony.place}
                onChange={(e) => updateContent('ceremony', 'place', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STORY */}
        {activeTab === 'story' && (
          <div className="admin-section">
            <h2>Story Section</h2>
            <div className="admin-field">
              <label>Eyebrow</label>
              <input
                type="text"
                value={content.story.eyebrow}
                onChange={(e) => updateContent('story', 'eyebrow', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Heading</label>
              <input
                type="text"
                value={content.story.heading}
                onChange={(e) => updateContent('story', 'heading', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Paragraph 1</label>
              <textarea
                value={content.story.paragraph1}
                onChange={(e) => updateContent('story', 'paragraph1', e.target.value)}
                rows={4}
              />
            </div>
            <div className="admin-field">
              <label>Paragraph 2</label>
              <textarea
                value={content.story.paragraph2}
                onChange={(e) => updateContent('story', 'paragraph2', e.target.value)}
                rows={4}
              />
            </div>
            <div className="admin-field">
              <label>Signature</label>
              <input
                type="text"
                value={content.story.signature}
                onChange={(e) => updateContent('story', 'signature', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload('story', 'image', e.target.files[0])}
              />
              {(imagePreview['story-image'] || (content.story.image && (content.story.image.startsWith('data:image') || content.story.image.startsWith('db:')))) && (
                <img src={imagePreview['story-image'] || (content.story.image.startsWith('data:image') ? content.story.image : '')} alt="Story" className="admin-preview" />
              )}
              {tempImages['story-image'] && (
                <p className="image-note">✓ Image loaded and will be applied to website</p>
              )}
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div className="admin-section">
            <h2>FAQ Section</h2>
            <div className="admin-field">
              <label>Heading</label>
              <input
                type="text"
                value={content.faq.heading}
                onChange={(e) => updateContent('faq', 'heading', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Paragraph</label>
              <textarea
                value={content.faq.paragraph}
                onChange={(e) => updateContent('faq', 'paragraph', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}

        {/* TRAVEL */}
        {activeTab === 'travel' && (
          <div className="admin-section">
            <h2>Travel Section</h2>
            <div className="admin-field">
              <label>Eyebrow</label>
              <input
                type="text"
                value={content.travel.eyebrow}
                onChange={(e) => updateContent('travel', 'eyebrow', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Heading</label>
              <input
                type="text"
                value={content.travel.heading}
                onChange={(e) => updateContent('travel', 'heading', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Paragraph</label>
              <textarea
                value={content.travel.paragraph}
                onChange={(e) => updateContent('travel', 'paragraph', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* REGISTRY */}
        {activeTab === 'registry' && (
          <div className="admin-section">
            <h2>Registry Section</h2>
            <div className="admin-field">
              <label>Eyebrow</label>
              <input
                type="text"
                value={content.registry.eyebrow}
                onChange={(e) => updateContent('registry', 'eyebrow', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Heading</label>
              <input
                type="text"
                value={content.registry.heading}
                onChange={(e) => updateContent('registry', 'heading', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Paragraph</label>
              <textarea
                value={content.registry.paragraph}
                onChange={(e) => updateContent('registry', 'paragraph', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* FOOTER */}
        {activeTab === 'footer' && (
          <div className="admin-section">
            <h2>Footer Section</h2>
            <div className="admin-field">
              <label>Heading</label>
              <input
                type="text"
                value={content.footer.heading}
                onChange={(e) => updateContent('footer', 'heading', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Hashtag</label>
              <input
                type="text"
                value={content.footer.hashtag}
                onChange={(e) => updateContent('footer', 'hashtag', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Copyright</label>
              <input
                type="text"
                value={content.footer.copyright}
                onChange={(e) => updateContent('footer', 'copyright', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* RSVP */}
        {activeTab === 'rsvp' && (
          <div className="admin-section">
            <h2>RSVP Settings</h2>
            <div className="admin-field">
              <label>WhatsApp Phone Number</label>
              <input
                type="tel"
                value={content.rsvp.phoneNumber}
                onChange={(e) => updateContent('rsvp', 'phoneNumber', e.target.value)}
                placeholder="+1234567890"
              />
              <small>Format: +1234567890 (include country code)</small>
            </div>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={content.rsvp.enableWhatsApp}
                onChange={(e) => updateContent('rsvp', 'enableWhatsApp', e.target.checked ? 'true' : 'false')}
              />
              <span>Enable WhatsApp RSVP</span>
            </label>
          </div>
        )}
      </div>

      <div className="admin-footer">
        <button className="admin-save-btn" onClick={handleSave}>
          Save Changes
        </button>
        <p className="admin-save-note">Changes are saved to your browser and applied immediately to the website</p>
      </div>
    </div>
  );
}

export default AdminPanel;
