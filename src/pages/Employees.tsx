
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockEmployees } from '@/utils/employeeData';
import { Employee, Role } from '@/utils/types';
import { useToast } from '@/components/ui/use-toast';
import Sidebar from '@/components/Sidebar';
import { UserPlus, Pencil, Trash2, User, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { states, districts, villages } from '@/utils/locationData';

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    // Load employees from localStorage or use mock data
    const storedEmployees = localStorage.getItem('registeredEmployees');
    const parsedEmployees = storedEmployees ? JSON.parse(storedEmployees) : [];
    return [...mockEmployees, ...parsedEmployees];
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { checkPermission } = useAuth();

  // Available districts for the selected state
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  // Available villages for the selected district
  const [availableVillages, setAvailableVillages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    role: Role;
    state: string;
    district: string;
    village: string;
  }>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'sales',
    state: '',
    district: '',
    village: ''
  });
  
  // Update available districts when state changes
  useEffect(() => {
    if (formData.state) {
      setAvailableDistricts(districts[formData.state] || []);
      setFormData(prev => ({ ...prev, district: '', village: '' }));
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.state]);

  // Update available villages when district changes
  useEffect(() => {
    if (formData.district) {
      setAvailableVillages(villages[formData.district] || []);
      setFormData(prev => ({ ...prev, village: '' }));
    } else {
      setAvailableVillages([]);
    }
  }, [formData.district]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as Role
    }));
  };
  
  const handleStateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      state: value
    }));
  };
  
  const handleDistrictChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      district: value
    }));
  };
  
  const handleVillageChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      village: value
    }));
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'sales',
      state: '',
      district: '',
      village: ''
    });
    setSelectedEmployee(null);
    setShowPassword(false);
  };
  
  const validateForm = () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate phone (10 digits, starting with proper range)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Phone number must be 10 digits and start with 6-9",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const handleAddEmployee = () => {
    if (!validateForm()) return;
    
    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      state: formData.state,
      district: formData.district, 
      village: formData.village,
      dateJoined: new Date()
    };
    
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    
    // Save to localStorage
    const registeredEmployees = localStorage.getItem('registeredEmployees');
    const parsedEmployees = registeredEmployees ? JSON.parse(registeredEmployees) : [];
    localStorage.setItem('registeredEmployees', JSON.stringify([...parsedEmployees, newEmployee]));
    
    setIsAddDialogOpen(false);
    resetForm();
    
    toast({
      title: "Employee added",
      description: `${formData.name} was successfully added as ${formData.role}.`
    });
  };
  
  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      password: employee.password,
      role: employee.role,
      state: employee.state || '',
      district: employee.district || '',
      village: employee.village || ''
    });
    setIsEditDialogOpen(true);
    
    // Update available districts and villages if state/district is present
    if (employee.state) {
      setAvailableDistricts(districts[employee.state] || []);
      
      if (employee.district) {
        setAvailableVillages(villages[employee.district] || []);
      }
    }
  };
  
  const handleUpdateEmployee = () => {
    if (!selectedEmployee || !validateForm()) return;
    
    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        return {
          ...emp,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          state: formData.state,
          district: formData.district,
          village: formData.village
        };
      }
      return emp;
    });
    
    setEmployees(updatedEmployees);
    
    // Update in localStorage
    const registeredEmployees = localStorage.getItem('registeredEmployees');
    if (registeredEmployees) {
      const parsedEmployees = JSON.parse(registeredEmployees);
      const updatedStoredEmployees = parsedEmployees.map((emp: Employee) => {
        if (emp.id === selectedEmployee.id) {
          return {
            ...emp,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: formData.role,
            state: formData.state,
            district: formData.district,
            village: formData.village
          };
        }
        return emp;
      });
      localStorage.setItem('registeredEmployees', JSON.stringify(updatedStoredEmployees));
    }
    
    setIsEditDialogOpen(false);
    resetForm();
    
    toast({
      title: "Employee updated",
      description: `${formData.name}'s information was successfully updated.`
    });
  };
  
  const handleDeleteEmployee = (id: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    
    // Update in localStorage
    const registeredEmployees = localStorage.getItem('registeredEmployees');
    if (registeredEmployees) {
      const parsedEmployees = JSON.parse(registeredEmployees);
      const updatedStoredEmployees = parsedEmployees.filter((emp: Employee) => emp.id !== id);
      localStorage.setItem('registeredEmployees', JSON.stringify(updatedStoredEmployees));
    }
    
    toast({
      title: "Employee removed",
      description: "The employee record has been deleted."
    });
  };
  
  const canCreate = checkPermission('employees', 'create');
  const canEdit = checkPermission('employees', 'edit');
  const canDelete = checkPermission('employees', 'delete');
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Employees</h1>
            {canCreate && (
              <Button 
                className="bg-agri-primary hover:bg-agri-secondary flex gap-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4" /> Add Employee
              </Button>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Employee List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Location</th>
                      <th className="text-left p-2">Date Joined</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id} className="border-b">
                        <td className="p-2 flex items-center gap-2">
                          <div className="bg-muted h-8 w-8 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          {employee.name}
                        </td>
                        <td className="p-2">{employee.email}</td>
                        <td className="p-2">{employee.phone}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            employee.role === 'admin' 
                              ? 'bg-red-100 text-red-700' 
                              : employee.role === 'manager'
                                ? 'bg-blue-100 text-blue-700'
                                : employee.role === 'sales'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-purple-100 text-purple-700'
                          }`}>
                            {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                          </span>
                        </td>
                        <td className="p-2">
                          {employee.state && employee.district ? 
                            `${employee.district}, ${employee.state}` : 
                            "Not specified"}
                        </td>
                        <td className="p-2">
                          {employee.dateJoined instanceof Date 
                            ? format(employee.dateJoined, 'MMM dd, yyyy') 
                            : format(new Date(employee.dateJoined), 'MMM dd, yyyy')}
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(employee)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEmployee(employee.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee account with role-based permissions.
            </DialogDescription>
          </DialogHeader>
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
                <Select value={formData.role} onValueChange={handleRoleChange}>
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
              />
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
                />
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
              <Select value={formData.state} onValueChange={handleStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(states).map(state => (
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
                  onValueChange={handleDistrictChange}
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
                  onValueChange={handleVillageChange}
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
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>Create Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
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
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Reset Password</Label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={formData.password}
                    onChange={handleInputChange}
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
              <Label htmlFor="edit-state">State</Label>
              <Select value={formData.state} onValueChange={handleStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(states).map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-district">District</Label>
                <Select 
                  value={formData.district} 
                  onValueChange={handleDistrictChange}
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
                <Label htmlFor="edit-village">Village</Label>
                <Select 
                  value={formData.village} 
                  onValueChange={handleVillageChange}
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
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee}>Update Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Employees;
