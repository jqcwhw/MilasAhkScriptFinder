import MacroCard, { Macro } from '../MacroCard';

const mockScript: Macro = {
  id: '1',
  name: 'Window Manager',
  description: 'Quickly move and resize windows with keyboard shortcuts. Supports multi-monitor setups.',
  tags: ['productivity', 'windows', 'shortcuts'],
  downloadCount: 5420,
  content: '; Window management script',
  version: 'v2',
  isPersonal: false
};

export default function ScriptCardExample() {
  return (
    <MacroCard 
      macro={mockScript}
      onDownload={(macro) => console.log('Download:', macro.name)}
      onPreview={(macro) => console.log('Preview:', macro.name)}
    />
  );
}