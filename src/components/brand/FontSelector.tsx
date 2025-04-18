
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface FontSelectorProps {
  selectedFont: string;
  onSelectFont: (font: string) => void;
}

// Expanded font options with more categories and fonts
const fontOptions = {
  'Popular Fonts': [
    { name: 'Inter', displayName: 'Inter', category: 'Sans-serif', example: 'Modern, clean and professional' },
    { name: 'Playfair Display', displayName: 'Playfair', category: 'Serif', example: 'Elegant, sophisticated and timeless' },
    { name: 'Montserrat', displayName: 'Montserrat', category: 'Sans-serif', example: 'Contemporary, geometric and versatile' },
    { name: 'Raleway', displayName: 'Raleway', category: 'Sans-serif', example: 'Modern, minimal and stylish' },
    { name: 'Lato', displayName: 'Lato', category: 'Sans-serif', example: 'Friendly and natural' },
    { name: 'Roboto', displayName: 'Roboto', category: 'Sans-serif', example: 'Neutral, friendly and approachable' },
    { name: 'Open Sans', displayName: 'Open Sans', category: 'Sans-serif', example: 'Friendly, neutral and highly readable' },
  ],
  'Sans Serif': [
    { name: 'Poppins', displayName: 'Poppins', example: 'Modern, friendly and geometric' },
    { name: 'Work Sans', displayName: 'Work Sans', example: 'Clean, minimalist and modern' },
    { name: 'Nunito', displayName: 'Nunito', example: 'Rounded, warm and approachable' },
    { name: 'Quicksand', displayName: 'Quicksand', example: 'Geometric with rounded terminals' },
    { name: 'DM Sans', displayName: 'DM Sans', example: 'Neutral, minimal and versatile' },
    { name: 'Outfit', displayName: 'Outfit', example: 'Modern, clean sans-serif' },
    { name: 'Source Sans Pro', displayName: 'Source Sans Pro', example: 'Clear, legible and versatile' },
    { name: 'Mulish', displayName: 'Mulish', example: 'Minimalist and highly readable' },
    { name: 'Ubuntu', displayName: 'Ubuntu', example: 'Modern, clean industrial feel' },
    { name: 'Josefin Sans', displayName: 'Josefin Sans', example: 'Elegant geometric sans' },
    { name: 'Lexend', displayName: 'Lexend', example: 'Optimized for reading fluency' },
  ],
  'Serif': [
    { name: 'Merriweather', displayName: 'Merriweather', example: 'Traditional, reliable and established' },
    { name: 'Lora', displayName: 'Lora', example: 'Classic, editorial and sophisticated' },
    { name: 'Source Serif Pro', displayName: 'Source Serif', example: 'Refined, classic and readable' },
    { name: 'Crimson Text', displayName: 'Crimson', example: 'Traditional, elegant and literary' },
    { name: 'Libre Baskerville', displayName: 'Libre Baskerville', example: 'Classic, sophisticated and readable' },
    { name: 'Cormorant Garamond', displayName: 'Cormorant', example: 'Elegant, light and delicate' },
    { name: 'Spectral', displayName: 'Spectral', example: 'Modern interpretation of old-style fonts' },
    { name: 'Vollkorn', displayName: 'Vollkorn', example: 'Traditional book typography' },
    { name: 'Petrona', displayName: 'Petrona', example: 'Modern serif with elegant contrast' },
    { name: 'Bitter', displayName: 'Bitter', example: 'Contemporary serif designed for screens' },
    { name: 'Noto Serif', displayName: 'Noto Serif', example: 'Comprehensive, elegant serif' },
  ],
  'Display': [
    { name: 'Abril Fatface', displayName: 'Abril Fatface', example: 'Bold, dramatic and elegant' },
    { name: 'Lobster', displayName: 'Lobster', example: 'Playful, bold and decorative' },
    { name: 'Pacifico', displayName: 'Pacifico', example: 'Friendly, casual and handwritten' },
    { name: 'Comfortaa', displayName: 'Comfortaa', example: 'Modern, geometric and friendly' },
    { name: 'Righteous', displayName: 'Righteous', example: 'Bold, modern and geometric' },
    { name: 'Permanent Marker', displayName: 'Permanent Marker', example: 'Casual, handwritten style' },
    { name: 'Monoton', displayName: 'Monoton', example: 'Decorative, inline style display' },
    { name: 'Cabin Sketch', displayName: 'Cabin Sketch', example: 'Sketchy, hand-drawn quality' },
    { name: 'Russo One', displayName: 'Russo One', example: 'Bold, geometric industrial feel' },
    { name: 'Cinzel', displayName: 'Cinzel', example: 'Elegant, classical Roman capitals' },
    { name: 'Graduate', displayName: 'Graduate', example: 'Collegiate, athletic and bold' },
    { name: 'Bungee', displayName: 'Bungee', example: 'Bold, vertical emphasis display' },
  ],
  'Monospace': [
    { name: 'Fira Code', displayName: 'Fira Code', example: 'Clean, precise and technical' },
    { name: 'Source Code Pro', displayName: 'Source Code', example: 'Clear, structured and technical' },
    { name: 'JetBrains Mono', displayName: 'JetBrains Mono', example: 'Modern, clear and technical' },
    { name: 'Space Mono', displayName: 'Space Mono', example: 'Quirky, distinctive monospaced' },
    { name: 'IBM Plex Mono', displayName: 'IBM Plex Mono', example: 'Clean, corporate monospace' },
    { name: 'Inconsolata', displayName: 'Inconsolata', example: 'Clean, humanist monospace' },
  ],
  'Handwriting': [
    { name: 'Dancing Script', displayName: 'Dancing Script', example: 'Lively, dancing letterforms' },
    { name: 'Great Vibes', displayName: 'Great Vibes', example: 'Elegant calligraphy style' },
    { name: 'Satisfy', displayName: 'Satisfy', example: 'Casual script with a personal touch' },
    { name: 'Sacramento', displayName: 'Sacramento', example: 'Delicate, flowing script' },
    { name: 'Tangerine', displayName: 'Tangerine', example: 'Elegant, fluid calligraphy' },
    { name: 'Kaushan Script', displayName: 'Kaushan Script', example: 'Bold, energetic handwritten' },
    { name: 'Caveat', displayName: 'Caveat', example: 'Casual, friendly handwriting' },
    { name: 'Amatic SC', displayName: 'Amatic SC', example: 'Narrow, tall and casual' },
  ],
  'Slab Serif': [
    { name: 'Roboto Slab', displayName: 'Roboto Slab', example: 'Modern slab with good readability' },
    { name: 'Arvo', displayName: 'Arvo', example: 'Geometric slab serif, sturdy' },
    { name: 'Alfa Slab One', displayName: 'Alfa Slab One', example: 'Heavy, bold display slab' },
    { name: 'Crete Round', displayName: 'Crete Round', example: 'Warm slab serif with rounded details' },
    { name: 'Rockwell', displayName: 'Rockwell', example: 'Classic, sturdy slab serif' },
    { name: 'Zilla Slab', displayName: 'Zilla Slab', example: 'Contemporary slab with warm feel' },
  ],
};

