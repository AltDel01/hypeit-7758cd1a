import React, { useState } from 'react';
import { Search, Instagram, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

const CreatorDiscovery = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [industry, setIndustry] = useState('');
  const [topic, setTopic] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [interest, setInterest] = useState('');
  const [keyword, setKeyword] = useState('');
  
  // Creator filters
  const [followersMin, setFollowersMin] = useState('');
  const [followersMax, setFollowersMax] = useState('');
  const [likesMin, setLikesMin] = useState('');
  const [likesMax, setLikesMax] = useState('');
  const [creatorCountry, setCreatorCountry] = useState('indonesia');
  const [creatorCity, setCreatorCity] = useState('');
  const [creatorGender, setCreatorGender] = useState('');
  const [creatorAge, setCreatorAge] = useState('');
  const [verified, setVerified] = useState('');
  const [accountType, setAccountType] = useState('');
  
  // Audience filters
  const [audienceGender, setAudienceGender] = useState('');
  const [audienceAge, setAudienceAge] = useState('');
  const [audienceCountry, setAudienceCountry] = useState('indonesia');
  const [audienceCity, setAudienceCity] = useState('');

  const resetFilters = () => {
    setIndustry('');
    setTopic('');
    setHashtag('');
    setInterest('');
    setKeyword('');
    setFollowersMin('');
    setFollowersMax('');
    setLikesMin('');
    setLikesMax('');
    setCreatorCountry('indonesia');
    setCreatorCity('');
    setCreatorGender('');
    setCreatorAge('');
    setVerified('');
    setAccountType('');
    setAudienceGender('');
    setAudienceAge('');
    setAudienceCountry('indonesia');
    setAudienceCity('');
  };

  const handleSearch = () => {
    // Handle search functionality
    console.log('Searching with filters...');
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-4 animate-gradient-text animate-fade-in-up">Discovery</h1>
        <p className="text-gray-400 text-lg">
          Discover the right creators for your campaigns
        </p>
      </div>

      <Card className="rounded-lg border border-gray-700 bg-gray-900/60 backdrop-blur-sm p-6">
        <CardContent className="p-0 space-y-8">
          {/* Social Media Platform Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Social Media</h3>
            <div className="flex gap-3">
              <Button
                variant={selectedPlatform === 'instagram' ? 'default' : 'outline'}
                onClick={() => setSelectedPlatform('instagram')}
                className="flex items-center gap-2"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Button>
              <Button
                variant={selectedPlatform === 'tiktok' ? 'default' : 'outline'}
                onClick={() => setSelectedPlatform('tiktok')}
                className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
              >
                <div className="w-4 h-4 bg-white rounded-sm"></div>
                Tiktok
              </Button>
              <Button
                variant={selectedPlatform === 'youtube' ? 'default' : 'outline'}
                onClick={() => setSelectedPlatform('youtube')}
                className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
              >
                <Youtube className="w-4 h-4" />
                Youtube
              </Button>
            </div>
          </div>

          {/* Template Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Template</h3>
            <div>
              <Label htmlFor="industry" className="text-blue-400 mb-2 block">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="topic" className="text-gray-300 mb-2 block">Topic</Label>
              <div className="relative">
                <Input
                  id="topic"
                  placeholder="Search Topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <Label htmlFor="hashtag" className="text-gray-300 mb-2 block">Hashtag</Label>
              <div className="relative">
                <Input
                  id="hashtag"
                  placeholder="Search Hashtag Without #"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <Label htmlFor="interest" className="text-gray-300 mb-2 block">Interest</Label>
              <Select value={interest} onValueChange={setInterest}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Interest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="keyword" className="text-gray-300 mb-2 block">Keyword</Label>
              <div className="relative">
                <Input
                  id="keyword"
                  placeholder="Search Keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Creator Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              Creator
              <Button variant="ghost" size="sm" className="ml-auto">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </Button>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Followers Range</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Min"
                    value={followersMin}
                    onChange={(e) => setFollowersMin(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-gray-400">—</span>
                  <Input
                    placeholder="Max"
                    value={followersMax}
                    onChange={(e) => setFollowersMax(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Average Likes</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Min"
                    value={likesMin}
                    onChange={(e) => setLikesMin(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-gray-400">—</span>
                  <Input
                    placeholder="Max"
                    value={likesMax}
                    onChange={(e) => setLikesMax(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Creator Country</Label>
                <Select value={creatorCountry} onValueChange={setCreatorCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3 bg-red-500 rounded-sm"></div>
                        Indonesia
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indonesia">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3 bg-red-500 rounded-sm"></div>
                        Indonesia
                      </div>
                    </SelectItem>
                    <SelectItem value="malaysia">Malaysia</SelectItem>
                    <SelectItem value="singapore">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Creator City</Label>
                <Select value={creatorCity} onValueChange={setCreatorCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jakarta">Jakarta</SelectItem>
                    <SelectItem value="surabaya">Surabaya</SelectItem>
                    <SelectItem value="bandung">Bandung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Creator Gender</Label>
                <Select value={creatorGender} onValueChange={setCreatorGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Creator Age</Label>
                <Select value={creatorAge} onValueChange={setCreatorAge}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45+">45+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Verified</Label>
                <Select value={verified} onValueChange={setVerified}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Account Type</Label>
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Audience Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              Audience
              <Button variant="ghost" size="sm" className="ml-auto">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </Button>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Audience Gender</Label>
                <Select value={audienceGender} onValueChange={setAudienceGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Audience Age</Label>
                <Select value={audienceAge} onValueChange={setAudienceAge}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45+">45+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Audience Country</Label>
                <Select value={audienceCountry} onValueChange={setAudienceCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3 bg-red-500 rounded-sm"></div>
                        Indonesia
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indonesia">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3 bg-red-500 rounded-sm"></div>
                        Indonesia
                      </div>
                    </SelectItem>
                    <SelectItem value="malaysia">Malaysia</SelectItem>
                    <SelectItem value="singapore">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Audience City</Label>
                <Select value={audienceCity} onValueChange={setAudienceCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jakarta">Jakarta</SelectItem>
                    <SelectItem value="surabaya">Surabaya</SelectItem>
                    <SelectItem value="bandung">Bandung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="text-blue-500 border-blue-500 hover:bg-blue-500/10"
            >
              Reset Filter
            </Button>
            <Button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorDiscovery;