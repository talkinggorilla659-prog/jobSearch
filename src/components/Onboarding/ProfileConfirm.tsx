import { useState } from 'react';
import { Button, Input, Textarea, Card, CardContent } from '../UI';
import { ExtractedProfile } from '../../types';

interface ProfileConfirmProps {
  profile: ExtractedProfile;
  onConfirm: (profile: ExtractedProfile) => void;
  onBack: () => void;
}

export function ProfileConfirm({ profile: initialProfile, onConfirm, onBack }: ProfileConfirmProps) {
  const [profile, setProfile] = useState<ExtractedProfile>(initialProfile);
  const [skillInput, setSkillInput] = useState('');

  const updateField = <K extends keyof ExtractedProfile>(
    field: K,
    value: ExtractedProfile[K]
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !profile.skills.includes(skill)) {
      updateField('skills', [...profile.skills, skill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateField(
      'skills',
      profile.skills.filter((s) => s !== skillToRemove)
    );
  };

  const handleSubmit = () => {
    onConfirm(profile);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Confirm Your Profile
        </h2>
        <p className="text-gray-600">
          We extracted this information from your resume. Please verify and edit if needed.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="space-y-4">
          <Input
            label="Full Name"
            value={profile.name}
            onChange={(e) => updateField('name', e.target.value)}
          />

          <Input
            label="Current/Recent Job Title"
            value={profile.currentTitle}
            onChange={(e) => updateField('currentTitle', e.target.value)}
          />

          <Input
            label="Years of Experience"
            type="number"
            min={0}
            max={50}
            value={profile.yearsExperience}
            onChange={(e) => updateField('yearsExperience', parseInt(e.target.value) || 0)}
          />

          <Input
            label="Education"
            value={profile.education}
            onChange={(e) => updateField('education', e.target.value)}
            placeholder="e.g., B.S. Computer Science, MIT"
          />

          <Textarea
            label="Work History Summary"
            value={profile.workHistory}
            onChange={(e) => updateField('workHistory', e.target.value)}
            rows={3}
            placeholder="Brief summary of your career progression..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="p-0.5 hover:bg-blue-200 rounded-full"
                    aria-label={`Remove ${skill}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button variant="secondary" onClick={addSkill}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Save Profile
        </Button>
      </div>
    </div>
  );
}
