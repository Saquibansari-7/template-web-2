import { useState } from 'react';
import './FAQModal.css';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: FAQItem[];
}

function FAQModal({ isOpen, onClose, items }: FAQModalProps) {
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
          {items.map((item, index) => (
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
