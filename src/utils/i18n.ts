import { useAuthStore } from '../store/authStore';

// Lightweight dictionary for demonstration
const DICTIONARY = {
  en: {
    // Tabs & Profile
    home: 'Home', shop: 'Shop', rides: 'Rides', notes: 'Notes', profile: 'Profile',
    my_orders: 'My Orders', language_and_voice: 'Language & Voice', logout: 'Logout',
    choose_language: 'Choose your preferred language', cancel: 'Cancel', search_notes: 'Search your notes...',
    
    // Auth
    welcome_to_goone: 'Welcome to GoOne',
    login_to_continue: 'Log in or sign up to continue',
    phone_number: 'Phone Number',
    password_or_pin: 'Password or PIN',
    continue: 'Continue',
    verify_otp: 'Verify OTP',
    enter_otp: 'Enter the 6-digit OTP sent to your phone',
    verify: 'Verify',
    mobile_number: 'Mobile Number',
    phone_placeholder: 'Enter 10-digit number',
    password: 'Password',
    password_placeholder: 'Enter your password',
    secure_login: 'Secure Login',
    quick_demo_access: 'Quick Demo Access',
    tap_to_autofill: 'Tap to auto-fill test credentials',
    customer_app: 'Customer App',
    splash_subtagline: 'Shop Local • Book Rides • Track Orders',
    
    // Home
    welcome_back: 'Welcome back',
    wallet_balance: 'Wallet Balance',
    search_anything: 'Search for anything...',
    quick_actions: 'Quick Actions',
    recent_activity: 'Recent Activity',
    what_would_you_like_to_do: 'What would you like to do?',
    shop_local: 'Shop Local',
    shop_local_desc: 'Order food, groceries & more',
    book_a_ride_desc: 'Autos & cars at best prices',
    list_view: 'List',
    map_view: 'Map',
    mins: 'mins',
    
    // Shop
    shops_services: 'Shops & Services',
    nearby_shops: 'Nearby Shops',
    categories: 'Categories',
    add_to_cart: 'Add to Cart',
    view_cart: 'View Cart',
    checkout: 'Checkout',
    delivery: 'Delivery',
    total: 'Total',
    place_order: 'Place Order',
    search_stores: 'Search stores, products...',
    location_needed: 'Location access needed',
    waiting_location: 'Waiting for location',
    location_desc: 'We need your location to show nearby businesses.',
    couldnt_load_biz: 'Couldn\'t load businesses',
    retry: 'Retry',
    cat_all: 'All',
    cat_grocery: 'Grocery',
    cat_food: 'Food',
    cat_medical: 'Medical',
    cat_milk_water: 'Milk/Water',
    cat_farmer: 'Farmer',
    cat_services: 'Services',
    
    // Rides
    book_ride: 'Book a Ride',
    where_to: 'Where to?',
    confirm_ride: 'Confirm Ride',
    driver: 'Driver',
    arriving_in: 'Arriving in',
    cancel_ride: 'Cancel Ride',
    pickup_location: 'Pickup Location',
    drop_location: 'Drop Location',
    
    // Notes
    total_notes: 'Total Notes',
    pinned: 'Pinned',
    locked: 'Locked',
    archived: 'Archived',
    create_note: 'Create Note',
    title: 'Title',
    content: 'Start writing...',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    
    // Orders
    active_orders: 'Active Orders',
    past_orders: 'Past Orders',
    order_details: 'Order Details',
    track_order: 'Track Order',
    status: 'Status',
    items: 'Items'
  },
  ta: {
    // Tabs & Profile
    home: 'முகப்பு', shop: 'கடை', rides: 'சவாரிகள்', notes: 'குறிப்புகள்', profile: 'சுயவிவரம்',
    my_orders: 'என் ஆர்டர்கள்', language_and_voice: 'மொழி மற்றும் குரல்', logout: 'வெளியேறு',
    choose_language: 'உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்', cancel: 'ரத்துசெய்', search_notes: 'உங்கள் குறிப்புகளைத் தேடுங்கள்...',
    
    // Auth
    welcome_to_goone: 'GoOne-க்கு வரவேற்கிறோம்',
    login_to_continue: 'தொடர உள்நுழையவும்',
    phone_number: 'தொலைபேசி எண்',
    password_or_pin: 'கடவுச்சொல் அல்லது PIN',
    continue: 'தொடரவும்',
    verify_otp: 'OTP சரிபார்க்கவும்',
    enter_otp: 'உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட 6 இலக்க OTP ஐ உள்ளிடவும்',
    verify: 'சரிபார்',
    mobile_number: 'கைபேசி எண்',
    phone_placeholder: '10 இலக்க எண்ணை உள்ளிடவும்',
    password: 'கடவுச்சொல்',
    password_placeholder: 'கடவுச்சொல்லை உள்ளிடவும்',
    secure_login: 'பாதுகாப்பான உள்நுழைவு',
    quick_demo_access: 'விரைவான டெமோ அணுகல்',
    tap_to_autofill: 'சோதனை சான்றுகளை நிரப்ப தட்டவும்',
    customer_app: 'வாடிக்கையாளர் செயலி',
    splash_subtagline: 'உள்ளூர் கடைகள் • சவாரிகள் • ஆர்டர்கள்',
    
    // Home
    welcome_back: 'மீண்டும் வரவேற்கிறோம்',
    wallet_balance: 'பணப்பை இருப்பு',
    search_anything: 'எதையும் தேடுங்கள்...',
    quick_actions: 'விரைவான செயல்கள்',
    recent_activity: 'சமீபத்திய செயல்பாடு',
    what_would_you_like_to_do: 'நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?',
    shop_local: 'உள்ளூர் கடைகள்',
    shop_local_desc: 'உணவு மற்றும் மளிகை பொருட்கள்',
    book_a_ride_desc: 'சிறந்த விலையில் ஆட்டோ & கார்',
    list_view: 'பட்டியல்',
    map_view: 'வரைபடம்',
    mins: 'நிமிடம்',
    
    // Shop
    shops_services: 'கடைகள் மற்றும் சேவைகள்',
    nearby_shops: 'அருகிலுள்ள கடைகள்',
    categories: 'வகைகள்',
    add_to_cart: 'வண்டியில் சேர்',
    view_cart: 'வண்டியைப் பார்',
    checkout: 'பணம் செலுத்து',
    delivery: 'விநியோகம்',
    total: 'மொத்தம்',
    place_order: 'ஆர்டர் செய்',
    search_stores: 'கடைகள், பொருட்களைத் தேடுங்கள்...',
    location_needed: 'இருப்பிட அணுகல் தேவை',
    waiting_location: 'இருப்பிடத்திற்காக காத்திருக்கிறது',
    location_desc: 'அருகிலுள்ள கடைகளைக் காட்ட உங்கள் இருப்பிடம் தேவை.',
    couldnt_load_biz: 'கடைகளை ஏற்ற முடியவில்லை',
    retry: 'மீண்டும் முயற்சி செய்',
    cat_all: 'அனைத்தும்',
    cat_grocery: 'மளிகை',
    cat_food: 'உணவு',
    cat_medical: 'மருந்து',
    cat_milk_water: 'பால்/தண்ணீர்',
    cat_farmer: 'விவசாயி',
    cat_services: 'சேவைகள்',
    
    // Rides
    book_ride: 'சவாரி பதிவு செய்',
    where_to: 'எங்கே செல்ல வேண்டும்?',
    confirm_ride: 'சவாரியை உறுதிப்படுத்து',
    driver: 'ஓட்டுநர்',
    arriving_in: 'வந்தடையும் நேரம்',
    cancel_ride: 'சவாரியை ரத்துசெய்',
    pickup_location: 'ஏறும் இடம்',
    drop_location: 'இறங்கும் இடம்',
    
    // Notes
    total_notes: 'மொத்த குறிப்புகள்',
    pinned: 'பின் செய்யப்பட்டவை',
    locked: 'பூட்டப்பட்டவை',
    archived: 'காப்பகப்படுத்தப்பட்டவை',
    create_note: 'குறிப்பை உருவாக்கு',
    title: 'தலைப்பு',
    content: 'எழுத தொடங்குங்கள்...',
    save: 'சேமி',
    delete: 'அழி',
    edit: 'திருத்து',
    
    // Orders
    active_orders: 'செயலில் உள்ள ஆர்டர்கள்',
    past_orders: 'கடந்த ஆர்டர்கள்',
    order_details: 'ஆர்டர் விவரங்கள்',
    track_order: 'ஆர்டரைத் தடம் காண்',
    status: 'நிலை',
    items: 'பொருட்கள்'
  },
  hi: {
    // Tabs & Profile
    home: 'होम', shop: 'दुकान', rides: 'सवारी', notes: 'नोट्स', profile: 'प्रोफ़ाइल',
    my_orders: 'मेरे आदेश', language_and_voice: 'भाषा और आवाज़', logout: 'लॉग आउट',
    choose_language: 'अपनी पसंदीदा भाषा चुनें', cancel: 'रद्द करें', search_notes: 'अपने नोट्स खोजें...',
    
    // Auth
    welcome_to_goone: 'GoOne में आपका स्वागत है',
    login_to_continue: 'जारी रखने के लिए लॉग इन करें',
    phone_number: 'फ़ोन नंबर',
    password_or_pin: 'पासवर्ड या पिन',
    continue: 'जारी रखें',
    verify_otp: 'OTP सत्यापित करें',
    enter_otp: 'अपने फ़ोन पर भेजा गया 6 अंकों का OTP दर्ज करें',
    verify: 'सत्यापित करें',
    mobile_number: 'मोबाइल नंबर',
    phone_placeholder: '10 अंकों का नंबर दर्ज करें',
    password: 'पासवर्ड',
    password_placeholder: 'अपना पासवर्ड दर्ज करें',
    secure_login: 'सुरक्षित लॉगिन',
    quick_demo_access: 'त्वरित डेमो एक्सेस',
    tap_to_autofill: 'परीक्षण क्रेडेंशियल भरने के लिए टैप करें',
    customer_app: 'ग्राहक ऐप',
    splash_subtagline: 'स्थानीय खरीदारी • सवारी बुक करें • ऑर्डर',
    
    // Home
    welcome_back: 'वापसी पर स्वागत है',
    wallet_balance: 'वॉलेट बैलेंस',
    search_anything: 'कुछ भी खोजें...',
    quick_actions: 'त्वरित कार्रवाई',
    recent_activity: 'हाल की गतिविधि',
    what_would_you_like_to_do: 'आप क्या करना चाहेंगे?',
    shop_local: 'स्थानीय खरीदारी',
    shop_local_desc: 'भोजन, किराना और बहुत कुछ',
    book_a_ride_desc: 'सर्वोत्तम मूल्य पर ऑटो और कार',
    list_view: 'सूची',
    map_view: 'नक्शा',
    mins: 'मिनट',
    
    // Shop
    shops_services: 'दुकानें और सेवाएँ',
    nearby_shops: 'आसपास की दुकानें',
    categories: 'श्रेणियाँ',
    add_to_cart: 'कार्ट में जोड़ें',
    view_cart: 'कार्ट देखें',
    checkout: 'चेकआउट',
    delivery: 'वितरण',
    total: 'कुल',
    place_order: 'आर्डर दें',
    search_stores: 'दुकानें, उत्पाद खोजें...',
    location_needed: 'स्थान पहुंच की आवश्यकता है',
    waiting_location: 'स्थान की प्रतीक्षा की जा रही है',
    location_desc: 'आसपास की दुकानों को दिखाने के लिए हमें आपके स्थान की आवश्यकता है।',
    couldnt_load_biz: 'दुकानें लोड नहीं हो सकीं',
    retry: 'पुनः प्रयास करें',
    cat_all: 'सभी',
    cat_grocery: 'किराना',
    cat_food: 'भोजन',
    cat_medical: 'दवा',
    cat_milk_water: 'दूध/पानी',
    cat_farmer: 'किसान',
    cat_services: 'सेवाएँ',
    
    // Rides
    book_ride: 'सवारी बुक करें',
    where_to: 'कहाँ जाना है?',
    confirm_ride: 'सवारी की पुष्टि करें',
    driver: 'चालक',
    arriving_in: 'पहुंचने में समय',
    cancel_ride: 'सवारी रद्द करें',
    pickup_location: 'पिकअप स्थान',
    drop_location: 'ड्रॉप स्थान',
    
    // Notes
    total_notes: 'कुल नोट्स',
    pinned: 'पिन किए गए',
    locked: 'लॉक किए गए',
    archived: 'संग्रहित',
    create_note: 'नोट बनाएँ',
    title: 'शीर्षक',
    content: 'लिखना शुरू करें...',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    
    // Orders
    active_orders: 'सक्रिय आदेश',
    past_orders: 'पिछले आदेश',
    order_details: 'आदेश विवरण',
    track_order: 'आदेश ट्रैक करें',
    status: 'स्थिति',
    items: 'सामान'
  },
} as const;

export type TranslationKey = keyof typeof DICTIONARY.en;

export function useTranslation() {
  const language = useAuthStore((s) => s.language);
  
  const t = (key: TranslationKey): string => {
    // Fallback to English if language or key is missing
    const dictionary = DICTIONARY[language as keyof typeof DICTIONARY] || DICTIONARY.en;
    return dictionary[key] || DICTIONARY.en[key] || key;
  };
  
  return { t, language };
}
