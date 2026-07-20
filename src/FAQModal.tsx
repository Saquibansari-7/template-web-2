import { useState } from 'react';
import './FAQModal.css';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'What should I wear?',
    answer: 'Dress code is cocktail attire — think dressy but comfortable. We\'re going for elevated casual. No jeans, but you know what looks good on you. Wear colors! The venue is beautiful but we want you to feel like you.',
  },
  {
    question: 'Are dogs allowed?',
    answer: 'Yes! If you have a furry friend, we\'d love to have them celebrate with us (space permitting). Just let us know in your RSVP so we can plan accordingly and make sure they\'re comfortable.',
  },
  {
    question: 'Where should I stay?',
    answer: 'San Francisco has tons of options. We\'re recommending the SOMA and Mission Bay areas — both are 15-20 minutes from the venue. The Four Seasons is beautiful if you\'re splurging, or try the Pod Hotel for something more budget-friendly.',
  },
  {
    question: 'Is there a late-night taco bar?',
    answer: 'Yes! There absolutely is. After the main reception, we\'re heading to a secret late-night taco spot that\'s only open for our guests. Bring your appetite and your dancing shoes. More details in your welcome packet.',
  },
  {
    question: 'Can I bring a plus one?',
    answer: 'Your invitation will specify. If there\'s a plus-one line on your card, you\'re golden. If not, we\'d love to celebrate with you solo (or with your family if they\'re invited).',
  },
  {
    question: 'What time should I arrive?',
    answer: 'Doors open at 4:00 PM for cocktails. Ceremony starts at 5:00 PM sharp. We\'d love to see you early to settle in, have a drink, and soak in the vibe.',
  },
  {
    question: 'Is there parking?',
    answer: 'Yes! Valet parking is complimentary for all guests. Just pull up to the entrance and our team will take care of it.',
  },
  {
    question: 'What about dietary restrictions?',
    answer: 'Let us know on your RSVP! We\'re accommodating vegetarian, vegan, gluten-free, and allergy-friendly meals. Just be specific so our caterer can do it right.',
  },
];

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (!isOpen) return null;

  return (
    <div className="faq-modal-overlay" onClick={onClose}>
      <div className="faq-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="faq-modal-close" onClick={onClose}>×</button>
        
        <h2 className="faq-modal-title">You've Got Questions...</h2>
        <p className="faq-modal-subtitle">We've answered all the big ones — and the weird ones.</p>

        <div className="faq-modal-list">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`faq-modal-item ${expandedIndex === index ? 'expanded' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-modal-question">
                <h3>{item.question}</h3>
                <span className="faq-modal-toggle">
                  {expandedIndex === index ? '−' : '+'}
                </span>
              </div>
              {expandedIndex === index && (
                <div className="faq-modal-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FAQModal;
