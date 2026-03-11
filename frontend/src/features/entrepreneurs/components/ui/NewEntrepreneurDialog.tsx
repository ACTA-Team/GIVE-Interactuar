'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { BUSINESS_TYPES } from '../../types/stages';

export function NewEntrepreneurDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');

  const handleCreate = () => {
    if (!name || !email || !phone || !businessName || !businessType) return;

    // TODO: wire to entrepreneur service
    console.log('Create entrepreneur', {
      name,
      email,
      phone,
      businessName,
      businessType,
    });

    setName('');
    setEmail('');
    setPhone('');
    setBusinessName('');
    setBusinessType('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Empresario
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Empresario</DialogTitle>
          <DialogDescription>
            El empresario comenzará en la Etapa 0 (Registro) automáticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-name">Nombre completo</Label>
            <Input
              id="new-name"
              placeholder="Ej: María García López"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-email">Correo electrónico</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-phone">Teléfono</Label>
            <Input
              id="new-phone"
              placeholder="+57 300 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-business-name">Nombre del negocio</Label>
            <Input
              id="new-business-name"
              placeholder="Ej: Empanadas Doña María"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-business-type">Tipo de negocio</Label>
            <Select
              value={businessType}
              onValueChange={(v: string | null) => setBusinessType(v ?? '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              !name || !email || !phone || !businessName || !businessType
            }
          >
            Registrar Empresario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
