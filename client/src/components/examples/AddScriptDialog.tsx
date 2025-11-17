import AddMacroDialog from '../AddMacroDialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AddScriptDialogExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <AddMacroDialog 
        open={open}
        onOpenChange={setOpen}
        onSave={(macro) => console.log('Save macro:', macro)}
      />
    </div>
  );
}