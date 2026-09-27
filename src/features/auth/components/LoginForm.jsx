import { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { DepartmentPicker } from './DepartmentPicker';

const INITIAL_VALUES = { department: 'HR', email: '', password: '' };

export function LoginForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES);

  const setField = (field) => (value) => setValues((current) => ({ ...current, [field]: value }));
  const handleInput = (field) => (event) => setField(field)(event.target.value);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Card as="form" onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
      <DepartmentPicker value={values.department} onChange={setField('department')} />
      <Input
        label="Work email"
        type="email"
        autoComplete="username"
        placeholder="name.surname@company"
        value={values.email}
        onChange={handleInput('email')}
        required
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Your network password"
        value={values.password}
        onChange={handleInput('password')}
        required
      />
      <Button type="submit" size="lg" fullWidth className="mt-2">
        Sign in
      </Button>
    </Card>
  );
}
