import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 80px;
  box-sizing: border-box;
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  transition: opacity 0.2s ease;
  position: relative;
  min-width: fit-content;
  
  &:hover {
    opacity: 0.8;
  }
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  color: #1a202c;
  font-weight: 800;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  overflow: visible;
  text-overflow: unset;
  position: relative;
  display: inline-block;
  min-width: fit-content;
  flex-shrink: 0;
  transform: none !important;
  opacity: 1 !important;
  visibility: visible !important;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItemContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  
  &:hover {
    color: #000000;
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: #000000;
    transition: width 0.3s ease;
  }
  
  &:hover:after {
    width: 100%;
  }
`;

const MegaMenuNavLink = styled.div`
  text-decoration: none;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    color: #000000;
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: #000000;
    transition: width 0.3s ease;
  }
  
  &:hover:after {
    width: 100%;
  }
  
  /* Support for when used as Link component */
  &.nav-link {
    text-decoration: none;
  }
`;



// Removed unused DisabledNavItem

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 25px;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  min-width: 300px;
  
  &:focus-within {
    border-color: #000000;
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 1024px) {
    min-width: 240px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchSuggestionsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  display: ${props => props.show ? 'block' : 'none'};
  width: 100%;
  min-width: 280px;
  
  @media (max-width: 1024px) {
    min-width: 220px;
  }
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f8fafc;
  }
  
  ${props => props.highlighted && `
    background: #e6f2ff;
  `}
`;

const SuggestionImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
  background: #f8f9fa;
  border-radius: 6px;
  margin-right: 12px;
  flex-shrink: 0;
`;

const SuggestionContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const SuggestionName = styled.div`
  font-weight: 500;
  color: #1f2937;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SuggestionCategory = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
  text-transform: capitalize;
`;

const NoSuggestions = styled.div`
  padding: 16px;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.9rem;
  width: 280px;
  
  &:focus {
    outline: none;
    box-shadow: none;
  }
  
  &::placeholder {
    color: #6c757d;
  }
  
  @media (max-width: 1024px) {
    width: 220px;
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
  
  &:hover {
    color: #000000;
  }
`;

const CartButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #000000;
  color: white;
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  border: 2px solid #ffffff;
  font-size: 1.1rem;
  
  &:hover {
    background: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
  }
`;

const CartCount = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

// Mega Menu Styles
const MegaMenuOverlay = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 999;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '0' : '-10px'});
  transition: all 0.3s ease;
  border-bottom: 1px solid #e5e5e5;
`;

const MegaMenuContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: block;
  padding: 2rem;
  
  @media (max-width: 968px) {
    padding: 1.5rem;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LatestSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const LatestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 200px));
  gap: 1.5rem;
  
  @media (max-width: 968px) {
    grid-template-columns: repeat(auto-fit, minmax(160px, 180px));
    gap: 1rem;
  }
`;

const StoreMegaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    max-width: 200px;
  }
`;

const StoreMegaContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ViewAllSection = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
  max-width: 600px;
  margin-top: 1rem;
  padding-left: calc(66.66% + 1rem);
  
  @media (max-width: 768px) {
    justify-content: center;
    padding-left: 0;
  }
  
  @media (max-width: 480px) {
    justify-content: center;
    padding-left: 0;
  }
`;

const CategoryCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  padding: 1.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: rgba(248, 249, 250, 0.5);
  
  &:hover {
    background: rgba(248, 249, 250, 1);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;

const CategoryImage = styled.div`
  width: 120px;
  height: 120px;
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  img {
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
  
  ${CategoryCard}:hover & img {
    transform: scale(1.05);
  }
`;

const CategoryName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  text-align: center;
  letter-spacing: 0.3px;
`;

const ProductCard = styled(Link)`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #e0e0e0;
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 120px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  overflow: hidden;
  
  img {
    width: 70%;
    height: 70%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
  
  ${ProductCard}:hover & img {
    transform: scale(1.05);
  }
`;

const ProductName = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
  line-height: 1.3;
`;

const ProductPrice = styled.p`
  font-size: 0.85rem;
  color: #000000;
  font-weight: 600;
  margin: 0;
`;

const ViewAllLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: #000000;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.2s ease;
  
  &:hover {
    color: #1a1a1a;
  }
  
  &:after {
    content: '→';
    transition: transform 0.2s ease;
  }
  
  &:hover:after {
    transform: translateX(2px);
  }
`;




const Navbar = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [isPhoneMegaMenuOpen, setIsPhoneMegaMenuOpen] = useState(false);
  const [isLaptopMegaMenuOpen, setIsLaptopMegaMenuOpen] = useState(false);
  const [isTvMegaMenuOpen, setIsTvMegaMenuOpen] = useState(false);
  const [isStoreMegaMenuOpen, setIsStoreMegaMenuOpen] = useState(false);
  const [isGamingMegaMenuOpen, setIsGamingMegaMenuOpen] = useState(false);
  const [isAudioMegaMenuOpen, setIsAudioMegaMenuOpen] = useState(false);
  const [phoneData, setPhoneData] = useState({ brands: [], latestPhones: [] });
  const [laptopData, setLaptopData] = useState({ categories: [], featuredLaptops: [] });
  const [tvData, setTvData] = useState({ categories: [], featuredTvs: [] });
  const [gamingData, setGamingData] = useState({ featuredGaming: [] });
  const [audioData, setAudioData] = useState({ featuredAudio: [] });
  const [phoneMegaMenuTimeout, setPhoneMegaMenuTimeout] = useState(null);
  const [laptopMegaMenuTimeout, setLaptopMegaMenuTimeout] = useState(null);
  const [tvMegaMenuTimeout, setTvMegaMenuTimeout] = useState(null);
  const [storeMegaMenuTimeout, setStoreMegaMenuTimeout] = useState(null);
  const [gamingMegaMenuTimeout, setGamingMegaMenuTimeout] = useState(null);
  const [audioMegaMenuTimeout, setAudioMegaMenuTimeout] = useState(null);
  
  // Search suggestions state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimeout = useRef(null);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch phone data for mega menu
  useEffect(() => {
    const fetchPhoneData = async () => {
      try {
        const response = await fetch('/api/products?category=phone');
        if (response.ok) {
          const phones = await response.json();
          
          // Extract unique brands
          const uniqueBrands = [...new Set(phones.map(phone => {
            const name = phone.name.toLowerCase();
            if (name.includes('iphone') || name.includes('apple')) return 'Apple';
            if (name.includes('samsung') || name.includes('galaxy')) return 'Samsung';
            if (name.includes('google') || name.includes('pixel')) return 'Google';
            if (name.includes('oneplus')) return 'OnePlus';
            if (name.includes('xiaomi')) return 'Xiaomi';
            if (name.includes('huawei')) return 'Huawei';
            return 'Other';
          }).filter(brand => brand !== 'Other'))].sort();

          // Get latest phones (first 6) and update image paths to use local images
          const latestPhones = phones.slice(0, 6).map(phone => ({
            ...phone,
            image: phone.name.toLowerCase().includes('iphone') && phone.name.toLowerCase().includes('16') && phone.name.toLowerCase().includes('pro') 
              ? '/images/iphone_16_pro_max.jpg'
              : phone.image
          }));

          setPhoneData({
            brands: uniqueBrands,
            latestPhones: latestPhones
          });
          
        }
      } catch (error) {
        console.error('Error fetching phone data:', error);
      }
    };

    fetchPhoneData();
  }, []);

  // Fetch laptop data for mega menu
  useEffect(() => {
    const fetchLaptopData = async () => {
      try {
        const response = await fetch('/api/products?category=laptop');
        if (response.ok) {
          const laptops = await response.json();
          
          // Define laptop categories with use cases
          const categories = [
            {
              name: 'Gaming Laptops',
              description: 'High-performance laptops for gaming',
              query: 'gaming',
              icon: '🎮'
            },
            {
              name: 'Business & Work',
              description: 'Professional laptops for productivity',
              query: 'business',
              icon: '💼'
            },
            {
              name: 'Creative & Development',
              description: 'Powerful laptops for creative work',
              query: 'creative',
              icon: '🎨'
            },
            {
              name: 'Student & Budget',
              description: 'Affordable laptops for students',
              query: 'student',
              icon: '🎓'
            }
          ];

          // Categorize laptops based on keywords
          const categorizedLaptops = {
            gaming: laptops.filter(laptop => {
              const name = laptop.name.toLowerCase();
              return name.includes('gaming') || name.includes('rog') || name.includes('predator') || name.includes('legion') || name.includes('alienware');
            }),
            business: laptops.filter(laptop => {
              const name = laptop.name.toLowerCase();
              return name.includes('thinkpad') || name.includes('latitude') || name.includes('elitebook') || name.includes('surface') || name.includes('business');
            }),
            creative: laptops.filter(laptop => {
              const name = laptop.name.toLowerCase();
              return name.includes('macbook') || name.includes('studio') || name.includes('creator') || name.includes('zenbook') || name.includes('xps');
            }),
            student: laptops.filter(laptop => {
              const name = laptop.name.toLowerCase();
              const price = parseFloat(laptop.price?.toString().replace(/[^0-9.]/g, '')) || 0;
              return price < 800 || name.includes('aspire') || name.includes('ideapad') || name.includes('vivobook');
            })
          };

          // Get featured laptops (mix from different categories, first 6)
          const featuredLaptops = [
            ...categorizedLaptops.gaming.slice(0, 2),
            ...categorizedLaptops.business.slice(0, 2),
            ...categorizedLaptops.creative.slice(0, 2)
          ].slice(0, 6);

          setLaptopData({
            categories: categories,
            featuredLaptops: featuredLaptops,
            categorizedLaptops: categorizedLaptops
          });
        }
      } catch (error) {
        console.error('Error fetching laptop data:', error);
      }
    };

    fetchLaptopData();
  }, []);

  // Fetch TV data for mega menu
  useEffect(() => {
    const fetchTvData = async () => {
      try {
        const response = await fetch('/api/products?category=tv');
        if (response.ok) {
          const tvs = await response.json();
          
          // Define TV/Monitor categories with use cases
          const categories = [
            {
              name: 'Gaming Displays',
              description: 'High refresh rate monitors and gaming TVs',
              query: 'gaming',
              icon: '🎮'
            },
            {
              name: 'Home Entertainment',
              description: 'Large smart TVs for living rooms',
              query: 'entertainment',
              icon: '🏠'
            },
            {
              name: 'Professional Monitors',
              description: 'Productivity and office displays',
              query: 'professional',
              icon: '💼'
            },
            {
              name: 'Creative & Design',
              description: 'Color-accurate monitors for creators',
              query: 'creative',
              icon: '🎨'
            }
          ];

          // Categorize TVs/monitors based on keywords and specifications
          const categorizedTvs = {
            gaming: tvs.filter(tv => {
              const name = tv.name.toLowerCase();
              return name.includes('gaming') || name.includes('144hz') || name.includes('240hz') || 
                     name.includes('g-sync') || name.includes('freesync') || name.includes('rog') ||
                     name.includes('predator') || name.includes('alienware');
            }),
            entertainment: tvs.filter(tv => {
              const name = tv.name.toLowerCase();
              // Look for large TVs (55" and above) or smart TV features
              return name.includes('55"') || name.includes('65"') || name.includes('75"') || 
                     name.includes('smart') || name.includes('oled') || name.includes('qled') ||
                     name.includes('bravia') || name.includes('lg') || name.includes('samsung tv');
            }),
            professional: tvs.filter(tv => {
              const name = tv.name.toLowerCase();
              return name.includes('monitor') || name.includes('ultrawide') || name.includes('business') ||
                     name.includes('office') || name.includes('productivity') || name.includes('dell') ||
                     name.includes('hp') || name.includes('acer') || name.includes('asus');
            }),
            creative: tvs.filter(tv => {
              const name = tv.name.toLowerCase();
              return name.includes('4k') || name.includes('color accurate') || name.includes('professional') ||
                     name.includes('studio') || name.includes('creator') || name.includes('design') ||
                     name.includes('calibrated') || name.includes('benq');
            })
          };

          // Get featured TVs/monitors (mix from different categories, first 6)
          const featuredTvs = [
            ...categorizedTvs.gaming.slice(0, 2),
            ...categorizedTvs.entertainment.slice(0, 2),
            ...categorizedTvs.professional.slice(0, 1),
            ...categorizedTvs.creative.slice(0, 1)
          ].slice(0, 6);

          // If we don't have enough categorized items, fall back to all TVs
          const finalFeaturedTvs = featuredTvs.length >= 4 ? featuredTvs : tvs.slice(0, 6);

          setTvData({
            categories: categories,
            featuredTvs: finalFeaturedTvs,
            categorizedTvs: categorizedTvs
          });
        }
      } catch (error) {
        console.error('Error fetching TV data:', error);
      }
    };

    fetchTvData();
  }, []);

  // Fetch Gaming data for mega menu
  useEffect(() => {
    const fetchGamingData = async () => {
      try {
        const response = await fetch('/api/products?category=gaming');
        if (response.ok) {
          const gamingProducts = await response.json();
          
          // Get featured gaming products (first 6)
          const featuredGaming = gamingProducts.slice(0, 6);

          setGamingData({
            featuredGaming: featuredGaming
          });
        }
      } catch (error) {
        console.error('Error fetching gaming data:', error);
      }
    };

    fetchGamingData();
  }, []);

  // Fetch Audio data for mega menu
  useEffect(() => {
    const fetchAudioData = async () => {
      try {
        const response = await fetch('/api/products?category=audio');
        if (response.ok) {
          const audioProducts = await response.json();
          
          // Get featured audio products (first 6)
          const featuredAudio = audioProducts.slice(0, 6);

          setAudioData({
            featuredAudio: featuredAudio
          });
        }
      } catch (error) {
        console.error('Error fetching audio data:', error);
      }
    };

    fetchAudioData();
  }, []);

  // Fetch search suggestions from API
  const fetchSearchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search-suggestions?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const suggestions = await response.json();
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
        setHighlightedIndex(-1);
      }
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
    setIsLoading(false);
  };

  // Debounced search input handler
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for debounced search
    debounceTimeout.current = setTimeout(() => {
      fetchSearchSuggestions(value);
    }, 300); // 300ms delay
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(searchSuggestions[highlightedIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        searchInputRef.current?.blur();
        break;
      default:
        // Do nothing for other keys
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const searchTerm = suggestion.name;
    setSearchQuery(searchTerm);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = searchQuery.trim();
    if (searchTerm) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      searchInputRef.current?.blur();
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (searchQuery.length >= 2 && searchSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle clicking outside of search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Phone mega menu handlers
  const handlePhoneMegaMenuEnter = () => {
    if (phoneMegaMenuTimeout) {
      clearTimeout(phoneMegaMenuTimeout);
      setPhoneMegaMenuTimeout(null);
    }
    setIsPhoneMegaMenuOpen(true);
  };

  const handlePhoneMegaMenuLeave = () => {
    const timeout = setTimeout(() => {
      setIsPhoneMegaMenuOpen(false);
    }, 200); // Small delay to prevent flickering
    setPhoneMegaMenuTimeout(timeout);
  };

  // Laptop mega menu handlers
  const handleLaptopMegaMenuEnter = () => {
    if (laptopMegaMenuTimeout) {
      clearTimeout(laptopMegaMenuTimeout);
      setLaptopMegaMenuTimeout(null);
    }
    setIsLaptopMegaMenuOpen(true);
  };

  const handleLaptopMegaMenuLeave = () => {
    const timeout = setTimeout(() => {
      setIsLaptopMegaMenuOpen(false);
    }, 200); // Small delay to prevent flickering
    setLaptopMegaMenuTimeout(timeout);
  };

  // TV mega menu handlers
  const handleTvMegaMenuEnter = () => {
    if (tvMegaMenuTimeout) {
      clearTimeout(tvMegaMenuTimeout);
      setTvMegaMenuTimeout(null);
    }
    setIsTvMegaMenuOpen(true);
  };

  const handleTvMegaMenuLeave = () => {
    const timeout = setTimeout(() => {
      setIsTvMegaMenuOpen(false);
    }, 200); // Small delay to prevent flickering
    setTvMegaMenuTimeout(timeout);
  };

  // Store mega menu handlers
  const handleStoreMegaMenuEnter = () => {
    if (storeMegaMenuTimeout) {
      clearTimeout(storeMegaMenuTimeout);
      setStoreMegaMenuTimeout(null);
    }
    setIsStoreMegaMenuOpen(true);
  };

  const handleStoreMegaMenuLeave = () => {
    const timeout = setTimeout(() => {
      setIsStoreMegaMenuOpen(false);
    }, 200); // Small delay to prevent flickering
    setStoreMegaMenuTimeout(timeout);
  };

  // Gaming mega menu handlers
  const handleGamingMegaMenuEnter = () => {
    if (gamingMegaMenuTimeout) {
      clearTimeout(gamingMegaMenuTimeout);
      setGamingMegaMenuTimeout(null);
    }
    setIsGamingMegaMenuOpen(true);
  };

  const handleGamingMegaMenuLeave = () => {
    const timeout = setTimeout(() => {
      setIsGamingMegaMenuOpen(false);
    }, 200); // Small delay to prevent flickering
    setGamingMegaMenuTimeout(timeout);
  };

  // Audio mega menu handlers
  const handleAudioMegaMenuEnter = () => {
    if (audioMegaMenuTimeout) {
      clearTimeout(audioMegaMenuTimeout);
      setAudioMegaMenuTimeout(null);
    }
    setIsAudioMegaMenuOpen(true);
  };

  const handleAudioMegaMenuLeave = () => {
    const timeout = setTimeout(() => {
      setIsAudioMegaMenuOpen(false);
    }, 200); // Small delay to prevent flickering
    setAudioMegaMenuTimeout(timeout);
  };

  // Generate consistent product ID
  const generateProductId = (productName, category = 'phone') => {
    if (!productName) return '1-unknown-product';
    
    const nameSlug = productName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
    
    return `1-${nameSlug}-${category}`;
  };

  return (
    <>
      <NavbarContainer>
        {/* Logo */}
        <LogoContainer to="/">
          <LogoIcon>V</LogoIcon>
          <LogoText>VisionTech</LogoText>
        </LogoContainer>
        
        {/* Navigation Links */}
        <NavLinks>
          {/* Store with Mega Menu */}
          <NavItemContainer
            onMouseEnter={handleStoreMegaMenuEnter}
            onMouseLeave={handleStoreMegaMenuLeave}
          >
            <MegaMenuNavLink as={Link} to="/products">
              Store
            </MegaMenuNavLink>
          </NavItemContainer>
          
          {/* Phone with Mega Menu */}
          <NavItemContainer
            onMouseEnter={handlePhoneMegaMenuEnter}
            onMouseLeave={handlePhoneMegaMenuLeave}
          >
            <MegaMenuNavLink as={Link} to="/products?category=phone">
              Phone
            </MegaMenuNavLink>
          </NavItemContainer>
          
          {/* Laptop with Mega Menu */}
          <NavItemContainer
            onMouseEnter={handleLaptopMegaMenuEnter}
            onMouseLeave={handleLaptopMegaMenuLeave}
          >
            <MegaMenuNavLink as={Link} to="/products?category=laptop">
              Laptop
            </MegaMenuNavLink>
          </NavItemContainer>
          
          {/* TV & Monitors with Mega Menu */}
          <NavItemContainer
            onMouseEnter={handleTvMegaMenuEnter}
            onMouseLeave={handleTvMegaMenuLeave}
          >
            <MegaMenuNavLink as={Link} to="/products?category=tv">
              TV & Monitors
            </MegaMenuNavLink>
          </NavItemContainer>
          
          {/* Gaming with Mega Menu */}
          <NavItemContainer
            onMouseEnter={handleGamingMegaMenuEnter}
            onMouseLeave={handleGamingMegaMenuLeave}
          >
            <MegaMenuNavLink as={Link} to="/products?category=gaming">
              Gaming
            </MegaMenuNavLink>
          </NavItemContainer>
          
          {/* Audio with Mega Menu */}
          <NavItemContainer
            onMouseEnter={handleAudioMegaMenuEnter}
            onMouseLeave={handleAudioMegaMenuLeave}
          >
            <MegaMenuNavLink as={Link} to="/products?category=audio">
              Audio
            </MegaMenuNavLink>
          </NavItemContainer>
          
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </NavLinks>
        
        {/* Search and Cart */}
        <SearchContainer>
          <SearchForm onSubmit={handleSearch} ref={suggestionsRef}>
            <SearchInput
              ref={searchInputRef}
              type="text"
              name="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              autoComplete="off"
            />
            <SearchButton type="submit">
              <FaSearch />
            </SearchButton>
            
            {/* Search Suggestions Dropdown */}
            <SearchSuggestionsDropdown show={showSuggestions}>
              {isLoading ? (
                <NoSuggestions>Searching...</NoSuggestions>
              ) : searchSuggestions.length > 0 ? (
                searchSuggestions.map((suggestion, index) => (
                  <SuggestionItem
                    key={`${suggestion.name}-${index}`}
                    highlighted={index === highlightedIndex}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <SuggestionImage
                      src={suggestion.image || `https://via.placeholder.com/40x40?text=${encodeURIComponent(suggestion.name.charAt(0))}`}
                      alt={suggestion.name}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/40x40?text=${encodeURIComponent(suggestion.name.charAt(0))}`;
                      }}
                    />
                    <SuggestionContent>
                      <SuggestionName>{suggestion.name}</SuggestionName>
                      <SuggestionCategory>{suggestion.category}s</SuggestionCategory>
                    </SuggestionContent>
                  </SuggestionItem>
                ))
              ) : searchQuery.length >= 2 ? (
                <NoSuggestions>No products found</NoSuggestions>
              ) : null}
            </SearchSuggestionsDropdown>
          </SearchForm>
          
          <CartButton to="/cart">
            <FaShoppingCart />
            {totalItems > 0 && <CartCount>{totalItems}</CartCount>}
          </CartButton>
        </SearchContainer>
      </NavbarContainer>

      {/* Phone Mega Menu */}
      <MegaMenuOverlay 
        isOpen={isPhoneMegaMenuOpen}
        onMouseEnter={handlePhoneMegaMenuEnter}
        onMouseLeave={handlePhoneMegaMenuLeave}
      >
        <MegaMenuContainer>
          {/* Latest Phones Section */}
          <LatestSection>
            <SectionTitle>Latest Phones</SectionTitle>
            <LatestGrid>
              {phoneData.latestPhones.map(phone => (
                <ProductCard 
                  key={phone.id || phone.name} 
                  to={`/product/${generateProductId(phone.name, 'phone')}`}
                >
                  <ProductImage>
                    <img 
                      src={phone.image || `https://via.placeholder.com/120x120?text=${encodeURIComponent(phone.name)}`}
                      alt={phone.name}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/120x120?text=${encodeURIComponent(phone.name)}`;
                      }}
                    />
                  </ProductImage>
                  <ProductName>{phone.name}</ProductName>
                  <ProductPrice>{phone.price}</ProductPrice>
                </ProductCard>
              ))}
            </LatestGrid>
            <ViewAllLink to="/products?category=phone">
              View All Phones
            </ViewAllLink>
          </LatestSection>
        </MegaMenuContainer>
      </MegaMenuOverlay>

      {/* Laptop Mega Menu */}
      <MegaMenuOverlay 
        isOpen={isLaptopMegaMenuOpen}
        onMouseEnter={handleLaptopMegaMenuEnter}
        onMouseLeave={handleLaptopMegaMenuLeave}
      >
        <MegaMenuContainer>
          {/* Featured Laptops Section */}
          <LatestSection>
            <SectionTitle>Featured Laptops</SectionTitle>
            <LatestGrid>
              {laptopData.featuredLaptops.map(laptop => (
                <ProductCard 
                  key={laptop.id || laptop.name} 
                  to={`/product/${generateProductId(laptop.name, 'laptop')}`}
                >
                  <ProductImage>
                    <img 
                      src={laptop.image || `https://via.placeholder.com/120x120?text=${encodeURIComponent(laptop.name)}`}
                      alt={laptop.name}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/120x120?text=${encodeURIComponent(laptop.name)}`;
                      }}
                    />
                  </ProductImage>
                  <ProductName>{laptop.name}</ProductName>
                  <ProductPrice>{laptop.price}</ProductPrice>
                </ProductCard>
              ))}
            </LatestGrid>
            <ViewAllLink to="/products?category=laptop">
              View All Laptops
            </ViewAllLink>
          </LatestSection>
        </MegaMenuContainer>
      </MegaMenuOverlay>

      {/* TV & Monitors Mega Menu */}
      <MegaMenuOverlay 
        isOpen={isTvMegaMenuOpen}
        onMouseEnter={handleTvMegaMenuEnter}
        onMouseLeave={handleTvMegaMenuLeave}
      >
        <MegaMenuContainer>
          {/* Featured TVs & Monitors Section */}
          <LatestSection>
            <SectionTitle>Featured Displays</SectionTitle>
            <LatestGrid>
              {tvData.featuredTvs.map(tv => (
                <ProductCard 
                  key={tv.id || tv.name} 
                  to={`/product/${generateProductId(tv.name, 'tv')}`}
                >
                  <ProductImage>
                    <img 
                      src={tv.image || `https://via.placeholder.com/120x120?text=${encodeURIComponent(tv.name)}`}
                      alt={tv.name}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/120x120?text=${encodeURIComponent(tv.name)}`;
                      }}
                    />
                  </ProductImage>
                  <ProductName>{tv.name}</ProductName>
                  <ProductPrice>{tv.price}</ProductPrice>
                </ProductCard>
              ))}
            </LatestGrid>
            <ViewAllLink to="/products?category=tv">
              View All TVs & Monitors
            </ViewAllLink>
          </LatestSection>
        </MegaMenuContainer>
      </MegaMenuOverlay>

      {/* Store Mega Menu */}
      <MegaMenuOverlay 
        isOpen={isStoreMegaMenuOpen}
        onMouseEnter={handleStoreMegaMenuEnter}
        onMouseLeave={handleStoreMegaMenuLeave}
      >
        <MegaMenuContainer>
          <StoreMegaContainer>
            <StoreMegaGrid>
              {/* Phone Category */}
              <CategoryCard to="/products?category=phone">
                <CategoryImage>
                  <img 
                    src="/images/google_pixel_9_pro.jpg"
                    alt="Phones"
                    onError={(e) => {
                      e.target.src = phoneData.latestPhones[0]?.image || 'https://via.placeholder.com/120x120?text=📱';
                    }}
                  />
                </CategoryImage>
                <CategoryName>Phone</CategoryName>
              </CategoryCard>

              {/* Laptop Category */}
              <CategoryCard to="/products?category=laptop">
                <CategoryImage>
                  <img 
                    src="/images/macbook_m4_pro.jpg"
                    alt="Laptops"
                    onError={(e) => {
                      e.target.src = laptopData.featuredLaptops[0]?.image || 'https://via.placeholder.com/120x120?text=💻';
                    }}
                  />
                </CategoryImage>
                <CategoryName>Laptop</CategoryName>
              </CategoryCard>

              {/* TV & Monitors Category */}
              <CategoryCard to="/products?category=tv">
                <CategoryImage>
                  <img 
                    src={tvData.featuredTvs[0]?.image || 'https://via.placeholder.com/120x120?text=📺'}
                    alt="TVs & Monitors"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/120x120?text=📺';
                    }}
                  />
                </CategoryImage>
                <CategoryName>TV & Monitors</CategoryName>
              </CategoryCard>
            </StoreMegaGrid>
            
            <ViewAllSection>
              <ViewAllLink to="/products">
                View All Products
              </ViewAllLink>
            </ViewAllSection>
          </StoreMegaContainer>
        </MegaMenuContainer>
      </MegaMenuOverlay>

      {/* Gaming Mega Menu */}
      <MegaMenuOverlay 
        isOpen={isGamingMegaMenuOpen}
        onMouseEnter={handleGamingMegaMenuEnter}
        onMouseLeave={handleGamingMegaMenuLeave}
      >
        <MegaMenuContainer>
          <LatestSection>
            <SectionTitle>Featured Gaming Products</SectionTitle>
            <LatestGrid>
              {gamingData.featuredGaming.map(product => (
                <ProductCard 
                  key={product.id || product.name} 
                  to={`/product/${generateProductId(product.name, 'gaming')}`}
                >
                  <ProductImage>
                    <img 
                      src="/static/images/ps5.jpg"
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/120x120?text=${encodeURIComponent(product.name)}`;
                      }}
                    />
                  </ProductImage>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>{product.price}</ProductPrice>
                </ProductCard>
              ))}
            </LatestGrid>
            <ViewAllLink to="/products?category=gaming">
              View All Gaming Products
            </ViewAllLink>
          </LatestSection>
        </MegaMenuContainer>
      </MegaMenuOverlay>

      {/* Audio Mega Menu */}
      <MegaMenuOverlay 
        isOpen={isAudioMegaMenuOpen}
        onMouseEnter={handleAudioMegaMenuEnter}
        onMouseLeave={handleAudioMegaMenuLeave}
      >
        <MegaMenuContainer>
          <LatestSection>
            <SectionTitle>Featured Audio Products</SectionTitle>
            <LatestGrid>
              {audioData.featuredAudio.map(product => (
                <ProductCard 
                  key={product.id || product.name} 
                  to={`/product/${generateProductId(product.name, 'audio')}`}
                >
                  <ProductImage>
                    <img 
                      src="/static/images/gamingheadphone.jpg"
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/120x120?text=${encodeURIComponent(product.name)}`;
                      }}
                    />
                  </ProductImage>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>{product.price}</ProductPrice>
                </ProductCard>
              ))}
            </LatestGrid>
            <ViewAllLink to="/products?category=audio">
              View All Audio Products
            </ViewAllLink>
          </LatestSection>
        </MegaMenuContainer>
      </MegaMenuOverlay>
    </>
  );
};

export default Navbar;