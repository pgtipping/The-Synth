'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface SystemInstruction {
  id: string;
  name: string;
  content: string;
}

interface ScratchpadProps {
  onContentChange: (content: string) => void;
  onToggleAI: (enabled: boolean) => void;
  onSystemInstructionChange: (instruction: string) => void;
}

export default function Scratchpad({
  onContentChange,
  onToggleAI,
  onSystemInstructionChange,
}: ScratchpadProps) {
  const [content, setContent] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [systemInstructions, setSystemInstructions] = useState<
    SystemInstruction[]
  >([]);
  const [activeInstruction, setActiveInstruction] = useState<string | null>(
    null
  );
  const [newInstruction, setNewInstruction] = useState({
    name: '',
    content: '',
  });

  // Load saved instructions from localStorage
  useEffect(() => {
    const savedInstructions = localStorage.getItem('systemInstructions');
    if (savedInstructions) {
      setSystemInstructions(JSON.parse(savedInstructions));
    }
  }, []);

  // Save instructions to localStorage
  useEffect(() => {
    localStorage.setItem(
      'systemInstructions',
      JSON.stringify(systemInstructions)
    );
  }, [systemInstructions]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange(newContent);
  };

  const handleToggleAI = () => {
    const newAiState = !aiEnabled;
    setAiEnabled(newAiState);
    onToggleAI(newAiState);
  };

  const handleAddInstruction = () => {
    if (newInstruction.name && newInstruction.content) {
      const instruction = {
        id: crypto.randomUUID(),
        ...newInstruction,
      };
      setSystemInstructions([...systemInstructions, instruction]);
      setNewInstruction({ name: '', content: '' });
    }
  };

  const handleSelectInstruction = (id: string) => {
    const instruction = systemInstructions.find((i) => i.id === id);
    if (instruction) {
      setActiveInstruction(id);
      onSystemInstructionChange(instruction.content);
    }
  };

  return (
    <div className="scratchpad-container">
      <div className="scratchpad-header">
        <h3 className="text-lg font-semibold">Scratchpad</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor="ai-toggle">AI Assistance</Label>
          <Switch
            id="ai-toggle"
            checked={aiEnabled}
            onCheckedChange={handleToggleAI}
          />
        </div>
      </div>

      {/* System Instructions Section */}
      <div className="system-instructions">
        <h4 className="mb-2 text-sm font-medium">System Instructions</h4>
        <div className="grid gap-2">
          <Input
            placeholder="Instruction Name"
            value={newInstruction.name}
            onChange={(e) =>
              setNewInstruction({ ...newInstruction, name: e.target.value })
            }
          />
          <Textarea
            placeholder="Instruction Content"
            value={newInstruction.content}
            onChange={(e) =>
              setNewInstruction({ ...newInstruction, content: e.target.value })
            }
            rows={2}
          />
          <Button
            onClick={handleAddInstruction}
            disabled={!newInstruction.name || !newInstruction.content}
          >
            Add Instruction
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {systemInstructions.map((instruction) => (
            <div
              key={instruction.id}
              className={`cursor-pointer rounded p-2 ${
                activeInstruction === instruction.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/50'
              }`}
              onClick={() => handleSelectInstruction(instruction.id)}
            >
              <p className="text-sm font-medium">{instruction.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <Textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing your ideas..."
        className="mt-4"
        rows={6}
      />

      <style jsx>{`
        .scratchpad-container {
          border: 1px solid hsl(var(--border));
          border-radius: calc(var(--radius) - 2px);
          padding: 1rem;
          background-color: hsl(var(--background));
        }

        .scratchpad-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .system-instructions {
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-radius: calc(var(--radius) - 2px);
          background-color: hsl(var(--muted));
        }
      `}</style>
    </div>
  );
}
