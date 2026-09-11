/**
 * Pincode Verification and City/State Resolution Service
 * Supports live India Post API with instant in-memory caching and
 * a comprehensive offline database for all Indian states and postal zones.
 */

export interface PincodeLookupResult {
  isValid: boolean;
  pincode: string;
  city?: string;
  state?: string;
  district?: string;
  localities?: string[];
  source: 'api' | 'offline' | 'cache';
  error?: string;
}

// In-memory cache for fast repeated lookups
const pincodeCache = new Map<string, PincodeLookupResult>();

// Major exact pincode mapping for prominent logistics hubs and commercial centers
const EXACT_PINCODE_MAP: Record<string, { city: string; state: string; district?: string }> = {
  // Delhi NCR
  '110001': { city: 'New Delhi', state: 'Delhi', district: 'Central Delhi' },
  '110020': { city: 'New Delhi', state: 'Delhi', district: 'South Delhi' },
  '110037': { city: 'New Delhi', state: 'Delhi', district: 'South West Delhi' },
  '110092': { city: 'Delhi', state: 'Delhi', district: 'East Delhi' },
  '122001': { city: 'Gurgaon', state: 'Haryana', district: 'Gurugram' },
  '122002': { city: 'Gurgaon', state: 'Haryana', district: 'Gurugram' },
  '122016': { city: 'Gurgaon', state: 'Haryana', district: 'Gurugram' },
  '121001': { city: 'Faridabad', state: 'Haryana', district: 'Faridabad' },
  '201301': { city: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar' },
  '201305': { city: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar' },
  '201306': { city: 'Greater Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar' },
  '201001': { city: 'Ghaziabad', state: 'Uttar Pradesh', district: 'Ghaziabad' },

  // Maharashtra
  '400001': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai' },
  '400050': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban' },
  '400051': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban' },
  '400053': { city: 'Mumbai (Andheri)', state: 'Maharashtra', district: 'Mumbai Suburban' },
  '400069': { city: 'Mumbai (Andheri E)', state: 'Maharashtra', district: 'Mumbai Suburban' },
  '400072': { city: 'Mumbai (Powai)', state: 'Maharashtra', district: 'Mumbai Suburban' },
  '400703': { city: 'Navi Mumbai', state: 'Maharashtra', district: 'Thane' },
  '400705': { city: 'Navi Mumbai (Vashi)', state: 'Maharashtra', district: 'Thane' },
  '421302': { city: 'Bhiwandi', state: 'Maharashtra', district: 'Thane' },
  '411001': { city: 'Pune', state: 'Maharashtra', district: 'Pune' },
  '411014': { city: 'Pune (Viman Nagar)', state: 'Maharashtra', district: 'Pune' },
  '411057': { city: 'Pune (Hinjawadi)', state: 'Maharashtra', district: 'Pune' },
  '440001': { city: 'Nagpur', state: 'Maharashtra', district: 'Nagpur' },
  '422001': { city: 'Nashik', state: 'Maharashtra', district: 'Nashik' },
  '431001': { city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', district: 'Aurangabad' },

  // Karnataka
  '560001': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  '560034': { city: 'Bengaluru (Koramangala)', state: 'Karnataka', district: 'Bengaluru Urban' },
  '560038': { city: 'Bengaluru (Indiranagar)', state: 'Karnataka', district: 'Bengaluru Urban' },
  '560066': { city: 'Bengaluru (Whitefield)', state: 'Karnataka', district: 'Bengaluru Urban' },
  '560100': { city: 'Bengaluru (Electronic City)', state: 'Karnataka', district: 'Bengaluru Urban' },
  '560103': { city: 'Bengaluru (Bellandur)', state: 'Karnataka', district: 'Bengaluru Urban' },
  '570001': { city: 'Mysuru', state: 'Karnataka', district: 'Mysuru' },
  '575001': { city: 'Mangaluru', state: 'Karnataka', district: 'Dakshina Kannada' },

  // Telangana & Andhra Pradesh
  '500001': { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
  '500003': { city: 'Secunderabad', state: 'Telangana', district: 'Hyderabad' },
  '500032': { city: 'Hyderabad (Gachibowli)', state: 'Telangana', district: 'K.V.Rangareddy' },
  '500081': { city: 'Hyderabad (Hitec City)', state: 'Telangana', district: 'K.V.Rangareddy' },
  '500084': { city: 'Hyderabad (Kondapur)', state: 'Telangana', district: 'K.V.Rangareddy' },
  '520001': { city: 'Vijayawada', state: 'Andhra Pradesh', district: 'NTR' },
  '530001': { city: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam' },
  '517501': { city: 'Tirupati', state: 'Andhra Pradesh', district: 'Tirupati' },

  // Tamil Nadu
  '600001': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
  '600002': { city: 'Chennai (Anna Salai)', state: 'Tamil Nadu', district: 'Chennai' },
  '600096': { city: 'Chennai (OMR)', state: 'Tamil Nadu', district: 'Kanchipuram' },
  '641001': { city: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore' },
  '625001': { city: 'Madurai', state: 'Tamil Nadu', district: 'Madurai' },

  // West Bengal & Eastern India
  '700001': { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata' },
  '700091': { city: 'Kolkata (Salt Lake)', state: 'West Bengal', district: 'North 24 Parganas' },
  '711101': { city: 'Howrah', state: 'West Bengal', district: 'Howrah' },
  '751001': { city: 'Bhubaneswar', state: 'Odisha', district: 'Khorda' },
  '781001': { city: 'Guwahati', state: 'Assam', district: 'Kamrup Metropolitan' },
  '800001': { city: 'Patna', state: 'Bihar', district: 'Patna' },
  '834001': { city: 'Ranchi', state: 'Jharkhand', district: 'Ranchi' },
  '841235': { city: 'Siwan', state: 'Bihar', district: 'Siwan' },

  // Gujarat & Rajasthan
  '380001': { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad' },
  '380015': { city: 'Ahmedabad (Satellite)', state: 'Gujarat', district: 'Ahmedabad' },
  '395001': { city: 'Surat', state: 'Gujarat', district: 'Surat' },
  '390001': { city: 'Vadodara', state: 'Gujarat', district: 'Vadodara' },
  '360001': { city: 'Rajkot', state: 'Gujarat', district: 'Rajkot' },
  '302001': { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur' },
  '342001': { city: 'Jodhpur', state: 'Rajasthan', district: 'Jodhpur' },
  '313001': { city: 'Udaipur', state: 'Rajasthan', district: 'Udaipur' },

  // Madhya Pradesh & Central India
  '462001': { city: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal' },
  '462028': { city: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal' },
  '452001': { city: 'Indore', state: 'Madhya Pradesh', district: 'Indore' },
  '492001': { city: 'Raipur', state: 'Chhattisgarh', district: 'Raipur' },

  // Kerala
  '682001': { city: 'Kochi', state: 'Kerala', district: 'Ernakulam' },
  '695001': { city: 'Thiruvananthapuram', state: 'Kerala', district: 'Thiruvananthapuram' },
  '673001': { city: 'Kozhikode', state: 'Kerala', district: 'Kozhikode' },

  // Punjab, Chandigarh, Haryana, HP, J&K
  '160001': { city: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh' },
  '141001': { city: 'Ludhiana', state: 'Punjab', district: 'Ludhiana' },
  '143001': { city: 'Amritsar', state: 'Punjab', district: 'Amritsar' },
  '171001': { city: 'Shimla', state: 'Himachal Pradesh', district: 'Shimla' },
  '190001': { city: 'Srinagar', state: 'Jammu and Kashmir', district: 'Srinagar' },
  '180001': { city: 'Jammu', state: 'Jammu and Kashmir', district: 'Jammu' },
  '248001': { city: 'Dehradun', state: 'Uttarakhand', district: 'Dehradun' },
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow' },
  '221001': { city: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi' },
  '208001': { city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar' },
  '282001': { city: 'Agra', state: 'Uttar Pradesh', district: 'Agra' },
};

// 3-digit prefix mapping for regional postal sorting hubs
const PREFIX_3_MAP: Record<string, { city: string; state: string; district?: string }> = {
  // Delhi
  '110': { city: 'Delhi', state: 'Delhi', district: 'Delhi' },
  // Haryana
  '121': { city: 'Faridabad', state: 'Haryana', district: 'Faridabad' },
  '122': { city: 'Gurgaon', state: 'Haryana', district: 'Gurugram' },
  '123': { city: 'Rewari', state: 'Haryana', district: 'Rewari' },
  '124': { city: 'Rohtak', state: 'Haryana', district: 'Rohtak' },
  '125': { city: 'Hisar', state: 'Haryana', district: 'Hisar' },
  '131': { city: 'Sonipat', state: 'Haryana', district: 'Sonipat' },
  '132': { city: 'Panipat / Karnal', state: 'Haryana', district: 'Panipat' },
  '133': { city: 'Ambala', state: 'Haryana', district: 'Ambala' },
  '134': { city: 'Panchkula', state: 'Haryana', district: 'Panchkula' },
  // Punjab & Chandigarh
  '141': { city: 'Ludhiana', state: 'Punjab', district: 'Ludhiana' },
  '143': { city: 'Amritsar', state: 'Punjab', district: 'Amritsar' },
  '144': { city: 'Jalandhar', state: 'Punjab', district: 'Jalandhar' },
  '147': { city: 'Patiala', state: 'Punjab', district: 'Patiala' },
  '151': { city: 'Bathinda', state: 'Punjab', district: 'Bathinda' },
  '160': { city: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh' },
  // Himachal Pradesh
  '171': { city: 'Shimla', state: 'Himachal Pradesh', district: 'Shimla' },
  '173': { city: 'Solan', state: 'Himachal Pradesh', district: 'Solan' },
  '176': { city: 'Kangra / Dharamshala', state: 'Himachal Pradesh', district: 'Kangra' },
  // Jammu & Kashmir & Ladakh
  '180': { city: 'Jammu', state: 'Jammu and Kashmir', district: 'Jammu' },
  '190': { city: 'Srinagar', state: 'Jammu and Kashmir', district: 'Srinagar' },
  '194': { city: 'Leh', state: 'Ladakh', district: 'Leh' },
  // Uttar Pradesh & Uttarakhand
  '201': { city: 'Noida / Ghaziabad', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar' },
  '202': { city: 'Aligarh', state: 'Uttar Pradesh', district: 'Aligarh' },
  '203': { city: 'Bulandshahr', state: 'Uttar Pradesh', district: 'Bulandshahr' },
  '208': { city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar' },
  '211': { city: 'Prayagraj', state: 'Uttar Pradesh', district: 'Prayagraj' },
  '221': { city: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi' },
  '224': { city: 'Ayodhya', state: 'Uttar Pradesh', district: 'Ayodhya' },
  '226': { city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow' },
  '243': { city: 'Bareilly', state: 'Uttar Pradesh', district: 'Bareilly' },
  '244': { city: 'Moradabad', state: 'Uttar Pradesh', district: 'Moradabad' },
  '248': { city: 'Dehradun', state: 'Uttarakhand', district: 'Dehradun' },
  '249': { city: 'Haridwar / Rishikesh', state: 'Uttarakhand', district: 'Haridwar' },
  '250': { city: 'Meerut', state: 'Uttar Pradesh', district: 'Meerut' },
  '263': { city: 'Nainital / Haldwani', state: 'Uttarakhand', district: 'Nainital' },
  '273': { city: 'Gorakhpur', state: 'Uttar Pradesh', district: 'Gorakhpur' },
  '281': { city: 'Mathura', state: 'Uttar Pradesh', district: 'Mathura' },
  '282': { city: 'Agra', state: 'Uttar Pradesh', district: 'Agra' },
  '284': { city: 'Jhansi', state: 'Uttar Pradesh', district: 'Jhansi' },
  // Rajasthan
  '301': { city: 'Alwar', state: 'Rajasthan', district: 'Alwar' },
  '302': { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur' },
  '305': { city: 'Ajmer', state: 'Rajasthan', district: 'Ajmer' },
  '313': { city: 'Udaipur', state: 'Rajasthan', district: 'Udaipur' },
  '324': { city: 'Kota', state: 'Rajasthan', district: 'Kota' },
  '334': { city: 'Bikaner', state: 'Rajasthan', district: 'Bikaner' },
  '342': { city: 'Jodhpur', state: 'Rajasthan', district: 'Jodhpur' },
  // Gujarat & Daman
  '360': { city: 'Rajkot', state: 'Gujarat', district: 'Rajkot' },
  '361': { city: 'Jamnagar', state: 'Gujarat', district: 'Jamnagar' },
  '370': { city: 'Bhuj / Kutch', state: 'Gujarat', district: 'Kutch' },
  '380': { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad' },
  '382': { city: 'Gandhinagar', state: 'Gujarat', district: 'Gandhinagar' },
  '390': { city: 'Vadodara', state: 'Gujarat', district: 'Vadodara' },
  '395': { city: 'Surat', state: 'Gujarat', district: 'Surat' },
  '396': { city: 'Vapi / Valsad / Daman', state: 'Gujarat', district: 'Valsad' },
  // Maharashtra & Goa
  '400': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai' },
  '401': { city: 'Thane / Palghar', state: 'Maharashtra', district: 'Palghar' },
  '403': { city: 'Panaji / Goa', state: 'Goa', district: 'North Goa' },
  '411': { city: 'Pune', state: 'Maharashtra', district: 'Pune' },
  '413': { city: 'Solapur', state: 'Maharashtra', district: 'Solapur' },
  '414': { city: 'Ahmednagar', state: 'Maharashtra', district: 'Ahmednagar' },
  '416': { city: 'Kolhapur', state: 'Maharashtra', district: 'Kolhapur' },
  '421': { city: 'Bhiwandi / Thane', state: 'Maharashtra', district: 'Thane' },
  '422': { city: 'Nashik', state: 'Maharashtra', district: 'Nashik' },
  '424': { city: 'Dhule', state: 'Maharashtra', district: 'Dhule' },
  '431': { city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', district: 'Aurangabad' },
  '440': { city: 'Nagpur', state: 'Maharashtra', district: 'Nagpur' },
  '444': { city: 'Akola / Amravati', state: 'Maharashtra', district: 'Amravati' },
  // Madhya Pradesh & Chhattisgarh
  '452': { city: 'Indore', state: 'Madhya Pradesh', district: 'Indore' },
  '456': { city: 'Ujjain', state: 'Madhya Pradesh', district: 'Ujjain' },
  '462': { city: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal' },
  '474': { city: 'Gwalior', state: 'Madhya Pradesh', district: 'Gwalior' },
  '482': { city: 'Jabalpur', state: 'Madhya Pradesh', district: 'Jabalpur' },
  '490': { city: 'Bhilai / Durg', state: 'Chhattisgarh', district: 'Durg' },
  '492': { city: 'Raipur', state: 'Chhattisgarh', district: 'Raipur' },
  '495': { city: 'Bilaspur', state: 'Chhattisgarh', district: 'Bilaspur' },
  // Telangana & Andhra Pradesh
  '500': { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
  '506': { city: 'Warangal', state: 'Telangana', district: 'Warangal' },
  '517': { city: 'Tirupati', state: 'Andhra Pradesh', district: 'Tirupati' },
  '518': { city: 'Kurnool', state: 'Andhra Pradesh', district: 'Kurnool' },
  '520': { city: 'Vijayawada', state: 'Andhra Pradesh', district: 'NTR' },
  '522': { city: 'Guntur', state: 'Andhra Pradesh', district: 'Guntur' },
  '530': { city: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam' },
  '533': { city: 'Kakinada / Rajahmundry', state: 'Andhra Pradesh', district: 'East Godavari' },
  // Karnataka
  '560': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  '562': { city: 'Bengaluru Rural', state: 'Karnataka', district: 'Bengaluru Rural' },
  '570': { city: 'Mysuru', state: 'Karnataka', district: 'Mysuru' },
  '575': { city: 'Mangaluru', state: 'Karnataka', district: 'Dakshina Kannada' },
  '577': { city: 'Shimoga / Davanagere', state: 'Karnataka', district: 'Shimoga' },
  '580': { city: 'Hubli-Dharwad', state: 'Karnataka', district: 'Dharwad' },
  '585': { city: 'Kalaburagi', state: 'Karnataka', district: 'Kalaburagi' },
  '590': { city: 'Belagavi', state: 'Karnataka', district: 'Belagavi' },
  // Tamil Nadu & Puducherry
  '600': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
  '605': { city: 'Puducherry', state: 'Puducherry', district: 'Pondicherry' },
  '620': { city: 'Tiruchirappalli', state: 'Tamil Nadu', district: 'Tiruchirappalli' },
  '625': { city: 'Madurai', state: 'Tamil Nadu', district: 'Madurai' },
  '627': { city: 'Tirunelveli', state: 'Tamil Nadu', district: 'Tirunelveli' },
  '636': { city: 'Salem', state: 'Tamil Nadu', district: 'Salem' },
  '641': { city: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore' },
  '642': { city: 'Pollachi', state: 'Tamil Nadu', district: 'Coimbatore' },
  // Kerala & Lakshadweep
  '670': { city: 'Kannur', state: 'Kerala', district: 'Kannur' },
  '673': { city: 'Kozhikode', state: 'Kerala', district: 'Kozhikode' },
  '680': { city: 'Thrissur', state: 'Kerala', district: 'Thrissur' },
  '682': { city: 'Kochi / Ernakulam', state: 'Kerala', district: 'Ernakulam' },
  '686': { city: 'Kottayam', state: 'Kerala', district: 'Kottayam' },
  '691': { city: 'Kollam', state: 'Kerala', district: 'Kollam' },
  '695': { city: 'Thiruvananthapuram', state: 'Kerala', district: 'Thiruvananthapuram' },
  // West Bengal & North East
  '700': { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata' },
  '711': { city: 'Howrah', state: 'West Bengal', district: 'Howrah' },
  '713': { city: 'Durgapur / Asansol', state: 'West Bengal', district: 'Paschim Bardhaman' },
  '721': { city: 'Midnapore / Kharagpur', state: 'West Bengal', district: 'Paschim Medinipur' },
  '734': { city: 'Siliguri / Darjeeling', state: 'West Bengal', district: 'Darjeeling' },
  '737': { city: 'Gangtok', state: 'Sikkim', district: 'East Sikkim' },
  '751': { city: 'Bhubaneswar', state: 'Odisha', district: 'Khorda' },
  '753': { city: 'Cuttack', state: 'Odisha', district: 'Cuttack' },
  '769': { city: 'Rourkela', state: 'Odisha', district: 'Sundargarh' },
  '781': { city: 'Guwahati', state: 'Assam', district: 'Kamrup Metropolitan' },
  '786': { city: 'Dibrugarh', state: 'Assam', district: 'Dibrugarh' },
  '791': { city: 'Itanagar', state: 'Arunachal Pradesh', district: 'Papum Pare' },
  '793': { city: 'Shillong', state: 'Meghalaya', district: 'East Khasi Hills' },
  '795': { city: 'Imphal', state: 'Manipur', district: 'Imphal West' },
  '796': { city: 'Aizawl', state: 'Mizoram', district: 'Aizawl' },
  '797': { city: 'Kohima / Dimapur', state: 'Nagaland', district: 'Kohima' },
  '799': { city: 'Agartala', state: 'Tripura', district: 'West Tripura' },
  // Bihar & Jharkhand
  '800': { city: 'Patna', state: 'Bihar', district: 'Patna' },
  '812': { city: 'Bhagalpur', state: 'Bihar', district: 'Bhagalpur' },
  '814': { city: 'Deoghar', state: 'Jharkhand', district: 'Deoghar' },
  '826': { city: 'Dhanbad', state: 'Jharkhand', district: 'Dhanbad' },
  '827': { city: 'Bokaro', state: 'Jharkhand', district: 'Bokaro' },
  '831': { city: 'Jamshedpur', state: 'Jharkhand', district: 'East Singhbhum' },
  '834': { city: 'Ranchi', state: 'Jharkhand', district: 'Ranchi' },
  '841': { city: 'Siwan / Chapra', state: 'Bihar', district: 'Siwan' },
  '842': { city: 'Muzaffarpur', state: 'Bihar', district: 'Muzaffarpur' },
  '846': { city: 'Darbhanga', state: 'Bihar', district: 'Darbhanga' },
  '854': { city: 'Purnia', state: 'Bihar', district: 'Purnia' },
};

// 2-digit fallback circle mapping covering the entire postal circle of India
const PREFIX_2_STATE_MAP: Record<string, { state: string; defaultCity: string }> = {
  '11': { state: 'Delhi', defaultCity: 'Delhi' },
  '12': { state: 'Haryana', defaultCity: 'Gurgaon / Faridabad' },
  '13': { state: 'Haryana', defaultCity: 'Ambala / Panipat' },
  '14': { state: 'Punjab', defaultCity: 'Ludhiana / Jalandhar' },
  '15': { state: 'Punjab', defaultCity: 'Bathinda / Firozpur' },
  '16': { state: 'Chandigarh', defaultCity: 'Chandigarh' },
  '17': { state: 'Himachal Pradesh', defaultCity: 'Shimla' },
  '18': { state: 'Jammu and Kashmir', defaultCity: 'Jammu' },
  '19': { state: 'Jammu and Kashmir', defaultCity: 'Srinagar' },
  '20': { state: 'Uttar Pradesh', defaultCity: 'Noida / Ghaziabad' },
  '21': { state: 'Uttar Pradesh', defaultCity: 'Prayagraj' },
  '22': { state: 'Uttar Pradesh', defaultCity: 'Lucknow / Varanasi' },
  '23': { state: 'Uttar Pradesh', defaultCity: 'Mirzapur' },
  '24': { state: 'Uttar Pradesh', defaultCity: 'Bareilly / Dehradun' },
  '25': { state: 'Uttar Pradesh', defaultCity: 'Meerut' },
  '26': { state: 'Uttarakhand', defaultCity: 'Haldwani / Nainital' },
  '27': { state: 'Uttar Pradesh', defaultCity: 'Gorakhpur' },
  '28': { state: 'Uttar Pradesh', defaultCity: 'Agra / Mathura' },
  '30': { state: 'Rajasthan', defaultCity: 'Jaipur' },
  '31': { state: 'Rajasthan', defaultCity: 'Udaipur / Kota' },
  '32': { state: 'Rajasthan', defaultCity: 'Kota' },
  '33': { state: 'Rajasthan', defaultCity: 'Bikaner' },
  '34': { state: 'Rajasthan', defaultCity: 'Jodhpur' },
  '36': { state: 'Gujarat', defaultCity: 'Rajkot' },
  '37': { state: 'Gujarat', defaultCity: 'Kutch / Bhuj' },
  '38': { state: 'Gujarat', defaultCity: 'Ahmedabad' },
  '39': { state: 'Gujarat', defaultCity: 'Surat / Vadodara' },
  '40': { state: 'Maharashtra', defaultCity: 'Mumbai' },
  '41': { state: 'Maharashtra', defaultCity: 'Pune' },
  '42': { state: 'Maharashtra', defaultCity: 'Bhiwandi / Nashik' },
  '43': { state: 'Maharashtra', defaultCity: 'Chhatrapati Sambhajinagar' },
  '44': { state: 'Maharashtra', defaultCity: 'Nagpur' },
  '45': { state: 'Madhya Pradesh', defaultCity: 'Indore' },
  '46': { state: 'Madhya Pradesh', defaultCity: 'Bhopal' },
  '47': { state: 'Madhya Pradesh', defaultCity: 'Gwalior' },
  '48': { state: 'Madhya Pradesh', defaultCity: 'Jabalpur' },
  '49': { state: 'Chhattisgarh', defaultCity: 'Raipur' },
  '50': { state: 'Telangana', defaultCity: 'Hyderabad' },
  '51': { state: 'Andhra Pradesh', defaultCity: 'Tirupati / Kurnool' },
  '52': { state: 'Andhra Pradesh', defaultCity: 'Vijayawada / Guntur' },
  '53': { state: 'Andhra Pradesh', defaultCity: 'Visakhapatnam' },
  '56': { state: 'Karnataka', defaultCity: 'Bengaluru' },
  '57': { state: 'Karnataka', defaultCity: 'Mangaluru / Mysuru' },
  '58': { state: 'Karnataka', defaultCity: 'Hubballi / Kalaburagi' },
  '59': { state: 'Karnataka', defaultCity: 'Belagavi' },
  '60': { state: 'Tamil Nadu', defaultCity: 'Chennai' },
  '61': { state: 'Tamil Nadu', defaultCity: 'Thanjavur' },
  '62': { state: 'Tamil Nadu', defaultCity: 'Madurai' },
  '63': { state: 'Tamil Nadu', defaultCity: 'Salem / Vellore' },
  '64': { state: 'Tamil Nadu', defaultCity: 'Coimbatore' },
  '67': { state: 'Kerala', defaultCity: 'Kozhikode / Kannur' },
  '68': { state: 'Kerala', defaultCity: 'Kochi / Thrissur' },
  '69': { state: 'Kerala', defaultCity: 'Thiruvananthapuram' },
  '70': { state: 'West Bengal', defaultCity: 'Kolkata' },
  '71': { state: 'West Bengal', defaultCity: 'Howrah / Asansol' },
  '72': { state: 'West Bengal', defaultCity: 'Kharagpur' },
  '73': { state: 'West Bengal', defaultCity: 'Siliguri' },
  '74': { state: 'West Bengal', defaultCity: 'North 24 Parganas' },
  '75': { state: 'Odisha', defaultCity: 'Bhubaneswar' },
  '76': { state: 'Odisha', defaultCity: 'Berhampur / Rourkela' },
  '77': { state: 'Odisha', defaultCity: 'Sambalpur' },
  '78': { state: 'Assam', defaultCity: 'Guwahati' },
  '79': { state: 'Meghalaya', defaultCity: 'Shillong / North East' },
  '80': { state: 'Bihar', defaultCity: 'Patna' },
  '81': { state: 'Bihar', defaultCity: 'Bhagalpur / Deoghar' },
  '82': { state: 'Jharkhand', defaultCity: 'Dhanbad / Bokaro' },
  '83': { state: 'Jharkhand', defaultCity: 'Ranchi / Jamshedpur' },
  '84': { state: 'Bihar', defaultCity: 'Muzaffarpur / Siwan' },
  '85': { state: 'Bihar', defaultCity: 'Purnia / Katihar' },
};

/**
 * Checks format of an Indian 6-digit PIN code.
 * Valid Indian PIN codes are exactly 6 digits, starting with 1 to 9.
 */
export function isValidPincodeFormat(pincode: string): boolean {
  return /^[1-9]\d{5}$/.test(pincode.trim());
}

/**
 * Resolves postal details from local offline tables.
 */
export function getOfflinePincodeDetails(pincode: string): PincodeLookupResult {
  const clean = pincode.trim();
  if (!isValidPincodeFormat(clean)) {
    return {
      isValid: false,
      pincode: clean,
      source: 'offline',
      error: 'Pincode must be a 6-digit number starting with 1-9',
    };
  }

  // 1. Exact match
  if (EXACT_PINCODE_MAP[clean]) {
    const item = EXACT_PINCODE_MAP[clean];
    return {
      isValid: true,
      pincode: clean,
      city: item.city,
      state: item.state,
      district: item.district || item.city,
      source: 'offline',
    };
  }

  // 2. 3-digit prefix match
  const p3 = clean.slice(0, 3);
  if (PREFIX_3_MAP[p3]) {
    const item = PREFIX_3_MAP[p3];
    return {
      isValid: true,
      pincode: clean,
      city: item.city,
      state: item.state,
      district: item.district || item.city,
      source: 'offline',
    };
  }

  // 3. 2-digit circle fallback
  const p2 = clean.slice(0, 2);
  if (PREFIX_2_STATE_MAP[p2]) {
    const item = PREFIX_2_STATE_MAP[p2];
    return {
      isValid: true,
      pincode: clean,
      city: item.defaultCity,
      state: item.state,
      district: item.defaultCity,
      source: 'offline',
    };
  }

  // 4. Unknown pincode region
  return {
    isValid: false,
    pincode: clean,
    source: 'offline',
    error: 'Unrecognized PIN code circle',
  };
}

/**
 * Verifies a 6-digit pincode and auto-fills City and State.
 * Tries online India Post API first with timeout, falling back seamlessly to the offline database.
 */
export async function verifyPincode(pincode: string): Promise<PincodeLookupResult> {
  const clean = (pincode || '').replace(/\D/g, '').trim();

  // Basic validation check
  if (!isValidPincodeFormat(clean)) {
    return {
      isValid: false,
      pincode: clean,
      source: 'offline',
      error: clean.length === 6 ? 'Indian pincodes cannot start with 0' : 'Please enter a 6-digit PIN code',
    };
  }

  // Check in-memory cache
  if (pincodeCache.has(clean)) {
    return { ...pincodeCache.get(clean)!, source: 'cache' };
  }

  // 1. Instant match against exact major hub dictionary (0ms)
  if (EXACT_PINCODE_MAP[clean]) {
    const item = EXACT_PINCODE_MAP[clean];
    const exactResult: PincodeLookupResult = {
      isValid: true,
      pincode: clean,
      city: item.city,
      state: item.state,
      district: item.district || item.city,
      source: 'offline',
    };
    pincodeCache.set(clean, exactResult);
    return exactResult;
  }

  // 2. Instant match against 3-digit regional sorting hub dictionary (0ms)
  const p3 = clean.slice(0, 3);
  if (PREFIX_3_MAP[p3]) {
    const item = PREFIX_3_MAP[p3];
    const prefixResult: PincodeLookupResult = {
      isValid: true,
      pincode: clean,
      city: item.city,
      state: item.state,
      district: item.district || item.city,
      source: 'offline',
    };
    pincodeCache.set(clean, prefixResult);
    return prefixResult;
  }

  // 3. Fallback to 2-digit circle state map (0ms)
  const p2 = clean.slice(0, 2);
  if (PREFIX_2_STATE_MAP[p2]) {
    const item = PREFIX_2_STATE_MAP[p2];
    const circleResult: PincodeLookupResult = {
      isValid: true,
      pincode: clean,
      city: item.defaultCity,
      state: item.state,
      district: item.defaultCity,
      source: 'offline',
    };
    pincodeCache.set(clean, circleResult);
    return circleResult;
  }

  // 4. Try live online India Post API for unmapped or newer PIN codes
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800); // 1.8s timeout

    const response = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        if (item.Status === 'Success' && Array.isArray(item.PostOffice) && item.PostOffice.length > 0) {
          const firstOffice = item.PostOffice[0];
          const rawDistrict = firstOffice.District || firstOffice.Block || firstOffice.Division || '';
          const rawState = firstOffice.State || '';

          const localities = Array.from(
            new Set<string>(item.PostOffice.map((po: { Name: string }) => po.Name).filter(Boolean))
          ).slice(0, 5);

          const result: PincodeLookupResult = {
            isValid: true,
            pincode: clean,
            city: rawDistrict || firstOffice.Name,
            state: rawState,
            district: rawDistrict,
            localities,
            source: 'api',
          };

          pincodeCache.set(clean, result);
          return result;
        }
      }
    }
  } catch {
    // Network failure or timeout
  }

  return {
    isValid: false,
    pincode: clean,
    source: 'offline',
    error: 'Unrecognized PIN code circle',
  };
}
