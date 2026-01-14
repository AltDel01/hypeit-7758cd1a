import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
];

const Language = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save - in a real app, this would save to user preferences
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem('preferred_language', selectedLanguage);
    setSaving(false);
    toast.success('Language preference saved!');
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Language Settings</h1>
            <p className="text-gray-400 text-sm">Choose your preferred language</p>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Select Language
            </CardTitle>
            <CardDescription className="text-gray-400">
              Choose the language you'd like to use throughout the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {languages.map((lang) => (
                <Label
                  key={lang.code}
                  htmlFor={lang.code}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedLanguage === lang.code
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <RadioGroupItem value={lang.code} id={lang.code} className="sr-only" />
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{lang.name}</p>
                    <p className="text-gray-400 text-sm">{lang.nativeName}</p>
                  </div>
                  {selectedLanguage === lang.code && (
                    <Check className="w-5 h-5 text-purple-400" />
                  )}
                </Label>
              ))}
            </RadioGroup>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {saving ? 'Saving...' : 'Save Language Preference'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-gray-500 text-sm text-center mt-6">
          Note: Some content may still appear in English while we work on translations.
        </p>
      </div>
    </div>
  );
};

export default Language;
