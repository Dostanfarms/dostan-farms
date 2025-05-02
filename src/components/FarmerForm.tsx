
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Farmer } from '@/utils/types';
import { mockFarmers } from '@/utils/mockData';
import { Eye, EyeOff } from 'lucide-react';

interface FarmerFormProps {
  onSubmit: (farmer: Farmer) => void;
  onCancel: () => void;
  editFarmer?: Farmer; // New prop to support editing
}

const FarmerForm: React.FC<FarmerFormProps> = ({ onSubmit, onCancel, editFarmer }) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    email: '',
    password: ''
  });

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
        password: editFarmer.password
      });
    }
  }, [editFarmer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.phone || !formData.accountNumber || !formData.bankName || !formData.email || !formData.password) {
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
      password: formData.password
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
