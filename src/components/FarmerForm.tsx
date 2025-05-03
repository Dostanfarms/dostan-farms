
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Farmer } from '@/utils/types';
import { mockFarmers } from '@/utils/mockData';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock location data for dropdowns
const STATES = ["Andhra Pradesh", "Karnataka", "Maharashtra", "Tamil Nadu", "Telangana"];
const DISTRICTS: Record<string, string[]> = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna"],
  "Karnataka": ["Bangalore", "Belgaum", "Bellary", "Mysore", "Shimoga"],
  "Maharashtra": ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tirunelveli"],
  "Telangana": ["Hyderabad", "Karimnagar", "Khammam", "Nizamabad", "Warangal"]
};
const VILLAGES: Record<string, Record<string, string[]>> = {
  "Andhra Pradesh": {
    "Anantapur": ["Kalyandurg", "Dharmavaram", "Kadiri", "Hindupur", "Tadipatri"],
    "Chittoor": ["Tirupati", "Srikalahasti", "Madanapalle", "Punganur", "Piler"]
    // Add more as needed
  },
  "Karnataka": {
    "Bangalore": ["Whitefield", "Electronic City", "Yelahanka", "Kengeri", "Hebbal"],
    "Mysore": ["Chamundi Hills", "Srirangapatna", "T Narasipura", "Nanjangud", "Hunsur"]
    // Add more as needed
  }
  // Add more states and districts as needed
};

interface FarmerFormProps {
  onSubmit: (farmer: Farmer) => void;
  onCancel: () => void;
  editFarmer?: Farmer; // New prop to support editing
}

const FarmerForm: React.FC<FarmerFormProps> = ({ onSubmit, onCancel, editFarmer }) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    email: '',
    password: '',
    profilePhoto: '',
    state: '',
    district: '',
    village: ''
  });
  
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableVillages, setAvailableVillages] = useState<string[]>([]);

  // Populate form when editing an existing farmer
  useEffect(() => {
    if (editFarmer) {
      setFormData({
        name: editFarmer.name,
        phone: editFarmer.phone,
        address: editFarmer.address || '',
        accountNumber: editFarmer.accountNumber,
        bankName: editFarmer.bankName,
        ifscCode: editFarmer.ifscCode || '',
        email: editFarmer.email,
        password: editFarmer.password,
        profilePhoto: editFarmer.profilePhoto || '',
        state: editFarmer.state || '',
        district: editFarmer.district || '',
        village: editFarmer.village || ''
      });
      
      if (editFarmer.profilePhoto) {
        setProfilePhotoPreview(editFarmer.profilePhoto);
      }
      
      // Set available districts and villages if state and district are available
      if (editFarmer.state) {
        const districts = DISTRICTS[editFarmer.state] || [];
        setAvailableDistricts(districts);
        
        if (editFarmer.district && VILLAGES[editFarmer.state]?.[editFarmer.district]) {
          setAvailableVillages(VILLAGES[editFarmer.state][editFarmer.district]);
        }
      }
    }
  }, [editFarmer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update districts when state changes
    if (name === "state") {
      const districts = DISTRICTS[value] || [];
      setAvailableDistricts(districts);
      setFormData(prev => ({ ...prev, district: '', village: '' }));
      setAvailableVillages([]);
    }
    
    // Update villages when district changes
    else if (name === "district") {
      const state = formData.state;
      const villages = VILLAGES[state]?.[value] || [];
      setAvailableVillages(villages);
      setFormData(prev => ({ ...prev, village: '' }));
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePhotoPreview(result);
        setFormData(prev => ({ ...prev, profilePhoto: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.phone || !formData.accountNumber || !formData.bankName || !formData.email || !formData.password || !formData.state) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Create new farmer or update existing one
    const updatedFarmer: Farmer = {
      id: editFarmer ? editFarmer.id : `${mockFarmers.length + 1}`,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      accountNumber: formData.accountNumber,
      bankName: formData.bankName,
      ifscCode: formData.ifscCode,
      dateJoined: editFarmer ? editFarmer.dateJoined : new Date(),
      products: editFarmer ? editFarmer.products : [],
      transactions: editFarmer ? editFarmer.transactions : [],
      email: formData.email,
      password: formData.password,
      profilePhoto: formData.profilePhoto,
      state: formData.state,
      district: formData.district,
      village: formData.village
    };

    onSubmit(updatedFarmer);
    toast({
      title: editFarmer ? "Farmer updated" : "Farmer created",
      description: editFarmer ? "Farmer has been successfully updated." : "New farmer has been successfully added."
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{editFarmer ? "Edit Farmer" : "Add New Farmer"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-2">
                {profilePhotoPreview ? (
                  <AvatarImage src={profilePhotoPreview} alt={formData.name} />
                ) : (
                  <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div className="relative">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="text-xs flex items-center"
                  onClick={() => document.getElementById('profile-photo')?.click()}
                >
                  <Upload className="mr-1 h-3 w-3" /> Upload Photo
                </Button>
                <Input
                  id="profile-photo"
                  name="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Farmer Name *</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Enter farmer name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone" 
                name="phone" 
                placeholder="Enter phone number" 
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                placeholder="Enter email address" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>

            {/* Location fields */}
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select 
                value={formData.state} 
                onValueChange={(value) => handleSelectChange("state", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Select 
                value={formData.district} 
                onValueChange={(value) => handleSelectChange("district", value)}
                disabled={!formData.state}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {availableDistricts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="village">Village</Label>
              <Select 
                value={formData.village} 
                onValueChange={(value) => handleSelectChange("village", value)}
                disabled={!formData.district}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select village" />
                </SelectTrigger>
                <SelectContent>
                  {availableVillages.map(village => (
                    <SelectItem key={village} value={village}>{village}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address" 
                placeholder="Enter address" 
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input 
                id="accountNumber" 
                name="accountNumber" 
                placeholder="Enter account number" 
                value={formData.accountNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input 
                id="bankName" 
                name="bankName" 
                placeholder="Enter bank name" 
                value={formData.bankName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input 
                id="ifscCode" 
                name="ifscCode" 
                placeholder="Enter IFSC code" 
                value={formData.ifscCode}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-agri-primary hover:bg-agri-secondary">{editFarmer ? "Update Farmer" : "Save Farmer"}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FarmerForm;
