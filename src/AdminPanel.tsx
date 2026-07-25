import { useState } from 'react';
import { useWebsiteContext } from './context/WebsiteContext';
import { syncContentToDOM } from './utils/contentSync';
import { uploadImage } from './services/uploadImage';
import './AdminPanel.css';

function AdminPanel() {
  const { content, sections, updateContent, updateNestedContent, updateSection, saveContent: saveContentToSupabase } = useWebsiteContext();
  const siteId = new URLSearchParams(window.location.search).get('site') || 'default';
  const [activeTab, setActiveTab] = useState('hero');
  const [imagePreview, setImagePreview] = useState<{ [key: string]: string }>({});

  const handleImageUpload = async (section: string, field: string, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;

      try {
        let publicUrl = '';
        if (siteId) {
          try {
            publicUrl = await uploadImage(siteId, file);
          } catch (err) {
            console.error('Supabase image upload failed:', err);
          }
        }

        setImagePreview((prev) => ({ ...prev, [`${section}-${field}`]: base64 }));

        if (field.includes('.')) {
          updateNestedContent(section as keyof typeof content, field, publicUrl || base64);
        } else {
          updateContent(section as keyof typeof content, field, publicUrl || base64);
        }
      } catch (error) {
        console.error('Error saving image:', error);
        alert('Error saving image. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await saveContentToSupabase(siteId);
      syncContentToDOM(content);
      alert('Changes saved and applied to the website!');
    } catch (error) {
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
            <div className="admin-field">
              <label>Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload('faq', 'image', e.target.files[0])}
              />
              {(imagePreview['faq-image'] || (content.faq.image && (content.faq.image.startsWith('data:image') || content.faq.image.startsWith('db:')))) && (
                <img src={imagePreview['faq-image'] || (content.faq.image.startsWith('data:image') ? content.faq.image : '')} alt="FAQ" className="admin-preview" />
              )}
            </div>

            <div className="admin-field">
              <label>FAQ Items</label>
              {(content.faq.items || []).map((item, index) => (
                <div key={index} className="admin-faq-item">
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => {
                      const newItems = [...(content.faq.items || [])];
                      newItems[index] = { ...newItems[index], question: e.target.value };
                      updateContent('faq', 'items', newItems);
                    }}
                    placeholder="Question"
                  />
                  <textarea
                    value={item.answer}
                    onChange={(e) => {
                      const newItems = [...(content.faq.items || [])];
                      newItems[index] = { ...newItems[index], answer: e.target.value };
                      updateContent('faq', 'items', newItems);
                    }}
                    placeholder="Answer"
                    rows={3}
                  />
                  <button className="admin-remove-btn" onClick={() => {
                    const newItems = (content.faq.items || []).filter((_, i) => i !== index);
                    updateContent('faq', 'items', newItems);
                  }}>Remove</button>
                </div>
              ))}
              <button className="admin-add-btn" onClick={() => {
                const newItems = [...(content.faq.items || []), { question: '', answer: '' }];
                updateContent('faq', 'items', newItems);
              }}>Add FAQ Item</button>
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

            <div className="admin-field">
              <label>Travel Cards</label>
              {(content.travel.cards || []).map((card, index) => (
                <div key={index} className="admin-travel-card">
                  <input
                    type="text"
                    value={card.tag}
                    onChange={(e) => {
                      const newCards = [...(content.travel.cards || [])];
                      newCards[index] = { ...newCards[index], tag: e.target.value };
                      updateContent('travel', 'cards', newCards);
                    }}
                    placeholder="Tag (e.g. getting there)"
                  />
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => {
                      const newCards = [...(content.travel.cards || [])];
                      newCards[index] = { ...newCards[index], title: e.target.value };
                      updateContent('travel', 'cards', newCards);
                    }}
                    placeholder="Title"
                  />
                  <textarea
                    value={card.paragraph}
                    onChange={(e) => {
                      const newCards = [...(content.travel.cards || [])];
                      newCards[index] = { ...newCards[index], paragraph: e.target.value };
                      updateContent('travel', 'cards', newCards);
                    }}
                    placeholder="Paragraph"
                    rows={3}
                  />
                  <div className="admin-field">
                    <label>Card Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload('travel', `cards.${index}.image`, e.target.files[0])}
                    />
                    {(imagePreview[`travel-cards.${index}.image`] || (card.image && (card.image.startsWith('data:image') || card.image.startsWith('db:')))) && (
                      <img src={imagePreview[`travel-cards.${index}.image`] || (card.image.startsWith('data:image') ? card.image : '')} alt={`Travel card ${index + 1}`} className="admin-preview" />
                    )}
                  </div>
                  <button className="admin-remove-btn" onClick={() => {
                    const newCards = (content.travel.cards || []).filter((_, i) => i !== index);
                    updateContent('travel', 'cards', newCards);
                  }}>Remove Card</button>
                </div>
              ))}
              <button className="admin-add-btn" onClick={() => {
                const newCards = [...(content.travel.cards || []), { tag: '', title: '', paragraph: '', image: '' }];
                updateContent('travel', 'cards', newCards);
              }}>Add Travel Card</button>
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
                onChange={(e) => updateContent('rsvp', 'enableWhatsApp', e.target.checked)}
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
        <p className="admin-save-note">Changes are saved and applied immediately to the website</p>
      </div>
    </div>
  );
}

export default AdminPanel;