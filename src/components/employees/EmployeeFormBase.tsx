
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { Role } from '@/utils/types';
import { states, districts, villages } from '@/utils/locationData';

export interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  state: string;
  district: string;
  village: string;
}

interface EmployeeFormBaseProps {
  formData: EmployeeFormData;
  onChange: (data: Partial<EmployeeFormData>) => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
}

const EmployeeFormBase: React.FC<EmployeeFormBaseProps> = ({
  formData,
  onChange,
  showPassword,
  togglePasswordVisibility
}) => {
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableVillages, setAvailableVillages] = useState<string[]>([]);
  const [statesList] = useState<string[]>(Object.keys(states));
  
  useEffect(() => {
    if (formData.state) {
      setAvailableDistricts(districts[formData.state] || []);
      if (!districts[formData.state]?.includes(formData.district)) {
        onChange({ district: '', village: '' });
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.state]);

  useEffect(() => {
    if (formData.district) {
      setAvailableVillages(villages[formData.district] || []);
      if (!villages[formData.district]?.includes(formData.village)) {
        onChange({ village: '' });
      }
    } else {
      setAvailableVillages([]);
    }
  }, [formData.district]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  // Email validation function
  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Phone validation function (Indian mobile format)
  const validatePhone = (phone: string) => {
    const re = /^[6-9]\d{9}$/;
    return re.test(String(phone));
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => onChange({ role: value as Role })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="accountant">Accountant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleInputChange}
          required
          className={formData.email && !validateEmail(formData.email) ? "border-red-500" : ""}
        />
        {formData.email && !validateEmail(formData.email) && 
          <p className="text-xs text-red-500">Please enter a valid email address</p>
        }
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className={formData.phone && !validatePhone(formData.phone) ? "border-red-500" : ""}
          />
          {formData.phone && !validatePhone(formData.phone) && 
            <p className="text-xs text-red-500">Please enter a valid 10-digit mobile number</p>
          }
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Set password"
              value={formData.password}
              onChange={handleInputChange}
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="state">State</Label>
        <Select 
          value={formData.state} 
          onValueChange={(value) => onChange({ state: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {statesList.map(state => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Select 
            value={formData.district} 
            onValueChange={(value) => onChange({ district: value })}
            disabled={!formData.state}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
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
            onValueChange={(value) => onChange({ village: value })}
            disabled={!formData.district}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select village" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {availableVillages.map(village => (
                <SelectItem key={village} value={village}>{village}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFormBase;