// Extended font links array
const fontLinks = [
  // Popular Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap',
  
  // Sans Serif
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Mulish:wght@400;600;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;700&display=swap',
  
  // Serif
  'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Vollkorn:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Petrona:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Bitter:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap',
  
  // Display
  'https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap',
  'https://fonts.googleapis.com/css2?family=Lobster&display=swap',
  'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
  'https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Righteous&display=swap',
  'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap',
  'https://fonts.googleapis.com/css2?family=Monoton&display=swap',
  'https://fonts.googleapis.com/css2?family=Cabin+Sketch:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Russo+One&display=swap',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Graduate&display=swap',
  'https://fonts.googleapis.com/css2?family=Bungee&display=swap',
  
  // Monospace
  'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap',
  
  // Handwriting
  'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
  'https://fonts.googleapis.com/css2?family=Satisfy&display=swap',
  'https://fonts.googleapis.com/css2?family=Sacramento&display=swap',
  'https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap',
  'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap',
  
  // Slab Serif
  'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap',
  'https://fonts.googleapis.com/css2?family=Crete+Round:wght@400&display=swap',
  'https://fonts.googleapis.com/css2?family=Rockwell:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@400;600;700&display=swap',
];

const FontSelector: React.FC<FontSelectorProps> = ({ selectedFont, onSelectFont }) => {
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    fontLinks.forEach(link => {
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = link;
      document.head.appendChild(linkElement);
    });
  }, []);

  const filteredFonts = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, typeof fontOptions[keyof typeof fontOptions]> = {};

    Object.entries(fontOptions).forEach(([category, fonts]) => {
      const matchingFonts = fonts.filter(
        font => font.name.toLowerCase().includes(query) || 
                font.example.toLowerCase().includes(query) ||
                font.category?.toLowerCase().includes(query)
      );
      if (matchingFonts.length > 0) {
        filtered[category] = matchingFonts;
      }
    });

    return filtered;
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Command className="rounded-lg border border-gray-700 bg-gray-900">
          <div className="flex items-center border-b border-gray-700 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Search fonts..." 
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </div>
          <ScrollArea className="h-[400px]">
            {Object.entries(filteredFonts).length > 0 ? (
              Object.entries(filteredFonts).map(([category, fonts]) => (
                <CommandGroup key={category} heading={category} className="px-3 py-2">
                  <RadioGroup 
                    defaultValue={selectedFont} 
                    onValueChange={onSelectFont}
                    className="space-y-4"
                  >
                    {fonts.map((font) => (
                      <div key={font.name} className="flex items-start space-x-2 hover:bg-gray-800 rounded-md p-2">
                        <RadioGroupItem value={font.name} id={font.name} className="mt-1" />
                        <div className="flex-1">
                          <Label 
                            htmlFor={font.name} 
                            className="text-white block cursor-pointer font-medium mb-1"
                          >
                            {font.displayName} {font.category && <span className="text-gray-400 text-xs">({font.category})</span>}
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
                </CommandGroup>
              ))
            ) : (
              <CommandEmpty className="py-6 text-center text-sm">
                No fonts found.
              </CommandEmpty>
            )}
          </ScrollArea>
        </Command>
      </div>
    </div>
  );
};

export default FontSelector;
