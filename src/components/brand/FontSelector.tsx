
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FontSelectorProps {
  selectedFont: string;
  onSelectFont: (font: string) => void;
}

// Font categories and options
const fontCategories = [
  {
    name: 'Sans Serif',
    fonts: [
      { name: 'Inter', family: "'Inter', sans-serif" },
      { name: 'Roboto', family: "'Roboto', sans-serif" },
      { name: 'Open Sans', family: "'Open Sans', sans-serif" },
      { name: 'Montserrat', family: "'Montserrat', sans-serif" },
      { name: 'Lato', family: "'Lato', sans-serif" },
      { name: 'Poppins', family: "'Poppins', sans-serif" },
    ]
  },
  {
    name: 'Serif',
    fonts: [
      { name: 'Playfair Display', family: "'Playfair Display', serif" },
      { name: 'Merriweather', family: "'Merriweather', serif" },
      { name: 'Lora', family: "'Lora', serif" },
      { name: 'Crimson Text', family: "'Crimson Text', serif" },
      { name: 'Libre Baskerville', family: "'Libre Baskerville', serif" },
    ]
  },
  {
    name: 'Display',
    fonts: [
      { name: 'Bebas Neue', family: "'Bebas Neue', cursive" },
      { name: 'Abril Fatface', family: "'Abril Fatface', cursive" },
      { name: 'Pacifico', family: "'Pacifico', cursive" },
      { name: 'Lobster', family: "'Lobster', cursive" },
    ]
  },
  {
    name: 'Monospace',
    fonts: [
      { name: 'Roboto Mono', family: "'Roboto Mono', monospace" },
      { name: 'Source Code Pro', family: "'Source Code Pro', monospace" },
      { name: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
      { name: 'Fira Code', family: "'Fira Code', monospace" },
    ]
  },
  {
    name: 'Handwriting',
    fonts: [
      { name: 'Dancing Script', family: "'Dancing Script', cursive" },
      { name: 'Caveat', family: "'Caveat', cursive" },
      { name: 'Amatic SC', family: "'Amatic SC', cursive" },
      { name: 'Satisfy', family: "'Satisfy', cursive" },
    ]
  }
];

// Add Google Fonts link
const addGoogleFontsLink = () => {
  const fontsList = fontCategories.flatMap(category => 
    category.fonts.map(font => font.name.replace(' ', '+'))
  );
  
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontsList.join('&family=')}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
};

const FontSelector: React.FC<FontSelectorProps> = ({ selectedFont, onSelectFont }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Load Google fonts
  useEffect(() => {
    addGoogleFontsLink();
  }, []);
  
  // Find the selected font object
  const findSelectedFontFamily = () => {
    for (const category of fontCategories) {
      const font = category.fonts.find(f => f.name === selectedFont);
      if (font) {
        return font.family;
      }
    }
    return "'Inter', sans-serif"; // Default font
  };
  
  const handleCategoryClick = (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="font-selection-preview p-4 rounded-md border border-gray-700 mb-6">
        <h3 className="text-sm text-gray-400 mb-2">Selected Font</h3>
        <div 
          className="text-2xl"
          style={{ fontFamily: findSelectedFontFamily() }}
        >
          {selectedFont || 'Select a font for your brand'}
        </div>
        <div 
          className="text-sm mt-2 text-gray-300"
          style={{ fontFamily: findSelectedFontFamily() }}
        >
          ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
          abcdefghijklmnopqrstuvwxyz<br />
          0123456789
        </div>
      </div>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {fontCategories.map((category) => (
            <div key={category.name} className="font-category">
              <Button
                type="button"
                variant="ghost"
                className="w-full flex justify-between text-left py-2 text-white"
                onClick={() => handleCategoryClick(category.name)}
              >
                <span>{category.name}</span>
                <span>{expandedCategory === category.name ? '−' : '+'}</span>
              </Button>
              
              {expandedCategory === category.name && (
                <div className="pl-2 pt-2 pb-1 space-y-1">
                  {category.fonts.map((font) => (
                    <Button
                      key={font.name}
                      type="button"
                      variant="ghost"
                      className={`w-full text-left justify-start py-2 pl-4 ${selectedFont === font.name ? 'bg-gray-700' : ''}`}
                      onClick={() => onSelectFont(font.name)}
                      style={{ fontFamily: font.family }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {selectedFont === font.name && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        <span className={selectedFont === font.name ? 'ml-0' : 'ml-6'}>
                          {font.name}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FontSelector;
