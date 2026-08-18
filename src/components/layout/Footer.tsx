import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const footerGroups = [
  {
    titleKey: 'footer.product',
    links: [
      { key: 'features', href: '/features' },
      { key: 'pricing', href: '/pricing' },
      { key: 'enterprise', href: '/enterprise' },
      { key: 'aiEditor', href: '/dashboard' },
    ],
  },
  {
    titleKey: 'footer.solutions',
    links: [
      { key: 'videoEditing', href: '/dashboard' },
      { key: 'socialContent', href: '/' },
      { key: 'brandIdentity', href: '/brand-identity' },
      { key: 'viralityStrategy', href: '/virality' },
    ],
  },
  {
    titleKey: 'footer.resources',
    links: [
      { key: 'faq', href: '/faq' },
      { key: 'tutorials', href: '#' },
      { key: 'blog', href: '#' },
      { key: 'community', href: '#' },
    ],
  },
  {
    titleKey: 'footer.company',
    links: [
      { key: 'about', href: '#' },
      { key: 'careers', href: '/careers' },
      { key: 'contact', href: '#' },
      { key: 'press', href: '#' },
    ],
  },
];

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img 
                src="/lovable-uploads/viralin-logo.png" 
                alt="Viralin Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.titleKey}>
              <h3 className="text-white font-semibold mb-4">{t(group.titleKey)}</h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.key}>
                    <Link to={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {t(`footer.links.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">{t('footer.rights', { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-gray-500 hover:text-white text-sm transition-colors">{t('footer.privacy')}</Link>
            <Link to="#" className="text-gray-500 hover:text-white text-sm transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
