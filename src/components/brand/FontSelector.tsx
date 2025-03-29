
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface FontSelectorProps {
  selectedFont: string;
  onSelectFont: (font: string) => void;
}

const fontOptions = [
  { 
    name: 'Inter', 
    displayName: 'Inter', 
    category: 'Sans-serif',
    example: 'Modern, clean and professional'
  },
  { 
    name: 'Playfair Display', 
    displayName: 'Playfair', 
    category: 'Serif',
    example: 'Elegant, sophisticated and timeless'
  },
  { 
    name: 'Montserrat', 
    displayName: 'Montserrat', 
    category: 'Sans-serif',
    example: 'Contemporary, geometric and versatile'
  },
  { 
    name: 'Roboto', 
    displayName: 'Roboto', 
    category: 'Sans-serif',
    example: 'Neutral, friendly and approachable'
  },
  { 
    name: 'Merriweather', 
    displayName: 'Merriweather', 
    category: 'Serif',
    example: 'Traditional, reliable and established'
  },
  { 
    name: 'Poppins', 
    displayName: 'Poppins', 
    category: 'Sans-serif',
    example: 'Modern, friendly and geometric'
  },
  { 
    name: 'Lora', 
    displayName: 'Lora', 
    category: 'Serif',
    example: 'Classic, editorial and sophisticated'
  },
  { 
    name: 'Open Sans', 
    displayName: 'Open Sans', 
    category: 'Sans-serif',
    example: 'Friendly, neutral and highly readable'
  }
];

// Add font links to head
const fontLinks = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap',
];

const FontSelector: React.FC<FontSelectorProps> = ({ selectedFont, onSelectFont }) => {
  React.useEffect(() => {
    // Add font links to document head when component mounts
    fontLinks.forEach(link => {
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = link;
      document.head.appendChild(linkElement);
    });
  }, []);

  return (
    <div className="space-y-4">
      <RadioGroup 
        defaultValue={selectedFont} 
        onValueChange={onSelectFont}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {fontOptions.map((font) => (
          <div key={font.name} className="flex items-start space-x-2">
            <RadioGroupItem value={font.name} id={font.name} className="mt-1" />
            <div className="flex-1">
              <Label 
                htmlFor={font.name} 
                className={`text-white block cursor-pointer font-medium mb-1`}
              >
                {font.displayName} <span className="text-gray-400 text-xs">({font.category})</span>
              </Label>
              <p 
                className="text-gray-300 font-semibold text-lg"
                style={{ fontFamily: font.name }}
              >
                {font.displayName}
              </p>
              <p 
                className="text-gray-400 text-sm mt-1"
                style={{ fontFamily: font.name }}
              >
                {font.example}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default FontSelector;
